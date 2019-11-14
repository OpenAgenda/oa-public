import { useRef } from 'react';
import shallowEqual from 'shallowequal';

const useMemoOne = (compute, deps, equalityFn = shallowEqual) => {
  const value = useRef(compute);
  const previousDeps = useRef(deps);

  if (!equalityFn(previousDeps, deps)) {
    previousDeps.current = deps;
    value.current = compute();
  }

  return value.current;
};

const useCallbackOne = (compute, deps, equalityFn) => useMemoOne(() => compute, deps, equalityFn);

export default useMemoOne;

export { useMemoOne, useCallbackOne };
