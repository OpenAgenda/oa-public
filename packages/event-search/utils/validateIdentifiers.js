import { BadRequest } from '@openagenda/verror';

export default function validateIdentifiers(identifiers) {
  if (!identifiers) {
    throw new BadRequest('identifiers are required');
  }

  if (Object.keys(identifiers).length === 0) {
    throw new BadRequest('identifiers object must not be empty');
  }
}
