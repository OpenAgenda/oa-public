/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { act, render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useField, useForm } from 'react-final-form';
import FiltersProvider from '../src/components/FiltersProvider.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderProvider(props) {
  let form;

  function GrabForm() {
    form = useForm();
    // final-form only counts registered fields as dirty
    useField('search', { subscription: {} });
    useField('city', { subscription: {} });
    return null;
  }

  render(
    <IntlProvider locale="en">
      <FiltersProvider filters={[]} onSubmit={() => {}} {...props}>
        <GrabForm />
      </FiltersProvider>
    </IntlProvider>,
  );

  return {
    change: (name, value) => act(() => form.change(name, value)),
    submit: () => act(() => form.submit()),
  };
}

describe('onPendingChange', () => {
  test('is not called at load', () => {
    const onPendingChange = jest.fn();

    renderProvider({
      manualSubmit: true,
      initialValues: { search: 'exposition', city: ['Paris'] },
      onPendingChange,
    });

    expect(onPendingChange).not.toHaveBeenCalled();
  });

  test('fires once when values leave the applied ones, not on every change', () => {
    const onPendingChange = jest.fn();
    const { change } = renderProvider({
      manualSubmit: true,
      initialValues: { search: 'exposition' },
      onPendingChange,
    });

    change('search', 'expo');
    change('search', 'ex');
    change('city', ['Paris']);

    expect(onPendingChange).toHaveBeenCalledTimes(1);
    expect(onPendingChange).toHaveBeenCalledWith(true, {
      search: 'expo',
    });
  });

  test('turns back off when values return to the applied ones', () => {
    const onPendingChange = jest.fn();
    const { change } = renderProvider({
      manualSubmit: true,
      initialValues: { search: 'exposition', city: ['Paris'] },
      onPendingChange,
    });

    change('city', undefined);
    change('city', ['Paris']);

    expect(onPendingChange.mock.calls).toEqual([
      [true, { search: 'exposition' }],
      [false, { search: 'exposition', city: ['Paris'] }],
    ]);
  });

  test('turns off on submit, and later changes compare with the submitted values', () => {
    const onPendingChange = jest.fn();
    const { change, submit } = renderProvider({
      manualSubmit: true,
      initialValues: { search: 'exposition' },
      onPendingChange,
    });

    change('search', undefined);
    submit();
    change('search', 'concert');
    change('search', undefined);

    expect(onPendingChange.mock.calls).toEqual([
      [true, {}],
      [false, {}],
      [true, { search: 'concert' }],
      [false, {}],
    ]);
  });

  test('never fires in automatic mode, where every change is submitted', () => {
    const onPendingChange = jest.fn();
    const onSubmit = jest.fn();
    const { change } = renderProvider({
      initialValues: { search: 'exposition' },
      onSubmit,
      onPendingChange,
    });

    change('search', 'concert');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onPendingChange).not.toHaveBeenCalled();
  });
});
