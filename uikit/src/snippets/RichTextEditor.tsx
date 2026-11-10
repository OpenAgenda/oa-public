'use client';

import type { BoxProps, IconButtonProps, StackProps } from '@chakra-ui/react';
import {
  Box,
  HStack,
  IconButton,
  StackSeparator,
  defineStyle,
} from '@chakra-ui/react';
import type { Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import * as React from 'react';
import { Tooltip } from './Tooltip';

// Adapted from Chakra's rich-text-editor composition (chakra snippet add
// rich-text-editor): the frame, the toolbar and its buttons, for the
// elements a text written for a page uses. The ready-to-use field is
// MarkdownEditor.

interface RichTextEditorContextValue {
  editor: Editor | null;
}

const RichTextEditorContext = React.createContext<RichTextEditorContextValue | null>(null);

export function useRichTextEditorContext() {
  const context = React.useContext(RichTextEditorContext);
  if (!context) {
    throw new Error(
      'useRichTextEditorContext must be used within a RichTextEditorRoot',
    );
  }
  return context;
}

const proseMirrorCss = defineStyle({
  display: 'flex',
  flexDirection: 'column',
  // As wide as its field, like an input
  width: 'full',
  borderWidth: 'thin',
  borderColor: 'border',
  rounded: 'l2',
  bg: 'bg',
  lineHeight: '1.5',

  _focusWithin: {
    borderColor: 'colorPalette.focusRing',
    outline: 'thin solid',
    outlineColor: 'colorPalette.focusRing',
  },
  '&[data-invalid]': {
    borderColor: 'border.error',
    outlineColor: 'border.error',
  },

  '& .ProseMirror': {
    outline: 'none',
    px: '3',
    py: '2',
    '& > * + *': { marginTop: '0.75em' },
    // Every element the editor keeps is visible as such, toolbar or not: a
    // quote or a heading typed by a shortcut must not look like a paragraph.
    // (Prose styles a text to read, muted and small; this one is being written.)
    '& h1, & h2, & h3, & h4, & h5, & h6': { fontWeight: 'semibold' },
    '& h1': { fontSize: '1.6em', lineHeight: '1.25' },
    '& h2': { fontSize: '1.4em', lineHeight: '1.3' },
    '& h3': { fontSize: '1.2em', lineHeight: '1.4' },
    '& h4': { fontSize: '1.1em', lineHeight: '1.5' },
    '& ul': { paddingInlineStart: '5', listStyleType: 'disc' },
    '& ol': { paddingInlineStart: '5', listStyleType: 'decimal' },
    '& blockquote': {
      borderInlineStartWidth: 'medium',
      borderColor: 'border',
      paddingInlineStart: '4',
      color: 'fg.muted',
    },
    '& code': {
      fontFamily: 'mono',
      fontSize: '0.9em',
      bg: 'bg.muted',
      rounded: 'l1',
      paddingInline: '1',
    },
    '& pre': {
      fontFamily: 'mono',
      bg: 'bg.muted',
      rounded: 'l2',
      p: '3',
      overflowX: 'auto',
      '& code': { bg: 'transparent', p: '0' },
    },
    '& hr': { borderColor: 'border', my: '4' },
    '& a': { color: 'colorPalette.fg', textDecoration: 'underline' },
    '& em': { fontStyle: 'italic' },
    '& strong': { fontWeight: 'bold' },
    '& p.is-editor-empty:first-of-type::before': {
      content: 'attr(data-placeholder)',
      color: 'fg.muted',
      pointerEvents: 'none',
      float: 'inline-start',
      height: '0',
    },
  },

  '&[data-disabled] .ProseMirror': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

export interface RichTextEditorRootProps extends BoxProps {
  editor: Editor | null;
  disabled?: boolean;
  invalid?: boolean;
}

export const RichTextEditorRoot = React.forwardRef<
  HTMLDivElement,
  RichTextEditorRootProps
>(function RichTextEditorRoot(props, ref) {
  const { editor, children, css, disabled, invalid, ...rest } = props;
  const contextValue = React.useMemo(() => ({ editor }), [editor]);
  return (
    <RichTextEditorContext.Provider value={contextValue}>
      <Box
        ref={ref}
        colorPalette="primary"
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        css={[proseMirrorCss, css]}
        {...rest}
      >
        {children}
      </Box>
    </RichTextEditorContext.Provider>
  );
});

// The toolbar is one stop in the tab order: the arrow keys, Home and End move
// between its buttons (WAI-ARIA toolbar pattern), and Tab goes past it
function toolbarButtons(toolbar: HTMLElement) {
  return [
    ...toolbar.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
  ];
}

function setTabStop(toolbar: HTMLElement, current: HTMLElement | undefined) {
  toolbarButtons(toolbar).forEach((button) => {
    button.tabIndex = button === current ? 0 : -1;
  });
}

export const RichTextEditorToolbar = React.forwardRef<
  HTMLDivElement,
  StackProps
>(function RichTextEditorToolbar(props, ref) {
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  // After each render (a button may have been added, removed or disabled),
  // exactly one button is in the tab order: the last one used, else the first
  React.useEffect(() => {
    const toolbar = innerRef.current;
    if (!toolbar) return;
    const buttons = toolbarButtons(toolbar);
    setTabStop(
      toolbar,
      buttons.find((button) => button.tabIndex === 0) ?? buttons[0],
    );
  });

  return (
    <HStack
      ref={setRef}
      role="toolbar"
      // A click on a button keeps the focus, and the selection, in the text
      onMouseDown={(event) => {
        if ((event.target as Element).closest('button')) event.preventDefault();
      }}
      onFocus={(event) => {
        const toolbar = innerRef.current;
        // Focus inside the link popover bubbles here through its portal:
        // only the toolbar's own buttons take the tab stop
        if (
          toolbar
          && event.target instanceof HTMLButtonElement
          && toolbar.contains(event.target)
        ) {
          setTabStop(toolbar, event.target);
        }
      }}
      onKeyDown={(event) => {
        const toolbar = innerRef.current;
        if (!toolbar) return;
        const buttons = toolbarButtons(toolbar);
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index === -1) return;
        const next = {
          ArrowRight: buttons[(index + 1) % buttons.length],
          ArrowLeft: buttons[(index - 1 + buttons.length) % buttons.length],
          Home: buttons[0],
          End: buttons[buttons.length - 1],
        }[event.key];
        if (!next) return;
        event.preventDefault();
        next.focus();
      }}
      flexWrap="wrap"
      gap="1"
      px="2"
      py="1"
      borderBottomWidth="thin"
      borderColor="border"
      separator={<StackSeparator h="5" alignSelf="center" />}
      {...props}
    />
  );
});

export const RichTextEditorControlGroup = React.forwardRef<
  HTMLDivElement,
  StackProps
>(function RichTextEditorControlGroup(props, ref) {
  return <HStack ref={ref} gap="1" {...props} />;
});

export const RichTextEditorContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof EditorContent>, 'editor'>
>(function RichTextEditorContent(props, ref) {
  const { editor } = useRichTextEditorContext();
  if (!editor) return null;
  return <EditorContent editor={editor} {...props} innerRef={ref} />;
});

export interface RichTextEditorButtonProps
  extends Omit<IconButtonProps, 'aria-label'> {
  label: string;
  active?: boolean;
}

// A toolbar button: its label is the tooltip and the accessible name, and
// `active` says whether the format applies to the selection
export const RichTextEditorButton = React.forwardRef<
  HTMLButtonElement,
  RichTextEditorButtonProps
>(function RichTextEditorButton(props, ref) {
  const { label, active, ...rest } = props;
  return (
    <Tooltip content={label}>
      <IconButton
        ref={ref}
        size="xs"
        aria-label={label}
        aria-pressed={active}
        variant={active ? 'subtle' : 'ghost'}
        {...rest}
      />
    </Tooltip>
  );
});
