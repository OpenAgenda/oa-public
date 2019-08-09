"use strict";

module.exports = ( config, agenda ) => {
  return agenda.image ? {
    src: agenda.image,
    width: '100px'
  } : {
    src: `${config.root}/images/openagenda.png`,
    width: '300px'
  };
}
