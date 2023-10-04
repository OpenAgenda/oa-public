export default function getRegistrationItemAttributes(item) {
  return [{
    type: 'email',
    icon: 'fa fa-envelope',
  }, {
    type: 'link',
    icon: 'fa fa-link',
  }, {
    type: 'phone',
    icon: 'fa fa-phone',
  }].find(a => a.type === item.type) || {
    type: 'error',
    icon: 'fa fa-exclamation-circle',
  };
}
