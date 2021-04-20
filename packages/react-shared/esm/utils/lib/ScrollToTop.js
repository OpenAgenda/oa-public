import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
var defaultLocation = {}; // https://usehooks.com/usePrevious

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  var ref = useRef(defaultLocation); // Store current value in ref

  useEffect(function () {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)

  return ref.current;
}

export default function ScrollToTop(_ref) {
  var children = _ref.children;
  var location = useLocation();
  var prevLocation = usePrevious(location);
  useEffect(function () {
    if (location.pathname !== prevLocation.pathname) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, prevLocation.pathname]);
  return children || null;
}
//# sourceMappingURL=ScrollToTop.js.map