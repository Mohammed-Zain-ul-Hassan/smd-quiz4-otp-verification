import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import PhoneScreen from './src/screens/PhoneScreen';
import OtpScreen from './src/screens/OtpScreen';
import ResultScreen from './src/screens/ResultScreen';
import RecaptchaModal from './src/components/RecaptchaModal';
import { sendOtp, verifyOtp } from './src/services/otpService';
import { COUNTRIES, maskNumber, toInternational } from './src/utils/phone';
import { colors } from './src/theme';

const MAX_ATTEMPTS = 3;

// The app has three steps: 'phone' -> 'otp' -> 'result'.
export default function App() {
  const [step, setStep] = useState('phone');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [number, setNumber] = useState('');
  const [session, setSession] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState({ success: false, message: '' });

  // Firebase only sends an SMS after a reCAPTCHA check, so that comes first.
  function handleSend() {
    setError('');
    setLoading(true);
    setShowCaptcha(true);
  }

  async function sendCode(recaptchaToken) {
    setShowCaptcha(false);
    const response = await sendOtp(toInternational(country, number), recaptchaToken);
    setLoading(false);

    if (response.ok) {
      setSession(response.session);
      setSentAt(Date.now());
      setAttemptsLeft(MAX_ATTEMPTS);
      setStep('otp');
    } else {
      setError(response.message);
      setStep('phone');
    }
  }

  function handleCaptchaError(message) {
    setShowCaptcha(false);
    setLoading(false);
    setError(message);
  }

  function handleCaptchaCancel() {
    setShowCaptcha(false);
    setLoading(false);
  }

  async function handleVerify(code) {
    setLoading(true);
    setError('');
    const response = await verifyOtp(session, code);
    setLoading(false);

    if (response.ok) {
      setSession(null);
      setResult({ success: true, message: 'Your phone number has been verified successfully.' });
      setStep('result');
      return;
    }

    const left = attemptsLeft - 1;
    setAttemptsLeft(left);
    if (response.isFinal || left === 0) {
      setSession(null);
      setResult({
        success: false,
        message: left === 0 ? 'You entered a wrong code too many times.' : response.message,
      });
      setStep('result');
    } else {
      setError(response.message);
    }
  }

  function startOver() {
    setSession(null);
    setNumber('');
    setError('');
    setStep('phone');
  }

  function changeNumber() {
    setError('');
    setStep('phone');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.brand}>QuickVerify</Text>

            {step === 'phone' && (
              <PhoneScreen
                country={country}
                number={number}
                onChangeCountry={setCountry}
                onChangeNumber={setNumber}
                onSend={handleSend}
                loading={loading}
                error={error}
              />
            )}

            {step === 'otp' && (
              <OtpScreen
                maskedPhone={maskNumber(country, number)}
                onVerify={handleVerify}
                onResend={handleSend}
                onBack={changeNumber}
                loading={loading}
                error={error}
                attemptsLeft={attemptsLeft}
                sentAt={sentAt}
              />
            )}

            {step === 'result' && (
              <ResultScreen
                success={result.success}
                message={result.message}
                maskedPhone={maskNumber(country, number)}
                onTryAgain={handleSend}
                onStartOver={startOver}
              />
            )}
          </ScrollView>
          <RecaptchaModal
            visible={showCaptcha}
            onToken={sendCode}
            onError={handleCaptchaError}
            onCancel={handleCaptchaCancel}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 28,
  },
});
