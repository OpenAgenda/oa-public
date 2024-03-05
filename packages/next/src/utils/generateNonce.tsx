export default function generateNonce(): string {
  return `${Math.ceil(Math.random() * 10 ** 16)}`;
}
