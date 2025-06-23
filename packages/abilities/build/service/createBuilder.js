import _wrap from "lodash/wrap.js";
import _last from "lodash/last.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import abilityPkg from '@casl/ability';
const {
  AbilityBuilder
} = abilityPkg;
export default function createBuilder(entityName, identifier) {
  const builder = AbilityBuilder.extract();
  function defineWrapper(func) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    const result = func(...args);
    Object.assign(_last(this.rules), {
      entityName,
      identifier
    });
    return result;
  }
  builder.can = _wrap(builder.can.bind(builder), defineWrapper);
  builder.cannot = _wrap(builder.cannot.bind(builder), defineWrapper);
  return builder;
}
//# sourceMappingURL=createBuilder.js.map