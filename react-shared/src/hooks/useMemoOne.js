import { useState, useRef, useEffect } from 'react';
import shallowEqual from 'shallowequal';

function useMemoOne(getResult, inputs, equalityFn = shallowEqual) {
  // using useState to generate initial value as it is lazy
  const initial = useState(() => ({
    inputs,
    result: getResult(),
  }))[0];

  const committed = useRef(initial);

  // persist any uncommitted changes after they have been committed
  const isInputMatch = Boolean(
    inputs
      && committed.current.inputs
      && equalityFn(inputs, committed.current.inputs)
  );
  const cache = isInputMatch
    ? committed.current
    : {
      inputs,
      result: getResult(),
    };

  // commit the cache
  useEffect(() => {
    committed.current = cache;
  }, [cache]);

  return cache.result;
}

export default useMemoOne;
