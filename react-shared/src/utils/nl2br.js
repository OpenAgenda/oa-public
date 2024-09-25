const newlineRegex = /(\r\n|\r|\n)/g;

export default function nl2br(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return str.split(newlineRegex).map((line, key) =>
    (key % 2 === 1 ? (
      <br key={key} /> // eslint-disable-line react/no-array-index-key
    )
      : line
    ));
}
