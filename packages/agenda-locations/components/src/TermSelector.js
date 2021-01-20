import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import xhr from 'xhr';
import Select from 'react-select';

class TermSelector extends React.Component {
  static defaultProps = {
    lang: 'en',
    placeholder: null
  };

  static propTypes = {
    placeholder: PropTypes.string,
    // interface language
    lang: PropTypes.string,
    // currently selected term
    value: PropTypes.string.isRequired,
    // field from which to extract terms
    // for more than one field, comma-separate.
    field: PropTypes.string.isRequired,
    // ressource to fetch terms
    res: PropTypes.string.isRequired,
    // callback to go to when change is made
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      terms: []
    };
  }

  componentDidMount() {
    this.fetchTerms();
  }

  UNSAFE_componentWillReceiveProps({ field }) {
    const { field: pField } = this.props;
    if (pField === field) return;

    this.setState({ terms: [] });
  }

  componentDidUpdate({ field }) {
    const { field: pField } = this.props;
    if (pField === field) return;

    this.fetchTerms();
  }

  onChange(index) {
    const { onChange } = this.props;
    const { terms } = this.state;
    onChange(terms[index]);
  }

  getTermIndex(value) {
    const { terms } = this.state;
    if (!value) return null;

    return terms.findIndex(t => {
      let found = false;

      for (const k in t) {
        if (
          !['country', 'countryCode'].includes(k)
          && (typeof value === 'string' ? value : value[k]) === t[k]
        ) {
          found = true;
        }
      }

      return found;
    });
  }

  fetchTerms() {
    const { res, field } = this.props;
    xhr(
      {
        json: true,
        uri: `${res}?field=${field}`,
      },
      (err, { body }) => {
        if (err) return;

        const firstTerm = field.split(',')[0];

        const sortedTerms = body.terms.sort((a, b) => {
          if (a[firstTerm] > b[firstTerm]) {
            return 1;
          }

          if (a[firstTerm] < b[firstTerm]) {
            return -1;
          }

          // a must be equal to b
          return 0;
        });

        this.setState({
          terms: sortedTerms,
        });
      }
    );
  }

  termOption(term, index) {
    const option = {
      value: index,
      label: '',
    };
    const { field: pField, lang } = this.props;
    const labelParts = [];

    pField.split(',').forEach(field => {
      // country is specific as it is multilingual
      if (field === 'country') {
        labelParts.push(
          _.get(
            term.country,
            lang,
            term.country[_.first(_.keys(term.country))]
          )
        );
      } else {
        labelParts.push(term[field]);
      }
    });

    option.label = labelParts.join(', ');

    return option;
  }

  render() {
    const { value: pValue, placeholder } = this.props;
    const { terms } = this.state;
    const selectStyles = {
      container: provided => ({
        ...provided,
        display: 'inline-block',
        width: '180px',
      }),
      control: provided => ({
        ...provided,
        borderRadius: '0 4px 4px 0',
        borderLeft: 'none',
      }),
    };
    const options = terms.map((t, i) => this.termOption(t, i));
    const value = options.find(
      option => option.value
        === (this.getTermIndex(pValue) || pValue)
    );

    return (
      <div className="terms-selector">
        <Select
          styles={selectStyles}
          placeholder={placeholder || null}
          value={value}
          options={options}
          onChange={value => this.onChange(value ? value.value : value)}
          clearable
        />
      </div>
    );
  }
}

export default TermSelector;
