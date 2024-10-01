import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context';

export default function Conditions({ value, onChange, conditions }) {
  const { Textarea, Checkbox } = useContext(ComponentsContext);
  const [check, setCheck] = useState(!!value.itemCollectionDetails);
  const [itemCollectionDetails, setItemCollectionDetails] = useState(
    conditions?.fr || conditions || value.itemCollectionDetails || null,
  );
  return (
    <Checkbox
      info={
        "Par défaut, les conditions de participation de l'événement sont utilisée. Vous pouvez les personnaliser ici."
      }
      value={check}
      onChange={() => {
        setCheck(!check);
        onChange(!check ? value.itemCollectionDetails : null);
      }}
      label=" Personnaliser les informations de retrait"
      warning={itemCollectionDetails?.length > 500}
      sub={
        itemCollectionDetails?.length > 500
          ? 'Attention votre saisie actuelle fait plus de 500 caracteres'
          : null
      }
    >
      {check ? (
        <Textarea
          max="500"
          placeholder="Saisissez vos informations de retrait"
          value={itemCollectionDetails}
          onChange={(e) => {
            setItemCollectionDetails(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : null}
    </Checkbox>
  );
}
