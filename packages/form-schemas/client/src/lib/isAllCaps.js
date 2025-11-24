export default function isAllCaps(text) {
  if (!text || typeof text !== 'string') return false;
  const letters = text.match(/[a-zA-Z]/g);
  if (!letters || letters.length === 0) return false;
  return text === text.toUpperCase();
}
