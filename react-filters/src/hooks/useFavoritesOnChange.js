import { useCallback } from 'react';
import { useForm } from 'react-final-form';
import matchQuery from '../utils/matchQuery';
import updateFormValues from '../utils/updateFormValues';

export default function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = useForm();

  return useCallback(e => {
    e.preventDefault();
    e.stopPropagation();

    const query = form.getState().values;

    const matchingQuery = {
      uid: eventUids?.length ? eventUids.map(String) : ['-1'],
      favorites: '1',
    };

    const isMatchQuery = matchQuery(query, matchingQuery);

    const newQuery = isExclusive && !isMatchQuery
      ? form.getRegisteredFields().reduce((accu, next) => {
        if (next in matchingQuery) {
          accu[next] = matchingQuery[next];
          return accu;
        }

        accu[next] = undefined;

        return accu;
      }, {})
      : matchingQuery;

    // Without favorites in store
    if (!newQuery.uid?.length) {
      newQuery.uid = ['-1'];
    }

    updateFormValues(form, newQuery, !isMatchQuery);
  }, [isExclusive, form, eventUids]);
}
