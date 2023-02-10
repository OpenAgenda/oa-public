import { useRef } from 'react';
import {
  chakra,
  Box,
  FocusLock,
  RemoveScroll,
  useOutsideClick,
  useToken,
  useMediaQuery,
  useModal,
  ModalProps,
  ThemingProps,
  ThemeTypings,
  HTMLChakraProps,
} from '@openagenda/uikit';

interface FocusableElement {
  focus(options?: FocusOptions): void;
}

interface DrawerProps
  extends HTMLChakraProps<'div'>,
    Omit<
      ModalProps,
      'scrollBehavior' | 'motionPreset' | 'isCentered' | keyof ThemingProps
    > {
  // Pick<FocusLockProps, 'lockFocusAcrossFrames'>
  children: React.ReactNode;
  // isOpen?: boolean;
  // onClose?: () => void;
  breakpoint?: ThemeTypings['breakpoints'];

  /**
   * The props to forward to the modal's content wrapper
   */
  containerProps?: HTMLChakraProps<'div'>;

  // FocusLock
  /**
   * If `false`, focus lock will be disabled completely.
   *
   * This is useful in situations where you still need to interact with
   * other surrounding elements.
   *
   * 🚨Warning: We don't recommend doing this because it hurts the
   * accessibility of the modal, based on WAI-ARIA specifications.
   *
   * @default true
   */
  trapFocus?: boolean;
  /**
   * If `true`, the modal will autofocus the first enabled and interactive
   * element within the `ModalContent`
   *
   * @default true
   */
  autoFocus?: boolean;
  /**
   * The `ref` of element to receive focus when the modal opens.
   */
  initialFocusRef?: React.RefObject<FocusableElement>;
  /**
   * The `ref` of element to receive focus when the modal closes.
   */
  finalFocusRef?: React.RefObject<FocusableElement>;
  /**
   * If `true`, the modal will return focus to the element that triggered it when it closes.
   * @default true
   */
  returnFocusOnClose?: boolean;
  /**
   * If `true`, scrolling will be disabled on the `body` when the modal opens.
   * @default true
   */
  blockScrollOnMount?: boolean;
  /**
   * Handle zoom/pinch gestures on iOS devices when scroll locking is enabled.
   * @default false.
   */
  allowPinchZoom?: boolean;
  /**
   * If `true`, a `padding-right` will be applied to the body element
   * that's equal to the width of the scrollbar.
   *
   * This can help prevent some unpleasant flickering effect
   * and content adjustment when the modal opens
   *
   * @default false
   */
  preserveScrollBarGap?: boolean;
}

export default function Drawer(props: DrawerProps) {
  const drawerProps: DrawerProps = {
    isOpen: false,
    breakpoint: 'lg',
    // FocusLock
    trapFocus: true,
    autoFocus: true,
    returnFocusOnClose: true,
    lockFocusAcrossFrames: true,
    // RemoveScroll
    blockScrollOnMount: true,
    allowPinchZoom: false,
    preserveScrollBarGap: false,
    ...props,
  };

  const {
    children,
    isOpen,
    onClose,
    breakpoint,
    containerProps: rootProps,
    // FocusLock
    trapFocus,
    autoFocus,
    initialFocusRef,
    finalFocusRef,
    returnFocusOnClose,
    lockFocusAcrossFrames,
    // RemoveScroll
    blockScrollOnMount,
    allowPinchZoom,
    preserveScrollBarGap,
    ...rest
  } = drawerProps;

  const ref = useRef(null);

  const { getDialogProps, getDialogContainerProps } = useModal(drawerProps);

  const dialogProps = getDialogProps(rest, ref) as any;
  const containerProps = getDialogContainerProps(rootProps);

  useOutsideClick({
    ref,
    handler: () => {
      if (isOpen) onClose?.();
    },
  });

  // const isSmall = useBreakpointValue({ base: true, [breakpoint]: false });

  // useBreakpointValue is broke (https://github.com/chakra-ui/chakra-ui/issues/7316)
  const [breakpointValue] = useToken('breakpoints', [breakpoint]);
  const [isSmall] = useMediaQuery(`(max-width: ${breakpointValue})`, {
    ssr: true,
    fallback: false, // return false on the server, and re-evaluate on the client side
  });

  return (
    <FocusLock
      autoFocus={autoFocus}
      isDisabled={!(isOpen && isSmall) || !trapFocus}
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalFocusRef}
      restoreFocus={returnFocusOnClose}
      contentRef={ref}
      lockFocusAcrossFrames={lockFocusAcrossFrames}
    >
      <RemoveScroll
        removeScrollBar={!preserveScrollBarGap}
        allowPinchZoom={allowPinchZoom}
        // TODO only block scroll for first dialog (require https://github.com/chakra-ui/chakra-ui/pull/7338)
        enabled={/* index === 1 && */ isOpen && isSmall && blockScrollOnMount}
        forwardProps
      >
        <chakra.div {...containerProps} tabIndex={-1}> {/* RemoveScroll allow only one child */}
          <Box // Overlay
            pos={{ base: 'fixed', [breakpoint]: 'relative' }}
            left="0"
            top="0"
            w={{ base: '100vw', [breakpoint]: 'full' }}
            h={{ base: '100vh', [breakpoint]: 'full' }}
            bg={{
              base: 'blackAlpha.600', // var(--chakra-colors-blackAlpha-600)
              [breakpoint]: 'initial',
            }}
            zIndex={{
              base: '1300', // var(--chakra-zIndices-overlay)
              [breakpoint]: 'initial',
            }}
            transform="auto"
            translateX={{
              base: isOpen ? '0' : '100%',
              [breakpoint]: '0',
            }}
            opacity={{
              base: isOpen ? 1 : 0,
              [breakpoint]: 1,
            }}
            transition={`opacity ${isOpen ? '.2s' : '.1s'}`}
          />

          <Box // Modal
            ref={ref}
            pos={{ base: 'fixed', [breakpoint]: 'relative' }}
            top={{ base: '0', [breakpoint]: 'initial' }}
            right={{ base: '0', [breakpoint]: 'initial' }}
            maxH={{ base: '100vh', [breakpoint]: 'initial' }}
            h={{ base: '100vh', [breakpoint]: 'initial' }}
            bg={{
              base: 'white', // var(--chakra-colors-blackAlpha-600)
              [breakpoint]: 'initial',
            }}
            zIndex={{
              base: '1400', // var(--chakra-zIndices-modal)
              [breakpoint]: 'initial',
            }}
            transform="auto"
            translateX={{
              base: isOpen ? '0' : '100%',
              [breakpoint]: '0',
            }}
            overflow="auto"
            transition={isSmall ? `transform ${isOpen ? '.4s ease-in-out' : '.15s ease'}` : undefined}
            {...dialogProps}
            {...rest}
          >
            {children}
          </Box>
        </chakra.div>
      </RemoveScroll>
    </FocusLock>
  );
}
