"use strict";

import React, { Component } from 'react';

import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import ageValidator from './validators/age';
import registrationValidator from './validators/registration';
import AgeComponent from './components/Age';
import RegistrationComponent from './components/Registration';

export default class EventForm extends Component {

  render() {

    const props = {
      lang: 'fr',
      components: {
        age: AgeComponent,
        registration: RegistrationComponent
      },
      schema: {
        custom: {
          age: ageValidator,
          registration: registrationValidator
        },
        fields: [ /* {
          field: 'age',
          fieldType: 'age',
          optional: true,
          label: {
            fr: 'Age du public ciblé',
            en: 'Age of the targeted public'
          }
        }, */{
          field: 'registration',
          fieldType: 'registration',
          optional: true,
          label: {
            fr: 'Outils d\'inscription',
            en: 'Registration'
          },
          placeholder: {
            fr: 'Séparez les items par des tabulation ou des virgules',
            en: 'Separate each item with tabs or commas'
          },
          sub: {
            fr: 'Liens, emails ou numéros de téléphone',
            en: 'Links, emails or phone numbers'
          }
        } ]
      }
    }

    return <FormSchemaComponent { ...props } />

  }

}