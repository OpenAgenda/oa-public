import { useState, useEffect, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import setFieldDataMutator from 'final-form-set-field-data';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useLatest } from 'react-use';
import { Spinner } from '@openagenda/react-shared';
import locales from '../locales-compiled';
import AbilitiesForm from './AbilitiesForm';
import getChildCheckboxDecorator from './getChildCheckboxDecorator';

let uniqueIdCounter = 0;

function getUniqueId() {
  uniqueIdCounter += 1;
  return uniqueIdCounter;
}

function getInitialValues(rules) {
  return rules.reduce((result, rule) => {
    result[rule.key] = rule.inverted === undefined ? true : !rule.inverted;
    return result;
  }, {});
}

function AbilitiesEditor({
  entityName,
  identifier,
  locale = 'en',
  filterInputPlaceholder = '',
  onSubmit,
  res,
  HeaderComponent,
  searchChildKey,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAbilities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${res.formIndex}?entityName=${entityName}&identifier=${identifier}`,
      );
      const fetchedData = await response.json();
      const formattedData = fetchedData.map((v) => ({
        ...v,
        key: `rule${getUniqueId()}`,
      }));
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [res.formIndex, entityName, identifier]);

  useEffect(() => {
    fetchAbilities();
  }, [fetchAbilities]);

  const handleSubmit = async (values, form) => {
    const formIndex = data.map((rule) => ({
      ...rule,
      inverted: !values[rule.key],
    }));

    if (typeof onSubmit === 'function') {
      return onSubmit(formIndex);
    }

    try {
      const response = await fetch(
        `${res.formIndex}?entityName=${entityName}&identifier=${identifier}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formIndex),
        },
      );
      const responseData = await response.json();
      if (Array.isArray(responseData)) {
        const formattedData = responseData.map((v) => ({
          ...v,
          key: `rule${getUniqueId()}`,
        }));
        setData(formattedData);
        form.initialize(getInitialValues(formattedData));
      }
    } catch (err) {
      setError(err);
    }
  };

  const latestData = useLatest(data);
  const childCheckboxDecorator = useMemo(
    () =>
      getChildCheckboxDecorator({
        entityName,
        identifier,
        getRules: () => latestData.current,
      }),
    [latestData, entityName, identifier],
  );

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (error) {
      return (
        <FormattedMessage
          id="Abilities.AbilitiesEditor.error"
          defaultMessage="Error."
        />
      );
    }

    return (
      <Form
        validateOnBlur
        subscription={{}}
        initialValues={getInitialValues(data)}
        onSubmit={handleSubmit}
        decorators={[childCheckboxDecorator]}
        mutators={{ setFieldData: setFieldDataMutator }}
        component={AbilitiesForm}
        rules={data}
        entityName={entityName}
        identifier={identifier}
        HeaderComponent={HeaderComponent}
        searchChildKey={searchChildKey}
        filterInputPlaceholder={filterInputPlaceholder}
      />
    );
  };

  const messages = locales[locale] || locales.en;
  return (
    <IntlProvider locale={locale} messages={messages}>
      {renderContent()}
    </IntlProvider>
  );
}

export default AbilitiesEditor;
