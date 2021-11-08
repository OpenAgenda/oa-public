const { createElement: el } = require('react');

module.exports = function Input({ input, placeholder, onButtonClick }) {
  return el(
    'div',
    { className: 'input-group mb-3' },
    el(
      'input',
      {
        className: 'form-control',
        autoComplete: 'off',
        placeholder,
        ...input
      }
    ),
    el(
      'div',
      {
        className: 'input-group-append'
      },
      el(
        'button',
        {
          type: 'submit',
          className: 'btn btn-outline-secondary',
          onClick: onButtonClick
        },
        el(
          'i',
          {
            className: 'fa fa-search',
            'aria-hidden': true
          }
        )
      )
    )
  );
};
