// Kept for anything importing this path directly: the package publishes `lib/`
// and has no `exports` map. The mapping itself lives in `@openagenda/sdk-js`.
// @deprecated Import `toEventSchema` from `@openagenda/sdk-js/schema-org`.
import { toEventSchema } from '@openagenda/sdk-js/schema-org';

export default toEventSchema;
