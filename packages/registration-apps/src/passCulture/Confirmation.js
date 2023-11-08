import { useMemo } from 'react';
import { Image } from '@openagenda/react-shared';

import { logoPath } from './utils';

export default function Confirmation({ event, res, className }) {
  const passData = event.registration.find(r => r.service === 'passCulture')?.data;

  if (!passData) {
    return null;
  }

  const editLink = useMemo(() => res.edit.replace(':id', passData.id), [res, passData]);
  const showLink = useMemo(() => res.show.replace(':id', passData.id), [res, passData]);
  const hasErrors = useMemo(() => (passData.errors ?? []).length, [passData]);

  return <div className={className ?? 'panel panel-default' }>
    <div className="panel-body">
      <Image
        src={logoPath}
        alt="Logo Pass Culture"
        width={100}
      />
      <div className="margin-top-sm">
        {hasErrors ? <>
          <i className="fa fa-warning text-danger margin-right-xs"></i>
          <b>L'offre pass a été créée mais n'a pas pu être complétée.</b>
          <p>{passData.errors[0].label}</p>
          <p>Rendez-vous sur son administration pour compléter la configuration.</p>
          <a className="btn btn-primary margin-top-xs" href={editLink}>Compléter l'offre</a>
        </> : <>
          <p>L'offre Pass Culture a été créée avec succès. Vous pouvez y accéder depuis la section "Inscription" de la fiche événement ou en cliquant sur un des liens suivants.</p>
          <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank">Administrer l'offre</a>
          <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank">Voir l'offre</a>
        </>}
      </div>
    </div>
  </div>;
}