import React from 'react';

export default function useIsFirstRender() {
  const renderRef = React.useRef(true);

  if (renderRef.current === true) {
    renderRef.current = false;
    return true;
  }

  return renderRef.current;
}
