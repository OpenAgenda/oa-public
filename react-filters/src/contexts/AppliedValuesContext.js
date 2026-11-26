import { createContext } from 'react';

// With manual submit: the values the list shows, and how to apply a change to
// them without the visitor's pending ones. Null in automatic mode, where the
// form always holds the applied values.
const AppliedValuesContext = createContext(null);

export default AppliedValuesContext;
