import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import { shouldUpdate, shallowEqual } from 'recompose';
import { Form } from 'react-final-form';
import setFieldDataMutator from 'final-form-set-field-data';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import locales from '../locales-compiled';
import AbilitiesForm from './AbilitiesForm';
import withFetcher from './withFetcher';
import getChildCheckboxDecorator from './getChildCheckboxDecorator';

function getInitialValues(rules) {
  return rules.reduce((result, rule) => {
    result[rule.key] = rule.inverted === undefined ? true : !rule.inverted;

    return result;
  }, {});
}

@withFetcher(
  'abilities',
  async ({ res, entityName, identifier }) => axios
    .get(res.formIndex, {
      params: {
        entityName,
        identifier,
      },
    })
    .then(({ data }) => data.map(v => {
      v.key = `rule${_.uniqueId()}`;

      return v;
    })),
  { fetchOnMount: true }
)
@shouldUpdate(
  (props, nextProps) => !shallowEqual(
    _.pick(props, ['entityName', 'identifier', 'locale']),
    _.pick(nextProps, ['entityName', 'identifier', 'locale'])
  ) || !shallowEqual(props.abilitiesFetcher, nextProps.abilitiesFetcher)
)
export default class AbilitiesEditor extends Component {
  static defaultProps = {
    locale: 'en',
    filterInput: false,
    filterInputPlaceholder: '',
  };

  constructor(props) {
    super(props);

    const { entityName, identifier } = this.props;

    this.handleSubmit = this.handleSubmit.bind(this);

    this.childCheckboxDecorator = getChildCheckboxDecorator({
      entityName,
      identifier,
      getRules: () => {
        const { abilitiesFetcher } = this.props;
        return abilitiesFetcher.data;
      },
    });
  }

  async handleSubmit(values, form) {
    const {
      onSubmit,
      res,
      entityName,
      identifier,
      receiveAbilitiesData,
      receiveAbilitiesError,
      abilitiesFetcher: { data: rules },
    } = this.props;

    const formIndex = rules.map(rule => Object.assign(_.omit(rule, 'key', 'entity', 'relevantRule'), {
      inverted: !values[rule.key],
    }));

    if (typeof onSubmit === 'function') {
      return onSubmit(formIndex);
    }

    try {
      let { data } = await axios.patch(res.formIndex, formIndex, {
        params: {
          entityName,
          identifier,
        },
      });

      if (_.isArray(data)) {
        data = data.map(v => {
          v.key = `rule${_.uniqueId()}`;

          return v;
        });

        receiveAbilitiesData(data);
        form.initialize(getInitialValues(data));
      }
    } catch (e) {
      receiveAbilitiesError(e);
    }
  }

  renderContent() {
    const {
      abilitiesFetcher: { loading, data: rules, error },
      HeaderComponent,
      searchChildKey,
      filterInputPlaceholder,
    } = this.props;

    if (loading) {
      return (
        <div style={{ position: 'relative', height: '50px' }}>
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <FormattedMessage
          id="Abilities.AbilitiesEditor.error"
          defaultMessage="Error."
        />
      );
    }

    return (
      <Form
        {...this.props}
        // debug={console.log}
        validateOnBlur
        subscription={{}}
        initialValues={getInitialValues(rules)}
        onSubmit={this.handleSubmit}
        decorators={[this.childCheckboxDecorator]}
        mutators={{ setFieldData: setFieldDataMutator }}
        component={AbilitiesForm}
        rules={rules}
        HeaderComponent={HeaderComponent}
        searchChildKey={searchChildKey}
        filterInputPlaceholder={filterInputPlaceholder}
      />
    );
  }

  render() {
    const { locale } = this.props;
    const messages = locales[locale] || locales.en;

    return (
      <IntlProvider
        key={locale}
        locale={locale}
        messages={messages}
        defaultLocale={getSupportedLocale(locale)}
      >
        {this.renderContent()}
      </IntlProvider>
    );
  }
}
