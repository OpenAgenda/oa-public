"use strict";

import searchActions from './search';
import eventActions from './events';
import utils from '@openagenda/utils';

let actions = utils.extend( {}, searchActions, eventActions );

export default actions;