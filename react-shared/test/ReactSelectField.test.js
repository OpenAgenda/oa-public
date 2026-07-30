import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { Form, Field } from 'react-final-form';
import ReactSelectField from '../src/components/ReactSelectField.js';

// Configured here rather than in a shared setup file: the adapter reads React
// internals that React 19 renamed, so importing it takes the whole suite down.
// Keeping it local means only this file pays for it.
configure({ adapter: new Adapter() });

describe('ReactSelectField', () => {
  it('correctly select option with categories', async () => {
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

    const onSubmit = jest.fn();
    const wrapper = mount(
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <ReactSelectField Field={Field} name="type" options={options} />
          </form>
        )}
      />,
    );

    const selectWrapper = wrapper.find('Select');

    await selectWrapper.invoke('onChange')(option);

    // have a selected value
    expect(wrapper.exists('[className$="-singleValue"]')).toBe(true);
    // good value
    expect(wrapper.find('[className$="-singleValue"]').text()).toBe(
      option.label,
    );
  });
});
