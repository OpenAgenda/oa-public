/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Field, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';
import SearchInput from '../src/components/fields/SearchInput.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderSearch({ manualSearch, ...props }) {
  let form;

  function GrabForm() {
    form = useForm();
    return null;
  }

  render(
    <IntlProvider locale="en">
      <FiltersProvider filters={[]} onSubmit={() => {}} {...props}>
        <GrabForm />
        <Field
          name="search"
          component={SearchInput}
          manualSearch={manualSearch}
          type="text"
        />
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    type: (value) =>
      act(() => {
        fireEvent.change(screen.getByRole('textbox'), { target: { value } });
      }),
    submit: () => act(() => form.submit()),
  };
}

describe('search field with manualSubmit', () => {
  test.each([false, true])(
    'typing makes the filters pending (manualSearch: %s)',
    (manualSearch) => {
      const onPendingChange = jest.fn();
      const { type } = renderSearch({
        manualSubmit: true,
        manualSearch,
        onPendingChange,
      });

      type('concert');

      expect(onPendingChange.mock.calls).toEqual([
        [true, { search: 'concert' }],
      ]);
    },
  );

  test('a submit from the page carries the typed search with manualSearch', () => {
    const onSubmit = jest.fn();
    const { type, submit } = renderSearch({
      manualSubmit: true,
      manualSearch: true,
      onSubmit,
    });

    type('concert');
    submit();

    expect(onSubmit.mock.calls[0][0]).toEqual({ search: 'concert' });
  });

  test('manualSearch alone still waits for the search button', () => {
    jest.useFakeTimers();
    const onSubmit = jest.fn();
    const { type } = renderSearch({ manualSearch: true, onSubmit });

    type('concert');
    act(() => jest.advanceTimersByTime(500));

    expect(onSubmit).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
