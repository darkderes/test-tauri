#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // WebKitGTK ships with getUserMedia disabled; enable it and
            // ask the user before granting camera/mic access to the webview.
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
                                if ask_media_permission() {
                                    request.allow();
                                } else {
                                    request.deny();
                                }
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

/// Shows a modal native dialog asking the user to approve camera/microphone
/// access. Returns true only if the user explicitly accepts.
#[cfg(target_os = "linux")]
fn ask_media_permission() -> bool {
    use gtk::prelude::{DialogExt, GtkWindowExt};

    let dialog = gtk::MessageDialog::new(
        None::<&gtk::Window>,
        gtk::DialogFlags::MODAL,
        gtk::MessageType::Question,
        gtk::ButtonsType::YesNo,
        "¿Permitir que la aplicación acceda a la cámara y al micrófono?",
    );
    dialog.set_keep_above(true);
    let response = dialog.run();
    dialog.close();
    response == gtk::ResponseType::Yes
}
