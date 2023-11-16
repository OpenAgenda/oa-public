import { useMemo } from 'react';
import { Image } from '@openagenda/react-shared';

import { logoPath } from './utils';

export default function Confirmation({ event, res, className }) {
  const passData = event.registration.find(r => r.service === 'passCulture')?.data;

  const editLink = useMemo(() => (res?.edit ?? '').replace(':id', passData?.id), [res, passData]);
  const showLink = useMemo(() => (res?.show ?? '').replace(':id', passData?.id), [res, passData]);
  const hasErrors = useMemo(() => (passData?.errors ?? []).length, [passData]);

  if (!passData) {
    return null;
  }

  return (
    <div className={className ?? 'panel panel-default'}>
      <div className="panel-body">
        <Image
          src={logoPath}
          alt="Logo Pass Culture"
          width={100}
        />
        <div className="margin-top-sm">
          {hasErrors ? (
            <>
              <i className="fa fa-warning text-danger margin-right-xs" />
              <b>L&apos;offre pass a été créée mais n&apos;a pas pu être complétée.</b>
              <p>{passData.errors[0].label}</p>
              <p>Rendez-vous sur son administration pour compléter la configuration.</p>
              <a className="btn btn-primary margin-top-xs" href={editLink}>Compléter l&apos;offre</a>
            </>
          ) : (
            <>
              <p>L&apos;offre Pass Culture a été créée avec succès. Vous pouvez y accéder depuis la barre latérale de la fiche détaillée de l&apos;événement ou en cliquant sur un des liens suivants.</p>
              <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Administrer l&apos;offre</a>
              <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank" rel="noreferrer">Voir l&apos;offre</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
