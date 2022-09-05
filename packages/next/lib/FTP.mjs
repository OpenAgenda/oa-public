import { promisify } from 'util';

export default function FTP(client) {
  return {
    put: promisify(client.put.bind(client)),
    logout: promisify(client.logout.bind(client)),
    list: promisify(client.logout.bind(client)),
    mkdir: promisify(client.mkdir.bind(client)),
    delete: promisify(client.delete.bind(client))
  };
}
