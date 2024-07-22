import fs from 'node:fs/promises';
import _ from 'lodash';

async function _loadLayouts() {
  const filenames = await fs.readdir(new URL('.', import.meta.url).pathname);

  const layoutModules = await Promise.all(
    filenames
      .filter(filename => filename.split('.').length === 1)
      .filter(filename => !['test'].includes(filename))
      .map(async layoutName => {
        const layoutModule = await import(new URL(`./${layoutName}/index.js`, import.meta.url).pathname);
        return { layoutName, layoutModule: layoutModule.default || layoutModule };
      }),
  );

  return layoutModules.reduce(
    (layouts, { layoutName, layoutModule }) => _.set(layouts, layoutName, layoutModule),
    {},
  );
}

const layouts = await _loadLayouts();

const mappedLayouts = _.mapValues(layouts, ({ parent, parser, render }) => (content, data = {}) => {
  const parsedData = parser ? parser(data) : data;
  const rendered = render(parsedData).replace('{content}', content);
  return parent ? mappedLayouts[parent](rendered, parsedData) : rendered;
});

export const load = (layoutName, preLoaded = {}) => (content, data = {}) => mappedLayouts[layoutName](content, { ...preLoaded, ...data });

export default mappedLayouts;
