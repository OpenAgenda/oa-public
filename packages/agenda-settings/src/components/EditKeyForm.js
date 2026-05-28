import { useContext } from 'react';
import { Form, Field } from 'react-final-form';
import { MoreInfo } from '@openagenda/react-shared';
import { InputGroup } from '../utils/inputs.js';
import I18nContext from '../contexts/I18nContext.js';

export default function EditKeyForm({ item, cancel, onSubmit }) {
  const { getLabel } = useContext(I18nContext);

  return (
    <Form onSubmit={onSubmit}>
      {({ handleSubmit }) => (
        <form className="form-inline" onSubmit={handleSubmit}>
          <div className="input-group">
            <Field
              name="name"
              placeholder={getLabel('keyDefaultName', { id: item.id })}
              component={InputGroup}
              className="form-control"
              formGroupClass={false}
              after={(
                <span className="input-group-btn">
                  <MoreInfo content={getLabel('cancel')}>
                    <button
                      className="btn btn-default"
                      type="button"
                      onClick={() => cancel()}
                      aria-label={getLabel('cancel')}
                    >
                      <i className="fa fa-ban text-danger" aria-hidden="true" />
                    </button>
                  </MoreInfo>
                  <MoreInfo content={getLabel('save')}>
                    <button
                      className="btn btn-default"
                      type="submit"
                      aria-label={getLabel('save')}
                    >
                      <i
                        className="fa fa-check text-primary"
                        aria-hidden="true"
                      />
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
