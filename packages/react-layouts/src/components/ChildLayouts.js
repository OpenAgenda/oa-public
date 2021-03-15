import React from 'react';
import * as ReactIs from 'react-is';

function getChild(children, props) {
  return ReactIs.isValidElementType(children)
    ? React.createElement(children, props)
    : children;
}

export default function ChildLayouts({
  layouts,
  children,
  extraProps,
  onError,
  FallbackComponent,
  ...newExtraProps
}) {
  const props = {
    extraProps: { ...extraProps, ...newExtraProps },
    onError,
    FallbackComponent,
  };

  return layouts?.[0] && ReactIs.isValidElementType(layouts[0])
    ? React.createElement(
      layouts[0],
      {
        ...props,
        childLayouts: layouts.slice(1),
      },
      children
    )
    : getChild(children, props);
}
