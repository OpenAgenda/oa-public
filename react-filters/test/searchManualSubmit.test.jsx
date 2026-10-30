/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Field, useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';
import SearchInput from '../src/components/fields/SearchInput.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderSearch({ manualSearch, displayReset, onChange, ...props }) {
  let form;

  function GrabForm() {
    form = useForm();
    // final-form only counts registered fields as dirty
    useField('city', { subscription: {} });
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
          displayReset={displayReset}
          onChange={onChange}
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
    change: (name, value) => act(() => form.change(name, value)),
    click: () =>
      act(() => {
        fireEvent.click(screen.getByRole('button'));
      }),
    button: () => screen.getByRole('button').getAttribute('aria-label'),
    field: () => screen.getByRole('textbox').value,
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

  test('the search button submits the typed search, onChange once per keystroke', () => {
    const onSubmit = jest.fn();
    const onChange = jest.fn();
    const { type, click } = renderSearch({
      manualSubmit: true,
      manualSearch: true,
      onSubmit,
      onChange,
    });

    type('c');
    type('co');
    click();

    expect(onSubmit.mock.calls.map(([values]) => values)).toEqual([
      { search: 'co' },
    ]);
    expect(onChange.mock.calls).toEqual([['c'], ['co']]);
  });

  test.each([false, true])(
    'with displayReset, the button searches until the text is applied (manualSearch: %s)',
    (manualSearch) => {
      const onSubmit = jest.fn();
      const { type, click, button, field } = renderSearch({
        manualSubmit: true,
        manualSearch,
        displayReset: true,
        onSubmit,
      });

      type('concert');
      expect(button()).toBe('Search');

      click();
      expect(onSubmit.mock.calls.at(-1)[0]).toEqual({ search: 'concert' });
      expect(field()).toBe('concert');
      expect(button()).toBe('Reset search');

      type('concerts');
      expect(button()).toBe('Search');

      type('concert');
      expect(button()).toBe('Reset search');

      click();
      expect(onSubmit.mock.calls.at(-1)[0]).toEqual({});
      expect(field()).toBe('');
    },
  );

  test('with displayReset, an initial search shows the reset button', () => {
    const { type, button } = renderSearch({
      manualSubmit: true,
      displayReset: true,
      initialValues: { search: 'concert' },
    });

    expect(button()).toBe('Reset search');

    type('concerts');
    expect(button()).toBe('Search');
  });

  test('with displayReset, the search button applies pending filters with the text', () => {
    const onSubmit = jest.fn();
    const { type, change, click } = renderSearch({
      manualSubmit: true,
      manualSearch: true,
      displayReset: true,
      onSubmit,
    });

    change('city', ['Paris']);
    type('concert');
    click();

    expect(onSubmit.mock.calls[0][0]).toEqual({
      city: ['Paris'],
      search: 'concert',
    });
  });

  test('an empty initial search is not pending once the text is erased', () => {
    const onPendingChange = jest.fn();
    const { type } = renderSearch({
      manualSubmit: true,
      manualSearch: true,
      initialValues: { search: '' },
      onPendingChange,
    });

    type('concert');
    type('');

    expect(onPendingChange.mock.calls).toEqual([
      [true, { search: 'concert' }],
      [false, {}],
    ]);
  });

  test('manualSearch alone still waits for the search button', () => {
    jest.useFakeTimers();
    try {
      const onSubmit = jest.fn();
      const { type } = renderSearch({ manualSearch: true, onSubmit });

      type('concert');
      act(() => jest.advanceTimersByTime(500));

      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
