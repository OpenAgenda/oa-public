
let values = {};

function set(key, value, lifespan = 0) {
  values[key] = value;

  setTimeout(() => {
    delete values[key];
  }, lifespan);
}

function has(key) {
  return values[key] !== undefined;
}

function get(key) {
  return values[key];
}

export default {
  set,
  get,
  has,
}
