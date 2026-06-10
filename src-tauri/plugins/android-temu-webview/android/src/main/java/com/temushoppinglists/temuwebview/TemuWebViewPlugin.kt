package com.temushoppinglists.temuwebview

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest

private const val TAG = "TemuWebView"
private const val TEXT_ZOOM_MIN = 50
private const val TEXT_ZOOM_MAX = 200
private const val TEXT_ZOOM_DEFAULT = 100
private const val MAX_WARM_HOSTS = 3
private const val TEMU_HOME_URL = "https://www.temu.com/"
private const val WEBKIT_PROFILE_PREFIX = "temu_"

@InvokeArg
class OpenSessionArgs {
    var sessionId: String = ""
    var url: String = TEMU_HOME_URL
    var name: String = ""
    var darkMode: Boolean = false
    var textZoom: Int = TEXT_ZOOM_DEFAULT
}

@InvokeArg
class SessionArgs {
    var sessionId: String = ""
}

@InvokeArg
class DarkModeArgs {
    var enabled: Boolean = false
}

@InvokeArg
class TextZoomArgs {
    var level: Int = TEXT_ZOOM_DEFAULT
}

@InvokeArg
class SessionsArgs {
    var sessionsJson: String = "[]"
    var activeSessionId: String = ""
}

private data class SessionItem(
    val id: String,
    val name: String,
)

private data class SessionHost(
    val id: String,
    var name: String,
    val root: FrameLayout,
    val webView: WebView,
    var bottomBar: LinearLayout,
    var currentUrl: String,
    var lastUsedAt: Long,
    var isVisible: Boolean = false,
)

@TauriPlugin
class TemuWebViewPlugin(private val activity: Activity) : Plugin(activity) {
    private var mainWebView: WebView? = null
    private var activeSessionId: String? = null
    private var isDarkMode = false
    private var textZoomLevel = TEXT_ZOOM_DEFAULT
    private var multiProfileModeEnabled = false
    private var disableMultiProfileMode = false
    private val sessionHosts = linkedMapOf<String, SessionHost>()
    private val sessionItems = linkedMapOf<String, SessionItem>()

    override fun load(webView: WebView) {
        mainWebView = webView
        multiProfileModeEnabled = WebViewFeature.isFeatureSupported(WebViewFeature.MULTI_PROFILE)
        Log.i(TAG, "Temu WebView plugin loaded; multiProfile=$multiProfileModeEnabled")
    }

    @Command
    fun openSession(invoke: Invoke) {
        val args = invoke.parseArgs(OpenSessionArgs::class.java)
        val sessionId = args.sessionId.trim()
        if (sessionId.isBlank()) {
            invoke.reject("sessionId is required")
            return
        }

        val url = safeTemuUrl(args.url)
        if (url == null) {
            invoke.reject("Only safe Temu HTTPS URLs can be opened")
            return
        }

        activity.runOnUiThread {
            isDarkMode = args.darkMode
            textZoomLevel = normalizeTextZoom(args.textZoom)
            val name = args.name.trim().ifBlank { "Shopping" }
            sessionItems[sessionId] = SessionItem(sessionId, name)

            val host = sessionHosts[sessionId] ?: createHost(sessionId, name, url)
            host.name = name
            host.currentUrl = url
            showHost(host)
            if (host.webView.url != url) {
                host.webView.loadUrl(url)
            }
            applyHostPreferences(host)
            dispatchToVue(
                "temu-webview-session-opened",
                JSONObject()
                    .put("sessionId", sessionId)
                    .put("url", url)
                    .put("degraded", isProfileDegraded())
            )
            enforceWarmHostBound()
            invoke.resolve(JSObject())
        }
    }

    @Command
    fun hideWebView(invoke: Invoke) {
        activity.runOnUiThread {
            hideActiveHost()
            invoke.resolve(JSObject())
        }
    }

    @Command
    fun closeSession(invoke: Invoke) {
        val args = invoke.parseArgs(SessionArgs::class.java)
        val sessionId = args.sessionId.trim()
        if (sessionId.isBlank()) {
            invoke.reject("sessionId is required")
            return
        }

        activity.runOnUiThread {
            destroyHost(sessionId)
            sessionItems.remove(sessionId)
            if (activeSessionId == sessionId) {
                activeSessionId = null
            }
            dispatchToVue(
                "temu-webview-session-closed",
                JSONObject().put("sessionId", sessionId)
            )
            invoke.resolve(JSObject())
        }
    }

    @Command
    fun captureCurrentUrl(invoke: Invoke) {
        activity.runOnUiThread {
            val host = activeHost()
            val result = JSObject()
            result.put("url", host?.currentUrl ?: host?.webView?.url)
            result.put("sessionId", host?.id)
            result.put("available", host != null)
            result.put("degraded", isProfileDegraded())
            if (host == null) {
                result.put("error", "No active Temu WebView session")
            }
            invoke.resolve(result)
        }
    }

