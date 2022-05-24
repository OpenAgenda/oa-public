'use strict';

module.exports = {
  groups: [{
    label: 'Form field types',
    slug: 'types'
  }, {
    label: 'Displaying errors',
    slug: 'errors'
  }, {
    label: 'Form builder',
    slug: 'builder'
  }],
  cases: [{
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
    name: 'Server side errors on submit',
    description: 'When a response gives back an error because something went awry',
    link: 'servererrors',
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
    name: 'A set of integer fields',
    description: 'A field for typing an integer',
    link: '/integer',
    group: 'types'
  }, {
    name: 'A set of number fields',
    description: 'A field for typing a number',
    link: '/number',
    group: 'types'
  }, {
    name: 'A set of text fields',
    description: 'A field for typing some text',
    link: '/text',
    group: 'types'
  }, {
    name: 'A link field',
    description: 'A field for typing a link/url',
    link: '/link',
    group: 'types'
  }, {
    name: 'An email field',
    description: 'A field for typing an email',
    link: '/email',
    group: 'types'
  }, {
    name: 'A date field',
    description: 'A field to define a date',
    link: '/date',
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
    name: 'A boolean ( unique checkbox )',
    description: 'When it is a yes or no question',
    link: '/boolean',
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
    name: 'An image upload field with a too large image',
    description: 'A field for uploading an image erroring because of the uploaded file size',
    link: '/imageuploadtoolarge',
    group: 'types'
  }, {
    name: 'Multilingual fields with one language',
    description: 'Multilingual fields when only one language is active',
    link: '/multilingualwithonelanguage'
  }, {
    name: 'Required multilingual field',
    description: 'Multilingual field when optional is false',
    link: '/requiredmultilingual'
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
    name: 'dependents',
    description: 'optionalWith and enableWith',
    link: '/withs'
  }, {
    name: 'hidden',
    description: 'if "display" setting of field is specified as falsy, the field is not displayed',
    link: '/hidden'
  }, {
    name: 'missinglanguage',
    description: 'if requested language is not defined in label, other language is used for labels',
    link: '/missinglanguage'
  }]
};
