import { useState } from 'react';
import { rest } from 'msw';
import AuthenticateAndConfirmComponent from '../src/components/AuthenticateAndConfirm';

import SmallCanvasDecorator from './decorators/SmallCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'AuthenticateAndConfirm',
  decorators: [SmallCanvasDecorator],
  parameters: {
    msw: {
      handlers: [
        rest.post('/successful_auth', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 500));
          return res(ctx.status(200));
        }),
        rest.post('/unsuccessful_auth', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 500));
          return res(ctx.status(403));
        }),
        rest.post('/successful_auth_with_payload', async (req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 500));
          return res(ctx.json({ requestPayload: req.body }));
        }),
        rest.post(
          '/successful_auth_with_unsuccessful_payload',
          async (req, res, ctx) => {
            await new Promise(rs => setTimeout(rs, 500));
            return res(
              ctx.status(400),
              ctx.json({ notOky: 'dokey', requestPayload: req.body }),
            );
          },
        ),
      ],
    },
  },
};
export function SuccessfulAuthenticateAndConfirm() {
  const [done, setDone] = useState(false);

  if (done) {
    return <p>onSuccess was called</p>;
  }

  return (
    <AuthenticateAndConfirmComponent
      onSuccess={() => {
        setDone(true);
      }}
      res="/successful_auth"
      message="Êtes-vous sûr de vouloir supprimer votre compte? Et patati et patata. Ici l\'authentification fonctionnera."
    />
  );
}

export const UnsuccessfulAuthenticationConfirm = () => (
  <AuthenticateAndConfirmComponent res="/unsuccessful_auth" />
);

export const SuccessfulAuthenticateAndConfirmWithPayload = () => {
  const [result, setResult] = useState(null);

  if (result) {
    return <p>onSuccess: {JSON.stringify(result)}</p>;
  }

  return (
    <AuthenticateAndConfirmComponent
      onSuccess={setResult}
      payload={{ okey: 'dokey' }}
      res="/successful_auth_with_payload"
      message="Le composant rend le resultat via onSuccess"
    />
  );
};

export const SuccessfulAuthenticateButUnsuccesfulPayload = () => {
  const [fail, setFail] = useState(null);

  if (fail) {
    return <p>onFail: {JSON.stringify(fail)}</p>;
  }

  return (
    <AuthenticateAndConfirmComponent
      onFail={setFail}
      payload={{ okey: 'dokey' }}
      res="successful_auth_with_unsuccessful_payload"
      message="Le composant rend l'échec via onFail"
    />
  );
};

export const SuccessfulAuthenticateButUnsuccesfulPayloadRememberingPassword = () => {
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [retries, setRetries] = useState(0);
  const [success, setSuccess] = useState(false);

  if (success) {
    return <p>Authentifié et opération réussie!</p>;
  }

  if (showRetryButton) {
    return (
      <>
        <p>
          AuthenticateAndConfirm se rappelle du mdp pendant 5s. Il ne le
          redemande pas à la 2ème tentative en deça de ce délai
        </p>
        <button
          type="button"
          className="btn btn-default"
          onClick={() => {
            setRetries(retries + 1);
            setShowRetryButton(false);
          }}
        >
          Retry
        </button>
      </>
    );
  }

  return (
    <AuthenticateAndConfirmComponent
      onFail={() => setShowRetryButton(true)}
      onSuccess={() => setSuccess(true)}
      payload={{ okey: 'dokey' }}
      res={
          retries > 0
            ? 'successful_auth'
            : 'successful_auth_with_unsuccessful_payload'
        }
      message="Le mdp est placé de coté pour éviter d'avoir à le ressaisir"
      validPasswordMemoryLifespan={5000}
    />
  );
};
