import React from 'react';
import * as ReactIs from 'react-is';
import useMemoOne from './useMemoOne';

function getChild(children, props) {
  return ReactIs.isValidElementType(children)
    ? React.createElement(children, props)
    : children;
}

export default function useChildLayouts(children, props, childLayouts) {
  const [firstChildLayout, otherChildLayouts] = useMemoOne(
    () => [
      childLayouts && childLayouts[0],
      childLayouts && childLayouts.slice(1)
    ],
    [childLayouts]
  );

  return useMemoOne(
    () => (ReactIs.isValidElementType(firstChildLayout)
      ? React.createElement(
        firstChildLayout,
        { ...props, childLayouts: otherChildLayouts },
        children
      )
      : getChild(children, props)),
    [children, props, firstChildLayout, otherChildLayouts]
  );
}
