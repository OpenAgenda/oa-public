import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context.js';

export default function Description({
  value,
  onChange,
  longDesc,
  longDescWarning: _longDescWarning,
}) {
  const { Textarea } = useContext(ComponentsContext);
  const [description, setDescription] = useState(value.description || '');

  const handleUseEventDescription = () => {
    const isEmptyOrNullObject = typeof longDesc === 'object'
      && longDesc !== null
      && (Object.keys(longDesc).length === 0
        || Object.values(longDesc).every((val) => val === null || val === ''));
    const descToUse = isEmptyOrNullObject ? '' : longDesc || '';
    setDescription(descToUse);
    onChange(descToUse);
  };

  return (
    <div>
      <Textarea
        label="Description de l'offre"
        required
        info={(
          <>
            Adaptez la description de votre offre afin de la rendre la plus
            parlante possible pour le public des 15-20 ans. Tous nos conseils à
            ce sujet sont disponibles{' '}
            <a
              href="https://passculture.docsend.com/view/c5ywca7ximmi5it2"
              target="_blank"
              rel="noopener noreferrer"
            >
              ici
            </a>{' '}
            !
          </>
        )}
        max="1000"
        placeholder="Saisissez votre description"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          onChange(e.target.value);
        }}
      />

      {description?.length > 1000 && (
        <div className="text-danger text-xs margin-top-xs">
          Attention votre description actuelle fait plus de 1000 caracteres
        </div>
      )}

      <button
        type="button"
        className="btn btn-link margin-top-xs text-sm padding-all-z"
        onClick={handleUseEventDescription}
      >
        Charger la description longue de l&apos;événement
      </button>
    </div>
  );
}
