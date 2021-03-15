export default function getWeekOfMonth(date) {
  return Math.ceil(date.getDate() / 7);
}
