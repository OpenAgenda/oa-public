import searchActions from './search';
import eventActions from './events';
import suggestionActions from './suggestions';
import utils from '@openagenda/utils';

let actions = utils.extend( {}, searchActions, eventActions, suggestionActions );

export default actions;
