import fs from 'node:fs';

export default (...args) => {
  const path = args.length === 1 ? '/tmp/event-search.json' : `/tmp/${args[0]}`;
  const obj = args.length === 1 ? args[0] : args[1];
  fs.writeFileSync(path, JSON.stringify(obj, null, 2));
};
