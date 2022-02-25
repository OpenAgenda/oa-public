export default function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || 'active';
  const inactiveClass = filter.inactiveClass || 'inactive';
  const { classList } = filter.activeTargetElem || filter.elem;

  const handlerElem = filter.handlerElem || filter.elem;
  const innerCheckboxes = handlerElem.querySelectorAll('input[type="checkbox"]');
  const checkbox = innerCheckboxes.length === 1 && !filter.handlerElem ? innerCheckboxes[0] : null;

  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
    if (checkbox && !checkbox.checked) checkbox.checked = true;
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
    if (checkbox && checkbox.checked) checkbox.checked = false;
  }
}
