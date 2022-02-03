import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useLatest } from 'react-use';
import { useForm } from 'react-final-form';
import updateCustomFilter from '../utils/updateCustomFilter';
import updateFormValues from '../utils/updateFormValues';
import useFavoriteState from './hooks/useFavoriteState';

export default function FavoriteToggle({ agendaUid, eventUid, widget }) {
  const form = useForm();
  const [value, setValue] = useFavoriteState(agendaUid);
  const firstRender = useRef(true);

  const latestValue = useLatest(value);

  const eventUidStr = String(eventUid);

  // Add & remove click listener
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      if (latestValue.current?.includes(eventUidStr)) {
        updateCustomFilter(widget, true);
      }
    }

    const clickHandler = e => {
      e.preventDefault();

      const active = latestValue.current?.includes(eventUidStr);
      const newValue = active
        ? latestValue.current.filter(v => v !== eventUidStr)
        : [...(latestValue.current || []), eventUidStr].filter(v => v !== '-1');

      setValue(newValue.length ? newValue : undefined);
    };

    const handlerElem = widget.handlerElem || widget.elem;

    handlerElem.addEventListener('click', clickHandler, false);

    return () => {
      handlerElem.removeEventListener('click', clickHandler, false);
    };
  }, [eventUidStr, widget, latestValue, setValue]);

  // Watch value change
  useEffect(() => {
    const active = value?.includes(eventUidStr);

    updateCustomFilter(widget, active);

    const formValues = form.getState().values;

    // if favorties filter checked
    if (formValues.favorites && !_.isEqual(formValues.uid, value)) {
      updateFormValues(form, {
        uid: value || ['-1']
      });
    }
  }, [form, eventUidStr, value, widget]);

  return null;
}
