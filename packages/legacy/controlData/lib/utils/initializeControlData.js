"use strict";

const log = require( '@openagenda/logs' )( 'controlData/initializeControlData' );

module.exports = async () => {

  return {
    ev: [],
    l: [], // list of locations
    c: null,
    e: [], // uid of contributors
    adm: [], // uid of admins
    mod: [], // uid of moderators
    o: null, // username of owner ( should be unused )
    m: null, // ?
    ct: [], // { s, c } slug and label of categories
    tg: [], // labels of tag groups
    prv: null,
    t: [], // { s, t, g } slug, label and group index of tags
    lo: null, // { start, end } last timing of agenda ( to determine if it is passed
    sh: null // ?
  }

}
