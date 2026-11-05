// Talks to Firebase Authentication (phone sign-in) through its REST API.
// Firebase generates the code, sends the SMS, and checks what the user types.
// Docs: https://cloud.google.com/identity-platform/docs/reference/rest/v1/accounts

import { firebaseConfig } from '../firebaseConfig';

const BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:';

export const CODE_LENGTH = 6;

// Firebase sends back error codes like "INVALID_CODE".
// This turns them into a sentence the user can understand.
function friendlyError(code) {
  if (!code) return 'Something went wrong. Please try again.';
  if (code.startsWith('INVALID_PHONE_NUMBER')) return 'That phone number is not valid.';
  if (code.startsWith('INVALID_CODE')) return 'That code is not correct. Please try again.';
  if (code.startsWith('SESSION_EXPIRED')) return 'This code has expired. Please request a new one.';
  if (code.startsWith('TOO_MANY_ATTEMPTS')) return 'Too many requests from this device. Please try again later.';
  if (code.startsWith('QUOTA_EXCEEDED')) return 'The SMS limit for today has been reached. Please try again tomorrow.';
  if (code.startsWith('CAPTCHA_CHECK_FAILED')) return 'The security check failed. Please try again.';
  if (code.startsWith('OPERATION_NOT_ALLOWED')) return 'Phone sign-in is not enabled in Firebase.';
  return 'Something went wrong (' + code + '). Please try again.';
}

async function callFirebase(method, data) {
  const response = await fetch(BASE_URL + method + '?key=' + firebaseConfig.apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Step 1: ask Firebase to text a code to the phone number.
// phone is in international format, e.g. +923001234567
// recaptchaToken proves a real person pressed the button (see RecaptchaModal).
export async function sendOtp(phone, recaptchaToken) {
  try {
    const body = await callFirebase('sendVerificationCode', {
      phoneNumber: phone,
      recaptchaToken: recaptchaToken,
    });

    if (body.sessionInfo) {
      return { ok: true, session: body.sessionInfo };
    }
    return { ok: false, message: friendlyError(body.error && body.error.message) };
  } catch (error) {
    return { ok: false, message: 'No internet connection. Please check your network.' };
  }
}

// Step 2: send the code the user typed to Firebase and ask if it matches.
export async function verifyOtp(sessionInfo, code) {
  try {
    const body = await callFirebase('signInWithPhoneNumber', { sessionInfo, code });

    if (body.idToken) {
      return { ok: true, phoneNumber: body.phoneNumber };
    }
    const errorCode = body.error && body.error.message;
    return {
      ok: false,
      message: friendlyError(errorCode),
      // an expired session can never succeed, so the app stops asking
      isFinal: !!errorCode && errorCode.startsWith('SESSION_EXPIRED'),
    };
  } catch (error) {
    return { ok: false, message: 'No internet connection. Please check your network.' };
  }
}
