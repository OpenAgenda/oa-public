'use strict';

module.exports = state => {
  const labelsByState = [
    {
      code: -1,
      label: 'refused'
    }, {
      code: 0,
      label: 'tocontrol'
    }, {
      code: 1,
      label: 'controlled'
    }, {
      code: 2,
      label: 'published'
    },
  ];

  if (!state) return null;

  return labelsByState.find(label => parseInt(label.code, 10) === parseInt(state, 10)).label;
};
