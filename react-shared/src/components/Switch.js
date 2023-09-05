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

export default function Switch({ test, children }) {
  return children.find(child => child.props.value === test);
}

Switch.Case = Case;

export { default as Case } from './Case';
