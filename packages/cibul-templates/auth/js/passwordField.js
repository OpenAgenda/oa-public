import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDebounce } from 'use-debounce';
import { Spinner } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import {
  IntlProvider,
  defineMessages,
  useIntl,
} from 'react-intl';

import {
  getTypeFromClass,
  getClassesFromType,
  testPostEvaluate,
  postEvaluate,
} from './utils';

import appLocales from '../../locales-compiled';

const messages = defineMessages({
  required: {
    id: 'cibulTemplates.passwordField.required',
    defaultMessage: 'A password must be defined',
  },
  tooWeak: {
    id: 'cibulTemplates.passwordField.tooWeak',
    defaultMessage: 'Too weak 😑',
  },
  weak: {
    id: 'cibulTemplates.passwordField.weak',
    defaultMessage: 'Not very secure 😐',
  },
  weakish: {
    id: 'cibulTemplates.passwordField.weakish',
    defaultMessage: 'A bit better 😬'
  },
  good: {
    id: 'cibulTemplates.passwordField.good',
    defaultMessage: 'Ok 🙂',
  },
  great: {
    id: 'cibulTemplates.passwordField.great',
    defaultMessage: 'Great 🥳',
  }
});

function PasswordField({
  value: initValue,
  type: initType,
  labelText,
  subText: initSubText,
  fetch: fetchFn,
}) {
  const intl = useIntl();
  const [value, setValue] = useState(initValue);
  const [type, setType] = useState(initType);
  const [subText, setSubText] = useState(initSubText);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedValue] = useDebounce(value, 1000);

  const classes = useMemo(() => getClassesFromType(type), [type])

  useEffect(() => {
    setIsLoading(true);
    fetchFn(debouncedValue).then(({
      message,
    }) => {
      setSubText(message.code);
      setType(message.type);
      setIsLoading(false);
    }, () => setIsLoading(false));
  }, [debouncedValue]);

  return (<div className={classes.group}>
    <label htmlFor="password" className="control-label">{labelText}</label>
    <input
      name="password"
      className="form-control"
      type="password"
      value={value}
      onChange={e => setValue(e.target.value)}
    />
    {subText ? (
      <div className={classes.sub}>
        {messages[subText] ? intl.formatMessage(messages[subText]) : subText} 
        {isLoading ? <Spinner mode="inline"/> : null}
      </div>
    ) : null}
  </div>);
}

export default function passwordField({ lang }) {
  const selector = '.js_password';
  const subSelector = '.js_password_sub';
  const elem = document.querySelector(selector);

  if (!elem) {
    return;
  }

  const props = {
    value: document.querySelector(`${selector} input`).value,
    type: getTypeFromClass(Array.from(elem.classList)),
    labelText: document.querySelector(`${selector} label`).innerHTML,
    subText: document.querySelector(subSelector)?.innerHTML,
    fetch: pwd => window.env === 'tpl' ? testPostEvaluate(pwd) : postEvaluate('/api/password/evaluate', pwd),
  };

  ReactDOM.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={appLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <PasswordField {...props} />
    </IntlProvider>,
    elem,
  );
}