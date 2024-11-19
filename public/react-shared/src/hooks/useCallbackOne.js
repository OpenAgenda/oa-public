import useMemoOne from './useMemoOne.js';

export default function useCallbackOne(compute, deps, equalityFn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemoOne(() => compute, deps, equalityFn);
}
