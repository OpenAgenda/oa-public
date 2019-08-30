'use strict';

module.exports = agenda => agenda && agenda.image
  ? { src: agenda.image.replace( '.com/', '.com/rwtb' ), width: '100px' }
  : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };
