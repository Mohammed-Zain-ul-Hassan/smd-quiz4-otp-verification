import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import OtpInput from '../components/OtpInput';
import PrimaryButton from '../components/PrimaryButton';
import { CODE_LENGTH } from '../services/otpService';
import { colors } from '../theme';
import { formatTime } from '../utils/phone';

const RESEND_SECONDS = 60;

export default function OtpScreen({ maskedPhone, onVerify, onResend, onBack, loading, error, attemptsLeft, sentAt }) {
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Restart the resend countdown every time a new code is sent.
  useEffect(() => {
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sentAt]);

  // Clear the boxes after a wrong code so the user can type again.
  useEffect(() => {
    if (error) setCode('');
  }, [error]);

  function handleChange(text) {
    setCode(text);
    // verify automatically once every box is filled
    if (text.length === CODE_LENGTH) onVerify(text);
  }

  return (
    <View>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Change number</Text>
      </Pressable>

      <View style={styles.iconCircle}>
        <Text style={styles.icon}>💬</Text>
      </View>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>
        We sent a {CODE_LENGTH}-digit code by SMS to{'\n'}
        <Text style={styles.phone}>{maskedPhone}</Text>
      </Text>

      <View style={styles.otpSpace}>
        <OtpInput value={code} onChange={handleChange} length={CODE_LENGTH} hasError={!!error} />
      </View>

      {error ? (
        <Text style={styles.error}>
          {error} {attemptsLeft > 0 ? `(${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left)` : ''}
        </Text>
      ) : null}

      <View style={styles.buttonSpace}>
        <PrimaryButton
          title="Verify"
          onPress={() => onVerify(code)}
          disabled={code.length !== CODE_LENGTH}
          loading={loading}
        />
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.muted}>Didn't get it? </Text>
        {secondsLeft > 0 ? (
          <Text style={styles.muted}>Resend in {formatTime(secondsLeft)}</Text>
        ) : (
          <Pressable onPress={onResend} disabled={loading}>
            <Text style={styles.link}>Resend code</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 24 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: { fontSize: 34 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 8, lineHeight: 22 },
  phone: { color: colors.text, fontWeight: '700' },
  otpSpace: { marginTop: 32 },
  error: { color: colors.error, marginTop: 14, fontSize: 14, textAlign: 'center' },
  buttonSpace: { marginTop: 28 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
