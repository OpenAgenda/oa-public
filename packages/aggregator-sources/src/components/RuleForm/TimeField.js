import MaskedInput from 'react-text-mask';

function timeMask(value) {
  const chars = value.split('');

  let hours;
  if (chars[0] === '0' || chars[0] === '1' || chars[0] === '2') {
    if (chars[1] === ':') {
      // only one digit before the colon: "0", "1", "2"
      hours = [/[0-2]/];
    } else {
      // two digits: 00, 01, 02, 03, 04, ..., 18, 19, 20, 21, 22, 23
      hours = [/[0-2]/, chars[2] === '2' ? /[0-3]/ : /[0-9]/];
    }
  } else {
    // one digit greater than two: 3, 4, 5, 6, 7, 8, 9
    hours = [/[3-9]/];
  }

  // minutes is always two-digits
  const minutes = [/[0-5]/, /[0-9]/];

  return hours.concat(':').concat(minutes);
}

export default function TimeField({ value, onChange }) {
  return (
    <MaskedInput
      value={value || ''}
      className="form-control text-center margin-left-sm"
      mask={timeMask}
      placeholder="HH:MM"
      // keepCharPositions
      onChange={onChange}
      style={{
        width: '75px',
      }}
    />
  );
}
