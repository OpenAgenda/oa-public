"use strict";

import searchActions from './search';
import eventActions from './events';
import utils from 'utils';

let actions = utils.extend( {}, searchActions, eventActions );

export default actions;