use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[cfg(mobile)]
use tauri::Manager;

mod error;

#[cfg(mobile)]
mod mobile;

pub use error::{Error, Result};

#[cfg(mobile)]
pub use mobile::{CaptureResponse, TemuWebview};

#[cfg(mobile)]
pub trait TemuWebviewExt<R: Runtime> {
    fn temu_webview(&self) -> &TemuWebview<R>;
}

#[cfg(mobile)]
impl<R: Runtime, T: Manager<R>> TemuWebviewExt<R> for T {
    fn temu_webview(&self) -> &TemuWebview<R> {
        self.state::<TemuWebview<R>>().inner()
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("android-temu-webview")
        .setup(|app, api| {
            #[cfg(mobile)]
            {
                let handle = api.register_android_plugin(
                    "com.temushoppinglists.temuwebview",
                    "TemuWebViewPlugin",
                )?;
                app.manage(TemuWebview(handle));
            }
            let _ = (app, api);
            Ok(())
        })
        .build()
}
