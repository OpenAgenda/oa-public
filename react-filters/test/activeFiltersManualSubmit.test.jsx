/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';
import ActiveFilters from '../src/components/ActiveFilters.jsx';

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

function renderActiveFilters(props) {
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
        <ActiveFilters filters={filters} getOptions={getOptions} />
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    form: () => form,
    change: (name, value) => act(() => form.change(name, value)),
    submit: () => act(() => form.submit()),
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
    expect(onSubmit.mock.calls[0][0]).toEqual({
      city: undefined,
      keyword: ['jazz'],
    });
    expect(badges()).toEqual(['jazz']);

    // the filter loses Paris, the keyword keeps its pending value
    expect(form().getState().values).toEqual({
      city: undefined,
      keyword: ['jazz', 'rock'],
    });
    // still pending, on the keyword: no new transition
    expect(onPendingChange).toHaveBeenCalledTimes(1);
    expect(form().getSubmittedValues()).toEqual({
      city: undefined,
      keyword: ['jazz'],
    });
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

    expect(onSubmit.mock.calls[0][0]).toEqual({ city: undefined });
    expect(form.getState().values).toEqual({ city: undefined });
  });
});
