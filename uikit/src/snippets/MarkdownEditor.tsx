'use client';

import type { BoxProps } from '@chakra-ui/react';
import {
  Button,
  Field as ChakraField,
  HStack,
  IconButton,
  Input,
  useFieldContext,
} from '@chakra-ui/react';
import { ListItem, ListKeymap } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import type { Editor, KeyboardShortcutCommand } from '@tiptap/react';
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import {
  LuBold,
  LuHeading2,
  LuHeading3,
  LuItalic,
  LuLink,
  LuList,
} from 'react-icons/lu';
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from './Popover';
import {
  RichTextEditorButton,
  RichTextEditorContent,
  RichTextEditorControlGroup,
  RichTextEditorRoot,
  RichTextEditorToolbar,
} from './RichTextEditor';
import { Tooltip } from './Tooltip';

export interface MarkdownEditorLabels {
  toolbar: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  bulletList: string;
  link: string;
  linkUrl: string;
  linkApply: string;
  linkRemove: string;
}

// uikit has no translations: an app passes its own, these are the fallback
const DEFAULT_LABELS: MarkdownEditorLabels = {
  toolbar: 'Formatting',
  heading2: 'Heading',
  heading3: 'Subheading',
  bold: 'Bold',
  italic: 'Italic',
  bulletList: 'Bulleted list',
  link: 'Link',
  linkUrl: 'Web address',
  linkApply: 'Apply',
  linkRemove: 'Remove link',
};

// A link typed without its scheme goes to the web, as `example.com` means;
// a path, an anchor or another scheme is kept as typed
// A space, a parenthesis or an angle bracket left in the address would end
// the markdown link early: they are percent-encoded, nothing else is
function encodeForMarkdown(href: string) {
  return href.replace(
    /[\s()<>]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`,
  );
}

export function normalizeHref(value: string) {
  const href = encodeForMarkdown(value.trim());
  if (!href || /^(https?|mailto|tel|sms|ftp):/i.test(href)) return href;
  if (/^[/#?]/.test(href) && !href.startsWith('//')) return href;
  if (href.startsWith('//')) return `https:${href}`;
  return `https://${href}`;
}

// Tab and Shift+Tab move the focus out of the editor, as in any field, rather
// than indent a list item and change the text on the way (RGAA 12.9): the
// indentation goes to Mod+] and Mod+[
function withoutTab<T>(shortcuts: Record<string, T>) {
  const { Tab: _tab, 'Shift-Tab': _shiftTab, ...rest } = shortcuts;
  return rest;
}

const FieldListItem = ListItem.extend({
  addKeyboardShortcuts() {
    return {
      ...withoutTab(this.parent?.() ?? {}),
      'Mod-]': () => this.editor.commands.sinkListItem(this.name),
      'Mod-[': () => this.editor.commands.liftListItem(this.name),
    };
  },
});

const FieldListKeymap = ListKeymap.extend({
  addKeyboardShortcuts() {
    // `parent` is there at run time; ListKeymap's typings leave it out
    const { parent } = this as unknown as {
      parent?: () => Record<string, KeyboardShortcutCommand>;
    };
    return withoutTab(parent?.() ?? {});
  },
});

// Marks the link popover, portalled out of the editor, as part of it
const POPOVER_ATTR = 'data-markdown-editor-popover';

function LinkControl({
  editor,
  labels,
  disabled,
}: {
  editor: Editor;
  labels: MarkdownEditorLabels;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [href, setHref] = React.useState('');
  const refocusText = React.useRef(false);
  const escaped = React.useRef(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => e.isActive('link'),
  });

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    // React events bubble through portals: the form around the editor
    // must not be submitted along
    event.stopPropagation();
    const url = normalizeHref(href);
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!url) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      // Nothing selected: the address becomes the link's text, and what is
      // typed next is not part of the link
      chain
        .insertContent({
          type: 'text',
          text: url,
          marks: [{ type: 'link', attrs: { href: url } }],
        })
        .unsetMark('link')
        .run();
    } else {
      chain.setLink({ href: url }).run();
    }
    refocusText.current = true;
    setOpen(false);
  };

  return (
    <PopoverRoot
      open={open}
      onOpenChange={({ open: next }) => {
        if (next) setHref(editor.getAttributes('link').href ?? '');
        setOpen(next);
      }}
      positioning={{ placement: 'bottom-start' }}
      // Applied or removed, the link gives the focus back to the text, once
      // the popover has closed
      onExitComplete={() => {
        if (refocusText.current) editor.commands.focus();
        // The popover's own return to its trigger misses it, wrapped in its
        // tooltip: Escape gives the focus back to the button here
        else if (escaped.current) triggerRef.current?.focus();
        refocusText.current = false;
        escaped.current = false;
      }}
      onEscapeKeyDown={() => {
        escaped.current = true;
      }}
    >
      <Tooltip content={labels.link}>
        <PopoverTrigger asChild>
          <IconButton
            ref={triggerRef}
            size="xs"
            aria-label={labels.link}
            aria-pressed={active}
            variant={active ? 'subtle' : 'ghost'}
            disabled={disabled}
          >
            <LuLink />
          </IconButton>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent aria-label={labels.link} {...{ [POPOVER_ATTR]: '' }}>
        <PopoverBody>
          <form onSubmit={apply}>
            {/* A field of its own: the input must not take the editor's
                field id, help, invalid or required state */}
            <ChakraField.Root>
              <HStack gap="2">
                <Input
                  size="sm"
                  type="text"
                  inputMode="url"
                  aria-label={labels.linkUrl}
                  placeholder="https://"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                />
                <Button size="sm" type="submit" colorPalette="primary">
                  {labels.linkApply}
                </Button>
              </HStack>
            </ChakraField.Root>
            {active ? (
              <Button
                size="sm"
                variant="ghost"
                mt="2"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange('link')
                    .unsetLink()
                    .run();
                  refocusText.current = true;
                  setOpen(false);
                }}
              >
                {labels.linkRemove}
              </Button>
            ) : null}
          </form>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
}

