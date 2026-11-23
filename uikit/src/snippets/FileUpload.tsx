'use client';

import type { ButtonProps, RecipeProps } from '@chakra-ui/react';
import {
  Button,
  FileUpload as ChakraFileUpload,
  Icon,
  IconButton,
  Span,
  Text,
  useFileUploadContext,
  useRecipe,
} from '@chakra-ui/react';
import * as React from 'react';
import { LuFile, LuUpload, LuX } from 'react-icons/lu';

export interface FileUploadRootProps extends ChakraFileUpload.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const FileUploadRoot = React.forwardRef<
  HTMLInputElement,
  FileUploadRootProps
>(function FileUploadRoot(props, ref) {
  const { children, inputProps, ...rest } = props;
  return (
    <ChakraFileUpload.Root {...rest}>
      <ChakraFileUpload.HiddenInput ref={ref} {...inputProps} />
      {children}
    </ChakraFileUpload.Root>
  );
});

export interface FileUploadDropzoneProps
  extends ChakraFileUpload.DropzoneProps {
  label: React.ReactNode;
  description?: React.ReactNode;
}

// What a drop area that is not clicked is: a plain block. Ark gives it a role
// and a name all the same (« application », « dropzone »), left out here.
const DropArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function DropArea(props, ref) {
  const rest = { ...props };
  delete rest.role;
  delete rest['aria-label'];
  return <div ref={ref} {...rest} />;
});

// Clicked, the area opens the file picker: it is a button, named by
// `translations.dropzone` on the root. With `disableClick` it only takes the
// files dropped on it, and is no control: the picker is opened by a
// `FileUploadButton`, which may then sit inside it.
export const FileUploadDropzone = React.forwardRef<
  HTMLInputElement,
  FileUploadDropzoneProps
>(function FileUploadDropzone(props, ref) {
  const { children, label, description, ...rest } = props;
  const content = (
    <>
      <Icon fontSize="xl" color="fg.muted">
        <LuUpload />
      </Icon>
      <ChakraFileUpload.DropzoneContent>
        <div>{label}</div>
        {description && <Text color="fg.muted">{description}</Text>}
      </ChakraFileUpload.DropzoneContent>
      {children}
    </>
  );

  if (rest.disableClick) {
    return (
      <ChakraFileUpload.Dropzone ref={ref} {...rest} asChild>
        <DropArea>{content}</DropArea>
      </ChakraFileUpload.Dropzone>
    );
  }

  return (
    <ChakraFileUpload.Dropzone ref={ref} {...rest}>
      {content}
    </ChakraFileUpload.Dropzone>
  );
});

interface VisibilityProps {
  showSize?: boolean;
  clearable?: boolean;
}

interface FileUploadItemProps extends VisibilityProps {
  file: File;
}

const FileUploadItem = React.forwardRef<HTMLLIElement, FileUploadItemProps>(
  function FileUploadItem(props, ref) {
    const { file, showSize, clearable } = props;
    return (
      <ChakraFileUpload.Item file={file} ref={ref}>
        <ChakraFileUpload.ItemPreview asChild>
          <Icon fontSize="lg" color="fg.muted">
            <LuFile />
          </Icon>
        </ChakraFileUpload.ItemPreview>

        {showSize ? (
          <ChakraFileUpload.ItemContent>
            <ChakraFileUpload.ItemName />
            <ChakraFileUpload.ItemSizeText />
          </ChakraFileUpload.ItemContent>
        ) : (
          <ChakraFileUpload.ItemName flex="1" />
        )}

        {clearable && (
          <ChakraFileUpload.ItemDeleteTrigger asChild>
            <IconButton variant="ghost" color="fg.muted" size="xs">
              <LuX />
            </IconButton>
          </ChakraFileUpload.ItemDeleteTrigger>
        )}
      </ChakraFileUpload.Item>
    );
  },
);

interface FileUploadListProps
  extends VisibilityProps,
    ChakraFileUpload.ItemGroupProps {
  files?: File[];
}

export const FileUploadList = React.forwardRef<
  HTMLUListElement,
  FileUploadListProps
>(function FileUploadList(props, ref) {
  const { showSize, clearable, files, ...rest } = props;

  const fileUpload = useFileUploadContext();
  const acceptedFiles = files ?? fileUpload.acceptedFiles;

  if (acceptedFiles.length === 0) return null;

  return (
    <ChakraFileUpload.ItemGroup ref={ref} {...rest}>
      {acceptedFiles.map((file) => (
        <FileUploadItem
          key={file.name}
          file={file}
          showSize={showSize}
          clearable={clearable}
        />
      ))}
    </ChakraFileUpload.ItemGroup>
  );
});

type Assign<T, U> = Omit<T, keyof U> & U;

interface FileInputProps extends Assign<ButtonProps, RecipeProps<'input'>> {
  placeholder?: React.ReactNode;
}

export const FileInput = React.forwardRef<HTMLButtonElement, FileInputProps>(
  function FileInput(props, ref) {
    const inputRecipe = useRecipe({ key: 'input' });
    const [recipeProps, restProps] = inputRecipe.splitVariantProps(props);
    const { placeholder = 'Select file(s)', ...rest } = restProps;
    return (
      <ChakraFileUpload.Trigger asChild>
        <Button
          unstyled
          py="0"
          ref={ref}
          {...rest}
          css={[inputRecipe(recipeProps), props.css]}
        >
          <ChakraFileUpload.Context>
            {({ acceptedFiles }) => {
              if (acceptedFiles.length === 1) {
                return <span>{acceptedFiles[0].name}</span>;
              }
              if (acceptedFiles.length > 1) {
                return <span>{acceptedFiles.length} files</span>;
              }
              return <Span color="fg.subtle">{placeholder}</Span>;
            }}
          </ChakraFileUpload.Context>
        </Button>
      </ChakraFileUpload.Trigger>
    );
  },
);

// The trigger as a button with an upload icon: the FileInput above is drawn
// as an empty text field, its label in placeholder grey, which reads as
// disabled where a single file is picked
export const FileUploadButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function FileUploadButton(props, ref) {
  const { children, ...rest } = props;
  return (
    <ChakraFileUpload.Trigger asChild>
      <Button ref={ref} variant="outline" size="sm" {...rest}>
        <LuUpload aria-hidden />
        {children}
      </Button>
    </ChakraFileUpload.Trigger>
  );
});

export const FileUploadLabel = ChakraFileUpload.Label;
export const FileUploadClearTrigger = ChakraFileUpload.ClearTrigger;
export const FileUploadTrigger = ChakraFileUpload.Trigger;
