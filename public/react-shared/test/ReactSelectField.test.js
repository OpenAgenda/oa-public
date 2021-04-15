/** @jsx jsx */
import { jsx } from '@emotion/core';
import { mount } from 'enzyme';
import { Form } from 'react-final-form';
import ReactSelectField from '../src/components/ReactSelectField';

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
            <ReactSelectField name="type" options={options} />
          </form>
        )}
      />
    );

    const selectWrapper = wrapper.find('Select');

    await selectWrapper.invoke('onChange')(option);

    // have a selected value
    expect(wrapper.exists('[className$="-singleValue"]')).toBe(true);
    // good value
    expect(wrapper.find('[className$="-singleValue"]').text()).toBe(
      option.label
    );
  });
});