function Toolbar({
  editor,
  labels,
  disabled,
  fieldLabelId,
}: {
  editor: Editor;
  labels: MarkdownEditorLabels;
  disabled?: boolean;
  fieldLabelId?: string;
}) {
  const nameId = React.useId();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      heading2: e.isActive('heading', { level: 2 }),
      heading3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      bulletList: e.isActive('bulletList'),
    }),
  });

  return (
    // Named after its field too: a page with several editors has several
    // toolbars, which the name tells apart
    <RichTextEditorToolbar
      aria-labelledby={fieldLabelId ? `${nameId} ${fieldLabelId}` : nameId}
    >
      <span id={nameId} hidden>
        {labels.toolbar}
      </span>
      <RichTextEditorControlGroup>
        <RichTextEditorButton
          label={labels.heading2}
          active={state.heading2}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <LuHeading2 />
        </RichTextEditorButton>
        <RichTextEditorButton
          label={labels.heading3}
          active={state.heading3}
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <LuHeading3 />
        </RichTextEditorButton>
      </RichTextEditorControlGroup>
      <RichTextEditorControlGroup>
        <RichTextEditorButton
          label={labels.bold}
          active={state.bold}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <LuBold />
        </RichTextEditorButton>
        <RichTextEditorButton
          label={labels.italic}
          active={state.italic}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <LuItalic />
        </RichTextEditorButton>
      </RichTextEditorControlGroup>
      <RichTextEditorControlGroup>
        <RichTextEditorButton
          label={labels.bulletList}
          active={state.bulletList}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <LuList />
        </RichTextEditorButton>
        <LinkControl editor={editor} labels={labels} disabled={disabled} />
      </RichTextEditorControlGroup>
    </RichTextEditorToolbar>
  );
}

export interface MarkdownEditorProps
  extends Omit<BoxProps, 'onChange' | 'defaultValue'> {
  // Markdown, controlled
  value?: string;
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  labels?: Partial<MarkdownEditorLabels>;
  // The height of the empty text area, a size token
  minContentHeight?: string;
}

// A text with headings, bold, italics, bulleted lists and links, read and
// written as markdown. Inside a Field it takes the field's label, help,
// invalid and disabled states.
export const MarkdownEditor = React.forwardRef<
  HTMLDivElement,
  MarkdownEditorProps
