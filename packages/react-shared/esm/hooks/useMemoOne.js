import { useState, useRef, useEffect } from 'react';
import shallowEqual from 'shallowequal';

function useMemoOne(getResult, inputs) {
  var equalityFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : shallowEqual;
  // using useState to generate initial value as it is lazy
  var initial = useState(function () {
    return {
      inputs: inputs,
      result: getResult()
    };
  })[0];
  var committed = useRef(initial); // persist any uncommitted changes after they have been committed

  var isInputMatch = Boolean(inputs && committed.current.inputs && equalityFn(inputs, committed.current.inputs));
  var cache = isInputMatch ? committed.current : {
    inputs: inputs,
    result: getResult()
  }; // commit the cache

  useEffect(function () {
    committed.current = cache;
  }, [cache]);
  return cache.result;
}

export default useMemoOne;
//# sourceMappingURL=useMemoOne.js.map