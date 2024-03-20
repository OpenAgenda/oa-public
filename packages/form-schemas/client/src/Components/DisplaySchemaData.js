import { useState, useEffect } from 'react';
import { Spinner } from '@openagenda/react-shared';

import flatten from '../lib/flatten';

export default function DisplaySchemaData({
  schema: schemaFromProps,
  data: dataFromProps,
  lang = 'en',
  res,
}) {
  const [isLoading, setIsLoading] = useState(!!res);
  const [schema, setSchema] = useState(res ? null : schemaFromProps);
  const [data, setData] = useState(res ? null : dataFromProps);

  useEffect(() => {
    if (!res) return;

    fetch(res).then(response => {
      response.json().then(({
        schema: schemaFromRes,
        data: dataFromRes,
      }) => {
        setSchema(schemaFromRes);
        setData(dataFromRes);
        setIsLoading(false);
      });
    });
  }, [res]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <ul className="list-unstyled">
      {schema.fields.map(field => {
        const { label } = flatten(field, lang);
        const value = data?.[field.field];

        if (field.fieldType === 'link') {
          return (
            <li className="margin-bottom-xs" key={`value-${field.field}`}>
              <a rel="noreferrer" href={value} target="_blank">{label}</a>
            </li>
          );
        }

        return (
          <li className="margin-bottom-xs" key={`value-${field.field}`}>
            <strong>{label}</strong>
            <div>{value}</div>
          </li>
        );
      })}
    </ul>
  );
}
