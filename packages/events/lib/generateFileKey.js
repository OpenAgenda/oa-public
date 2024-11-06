import uuid from 'uuid';

const { v4: uuidV4 } = uuid;

export default () => uuidV4().replace(/-/g, '');
