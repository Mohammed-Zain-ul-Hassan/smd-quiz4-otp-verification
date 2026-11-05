import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { firebaseConfig } from '../firebaseConfig';
import { colors } from '../theme';

// Firebase only sends an SMS after a reCAPTCHA check, so bots cannot spam numbers.
// reCAPTCHA is a web widget, so we show it inside a small WebView.
// When the user passes, the page sends the token back to the app.
function buildPage() {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
    <style>
      body { margin: 0; display: flex; justify-content: center; padding-top: 8px; background: #fff; }
    </style>
  </head>
  <body>
    <div id="recaptcha"></div>
    <script>
      function send(data) { window.ReactNativeWebView.postMessage(JSON.stringify(data)); }
      try {
        firebase.initializeApp(${JSON.stringify(firebaseConfig)});
        var verifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
          size: 'normal',
          callback: function (token) { send({ type: 'token', token: token }); },
          'expired-callback': function () { send({ type: 'error', message: 'The check expired. Please try again.' }); }
        });
        verifier.render();
      } catch (e) {
        send({ type: 'error', message: e.message });
      }
    </script>
  </body>
</html>`;
}

export default function RecaptchaModal({ visible, onToken, onError, onCancel }) {
  function handleMessage(event) {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'token') onToken(data.token);
    else onError(data.message);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Quick security check</Text>
          <Text style={styles.subtitle}>Tick the box so we know you are not a robot.</Text>
          <View style={styles.webviewBox}>
            {visible && (
              <WebView
                source={{ html: buildPage(), baseUrl: 'https://' + firebaseConfig.authDomain }}
                onMessage={handleMessage}
                javaScriptEnabled
                style={styles.webview}
              />
            )}
          </View>
          <Pressable onPress={onCancel} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: { backgroundColor: colors.card, borderRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6 },
  // tall enough for the image challenge reCAPTCHA sometimes shows
  webviewBox: { height: 520, marginTop: 14, borderRadius: 12, overflow: 'hidden' },
  webview: { flex: 1 },
  cancel: { alignItems: 'center', paddingTop: 14 },
  cancelText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
