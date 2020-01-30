import { useRef } from 'react';
import shallowEqual from 'shallowequal';

function useMemoOne(compute, deps, equalityFn = shallowEqual) {
  const value = useRef(null);
  const previousDeps = useRef(null);

  if (
    !Array.isArray(previousDeps.current)
    || !equalityFn(previousDeps.current, deps)
  ) {
    previousDeps.current = deps;
    value.current = compute();
  }

  return value.current;
}

// eslint-disable-next-line react-hooks/exhaustive-deps
const useCallbackOne = (compute, deps, equalityFn) => useMemoOne(() => compute, [compute], equalityFn);

export default useMemoOne;

export { useMemoOne, useCallbackOne };
