use std::sync::Mutex;

use tauri::{Builder, State};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  Builder::default()
    .manage(ShareBridgeState::default())
    .invoke_handler(tauri::generate_handler![
      consume_pending_share,
      submit_share_payload,
      validate_backup_payload,
    ])
    .run(tauri::generate_context!())
    .expect("tauri run failed");
}
