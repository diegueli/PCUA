/** Formatea número a $1.000.000 CLP */
export function formatCLP(amount) {
  const num = Math.abs(parseInt(amount) || 0);
  const str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${str}`;
}

/** Formatea con signo: +$70.000 / -$30.000 */
export function formatCLPSigned(amount) {
  const num = parseInt(amount) || 0;
  const abs = Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (num > 0) return `+$${abs}`;
  if (num < 0) return `-$${abs}`;
  return `$${abs}`;
}

/** Parsea "$100.000" → 100000 */
export function parseCLP(str) {
  if (!str && str !== 0) return 0;
  return parseInt(str.toString().replace(/[$.]/g, '')) || 0;
}

/** Valida que el string sea un número válido para input */
export function isValidAmount(str) {
  if (!str || str === '') return true;
  return /^\d+$/.test(str.replace(/\./g, ''));
}
