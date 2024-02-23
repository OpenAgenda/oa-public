export function combineDateTime(date, time) {
  const combined = new Date(date.getTime());
  const [hours, minutes] = time.split(':').map(Number);
  combined.setHours(hours, minutes, 0, 0);

  return combined;
}

export function extractDateAndTime(dateTime) {
  const date = [
    dateTime.getFullYear(),
    `0${dateTime.getMonth() + 1}`.slice(-2),
    `0${dateTime.getDate()}`.slice(-2),
  ].join('-');

  const time = [
    `0${dateTime.getHours()}`.slice(-2),
    `0${dateTime.getMinutes()}`.slice(-2),
  ].join(':');
  return { date, time };
}
