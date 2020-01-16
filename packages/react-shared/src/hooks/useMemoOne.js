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

const useCallbackOne = (compute, deps, equalityFn) => useMemoOne(() => compute, deps, equalityFn);

export default useMemoOne;

export { useMemoOne, useCallbackOne };
