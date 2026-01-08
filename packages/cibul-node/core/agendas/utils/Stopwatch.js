export default function Stopwatch() {
  let now = new Date();
  return () => {
    const ms = new Date().getTime() - now.getTime();
    now = new Date();
    return ms;
  };
}
