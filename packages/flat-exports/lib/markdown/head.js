import fs from 'node:fs';
import _ from 'lodash';

const render = {
  txt: _.template(
    fs.readFileSync(`${import.meta.dirname}/txtHead.tpl`, 'utf-8'),
  ),
  md: _.template(fs.readFileSync(`${import.meta.dirname}/mdHead.tpl`, 'utf-8')),
};

export default (format, data) => render[format](data);
