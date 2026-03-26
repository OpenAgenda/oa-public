import _ from 'lodash';
import ih from 'immutability-helper';
import { Component } from 'react';
import { IntlProvider } from 'react-intl';
import commonLocales from '@openagenda/common-labels';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';

import FormSchemaComponent from '@openagenda/form-schemas/client/build/index.js';

import errorLabels from '@openagenda/labels/event/errors.js';
import Registration from '@openagenda/registration-apps';
import * as locales from './locales-compiled/index.js';
import appendFormConfigurations from './utils/appendFormConfigurations.js';
import extractLanguages from './utils/extractLanguages.js';
import getMultilingualFieldNames from './utils/getMultilingualFieldNames.js';
import identifyLanguageChanges from './utils/identifyLanguageChanges.js';
import transferMultilingualValues from './utils/transferMultilingualValues.js';
import removeMultilingualValues from './utils/removeMultilingualValues.js';
import schemaLanguages from './utils/schemaLanguages.js';
import injectValidators from './utils/injectValidators.js';
import updateLanguages from './utils/updateLanguages.js';
import validators from './validators/index.js';

import Age from './components/Age.js';
import Keywords from './components/Keywords.js';
import Timings from './components/Timings.js';
import Location from './components/Location.js';
import Languages from './components/Languages.js';
import Accessibility from './components/Accessibility.js';
import Events from './components/Events/index.js';
import ConfigurableTextarea from './components/ConfigurableTextarea.js';
import eventSchema from './schema.js';

const eventFormComponents = {
  age: Age,
  registration: Registration,
  keywords: Keywords,
  timings: Timings,
  location: Location,
  languages: Languages,
  accessibility: Accessibility,
  events: Events,
  longDescription: ConfigurableTextarea,
};

class EventForm extends Component {
  constructor(props) {
    super(props);

    const { values: propsValues } = this.props;

    this.onChange = this.onChange.bind(this);

    const languages = extractLanguages(props.schema, propsValues, {
      defaultLanguage: props.defaultLang || props.lang,
    });

    const { schema, hash } = this.buildEventSchema(languages, props);

    const values = ih(props.values ?? {}, {
      languages: {
        $set: languages, // schemaLanguages.getFromSchemaAndValues(schema, props.lang, languages)
      },
    });

    this.state = {
      values,
      schema,
      hash,
      files: [],
      loading: false,
    };
  }

  onChange({ values, errors, files, loading, globalError }) {
    const { lang, devOnChange } = this.props;
    const { values: stateValues } = this.state;

    const languageChanges = identifyLanguageChanges(
      _.get(this.state, 'values.languages'), // before
      _.get(values, 'languages'), // now
    );

    const update = _.omitBy(
      {
        errors,
        globalError,
        files,
        loading,
      },
      _.isUndefined,
    );

    if (values) update.values = values;

    const multilingualFieldNames = getMultilingualFieldNames(
      eventSchema({ languages: true }),
    );

    // if a unique language has been switcheds, content should not be lost
    if (languageChanges.swapped.length) {
      update.values = ih(
        transferMultilingualValues(
          stateValues,
          multilingualFieldNames,
          _.get(this, 'state.values.languages.0'),
          _.first(languageChanges.swapped),
        ),
        {
          languages: {
            $set: [languageChanges.swapped[0]],
          },
        },
      );
    } else if (languageChanges.removed.length) {
      update.values = ih(
        removeMultilingualValues(
          stateValues,
          multilingualFieldNames,
          languageChanges.removed,
        ),
        {
          languages: {
            $set: stateValues.languages.filter(
              (l) => !languageChanges.removed.includes(l),
            ),
          },
        },
      );
    }

    if (languageChanges.has) {
      _.assign(update, this.buildEventSchema(_.get(values, 'languages')));

      update.values.languages = schemaLanguages.getFromSchemaAndValues(
        update.schema,
        lang,
        update.values.languages,
      );
    }

    if (devOnChange) devOnChange(update);

    return this.setState(update);
  }

  buildEventSchema(languages, props = null) {
    const p = props || this.props;

    const { schema: propsSchema } = this.props;

    const schema = propsSchema
      || eventSchema({
        includeEventFields: p.includeEventFields,
        interfaceLanguage: p.lang,
        suggestionsRes: p.suggestionsRes,
        languages,
        schemaExtensions: p.schemaExtensions,
        access: {
          write: p.role,
        },
      });

    appendFormConfigurations(schema, {
      locationRes: p.locationRes,
      tiles: p.tiles,
      fileStore: p.fileStore,
      defaultLang: p.defaultLang || p.lang,
    });

    injectValidators(schema);

    updateLanguages(schema, languages);

    return {
      schema,
      hash: JSON.stringify(languages), // only language changes may trigger schema changes
    };
  }

  render() {
    const {
      lang,
      actionComponents,
      onSubmitSuccess,
      classNames,
      role,
      maxFileSize,
      res,
    } = this.props;

    const { values, schema, hash, errors, globalError, loading, files } = this.state;

    return (
      <IntlProvider
        key={lang}
        locale={lang}
        messages={mergeLocales(commonLocales, locales)[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <FormSchemaComponent
          res={res ? { post: res } : undefined}
          method="post"
          role={role}
          stateless
          maxFileSize={maxFileSize}
          lang={lang}
          components={eventFormComponents}
          values={values}
          errors={errors}
          globalError={globalError}
          loading={loading}
          files={files}
          onChange={this.onChange}
          schema={schema}
          hash={hash}
          classNames={ih(classNames ?? {}, {
            field: { $set: 'padding-v-sm form-group' },
          })}
          actionComponents={actionComponents}
          onSubmitSuccess={onSubmitSuccess}
          labels={{
            errors: errorLabels,
          }}
        />
      </IntlProvider>
    );
  }
}

export default EventForm;

export { validators };
