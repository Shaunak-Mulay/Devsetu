export function isValidPin(pin) {
  return /^\d{6}$/.test(pin);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}
