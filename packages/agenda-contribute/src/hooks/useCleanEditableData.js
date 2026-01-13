import _ from 'lodash';

const cleanEditableData = (event) => _.omit(event, ['links']);

export default cleanEditableData;
