import getFormItemSlug from './getFormItemSlug';

export default function isSameFOrmItem(f1, f2) {
  return getFormItemSlug(f1) === getFormItemSlug(f2);
}
