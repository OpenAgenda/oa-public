import {
  IntlProvider,
  FiltersProvider,
  Filters,
  DateRangeFilter,
  ChoiceFilter,
  NumberRangeFilter,
} from '../src';

require('./scss/main.scss');

const lang = 'fr';

export default {
  title: 'React filters/React',
  argTypes: { onSubmit: { action: 'submit' } },
};

const filters = [
  { name: 'timings', type: 'dateRange' },
  { name: 'createdAt', type: 'dateRange' },
  { name: 'updatedAt', type: 'dateRange' },
  {
    name: 'state',
    type: 'choice',
    options: [
      {
        label: 'Refusé',
        value: -1,
      },
      {
        label: 'À contrôler',
        value: 0,
      },
      {
        label: 'Prêt à publier',
        value: 1,
      },
      {
        label: 'Publié',
        value: 2,
      },
    ],
    aggregation: {
      type: 'states',
    },
  },
];

export const CompleteExample = ({ onSubmit }) => (
  <IntlProvider locale={lang}>
    <FiltersProvider onSubmit={onSubmit}>
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <Filters
              filters={filters}
              dateRangeComponent={DateRangeFilter}
              choiceComponent={ChoiceFilter}
              getOptions={(filter) => filter.options}
            />
          </div>
        </div>
      </div>
    </FiltersProvider>
  </IntlProvider>
);
CompleteExample.storyName = 'Filters';

export const FilterByFilter = ({ onSubmit }) => (
  <IntlProvider locale={lang}>
    <FiltersProvider onSubmit={onSubmit}>
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <DateRangeFilter name="timings" />
            <DateRangeFilter name="createdAt" dateFormat="d MMM yyyy" />
            <DateRangeFilter
              name="updatedAt"
              dateFormat="d/m/Y"
              dateFormatStyle="php"
            />
            <ChoiceFilter name="state" getOptions={() => filters[3].options} />
          </div>
        </div>
      </div>
    </FiltersProvider>
  </IntlProvider>
);

export const NumberRange = ({ onSubmit }) => (
  <IntlProvider locale={lang}>
    <FiltersProvider onSubmit={onSubmit}>
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <NumberRangeFilter name="seats" />
          </div>
        </div>
      </div>
    </FiltersProvider>
  </IntlProvider>
);
