import { useMemo } from 'react';
import { Image } from '@openagenda/react-shared';

import { logoPath } from './utils';

export default function Confirmation({ event, res }) {
  const passData = event.registration.find(r => r.service === 'passCulture')?.data;

  if (!passData) {
    return null;
  }

  const editLink = useMemo(() => res.edit.replace(':id', passData.eventOffer.id), [res, passData]);
  const showLink = useMemo(() => res.show.replace(':id', passData.eventOffer.id), [res, passData]);
  const hasErrors = useMemo(() => (passData.errors ?? []).length, [passData]);

  return <div className="panel panel-default">
    <div className="panel-body">
      <Image
        src={logoPath}
        alt="Logo Pass Culture"
        width={100}
      />
      <div className="margin-top-sm">
        {hasErrors ? <>
          <i className="fa fa-warning text-danger margin-right-xs"></i>
          <b>Une offre pass a été créée mais n'a pas pu être complétée.</b>
          <p>Raison fournie: {passData.errors[0].label}</p>
          <p>Rendez-vous sur son administration pour effectuer les ajustements nécessaires.</p>
          <a className="btn btn-primary" href={editLink}>Compléter l'offre</a>
        </> : <>
          <p>Une offre Pass Culture associée à cet événement a été créée avec succès. Vous pouvez y accéder depuis la section "Inscription" de la fiche événement ou en cliquant sur un des liens suivants.</p>
          <a href={editLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank">Administrer l'offre</a>
          <a href={showLink} className="padding-left-z margin-right-sm btn btn-link padding-v-z" target="_blank">Voir l'offre</a>
        </>}
      </div>
    </div>
  </div>;
}