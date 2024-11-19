import { Field } from 'react-final-form';
import DateField from './DateField.js';
import TimeField from './TimeField.js';

function TimingsError() {
  return (
    <Field
      name="timings"
      subscription={{ submitError: true }}
      render={({ meta: { submitError } }) =>
        (submitError ? (
          <div className="margin-top-xs text-danger">{submitError}</div>
        ) : null)}
    />
  );
}

export default function TimingsFormPart() {
  return (
    <div className="row">
      <div className="form-group form-group-v-aligned">
        <div className="col-sm-10">
          <div className="form-inline margin-bottom-xs">
            <div className="form-group">Du</div>
            <div className="form-group margin-h-sm">
              <Field
                name="timings.minDate"
                render={({ input }) => (
                  <DateField value={input.value} onChange={input.onChange} />
                )}
              />
            </div>
            <div className="form-group">à</div>
            <div className="form-group">
              <Field
                name="timings.minTime"
                render={({ input }) => (
                  <TimeField value={input.value} onChange={input.onChange} />
                )}
              />
            </div>
          </div>
          <div className="form-inline">
            <div className="form-group">Au</div>
            <div className="form-group margin-h-sm">
              <Field
                name="timings.maxDate"
                render={({ input }) => (
                  <DateField value={input.value} onChange={input.onChange} />
                )}
              />
            </div>
            <div className="form-group">à</div>
            <div className="form-group">
              <Field
                name="timings.maxTime"
                render={({ input }) => (
                  <TimeField value={input.value} onChange={input.onChange} />
                )}
              />
            </div>
          </div>

          <TimingsError />
        </div>
      </div>
    </div>
  );
}
