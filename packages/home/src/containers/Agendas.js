import { useCallback, useContext, useMemo, useRef } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { useIsomorphicLayoutEffect, useLatest } from 'react-use';
import qs from 'qs';
import { Spinner, useModal } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import { setTab } from '../reducers/menu';
import { updatedMember } from '../reducers/agendas';
import Welcome from '../components/Welcome';
import AgendasSearch from '../components/AgendasSearch';
import AgendaItem from '../components/AgendaItem';
import { MemberEditModal, MemberRemoveModal } from '../components/MemberModals';
import useMemberModal from '../hooks/useMemberModal';
import Wrapper from './Wrapper';

function Agendas() {
  const { getLabel, lang } = useContext(I18nContext);

  const history = useHistory();
  const location = useLocation();
  const searchRef = useRef();
  const query = useMemo(
    () => qs.parse(location.search, { ignoreQueryPrefix: true }),
    [location.search],
  );

  const dispatch = useDispatch();

  useIsomorphicLayoutEffect(() => {
    dispatch(setTab('agendas'));
  }, [dispatch]);

  const res = useSelector(state => state.res);
  const prefix = useSelector(state => state.settings.prefix);

  const initialState = useMemo(
    () => ({
      searchValue: query.search || '',
      firstLoading: true,
      listLoading: true,
    }),
    [query.search],
  );

  const latestQuery = useLatest(query);

  const onAgendaSearch = useCallback(
    value => {
      history.push({
        search: qs.stringify({
          ...latestQuery.current,
          search: value !== '' ? value : undefined,
        }),
      });
    },
    [history, latestQuery],
  );

  const fieldProps = useMemo(
    () => ({
      placeholder: getLabel('searchAgenda'),
      classNameGroup: 'form-group search',
      className: 'form-control',
      autoComplete: 'off',
    }),
    [getLabel],
  );

  const memberEditModal = useModal();
  const memberRemoveModal = useModal();
  useMemberModal(res, query.agendaUid, memberEditModal);

  return (
    <AgendasSearch
      ref={searchRef}
      res={res.agendas.list}
      initialState={initialState}
      onSearch={onAgendaSearch}
      fieldProps={fieldProps}
      render={({ state, form, nextPage }) => {
        if (state.firstLoading) {
          return (
            <Wrapper>
              <Spinner />
            </Wrapper>
          );
        }

        if (!state.isMember) {
          return (
            <Wrapper>
              <Welcome />
            </Wrapper>
          );
        }

        return (
          <Wrapper tab="agendas" className="home-agendas">
            <div className="content">
              {memberEditModal.isOpen ? (
                <MemberEditModal
                  lang={lang}
                  closeModal={() => {
                    if (history.location.pathname.includes('member')) {
                      history.push(prefix);
                    }
                    memberEditModal.close();
                  }}
                  onSuccess={(member, updatedData) =>
                    dispatch(updatedMember(state.agendas, member, updatedData))}
                  onRemoveSuccess={() => searchRef.current.refresh()}
                  {...memberEditModal.data}
                  description={getLabel('editMemberInformation')}
                  res={res}
                />
              ) : null}
              {memberRemoveModal.isOpen ? (
                <MemberRemoveModal
                  lang={lang}
                  closeModal={() => memberRemoveModal.close()}
                  onSuccess={() => {
                    searchRef.current.refresh();
                  }}
                  {...memberRemoveModal.data}
                  res={res}
                />
              ) : null}
              <div className="header">
                <div className="hidden-xs pull-right">
                  <Link
                    to={res.agendas.create}
                    className="btn btn-primary"
                    type="button"
                  >
                    {getLabel('createAgenda')}
                  </Link>
                </div>
              </div>

              {form}

              <div>
                {state.agendas.length
                  ? state.agendas.map(agenda => (
                    <AgendaItem
                      key={agenda.uid}
                      agenda={agenda}
                      res={res}
                      getLabel={getLabel}
                      onDisplayMemberForm={item => memberEditModal.open(item)}
                      onDisplayRemoveMember={item =>
                        memberRemoveModal.open(item)}
                    />
                  ))
                  : null}
              </div>

              {!state.firstLoading && !state.agendas.length ? (
                <div className="text-center text-muted margin-top-md">
                  <Link
                    to={res.agendas.create}
                    className="btn btn-primary"
                    type="button"
                  >
                    {getLabel('createAgenda')}
                  </Link>
                </div>
              ) : null}

              {state.nextLoading ? (
                <div className="padding-v-md" style={{ position: 'relative' }}>
                  <Spinner />
                </div>
              ) : null}

              <Waypoint onEnter={nextPage} />
            </div>
          </Wrapper>
        );
      }}
    />
  );
}

export default Agendas;
