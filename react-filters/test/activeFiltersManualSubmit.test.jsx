/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';
import ActiveFilters from '../src/components/ActiveFilters.jsx';
import AppliedValuesForm from '../src/components/AppliedValuesForm.jsx';
import Sort from '../src/components/Sort.jsx';
import useActiveFilters from '../src/hooks/useActiveFilters.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const filters = [
  { name: 'city', type: 'choice' },
  { name: 'keyword', type: 'choice' },
];

const options = {
  city: ['Paris', 'Lyon', 'Nantes'],
  keyword: ['jazz', 'rock'],
};

const getOptions = (filter) =>
  options[filter.name].map((value) => ({ value, label: value }));

function renderActiveFiltersWith(props, children) {
  let form;

  function GrabForm() {
    form = useForm();
    // final-form only counts registered fields as dirty
    useField('city', { subscription: {} });
    useField('keyword', { subscription: {} });
    return null;
  }

  render(
    <IntlProvider locale="en">
      <FiltersProvider filters={filters} onSubmit={() => {}} {...props}>
        <GrabForm />
        {children}
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    form: () => form,
    change: (name, value) => act(() => form.change(name, value)),
    submit: () => act(() => form.submit()),
  };
}

function renderActiveFilters(props) {
  return renderActiveFiltersWith(
    props,
    <ActiveFilters filters={filters} getOptions={getOptions} />,
  );
}

const searchFilters = [{ name: 'search', type: 'search' }];

function renderSearchAndSort(props, extra = null) {
  let form;

  function GrabForm() {
    form = useForm();
    useField('search', { subscription: {} });
    return null;
  }

  render(
    <IntlProvider locale="en">
      <FiltersProvider filters={searchFilters} manualSubmit {...props}>
        <GrabForm />
        <Sort
          options={['lastTimingWithFeatured.asc', 'updatedAt.desc', 'score']}
        />
        <ActiveFilters filters={searchFilters} getOptions={getOptions} />
        {extra}
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    form: () => form,
    change: (name, value) => act(() => form.change(name, value)),
    submit: () => act(() => form.submit()),
    removeBadge: (name) =>
      act(() => {
        fireEvent.click(screen.getByRole('button', { name }));
      }),
  };
}

const badges = () =>
  screen.queryAllByRole('button').map((button) => button.textContent.trim());

