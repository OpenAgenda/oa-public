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
  ...newExtraProps
}) {
  return layouts?.[0] && ReactIs.isValidElementType(layouts[0])
    ? React.createElement(
      layouts[0],
      {
        extraProps: { ...extraProps, ...newExtraProps },
        childLayouts: layouts.slice(1)
      },
      children
    )
    : getChild(children, { extraProps: { ...extraProps, ...newExtraProps } });
}
