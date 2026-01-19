export default function getLanguages(event) {
  return Object.keys(event?.title ?? {});
}
