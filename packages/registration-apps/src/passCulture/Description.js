import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context';

export default function Description({
  value,
  onChange,
  longDesc,
  longDescWarning,
}) {
  const { Textarea, Checkbox } = useContext(ComponentsContext);
  const [check, setCheck] = useState(!!value.description);
  const [description, setDescription] = useState(
    longDescWarning ? longDesc : value.description || null,
  );
  return (
    <Checkbox
      info={`Par défaut, la description longue de l'événement est utilisée${description?.length > 1000 ? '. Attention votre description actuelle fait plus de 1000 caracteres' : ''}`}
      value={check}
      onChange={() => {
        setCheck(!check);
        onChange(!check ? description : null);
      }}
      label=" Personnaliser la description de l'offre"
      warning={description?.length > 1000}
      sub={
        description?.length > 1000
          ? 'Attention votre description actuelle fait plus de 1000 caracteres'
          : null
      }
    >
      {check ? (
        <Textarea
          max="1000"
          placeholder="Saisissez votre description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : null}
    </Checkbox>
  );
}
