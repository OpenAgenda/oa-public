import * as dateFns from 'date-fns';

// What an edit makes of a timing already in the value: its new span, and
// everything else it carried — its `id` above all, which names it to whoever
// handed the value in. Moved, resized or edited in the form, it is the same
// timing at another hour; only a new one comes without an id.
export default function editedTiming(previous, next) {
  return { ...previous, ...next };
}

// Whether `v` is the timing `target` was taken from: the same span, compared
// as instants. The value is rebuilt from the props on every render, and a
// reference kept from before may no longer be in it. Two timings on one span
// cannot be made in the picker, which refuses overlaps; handed in, they go
// together, as an edit in the form always had them.
export function isSameTiming(v, target) {
  return (
    dateFns.isEqual(v.begin, target.begin) && dateFns.isEqual(v.end, target.end)
  );
}
