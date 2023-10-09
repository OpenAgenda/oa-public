import { useState, useCallback } from 'react';
import { Image } from '@openagenda/react-shared';
import FormModal from './FormModal';

const logoPath = 'https://oasvc.s3.eu-west-1.amazonaws.com/registration-apps/pass-culture-240.png';

export default ({
  value,
  onChange,
  timings = [],
  settings,
}) => {
  const [showModal, setShowModal] = useState(false);

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
          />
          <Image
            className="margin-left-sm"
            src={logoPath}
            alt="Logo Pass Culture"
            width={100}
          />
          <div className="text-muted">Je souhaite créer une billeterie pass culture pour cet événement</div>
        </label>
      </div>
    </>
  );
};