    @Command
    fun setDarkMode(invoke: Invoke) {
        val args = invoke.parseArgs(DarkModeArgs::class.java)
        activity.runOnUiThread {
            isDarkMode = args.enabled
            sessionHosts.values.forEach { applyHostPreferences(it) }
            dispatchToVue(
                "temu-webview-dark-mode-changed",
                JSONObject().put("enabled", isDarkMode)
            )
            invoke.resolve(JSObject())
        }
    }

    @Command
    fun setTextZoom(invoke: Invoke) {
        val args = invoke.parseArgs(TextZoomArgs::class.java)
        activity.runOnUiThread {
            textZoomLevel = normalizeTextZoom(args.level)
            sessionHosts.values.forEach { applyTextZoom(it.webView) }
            dispatchToVue(
                "temu-webview-text-zoom-changed",
                JSONObject().put("level", textZoomLevel)
            )
            invoke.resolve(JSObject())
        }
    }

    @Command
    fun setSessions(invoke: Invoke) {
        val args = invoke.parseArgs(SessionsArgs::class.java)
        activity.runOnUiThread {
            updateSessions(args.sessionsJson)
            activeSessionId = args.activeSessionId.trim().ifBlank { activeSessionId }
            rebuildBottomBars()
            invoke.resolve(JSObject())
        }
    }

    private fun createHost(sessionId: String, name: String, initialUrl: String): SessionHost {
        val density = activity.resources.displayMetrics.density
        val navBarHeight = activity.window.decorView.rootWindowInsets?.systemWindowInsetBottom ?: 0
        val barHeight = (56 * density).toInt()

        val root = FrameLayout(activity)
        root.visibility = View.GONE

        val webView = createWebView(sessionId)
        val webParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
        )
        webParams.bottomMargin = barHeight + navBarHeight
        webView.layoutParams = webParams

