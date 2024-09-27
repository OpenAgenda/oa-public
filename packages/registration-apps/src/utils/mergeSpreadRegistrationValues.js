export default function mergeSpreadRegistrationValues(spreadValues = {}) {
  return (spreadValues.standard ?? [])
    .concat(
      spreadValues.passCulture
        ? {
          type: 'link',
          value:
              spreadValues.OGValue?.find((i) => i.service === 'passCulture')
                ?.value || null,
          service: 'passCulture',
          data: spreadValues.passCulture,
          lastProcessedAt:
              spreadValues.OGValue?.find((i) => i.service === 'passCulture')
                ?.lastProcessedAt || null,
        }
        : [],
    )
    .reduce(
      (deduped, item) =>
        (deduped.find((d) => d.value === item.value)
          ? deduped
          : deduped.concat(item)),
      [],
    );
}
