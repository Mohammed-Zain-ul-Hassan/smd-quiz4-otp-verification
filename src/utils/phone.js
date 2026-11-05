// Small helpers for phone numbers. All of them are pure functions.

export const COUNTRIES = [
  { flag: '🇵🇰', name: 'Pakistan', code: '92', length: 10, example: '300 1234567' },
  { flag: '🇦🇪', name: 'UAE', code: '971', length: 9, example: '50 123 4567' },
  { flag: '🇸🇦', name: 'Saudi Arabia', code: '966', length: 9, example: '50 123 4567' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '44', length: 10, example: '7400 123456' },
  { flag: '🇺🇸', name: 'United States', code: '1', length: 10, example: '201 555 0123' },
];

// Keeps digits only and drops the local leading 0 (0300... becomes 300...).
export function cleanNumber(text) {
  const digits = text.replace(/\D/g, '');
  return digits.startsWith('0') ? digits.slice(1) : digits;
}

export function isValidNumber(country, number) {
  return cleanNumber(number).length === country.length;
}

// The E.164 format Firebase expects, e.g. +923001234567
export function toInternational(country, number) {
  return '+' + country.code + cleanNumber(number);
}

// +92 300 ***4567, so the full number is not shown on screen.
export function maskNumber(country, number) {
  const digits = cleanNumber(number);
  return '+' + country.code + ' ' + digits.slice(0, 3) + ' ***' + digits.slice(-4);
}

// 75 seconds becomes "1:15".
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes + ':' + (rest < 10 ? '0' + rest : rest);
}
