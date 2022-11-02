import debug from 'debug';

import { useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import CanvasWithStepper from '../components/CanvasWithStepper';
import useAgendaContext from '../hooks/useAgendaContext';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import usePrefix from '../hooks/usePrefix';
import steps from '../lib/steps';
import contributeReducer from '../reducers/contribute';
import utils from '../lib/utils';

const {
  replaceWithStep,
} = utils;

const log = debug('Member');

export default function Member({
  agenda,
  history,
}) {
  log('loading');
  const queryClient = useQueryClient();
  const location = useLocation();
  const prefix = usePrefix(agenda);
  const res = useSelector(state => state.settings.apiRoot + state.res.members);

  const dispatch = useDispatch();

  const {
    detailedAgendaIsLoading,
    detailedAgenda,
  } = useDetailedAgenda(agenda.uid);

  const {
    agendaContextIsLoading,
    agendaContext,
  } = useAgendaContext(agenda.uid, 'Member');

  if (!agenda.settings.contribution.useFields) {
    replaceWithStep(history, location, prefix, 'event');
    return <Loading />;
  }

  if (agendaContextIsLoading) {
    return <Loading />;
  }

  if (detailedAgendaIsLoading) {
    return <Loading />;
  }

  return (
    <CanvasWithStepper
      mode="create"
      steps={steps('member', { agenda })}
    >
      <div className="padding-top-sm">
        <div className="wsq padding-all-md">
          <MemberForm
            agenda={detailedAgenda}
            member={agendaContext?.me?.member}
            res={res.replace(':agendaUid', agenda.uid)}
            onSuccess={() => {
              dispatch(contributeReducer.memberSetSuccess({
                agenda,
                queryClient,
              }));
            }}
          />
        </div>
      </div>
    </CanvasWithStepper>
  );
}
