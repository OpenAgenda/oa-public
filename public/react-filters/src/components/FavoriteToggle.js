import isEqual from 'lodash/isEqual.js';
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useLatest } from 'react-use';
import { useForm } from 'react-final-form';
import a11yButtonActionHandler from '@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js';
import updateCustomFilter from '../utils/updateCustomFilter.js';
import updateFormValues from '../utils/updateFormValues.js';
import { useFavoriteState } from '../hooks/index.js';

export default function FavoriteToggle({ agendaUid, eventUid, widget }) {
  const form = useForm();
  const [value, setValue] = useFavoriteState(widget.agendaUid || agendaUid);
  const firstRender = useRef(true);

  const latestValue = useLatest(value);

  const eventUidStr = String(eventUid);

  const updateForm = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const active = latestValue.current?.includes(eventUidStr);
      const newValue = active
        ? latestValue.current.filter((v) => v !== eventUidStr)
        : [...latestValue.current || [], eventUidStr].filter(
          (v) => v !== '-1',
        );

      setValue(newValue.length ? newValue : undefined);
    },
    [eventUidStr, latestValue, setValue],
  );

  const onChange = useMemo(
    () => a11yButtonActionHandler(updateForm),
    [updateForm],
  );

  // Add & remove click listener
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      if (latestValue.current?.includes(eventUidStr)) {
        updateCustomFilter(widget, true);
      }
    }

    const handlerElem = widget.handlerElem || widget.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]',
    );

    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1
      && handlerElem.tagName === 'LABEL'
      && handlerElem.contains(innerCheckboxes[0]);

    if (
      innerCheckboxes.length === 1
      && (!widget.handlerElem || handlerIsLabelWithCheckbox)
    ) {
      innerCheckboxes[0].addEventListener('change', updateForm, false);
    } else {
      handlerElem.addEventListener('click', onChange, false);
    }

    handlerElem.addEventListener('keydown', onChange, false);

    return () => {
      if (
        innerCheckboxes.length === 1
        && (!widget.handlerElem || handlerIsLabelWithCheckbox)
      ) {
        innerCheckboxes[0].removeEventListener('change', updateForm, false);
      } else {
        handlerElem.removeEventListener('click', onChange, false);
      }

      handlerElem.removeEventListener('keydown', onChange, false);
    };
  }, [eventUidStr, widget, latestValue, onChange]);

  // Watch value change
  useEffect(() => {
    const active = value?.includes(eventUidStr);

    updateCustomFilter(widget, active);

    const formValues = form.getState().values;

    // if favorties filter checked
    if (formValues.favorites && !isEqual(formValues.uid, value)) {
      updateFormValues(form, {
        uid: value || ['-1'],
      });
    }
  }, [form, eventUidStr, value, widget]);

  return null;
}
