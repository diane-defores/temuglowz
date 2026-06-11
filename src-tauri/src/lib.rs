use std::sync::Mutex;

use tauri::{AppHandle, Builder, State};

#[cfg(mobile)]
use tauri_plugin_android_temu_webview::TemuWebviewExt;

mod backup;

#[derive(Default)]
struct ShareBridgeState {
    pending_share_text: Mutex<Option<String>>,
}

#[tauri::command]
fn consume_pending_share(state: State<ShareBridgeState>) -> Option<String> {
    state
        .pending_share_text
        .lock()
        .ok()
        .and_then(|mut pending| pending.take())
}

#[tauri::command]
fn submit_share_payload(text: String, state: State<ShareBridgeState>) {
    if let Ok(mut pending) = state.pending_share_text.lock() {
        *pending = Some(text);
    }
}

#[tauri::command]
fn validate_backup_payload(payload_json: String) -> bool {
    backup::validate_payload(&payload_json).is_ok()
}

#[tauri::command]
fn temu_webview_open_session(
    app: AppHandle,
    session_id: String,
    url: String,
    name: String,
    dark_mode: bool,
    text_zoom: i32,
) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .open_session(&session_id, &url, &name, dark_mode, text_zoom)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, session_id, url, name, dark_mode, text_zoom);
        Err("Temu WebView is only available on Android".to_string())
    }
}

#[tauri::command]
fn temu_webview_hide(app: AppHandle) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app.temu_webview().hide().map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = app;
        Err("Temu WebView is only available on Android".to_string())
    }
}

#[tauri::command]
fn temu_webview_close_session(app: AppHandle, session_id: String) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .close_session(&session_id)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, session_id);
        Err("Temu WebView is only available on Android".to_string())
    }
}

#[tauri::command]
fn temu_webview_capture_current_url(app: AppHandle) -> Result<serde_json::Value, String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .capture_current_url()
            .map(serde_json::to_value)
            .map_err(|error| error.to_string())
            .and_then(|value| value.map_err(|error| error.to_string()));
    }

    #[cfg(not(mobile))]
    {
        let _ = app;
        Ok(serde_json::json!({
          "url": null,
          "sessionId": null,
          "available": false,
          "degraded": true,
          "error": "Temu WebView is only available on Android"
        }))
    }
}

#[tauri::command]
fn temu_webview_set_dark_mode(app: AppHandle, enabled: bool) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .set_dark_mode(enabled)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, enabled);
        Ok(())
    }
}

#[tauri::command]
fn temu_webview_set_text_zoom(app: AppHandle, level: i32) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .set_text_zoom(level)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, level);
        Ok(())
    }
}

#[tauri::command]
fn temu_webview_set_sessions(
    app: AppHandle,
    sessions_json: String,
    active_session_id: String,
) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .set_sessions(sessions_json, active_session_id)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, sessions_json, active_session_id);
        Ok(())
    }
}

#[tauri::command]
fn temu_webview_set_shopping_lists(
    app: AppHandle,
    lists_json: String,
) -> Result<(), String> {
    #[cfg(mobile)]
    {
        return app
            .temu_webview()
            .set_shopping_lists(lists_json)
            .map_err(|error| error.to_string());
    }

    #[cfg(not(mobile))]
    {
        let _ = (app, lists_json);
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_android_temu_webview::init())
        .manage(ShareBridgeState::default())
        .invoke_handler(tauri::generate_handler![
            consume_pending_share,
            submit_share_payload,
            validate_backup_payload,
            temu_webview_open_session,
            temu_webview_hide,
            temu_webview_close_session,
            temu_webview_capture_current_url,
            temu_webview_set_dark_mode,
            temu_webview_set_text_zoom,
            temu_webview_set_sessions,
            temu_webview_set_shopping_lists,
        ])
        .run(tauri::generate_context!())
        .expect("tauri run failed");
}
