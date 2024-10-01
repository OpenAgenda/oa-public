import _ from 'lodash';

import languages from 'languages';
import { Component } from 'react';
import Select from 'react-select';

import flattenLabels from '@openagenda/labels/flatten';
import languageLabels from '@openagenda/labels/event/form';
import { a11yButtonActionHandler } from '@openagenda/react-shared';

const languageCodesAndLabels = languages
  .getAllLanguageCode()
  .map((c) => ({ value: c, label: languages.getLanguageInfo(c).nativeName }))
  .sort((a, b) => (a.label < b.label ? -1 : 1));

export default class Languages extends Component {
  constructor(props) {
    super(props);

    this.state = { adding: false, changing: false };

    this.onAddSelectStart = this.onAddSelectStart.bind(this);
    this.onChangeStart = this.onChangeStart.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCancelChange = this.onCancelChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.getRemainingLanguages = this.getRemainingLanguages.bind(this);
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
    const { value, onChange } = this.props;
    onChange(value.filter((current) => current !== l));
  }

  onAdd(l) {
    const { value, onChange } = this.props;
    onChange(value.concat(l.value));

    this.setState({ adding: false });
  }

  getRemainingLanguages() {
    const { value } = this.props;
    return languageCodesAndLabels.filter((l) => !value.includes(l.value));
  }

  render() {
    const { value: pickedLanguages, lang } = this.props;
    const { adding, changing } = this.state;

    const labels = flattenLabels(languageLabels, lang);

    const className = _.get(this.props, 'className', 'language-bar');

    return (
      <div className={className}>
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
                  {pickedLanguages.length > 1 ? (
                    <span
                      className="remove"
                      role="button"
                      tabIndex="0"
                      onClick={a11yButtonActionHandler(() => this.onRemove(l))}
                      onKeyPress={a11yButtonActionHandler(() =>
                        this.onRemove(l))}
                    >
                      &#10005;
                    </span>
                  ) : null}
                  {pickedLanguages.length === 1 ? (
                    <span className="margin-right-xs">
                      <i className="fa fa-angle-down" />
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {!adding && !changing ? (
          <span className="language-add">
            {/* eslint-disable-next-line */}
            <a onClick={this.onAddSelectStart}>{labels.addLanguage}</a>
          </span>
        ) : null}
        {adding && (
          <span className="language-add">
            <Select
              options={this.getRemainingLanguages()}
              onChange={this.onAdd}
              clearable={false}
              menuPosition="fixed"
            />
          </span>
        )}
        {changing && (
          <Select
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
        {changing ? (
          <span className="change-cancel">
            {/* eslint-disable-next-line */}
            <a onClick={this.onCancelChange}>{labels.cancelLanguageChange}</a>
          </span>
        ) : null}
      </div>
    );
  }
}
