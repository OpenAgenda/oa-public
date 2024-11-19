import _ from 'lodash';

let createLog = (namespace) =>
  (...args) => {
    console.log(
      ...[`${namespace}: ${_.get(args, '0', '')}`].concat(args.slice(1)),
    );
  };

export default (namespace) =>
  (...args) =>
    createLog(namespace)(...args);

export function set(logger) {
  createLog = logger;
}
