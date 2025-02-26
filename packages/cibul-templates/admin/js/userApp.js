import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import qs from 'qs';
import UserList from './userList';
import UserSearch from './userSearch';
import UserPagination from './userPagination';
import UserShow from './userShow';
import remote from '../../js/lib/remote';

//
// Configuration
// -----------------------------------------------------------------------------

const defaults = {
  all: {
    res: {
      users: '/admin/users',
      activate: '/admin/users/activate',
      blacklist: '/admin/users/blacklist',
      update: '/admin/users/update',
      signin: '/admin/users/signin',
      changePassword: '/admin/users/changePassword'
    }
  },
  tpl: {
    res: {
      users: '/server/testdata/adminusers.json',
      activate: '/server/testdata/adminusersactivate.json'
    }
  }
};

/**
 *  On choisit la config en fonction de window.env
 *  (on reprend la logique du code original)
 */
const config =
  ['tpl'].indexOf(window.env) !== 1
    ? _.assign({}, defaults.all, defaults[window.env])
    : defaults.all;

//
// Composant UserApp (fonctionnel)
// -----------------------------------------------------------------------------

function UserApp({ accountActivationMode }) {
  const [users, setUsers] = useState([]);
  const [perPage, setPerPage] = useState(40);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(undefined);

  const [user, setUser] = useState(undefined);
  const [members, setMembers] = useState([]);

  // On garde en mémoire la dernière requête de recherche :
  const [searchQuery, setSearchQuery] = useState({});

  /**
   *  Équivalent componentDidMount :
   *  - Lance la première recherche
   *  - Vérifie si l'URL contient un userUid
   */
  useEffect(() => {
    // 1. Lance la recherche par défaut
    search();

    // 2. Vérifie la queryString
    const query = window.location.search
      ? qs.parse(window.location.search, { ignoreQueryPrefix: true })
      : {};

    if (query.userUid) {
      getUser(query.userUid);
    }
  }, []); // dépendances vides => lancé 1 seule fois

  /**
   *  Récupération d'un user spécifique
   */
  const getUser = (uid) => {
    remote.getXmlHttp(
      config.res.users,
      { timeout: 10000, data: { uid } },
      (responseType, data) => {
        if (responseType !== 'success') {
          alert('schplof.');
          return;
        }

        // Met à jour l'URL avec le bon userUid
        const parsed = qs.parse(window.location.search, { ignoreQueryPrefix: true });
        const newSearch = qs.stringify({ ...parsed, userUid: uid }, { addQueryPrefix: true });
        window.history.replaceState({}, document.title, `${window.location.pathname}${newSearch}`);

        setUser(data.user);
        setMembers(data.members);
      }
    );
  };

  /**
   *  Lance la recherche d'utilisateurs
   */
  const search = (searchValue = '', pageValue = 1) => {
    const sq = {
      page: pageValue
    };
    if (searchValue && searchValue.length) {
      sq.search = searchValue;
    }

    // Sauvegarde en state
    setSearchQuery(sq);

    remote.getXmlHttp(config.res.users, { data: sq }, (responseType, data) => {
      if (responseType !== 'success') {
        alert('schplof.');
        return;
      }
      setPage(data.page);
      setUsers(data.users);
      setTotal(data.total);
      setPerPage(data.perPage);
    });
  };

  /**
   *  Handlers de callbacks
   */
  const handleSearchSubmit = (searchValue) => {
    search(searchValue);
  };

  const handlePageSelect = (pageValue) => {
    // On reprend la dernière valeur de recherche si existante
    search(searchQuery.search || '', pageValue);
  };

  const handleUserUpdate = (data) => {
    if (!user?.uid) return;

    remote.postXmlHttp(
      config.res.update,
      { data: { ...data, uid: user.uid } },
      (responseType, result) => {
        if (responseType !== 'success') {
          alert('schplof.');
          return;
        }
        if (!result.success) {
          alert(result.message);
          return;
        }
        setUser(result.user);
      }
    );
  };

  const handleUserActivation = (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    remote.getXmlHttp(
      config.res.activate,
      { data: { uid: user.uid } },
      (responseType, data) => {
        if (responseType !== 'success') {
          alert('schplof.');
          return;
        }
        if (!data.success) {
          alert(data.message);
          return;
        }
        // Mettre à jour user.isActivated
        setUser((prev) => ({ ...prev, isActivated: true }));
      }
    );
  };

  const handleUserIsBlacklistedToggle = () => {
    if (!user?.uid) return;

    remote.getXmlHttp(
      config.res.blacklist,
      { data: { uid: user.uid, isBlacklisted: !user.isBlacklisted } },
      (responseType, data) => {
        if (responseType !== 'success') {
          alert('schplof.');
          return;
        }
        if (!data.success) {
          alert(data.message);
          return;
        }
        // Toggling isBlacklisted
        setUser((prev) => ({ ...prev, isBlacklisted: !prev.isBlacklisted }));
      }
    );
  };

  const handleUserSignin = (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    remote.getXmlHttp(config.res.signin, { data: { uid: user.uid } }, (responseType, data) => {
      if (responseType !== 'success') {
        alert('schplof.');
        return;
      }
      if (!data.success) {
        alert(data.message);
        return;
      }
      window.location.href = '/home';
    });
  };

  const handleChangePassword = (data) => {
    return new Promise((resolve, reject) => {
      const { password } = data;
      const uid = user?.uid;
      if (!uid || !password) {
        return reject(new Error('Missing UID or password.'));
      }

      remote.getXmlHttp(
        config.res.changePassword,
        { data: { uid, password } },
        (responseType, responseData) => {
          if (responseType !== 'success') {
            return reject(new Error('Request failed.'));
          }
          // On ne check pas la success property ici, à adapter si besoin
          return resolve(responseData);
        }
      );
    });
  };

  /**
   *  Rendu du composant
   */
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <h2>Users</h2>
          <div className="margin-bottom-sm">
            <label>Account activation mode</label>:&nbsp;
            <span>
              {accountActivationMode === 'manual' ? 'Manual' : 'Automatic'}
            </span>
            &nbsp;→&nbsp;
            <span>
              {accountActivationMode === 'manual'
                ? 'Accounts must be checked on Slack'
                : 'Users can activate their own accounts'}
            </span>
            &nbsp;
            <a
              href={
                '/admin/users/activationMode?mode=' +
                (accountActivationMode === 'manual' ? 'automatic' : 'manual')
              }
              className="btn btn-link"
            >
              {accountActivationMode === 'manual'
                ? 'Switch to automatic'
                : 'Switch to manual'}
            </a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <UserSearch onSearchSubmit={handleSearchSubmit} />
          <UserPagination
            page={page}
            perPage={perPage}
            total={total}
            onPageSelect={handlePageSelect}
          />
          <UserList
            users={users}
            onUserClick={getUser}
          />
        </div>
        <div className="col-md-8">
          <UserShow
            user={user}
            members={members}
            onUserActivation={handleUserActivation}
            onUserIsBlacklistedToggle={handleUserIsBlacklistedToggle}
            onUserSignin={handleUserSignin}
            onUserChangePassword={handleChangePassword}
            onUserUpdate={handleUserUpdate}
          />
        </div>
      </div>
    </div>
  );
}

//
// Export principal (montage de l'app dans un élément DOM)
// -----------------------------------------------------------------------------

export default (canvasElem) => {
  const root = createRoot(canvasElem);
  root.render(
    <UserApp
      accountActivationMode={canvasElem.getAttribute('data-account-activation-mode')}
    />
  );
};
