// Relevance score threshold for syntactic search (the `threshold` query param).
//
// Accepts one of:
//   'off'      no score filtering (default behaviour)
//   'auto'     dynamic elbow cutoff, computed from a probe of the top scores
//   <number>   a non-negative value applied directly as an ES `min_score` floor
//
// Numeric strings ("20") are coerced to numbers. A boolean-false / "false" form
// is normalised to 'off' — YAML 1.1 tooling can mis-parse the spec's `off`
// bareword as boolean false, so a generated client may send it. Anything else is
// rejected.
export default function thresholdValidator(config = {}) {
  const optional = config.optional !== undefined ? config.optional : true;

  const validator = (value) => {
    if (value === undefined || value === null || value === '') {
      if (!optional) {
        throw new Error('threshold is required');
      }
      return undefined;
    }

    if (value === 'off' || value === 'false' || value === false) {
      return 'off';
    }

    if (value === 'auto') {
      return 'auto';
    }

    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(num) && num >= 0) {
      return num;
    }

    throw new Error(
      `threshold must be "off", "auto", or a non-negative number. Received: ${JSON.stringify(value)}`,
    );
  };

  return Object.assign(validator, {
    type: 'threshold',
    field: config.field,
  });
}