        val bottomBar = buildBottomBar(sessionId, density, navBarHeight)
        val bottomParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            barHeight + navBarHeight,
        )
        bottomParams.gravity = Gravity.BOTTOM
        bottomBar.layoutParams = bottomParams

        root.addView(webView)
        root.addView(bottomBar)
        activity.addContentView(
            root,
            FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
        )

        val host = SessionHost(
            id = sessionId,
            name = name,
            root = root,
            webView = webView,
            bottomBar = bottomBar,
            currentUrl = initialUrl,
            lastUsedAt = now(),
        )
        sessionHosts[sessionId] = host
        return host
    }

    private fun createWebView(sessionId: String): WebView {
        val webView = WebView(activity)
        if (multiProfileModeEnabled && !disableMultiProfileMode) {
            try {
                WebViewCompat.setProfile(webView, webkitProfileName(sessionId))
            } catch (error: Exception) {
                disableMultiProfileMode = true
                Log.w(TAG, "WebView profile isolation degraded: ${error.message}")
            }
        }

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.setSupportMultipleWindows(false)
        settings.javaScriptCanOpenWindowsAutomatically = false
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.builtInZoomControls = true
        settings.displayZoomControls = false
        settings.textZoom = textZoomLevel

        val cookieManager = if (multiProfileModeEnabled && !disableMultiProfileMode) {
            try {
                WebViewCompat.getProfile(webView).cookieManager
            } catch (_: Exception) {
                CookieManager.getInstance()
            }
        } else {
            CookieManager.getInstance()
        }
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, false)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: android.webkit.WebResourceRequest,
            ): Boolean {
                val target = request.url.toString()
                if (!isAllowedTemuUrl(target)) {
                    Toast.makeText(activity, "Lien externe bloqué", Toast.LENGTH_SHORT).show()
                    dispatchToVue(
                        "temu-webview-navigation-blocked",
                        JSONObject().put("url", target)
                    )
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                hostForWebView(view)?.let { host ->
                    host.currentUrl = url
                    host.lastUsedAt = now()
                    updateBottomBarState(host)
                    dispatchToVue(
                        "temu-webview-url-changed",
                        JSONObject()
                            .put("sessionId", host.id)
                            .put("url", url)
                            .put("canGoBack", view.canGoBack())
                            .put("canGoForward", view.canGoForward())
                    )
                }
                applyDarkMode(view)
                applyTextZoom(view)
            }
        }
        webView.webChromeClient = WebChromeClient()
        return webView
    }

    private fun buildBottomBar(sessionId: String, density: Float, navBarHeight: Int): LinearLayout {
        val bar = LinearLayout(activity)
        bar.orientation = LinearLayout.VERTICAL
        bar.setBackgroundColor(if (isDarkMode) Color.parseColor("#111111") else Color.WHITE)
        bar.setPadding(0, 0, 0, navBarHeight)

        val row = LinearLayout(activity)
        row.orientation = LinearLayout.HORIZONTAL
        row.gravity = Gravity.CENTER_VERTICAL
        row.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            (56 * density).toInt(),
        )

        row.addView(button("Accueil", density) { hideActiveHost() })
        row.addView(button("Retour", density) { activeHost()?.webView?.let { if (it.canGoBack()) it.goBack() } })
        row.addView(button("Avant", density) { activeHost()?.webView?.let { if (it.canGoForward()) it.goForward() } })
        row.addView(button("Recharger", density) { activeHost()?.webView?.reload() })
        row.addView(button("Enregistrer", density) { requestCaptureFromBottomBar() })

        val scrollView = HorizontalScrollView(activity)
        scrollView.isHorizontalScrollBarEnabled = false
        scrollView.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f)
        val sessionRow = LinearLayout(activity)
        sessionRow.orientation = LinearLayout.HORIZONTAL
        sessionRow.tag = "session-row"
        scrollView.addView(sessionRow)
        row.addView(scrollView)

        row.addView(button("Sombre", density) { toggleDarkModeFromNative() })
        row.addView(button("A-", density) { setNativeTextZoom(textZoomLevel - 10) })
        row.addView(button("A+", density) { setNativeTextZoom(textZoomLevel + 10) })

        bar.addView(row)
        rebuildSessionButtonsForBar(bar, sessionId, density)
        return bar
    }

    private fun button(label: String, density: Float, action: () -> Unit): TextView {
        val view = TextView(activity)
        view.text = label
        view.textSize = 12f
        view.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        view.gravity = Gravity.CENTER
        view.setTextColor(if (isDarkMode) Color.WHITE else Color.parseColor("#222222"))
        view.setPadding((8 * density).toInt(), 0, (8 * density).toInt(), 0)
        view.minWidth = (52 * density).toInt()
        view.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
        )
        view.background = pillBackground(false, density)
        view.setOnClickListener { action() }
        return view
    }

    private fun rebuildBottomBars() {
        sessionHosts.values.forEach { host ->
            val density = activity.resources.displayMetrics.density
            rebuildSessionButtonsForBar(host.bottomBar, host.id, density)
            updateBottomBarState(host)
        }
    }

    private fun rebuildSessionButtonsForBar(bar: LinearLayout, ownerSessionId: String, density: Float) {
        val row = bar.getChildAt(0) as? LinearLayout ?: return
        val scrollView = (0 until row.childCount)
            .map { row.getChildAt(it) }
            .filterIsInstance<HorizontalScrollView>()
            .firstOrNull() ?: return
        val sessionRow = scrollView.getChildAt(0) as? LinearLayout ?: return
        sessionRow.removeAllViews()

        sessionItems.values.forEach { item ->
            val label = item.name.take(18)
            val btn = button(label, density) {
                sessionHosts[item.id]?.let { showHost(it) }
            }
            btn.tag = item.id
            btn.background = pillBackground(item.id == activeSessionId || item.id == ownerSessionId, density)
            sessionRow.addView(btn)
        }
    }

    private fun pillBackground(active: Boolean, density: Float): GradientDrawable {
        val shape = GradientDrawable()
        shape.cornerRadius = 16 * density
        shape.setColor(
            if (active) {
                if (isDarkMode) Color.parseColor("#2F6F64") else Color.parseColor("#DDF5EE")
            } else {
                if (isDarkMode) Color.parseColor("#202020") else Color.parseColor("#F4F4F5")
            }
        )
        return shape
    }

    private fun showHost(host: SessionHost) {
        activeHost()?.let {
            if (it.id != host.id) hideHost(it)
        }
        activeSessionId = host.id
        host.root.visibility = View.VISIBLE
        host.webView.onResume()
        host.isVisible = true
        host.lastUsedAt = now()
        applyHostPreferences(host)
        rebuildBottomBars()
    }

    private fun hideActiveHost() {
        activeHost()?.let { hideHost(it) }
        dispatchToVue("temu-webview-hidden", JSONObject())
    }

    private fun hideHost(host: SessionHost) {
        host.root.visibility = View.GONE
        host.webView.onPause()
        host.isVisible = false
        if (activeSessionId == host.id) {
            activeSessionId = null
        }
    }

    private fun destroyHost(sessionId: String) {
        val host = sessionHosts.remove(sessionId) ?: return
        host.root.removeView(host.webView)
        (host.root.parent as? ViewGroup)?.removeView(host.root)
        host.webView.stopLoading()
        host.webView.destroy()
    }

    private fun activeHost(): SessionHost? = activeSessionId?.let { sessionHosts[it] }

    private fun hostForWebView(webView: WebView): SessionHost? =
        sessionHosts.values.firstOrNull { it.webView == webView }

    private fun requestCaptureFromBottomBar() {
        val host = activeHost()
        val url = host?.currentUrl ?: host?.webView?.url
        dispatchToVue(
            "temu-webview-capture-requested",
            JSONObject()
                .put("sessionId", host?.id)
                .put("url", url)
                .put("available", host != null)
                .put("degraded", isProfileDegraded())
        )
    }

    private fun toggleDarkModeFromNative() {
        isDarkMode = !isDarkMode
        sessionHosts.values.forEach { applyHostPreferences(it) }
        dispatchToVue("temu-webview-dark-mode-changed", JSONObject().put("enabled", isDarkMode))
    }

    private fun setNativeTextZoom(level: Int) {
        textZoomLevel = normalizeTextZoom(level)
        sessionHosts.values.forEach { applyTextZoom(it.webView) }
        dispatchToVue("temu-webview-text-zoom-changed", JSONObject().put("level", textZoomLevel))
    }

    private fun applyHostPreferences(host: SessionHost) {
        applyTextZoom(host.webView)
        applyDarkMode(host.webView)
        host.bottomBar.setBackgroundColor(if (isDarkMode) Color.parseColor("#111111") else Color.WHITE)
        updateBottomBarState(host)
    }

    private fun applyTextZoom(webView: WebView) {
        webView.settings.textZoom = normalizeTextZoom(textZoomLevel)
    }

    private fun applyDarkMode(webView: WebView) {
        try {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
                WebSettingsCompat.setAlgorithmicDarkeningAllowed(webView.settings, isDarkMode)
            } else if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
                @Suppress("DEPRECATION")
                WebSettingsCompat.setForceDark(
                    webView.settings,
                    if (isDarkMode) WebSettingsCompat.FORCE_DARK_ON else WebSettingsCompat.FORCE_DARK_OFF,
                )
            }
        } catch (error: Exception) {
            Log.w(TAG, "Dark mode apply failed: ${error.message}")
        }
    }

    private fun updateBottomBarState(host: SessionHost) {
        rebuildSessionButtonsForBar(host.bottomBar, host.id, activity.resources.displayMetrics.density)
    }

    private fun updateSessions(rawJson: String) {
        try {
            val parsed = JSONArray(rawJson)
            sessionItems.clear()
            for (index in 0 until parsed.length()) {
                val item = parsed.optJSONObject(index) ?: continue
                val id = item.optString("id").trim()
                if (id.isBlank()) continue
                val name = item.optString("name").trim().ifBlank { "Shopping" }
                sessionItems[id] = SessionItem(id, name)
                sessionHosts[id]?.name = name
            }
        } catch (error: Exception) {
            Log.w(TAG, "Invalid session list ignored: ${error.message}")
        }
    }

    private fun enforceWarmHostBound() {
        if (sessionHosts.size <= MAX_WARM_HOSTS) return
        val active = activeSessionId
        val removable = sessionHosts.values
            .filter { it.id != active }
            .minByOrNull { it.lastUsedAt }
            ?: return
        destroyHost(removable.id)
    }

    private fun dispatchToVue(eventName: String, detail: JSONObject) {
        val webView = mainWebView ?: return
        val js = "window.dispatchEvent(new CustomEvent(${JSONObject.quote(eventName)}, { detail: ${detail} }));"
        webView.post { webView.evaluateJavascript(js, null) }
    }

    private fun safeTemuUrl(raw: String): String? {
        val candidate = raw.trim().ifBlank { TEMU_HOME_URL }
        if (!isAllowedTemuUrl(candidate)) return null
        return candidate
    }

    private fun isAllowedTemuUrl(raw: String): Boolean {
        return try {
            val uri = Uri.parse(raw)
            val scheme = uri.scheme?.lowercase() ?: return false
            if (scheme != "https" && scheme != "http") return false
            val host = uri.host?.lowercase() ?: return false
            host == "temu.com" ||
                host.endsWith(".temu.com") ||
                host == "temu.to" ||
                host.endsWith(".temu.to")
        } catch (_: Exception) {
            false
        }
    }

    private fun normalizeTextZoom(level: Int): Int =
        level.coerceIn(TEXT_ZOOM_MIN, TEXT_ZOOM_MAX)

    private fun isProfileDegraded(): Boolean =
        !multiProfileModeEnabled || disableMultiProfileMode

    private fun now(): Long = System.currentTimeMillis()

    private fun webkitProfileName(sessionId: String): String =
        WEBKIT_PROFILE_PREFIX + sha256(sessionId).take(24)

    private fun sha256(value: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(value.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }
}
