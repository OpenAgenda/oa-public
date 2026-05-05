import { chakra } from '@openagenda/uikit';

export default function wrapFilter(Filter: React.FC<any>) {
  // forwardedFilter prop -> filter prop
  function WrappedFilter({ ref, forwardedFilter, ...props }) {
    return <Filter ref={ref} filter={forwardedFilter} {...props} />;
  }
  return chakra(WrappedFilter);
}
