import counters from './utils/counters.js';

export default (hbs) =>
  ({ hash, data }) => {
    counters.init(data);

    const {
      tagName = 'div',
      className = '',
      attributes = '',
      name,
      ...restOptions
    } = hash;

    const attrs = {
      ...restOptions,
      name,
    };

    if (name === 'total' && attrs.message) {
      const { i18n } = hbs.handlebars.helpers;
      attrs.message = {
        id: attrs.message,
        defaultMessage: i18n(attrs.message, { data, hash: true }),
      };
    }

    const i = counters.increment(data, 'widgets', name);

    if (data.root.__extractFiltersAndWidgets) {
      data.root.widgets.push({
        ...attrs,
        destSelector: `[data-oa-widget="${name}-${i}"][data-oa-widget-params="${JSON.stringify(
          attrs,
        ).replace(/["\\]/g, '\\$&')}"]`,
      });
    }

    return new hbs.SafeString(`
    <${tagName}
      ${className ? `class="${className}"` : ''}
      ${attributes}
      data-oa-widget="${name}-${i}"
      data-oa-widget-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    ></${tagName}>
  `);
  };
