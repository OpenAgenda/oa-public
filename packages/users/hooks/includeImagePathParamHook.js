import hooksCommon from 'feathers-hooks-common';

const { alterItems } = hooksCommon;

export default function includeImagePathParamHook() {
  return (context) => {
    const { config } = context.self;

    if (!context.params.includeImagePath || context.result === null) {
      return context;
    }

    return alterItems((record) => ({
      ...record,
      image:
        record.image && config.imagePath
          ? config.imagePath + record.image
          : record.image,
    }))(context);
  };
}
