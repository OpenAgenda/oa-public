import { fromMarkdownToHTML } from '@openagenda/md';
import imageToUrl from '../../utils/imageToUrl.js';
import loadFilter from './loadFilter.js';
import loadCustom from './loadCustom.js';
import loadWidget from './loadWidget.js';

const fieldSchema = (fieldName, { data }) =>
  data.root.agenda.schema.fields.find((v) => v.field === fieldName);

function loadHelpers(hbs) {
  return {
    mdToHtml: fromMarkdownToHTML,
    json: JSON.stringify,
    object: ({ hash = {} } = {}) => hash,
    array: (...arr) => arr.slice(0, -1),
    concat: (...strings) => strings.slice(0, -1).join(''),
    fieldSchema,
    image: imageToUrl,
    filter: loadFilter(hbs),
    customFilter: loadCustom(hbs, 'filter'),
    widget: loadWidget(hbs),
    customWidget: loadCustom(hbs, 'widget'),
  };
}

export default loadHelpers;

export function register(hbs) {
  return hbs.registerHelper(loadHelpers(hbs));
}
