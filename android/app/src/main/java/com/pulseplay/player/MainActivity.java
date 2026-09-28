package com.pulseplay.player;

import android.Manifest;
import android.app.Activity;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity {
  private WebView web;
  private static final int MEDIA_PERMS = 42;

  @Override public void onCreate(Bundle b) {
    super.onCreate(b);

    web = new WebView(this);
    setContentView(web);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(false);
    s.setAllowContentAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);

    final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
        .build();

    web.setWebViewClient(new WebViewClientCompat() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        return assetLoader.shouldInterceptRequest(request.getUrl());
      }

      @Override
      @SuppressWarnings("deprecation")
      public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
        return assetLoader.shouldInterceptRequest(Uri.parse(url));
      }
    });
    web.setWebChromeClient(new WebChromeClient());
    web.addJavascriptInterface(new MediaBridge(), "PulsePlayNative");

    // Serve Vite's ES-module bundle from a real HTTPS origin instead of file://.
    // file:// is an opaque origin in modern WebView and can leave the page blank
    // even though index.android.html itself is present in the APK.
    web.loadUrl("https://appassets.androidplatform.net/assets/www/index.android.html");

    requestMediaPermissions();
  }

  private void requestMediaPermissions() {
    if (Build.VERSION.SDK_INT >= 33) {
      requestPermissions(new String[]{
          Manifest.permission.READ_MEDIA_AUDIO,
          Manifest.permission.READ_MEDIA_VIDEO
      }, MEDIA_PERMS);
    } else if (Build.VERSION.SDK_INT >= 23) {
      requestPermissions(new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}, MEDIA_PERMS);
    }
  }

  @Override public void onRequestPermissionsResult(int r, String[] p, int[] g) {
    super.onRequestPermissionsResult(r, p, g);
    if (r == MEDIA_PERMS) {
      web.evaluateJavascript(
          "window.__pulsePlayRefreshMedia&&window.__pulsePlayRefreshMedia()",
          null
      );
    }
  }

  @Override public void onBackPressed() {
    if (web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }

  public class MediaBridge {
    @JavascriptInterface public String scanMedia() {
      JSONArray out = new JSONArray();
      scan(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, false, out);
      scan(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, true, out);
      return out.toString();
    }

    private void scan(Uri base, boolean video, JSONArray out) {
      String[] cols = {
          MediaStore.MediaColumns._ID,
          MediaStore.MediaColumns.DISPLAY_NAME,
          MediaStore.MediaColumns.DURATION,
          MediaStore.MediaColumns.RELATIVE_PATH,
          MediaStore.MediaColumns.MIME_TYPE
      };
      try (Cursor c = getContentResolver().query(
          base,
          cols,
          null,
          null,
          MediaStore.MediaColumns.DATE_ADDED + " DESC"
      )) {
        if (c == null) return;
        while (c.moveToNext()) {
          long id = c.getLong(0);
          String name = c.getString(1);
          long dur = c.getLong(2);
          String folder = c.getString(3);
          String mime = c.getString(4);

          JSONObject o = new JSONObject();
          o.put("id", "device-" + (video ? "v" : "a") + "-" + id);
          o.put("title", name == null ? "Media" : name.replaceFirst("\\.[^.]+$", ""));
          o.put("duration", Math.max(1, dur / 1000.0));
          o.put("folder", folder == null ? "On This Device" : folder);
          o.put("type", video ? "video" : "song");
          o.put("mime", mime == null ? (video ? "video/*" : "audio/*") : mime);
          o.put("uri", Uri.withAppendedPath(base, String.valueOf(id)).toString());
          out.put(o);
        }
      } catch (Exception ignored) {
      }
    }
  }
}
