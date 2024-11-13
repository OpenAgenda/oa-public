import _ from 'lodash';
import { Component } from 'react';
import Select from 'react-select';
import languages from 'languages';

import flattenLabels from '@openagenda/labels/flatten.js';
import languageLabels from '@openagenda/labels/event/form.js';
import { a11yButtonActionHandler } from '@openagenda/react-shared';

import languageCodesAndLabels from '../utils/languageCodesAndLabels.js';
import showRemoveAction from '../utils/showRemoveAction.js';

export default class Languages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      changing: false,
    };

    this.onChangeStart = this.onChangeStart.bind(this);
    this.onAddSelectStart = this.onAddSelectStart.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCancelChange = this.onCancelChange.bind(this);
  }

  onAddSelectStart() {
    this.setState({ adding: true });
  }

  onChangeStart() {
    const { value } = this.props;
    if (value.length !== 1) return;

    this.setState({ changing: true });
  }

  onChange(l) {
    const { onChange } = this.props;

    onChange([l.value]);

    this.setState({ changing: false });
  }

  onCancelChange() {
    this.setState({ changing: false });
  }

  onRemove(l) {
    const { onChange, value } = this.props;
    onChange(value.filter((current) => current !== l));
  }

  onAdd(l) {
    const { onChange, value } = this.props;
    onChange(value.concat(l.value));

    this.setState({ adding: false });
  }

  getRemainingLanguages() {
    const { value } = this.props;
    return languageCodesAndLabels.filter((l) => !value.includes(l.value));
  }

  render() {
    const { value, lang, field } = this.props;

    const { changing, adding } = this.state;

    const pickedLanguages = value;

    const labels = flattenLabels(languageLabels, lang);

    const { strict, required } = field;

    return (
      <div className="language-bar">
        {!changing ? (
          <ul>
            {pickedLanguages.map((l) => (
              <li
                key={`language-${l}`}
                role="presentation"
                onClick={a11yButtonActionHandler(this.onChangeStart)}
                onKeyPress={a11yButtonActionHandler(this.onChangeStart)}
              >
                <div className="language-item">
                  <span>{languages.getLanguageInfo(l).nativeName}</span>
                  {showRemoveAction(
                    { strict, pickedLanguages, required },
                    l,
                  ) ? (
                    <span
                      role="button"
                      tabIndex="0"
                      className="remove"
                      onClick={a11yButtonActionHandler(
                        this.onRemove.bind(this, l),
                      )}
                      onKeyPress={a11yButtonActionHandler(
                        this.onRemove.bind(this, l),
                      )}
                    >
                      &#10005;
                    </span>
                    ) : null}
                  {!strict && pickedLanguages.length === 1 ? (
                    <span className="margin-right-xs">
                      <i className="fa fa-angle-down" />
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {!strict && !adding && !changing ? (
          <span className="language-add">
            {/* eslint-disable-next-line */}
            <a onClick={this.onAddSelectStart}>{labels.addLanguage}</a>
          </span>
        ) : null}
        {adding && (
          <span className="language-add">
            <Select
              placeholder={labels.selectLanguage}
              options={this.getRemainingLanguages()}
              onChange={this.onAdd}
              classNamePrefix="language-select"
              clearable={false}
            />
          </span>
        )}
        {changing && (
          <Select
            placeholder={labels.selectLanguage}
            value={_.first(
              languageCodesAndLabels.filter(
                (c) => _.first(pickedLanguages) === c.value,
              ),
            )}
            options={this.getRemainingLanguages()}
            onChange={this.onChange}
            className="change-select margin-right-sm"
            clearable={false}
          />
        )}
        {changing && (
          <span className="change-cancel">
            {/* eslint-disable-next-line */}
            <a onClick={this.onCancelChange}>{labels.cancelLanguageChange}</a>
          </span>
        )}
      </div>
    );
  }
}
