import { useMemo } from 'react';
import { Image } from '@openagenda/react-shared';
import { getCurrentValue } from '@openagenda/registrations/passCulture/iso/utils';

import { logoPath } from './utils';

function ConfirmationBody({ isCreated, hasErrors, isPending, isPatch, editLink, showLink, errors = [] }) {
  if (isCreated && hasErrors) {
    return (
      <>
        <i className="fa fa-warning text-danger margin-right-xs" />
        <b>L&apos;offre pass a été créée mais n&apos;a pas pu être complétée.</b>
        <p>{errors[0]?.label}</p>
        <p>Rendez-vous sur son administration pour compléter la configuration.</p>
        <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=passCultureError}`} className="link-primary">
          Contacter le support
        </a>
      </>
    );
  }

  if (!isCreated && hasErrors) {
    return (
      <>
        <i className="fa fa-warning text-danger margin-right-xs" />
        <b>L&apos; offre pass n&apos; a pas pu être créée.</b>
        <p>{errors[0]?.label}</p>
        <p>Rendez-vous sur son administration pour compléter la configuration.</p>
        <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=passCultureError}`} className="link-primary">
          Contacter le support
        </a>
      </>
    );
  }
  if (isPending) {
    return (
      <>
        <i className="fa fa-warning text-danger margin-right-xs" />
        <b>L&apos;offre est en attente de validation par l&apos;équipe du Pass Culture.</b>
        <p>La validation de l&apos;offre sera faite dans moins de 72h, la completion de l&apos;offre sera faite automatiquement</p>
        <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Administrer l&apos;offre</a>
        <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Voir l&apos;offre</a>
      </>
    );
  }
  if (isPatch) {
    return (
      <>
        <p>L&apos; offre Pass Culture a été mise à jour avec succès. Vous pouvez y accéder depuis la barre latérale de la fiche détaillée de l&apos;événement ou en cliquant sur un des liens suivants.</p>
        <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Administrer l&apos;offre</a>
        <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Voir l&apos;offre</a>
      </>
    );
  }
  return (
    <>
      <p>L&apos;offre Pass Culture a été créée avec succès. Vous pouvez y accéder depuis la barre latérale de la fiche détaillée de l&apos;événement ou en cliquant sur un des liens suivants.</p>
      <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Administrer l&apos;offre</a>
      <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Voir l&apos;offre</a>
    </>
  );
}

export default function Confirmation({ event, res, className }) {
  const passRegistrartion = event.registration.find(r => r.service === 'passCulture');
  const passData = passRegistrartion?.data;

  if (!passData) {
    return null;
  }

  const lastProcessed = passRegistrartion?.lastProcessedAt;
  const thirtySecAgo = new Date(new Date().getTime() - 30 * 1000);

  if (new Date(lastProcessed) < thirtySecAgo) {
    return null;
  }

  const editLink = useMemo(() => (res?.edit ?? '').replace(':id', passData[0]?.response?.passId), [res, passData]);
  const showLink = useMemo(() => (res?.show ?? '').replace(':id', passData[0]?.response?.passId), [res, passData]);
  const isPatch = useMemo(() => passData.length > 3, [passData]);
  const hasErrors = useMemo(() => (getCurrentValue(passData)?.errors ?? []).length, [passData]);
  const isPending = useMemo(() => passData[0]?.response.isPending ?? null, [passData]);
  const isCreated = useMemo(() => passData[0]?.response?.passId, [passData]);

  return (
    <div className={className ?? 'panel panel-default'}>
      <div className="panel-body">
        <Image
          src={logoPath}
          alt="Logo Pass Culture"
          width={100}
        />
        <div className="margin-top-sm">
          {ConfirmationBody({ isCreated, hasErrors, isPending, isPatch, showLink, editLink, errors: passData?.errors })}
        </div>
      </div>
    </div>
  );
}
