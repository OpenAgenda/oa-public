import adminLevelSwap from './adminLevelSwap.js';

function extractFieldName(sortDef) {
  if (typeof sortDef === 'string') {
    return sortDef === '_score' ? 'score' : sortDef;
  }

  const fieldName = Object.keys(sortDef)[0];

  const fieldMap = {
    '_sort_timings.begin': 'timings',
    _search_last_timing: 'lastTiming',
    _score: 'score',
  };

  return fieldMap[fieldName] || fieldName;
}

function isTimingsField(fieldName) {
  return fieldName === 'timings';
}

function isLastTimingField(fieldName) {
  return fieldName === 'lastTiming';
}

function isLocationField(fieldName) {
  return fieldName.startsWith('location.');
}

function isFeaturedField(fieldName) {
  return fieldName === 'featured';
}

function isDateField(fieldName) {
  return ['timings', 'lastTiming', 'firstTiming'].includes(fieldName);
}

function formatDateValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === 'number'
    || (typeof value === 'string' && !Number.isNaN(Number(value)))
  ) {
    const numValue = Number(value);
    if (numValue < 0) {
      return null;
    }
    const date = new Date(numValue);
    return date.toISOString();
  }

  return value;
}

function processTimingsField(value) {
  const relativeValue = value === null || value === undefined ? 'passed' : 'upcoming';

  return {
    key: 'relative',
    value: relativeValue,
  };
}

function processLastTimingField(value) {
  return {
    key: 'lastTiming',
    value: formatDateValue(value),
  };
}

function processLocationField(fieldName, value) {
  const userFacingFieldName = adminLevelSwap.reverse(fieldName);

  return {
    key: userFacingFieldName,
    value,
  };
}

function processFeaturedField(value) {
  return {
    key: 'featured',
    value: value === 1 || value === true,
  };
}

function processScoreField(value) {
  const result = {
    key: 'search',
    value,
  };

  return result;
}

function processGenericField(fieldName, value) {
  const formattedValue = isDateField(fieldName)
    ? formatDateValue(value)
    : value;

  return {
    key: fieldName,
    value: formattedValue,
  };
}

function isScoreField(fieldName) {
  return fieldName === 'score';
}

export default function handleSort(DSL, sortValues) {
  const DslSort = typeof DSL === 'object' && DSL.sort ? DSL.sort : DSL;

  if (!DslSort || !sortValues) {
    return [];
  }

  return sortValues
    .map((value, index) => {
      const sortDef = DslSort[index];
      const fieldName = extractFieldName(sortDef);

      if (isTimingsField(fieldName)) {
        return processTimingsField(value);
      }

      if (isLastTimingField(fieldName)) {
        return processLastTimingField(value);
      }

      if (isLocationField(fieldName)) {
        return processLocationField(fieldName, value);
      }

      if (isFeaturedField(fieldName)) {
        return processFeaturedField(value);
      }

      if (isScoreField(fieldName)) {
        return processScoreField(value);
      }

      return processGenericField(fieldName, value);
    })
    .filter((item) => item.key !== 'uid');
}
