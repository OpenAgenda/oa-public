import { useState, useCallback, useMemo } from 'react';
import { Image } from '@openagenda/react-shared';
import FormModal from './FormModal';
import { isValid, logoPath, } from './utils';

export default ({
  value,
  onChange,
  timings = [],
  settings,
}) => {
  const [showModal, setShowModal] = useState(false);

  const hasTimings = !!(timings ?? [])?.length;
  const hasData = Object.keys(value ?? {}).length;

  const issues = useMemo(() => []
    .concat(!hasTimings ? 'Des horaires doivent être saisis dans le champ Horaires' : [])
    .concat(hasData && !isValid(value, timings) ? 'Les données Pass saisies sont soit erronées soit incomplètes.' : [])
  , [hasTimings, hasData, value, timings]);

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
            disabled={!hasData && !hasTimings}
          />
          <Image
            className="margin-left-sm"
            src={logoPath}
            alt="Logo Pass Culture"
            width={100}
          />
          <div className="text-muted">Je souhaite créer une billetterie pass culture pour cet événement</div>
          {issues.length ? <ul className="padding-left-sm">{issues.map(issue => (
            <li className="text-danger">{issue}</li>
          ))}</ul> : null}
        </label>
      </div>
    </>
  );
};
