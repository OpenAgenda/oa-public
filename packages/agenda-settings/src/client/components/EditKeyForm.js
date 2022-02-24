import React, { useContext } from 'react';
import { Form, Field } from 'react-final-form';
import { MoreInfo } from '@openagenda/react-shared';
import { InputGroup } from '../utils/inputs';
import I18nContext from '../contexts/I18nContext';

export default function EditKeyForm({ index, item, cancel, onSubmit }) {
  const { getLabel } = useContext(I18nContext);

  return (
    <Form onSubmit={onSubmit}>
      {({ handleSubmit }) => (
        <form className="form-inline" onSubmit={handleSubmit}>
          <div className="input-group">
            <Field
              name="label"
              placeholder={getLabel( 'keyNbr', { nbr: index + 1 } )}
              component={InputGroup}
              className="form-control"
              formGroupClass={false}
              after={(
                <span className="input-group-btn">
                  <MoreInfo
                    id={`cancel-edit-key-${item.id}`}
                    content={getLabel( 'cancel' )}
                  >
                    <button className="btn btn-default" type="button" onClick={() => cancel()}>
                      <i className="fa fa-ban text-danger" aria-hidden="true"></i>
                    </button>
                  </MoreInfo>
                  <MoreInfo
                    id={`save-edit-key-${item.id}`}
                    content={getLabel( 'save' )}
                  >
                    <button className="btn btn-default" type="submit">
                      <i className="fa fa-check text-primary" aria-hidden="true"></i>
                    </button>
                  </MoreInfo>
                </span>
              )}
            />
          </div>
        </form>
      )}
    </Form>
  );
}
