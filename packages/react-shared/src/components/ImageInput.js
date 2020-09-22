import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from './Image';

export default function ImageInput({ extensions, labels, input }) {
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    input.onChange(Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
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
    accept: extensions?.length ? `.${extensions.join(',.')}` : null
  });

  const { value } = input;

  const preview = typeof value === 'string'
    ? value
    : value?.preview;

  return (
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
                {labels.update}
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
              {labels.upload}
            </button>
          </div>
        )}

        {extensions?.length ? (
          <span className="accepted-image-info">
            {labels.acceptedExtensions}: .{[].concat(extensions).join(', .')}
          </span>
        ) : null}
      </div>

      {value ? (
        <button
          type="button"
          onClick={onRemove}
          className="btn btn-danger margin-all-sm remove-file"
          title={labels.remove}
        >
          <i className="fa fa-trash" />
        </button>
      ) : null}
    </div>
  );
}
