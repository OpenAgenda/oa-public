import { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import get from 'lodash/get.js';
import keys from 'lodash/keys.js';
import first from 'lodash/first.js';

import { Spinner, ImageInput } from '@openagenda/react-shared';

import validate from '../../validate.js';
import flattenTagSetLabels from '../../flattenTagSetLabels.js';

import GeoFieldsAndMap from './GeoFieldsAndMap.js';
import InputField from './InputField.js';
import StateToggler from './StateToggler.js';
import LanguageBar from './LanguageBar.js';
import MultilingualInputField from './MultilingualInputField.js';
import MultiInputField from './MultiInputField.js';
import GroupTagSelector from './GroupTagSelector.js';

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
  'string.toolong': {
    id: 'AgendaLocations.LocationForm.string.toolong',
    defaultMessage: 'String is too long',
  },
  'phone.invalid': {
    id: 'AgendaLocations.LocationForm.phone.invalid',
    defaultMessage: 'Invalid phone number',
  },
  'email.invalid': {
    id: 'AgendaLocations.LocationForm.email.invalid',
    defaultMessage: 'Invalid email',
  },
  'link.invalid': {
    id: 'AgendaLocations.LocationForm.link.invalid',
    defaultMessage: 'Invalid link',
  },
  'string.invalidHasEmojis': {
    id: 'AgendaLocations.LocationForm.string.invalidHasEmojis',
    defaultMessage: 'Emojis are not accepted',
  },
  'file.tooBig': {
    id: 'AgendaLocations.LocationForm.file.tooBig',
    defaultMessage: 'This file is too big (> 20 MB)',
  },
  'address.invalid': {
    id: 'AgendaLocations.LocationForm.address.invalid',
    defaultMessage: 'Invalid address',
  },
  tooshort: {
    id: 'AgendaLocations.LocationForm.tooshort',
    defaultMessage: 'String is too short',
  },
  toolong: {
    id: 'AgendaLocations.LocationForm.toolong',
    defaultMessage: 'String is too long',
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
    defaultMessage:
      'Number Street, City ( example : 82 Boulevard de Clichy, Paris )',
  },
  links: {
    id: 'AgendaLocations.LocationForm.links',
    defaultMessage: 'Additional links',
  },
  linksInfo: {
    id: 'AgendaLocations.LocationForm.linksInfo',
    defaultMessage:
      'Add social media references, or any other link related to the location',
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
  imageSub: {
    id: 'AgendaLocations.LocationForm.imageSub',
    defaultMessage:
      'By inserting an image in OpenAgenda, you certify that you hold the necessary rights to publish it under the open licence. <learnMoreLink>Learn more</learnMoreLink>',
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
    defaultMessage:
      'We could not locate this address. Start over by typing the name of the town or city only, position the marker on the map in the right location and then specify the complete address once the marker is correctly placed.',
  },
  extId: {
    id: 'AgendaLocations.LocationForm.extId',
    defaultMessage: 'External Identifier',
  },
  extIdInfo: {
    id: 'AgendaLocations.LocationForm.extIdInfo',
    defaultMessage:
      'Optionnally, specify a unique identifier for this location',
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
  findOutMore: {
    id: 'AgendaLocations.LocationForm.findOutMore',
    defaultMessage: 'Learn more about the license',
  },
  imageRightsAreHeld: {
    id: 'AgendaLocations.LocationForm.imageRightsAreHeld',
    defaultMessage: 'Image rights are held',
  },
  requiredField: {
    id: 'AgendaLocations.LocationForm.requiredField',
    defaultMessage: '(Required field)',
  },
  imageRights: {
    id: 'AgendaLocations.LocationForm.imageRights',
    defaultMessage:
      'I declare having the rights to broadcast this visual and consent to its distribution by third parties on any medium, in accordance with the <cguLink>CGU</cguLink>',
  },
  imageRightsCguUrl: {
    id: 'AgendaLocations.LocationForm.imageRightsCguUrl',
    defaultMessage:
      'https://doc.openagenda.com/fr/article/guide-dutilisation-des-images-sur-openagenda-1t8zlc4',
  },
  siret: {
    id: 'AgendaLocations.LocationForm.siret',
    defaultMessage: 'SIRET',
  },
  siretInfo: {
    id: 'AgendaLocations.LocationForm.siretInfo',
    defaultMessage:
      'SIRET number of the main organization hosted by the location',
  },
  invalidSIRET: {
    id: 'AgendaLocations.LocationForm.invalidSIRET',
    defaultMessage: 'SIRET must be composed of 14 digits',
  },
  warnAllCaps: {
    id: 'AgendaLocations.LocationForm.warnAllCaps',
    defaultMessage: 'Avoid typing a text using only capital letters',
  },
});

const LocationForm = ({
  lang = 'fr',
  location: locationFromProps = null,
  settings = {},
  Header = null,
  enableGeocode = true,
  showToggler = false,
  displayLanguageTabs = true,
  detailedInfo = true,
  showExtIdInput,
  displayExtIdLink,
  pageSpin = false,
  mode,
  cancel,
  onCancel,
  res,
  onSubmit,
  errors,
  tiles,
}) => {
  const intl = useIntl();
  const [location, setLocation] = useState(locationFromProps || {});
  const [showExtId, setShowExtId] = useState(showExtIdInput);
  const [awaitPost, setAwaitPost] = useState(false);

  if (!location.countryCode) location.countryCode = 'FR';

  // -- globals fcts
  const onChange = (name, value) => {
    setLocation({ ...location, [name]: value });
  };

  const clearRequired = (str) => {
    if (str.includes('.required')) return str.split('.')[1];
    return str;
  };

  const getLabel = (unclearName, values) => {
    const name = clearRequired(unclearName);

    let str;
    let k;
    // see if label is defined in agenda settings
    if (settings?.labels?.[name]) {
      const l = settings.labels[name];

      // Check if l is a string (not multilingual)
      if (typeof l === 'string') {
        str = l;
      } else {
        // Handle multilingual object
        str = get(l, lang, l[first(keys(l))]);
      }

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

  const myOnCancel = (e) => {
    e.preventDefault();
    onCancel(location);
  };

  // --  multiLang fcts
  const getMultilingual = (field) => {
    const data = location?.[field];
    const defaultData = {};
    defaultData[lang] = '';

    if (data && typeof data === 'object') {
      return data;
    }
    if (typeof data === 'string') {
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

  const onLanguageChange = (newLanguages) => {
    const currentLanguages = getLanguages();
    // description field serves as ref for language state
    // this should change but as long as its the only multi-l
    // field, this is how it is
    const description = JSON.parse(
      JSON.stringify(getMultilingual('description')),
    );

    currentLanguages.forEach((l) => {
      if (newLanguages.indexOf(l) === -1) {
        delete description[l];
      }
    });

    newLanguages.forEach((l) => {
      if (currentLanguages.indexOf(l) === -1) {
        description[l] = '';
      }
    });
    setLocation({ ...location, description });
  };

  const set = async () => {
    setAwaitPost(true);
    await onSubmit(location);
    setAwaitPost(false);
  };

  const renderErrors = () => (
    <div className="error-summary boxed padding-all-md">
      <label htmlFor="err-submit">
        <FormattedMessage {...messages[`${mode}SubmitError`]} />:
      </label>
      {errors.map((err) => {
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
              <span>
                <FormattedMessage {...messages.required} />
              </span>
            </div>
          );
        }
        return (
          <div key={`err-${err.field}`}>
            <label htmlFor="err-field">
              {getLabel(err.field) || err.field}
            </label>
            : <span>{getLabel(err.code, values)}</span>
          </div>
        );
      })}
    </div>
  );

  const renderExtId = () => {
    if (!displayExtIdLink) return;
    if (detailedInfo && (location.extId || showExtId)) {
      return (
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
      );
    }
    return (
      <div className="form-group">
        <button
          type="button"
          className="btn btn-link"
          onClick={(e) => {
            e.preventDefault();
            setShowExtId(true);
          }}
        >
          {intl.formatMessage(messages.extIdLink)}
        </button>
      </div>
    );
  };

  const renderDetailsInfo = () => (
    <div className="form-group">
      <div className="from-group">
        <ImageInput
          locale={lang}
          input={{
            onChange: (file) => onChange('image', file),
            value: location?.image,
          }}
          info={getLabel('imageInfo')}
          label={getLabel('image')}
        />
        {!settings?.displayImageRightsConfirmCheckbox ? (
          <div className="sub margin-bottom-sm">
            <FormattedMessage
              {...messages.imageSub}
              values={{
                learnMoreLink: (chunks) => (
                  <a
                    href={intl.formatMessage(messages.imageRightsCguUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {chunks}
                  </a>
                ),
              }}
            />
          </div>
        ) : null}
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

      {settings?.displayImageRightsConfirmCheckbox ? (
        <div className="checkbox">
          <label htmlFor="jaccepte-que-limage-puisse-etre-librement-utilisee-a-la-condition">
            <input
              id="jaccepte-que-limage-puisse-etre-librement-utilisee-a-la-condition"
              type="checkbox"
              name="jaccepte-que-limage-puisse-etre-librement-utilisee-a-la-condition"
              onChange={() =>
                onChange('imageRightsAreHeld', !location.imageRightsAreHeld)}
              checked={!!location.imageRightsAreHeld}
            />
            <span className="margin-right-xs">
              <FormattedMessage
                {...messages.imageRights}
                values={{
                  cguLink: (chunks) => (
                    <a
                      href={intl.formatMessage(messages.imageRightsCguUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {chunks}
                    </a>
                  ),
                }}
              />
            </span>
            <span className="margin-right-xs">
              {intl.formatMessage(messages.requiredField)}
            </span>
            <a
              className="margin-right-xs"
              target="_blank"
              rel="noreferrer"
              href="https://doc.openagenda.com/fr/article/guide-dutilisation-des-images-sur-openagenda-1t8zlc4"
            >
              {intl.formatMessage(messages.findOutMore)}
            </a>
          </label>
        </div>
      ) : null}

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
          placeholder="descriptionPlaceholder"
          info="descriptionInfo"
          type="textarea"
          groupClassName={
            errors && errors.find((e) => e.field === 'description')
              ? 'has-error'
              : ''
          }
        />

        <MultilingualInputField
          name="access"
          enabled
          value={getMultilingual('access')}
          languages={getLanguages()}
          getLabel={getLabel}
          onChange={onChange}
          placeholder="accessPlaceholder"
          info="accessInfo"
          type="textarea"
          groupClassName={
            errors && errors.find((e) => e.field === 'access')
              ? 'has-error'
              : ''
          }
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
        groupClassName={
          errors && errors.find((e) => e.field === 'phone') ? 'has-error' : ''
        }
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
        groupClassName={
          errors && errors.find((e) => e.field === 'website') ? 'has-error' : ''
        }
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
        groupClassName={
          errors && errors.find((e) => e.field === 'email') ? 'has-error' : ''
        }
      />
      <MultiInputField
        name="links"
        enabled
        info="linksInfo"
        placeholder="linksPlaceholder"
        value={location.links}
        getLabel={getLabel}
        lang={lang}
        onChange={onChange}
        validator={validate.field('links')}
        groupClassName={
          errors && errors.find((e) => e.field === 'links') ? 'has-error' : ''
        }
      />
      {Object.keys(settings).length && settings.tagSet ? (
        <GroupTagSelector
          lang={lang}
          name="tags"
          set={flattenTagSetLabels(settings.tagSet, lang)}
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
          onChange={(state) => onChange('state', state)}
        />
      ) : null}

      <InputField
        name="name"
        enabled
        required
        value={location?.name}
        info="nameInfo"
        placeholder="namePlaceholder"
        getLabel={getLabel}
        lang={lang}
        onChange={onChange}
        validator={validate.field('name')}
        renderButton={false}
        groupClassName={
          errors && errors.find((e) => e.field === 'name') ? 'has-error' : ''
        }
        warnAllCaps={settings?.nameWarnAllCaps}
        warnAllCapsMessage={getLabel('warnAllCaps')}
      />

      <GeoFieldsAndMap
        location={location}
        lang={lang}
        onChange={(l) => setLocation(l)}
        getLabel={getLabel}
        validate={validate}
        enableGeocode={enableGeocode}
        res={res}
        tiles={tiles}
        errors={errors}
        setDisabled={setAwaitPost}
      />

      {detailedInfo ? renderDetailsInfo() : null}

      {settings?.displaySIRETInput ? (
        <InputField
          name="siret"
          enabled
          value={location?.siret || ''}
          getLabel={getLabel}
          lang={lang}
          placeholder="siretPlaceholder"
          info="siretInfo"
          onChange={onChange}
          validator={validate.field('siret')}
        />
      ) : null}

      {renderExtId()}

      {errors ? renderErrors() : ''}

      <div className="form-group bottom">
        {cancel || (
          <button type="button" className="btn btn-link" onClick={myOnCancel}>
            <span className="text-danger">
              {intl.formatMessage(messages.cancel)}
            </span>
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            set();
          }}
          disabled={awaitPost}
        >
          {intl.formatMessage(messages[`${mode}Submit`])}
        </button>
      </div>

      {pageSpin ? <Spinner page messages={pageSpin.messages} /> : null}
    </div>
  );
};

export default LocationForm;
