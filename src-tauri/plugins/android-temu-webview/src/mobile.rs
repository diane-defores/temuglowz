use serde::{Deserialize, Serialize};
use tauri::{plugin::PluginHandle, Runtime};

use crate::error::{Error, Result};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenSessionRequest {
    session_id: String,
    url: String,
    name: String,
    dark_mode: bool,
    text_zoom: i32,
    hide_temu_clutter: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionRequest {
    session_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DarkModeRequest {
    enabled: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct TextZoomRequest {
    level: i32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HideTemuClutterRequest {
    enabled: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SessionsRequest {
    sessions_json: String,
    active_session_id: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ShoppingListsRequest {
    lists_json: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureResponse {
    pub url: Option<String>,
    pub session_id: Option<String>,
    pub available: bool,
    pub degraded: bool,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticsResponse {
    pub available: bool,
    pub multi_profile_supported: bool,
    pub multi_profile_enabled: bool,
    pub profile_degraded: bool,
    pub active_session_id: Option<String>,
    pub active_profile_name: Option<String>,
    pub active_host: Option<String>,
    pub warm_host_count: i32,
    pub known_session_count: i32,
    pub dom_storage_enabled: Option<bool>,
    pub database_enabled: Option<bool>,
    pub mixed_content_mode: Option<i32>,
    pub java_script_enabled: Option<bool>,
    pub accept_cookie: bool,
    pub accept_third_party_cookies: Option<bool>,
    pub hide_temu_clutter: bool,
    pub dark_mode: bool,
    pub text_zoom: i32,
    pub error: Option<String>,
}

pub struct TemuWebview<R: Runtime>(pub PluginHandle<R>);

impl<R: Runtime> TemuWebview<R> {
    pub fn open_session(
        &self,
        session_id: &str,
        url: &str,
        name: &str,
        dark_mode: bool,
        text_zoom: i32,
        hide_temu_clutter: bool,
    ) -> Result<()> {
        self.0
            .run_mobile_plugin(
                "openSession",
                OpenSessionRequest {
                    session_id: session_id.to_string(),
                    url: url.to_string(),
                    name: name.to_string(),
                    dark_mode,
                    text_zoom,
                    hide_temu_clutter,
                },
            )
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn hide(&self) -> Result<()> {
        self.0
            .run_mobile_plugin("hideWebView", ())
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn close_session(&self, session_id: &str) -> Result<()> {
        self.0
            .run_mobile_plugin(
                "closeSession",
                SessionRequest {
                    session_id: session_id.to_string(),
                },
            )
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn capture_current_url(&self) -> Result<CaptureResponse> {
        self.0
            .run_mobile_plugin("captureCurrentUrl", ())
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn diagnostics(&self) -> Result<DiagnosticsResponse> {
        self.0
            .run_mobile_plugin("getDiagnostics", ())
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn set_dark_mode(&self, enabled: bool) -> Result<()> {
        self.0
            .run_mobile_plugin("setDarkMode", DarkModeRequest { enabled })
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn set_text_zoom(&self, level: i32) -> Result<()> {
        self.0
            .run_mobile_plugin("setTextZoom", TextZoomRequest { level })
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn set_hide_temu_clutter(&self, enabled: bool) -> Result<()> {
        self.0
            .run_mobile_plugin("setHideTemuClutter", HideTemuClutterRequest { enabled })
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn set_sessions(&self, sessions_json: String, active_session_id: String) -> Result<()> {
        self.0
            .run_mobile_plugin(
                "setSessions",
                SessionsRequest {
                    sessions_json,
                    active_session_id,
                },
            )
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }

    pub fn set_shopping_lists(&self, lists_json: String) -> Result<()> {
        self.0
            .run_mobile_plugin("setShoppingLists", ShoppingListsRequest { lists_json })
            .map_err(|e| Error::PluginInvoke(e.to_string()))
    }
}
