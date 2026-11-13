import * as dateFns from 'date-fns';

// What an edit makes of a timing already in the value: its new span, and
// everything else it carried — its `id` above all, which names it to whoever
// handed the value in. Moved, resized or edited in the form, it is the same
// timing at another hour; only a new one comes without an id.
export default function editedTiming(previous, next) {
  return { ...previous, ...next };
}

// Whether `v` is the timing `target` names: by its id when it has one, so two
// timings on the same span stay apart; else by its span, compared as instants
// — the value is rebuilt from the props on every render, and a reference kept
// from before may no longer be in it.
export function isSameTiming(v, target) {
  if (target.id !== undefined) {
    return v.id === target.id;
  }

  return (
    dateFns.isEqual(v.begin, target.begin) && dateFns.isEqual(v.end, target.end)
  );
}
