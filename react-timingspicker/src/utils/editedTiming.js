// What an edit makes of a timing already in the value: its new span, and
// everything else it carried — its `id` above all, which names it to whoever
// handed the value in. Moved, resized or edited in the form, it is the same
// timing at another hour; only a new one comes without an id.
export default function editedTiming(previous, next) {
  return { ...previous, ...next };
}
