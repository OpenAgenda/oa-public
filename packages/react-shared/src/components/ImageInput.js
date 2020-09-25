import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IntlProvider, useIntl, FormattedMessage } from 'react-intl';
import bytes from 'bytes';
import locales from '../locales-compiled';
import Image from './Image';

const FILE_INVALID_TYPE = 'file-invalid-type';
const FILE_TOO_LARGE = 'file-too-large';
const FILE_TOO_SMALL = 'file-too-small';
const TOO_MANY_FILES = 'too-many-files';

function FileError({
  file,
  errors,
  minSize,
  maxSize
}) {
  const intl = useIntl();

  let errorLabel;

  const notSupported = intl.formatMessage({
    id: 'ReactShared.ImageInput.notSupported',
    defaultMessage: 'File {fileName} is not supported'
  }, {
    fileName: file.name
  });

  switch (errors[0].code) {
    case FILE_INVALID_TYPE:
      errorLabel = notSupported;
      break;
    case FILE_TOO_LARGE:
      errorLabel = intl.formatMessage({
        id: 'ReactShared.ImageInput.fileTooLarge',
        defaultMessage: 'File {fileName} is {fileSize}, the upper limit for file size is {maxSize}'
      }, {
        fileName: file.name,
        fileSize: bytes(file.size),
        maxSize: bytes(maxSize)
      });
      break;
    case FILE_TOO_SMALL:
      errorLabel = intl.formatMessage({
        id: 'ReactShared.ImageInput.fileTooSmall',
        defaultMessage: 'File {fileName} is {fileSize}, the lower limit for file size is {minSize}'
      }, {
        fileName: file.name,
        fileSize: bytes(file.size),
        minSize: bytes(minSize)
      });
      break;
    case TOO_MANY_FILES:
      errorLabel = intl.formatMessage({
        id: 'ReactShared.ImageInput.tooManyFiles',
        defaultMessage: 'Too many files, only accepts a single file'
      });
      break;
    default:
      errorLabel = notSupported;
  }

  return (
    <div className="text-danger">
      {errorLabel}
    </div>
  );
}

function ImageInput({
  extensions,
  input,
  maxSize,
  minSize
}) {
  const intl = useIntl();
  const [rejections, setRejections] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setRejections(rejectedFiles);

    if (acceptedFiles.length) {
      const file = acceptedFiles[0];

      Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      input.onChange(file);
    }
  }, [input]);

  const onRemove = useCallback(() => {
    input.onChange(null);
  }, [input]);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: extensions?.length ? `.${extensions.join(',.')}` : null,
    maxSize,
    minSize
  });

  const { value } = input;

  const preview = typeof value === 'string'
    ? value
    : value?.preview;

  return (
    <>
      <div className="file-upload">
        <div
          {...getRootProps()}
          className={preview ? 'file-dropzone image-preview' : 'file-dropzone'}
        >
          <input {...input} value="" {...getInputProps()} />

          {value ? (
            <>
              <div className="center-button margin-bottom-sm">
                <button type="button" className="btn btn-primary margin-all-sm">
                  <FormattedMessage
                    id="ReactShared.ImageInput.update"
                    defaultMessage="Update the image"
                  />
                </button>
              </div>

              {preview ? (
                <Image
                  className="padding-all-sm"
                  alt=""
                  src={preview}
                  fallbackSrc={
                    process.env.NODE_ENV === 'development'
                      ? preview.replace('cibuldev', 'cibul')
                      : null
                  }
                />
              ) : null}
            </>
          ) : (
            <div className="center-button margin-bottom-sm">
              <button type="button" className="btn btn-primary">
                <FormattedMessage
                  id="ReactShared.ImageInput.upload"
                  defaultMessage="Update an image"
                />
              </button>
            </div>
          )}

          {extensions?.length ? (
            <span className="accepted-image-info">
              <FormattedMessage
                id="ReactShared.ImageInput.acceptedFiles"
                defaultMessage="Accepted files"
              />
              : .{[].concat(extensions).join(', .')}
            </span>
          ) : null}
        </div>

        {value ? (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-danger margin-all-sm remove-file"
            title={intl.formatMessage({
              id: 'ReactShared.ImageInput.remove',
              defaultMessage: 'Remove'
            })}
          >
            <i className="fa fa-trash" />
          </button>
        ) : null}
      </div>

      {rejections?.length ? (
        <div>
          {rejections.map(({ file, errors }, index) => (
            <FileError
              key={String(index)}
              file={file}
              errors={errors}
              minSize={minSize}
              maxSize={maxSize}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function InltImageInput({
  extensions,
  input,
  maxSize,
  minSize,
  locale,
  messages: _messages
}) {
  const messages = useMemo(() => ({
    ...locales[locale],
    ...(_messages && _messages[locale])
  }), [_messages, locale]);

  return (
    <IntlProvider locale={locale} key={locale} messages={messages}>
      <ImageInput
        extensions={extensions}
        input={input}
        maxSize={maxSize}
        minSize={minSize}
      />
    </IntlProvider>
  );
}
