export default function redirectTo(res) {
  if (!window) return;

  window.location.href = res;
}
