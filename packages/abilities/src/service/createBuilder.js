import _ from 'lodash';
import { AbilityBuilder } from '@casl/ability';

export default function createBuilder(entityName, identifier) {
  const builder = AbilityBuilder.extract();

  function defineWrapper(func, ...args) {
    const result = func(...args);

    Object.assign(_.last(this.rules), {
      entityName,
      identifier
    });

    return result;
  }

  builder.can = _.wrap(builder.can.bind(builder), defineWrapper);
  builder.cannot = _.wrap(builder.cannot.bind(builder), defineWrapper);

  return builder;
}
