import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IntlProvider, useIntl, FormattedMessage } from 'react-intl';
import bytes from 'bytes';
import { css } from '@emotion/core';
import locales from '../locales-compiled';
import Image from './Image';

const FILE_INVALID_TYPE = 'file-invalid-type';
const FILE_TOO_LARGE = 'file-too-large';
const FILE_TOO_SMALL = 'file-too-small';
const TOO_MANY_FILES = 'too-many-files';

function FileError({
  file, errors, minSize, maxSize
}) {
  const intl = useIntl();

  let errorLabel;

  const notSupported = intl.formatMessage(
    {
      id: 'ReactShared.ImageInput.notSupported',
      defaultMessage: 'File {fileName} is not supported',
    },
    {
      fileName: file.name,
    }
  );

  switch (errors[0].code) {
    case FILE_INVALID_TYPE:
      errorLabel = notSupported;
      break;
    case FILE_TOO_LARGE:
      errorLabel = intl.formatMessage(
        {
          id: 'ReactShared.ImageInput.fileTooLarge',
          defaultMessage:
            'File {fileName} is {fileSize}, the upper limit for file size is {maxSize}',
        },
        {
          fileName: file.name,
          fileSize: bytes(file.size),
          maxSize: bytes(maxSize),
        }
      );
      break;
    case FILE_TOO_SMALL:
      errorLabel = intl.formatMessage(
        {
          id: 'ReactShared.ImageInput.fileTooSmall',
          defaultMessage:
            'File {fileName} is {fileSize}, the lower limit for file size is {minSize}',
        },
        {
          fileName: file.name,
          fileSize: bytes(file.size),
          minSize: bytes(minSize),
        }
      );
      break;
    case TOO_MANY_FILES:
      errorLabel = intl.formatMessage({
        id: 'ReactShared.ImageInput.tooManyFiles',
        defaultMessage: 'Too many files, only accepts a single file',
      });
      break;
    default:
      errorLabel = notSupported;
  }

  return <div className="text-danger">{errorLabel}</div>;
}

function ImageInput({
  accept = 'image/bmp, image/jpeg, image/png, image/webp',
  extensions = ['jpg', 'bmp', 'png', 'jpeg', 'webp'], // just for the message
  input,
  maxSize,
  minSize,
  width = '100%',
  height = '100%',
  rounded,
}) {
  const intl = useIntl();
  const [rejections, setRejections] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setRejections(rejectedFiles);

      if (acceptedFiles.length) {
        const file = acceptedFiles[0];

        Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        input.onChange(file);
      }
    },
    [input]
  );

  const onRemove = useCallback(() => {
    input.onChange(null);
  }, [input]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept,
    maxSize,
    minSize,
  });

  const { value } = input;

  const preview = typeof value === 'string' ? value : value?.preview;

  const rootProps = getRootProps();

  return (
    <>
      <div
        css={css`
          position: relative;
        `}
      >
        <div
          css={css`
            text-align: center;
            ${preview
            ? `
              height: auto;
              position: relative;
              min-height: 140px;
            `
            : ''}

            &:hover {
              background: rgba(255, 255, 255, 0.1);
            }
          `}
        >
          <input {...input} value="" {...getInputProps()} />

          {value ? (
            <>
              {preview ? (
                <div>
                  <Image
                    alt=""
                    src={preview}
                    fallbackSrc={
                      process.env.NODE_ENV === 'development'
                        ? preview.replace('cibuldev', 'cibul')
                        : null
                    }
                    css={css`
                      width: ${width};
                      height: ${height};
                      object-fit: cover;
                      ${rounded ? 'border-radius: 50%' : ''}
                    `}
                    {...rootProps}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div
              css={css`
                margin-left: auto;
                margin-right: auto;
              `}
            >
              <div
                css={css`
                  margin-left: auto;
                  margin-right: auto;
                  background: #eee;
                  border-color: #ccc;
                  border-width: 1px;
                  border-style: dashed;
                  width: ${width};
                  height: ${height};
                  min-height: 160px;
                  ${rounded ? 'border-radius: 50%' : ''}
                `}
                {...rootProps}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  css={css`
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                  `}
                >
                  <FormattedMessage
                    id="ReactShared.ImageInput.upload"
                    defaultMessage="Upload an image"
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {value ? (
          <div
            css={css`
              position: absolute;
              top: 5px;
              right: 5px;
            `}
          >
            <button
              type="button"
              onClick={rootProps.onClick}
              className="btn btn-default margin-all-xs"
              title={intl.formatMessage({
                id: 'ReactShared.ImageInput.update',
                defaultMessage: 'Update the image',
              })}
            >
              <i className="fa fa-upload" />
            </button>

            <br />
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-danger margin-all-xs"
              title={intl.formatMessage({
                id: 'ReactShared.ImageInput.remove',
                defaultMessage: 'Remove',
              })}
            >
              <i className="fa fa-trash" />
            </button>
          </div>
        ) : null}
      </div>

      {extensions?.length ? (
        <div className="text-right margin-top-xs">
          <FormattedMessage
            id="ReactShared.ImageInput.acceptedFiles"
            defaultMessage="Accepted files"
          />
          : .{[].concat(extensions).join(', .')}
        </div>
      ) : null}

      {rejections?.length ? (
        <div className="margin-top-xs">
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

export default function IntlImageInput({
  locale,
  messages: _messages,
  ...props
}) {
  const messages = useMemo(
    () => ({
      ...locales[locale],
      ...(_messages && _messages[locale]),
    }),
    [_messages, locale]
  );

  return (
    <IntlProvider locale={locale} key={locale} messages={messages}>
      <ImageInput {...props} />
    </IntlProvider>
  );
}
