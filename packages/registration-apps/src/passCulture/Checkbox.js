import { useState, useCallback, useMemo, useEffect } from 'react';
import { Image, Spinner } from '@openagenda/react-shared';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getTime, getCurrentValue } from '@openagenda/registrations/passCulture/iso/utils';

import FormModal from './FormModal';
import UnlinkModal from './UnlinkModal';
import { logoPath, isPatchMode } from './utils';

export default ({
  value,
  onChange,
  timings = [],
  settings,
  location,
  longDesc,
  title,
}) => {
  const [modal, setModal] = useState(false);
  const [isLoadingPassData, setIsLoadingPassData] = useState(true);
  const [passSettingsData, setPassSettingsData] = useState({});
  const [hasAccess, setHasAccess] = useState(false);

  const patchMode = useMemo(() => isPatchMode(value || []), [value]);

  const hasData = useMemo(() => !!Object.keys(value ?? {}).length, [value]);
  const hasSettingsData = useMemo(() => !!Object.keys(passSettingsData).length, [passSettingsData]);
  const currentValue = useMemo(() => getCurrentValue(value), [value]);

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
      .concat(hasData && hasSettingsData && !validateLocalData(currentValue, { timings }, { boolMode: true, ...passSettingsData }) ? 'Les données Pass saisies sont soit erronées soit incomplètes.' : []),
    [upcomingTimings, hasData, timings, passSettingsData, hasSettingsData, currentValue],
  );

  useEffect(() => {
    fetch(settings.res.settings)
      .then(r => r.json())
      .then(data => {
        setPassSettingsData(data);
        setIsLoadingPassData(false);
      });

    fetch(settings.res.context)
      .then(r => r.json())
      .then(data => {
        setHasAccess(['administrator', 'moderator'].includes(data.me.member?.role));
      }).catch(() => {
        setHasAccess(false);
      });
  }, [settings]);

  const onCheck = useCallback(() => {
    setModal(offerAlreadyExists ? 'unlink' : 'show');
  }, [offerAlreadyExists]);

  const onClear = useCallback(() => {
    if (patchMode) onChange(value);
    else onChange(null);
    setModal(null);
  }, [onChange, patchMode, value]);

  const onSubmit = useCallback(v => {
    if (v.eventDuration === '') delete v.eventDuration;
    onChange(v);
    setModal(null);
  }, [onChange]);

  if (!hasAccess) {
    return null;
  }

  return (
    <>
      {modal === 'show' && isLoadingPassData ? <Spinner /> : null}
      {modal === 'show' && !isLoadingPassData ? (
        <FormModal
          title={title}
          longDesc={longDesc}
          location={location}
          timings={upcomingTimings}
          categories={passSettingsData.categories}
          related={passSettingsData.related}
          offererVenues={passSettingsData.offererVenues}
          bookingEmail={settings?.bookingEmail}
          value={value || []}
          onClose={() => setModal(null)}
          onSubmit={onSubmit}
          onClear={onClear}
          patchMode={patchMode}
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
            <div className="text-muted">Je souhaite créer une offre pass culture pour cet événement</div>
          )}
          {!offerAlreadyExists && !isLoadingPassData && issues.length ? (
            <ul className="padding-left-sm">{issues.map(issue => (
              <li className="text-danger">{issue}</li>
            ))}
            </ul>
          ) : null}
        </label>
      </div>
      <b>Autres outils</b>
    </>
  );
};
