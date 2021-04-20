import _findInstanceProperty from "@babel/runtime-corejs3/core-js/instance/find";
import Case from './Case';
/*
 * <Switch test={someTest}>
 *   <Case value={1}>
 *     Value 1
 *   </Case>
 *   <Case value={2}>
 *     Value 2
 *   </Case>
 * </Switch>
 * */

export default function Switch(_ref) {
  var test = _ref.test,
      children = _ref.children;
  return _findInstanceProperty(children).call(children, function (child) {
    return child.props.value === test;
  });
}
Switch.Case = Case;
export { default as Case } from './Case';
//# sourceMappingURL=Switch.js.map