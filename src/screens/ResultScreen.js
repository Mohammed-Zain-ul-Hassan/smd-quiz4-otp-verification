import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme';

export default function ResultScreen({ success, message, maskedPhone, onTryAgain, onStartOver }) {
  return (
    <View style={styles.center}>
      <View style={[styles.badge, success ? styles.successBadge : styles.errorBadge]}>
        <Text style={[styles.badgeIcon, { color: success ? colors.success : colors.error }]}>
          {success ? '✓' : '✕'}
        </Text>
      </View>

      <Text style={styles.title}>{success ? 'Phone verified!' : 'Verification failed'}</Text>
      <Text style={styles.message}>{message}</Text>

      {success ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Verified number</Text>
          <Text style={styles.cardValue}>{maskedPhone}</Text>
          <Text style={styles.cardLabel}>Verified at</Text>
          <Text style={styles.cardValue}>{new Date().toLocaleString()}</Text>
        </View>
      ) : null}

      <View style={styles.buttons}>
        {success ? (
          <PrimaryButton title="Verify another number" onPress={onStartOver} />
        ) : (
          <>
            <PrimaryButton title="Send a new code" onPress={onTryAgain} />
            <View style={{ height: 12 }} />
            <PrimaryButton title="Use a different number" onPress={onStartOver} variant="outline" />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingTop: 40 },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successBadge: { backgroundColor: colors.successLight },
  errorBadge: { backgroundColor: colors.errorLight },
  badgeIcon: { fontSize: 56, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  message: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  card: {
    alignSelf: 'stretch',
    marginTop: 28,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 16, color: colors.text, fontWeight: '600', marginTop: 4, marginBottom: 12 },
  buttons: { alignSelf: 'stretch', marginTop: 32 },
});
