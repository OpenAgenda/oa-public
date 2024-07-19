export default function isSIRETEnabled(agenda) {
  return agenda.schema.fields.find(f => f.field === 'location')?.legacy?.displaySIRETInput;
}
