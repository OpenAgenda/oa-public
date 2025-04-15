import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context.js';

export default function BookingEmail({
  value,
  onChange,
  settingsBookingEmail,
}) {
  const { Input, Checkbox } = useContext(ComponentsContext);

  const [check, setCheck] = useState(true);
  const [bookingEmail, setbookingEmail] = useState(
    value.bookingEmail || settingsBookingEmail || null,
  );

  return (
    <>
      <Checkbox
        info="Permet de recevoir un mail de notification lors d'une réservation"
        value={check}
        onChange={() => {
          setCheck(!check);
          onChange(!check ? bookingEmail : null);
        }}
        label=" Définir un email de notification"
      />
      {check ? (
        <Input
          id="booking-email"
          placeholder="Saisissez votre email"
          value={bookingEmail}
          type="email"
          onChange={(e) => {
            setbookingEmail(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : null}
    </>
  );
}
