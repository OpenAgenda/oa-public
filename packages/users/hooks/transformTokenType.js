import _ from 'lodash';

export default function transformTokenType(key) {
  return (context) => {
    const obj = _.get(context, key, {});

    switch (obj.type) {
      case 'lostPassword':
        obj.type = 'lp';
        break;
      case 'unlinkFacebook':
        obj.type = 'uf';
        break;
      default:
        break;
    }

    _.set(context, key, obj);
  };
}
