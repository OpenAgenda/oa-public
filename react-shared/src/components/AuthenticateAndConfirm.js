import { useCallback, useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import nl2br from '../utils/nl2br';
import Spinner from './Spinner';
import temporarySessionStorage from './lib/temporarySessionStorage';

const messages = defineMessages({
  password: {
    id: 'ReactShared.AuthenticateAndConfirm.password',
    defaultMessage: 'Type in your password to complete the operation',
  },
  submit: {
    id: 'ReactShared.AuthenticateAndConfirm.submit',
    defaultMessage: 'Confirm',
  },
  otherError: {
    id: 'ReactShared.AuthenticateAndConfirm.otherError',
    defaultMessage:
      'There was a problem during the processing of the operation, retry shortly.',
  },
  authenticationError: {
    id: 'ReactShared.AuthenticateAndConfirm.authenticationError',
    defaultMessage: 'The submitted password is invalid. Please try again.',
  },
});

export default ({
  buttonClassName = 'btn btn-danger',
  message = null,
  method = 'post',
  res,
  validPasswordMemoryLifespan = 0,
  payload = null,
  onSuccess,
  onFail,
  className = 'margin-top-md',
}) => {
  const m = useIntl().formatMessage;

  const [loading, setLoading] = useState(false);
  const [displayForm, setDisplayForm] = useState(true);
  const [error, setError] = useState(null);

  const postPayload = useCallback(
    password => {
      setLoading(true);
      fetch(res, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${password}`,
        },
        body: payload ? JSON.stringify(payload) : null,
      })
        .then(response =>
          response
            .text()
            .then(bodyAsText => ({ hasBody: !!bodyAsText.length, response })))
        .then(({ response, hasBody }) =>
          (hasBody
            ? response.json().then(body => ({ response, body }))
            : { response }))
        .then(({ response: { ok, status }, body }) => {
          setLoading(false);
          if (ok) {
            setDisplayForm(false);
            onSuccess(body);
          } else if (status === 403) {
            setError('authentication');
            return;
          }

          if (validPasswordMemoryLifespan) {
            temporarySessionStorage.set(
              'password',
              password,
              validPasswordMemoryLifespan,
            );
          }

          onFail(body);
        })
        .catch(() => {
          setLoading(false);
          setError('other');
        });
    },
    [res, onSuccess, onFail, payload, method, validPasswordMemoryLifespan],
  );

  useEffect(() => {
    if (
      !validPasswordMemoryLifespan
      || !temporarySessionStorage.has('password')
    ) {
      return;
    }
    setDisplayForm(false);
    postPayload(temporarySessionStorage.get('password'));
  }, [setDisplayForm, validPasswordMemoryLifespan, postPayload]);

  if (!displayForm) {
    return <>{loading ? <Spinner /> : null}</>;
  }

  return (
    <>
      {loading ? <Spinner /> : null}
      {message ? <p>{nl2br(message)}</p> : null}
      <form
        method="post"
        onSubmit={e => {
          e.preventDefault();
          postPayload(e.target.password.value);
        }}
        className={className}
      >
        <div className="form-group">
          <label htmlFor="password" className="control-label">
            {m(messages.password)}
          </label>
          <input name="password" className="form-control" type="password" />
          {error ? (
            <div className="text-danger">{m(messages[`${error}Error`])}</div>
          ) : (
            <div>&nbsp;</div>
          )}
        </div>
        <div className="form-group">
          <button name="signin" className={buttonClassName} type="submit">
            {m(messages.submit)}
          </button>
        </div>
      </form>
    </>
  );
};
