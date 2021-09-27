import React, { useCallback, useContext, useMemo } from 'react';
import { hot } from 'react-hot-loader/root';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Waypoint } from 'react-waypoint';
import { useIsomorphicLayoutEffect } from 'react-use';
import qs from 'qs';
import { Spinner, useModal } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import { setTab } from '../reducers/menu';
import { updatedMember } from '../reducers/agendas';
import Welcome from '../components/Welcome';
import AgendasSearch from '../components/AgendasSearch';
import AgendaItem from '../components/AgendaItem';
import MemberEditModal from '../components/MemberEditModal';
import Wrapper from './Wrapper';

function Agendas() {
  const { getLabel, lang } = useContext(I18nContext);

  const history = useHistory();
  const query = useMemo(
    () => qs.parse(history.location.search, { ignoreQueryPrefix: true }),
    [history.location.search]
  );

  const dispatch = useDispatch();

  useIsomorphicLayoutEffect(() => {
    dispatch(setTab('agendas'));
  }, [dispatch]);

  const res = useSelector(state => state.res);

  const initialState = useMemo(
    () => ({
      searchValue: query.search || '',
      firstLoading: true,
      listLoading: true,
    }),
    [query.search]
  );

  const onAgendaSearch = useCallback(
    value => {
      history.push({
        ...history.location,
        search: qs.stringify({
          ...query,
          search: value !== '' ? value : undefined,
        }),
      });
    },
    [history, query]
  );

  const fieldProps = useMemo(
    () => ({
      placeholder: getLabel('searchAgenda'),
      classNameGroup: 'form-group search',
      className: 'form-control',
      autoComplete: 'off',
    }),
    [getLabel]
  );

  const memberEditModal = useModal();

  return (
    <AgendasSearch
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
                  closeModal={() => memberEditModal.close()}
                  onSuccess={(member, updatedData) => dispatch(updatedMember(state.agendas, member, updatedData))}
                  {...memberEditModal.data}
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

export default hot(Agendas);
