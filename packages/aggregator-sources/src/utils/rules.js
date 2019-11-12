export function ruleToValues(rule) {
  if (!rule) {
    return {};
  }

  if (rule.query.location) {
    const key = Object.keys(rule.query.location)[0];

    return {
      type: 'location',
      subdivision: key,
      values: rule.query.location[key]
    };
  }

  if (rule.query.tags) {
    return {
      type: 'tags',
      values: rule.query.tags
    };
  }

  return {};
}

export function valuesToRule(values) {
  const query = values.type === 'location'
    ? {
      location: {
        [values.subdivision]: values.values
      }
    }
    : {
      tags: values.values
    };

  return { query };
}
