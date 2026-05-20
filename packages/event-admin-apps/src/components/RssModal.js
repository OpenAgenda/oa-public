import { useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Modal, SortableSelect } from '@openagenda/react-shared';
import exportsMessages from '../messages/exports.js';

function pickLabel(label, lang, fallback) {
  if (!label) return fallback;
  if (typeof label === 'string') return label;
  if (label[lang]) return label[lang];
  const first = Object.keys(label)[0];
  return first ? label[first] : fallback;
}

async function copyText(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ele = document.createElement('textarea');
    ele.value = text;
    document.body.appendChild(ele);
    ele.select();
    const success = document.execCommand('copy');
    document.body.removeChild(ele);
    return success;
  } catch (e) {
    return false;
  }
}

function buildRssUrl({ agendaUid, queryString, sort, categoryFields }) {
  const url = new URL(
    `/agendas/${agendaUid}/admin/events.v2.rss${queryString}`,
    window.location.origin,
  );
  url.searchParams.set('sort', sort);
  url.searchParams.delete('category');
  categoryFields.forEach((f) => url.searchParams.append('category', f));
  return url.toString();
}

export default function RssModal({ onClose, agendaUid, queryString = '' }) {
  const intl = useIntl();

  const [choiceFields, setChoiceFields] = useState([]);
  const [sort, setSort] = useState('updatedAt.desc');
  const [categoryFields, setCategoryFields] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/agendas/${agendaUid}/admin/settings/exports`,
      );
      const data = await response.json();
      setChoiceFields(data?.choiceFields ?? []);
    }

    fetchData();
  }, [agendaUid]);

  useEffect(() => {
    if (!copied) return undefined;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  const options = useMemo(
    () =>
      choiceFields.map((f) => ({
        value: f.field,
        label: pickLabel(f.label, intl.locale, f.field),
      })),
    [choiceFields, intl.locale],
  );

  const rssUrl = useMemo(
    () => buildRssUrl({ agendaUid, queryString, sort, categoryFields }),
    [agendaUid, queryString, sort, categoryFields],
  );

  const handleCopy = async (e) => {
    e.preventDefault();
    const success = await copyText(rssUrl);
    if (success) setCopied(true);
  };

  return (
    <Modal
      onClose={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <form className="export export-form" onSubmit={handleCopy}>
        <div className="margin-bottom-sm">
          <label htmlFor="rss-sort">
            {intl.formatMessage(exportsMessages.RSSSort)}
          </label>
          <select
            id="rss-sort"
            className="form-control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="updatedAt.desc">
              {intl.formatMessage(exportsMessages.RSSSortUpdated)}
            </option>
            <option value="lastTimingWithFeatured.asc">
              {intl.formatMessage(exportsMessages.RSSSortChronological)}
            </option>
          </select>
        </div>

        {options.length > 0 ? (
          <div className="margin-bottom-sm">
            <div>{intl.formatMessage(exportsMessages.RSSCategoryField)}</div>
            <div className="margin-top-xs">
              <SortableSelect
                options={options}
                value={categoryFields}
                placeholder={intl.formatMessage(
                  exportsMessages.RSSCategoryFieldNone,
                )}
                onChange={(update) => setCategoryFields(update)}
                menuPosition="fixed"
              />
            </div>
          </div>
        ) : null}

        <textarea
          className="form-control"
          value={rssUrl}
          readOnly
          rows={3}
          onClick={(e) => {
            if (e.target.selectionStart === e.target.selectionEnd) {
              e.target.select();
            }
          }}
        />

        <button
          className="close"
          type="button"
          onClick={onClose}
          aria-label={intl.formatMessage(exportsMessages.cancel)}
        >
          <i className="fa fa-times fa-lg" />
        </button>
        <div className="margin-top-md text-center">
          <button type="submit" className="btn btn-primary">
            {copied
              ? intl.formatMessage(exportsMessages.RSSCopied)
              : intl.formatMessage(exportsMessages.RSSCopy)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
