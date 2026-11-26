// The props that place a block in its parent (margins, size, flex and grid
// placement, visibility): a control with a description takes them on the
// block around the control and the description, not on the control alone
const LAYOUT_PROP = /^(m|mt|mr|mb|ml|mx|my|ms|me|margin.*|w|width|minW|maxW|minWidth|maxWidth|flex|flexGrow|flexShrink|flexBasis|alignSelf|justifySelf|order|gridArea|gridColumn|gridRow|hidden|hideFrom|hideBelow)$/;

export function splitLayoutProps<P extends object>(
  props: P,
): [Record<string, unknown>, P] {
  const layout: Record<string, unknown> = {};
  const others: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => {
    (LAYOUT_PROP.test(key) ? layout : others)[key] = value;
  });
  return [layout, others as P];
}
