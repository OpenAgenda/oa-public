import getFormItemSlug from './getFormItemSlug';

export default function isSameFormItem(f1, f2) {
  return getFormItemSlug(f1) === getFormItemSlug(f2);
}
