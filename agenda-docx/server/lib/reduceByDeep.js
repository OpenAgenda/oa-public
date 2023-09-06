'use strict';

const reduceBy = require('./reduceBy');
const sortBy = require('./sortBy');

function reduceByDeep(items, deepReduceByOptions = []) {
  const reduceByOptions = deepReduceByOptions[0];

  const remainingOptions = deepReduceByOptions.slice(1);

  if (reduceByOptions.childrenKey && !reduceByOptions.key) {
    let result = remainingOptions.length
      ? reduceByDeep(items, remainingOptions)
      : items;

    // Sort first level
    if (reduceByOptions.sortChildrenBy) {
      result = sortBy(result, reduceByOptions.sortChildrenBy);
    }

    return {
      [reduceByOptions.childrenKey]: result,
    };
  }

  const reducedItems = reduceBy(items, reduceByOptions.key, reduceByOptions);

  if (!remainingOptions.length) {
    return reducedItems;
  }

  return reducedItems.map(item => {
    item[reduceByOptions.childrenKey] = reduceByDeep(
      item[reduceByOptions.childrenKey],
      remainingOptions
    );

    return item;
  });
}

module.exports = reduceByDeep;