>(function MarkdownEditor(props, ref) {
  const {
    value,
    defaultValue,
    onChange,
    onBlur,
    placeholder,
    disabled: disabledProp,
    invalid: invalidProp,
    labels: labelsProp,
    minContentHeight = '24',
    css,
    // For the text area, with the field's own help
    'aria-describedby': ownDescribedBy,
    ...rest
  } = props;
  const field = useFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  // The markdown last sent out, so that a value coming back from the parent
  // does not reset the content (and the cursor) it came from
  const emitted = React.useRef(value ?? defaultValue ?? '');
  const onChangeRef = React.useRef(onChange);
  const onBlurRef = React.useRef(onBlur);
  const placeholderRef = React.useRef(placeholder ?? '');
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  });

  // Created once: new extension instances on each render would make the
  // editor reconfigure its view at every keystroke
  const extensions = React.useMemo(
    () => [
      StarterKit.configure({
        // The toolbar offers a few formats, but the other elements markdown
        // has stay parsed: an extension turned off drops its content, and a
        // text written elsewhere (a numbered list, a quote) would lose it.
        // Images have no extension here, on purpose: a message holds no
        // image, and one pasted or written in markdown is dropped. Tables
        // are not supported either.

        // Not markdown
        underline: false,
        // Without their Tab shortcut, below
        listItem: false,
        listKeymap: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
        },
      }),
      FieldListItem,
      FieldListKeymap,
      Markdown,
      // Read at each render of the placeholder, so it follows the prop
      Placeholder.configure({ placeholder: () => placeholderRef.current }),
    ],
    [],
  );

  // The editable element's ARIA attributes, which follow the field and the
  // invalid state without recreating the editor (and losing the cursor)
  const controlId = field?.ids.control;
  const labelId = field?.ids.label;
  const describedBy = [field?.ariaDescribedby, ownDescribedBy]
    .filter(Boolean)
    .join(' ');
  const required = field?.required;
  const editorProps = React.useMemo(() => {
    const attributes: Record<string, string> = {
      role: 'textbox',
      'aria-multiline': 'true',
    };
    if (controlId) attributes.id = controlId;
    if (labelId) attributes['aria-labelledby'] = labelId;
    if (describedBy) attributes['aria-describedby'] = describedBy;
    if (invalid) attributes['aria-invalid'] = 'true';
    if (required) attributes['aria-required'] = 'true';
    if (disabled) attributes['aria-disabled'] = 'true';
    return { attributes };
  }, [controlId, labelId, describedBy, invalid, required, disabled]);

  const editor = useEditor({
    // Rendered on the client only: no markup to hydrate
    immediatelyRender: false,
    editable: !disabled,
    extensions,
    content: emitted.current,
    contentType: 'markdown',
    editorProps,
    onUpdate: ({ editor: e, transaction }) => {
      // A change only a plugin made (the paragraph added after a final list
      // when the editor is clicked) is not an edit: the value stays as given
      if (!transaction.docChanged) return;
      const markdown = e.isEmpty ? '' : e.getMarkdown();
      emitted.current = markdown;
      onChangeRef.current?.(markdown);
    },
    onBlur: ({ event }) => {
      // Focus moving to the toolbar or the link popover stays in the editor
      const next = event.relatedTarget as Element | null;
      if (
        next
        && (rootRef.current?.contains(next) || next.closest(`[${POPOVER_ATTR}]`))
      ) {
        return;
      }
      onBlurRef.current?.();
    },
  });

  React.useEffect(() => {
    if (!editor || value === undefined || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(value, {
      contentType: 'markdown',
      emitUpdate: false,
    });
  }, [editor, value]);

  React.useEffect(() => {
    // No update event: the content did not change
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled, false);
    }
  }, [editor, disabled]);

  React.useEffect(() => {
    if (placeholderRef.current === (placeholder ?? '')) return;
    placeholderRef.current = placeholder ?? '';
    // Redraws the placeholder, without changing the content
    if (editor && !editor.isDestroyed) editor.view.dispatch(editor.state.tr);
  }, [editor, placeholder]);

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <RichTextEditorRoot
      ref={setRootRef}
      editor={editor}
      disabled={disabled}
      invalid={invalid}
      css={[{ '& .ProseMirror': { minH: minContentHeight } }, css]}
      {...rest}
    >
      {editor ? (
        <Toolbar
          editor={editor}
          labels={labels}
          disabled={disabled}
          fieldLabelId={labelId}
        />
      ) : null}
      <RichTextEditorContent />
    </RichTextEditorRoot>
  );
});
