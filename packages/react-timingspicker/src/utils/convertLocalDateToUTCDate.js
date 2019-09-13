export default function convertLocalDateToUTCDate(date) {
  // return new Date( date.getTime() - date.getTimezoneOffset() * 60 * 1000 );

  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}
