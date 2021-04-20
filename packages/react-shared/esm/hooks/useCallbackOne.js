import useMemoOne from './useMemoOne';
export default function useCallbackOne(compute, deps, equalityFn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemoOne(function () {
    return compute;
  }, deps, equalityFn);
}
//# sourceMappingURL=useCallbackOne.js.map