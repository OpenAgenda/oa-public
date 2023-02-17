import _ from 'lodash';
import { createElement, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { defineMessages, useIntl } from 'react-intl';
import { Field, FormSpy, useForm, useField, useFavoritesOnChange } from '@openagenda/react-filters';
import { Checkbox, Text } from '@openagenda/uikit';
import useIsomorphicEffect from 'hooks/useIsomorphicEffect';
import FilterPreviewer from './FilterPreviewer';

const messages = defineMessages({
  favorites: {
    id: 'next.views.AgendaShow.Favorites.favorites',
    defaultMessage: 'Favorites',
  },
});

function matchQuery(a, b) {
  return _.isMatch(_.omitBy(a, _.isEmpty), _.omitBy(b, _.isEmpty));
}

function parse(value) {
  return !value ? undefined : '1';
}

function FavoritesComp({ agenda, input: { checked: isChecked, ...input } }) {
  const intl = useIntl();
  const [favorites, setFavorites, { removeItem: removeFavorites }] = useLocalStorageState('favorites');
  const agendaFavorites = favorites?.[agenda.uid];

  const onChange = useFavoritesOnChange(agendaFavorites, { isExclusive: true });

  // Update legacy
  useIsomorphicEffect(() => {
    if (typeof favorites === 'string') {
      try {
        setFavorites(JSON.parse(favorites));
      } catch { // remove if json is invalid
        removeFavorites();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Text fontSize="md" fontWeight="bold" mb="3">
        {intl.formatMessage(messages.favorites)}
      </Text>
      <Checkbox isChecked={isChecked} {...input} onChange={onChange}>
        {intl.formatMessage(messages.favorites)}
      </Checkbox>
    </div>
  );
}

export function FavoritesPreviewer({
  name = 'favorites',
  filter,
  component = FilterPreviewer,
  disabled,
  agendaUid,
  ...rest
}) {
  const intl = useIntl();
  const form = useForm();
  const [favorites] = useLocalStorageState('favorites');
  const agendaFavorites = favorites?.[agendaUid];

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      form.batch(() => {
        form.change('uid', undefined);
        form.change('favorites', undefined);
      });
    },
    [disabled, form],
  );

  return (
    <FormSpy subscription={{ values: true }}>
      {({ values }) => {
        const query = {
          uid: agendaFavorites?.length ? agendaFavorites.map(String) : ['-1'],
          favorites: '1',
        };

        if (!matchQuery(values, query)) {
          return null;
        }

        return createElement(component, {
          name,
          label: intl.formatMessage(messages.favorites),
          onRemove,
          disabled,
          filter,
          ...rest,
        });
      }}
    </FormSpy>
  );
}

export default function FavoritesFilter({ agenda }) {
  // register uid field in form
  useField('uid');

  return (
    <Field
      name="favorites"
      type="checkbox"
      parse={parse}
      component={FavoritesComp as any}
      agenda={agenda}
    />
  );
}
