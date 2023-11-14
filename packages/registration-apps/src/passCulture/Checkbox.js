import { useState, useCallback, useMemo } from 'react';
import { Image } from '@openagenda/react-shared';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getTime } from '@openagenda/registrations/passCulture/iso/utils';

import FormModal from './FormModal';
import { logoPath } from './utils';

export default ({
  value,
  onChange,
  timings = [],
  settings,
}) => {
  const [showModal, setShowModal] = useState(false);

  const hasData = Object.keys(value ?? {}).length;

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
    setShowModal(true);
  }, []);

  const onClear = useCallback(() => {
    onChange(null);
    setShowModal(false);
  }, [onChange]);

  const onSubmit = useCallback(v => {
    onChange(v);
    setShowModal(false);
  }, [onChange]);

  return (
    <>
      {showModal ? (
        <FormModal
          timings={timings}
          settings={settings}
          value={value}
          onClose={() => setShowModal(false)}
          onSubmit={onSubmit}
          onClear={onClear}
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
          <Image
            className="margin-left-sm"
            src={logoPath}
            alt="Logo Pass Culture"
            width={100}
          />
          <div className="text-muted">Je souhaite créer une billetterie pass culture pour cet événement</div>
          {issues.length ? (
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
