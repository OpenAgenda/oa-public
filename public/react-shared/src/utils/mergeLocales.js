export default function mergeLocales(target, ...sources) {
  const output = { ...target };

  for (const source of sources) {
    Object.keys(source).forEach(key => {
      if (!(key in output)) {
        output[key] = source[key];
      } else {
        output[key] = Object.assign(output[key], source[key]);
      }
    });
  }

  return output;
}
