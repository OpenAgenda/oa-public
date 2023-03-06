import { useState } from 'react';
import Select from 'react-select';
import languages from 'languages';

const LanguageItem = ({
  edited = false, // maybe
  enabled = true,
  editable = true,
  code,
  languagesProp,
  onRemove,
  onChange,
  onEdit,
  getRemainingLanguages
}) => {
  const lInfo = languages.getLanguageInfo(code);

  const itemOnRemove = () => {
    if (!editable) return;
    onRemove(code);
  };

  const itemOnChange = language => {
    onChange(code, language.value);
  };

  const renderCross = () => (<span onClick={itemOnRemove} className="remove">&#10005;</span>); // eslint-disable-line

  return (
    <>
      {edited ? (
        <li>
          <Select
            value={lInfo.nativeName}
            options={getRemainingLanguages()}
            onChange={itemOnChange}
            clearable={false}
            className="change-select"
          />
        </li>
      ) : (
        <li className={enabled ? '' : 'disabled'}>
          <div className="language-item">
            <span onClick={onEdit}>{lInfo.nativeName}</span> {/* eslint-disable-line */}
            {languagesProp.length > 1 && editable ? renderCross() : null}
          </div>
        </li>
      )}
    </>
  );
};

const LanguageBar = ({
  enabled,
  editable = true,
  languagesProp,
  getLabel,
  onChange,
}) => {
  const [displaySelect, setDisplaySelect] = useState(false);
  const [edited, setEdited] = useState(false);

  const onRemove = code => {
    onChange(languagesProp.filter(l => l !== code));
  };

  const isEnable = lang => {
    if (!enabled) return true;
    return enabled.indexOf(lang) !== -1;
  };

  const sortLanguageCode = () => languages.getAllLanguageCode().map(c => ({ code: c, label: languages.getLanguageInfo(c).nativeName })).sort((a, b) => {
    if (a.label < b.label) return -1;
    if (a.label > b.label) return 1;
    return 0;
  }).map(a => a.code);

  const getRemainingLanguages = () => sortLanguageCode().filter(c => languagesProp.indexOf(c) === -1).map(
    c => ({ value: c, label: languages.getLanguageInfo(c).nativeName })
  );

  const languageAdd = newCode => {
    const languagesSliced = languagesProp.slice();
    languagesSliced.push(newCode.value);
    setDisplaySelect(false);
    onChange(languagesSliced);
  };

  const languageChange = (previousCode, newCode) => {
    const languagesSliced = languagesProp.slice();
    languagesSliced.splice(languagesSliced.indexOf(previousCode), 1, newCode);
    setEdited(false);
    onChange(languagesSliced);
  };

  return (
    <div className="language-bar">
      <ul>
        {languagesProp.map(l => (
          <LanguageItem
            enabled={isEnable(l)}
            editable={editable}
            code={l}
            key={l}
            edited={l === edited}
            languagesProp={languagesProp}
            getRemainingLanguages={getRemainingLanguages}
            onRemove={onRemove}
            onChange={languageChange}
            onEdit={() => setEdited(l)}
          />
        ))}
      </ul>
      {editable ? (
        <span className="language-add cform">
          {displaySelect ? (
            <Select
              options={getRemainingLanguages()}
              onChange={languageAdd}
              clearable={false}
            />
          ) : <a className="url" onClick={() => setDisplaySelect(true)}>{getLabel('addLanguage')}</a> /*eslint-disable-line */}
        </span>
      ) : null}

    </div>
  );
};

export default LanguageBar;
