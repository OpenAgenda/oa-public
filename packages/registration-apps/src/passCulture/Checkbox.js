import { useState, useCallback, useMemo } from 'react';
import { Image } from '@openagenda/react-shared';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getTime } from '@openagenda/registrations/passCulture/iso/utils';

import FormModal from './FormModal';
import UnlinkModal from './UnlinkModal';
import { logoPath } from './utils';

export default ({
  value,
  onChange,
  timings = [],
  settings,
}) => {
  const [modal, setModal] = useState(false);

  const hasData = Object.keys(value ?? {}).length;

  const offerAlreadyExists = value?.id;

  const upcomingTimings = useMemo(() => {
    if (!Array.isArray(timings)) {
      return [];
    }
    const now = new Date().getTime();
    return timings.filter(({ begin }) => getTime(begin) > now);
  }, [timings]);

  const issues = useMemo(
    () => []
      .concat(!upcomingTimings.length ? 'Des horaires à venir doivent être saisis dans le champ Horaires' : [])
      .concat(hasData && !validateLocalData(value, { timings }, { boolMode: true }) ? 'Les données Pass saisies sont soit erronées soit incomplètes.' : []),
    [upcomingTimings, hasData, value, timings],
  );

  const onCheck = useCallback(() => {
    setModal(offerAlreadyExists ? 'unlink' : 'show');
  }, [offerAlreadyExists]);

  const onClear = useCallback(() => {
    onChange(null);
    setModal(null);
  }, [onChange]);

  const onSubmit = useCallback(v => {
    onChange(v);
    setModal(null);
  }, [onChange]);

  return (
    <>
      {modal === 'show' ? (
        <FormModal
          timings={timings}
          settings={settings}
          value={value}
          onClose={() => setModal(null)}
          onSubmit={onSubmit}
          onClear={onClear}
        />
      ) : null}
      {modal === 'unlink' ? (
        <UnlinkModal
          editPassHRef={settings.res.offerEditLink.replace(':id', value.id)}
          onConfirm={onClear}
          onClose={() => setModal(null)}
        />
      ) : null}
      <div className="checkbox">
        <label htmlFor="pass-culture">
          <input
            id="pass-culture"
            type="checkbox"
            checked={!!value}
            onChange={onCheck}
            disabled={(!hasData && !upcomingTimings.length)}
          />
          <Image
            className="margin-left-sm"
            src={logoPath}
            alt="Logo Pass Culture"
            width={100}
          />
          {offerAlreadyExists ? (
            <>
              <div>Une offre pass est déjà associée à cette fiche. Décochez la case pour la dissocier.</div>
              <a
                rel="noreferrer"
                className="btn btn-link padding-all-z"
                target="_blank"
                href={settings.res.offerEditLink.replace(':id', value.id)}
              >
                Gérer mon offre sur la plateforme du Pass
              </a>
            </>
          ) : (
            <div className="text-muted">Je souhaite créer une billetterie pass culture pour cet événement</div>
          )}
          {!offerAlreadyExists && issues.length ? (
            <ul className="padding-left-sm">{issues.map(issue => (
              <li className="text-danger">{issue}</li>
            ))}
            </ul>
          ) : null}
        </label>
      </div>
    </>
  );
};
