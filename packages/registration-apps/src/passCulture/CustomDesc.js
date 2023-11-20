import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context';

export default function CustomDesc({
  value,
  onChange,
}) {
  const {
    Textarea,
    Checkbox,
  } = useContext(ComponentsContext);
  const [check, setCheck] = useState(!!value.customDesc);
  const [customDesc, setCustomDesc] = useState(value.customDesc || null);

  return (
    <>
      <Checkbox
        info="Par défaut, la description longue de l'événement est utilisée"
        value={check}
        onChange={() => { setCheck(!check); onChange(!check ? customDesc : null); }}
        label=" Personnaliser la description de l'offre"
      />
      {check ? (
        <Textarea
          max="1000"
          placeholder="Saisissez votre description"
          value={customDesc}
          onChange={e => { setCustomDesc(e.target.value); onChange(e.target.value); }}
        />
      ) : null}
    </>
  );
}
