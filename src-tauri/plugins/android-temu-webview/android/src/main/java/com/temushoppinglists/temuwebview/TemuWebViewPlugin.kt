package com.temushoppinglists.temuwebview

import android.app.Activity
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.util.Log
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.MotionEvent
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
import android.widget.ScrollView
import android.widget.SeekBar
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
private const val TEXT_ZOOM_STEP = 5
private const val TEXT_ZOOM_RANGE_STEPS = (TEXT_ZOOM_MAX - TEXT_ZOOM_MIN) / TEXT_ZOOM_STEP
private const val MAX_WARM_HOSTS = 3
private const val TEMU_HOME_URL = "https://www.temu.com/"
private const val WEBKIT_PROFILE_PREFIX = "temu_"

private val TEMU_CLUTTER_CLEANUP_SCRIPT = """
(function() {
  'use strict';
  if (window.__temuListsClutterCleanup) return;
  window.__temuListsClutterCleanup = true;

  function appendCleanupStyle() {
    if (document.getElementById('__temuListsClutterStyle')) return;
    var style = document.createElement('style');
    style.id = '__temuListsClutterStyle';
    style.textContent = [
      'meta[name="apple-itunes-app"], meta[name="google-play-app"] { display: none !important; }',
      '#smart-banner, .smartbanner, .smart-banner, #smartbanner, .smartbanner-container { display: none !important; }',
      '[id*="app-download" i], [id*="appDownload" i], [id*="install-app" i], [id*="installApp" i] { display: none !important; }',
      '[class*="app-download" i], [class*="appDownload" i], [class*="install-app" i], [class*="installApp" i] { display: none !important; }',
      '[data-testid*="app" i][data-testid*="banner" i], [data-testid*="install" i], [data-testid*="download" i] { display: none !important; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0 || !!el.offsetParent;
  }

  function textOf(el) {
    return ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).trim();
  }

  var DISMISS_RE = /^(not now|no thanks|maybe later|continue in browser|stay in browser|use web|close|dismiss|skip|pas maintenant|non merci|plus tard|continuer dans le navigateur|rester sur le site|utiliser le web|fermer|ignorer|passer|×|✕)$/i;
  var APP_PROMO_RE = /(install|download|get|open).{0,24}(app|temu)|ouvrir.{0,24}(app|application)|installer.{0,24}(app|application|temu)|télécharger.{0,24}(app|application|temu)|continuer dans l.app|open in app|get the temu app/i;

  function robustClick(el) {
    if (!visible(el)) return false;
    try {
      var r = el.getBoundingClientRect();
      var opts = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerId: 1, pointerType: 'touch' };
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', opts));
    } catch (e) {}
    try { el.click(); return true; } catch (e) { return false; }
  }

  function removeSmartBannerMeta() {
    document.querySelectorAll('meta[name="apple-itunes-app"], meta[name="google-play-app"]').forEach(function(el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function hideInstallPromos() {
    var areas = document.querySelectorAll('header, aside, section, div, [role="banner"], [role="dialog"]');
    for (var i = 0; i < areas.length; i++) {
      var el = areas[i];
      if (!visible(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.height > Math.max(180, window.innerHeight * 0.35)) continue;
      var txt = textOf(el);
      if (txt.length > 260) continue;
      if (APP_PROMO_RE.test(txt)) {
        el.style.setProperty('display', 'none', 'important');
      }
    }
    var buttons = document.querySelectorAll('button, a[role="button"], [role="button"], a');
    for (var j = 0; j < buttons.length; j++) {
      var label = textOf(buttons[j]);
      if (!DISMISS_RE.test(label)) continue;
      var parent = buttons[j].closest('[id*="app" i], [class*="app" i], [id*="banner" i], [class*="banner" i], [id*="install" i], [class*="install" i], [id*="download" i], [class*="download" i], [role="dialog"]');
      if (parent && APP_PROMO_RE.test(textOf(parent))) {
        robustClick(buttons[j]);
        break;
      }
    }
  }

  function runCleanup() {
    appendCleanupStyle();
    removeSmartBannerMeta();
    hideInstallPromos();
  }

  runCleanup();
  setTimeout(runCleanup, 600);
  setTimeout(runCleanup, 1800);
  setTimeout(runCleanup, 3500);
  try {
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
          setTimeout(runCleanup, 250);
          break;
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
""".trimIndent()

