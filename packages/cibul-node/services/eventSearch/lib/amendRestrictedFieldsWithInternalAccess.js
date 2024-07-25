import { produce } from 'immer';

export default produce(formSchema => {
  formSchema.fields.forEach(field => {
    if (Array.isArray(field.read) && !field.read.includes('internal')) {
      field.read.push('internal');
    }
  });
});
