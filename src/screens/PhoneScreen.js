import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme';
import { COUNTRIES, isValidNumber } from '../utils/phone';

export default function PhoneScreen({ country, number, onChangeCountry, onChangeNumber, onSend, loading, error }) {
  const [showCountries, setShowCountries] = useState(false);
  const valid = isValidNumber(country, number);

  function pickCountry(item) {
    onChangeCountry(item);
    setShowCountries(false);
  }

  return (
    <View>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>📱</Text>
      </View>
      <Text style={styles.title}>Verify your phone</Text>
      <Text style={styles.subtitle}>
        Enter your mobile number. We will text you a 6-digit code to confirm it is yours.
      </Text>

      <Text style={styles.label}>Phone number</Text>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <Pressable style={styles.countryButton} onPress={() => setShowCountries(!showCountries)}>
          <Text style={styles.countryText}>
            {country.flag} +{country.code} ▾
          </Text>
        </Pressable>
        <TextInput
          value={number}
          onChangeText={onChangeNumber}
          placeholder={country.example}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={14}
          style={styles.input}
        />
      </View>

      {showCountries && (
        <View style={styles.dropdown}>
          {COUNTRIES.map((item) => (
            <Pressable key={item.code} style={styles.dropdownItem} onPress={() => pickCountry(item)}>
              <Text style={styles.dropdownText}>
                {item.flag}  {item.name}
              </Text>
              <Text style={styles.dropdownCode}>+{item.code}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonSpace}>
        <PrimaryButton title="Send OTP" onPress={onSend} disabled={!valid} loading={loading} />
      </View>
      <Text style={styles.note}>Standard SMS rates may apply.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 32, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  inputRowError: { borderColor: colors.error },
  countryButton: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: '#FAFAFB',
  },
  countryText: { fontSize: 16, fontWeight: '600', color: colors.text },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 18, color: colors.text, letterSpacing: 1 },
  dropdown: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownText: { fontSize: 15, color: colors.text },
  dropdownCode: { fontSize: 15, color: colors.muted },
  error: { color: colors.error, marginTop: 10, fontSize: 14 },
  buttonSpace: { marginTop: 28 },
  note: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 14 },
});
