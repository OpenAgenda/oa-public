import load from 'load-script';

const loads = {};

function _loader(res, cb) {
  let loaded = null;
  const cbs = [];

  load(res, (err, script) => {
    loaded = {
      err,
      script,
    };

    cbs.forEach((cb1) => {
      cb1(err, script);
    });
  });

  function add(cb1) {
    if (loaded) return cb1(loaded.err, loaded.script);

    cbs.push(cb1);
  }

  add(cb);

  return {
    add,
  };
}

export default (res, cb) => {
  if (loads[res]) {
    loads[res].add(cb);
  } else {
    loads[res] = _loader(res, cb);
  }
};
