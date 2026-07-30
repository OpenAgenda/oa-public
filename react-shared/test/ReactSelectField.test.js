import { fireEvent, render, screen } from '@testing-library/react';
import { Form, Field } from 'react-final-form';
import ReactSelectField from '../src/components/ReactSelectField.js';

const options = [
  {
    label: 'Graphiques',
    options: [
      {
        label: 'Horaires',
        value: 'timings',
      },
      {
        label: 'Mots-clés',
        value: 'keywords',
      },
    ],
  },
];

const option = options[0].options[1];

function renderField(initialValues) {
  return render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ReactSelectField Field={Field} name="type" options={options} />
          <output>{JSON.stringify(values)}</output>
        </form>
      )}
    />,
  );
}

describe('ReactSelectField', () => {
  it('correctly select option with categories', () => {
    renderField();

    expect(screen.getByRole('status').textContent).toBe('{}');

    // react-select opens its menu on ArrowDown
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    fireEvent.click(screen.getByText(option.label));

    // parse() must store the option's value, not its label, and the menu must
    // be gone — asserting on the label alone would pass on the open menu too
    expect(screen.getByRole('status').textContent).toBe(
      JSON.stringify({ type: option.value }),
    );
    expect(screen.queryByRole('option')).toBeNull();
  });

  it('resolves an initial value nested in a category', () => {
    // covers format()/findOption(), which have to look inside the groups
    renderField({ type: option.value });

    expect(screen.getByText(option.label)).toBeTruthy();
  });
});
