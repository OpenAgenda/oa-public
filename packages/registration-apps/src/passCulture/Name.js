import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context.js';

export default function Name({ value, onChange, title }) {
  const { Input } = useContext(ComponentsContext);
  const [name, setName] = useState(value.name || title);

  return (
    <Input
      id="name"
      placeholder="Saisissez votre nom d'offre"
      value={name}
      type="string"
      onChange={(e) => {
        setName(e.target.value);
        onChange(e.target.value);
      }}
      maxLength="90"
      label="Nom de l'offre"
      info={
        name?.length > 90
          ? "La longueur du titre de l'événement excède la longueur autorisée par le pass. Adaptez la saisie pour éviter un troncage arbitraire"
          : null
      }
      warning={name?.length > 90}
    />
  );
}
