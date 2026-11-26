import * as dateFns from 'date-fns';

// What an edit makes of a timing already in the value: its new span, and
// everything else it carried — its `id` above all, which names it to whoever
// handed the value in. Moved, resized or edited in the form, it is the same
// timing at another hour; only a new one comes without an id.
export default function editedTiming(previous, next) {
  return { ...previous, ...next };
}

// Whether `v` is the timing `target` was taken from. By its `id` when it has
// one: two timings handed in on one span are two timings, and an edit of one
// leaves the other. Else by its span, compared as instants — the value is
// rebuilt from the props on every render, and a reference kept from before
// may no longer be in it — among the timings that have no id, which an
// id-less target cannot be.
const hasId = (timing) => timing.id !== undefined && timing.id !== null;

export function isSameTiming(v, target) {
  if (hasId(target)) {
    return v.id === target.id;
  }

  return (
    !hasId(v)
    && dateFns.isEqual(v.begin, target.begin)
    && dateFns.isEqual(v.end, target.end)
  );
}
