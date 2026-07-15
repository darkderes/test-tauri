// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // WebKitGTK ships with getUserMedia disabled; enable it and
            // auto-approve camera/mic permission requests from the webview.
            #[cfg(target_os = "linux")]
            {
                use tauri::Manager;
                use webkit2gtk::{
                    glib::Cast, PermissionRequestExt, SettingsExt,
                    UserMediaPermissionRequest, WebViewExt,
                };

                if let Some(window) = app.get_webview_window("main") {
                    window.with_webview(|webview| {
                        let wv = webview.inner();
                        if let Some(settings) = WebViewExt::settings(&wv) {
                            settings.set_enable_media_stream(true);
                            settings.set_enable_webrtc(true);
                            settings.set_enable_media_capabilities(true);
                        }
                        wv.connect_permission_request(|_, request| {
                            if request
                                .downcast_ref::<UserMediaPermissionRequest>()
                                .is_some()
                            {
                                request.allow();
                                true
                            } else {
                                false
                            }
                        });
                    })?;
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
