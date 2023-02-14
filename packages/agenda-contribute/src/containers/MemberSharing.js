import debug from 'debug';

import { useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';

import MemberForm from '../components/MemberForm';
import Canvas from '../components/Canvas';
import useAgendaContext from '../hooks/useAgendaContext';
import useEvent from '../hooks/useEvent';
import useDetailedAgenda from '../hooks/useDetailedAgenda';
import usePrefix from '../hooks/usePrefix';

import contributeReducer from '../reducers/contribute';
import utils from '../lib/utils';

const {
  replaceWithStep,
} = utils;

const log = debug('Member');

export default function MemberSharing({
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
    agendaContextIsLoading,
    agendaContext,
  } = useAgendaContext(agenda.uid, 'Member');

  const {
    eventUid,
    fromAgendaUid,
  } = useParams();

  const {
    eventIsLoading,
    event,
  } = useEvent(fromAgendaUid, eventUid);

  const {
    detailedAgendaIsLoading: fromAgendaIsLoading,
    detailedAgenda: fromAgenda,
  } = useDetailedAgenda(fromAgendaUid);

  if (!agenda.settings.contribution.useFields) {
    replaceWithStep(history, location, prefix, 'event');
    return <Loading />;
  }

  if (agendaContextIsLoading || eventIsLoading || fromAgendaIsLoading) {
    return <Loading />;
  }

  return (
    <Canvas
      mode="share"
      event={event}
      fromAgenda={fromAgenda}
      agenda={agenda}
    >
      <div className="padding-top-sm">
        <div className="wsq padding-all-md">
          <MemberForm
            mode="share"
            agenda={agenda}
            member={agendaContext?.me?.member}
            res={res.replace(':agendaUid', agenda.uid)}
            onSuccess={() => {
              dispatch(contributeReducer.memberSetSuccess({
                agenda,
                queryClient,
                mode: 'share',
                event,
                fromAgenda,
              }));
            }}
          />
        </div>
      </div>
    </Canvas>
  );
}
