/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { act, render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('a submit', () => {
  test('goes through the latest props, not those at mount', () => {
    let form;

    function GrabForm() {
      form = useForm();
      useField('city', { subscription: {} });
      return null;
    }

    const renderWith = (props) => (
      <IntlProvider locale="en">
        <FiltersProvider filters={[]} {...props}>
          <GrabForm />
        </FiltersProvider>
      </IntlProvider>
    );

    const first = jest.fn();
    const latest = jest.fn();
    const { rerender } = render(renderWith({ onSubmit: first }));

    rerender(renderWith({ onSubmit: latest, manualSubmit: true }));
    act(() => form.change('city', ['Paris']));

    // manual submit taken into account: nothing applied before the submit
    expect(latest).not.toHaveBeenCalled();

    act(() => form.submit());

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
    expect(latest.mock.calls[0][0]).toStrictEqual({ city: ['Paris'] });
  });
});
