import debug from 'debug';

import { useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import Loading from '../components/Loading.js';

import MemberForm from '../components/MemberForm.js';
import Canvas from '../components/Canvas.js';
import useAgendaContext from '../hooks/useAgendaContext.js';
import useEvent from '../hooks/useEvent.js';
import useDetailedAgenda from '../hooks/useDetailedAgenda.js';
import usePrefix from '../hooks/usePrefix.js';

import contributeReducer from '../reducers/contribute.js';
import utils from '../lib/utils.js';

const { replaceWithStep } = utils;

const log = debug('Member');

export default function MemberSharing({ agenda, history }) {
  log('loading');
  const queryClient = useQueryClient();
  const location = useLocation();
  const prefix = usePrefix(agenda);
  const res = useSelector(
    (state) => state.settings.apiRoot + state.res.members,
  );

  const dispatch = useDispatch();

  const { agendaContextIsLoading, agendaContext } = useAgendaContext(
    agenda.uid,
    'Member',
  );

  const { eventUid, fromAgendaUid } = useParams();

  const { eventIsLoading, event } = useEvent(fromAgendaUid, eventUid);

  const { detailedAgendaIsLoading, detailedAgenda } = useDetailedAgenda(
    agenda.uid,
  );

  const {
    detailedAgendaIsLoading: fromAgendaIsLoading,
    detailedAgenda: fromAgenda,
  } = useDetailedAgenda(fromAgendaUid);

  if (!agenda.settings.contribution.useFields) {
    replaceWithStep(history, location, prefix, 'event');
    return <Loading />;
  }

  if (
    agendaContextIsLoading
    || eventIsLoading
    || fromAgendaIsLoading
    || detailedAgendaIsLoading
  ) {
    return <Loading />;
  }

  return (
    <Canvas mode="share" event={event} fromAgenda={fromAgenda} agenda={agenda}>
      <div className="padding-top-sm">
        <div className="wsq padding-all-md">
          <MemberForm
            mode="share"
            agenda={detailedAgenda}
            member={agendaContext?.me?.member}
            res={res.replace(':agendaUid', agenda.uid)}
            onSuccess={() => {
              dispatch(
                contributeReducer.memberSetSuccess({
                  agenda,
                  queryClient,
                  mode: 'share',
                  event,
                  fromAgenda,
                }),
              );
            }}
          />
        </div>
      </div>
    </Canvas>
  );
}