@InvokeArg
class OpenSessionArgs {
    var sessionId: String = ""
    var url: String = TEMU_HOME_URL
    var name: String = ""
    var darkMode: Boolean = false
    var textZoom: Int = TEXT_ZOOM_DEFAULT
    var hideTemuClutter: Boolean = true
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
class HideTemuClutterArgs {
    var enabled: Boolean = true
}

@InvokeArg
class SessionsArgs {
    var sessionsJson: String = "[]"
    var activeSessionId: String = ""
}

@InvokeArg
class ShoppingListsArgs {
    var listsJson: String = "[]"
}

private data class SessionItem(
    val id: String,
    val name: String,
)

private data class ShoppingListItem(
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
    private var hideTemuClutter = true
    private var multiProfileModeEnabled = false
    private var disableMultiProfileMode = false
    private val sessionHosts = linkedMapOf<String, SessionHost>()
    private val sessionItems = linkedMapOf<String, SessionItem>()
    private val shoppingListItems = linkedMapOf<String, ShoppingListItem>()
    private var popupMenuOverlayView: FrameLayout? = null
    private var popupMenuView: LinearLayout? = null
    private val primeIconsTypeface: Typeface by lazy {
        try {
            Typeface.createFromAsset(activity.assets, "primeicons.ttf")
        } catch (error: Exception) {
            Log.w(TAG, "PrimeIcons asset unavailable; falling back to default font", error)
            Typeface.DEFAULT
        }
    }

    override fun load(webView: WebView) {
        mainWebView = webView
        multiProfileModeEnabled = WebViewFeature.isFeatureSupported(WebViewFeature.MULTI_PROFILE)
        disableMultiProfileMode = !multiProfileModeEnabled
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
            hideTemuClutter = args.hideTemuClutter
            val name = args.name.trim().ifBlank { "Shopping" }
            sessionItems[sessionId] = SessionItem(sessionId, name)

            enforceSingleHostFallback(sessionId)
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
            result.put("url", host?.let { currentVisibleUrl(it) })
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
    fun setHideTemuClutter(invoke: Invoke) {
        val args = invoke.parseArgs(HideTemuClutterArgs::class.java)
        activity.runOnUiThread {
            hideTemuClutter = args.enabled
            if (hideTemuClutter) {
                sessionHosts.values.forEach { applyTemuClutterCleanup(it.webView) }
            }
            invoke.resolve(JSObject().put("enabled", hideTemuClutter))
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

    @Command
    fun setShoppingLists(invoke: Invoke) {
        val args = invoke.parseArgs(ShoppingListsArgs::class.java)
        activity.runOnUiThread {
            shoppingListItems.clear()
            try {
                val parsed = JSONArray(args.listsJson)
                for (index in 0 until parsed.length()) {
                    val item = parsed.optJSONObject(index) ?: continue
                    val id = item.optString("id").trim()
                    val name = item.optString("name").trim()
                    if (id.isBlank() || name.isBlank()) continue
                    shoppingListItems[id] = ShoppingListItem(id = id, name = name)
                }
            } catch (error: Exception) {
                Log.w(TAG, "Failed to parse shopping lists", error)
            }
            invoke.resolve(JSObject().put("ok", true).put("listCount", shoppingListItems.size))
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
        if (isPoolingEnabled()) {
            try {
                WebViewCompat.setProfile(webView, webkitProfileName(sessionId))
            } catch (error: Exception) {
                disablePoolingAndDestroyInactiveHosts()
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

        val cookieManager = if (isPoolingEnabled()) {
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
                applyTemuClutterCleanup(view)
            }
        }
        webView.webChromeClient = WebChromeClient()
        return webView
    }

    private fun buildBottomBar(sessionId: String, density: Float, navBarHeight: Int): LinearLayout {
        val bar = LinearLayout(activity)
        bar.orientation = LinearLayout.VERTICAL
        bar.setBackgroundColor(bottomBarColor())
        bar.setPadding(0, 0, 0, navBarHeight)

        val row = LinearLayout(activity)
        row.orientation = LinearLayout.HORIZONTAL
        row.gravity = Gravity.CENTER_VERTICAL
        row.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            (56 * density).toInt(),
        )

        row.addView(buildHomeButton(density))
        row.addView(buildDivider(density))

        val scrollView = HorizontalScrollView(activity)
        scrollView.isHorizontalScrollBarEnabled = false
        scrollView.isSmoothScrollingEnabled = true
        scrollView.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f)
        val sessionRow = LinearLayout(activity)
        sessionRow.orientation = LinearLayout.HORIZONTAL
        sessionRow.gravity = Gravity.CENTER_VERTICAL
        sessionRow.tag = "session-row"
        scrollView.addView(sessionRow)
        row.addView(scrollView)

        bar.addView(row)
        rebuildSessionButtonsForBar(bar, sessionId, density)
        return bar
    }

    private fun buildHomeButton(density: Float): TextView {
        val btn = TextView(activity)
        btn.text = "\ue941"
        btn.typeface = primeIconsTypeface
        btn.tag = "home-button"
        btn.textSize = 18f
        btn.gravity = Gravity.CENTER
        btn.setTextColor(bottomBarIconColor())
        btn.background = null
        val size = (48 * density).toInt()
        btn.layoutParams = LinearLayout.LayoutParams(size, size)
        btn.isClickable = true
        btn.isFocusable = true
        btn.isLongClickable = true
        btn.setOnClickListener {
            btn.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
            togglePopupMenu(density)
        }
        btn.setOnLongClickListener {
            btn.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
            dismissPopupMenu()
            hideActiveHost()
            true
        }
        return btn
    }

    private fun buildDivider(density: Float): View {
        val divider = View(activity)
        divider.setBackgroundColor(if (isDarkMode) Color.parseColor("#27272A") else Color.parseColor("#DEE2E6"))
        val params = LinearLayout.LayoutParams((1 * density).toInt(), (24 * density).toInt())
        params.setMargins((4 * density).toInt(), 0, (4 * density).toInt(), 0)
        divider.layoutParams = params
        return divider
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

    private fun togglePopupMenu(density: Float) {
        if (popupMenuView != null) {
            dismissPopupMenu()
            return
        }
        showPopupMenu(density)
    }

    private fun dismissPopupMenu() {
        popupMenuOverlayView?.let { overlay ->
            (overlay.parent as? ViewGroup)?.removeView(overlay)
        }
        popupMenuOverlayView = null
        popupMenuView = null
    }

    private fun showPopupMenu(density: Float) {
        val host = activeHost() ?: return
        val root = host.root
        val bar = host.bottomBar

        val overlay = FrameLayout(activity)
        overlay.layoutParams = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT,
        )
        overlay.isClickable = true
        overlay.isFocusable = true
        overlay.setOnClickListener { dismissPopupMenu() }

        val menu = LinearLayout(activity)
        menu.orientation = LinearLayout.VERTICAL
        val menuBg = GradientDrawable()
        menuBg.setColor(if (isDarkMode) Color.parseColor("#1C1C1E") else Color.WHITE)
        menuBg.cornerRadius = 16 * density
        menu.background = menuBg
        menu.elevation = 8 * density
        val pad = (8 * density).toInt()
        menu.setPadding(pad, pad, pad, pad)

        val menuWidth = (232 * density).toInt()
        val menuParams = FrameLayout.LayoutParams(menuWidth, ViewGroup.LayoutParams.WRAP_CONTENT)
        menuParams.gravity = Gravity.BOTTOM or Gravity.START
        menuParams.leftMargin = (8 * density).toInt()
        menuParams.bottomMargin = bar.layoutParams.height + (8 * density).toInt()
        menu.layoutParams = menuParams
        menu.isClickable = true
        menu.isFocusable = true
        menu.setOnClickListener { }

        menu.addView(buildPopupMenuItem(density, "←", "Retour", Typeface.DEFAULT) {
            host.webView.let { if (it.canGoBack()) it.goBack() }
            dismissPopupMenu()
        })
        menu.addView(buildPopupMenuItem(density, "→", "Avant", Typeface.DEFAULT) {
            host.webView.let { if (it.canGoForward()) it.goForward() }
            dismissPopupMenu()
        })
        menu.addView(buildPopupMenuItem(density, "↻", "Recharger", Typeface.DEFAULT) {
            host.webView.reload()
            dismissPopupMenu()
        })
        menu.addView(buildPopupMenuItem(density, "◎", "Observer ce produit", Typeface.DEFAULT) {
            requestObservationFromBottomBar()
            dismissPopupMenu()
            Toast.makeText(activity, "Observation à compléter", Toast.LENGTH_SHORT).show()
        })
        if (shoppingListItems.isEmpty()) {
            menu.addView(buildPopupMenuItem(density, "+", "Enregistrer", Typeface.DEFAULT) {
                requestCaptureFromBottomBar()
                dismissPopupMenu()
            })
        } else {
            menu.addView(buildMenuDivider(density))
            menu.addView(buildPopupMenuItem(density, "+", "Ajouter dans une liste", Typeface.DEFAULT) {
                showShoppingListPicker("add", density)
            })
            menu.addView(buildPopupMenuItem(density, "−", "Retirer d'une liste", Typeface.DEFAULT) {
                showShoppingListPicker("remove", density)
            })
        }
        menu.addView(buildMenuDivider(density))

        val darkLabel = if (isDarkMode) "Mode clair" else "Mode sombre"
        val darkIcon = if (isDarkMode) "\ue9c8" else "\ue9c7"
        menu.addView(buildPopupMenuItem(density, darkIcon, darkLabel, primeIconsTypeface) {
            toggleDarkModeFromNative()
            dismissPopupMenu()
        })
        menu.addView(buildTextZoomControl(density))

        overlay.addView(menu)
        root.addView(overlay)
        popupMenuOverlayView = overlay
        popupMenuView = menu
    }

    private fun showShoppingListPicker(action: String, density: Float) {
        val menu = popupMenuView ?: return
        menu.removeAllViews()

        val title = if (action == "remove") "Retirer d'une liste" else "Ajouter dans une liste"
        menu.addView(buildPopupMenuItem(density, "←", "Retour au menu", Typeface.DEFAULT) {
            dismissPopupMenu()
            showPopupMenu(density)
        })
        menu.addView(buildMenuDivider(density))
        menu.addView(buildMenuTitle(density, title))

        val scrollView = ScrollView(activity)
        val maxHeight = (activity.resources.displayMetrics.heightPixels * 0.48f).toInt()
        scrollView.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            maxHeight.coerceAtLeast((220 * density).toInt()),
        )

        val listWrap = LinearLayout(activity)
        listWrap.orientation = LinearLayout.VERTICAL
        shoppingListItems.values.forEach { list ->
            val icon = if (action == "remove") "−" else "+"
            listWrap.addView(buildPopupMenuItem(density, icon, list.name.take(42), Typeface.DEFAULT) {
                requestShoppingListActionFromBottomBar(action, list.id)
                dismissPopupMenu()
                val verb = if (action == "remove") "Retrait demandé" else "Ajout demandé"
                Toast.makeText(activity, "$verb : ${list.name}", Toast.LENGTH_SHORT).show()
            })
        }

        scrollView.addView(listWrap)
        menu.addView(scrollView)
    }

    private fun buildMenuDivider(density: Float): View {
        val divider = View(activity)
        divider.setBackgroundColor(if (isDarkMode) Color.parseColor("#2C2C2E") else Color.parseColor("#E5E5EA"))
        val params = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, (1 * density).toInt())
        val margin = (8 * density).toInt()
        params.setMargins(margin, (4 * density).toInt(), margin, (4 * density).toInt())
        divider.layoutParams = params
        return divider
    }

    private fun buildMenuTitle(density: Float, label: String): TextView {
        val title = TextView(activity)
        title.text = label
        title.textSize = 12f
        title.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        title.setTextColor(if (isDarkMode) Color.parseColor("#9A9AB0") else Color.parseColor("#6C757D"))
        title.setPadding(
            (12 * density).toInt(),
            (6 * density).toInt(),
            (12 * density).toInt(),
            (4 * density).toInt(),
        )
        return title
    }

    private fun buildTextZoomControl(density: Float): LinearLayout {
        val wrap = LinearLayout(activity)
        wrap.orientation = LinearLayout.VERTICAL
        val padH = (12 * density).toInt()
        val padTop = (8 * density).toInt()
        val padBottom = (10 * density).toInt()
        wrap.setPadding(padH, padTop, padH, padBottom)

        val textColor = if (isDarkMode) Color.parseColor("#E0E0E0") else Color.parseColor("#1C1C1E")
        val secondaryColor = if (isDarkMode) Color.parseColor("#9A9AB0") else Color.parseColor("#6C757D")

        val topRow = LinearLayout(activity)
        topRow.orientation = LinearLayout.HORIZONTAL
        topRow.gravity = Gravity.CENTER_VERTICAL

        val label = TextView(activity)
        label.text = "Taille du texte Temu"
        label.textSize = 14f
        label.setTextColor(textColor)
        label.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        label.layoutParams = LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)

        val value = TextView(activity)
        value.text = "${textZoomLevel}%"
        value.textSize = 12f
        value.setTextColor(secondaryColor)
        value.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)

        topRow.addView(label)
        topRow.addView(value)
        wrap.addView(topRow)

        val slider = SeekBar(activity)
        slider.max = TEXT_ZOOM_RANGE_STEPS
        slider.progress = ((normalizeTextZoom(textZoomLevel) - TEXT_ZOOM_MIN) / TEXT_ZOOM_STEP)
            .coerceIn(0, TEXT_ZOOM_RANGE_STEPS)
        slider.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
        )
        slider.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val level = normalizeTextZoom(TEXT_ZOOM_MIN + (progress * TEXT_ZOOM_STEP))
                value.text = "$level%"
                if (!fromUser || level == textZoomLevel) return
                setNativeTextZoom(level)
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        wrap.addView(slider)

