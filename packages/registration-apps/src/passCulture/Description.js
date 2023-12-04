import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context';

export default function Description({
  value,
  onChange,
}) {
  const {
    Textarea,
    Checkbox,
  } = useContext(ComponentsContext);
  const [check, setCheck] = useState(!!value.description);
  const [description, setDescription] = useState(value.description || null);

  return (
    <>
      <Checkbox
        info="Par défaut, la description longue de l'événement est utilisée"
        value={check}
        onChange={() => { setCheck(!check); onChange(!check ? description : null); }}
        label=" Personnaliser la description de l'offre"
      />
      {check ? (
        <Textarea
          max="1000"
          placeholder="Saisissez votre description"
          value={description}
          onChange={e => { setDescription(e.target.value); onChange(e.target.value); }}
        />
      ) : null}
    </>
  );
}
