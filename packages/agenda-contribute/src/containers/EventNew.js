import debug from 'debug';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import qs from 'qs';

import CanvasWithStepper from '../components/CanvasWithStepper';
import ClosedMessage from '../components/ClosedMessage';
import EventNewForm from '../components/EventNewForm';
import Loading from '../components/Loading';
import Instructions from '../components/Instructions';

import steps from '../lib/steps';
import utils from '../lib/utils';
import useEventFormConfig from '../hooks/useEventFormConfig';
import usePrefix from '../hooks/usePrefix';
import useEventDataForDuplicate from '../hooks/useEventDataForDuplicate';

import contributeReducer from '../reducers/contribute';

const {
  isContributionType,
  filterState,
} = utils;

const log = debug('EventNew');

export default function EventNew({ agenda, history }) {
  log('loading');

  const location = useLocation();
  const dispatch = useDispatch();
  const prefix = usePrefix(agenda);
  const {
    config,
    isLoading,
    agendaContext,
  } = useEventFormConfig(agenda);
  const apiRoot = useSelector(state => state.settings.apiRoot);

  const {
    hasReferenceForDuplicate,
    isReferenceLoading,
    referenceData,
    duplicateOrigin,
  } = useEventDataForDuplicate(agenda);

  if (isLoading || isReferenceLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('event', { agenda })}
      onSelectStep={step => history.push(`${prefix}/${step}`)}
    >
      {isContributionType(agenda, 'CLOSED') ? <ClosedMessage memberRole={agendaContext?.me?.member?.role} className="margin-bottom-md" /> : null}
      <Instructions
        message={agenda?.settings?.contribution?.messages?.instructions}
        className="margin-bottom-lg"
      />
      <EventNewForm
        location={location}
        res={`${apiRoot}${prefix}${qs.stringify(duplicateOrigin ? { duplicateOrigin } : null, { addQueryPrefix: true })}`}
        event={filterState(agendaContext, hasReferenceForDuplicate ? referenceData : null)}
        history={history}
        config={config}
        onSuccess={(event, response) => {
          dispatch(contributeReducer.eventCreateSuccess({
            agenda,
            response,
          }));
        }}
        memberRole={agendaContext?.me?.member?.role}
        onDraftDelete={() => {}}
      />
    </CanvasWithStepper>
  );
}
