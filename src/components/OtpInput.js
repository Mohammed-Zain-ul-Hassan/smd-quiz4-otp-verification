import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

// One hidden TextInput holds the code; the boxes just display its digits.
// This keeps typing, deleting and pasting (or SMS autofill) simple.
export default function OtpInput({ value, onChange, length, hasError }) {
  const inputRef = useRef(null);
  const boxes = [];

  for (let i = 0; i < length; i++) {
    const isActive = i === value.length;
    boxes.push(
      <View
        key={i}
        style={[
          styles.box,
          isActive && styles.activeBox,
          value[i] && styles.filledBox,
          hasError && styles.errorBox,
        ]}
      >
        <Text style={styles.digit}>{value[i] || ''}</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={() => inputRef.current.focus()}>
      <View style={styles.row}>{boxes}</View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBox: { borderColor: colors.primary, borderWidth: 2 },
  filledBox: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  errorBox: { borderColor: colors.error, backgroundColor: colors.errorLight },
  digit: { fontSize: 24, fontWeight: '700', color: colors.text },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
