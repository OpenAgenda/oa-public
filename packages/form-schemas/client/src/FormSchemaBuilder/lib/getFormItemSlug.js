export default function getFormItemSlug(item) {
  return item.slug ?? item.field;
}
