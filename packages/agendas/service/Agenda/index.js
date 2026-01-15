import _ from 'lodash';
import logger from '@openagenda/logs';
import publicValidate from '../validate/public.js';

function Agenda(data, service) {
  if (!service) {
    return new Error('service parameter is required');
  }

  if (!data.uid) {
    return new Error('identifier uid is not set');
  }

  const log = logger('agendas/instanciate');

  Object.assign(this, { data, service, log });
}

async function _loadInternals() {
  const agenda = await this.service.get(
    { uid: this.data.uid },
    { internal: true, private: null },
  );

  if (!agenda) return;

  _.forIn(agenda, (value, field) => {
    if (this.data[field] !== undefined) return;

    this.data[field] = value;
  });
}

function getData(options) {
  const params = _.extend(
    {
      internal: false,
    },
    options || {},
  );

  return params.internal ? this.data : publicValidate(this.data);
}

function getImage(includePath = false, useDefaultImage = false) {
  const { defaultImagePath } = this.service.getConfig();
  const path = this.service.getConfig().imagePath;
  const image = this.data.image ? this.data.image.split('/').pop() : null;

  if (image === null) return useDefaultImage ? defaultImagePath : null;

  return (includePath ? path : '') + image;
}

Object.assign(Agenda.prototype, {
  getData,
  getImage,
  _loadInternals,
});

export default Agenda;