describe('ActiveFilters', () => {
  test('follow the selection at once in automatic mode', () => {
    const { change } = renderActiveFilters({
      initialValues: { city: ['Paris'] },
    });

    change('city', ['Paris', 'Lyon']);

    expect(badges()).toEqual(['Paris', 'Lyon']);
  });

  test('with manual submit, show the applied values until a submit', () => {
    const { change, submit } = renderActiveFilters({
      manualSubmit: true,
      initialValues: { city: ['Paris'] },
    });

    change('city', ['Paris', 'Lyon']);

    expect(badges()).toEqual(['Paris']);

    submit();

    expect(badges()).toEqual(['Paris', 'Lyon']);
  });

  test('with manual submit, apply a removed value alone, pending changes kept', () => {
    const onSubmit = jest.fn();
    const onPendingChange = jest.fn();
    const { form, change } = renderActiveFilters({
      manualSubmit: true,
      initialValues: { city: ['Paris'], keyword: ['jazz'] },
      onSubmit,
      onPendingChange,
    });

    change('keyword', ['jazz', 'rock']);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Paris/ }));
    });

    // the list loses Paris, not the pending keyword
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toStrictEqual({ keyword: ['jazz'] });
    expect(badges()).toEqual(['jazz']);

    // the filter loses Paris, the keyword keeps its pending value
    expect(form().getState().values).toEqual({
      city: undefined,
      keyword: ['jazz', 'rock'],
    });
    // still pending, on the keyword: no new transition
    expect(onPendingChange).toHaveBeenCalledTimes(1);
    expect(form().getSubmittedValues()).toStrictEqual({ keyword: ['jazz'] });
  });

  test('with manual submit, realign a filter with pending values on the removal', () => {
    const onSubmit = jest.fn();
    const { form, change } = renderActiveFilters({
      manualSubmit: true,
      initialValues: { city: ['Paris', 'Lyon'] },
      onSubmit,
    });

    change('city', ['Paris', 'Lyon', 'Nantes']);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Lyon/ }));
    });

    expect(onSubmit.mock.calls[0][0]).toEqual({ city: ['Paris'] });
    expect(form().getState().values).toEqual({ city: ['Paris'] });
  });

  test('with manual submit, clear a single-value filter whose applied value is removed', () => {
    const onSubmit = jest.fn();
    const filtersWithRadio = [{ name: 'city', type: 'choice' }];
    let form;

    function GrabForm() {
      form = useForm();
      useField('city', { subscription: {} });
      return null;
    }

    render(
      <IntlProvider locale="en">
        <FiltersProvider
          filters={filtersWithRadio}
          onSubmit={onSubmit}
          manualSubmit
          initialValues={{ city: 'Paris' }}
        >
          <GrabForm />
          <ActiveFilters filters={filtersWithRadio} getOptions={getOptions} />
        </FiltersProvider>
      </IntlProvider>,
    );

    act(() => form.change('city', 'Lyon'));
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Paris/ }));
    });

    expect(onSubmit.mock.calls[0][0]).toStrictEqual({});
    expect(form.getState().values).toEqual({ city: undefined });
  });

  test('with manual submit, apply what Sort changes when the search badge goes', () => {
    const onSubmit = jest.fn();
    const onPendingChange = jest.fn();
    let form;

    function GrabForm() {
      form = useForm();
      useField('search', { subscription: {} });
      return null;
    }

    render(
      <IntlProvider locale="en">
        <FiltersProvider
          filters={searchFilters}
          onSubmit={onSubmit}
          onPendingChange={onPendingChange}
          manualSubmit
          initialValues={{ search: 'jazz', sort: 'score' }}
        >
          <GrabForm />
          <Sort />
          <ActiveFilters filters={searchFilters} getOptions={getOptions} />
        </FiltersProvider>
      </IntlProvider>,
    );

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /jazz/ }));
    });

    // relevance leaves with the search, in the list as in the form
    expect(onSubmit.mock.calls[0][0]).toStrictEqual({});
    expect(form.getState().values).toEqual({});
    expect(onPendingChange).not.toHaveBeenCalled();
  });

  test('with manual submit, report a failing onFilterChange on a badge', async () => {
    const error = new Error('down');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderActiveFilters({
      manualSubmit: true,
      initialValues: { city: ['Paris'] },
      onSubmit: () => Promise.reject(error),
    });

    try {
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Paris/ }));
      });

      expect(consoleError).toHaveBeenCalledWith('onFilterChange failed', error);
    } finally {
      consoleError.mockRestore();
    }
  });

  test('with manual submit, AppliedValuesForm serves the applied values to custom active filters', () => {
    function CustomActiveFilters() {
      const active = useActiveFilters(filters);
      return (
        <p data-testid="active">{active.map(({ name }) => name).join(',')}</p>
      );
    }

    const { change } = renderActiveFiltersWith(
      { manualSubmit: true, initialValues: { city: ['Paris'] } },
      <AppliedValuesForm>
        <CustomActiveFilters />
      </AppliedValuesForm>,
    );

    change('keyword', ['jazz']);

    expect(screen.getByTestId('active').textContent).toBe('city');
  });

  describe('with manual submit, relevance never applied without a search', () => {
    test('a search typed and submitted during the visit, then its badge removed', () => {
      const onSubmit = jest.fn();
      const { form, change, submit, removeBadge } = renderSearchAndSort({
        onSubmit,
        initialValues: { sort: 'updatedAt.desc' },
      });

      change('search', 'jazz');
      submit();

      expect(onSubmit.mock.calls[0][0]).toStrictEqual({
        search: 'jazz',
        sort: 'score',
      });

      removeBadge(/jazz/);

      expect(onSubmit.mock.calls[1][0]).toStrictEqual({
        sort: 'updatedAt.desc',
      });
      expect(form().getState().values).toStrictEqual({
        sort: 'updatedAt.desc',
      });
    });

    test('a search cleared in the field and submitted, after an earlier submit (#713)', () => {
      const onSubmit = jest.fn();
      const { form, change, submit } = renderSearchAndSort({
        onSubmit,
        initialValues: { sort: 'updatedAt.desc' },
      });

      change('search', 'jazz');
      submit();
      change('search', undefined);
      submit();

      expect(onSubmit.mock.calls[1][0]).toStrictEqual({
        sort: 'updatedAt.desc',
      });
      expect(form().getState().values.sort).toBe('updatedAt.desc');
    });

    test('the search already cleared in the form, then its badge removed', () => {
      const onSubmit = jest.fn();
      const onPendingChange = jest.fn();
      const { form, change, removeBadge } = renderSearchAndSort({
        onSubmit,
        onPendingChange,
        initialValues: { search: 'jazz', sort: 'score' },
      });

      change('search', undefined);
      removeBadge(/jazz/);

      expect(onSubmit.mock.calls[0][0]).toStrictEqual({});
      expect(form().getState().values).toStrictEqual({});
      expect(onPendingChange).toHaveBeenLastCalledWith(false, {});
    });

    test('another order picked in the form, then the search badge removed', () => {
      const onSubmit = jest.fn();
      const { form, change, removeBadge } = renderSearchAndSort({
        onSubmit,
        initialValues: { search: 'jazz', sort: 'score' },
      });

      change('sort', 'updatedAt.desc');
      removeBadge(/jazz/);

      // the list leaves relevance for the order applied before it, and the
      // select realigns on what the list shows
      expect(onSubmit.mock.calls[0][0]).toStrictEqual({});
      expect(form().getState().values).toStrictEqual({});
    });
  });

  test('with manual submit, AppliedValuesForm hands submit and getSubmittedValues to the main form', () => {
    const onSubmit = jest.fn();
    let appliedForm;

    function GrabAppliedForm() {
      appliedForm = useForm();
      return null;
    }

    const { change } = renderActiveFiltersWith(
      { manualSubmit: true, initialValues: { city: ['Paris'] }, onSubmit },
      <AppliedValuesForm>
        <GrabAppliedForm />
      </AppliedValuesForm>,
    );

    change('keyword', ['jazz']);

    expect(appliedForm.getSubmittedValues()).toBeUndefined();

    act(() => appliedForm.submit());

    expect(onSubmit.mock.calls[0][0]).toStrictEqual({
      city: ['Paris'],
      keyword: ['jazz'],
    });
    expect(appliedForm.getSubmittedValues()).toStrictEqual({
      city: ['Paris'],
      keyword: ['jazz'],
    });
  });

  test('with manual submit, a value a field sets on mount under AppliedValuesForm is not applied', () => {
    const onSubmit = jest.fn();

    function FieldWithInitialValue() {
      useField('keyword', { initialValue: ['rock'], subscription: {} });
      return null;
    }

    renderActiveFiltersWith(
      { manualSubmit: true, initialValues: { city: ['Paris'] }, onSubmit },
      <AppliedValuesForm>
        <FieldWithInitialValue />
      </AppliedValuesForm>,
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe('with manual submit, AppliedValuesForm starts over from each removal', () => {
    function renderAppliedForm(onSubmit, initialValues) {
      let appliedForm;
      let showField;

      function FieldWithInitialValue() {
        useField('keyword', { initialValue: ['rock'], subscription: {} });
        return null;
      }

      function Applied() {
        const [fieldShown, setFieldShown] = useState(false);
        appliedForm = useForm();
        showField = () => setFieldShown(true);
        useField('city', { subscription: {} });
        return fieldShown ? <FieldWithInitialValue /> : null;
      }

      renderActiveFiltersWith(
        {
          manualSubmit: true,
          initialValues,
          onSubmit,
        },
        <AppliedValuesForm>
          <Applied />
        </AppliedValuesForm>,
      );

      return {
        change: (name, value) => act(() => appliedForm.change(name, value)),
        showField: () => act(() => showField()),
      };
    }

    test('a field mounting after a removal is not applied', () => {
      const onSubmit = jest.fn();
      const { change, showField } = renderAppliedForm(onSubmit, {
        city: ['Paris', 'Lyon'],
      });

      change('city', ['Paris']);
      showField();

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toStrictEqual({ city: ['Paris'] });
    });

    test('a value restored after a removal is applied', () => {
      const onSubmit = jest.fn();
      const { change } = renderAppliedForm(onSubmit, { city: 'Paris' });

      change('city', undefined);
      change('city', 'Paris');

      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(onSubmit.mock.calls[1][0]).toStrictEqual({ city: 'Paris' });
    });
  });
});
