import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

const groups = [ {
  label: 'Getting Started',
  slug: 'getting-started'
}, {
  label: 'Form field types',
  slug: 'types'
}, {
  label: 'Displaying errors',
  slug: 'errors'
} ];

const devApps = [ {
  name: 'The simplest empty form',
  description: 'To get started',
  link: '/simplest',
  group: 'getting-started'
}, {
  name: 'Simple with a constraint',
  description: 'A min and max',
  link: '/simplewithconstraint',
  group: 'getting-started'
}, {
  name: 'Simple with a default value',
  description: 'A default value can be defined',
  link: '/simplewithdefault',
  group: 'getting-started'
}, {
  name: 'A form',
  description: 'This is the dev app before it was split. It shows a form with mixed fields',
  link: '/form',
  group: 'getting-started'
}, {
  name: 'A form with values',
  description: 'Another form loaded with valid and invalid values',
  link: '/loadedform',
  group: 'getting-started'
}, {
  name: 'Errors not displayed on mount',
  description: 'Sometimes the user needs to load data which he knows is incomplete. For example, a contributor saved a draft event and comes back to complete it. The form that is loaded should not show errors all over. In that case, the schema is loaded with a withErrors prop set to false',
  link: 'errorsnotdisplayedonmount',
  group: 'errors'
}, {
  name: 'Errors displayed on mount',
  description: 'Some other times the reason of the form load is to show the errors to the user. withErrors prop is set to true',
  link: 'errorsdisplayedonmount',
  group: 'errors'
}, {
  name: 'A textarea',
  description: 'A form with a textarea field',
  link: '/textarea',
  group: 'types'
}, {
  name: 'A Slate field',
  description: 'A field that outputs a slate document. To be used by HTML or markdown fields',
  link: '/slate',
  group: 'types'
}, {
  name: 'An HTML field',
  description: 'A field that outputs an html string',
  link: '/html',
  group: 'types'
}, {
  name: 'A set of number fields',
  description: 'A field for typing a number or an integer',
  link: '/number',
  group: 'types'
}, {
  name: 'A radio field',
  description: 'A set of single choice options',
  link: '/radio',
  group: 'types'
}, {
  name: 'Checkboxes',
  description: 'Sometimes more than one choice is allowed',
  link: '/checkbox',
  group: 'types'
}, {
  name: 'A markdown field',
  description: 'A field that outputs a markdown string',
  link: '/markdown',
  group: 'types'
}, {
  name: 'A file upload field',
  description: 'A field for uploading a file',
  link: '/fileupload',
  group: 'types'
}, {
  name: 'An image upload field',
  description: 'A field for uploading an image',
  link: '/imageupload',
  group: 'types'
}, {
  name: 'Multilingual fields with one language',
  description: 'Multilingual fields when only one language is active',
  link: '/multilingualwithonelanguage'
}, {
  name: 'A form with a custom field',
  description: 'A form that includes a custom component',
  link: '/customcomponentform'
}, {
  name: 'A form with a given button section',
  description: 'Some button layouts differ. A button component can be given to handle general form action. The component must accept an onSubmit prop, optionnally an onCancel',
  link: '/custombuttonedform'
}, {
  name: 'onSubmitSuccess',
  description: 'The callback gives both the sent data and the successful response',
  link: '/onsubmitsuccess'
}, {
  name: 'Stateless',
  description: 'Because sometimes you may want to handle the state in the parent component',
  link: '/stateless'
}, {
  name: 'conditional',
  description: 'A field can be enabled when another field is set',
  link: '/conditional'
}, {
  name: 'requiredconditional',
  description: 'A required field is only required if it is enabled',
  link: '/requiredconditional'
}, {
  name: 'hidden',
  description: 'if "display" setting of field is specified as falsy, the field is not displayed',
  link: '/hidden'
} ];

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    return <div className="margin-top-lg container col-lg-offset-1 col-lg-10">

      <div className="row margin-v-lg">
        <h1>Development pages index</h1>
      </div>

      { _.uniq( devApps.map( a => a.group ) ).map( g => <div>
        <h2>{g ? _.get( groups.filter( group => g === group.slug ), '0.label' ) : 'Other' }</h2>
        {_.chunk( devApps.filter( a => a.group === g ), 4 ).map( chunk => <div className="row margin-top-md">
          {chunk.map( app =>
            <div className="col-lg-3" key={app.link.substr( 1 )}>
              <div className="wsq padding-v-sm padding-h-md">
                <label>{app.name}</label>
                <p>{app.description}</p>
                <a href={app.link}>Open</a>
              </div>
            </div>
          )}
        </div> ) }
      </div> ) }

    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
