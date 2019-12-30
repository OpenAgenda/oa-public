import { useRef } from 'react';
import shallowEqual from 'shallowequal';

const useMemoOne = (compute, deps, equalityFn = shallowEqual) => {
  const isNew = useRef(true);
  const value = useRef(isNew.current ? compute() : null);
  const previousDeps = useRef(deps);

  isNew.current = false;

  if (!equalityFn(previousDeps.current, deps)) {
    previousDeps.current = deps;
    value.current = compute();
  }

  return value.current;
};

const useCallbackOne = (compute, deps, equalityFn) => useMemoOne(() => compute, deps, equalityFn);

export default useMemoOne;

export { useMemoOne, useCallbackOne };
