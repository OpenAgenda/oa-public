/*
 * ChakraProvider without ColorModeProvider
 * from https://github.com/chakra-ui/chakra-ui/blob/v2/packages/components/src/provider/provider.tsx
 */

import {
  CSSReset,
  CSSPolyfill,
  PortalManager,
  GlobalStyle,
  ThemeProvider,
  ThemeProviderProps,
  EnvironmentProvider,
  EnvironmentProviderProps,
} from '@chakra-ui/react';
import type { Dict } from '@chakra-ui/utils';

export interface ChakraProviderProps
  extends Pick<ThemeProviderProps, 'cssVarsRoot'> {
  /**
   * a theme. if omitted, uses the default theme provided by chakra
   */
  theme?: Dict
  /**
   * Common z-index to use for `Portal`
   *
   * @default undefined
   */
  portalZIndex?: number;
  /**
   * If `true`, `CSSReset` component will be mounted to help
   * you reset browser styles
   *
   * @default true
   */
  resetCSS?: boolean;
  /**
   * Your application content
   */
  children?: React.ReactNode;
  /**
   * The environment (`window` and `document`) to be used by
   * all components and hooks.
   *
   * By default, we smartly determine the ownerDocument and defaultView
   * based on where `ChakraProvider` is rendered.
   */
  environment?: EnvironmentProviderProps['environment'];
  /**
   * Disabled the use of automatic window and document detection.
   * This removed the injected `<span/>` element
   */
  disableEnvironment?: boolean;
}

/**
 * The global provider that must be added to make all Chakra components
 * work correctly
 */
export const ChakraProvider: React.FC<ChakraProviderProps> = props => {
  const {
    children,
    portalZIndex,
    resetCSS = true,
    theme = {},
    environment,
    cssVarsRoot,
    disableEnvironment,
  } = props;

  const _children = (
    <EnvironmentProvider
      environment={environment}
      disabled={disableEnvironment}
    >
      {children}
    </EnvironmentProvider>
  );

  return (
    <ThemeProvider theme={theme} cssVarsRoot={cssVarsRoot}>
      {resetCSS ? <CSSReset /> : <CSSPolyfill />}
      <GlobalStyle />
      {portalZIndex ? (
        <PortalManager zIndex={portalZIndex}>{_children}</PortalManager>
      ) : _children}
    </ThemeProvider>
  );
};
