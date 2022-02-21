import React, { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';

import { Spinner, ImageInput } from '@openagenda/react-shared';

import validate from '../../validate';
import flattenTagSetLabels from '../../flattenTagSetLabels';

import GeoFieldsAndMap from './GeoFieldsAndMap';
import InputField from './InputField';
import StateToggler from './StateToggler';
import LanguageBar from './LanguageBar';
import MultilingualInputField from './MultilingualInputField';
import MultiInputField from './MultiInputField';
import GroupTagSelector from './GroupTagSelector';

const messages = defineMessages({
  postalCode: {
    id: 'AgendaLocations.LocationForm.postalCode',
    defaultMessage: 'Postal code',
  },
  insee: {
    id: 'AgendaLocations.LocationForm.insee',
    defaultMessage: 'INSEE code',
  },
  loadingError: {
    id: 'AgendaLocations.LocationForm.loadingError',
    defaultMessage: 'A problem occurred during the load. Please retry.',
  },
  saving: {
    id: 'AgendaLocations.LocationForm.saving',
    defaultMessage: 'Saving',
  },
  required: {
    id: 'AgendaLocations.LocationForm.required',
    defaultMessage: 'Required',
  },
  'string.tooshort': {
    id: 'AgendaLocations.LocationForm.string.tooshort',
    defaultMessage: 'String is too short',
  },
  name: {
    id: 'AgendaLocations.LocationForm.name',
    defaultMessage: 'Name of the location',
  },
  namePlaceholder: {
    id: 'AgendaLocations.LocationForm.namePlaceholder',
    defaultMessage: 'Example: Moulin Rouge',
  },
  description: {
    id: 'AgendaLocations.LocationForm.description',
    defaultMessage: 'Description',
  },
  descriptionInfo: {
    id: 'AgendaLocations.LocationForm.descriptionInfo',
    defaultMessage: 'Details about the location',
  },
  address: {
    id: 'AgendaLocations.LocationForm.address',
    defaultMessage: 'Address',
  },
  addressPlaceholder: {
    id: 'AgendaLocations.LocationForm.addressPlaceholder',
    defaultMessage: 'Number Street, City ( example : 82 Boulevard de Clichy, Paris )',
  },
  links: {
    id: 'AgendaLocations.LocationForm.links',
    defaultMessage: 'Additional links',
  },
  linksInfo: {
    id: 'AgendaLocations.LocationForm.linksInfo',
    defaultMessage: 'Add social media references, or any other link related to the location',
  },
  access: {
    id: 'AgendaLocations.LocationForm.access',
    defaultMessage: 'Access',
  },
  website: {
    id: 'AgendaLocations.LocationForm.website',
    defaultMessage: 'Website',
  },
  phone: {
    id: 'AgendaLocations.LocationForm.phone',
    defaultMessage: 'Telephone number',
  },
  email: {
    id: 'AgendaLocations.LocationForm.email',
    defaultMessage: 'Contact email',
  },
  image: {
    id: 'AgendaLocations.LocationForm.image',
    defaultMessage: 'Image',
  },
  imageInfo: {
    id: 'AgendaLocations.LocationForm.imageInfo',
    defaultMessage: 'Only upload images you have the right to re-use',
  },
  imageCredits: {
    id: 'AgendaLocations.LocationForm.imageCredits',
    defaultMessage: 'Image credits',
  },
  geocodeFieldSave: {
    id: 'AgendaLocations.LocationForm.geocodeFieldSave',
    defaultMessage: 'Ok',
  },
  geocodeFieldCancel: {
    id: 'AgendaLocations.LocationForm.geocodeFieldCancel',
    defaultMessage: 'Cancel',
  },
  geocodeNoResults: {
    id: 'AgendaLocations.LocationForm.geocodeNoResults',
    defaultMessage: 'We could not locate this address. Start over by typing the name of the town or city only, position the marker on the map in the right location and then specify the complete address once the marker is correctly placed.',
  },
  extId: {
    id: 'AgendaLocations.LocationForm.extId',
    defaultMessage: 'External Identifier',
  },
  extIdInfo: {
    id: 'AgendaLocations.LocationForm.extIdInfo',
    defaultMessage: 'Optionnally, specify a unique identifier for this location',
  },
  extIdLink: {
    id: 'AgendaLocations.LocationForm.extIdLink',
    defaultMessage: 'Define a unique identifier for this location',
  },
  cancel: {
    id: 'AgendaLocations.LocationForm.cancel',
    defaultMessage: 'Cancel',
  },
  createSubmit: {
    id: 'AgendaLocations.LocationForm.createSubmit',
    defaultMessage: 'Create',
  },
  updateSubmit: {
    id: 'AgendaLocations.LocationForm.updateSubmit',
    defaultMessage: 'Update',
  },
  createSubmitError: {
    id: 'AgendaLocations.LocationForm.createSubmitError',
    defaultMessage: 'The location could not be created',
  },
  updateSubmitError: {
    id: 'AgendaLocations.LocationForm.updateSubmitError',
    defaultMessage: 'The location could not be updated',
  },
  addLanguage: {
    id: 'AgendaLocations.LocationForm.addLanguage',
    defaultMessage: 'Add a language',
  },
});

const LocationForm = ({
  lang = 'fr',
  locationProp = null,
  settings = {},
  Header = null,
  enableGeocode = true,
  showToggler = false,
  displayLanguageTabs = true,
  detailedInfo = true,
  showExtIdInput,
  pageSpin = false,
  mode,
  cancel,
  onCancel,
  res,
  agenda,
  onSubmit,
  errors,
}) => {
  const intl = useIntl();
  const [location, setLocation] = useState(locationProp || {});
  const [showExtId, setShowExtId] = useState(showExtIdInput);

  // -- globals fcts
  const onChange = (name, value) => {
    setLocation({ ...location, [name]: value });
  };

  const getLabel = (name, values) => {
    let str;
    let k;
    // see if label is defined in agenda settings
    if (settings?.labels?.[name]) {
      const l = settings.labels[name];
      str = _.get(l, lang, l[_.first(_.keys(l))]);
      if (!str) {
        return null;
      }
      if (values) {
        for (k in values) {
          if (k) str = str.replace(`%${k}%`, values[k]);
        }
      }
      return str;
    }

    // use intl to format standard labels
    if (messages[name]) {
      if (!values) {
        str = intl.formatMessage(messages[name]);
        return str;
      }
      str = intl.formatMessage(messages[name], values);
      return str;
    }
    return null;
  };

  const myOnCancel = e => {
    e.preventDefault();
    onCancel(location);
  };

  const decorateLocation = (gfResult, excludeCoordinates = false) => {
    const item = gfResult.results[0];
    const decoration = [
      'adminLevel1',
      'adminLevel2',
      'adminLevel3',
      'adminLevel4',
      'adminLevel5',
      'adminLevel6',
      'postalCode',
      'timezone',
      'insee',
    ].reduce((d, field) => {
      d[field] = item[field];
      return d;
    }, {});
    if (!excludeCoordinates) {
      decoration.latitude = item.latitude;
      decoration.longitude = item.longitude;
    }
    if (item.countryCode && item.countryCode !== location.countryCode) decoration.countryCode = _.isString(item.countryCode) ? item.countryCode.toUpperCase() : null;
    return decoration;
  };

  // --  multiLang fcts
  const getMultilingual = field => {
    const data = location?.[field];
    const defaultData = {};
    defaultData[lang] = '';

    if (data && typeof data === 'object') {
      return data;
    } if (typeof data === 'string') {
      defaultData[lang] = data;
      return defaultData;
    }

    return data || defaultData;
  };

  const getLanguages = () => {
    const languages = Object.keys(getMultilingual('description'));
    if (!languages.length) {
      languages.push(lang);
    }
    return languages;
  };

  const onLanguageChange = newLanguages => {
    const currentLanguages = getLanguages();
    // description field serves as ref for language state
    // this should change but as long as its the only multi-l
    // field, this is how it is
    const description = JSON.parse(
      JSON.stringify(getMultilingual('description'))
    );

    currentLanguages.forEach(l => {
      if (newLanguages.indexOf(l) === -1) {
        delete description[l];
      }
    });

    newLanguages.forEach(l => {
      if (currentLanguages.indexOf(l) === -1) {
        description[l] = '';
      }
    });
    setLocation({ ...location, description });
  };

  const set = () => onSubmit(location);

  const renderErrors = () => (
    <div className="errors">
      <label htmlFor="err-submit"><FormattedMessage {...messages[`${mode}SubmitError`]} />:</label>
      {errors.map(err => {
        const values = {};

        for (const k in err.values) {
          if (Object.prototype.hasOwnProperty.call(err.values, k)) {
            values[`${k}`] = err.values[k];
          }
        }

        if (err.group) {
          return (
            <div key={`err-${err.field}`}>
              <label htmlFor="required">{err.group[lang]}</label>:{' '}
              <span><FormattedMessage {...messages.required} /></span>
            </div>
          );
        }
        return (
          <div key={`err-${err.field}`}>
            <label htmlFor="err-field">{getLabel(err.field) || err.field}</label>:{' '}
            <span>{getLabel(err.code, values)}</span>
          </div>
        );
      })}
    </div>
  );

  const renderDetailsInfo = () => (
    <div className="form-group">
      <div className="from-group">
        <ImageInput
          locale={lang}
          input={{
            onChange: file => onChange('image', file),
            value: location?.image,
          }}
        />
      </div>

      <InputField
        name="imageCredits"
        enabled
        value={location?.imageCredits ? location.imageCredits : undefined}
        getLabel={getLabel}
        lang={lang}
        info="imageCreditsInfo"
        placeholder="imageCreditsPlaceholder"
        onChange={onChange}
        validator={validate.field('imageCredits')}
        bottom={false}
      />

      <div className="multilingual-group">
        {displayLanguageTabs ? (
          <LanguageBar
            languagesProp={getLanguages()}
            getLabel={getLabel}
            onChange={onLanguageChange}
          />
        ) : null}
        <MultilingualInputField
          name="description"
          enabled
          value={getMultilingual('description')}
          languages={getLanguages()}
          getLabel={getLabel}
          onChange={onChange}
          placeholder={getLabel('descriptionPlaceholder')}
          info={getLabel('descriptionInfo')}
          type="textarea"
        />

        <MultilingualInputField
          name="access"
          enabled
          value={getMultilingual('access')}
          languages={getLanguages()}
          getLabel={getLabel}
          onChange={onChange}
          placeholder={getLabel('accessPlaceholder')}
          info={getLabel('accessInfo')}
          type="text"
        />
      </div>

      <InputField
        name="phone"
        enabled
        value={location?.phone || ''}
        getLabel={getLabel}
        lang={lang}
        onChange={onChange}
        info="phoneInfo"
        placeholder="phonePlaceholder"
        validator={validate.field('phone')}
      />

      <InputField
        name="website"
        enabled
        value={location?.website}
        getLabel={getLabel}
        lang={lang}
        info="websiteInfo"
        placeholder="websitePlaceholder"
        onChange={onChange}
        validator={validate.field('website')}
      />

      <InputField
        name="email"
        enabled
        value={location?.email}
        getLabel={getLabel}
        lang={lang}
        info="emailInfo"
        placeholder="emailPlaceholder"
        onChange={onChange}
        validator={validate.field('email')}
      />
      <MultiInputField
        name="links"
        enabled
        info={getLabel('linksInfo')}
        placeholder={getLabel('linksPlaceholder')}
        value={location.links}
        getLabel={getLabel}
        lang={lang}
        onChange={onChange}
        validator={validate.field('links')}
      />
      {Object.keys(settings).length
        && settings.tagSet
        ? (
          <GroupTagSelector
            lang={lang}
            name="tags"
            set={flattenTagSetLabels(
              settings.tagSet,
              lang
            )}
            onChange={onChange}
            value={location.tags || []}
          />
        ) : null}
    </div>
  );

  return (
    <div className="location-form">
      {Header}

      {showToggler ? (
        <StateToggler
          locationState={location.state}
          onChange={state => onChange('state', state)}
        />
      ) : null}

      <InputField
        name="name"
        enabled
        value={location?.name}
        info="nameInfo"
        placeholder="namePlaceholder"
        getLabel={getLabel}
        lang={lang}
        onChange={onChange}
        validator={() => true}
        renderButton={false}
      />

      <GeoFieldsAndMap
        location={location}
        lang={lang}
        onChange={(l => setLocation(l))}
        getLabel={getLabel}
        validate={validate}
        enableGeocode={enableGeocode}
        res={res}
        agenda={agenda}
      />

      {detailedInfo ? renderDetailsInfo() : null}
      {detailedInfo && (location.extId || showExtId) ? (
        <InputField
          name="extId"
          enabled
          value={location?.extId || ''}
          getLabel={getLabel}
          lang={lang}
          info="extIdInfo"
          placeholder="extIdplaceholder"
          onChange={onChange}
          validator={validate.field('extId')}
        />
      ) : (
        <div className="form-group">
          <button
            type="button"
            className="btn btn-link"
            onClick={e => {
              e.preventDefault();
              setShowExtId(true);
            }}
          >
            {intl.formatMessage(messages.extIdLink)}
          </button>
        </div>
      )}

      {errors ? renderErrors() : ''}

      <div className="form-group bottom">
        {cancel || (
          <button
            type="button"
            className="btn btn-link"
            onClick={myOnCancel}
          >
            <span className="text-danger">{intl.formatMessage(messages.cancel)}</span>
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={e => {
            e.preventDefault();
            set();
          }}
        >
          {intl.formatMessage(messages[`${mode}Submit`])}
        </button>
      </div>

      {pageSpin ? (
        <Spinner page messages={pageSpin.messages} />
      ) : null}
    </div>
  );
};

export default LocationForm;
