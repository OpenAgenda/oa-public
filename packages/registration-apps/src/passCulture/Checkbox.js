import { useState, useCallback, useMemo, useEffect } from 'react';
import { Image, Spinner } from '@openagenda/react-shared';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getTime, getCurrentValue } from '@openagenda/registrations/passCulture/iso/utils';

import FormModal from './FormModal';
import UnlinkModal from './UnlinkModal';
import { logoPath, rejectedLogoPath, errorLogoPath, pendingLogoPath, isPatchMode } from './utils';

function checkboxText({ offerWasRejected, offerIsPending, offerHasError, patchMode, settings, value }) {
  if (offerWasRejected) {
    return (
      <>
        <div className="text-danger margin-top-xs">
          Cette offre a été rejetée par l&apos;equipe du pass. Décochez la case pour la dissocier.
        </div>
        <a
          rel="noreferrer"
          className="btn btn-link padding-all-z"
          target="_blank"
          href={settings.res.offerEditLink.replace(':id', value[0]?.response?.passId)}
        >
          Voir l&apos;offre sur la plateforme pass Culture
        </a>
      </>
    );
  }
  if (offerIsPending) {
    return (
      <div className="text-warning">L&apos;offre est en attente de validation par l&apos;équipe du Pass Culture.</div>
    );
  }
  if (offerHasError) {
    return (
      <>
        <div className="text-danger margin-top-xs">
          L&apos;offre pass a été créée mais n&apos;a pas pu être complétée.
        </div>
        <a
          target="_blank"
          rel="noreferrer"
          href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=passCultureError}`}
          className="btn btn-link padding-all-z"
        >
          Contacter le support
        </a>
      </>
    );
  }
  if (patchMode) return <div className="text-muted">Je souhaite metre à jour mon offre pass culture pour cet événement</div>;
  return <div className="text-muted">Je souhaite créer une offre pass culture pour cet événement</div>;
}

export default ({ value, onChange, timings = [], settings, location, longDesc, title }) => {
  const [modal, setModal] = useState(false);
  const [isLoadingPassData, setIsLoadingPassData] = useState(true);
  const [passSettingsData, setPassSettingsData] = useState({});
  const [hasAccess, setHasAccess] = useState(false);

  const patchMode = useMemo(() => isPatchMode(value || []), [value]);

  const hasData = useMemo(() => !!Object.keys(value ?? {}).length, [value]);
  const hasSettingsData = useMemo(() => !!Object.keys(passSettingsData).length, [passSettingsData]);
  const currentValue = useMemo(() => getCurrentValue(value), [value]);

  const offerWasRejected = useMemo(() => !!currentValue.isRejected === true, [currentValue]);
  const offerIsPending = useMemo(() => !!currentValue.isPending === true, [currentValue]);
  const offerHasError = useMemo(() => !!currentValue.error, [currentValue]);

  const currLogoPath = useMemo(() => {
    if (offerWasRejected) return rejectedLogoPath;
    if (offerIsPending) return pendingLogoPath;
    if (offerHasError) return errorLogoPath;
    return logoPath;
  }, [offerWasRejected, offerHasError, offerIsPending]);

  const upcomingTimings = useMemo(() => {
    if (!Array.isArray(timings)) {
      return [];
    }
    const now = new Date().getTime();
    return timings.filter(({ begin }) => getTime(begin) > now);
  }, [timings]);

  const issues = useMemo(
    () =>
      []
        .concat(!upcomingTimings.length ? 'Des horaires à venir doivent être saisis dans le champ Horaires' : [])
        .concat(
          hasData
            && hasSettingsData
            && !validateLocalData(currentValue, { timings }, { boolMode: true, ...passSettingsData })
            ? 'Les données Pass saisies sont soit erronées soit incomplètes.'
            : [],
        ),
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
      })
      .catch(() => {
        setHasAccess(false);
      });
  }, [settings]);

  const onCheck = useCallback(() => {
    setModal(offerWasRejected ? 'unlink' : 'show');
  }, [offerWasRejected]);

  const onDetach = useCallback(() => {
    setModal(null);
    onChange(null);
  }, [onChange]);

  const onClear = useCallback(() => {
    if (patchMode) onChange(value);
    else onChange(null);
    setModal(null);
  }, [onChange, patchMode, value]);

  const onSubmit = useCallback(
    v => {
      if (v.eventDuration === '') delete v.eventDuration;
      onChange(v);
      setModal(null);
    },
    [onChange],
  );

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
          editPassHRef={settings.res.offerEditLink.replace(':id', value[0]?.response?.passId)}
          onConfirm={onDetach}
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
            disabled={!hasData && !upcomingTimings.length}
          />
          <Image className="margin-left-sm" src={currLogoPath} alt="Logo Pass Culture" width={100} />
          {checkboxText({
            offerWasRejected,
            offerIsPending,
            offerHasError,
            patchMode,
            settings,
            value,
          })}
          {!patchMode && !isLoadingPassData && issues.length ? (
            <ul className="padding-left-sm">
              {issues.map(issue => (
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
