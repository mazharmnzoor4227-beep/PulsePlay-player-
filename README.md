# PulsePlay

PulsePlay Android source and automated APK build.

The previous white `Webpage not available / ERR_FILE_NOT_FOUND` screen was caused by the APK being packaged before the Vite WebView bundle existed. The Android Gradle build now generates that bundle before packaging and CI verifies `assets/www/index.android.html` is actually inside the APK.

The complete fixed source is in `PulsePlay-source-fixed.zip`. GitHub Actions builds `PulsePlay-v1.0.0.apk` on every push to `main`.
