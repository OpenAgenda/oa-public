import dateFnsLocale from 'date-fns/locale/fr/index.js';
import {
  IntlProvider,
  FiltersProvider,
  Filters,
  DateRangeFilter,
  ChoiceFilter,
  NumberRangeFilter,
  SimpleDateRangeFilter,
  ActiveFilters,
} from '../src/index.js';

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

export const FocusedDateRange = ({ onSubmit }) => (
  <IntlProvider locale={lang}>
    <FiltersProvider onSubmit={onSubmit} dateFnsLocale={dateFnsLocale}>
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <ActiveFilters filters={[{ name: 'timings', type: 'dateRange' }]} />
            <DateRangeFilter
              name="timings"
              minDate="2024-10-23T12:00:00.000Z"
              maxDate="2024-10-27T12:00:00.000Z"
              shownDate="2024-10-23T12:00:00.000Z"
            />
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

export const SimpleDateRange = ({ onSubmit }) => (
  <IntlProvider locale={lang}>
    <FiltersProvider onSubmit={onSubmit}>
      <div className="container">
        <div className="row">
          <div className="col-sm-4">
            <SimpleDateRangeFilter name="timings" />
          </div>
        </div>
      </div>
    </FiltersProvider>
  </IntlProvider>
);
