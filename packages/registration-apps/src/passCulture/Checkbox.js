import { useState, useCallback, useMemo, useEffect } from 'react';
import { Image, Spinner } from '@openagenda/react-shared';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate/index';
import {
  getTime,
  getCurrentValue,
} from '@openagenda/registrations/passCulture/iso/utils';

import FormModal from './FormModal.js';
import UnlinkModal from './UnlinkModal.js';
import {
  logoPath,
  rejectedLogoPath,
  errorLogoPath,
  pendingLogoPath,
  unpublishedLogoPath,
  isPatchMode,
} from './utils.js';

function checkboxText({
  offerWasRejected,
  offerIsPending,
  offerHasError,
  offerUnpublished,
  patchMode,
  settings,
  value,
}) {
  if (offerUnpublished) {
    return (
      <div className="text-muted">
        L&apos;offre sera créée à la publication de l&apos;événement
      </div>
    );
  }
  if (offerWasRejected) {
    return (
      <>
        <div className="text-danger">
          Cette offre a été rejetée par l&apos;equipe du pass. Décochez la case
          pour la dissocier.
        </div>
        <a
          rel="noreferrer"
          className="btn btn-link padding-all-z"
          target="_blank"
          href={settings.res.offerEditLink.replace(
            ':id',
            value[0]?.response?.passId,
          )}
        >
          Voir l&apos;offre sur la plateforme pass Culture
        </a>
      </>
    );
  }
  if (offerIsPending) {
    return (
      <div className="text-warning">
        L&apos;offre est en attente de validation par l&apos;équipe du Pass
        Culture.
      </div>
    );
  }
  if (offerHasError) {
    return (
      <div className="text-danger">
        L&apos;offre pass a été créée mais n&apos;a pas pu être complétée.
        <a
          href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=passCultureError}`}
          className="link-primary"
        >
          Contacter le support
        </a>
      </div>
    );
  }
  if (patchMode) {
    return (
      <div className="text-muted">
        Je souhaite mettre à jour mon offre pass culture pour cet événement
      </div>
    );
  }
  return (
    <div className="text-muted">
      Je souhaite créer une offre pass culture pour cet événement
    </div>
  );
}

export default ({
  access,
  value,
  onChange,
  timings = [],
  settings,
  location,
  longDesc,
  title,
  conditions,
  enabled = true,
}) => {
  const [modal, setModal] = useState(false);
  const [isLoadingPassData, setIsLoadingPassData] = useState(true);
  const [passSettingsData, setPassSettingsData] = useState({});
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [memberEmail, setMemberEmail] = useState(null);

  const patchMode = useMemo(() => isPatchMode(value || []), [value]);

  const hasData = useMemo(() => !!Object.keys(value ?? {}).length, [value]);
  const hasSettingsData = useMemo(
    () => !!Object.keys(passSettingsData).length,
    [passSettingsData],
  );
  const currentValue = useMemo(() => getCurrentValue(value), [value]);

  const offerWasRejected = useMemo(
    () => !!currentValue.isRejected === true,
    [currentValue],
  );
  const offerIsPending = useMemo(
    () => !!currentValue.isPending === true,
    [currentValue],
  );
  const offerHasError = useMemo(() => !!currentValue.error, [currentValue]);
  const offerUnpublished = useMemo(
    () => Object.keys(currentValue).length && !currentValue.passId,
    [currentValue],
  );

  const currLogoPath = useMemo(() => {
    if (offerWasRejected) return rejectedLogoPath;
    if (offerIsPending) return pendingLogoPath;
    if (offerHasError) return errorLogoPath;
    if (offerUnpublished) return unpublishedLogoPath;
    return logoPath;
  }, [offerWasRejected, offerHasError, offerIsPending, offerUnpublished]);

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
        .concat(
          !upcomingTimings.length
            ? 'Des horaires à venir doivent être saisis dans le champ Horaires'
            : [],
        )
        .concat(
          hasData
            && hasSettingsData
            && !validateLocalData(
              currentValue,
              { timings },
              { boolMode: true, ...passSettingsData },
            )
            ? 'Les données Pass saisies sont soit erronées soit incomplètes.'
            : [],
        ),
    [
      upcomingTimings,
      hasData,
      timings,
      passSettingsData,
      hasSettingsData,
      currentValue,
    ],
  );

  useEffect(() => {
    fetch(settings.res.settings)
      .then((r) => r.json())
      .then((data) => {
        setPassSettingsData(data);
        setIsLoadingPassData(false);
      });

    fetch(settings.res.context)
      .then((r) => r.json())
      .then((data) => {
        setUserRole(data.me.member.role);
        setMemberEmail(data.me.member.email);
        setHasAccess(access.includes(data.me.member?.role));
      })
      .catch(() => {
        setHasAccess(false);
      });
  }, []);

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
    (v) => {
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
          conditions={conditions}
          location={location}
          timings={upcomingTimings}
          categories={passSettingsData.categories}
          related={passSettingsData.related}
          offererVenues={passSettingsData.offererVenues}
          bookingEmail={
            userRole === 'contributor' ? memberEmail : settings?.bookingEmail
          }
          value={value || []}
          onClose={() => setModal(null)}
          onSubmit={onSubmit}
          onClear={onClear}
          patchMode={patchMode}
          defaultVenueId={settings?.defaultVenueId}
          userRole={userRole}
        />
      ) : null}
      {modal === 'unlink' ? (
        <UnlinkModal
          editPassHRef={settings.res.offerEditLink.replace(
            ':id',
            value[0]?.response?.passId,
          )}
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
            disabled={!enabled || (!hasData && !upcomingTimings.length)}
          />
          <Image
            className="margin-left-sm"
            src={currLogoPath}
            alt="Logo Pass Culture"
            width={100}
          />
          {checkboxText({
            offerWasRejected,
            offerIsPending,
            offerHasError,
            offerUnpublished,
            patchMode,
            settings,
            value,
          })}
          {!patchMode && !isLoadingPassData && issues.length ? (
            <ul className="padding-left-sm">
              {issues.map((issue) => (
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
