import _ from 'lodash';
import {
  produce
} from 'immer';

export default (embed, path, onChange) => () => {
  onChange(produce(embed, draft => {
    _.set(draft, path, !_.get(draft, path));
  }));
}