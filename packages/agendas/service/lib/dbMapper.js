import VError from '@openagenda/verror';

const normalizeRule = (rule) =>
  (typeof rule === 'string' ? { db: rule, obj: rule } : rule);

export default (map) => {
  const toObj = (entry, ignoreParseError = true) =>
    map.reduce((acc, currentRule) => {
      const rule = normalizeRule(currentRule);

      const value = entry[rule.db];

      if (value === undefined) {
        return acc;
      }

      if (rule.type === 'json' && !value) {
        return acc;
      }

      try {
        acc[rule.obj] = rule.type === 'json' ? JSON.parse(value) : value;
      } catch (e) {
        if (ignoreParseError) {
          console.error(`Error in ${rule.db} field: %s`, entry[rule.db], e);
        } else {
          throw new VError(e, `In ${rule.db}, field ${entry[rule.db]}`);
        }
      }

      return acc;
    }, {});

  const toDb = (obj) =>
    map.reduce((acc, currentRule) => {
      const rule = normalizeRule(currentRule);

      const value = obj[rule.obj];

      if (value !== undefined) {
        acc[rule.db] = rule.type === 'json' ? JSON.stringify(value) : value;
      }

      return acc;
    }, {});

  const fields = (type = 'db', includeInternal = false, forceInclude = []) =>
    map
      .map((rule) => {
        if (typeof rule === 'string') {
          return rule;
        }
        // Si la règle n'est pas interne, on l'inclut
        if (rule.internal !== true) {
          return rule[type];
        }

        if (includeInternal || forceInclude.includes(rule[type])) {
          return rule[type];
        }
        return null;
      })
      .filter(Boolean);

  const is = (typeOrField, fieldOrName, name) => {
    const isShorthand = name === undefined;
    const type = isShorthand ? 'db' : typeOrField;
    const field = isShorthand ? typeOrField : fieldOrName;
    const propName = isShorthand ? fieldOrName : name;

    return map.some(
      (rule) =>
        typeof rule === 'object' && rule[type] === field && rule[propName],
    );
  };

  const exclude = (obj, typeOrKey, key) => {
    if (!obj) {
      return null;
    }

    const isShorthand = key === undefined;
    const type = isShorthand ? 'obj' : typeOrKey;
    const excludeKey = isShorthand ? typeOrKey : key;

    return map.reduce((acc, rule) => {
      if (typeof rule === 'string' || !rule[excludeKey]) {
        const fieldName = typeof rule === 'string' ? rule : rule[type];
        if (obj[fieldName] !== undefined) {
          acc[fieldName] = obj[fieldName];
        }
      }
      return acc;
    }, {});
  };

  return {
    toObj,
    toDb,
    fields,
    is,
    exclude,
  };
};
