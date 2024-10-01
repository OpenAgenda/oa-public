import { getTimingId } from '@openagenda/registrations/passCulture/iso/utils';
import { useContext, useState, useEffect } from 'react';
import ComponentsContext from '../components/Context';

function padNumber(number) {
  return number < 10 ? `0${number}` : `${number}`;
}

function calculateTimeDifference(timing) {
  const beginTimestamp = new Date(
    `${timing.begin.date}T${padNumber(timing.begin.hours)}:${padNumber(timing.begin.minutes)}:00`,
  ).getTime();
  const endTimestamp = new Date(
    `${timing.end.date}T${padNumber(timing.end.hours)}:${padNumber(timing.end.minutes)}:00`,
  ).getTime();

  const beginTime = new Date(beginTimestamp);
  const endTime = new Date(endTimestamp);
  const timeDifference = endTime - beginTime; // Difference in milliseconds
  const minutesDifference = timeDifference / (1000 * 60); // Convert milliseconds to minutes
  return minutesDifference;
}

export default function Duration({ value, onChange, timings }) {
  const { Input } = useContext(ComponentsContext);
  const TimingsWithId = timings.map((t) => ({ ...t, id: getTimingId(t) }));

  const [duration, setDuration] = useState(value.eventDuration || null);

  useEffect(() => {
    if (value?.dates?.length && !value.eventDuration) {
      const choseTiming = TimingsWithId.find(
        (t) => t.id === value.dates[0].timingId,
      );
      const preloadedDuration = calculateTimeDifference(choseTiming);
      setDuration(preloadedDuration);
      onChange(preloadedDuration);
    }
  }, [TimingsWithId, value?.dates, value.eventDuration, onChange]);

  return (
    <Input
      id="name"
      placeholder="Durée de l'offre en minutes"
      value={duration}
      type="number"
      onChange={(e) => {
        setDuration(e.target.value);
        onChange(e.target.value);
      }}
      maxLength="90"
      label="Durée de l'offre"
      info="En minutes"
    />
  );
}
