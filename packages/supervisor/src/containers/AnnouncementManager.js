import React, { useMemo, useCallback } from 'react';
import { createForm } from 'final-form';
import { Form, Field } from 'react-final-form';
import ReactMarkdown from 'react-markdown';
import { css } from '@emotion/core';
import { useConstant, useApiClient } from '@openagenda/react-shared';

const getTarget = uri => (uri.match(/^(https?:|)\/\//) ? '_blank' : undefined);

function AnnouncementPreview({ data }) {
  const kind = data.kind || 'info';

  return (
    <div className={`announcement bg-${kind}`}>
      <div className={`container text-${kind}`}>
        <div className="row padding-top-sm padding-right-sm padding-left-md">
          <div className="pull-right">
            <button
              type="button"
              className={`btn btn-link-inline text-${kind}`}
            >
              <i className="fa fa-times" aria-hidden="true" />
            </button>
          </div>

          <ReactMarkdown linkTarget={getTarget} source={data.content} />
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementManager({ user }) {
  const apiClient = useApiClient();

  const initialValues = useMemo(
    () => ({
      content: user.announcement?.content,
      kind: user.announcement?.kind
    }),
    [user]
  );
  const onSubmit = useCallback(
    async data => {
      await apiClient.post('/supervisor/announcement', {
        id: user.announcement?.id || new Date().toISOString(),
        ...data
      });
      window.location.reload();
    },
    [apiClient, user]
  );

  const form = useConstant(() => createForm({
    initialValues,
    onSubmit
  }));

  const onRemove = useCallback(async () => {
    await apiClient.delete('/supervisor/announcement');
    window.location.reload();
  }, [apiClient]);

  return (
    <div className="margin-top-md">
      <Form
        form={form}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <div className="container">
              <div className="row">
                <div className="col-sm-9">
                  <Field
                    name="content"
                    component="textarea"
                    className="form-control"
                    css={css`
                      resize: vertical;
                      min-height: 71px;
                    `}
                  />
                </div>
                <div className="col-sm-3">
                  <Field
                    name="kind"
                    component="select"
                    className="form-control"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="danger">Danger</option>
                  </Field>

                  {/* expiration */}

                  <div className="margin-top-sm">
                    <button type="submit" className="btn btn-primary">
                      {user.announcement ? 'Modifier' : 'Créer'}
                    </button>

                    {user.announcement ? (
                      <button
                        type="button"
                        className="btn btn-danger margin-left-md"
                        onClick={onRemove}
                      >
                        Supprimer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {values.content ? (
              <div className="margin-top-sm">
                <AnnouncementPreview data={values} />
              </div>
            ) : null}
          </form>
        )}
      />
    </div>
  );
}
