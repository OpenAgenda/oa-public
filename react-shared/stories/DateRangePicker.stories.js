import DateRangePicker from '../src/components/DateRangePicker';
import SimpleCanvas from './decorators/SimpleCanvas';
import IntlProvider from './decorators/IntlProvider';
import Style from './scss/DateRangePicker.scss';

export default {
  title: 'DateRangePicker',
  component: DateRangePicker,
  decorators: [IntlProvider, SimpleCanvas],
  style: Style,
};

export const Simple = () => (
  <div className="col-offset-4 col-lg-3">
    <div className="simple">
      <DateRangePicker input={{ onChange: () => {} }} />
    </div>
    <div className="variation">
      <DateRangePicker
        input={{
          onChange: () => {},
          value: [
            {
              startDate: new Date('2022-03-09T23:00:00.000Z'),
              endDate: new Date('2022-03-12T23:00:00.000Z'),
              key: 'selection',
            },
          ],
        }}
      />
    </div>
    <div className="other-variation">
      <DateRangePicker
        input={{
          onChange: () => {},
          value: [
            {
              startDate: new Date('2022-03-09T23:00:00.000Z'),
              endDate: new Date('2022-03-12T23:00:00.000Z'),
              key: 'selection',
            },
          ],
        }}
        staticRanges={[
          {
            isSelected: () => {},
            label: 'Today',
          },
          {
            isSelected: () => {},
            label: 'Tomorrow',
          },
          {
            isSelected: () => {},
            label: 'Next month',
          },
        ]}
      />
    </div>
  </div>
);
