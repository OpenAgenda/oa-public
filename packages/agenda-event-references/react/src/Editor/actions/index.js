"use strict";

import searchActions from './search';
import eventActions from './events';

let actions = Object.assign( {}, searchActions, eventActions );

export default actions;