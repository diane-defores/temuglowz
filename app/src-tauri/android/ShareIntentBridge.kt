package com.temushoppinglists

import android.content.Intent
import android.net.Uri

// Placeholder only: this file documents the expected bridge shape for ACTION_SEND.
// A full runtime plugin is intentionally out-of-scope for this MVP scaffold.

data class ShareIntentResult(val text: String?)

object ShareIntentBridge {
  fun extractShareText(intent: Intent): ShareIntentResult {
    val sharedText = when {
      intent.action == Intent.ACTION_SEND && "text/plain" == intent.type ->
        intent.getStringExtra(Intent.EXTRA_TEXT)
      intent.action == Intent.ACTION_VIEW && intent.data != null ->
        intent.data?.toString()
      else -> null
    }

    return ShareIntentResult(sharedText?.trim()?.takeIf { it.isNotBlank() })
  }

  fun isSupportedTemuLink(uri: Uri): Boolean {
    val host = uri.host?.lowercase()
    if (host == null) return false

    return host == "temu.com" || host.endsWith(".temu.com")
      || host == "temu.to" || host.endsWith(".temu.to")
  }
}