        return wrap
    }

    private fun buildPopupMenuItem(
        density: Float,
        iconChar: String,
        label: String,
        iconTypeface: Typeface,
        onClick: () -> Unit,
    ): LinearLayout {
        val row = LinearLayout(activity)
        row.orientation = LinearLayout.HORIZONTAL
        row.gravity = Gravity.CENTER_VERTICAL
        val rowPadH = (12 * density).toInt()
        val rowPadV = (11 * density).toInt()
        row.setPadding(rowPadH, rowPadV, rowPadH, rowPadV)
        row.isClickable = true
        row.isFocusable = true

        val rippleBg = GradientDrawable()
        rippleBg.cornerRadius = 10 * density
        rippleBg.setColor(Color.TRANSPARENT)
        row.background = rippleBg
        row.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    rippleBg.setColor(if (isDarkMode) Color.parseColor("#2C2C2E") else Color.parseColor("#F2F2F7"))
                    v.invalidate()
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    rippleBg.setColor(Color.TRANSPARENT)
                    v.invalidate()
                }
            }
            false
        }

        val textColor = if (isDarkMode) Color.parseColor("#E0E0E0") else Color.parseColor("#1C1C1E")

        val icon = TextView(activity)
        icon.text = iconChar
        icon.typeface = iconTypeface
        icon.textSize = 16f
        icon.gravity = Gravity.CENTER
        icon.setTextColor(textColor)
        val iconSize = (28 * density).toInt()
        icon.layoutParams = LinearLayout.LayoutParams(iconSize, iconSize)
        row.addView(icon)

        val spacer = View(activity)
        spacer.layoutParams = LinearLayout.LayoutParams((10 * density).toInt(), 1)
        row.addView(spacer)

        val text = TextView(activity)
        text.text = label
        text.textSize = 14f
        text.setTextColor(textColor)
        text.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        text.layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
        )
        row.addView(text)

        row.setOnClickListener { onClick() }
        return row
    }

    private fun showHost(host: SessionHost) {
        dismissPopupMenu()
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
        dismissPopupMenu()
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
        if (activeSessionId == sessionId) dismissPopupMenu()
        host.root.removeView(host.webView)
        (host.root.parent as? ViewGroup)?.removeView(host.root)
        host.webView.stopLoading()
        host.webView.destroy()
    }

    private fun isPoolingEnabled(): Boolean = multiProfileModeEnabled && !disableMultiProfileMode

    private fun disablePoolingAndDestroyInactiveHosts() {
        disableMultiProfileMode = true
        enforceSingleHostFallback(activeSessionId)
    }

    private fun enforceSingleHostFallback(targetSessionId: String?) {
        if (isPoolingEnabled()) return
        sessionHosts.keys
            .filter { it != targetSessionId }
            .toList()
            .forEach { destroyHost(it) }
    }

    private fun activeHost(): SessionHost? = activeSessionId?.let { sessionHosts[it] }

    private fun hostForWebView(webView: WebView): SessionHost? =
        sessionHosts.values.firstOrNull { it.webView == webView }

    private fun currentVisibleUrl(host: SessionHost): String? {
        val liveUrl = host.webView.url?.trim()
        if (!liveUrl.isNullOrEmpty()) {
            return liveUrl
        }
        return host.currentUrl.takeIf { it.isNotBlank() }
    }

    private fun requestCaptureFromBottomBar() {
        val host = activeHost()
        val url = host?.let { currentVisibleUrl(it) }
        dispatchToVue(
            "temu-webview-capture-requested",
            JSONObject()
                .put("sessionId", host?.id)
                .put("url", url)
                .put("available", host != null)
                .put("degraded", isProfileDegraded())
        )
    }

    private fun requestShoppingListActionFromBottomBar(action: String, listId: String) {
        val host = activeHost()
        val url = host?.let { currentVisibleUrl(it) }
        dispatchToVue(
            "temu-webview-capture-requested",
            JSONObject()
                .put("sessionId", host?.id)
                .put("url", url)
                .put("available", host != null)
                .put("degraded", isProfileDegraded())
                .put("action", action)
                .put("listId", listId)
        )
    }

    private fun requestObservationFromBottomBar() {
        val host = activeHost()
        val url = host?.let { currentVisibleUrl(it) }
        dispatchToVue(
            "temu-webview-capture-requested",
            JSONObject()
                .put("sessionId", host?.id)
                .put("url", url)
                .put("available", host != null)
                .put("degraded", isProfileDegraded())
                .put("action", "observe")
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
        applyDarkModeToBottomBar(host.bottomBar)
        updateBottomBarState(host)
    }

    private fun applyDarkModeToBottomBar(bar: LinearLayout) {
        bar.setBackgroundColor(bottomBarColor())
        val row = bar.getChildAt(0) as? LinearLayout ?: return
        for (index in 0 until row.childCount) {
            val child = row.getChildAt(index)
            if (child is TextView && child.tag == "home-button") {
                child.setTextColor(bottomBarIconColor())
            } else if (child is View && child !is ViewGroup && child !is TextView) {
                child.setBackgroundColor(if (isDarkMode) Color.parseColor("#27272A") else Color.parseColor("#DEE2E6"))
            }
        }
    }

    private fun bottomBarColor(): Int =
        if (isDarkMode) Color.parseColor("#09090B") else Color.WHITE

    private fun bottomBarIconColor(): Int =
        if (isDarkMode) Color.parseColor("#E0E0E0") else Color.parseColor("#495057")

    private fun applyTextZoom(webView: WebView) {
        webView.settings.textZoom = normalizeTextZoom(textZoomLevel)
    }

    private fun applyTemuClutterCleanup(webView: WebView) {
        if (!hideTemuClutter) return
        webView.evaluateJavascript(TEMU_CLUTTER_CLEANUP_SCRIPT, null)
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
        if (!isPoolingEnabled()) {
            enforceSingleHostFallback(activeSessionId)
            return
        }
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
            if (scheme != "https") return false
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
