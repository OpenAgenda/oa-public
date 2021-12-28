import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Stepper from './Stepper';

const messages = defineMessages({
  editDraftTitle: {
    id: 'AgendaContribute.CanvasWithStepper.editDraftTitle',
    defaultMessage: 'Draft'
  },
  addEvent: {
    id: 'AgendaContribute.CanvasWithStepper.addEvent',
    defaultMessage: 'Ajouter un événement'
  }
});

const getTitle = ({
  event,
  locale,
  title,
  labels
}) => {
  if (title) return title;

  const draft = event?.draft === undefined ? false : event.draft;

  if (!draft) {
    return labels.addEvent;
  }

  const titleLanguages = Object.keys(event.title || {});

  const eventLanguage = titleLanguages.includes(locale) ? locale : titleLanguages.shift();

  const titleParts = [];

  if (event.draft) {
    titleParts.push(labels.editDraftTitle);
  }

  if (eventLanguage) {
    titleParts.push(event.title[eventLanguage]);
  }

  return titleParts.join(': ');
};

export default function CanvasWithStepper({
  steps,
  event,
  children,
  onSelectStep
}) {
  const intl = useIntl();

  const {
    formatMessage: m,
    locale
  } = intl;

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8 col-lg-offset-3 col-lg-6 margin-bottom-lg">
          <div className="text-center padding-top-lg">
            <h2 className="margin-top-md">{getTitle({
              event,
              locale,
              labels: {
                editDraftTitle: m(messages.editDraftTitle),
                addEvent: m(messages.addEvent)
              }
            })}
            </h2>
            <div className="padding-h-md stepper-gray-background padding-v-md">
              <Stepper
                steps={steps}
                onSelectStep={onSelectStep}
              />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
