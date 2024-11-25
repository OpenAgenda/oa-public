import _ from 'lodash';

export default function setInStore(key, getter = key) {
  return async (context) => {
    const value = typeof getter === 'function'
      ? await getter(context)
      : _.get(context, getter);

    context.data.store = _.merge(
      {},
      context.params.before.store,
      context.data.store,
      _.set({}, key, value),
    );
  };
}
