import React, { useCallback, useEffect, useRef } from 'react';
import { useForm, FormSpy } from 'react-final-form';
import { useLatest } from 'react-use';
import matchQuery from '../../utils/matchQuery';
import updateFormValues from '../../utils/updateFormValues';
import updateCustomFilter from '../../utils/updateCustomFilter';
import FilterPreviewer from '../FilterPreviewer';
import useFavoriteState from '../hooks/useFavoriteState';

const subscription = { values: true };

function Preview({
  name = 'favorites',
  filter,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  agendaUid,
  ...rest
}) {
  const form = useForm();
  const [value] = useFavoriteState(agendaUid);

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      updateFormValues(form, {
        uid: undefined,
        favorites: undefined
      }, false);
    },
    [disabled, form]
  );

  return (
    <FormSpy subscription={subscription}>
      {({ values }) => {
        const query = {
          uid: value,
          favorites: '1'
        };

        if (!matchQuery(values, query) || !activeFilterLabel) {
          return null;
        }

        return React.createElement(component, {
          name,
          label: activeFilterLabel,
          onRemove,
          disabled,
          filter,
          ...rest,
        });
      }}
    </FormSpy>
  );
}

// Favorite + uid
const FavoritesFilter = React.forwardRef(function FavoriteFilter({ agendaUid, filter }, _ref) {
  const form = useForm();
  const firstRender = useRef(true);
  const [value] = useFavoriteState(agendaUid);

  const latestValue = useLatest(value);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      const query = form.getState().values;
      const registeredFields = form.getRegisteredFields();

      if (!registeredFields.includes('uid')) {
        form.registerField('uid', () => {
        }, { value: true }, {
          initialValue: query.uid
        });
      }

      if (!registeredFields.includes('favorites')) {
        form.registerField('favorites', () => {
        }, { value: true }, {
          initialValue: !!query.favorite
        });
      }
    }

    const clickHandler = e => {
      e.preventDefault();
      const query = form.getState().values;

      const matchingQuery = {
        uid: latestValue.current || ['-1'],
        favorites: '1'
      };

      const isMatchQuery = matchQuery(query, matchingQuery);

      const newQuery = filter.exclusive && !isMatchQuery
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
    };

    const handlerElem = filter.handlerElem || filter.elem;

    handlerElem.addEventListener('click', clickHandler, false);

    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(filter, matchQuery(values, {
        uid: latestValue.current || ['-1'],
        favorites: '1'
      })),
      { values: true }
    );

    return () => {
      handlerElem.removeEventListener('click', clickHandler, false);
      unsubscribe();
    };
  }, [filter, form, latestValue]);

  return null;
});

const exported = React.memo(FavoritesFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
