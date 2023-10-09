export default function mergeSpreadRegistrationValues(spreadValues = {}) {
  return (spreadValues.standard ?? []).concat(spreadValues.passCulture ? {
    type: 'link',
    value: null,
    service: 'passCulture',
    data: spreadValues.passCulture,
  } : []).reduce((deduped, item) => (
    deduped.find(d => d.value === item.value) ? deduped : deduped.concat(item)
  ), []);
}
