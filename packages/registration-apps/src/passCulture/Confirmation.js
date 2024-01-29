import { useMemo } from 'react';
import { Image } from '@openagenda/react-shared';

import { logoPath } from './utils';

export default function Confirmation({ event, res, className }) {
  const passData = event.registration.find(r => r.service === 'passCulture')?.data;

  const editLink = useMemo(() => (res?.edit ?? '').replace(':id', passData?.id), [res, passData]);
  const showLink = useMemo(() => (res?.show ?? '').replace(':id', passData?.id), [res, passData]);
  const hasErrors = useMemo(() => (passData?.errors ?? []).length, [passData]);
  const hasWarning = useMemo(() => passData?.warning, [passData]);

  if (!passData) {
    return null;
  }

  const body = () => {
    if (hasErrors) {
      return (
        <>
          <i className="fa fa-warning text-danger margin-right-xs" />
          <b>L&apos;offre pass a été créée mais n&apos;a pas pu être complétée.</b>
          <p>{passData.errors[0].label}</p>
          <p>Rendez-vous sur son administration pour compléter la configuration.</p>
          <a className="btn btn-primary margin-top-xs" href={editLink}>Compléter l&apos;offre</a>
        </>
      );
    }
    if (hasWarning) {
      return (
        <>
          <i className="fa fa-warning text-danger margin-right-xs" />
          <b>L&apos;offre est en attente de validation par l&apos;équipe du Pass Culture.</b>
          <p>La validation de l&apos;offre sera faite dans moins de 72h à la suite de quoi les dates devront être de nouveau saisies depuis l&apos;administration de l&apos;offre sur le site du Pass.</p>
          <a className="btn btn-primary margin-top-xs" href={editLink}>Compléter l&apos;offre</a>
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
  };

  return (
    <div className={className ?? 'panel panel-default'}>
      <div className="panel-body">
        <Image
          src={logoPath}
          alt="Logo Pass Culture"
          width={100}
        />
        <div className="margin-top-sm">
          {body()}
        </div>
      </div>
    </div>
  );
}
