export default function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || 'active';
  const inactiveClass = filter.inactiveClass || 'inactive';
  const { classList } = filter.activeTargetElem || filter.elem;

  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
  }
}
