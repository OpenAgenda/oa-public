'use strict';

module.exports = function generateUid() {
  return async context => {
    const uid = Math.ceil(Math.random() * 99999999);

    const result = await context.service.find({
      query: {
        uid,
        $limit: 0
      }
    });

    if (result.total) {
      return generateUid()(context);
    }

    context.data.uid = uid;

    return context;
  };
};
