import React, { useMemo } from 'react';
import * as ReactIs from 'react-is';
import { LayoutDataContext } from '@openagenda/react-shared';

function getChild(children, props) {
  return ReactIs.isValidElementType(children)
    ? React.createElement(children, props)
    : children;
}

export default function ChildLayouts({
  layouts,
  children,
  extraProps,
  fallback,
  ...newExtraProps
}) {
  const props = useMemo(
    () => ({
      extraProps: { ...extraProps, ...newExtraProps },
      fallback,
    }),
    [extraProps, fallback, newExtraProps],
  );

  // has child layout
  if (layouts?.[0] && ReactIs.isValidElementType(layouts[0])) {
    return React.createElement(
      layouts[0],
      {
        ...props,
        childLayouts: layouts.slice(1),
      },
      children,
    );
  }

  return (
    <LayoutDataContext.Provider value={props.extraProps}>
      {getChild(children, props)}
    </LayoutDataContext.Provider>
  );
}
