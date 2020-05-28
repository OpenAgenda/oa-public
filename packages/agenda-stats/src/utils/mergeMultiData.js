export default function mergeMultiData(data, fromDataKey, dataKey) {
  const requiredPart = {};
  let result = [];

  for (let i = 0; i < fromDataKey.length; i++) {
    const tempData = data[i];
    const beforeKey = fromDataKey[i];
    const afterKey = dataKey[i];

    requiredPart[afterKey] = 0;

    if (!tempData || !afterKey) {
      // Missing key in `dataKey`
      continue;
    }

    result = tempData.reduce((res, next) => {
      const foundIndex = res.findIndex(v => v.key === next.key);

      if (foundIndex !== -1) {
        return [
          ...res.slice(0, foundIndex - 1),
          {
            ...res[foundIndex],
            [afterKey]: next[beforeKey]
          },
          ...res.slice(foundIndex)
        ];
      }

      const { [beforeKey]: value, ...nextRest } = next;

      return [
        ...res,
        {
          ...nextRest,
          [afterKey]: value
        }
      ];
    }, result);
  }

  result = result.map(v => ({ ...requiredPart, ...v }));

  return result;
}
