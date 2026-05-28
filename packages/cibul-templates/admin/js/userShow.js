import React, { useState } from 'react';
import Switch from 'rc-switch';

function roleToString(type) {
  switch (type) {
    case 1:
      return 'Contributeur';
    case 2:
      return 'Administrateur';
    case 3:
      return 'Modérateur';
    default:
      return 'Inconnu';
  }
}

export default function UserShow({
  user,
  members,
  onUserChangePassword,
  onUserActivation,
  onUserIsBlacklistedToggle,
  onUserSignin,
  onUserUpdate
}) {
  // État local pour le password et l'erreur
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  /**
   * Gère la modification du champ "password"
   */
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  /**
   * Soumet le formulaire pour changer le password
   */
  const handleSubmitChangePassword = (e) => {
    e.preventDefault();

    onUserChangePassword({ password })
      .then(() => setPassword(''))
      .catch(() => {
        setError('Ho ben non hein, Pupuce !');
        setTimeout(() => {
          setError(null);
        }, 3000);
      });
  };

  /**
   * Rendu d'une ligne "member"
   */
  const renderMember = (member) => {
    const { agenda } = member;

    return (
      <tr key={member.id}>
        <td>{member.id}</td>
        <td>{roleToString(member.role)}</td>
        <td>
          <a href={agenda ? `/${agenda.slug}` : '#'}>
            {agenda?.title ?? 'Agenda indéfini'}
          </a>
        </td>
        <td>{member.nbrEvents || '0'}</td>
        <td>
          <a href={agenda ? `/admin/agendas?agendaUid=${agenda.uid}` : '#'}>
            Page admin/agendas
          </a>
        </td>
        <td>
          <pre>{JSON.stringify(member.custom, null, 4)}</pre>
        </td>
      </tr>
    );
  };

  /**
   * Toggle qui autorise (ou non) le user à créer des clés API "secret"
   * (`sk`) depuis ses réglages. Pas de génération côté admin : ouvre/ferme
   * simplement la porte côté UI + endpoint POST /users/me/api-keys.
   */
  const toggleApiSecret = () => {
    onUserUpdate({
      enable_secret: !(user?.store && user.store.enable_secret)
    });
  };

  /**
   * Toggle de l'API transverse
   */
  const toggleApiTransverse = () => {
    onUserUpdate({
      transverseApiAccess: !(user && user.transverseApiAccess)
    });
  };

  // Si aucun utilisateur sélectionné
  if (!user) {
    return (
      <div>
        <p>Click on a user for details</p>
      </div>
    );
  }

  // Gestion du lien d'activation
  let activationLink = '';
  if (!user.isActivated) {
    activationLink = (
      <span>
        {' '}
        -{' '}
        <a onClick={onUserActivation} href="#">
          activate
        </a>
      </span>
    );
  }

  const from = new Date(user.lastSignin);
  from.setHours(from.getHours() - 1);
  const to = new Date(user.lastSignin);
  to.setDate(to.getDate() + 1);

  const fromIso = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}T${String(from.getHours()).padStart(2, '0')}:${String(from.getMinutes()).padStart(2, '0')}`;
  const toIso = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}T${String(to.getHours()).padStart(2, '0')}:${String(to.getMinutes()).padStart(2, '0')}`;

  return (
    <div>
      <h2>{user.fullName}</h2>
      <table className="table">
        <tbody>
          <tr>
            <td>uid</td>
            <td>{user.uid}</td>
          </tr>
          <tr>
            <td>email</td>
            <td>
              {user.email}{' '}
              {user.isRemoved ? (
                <span style={{ color: 'brown' }}>Account removed</span>
              ) : null}
            </td>
          </tr>
          <tr>
            <td>is activated?</td>
            <td>
              <span>{user.isActivated ? 'yes' : 'no'}</span>
              {activationLink}
            </td>
          </tr>
          <tr>
            <td>Created At</td>
            <td>{user.createdAt}</td>
          </tr>
          <tr>
            <td>Updated At</td>
            <td>{user.updatedAt}</td>
          </tr>
          <tr>
            <td>Last signin</td>
            <td>{user.lastSignin}</td>
          </tr>
          <tr>
            <td>Allow API secret keys</td>
            <td>
              <Switch
                className="rc-switch"
                checkedChildren={<i className="fa fa-check" aria-hidden="true" />}
                unCheckedChildren={<i className="fa fa-times" aria-hidden="true" />}
                onChange={toggleApiSecret}
                checked={!!user.store?.enable_secret}
              />
            </td>
          </tr>
          <tr>
            <td>Enable API transverse</td>
            <td>
              <Switch
                className="rc-switch"
                checkedChildren={<i className="fa fa-check" aria-hidden="true" />}
                unCheckedChildren={<i className="fa fa-times" aria-hidden="true" />}
                onChange={toggleApiTransverse}
                checked={!!user.transverseApiAccess}
              />
            </td>
          </tr>
          <tr>
            <td>Blacklisted</td>
            <td>
              <Switch
                className="rc-switch"
                checkedChildren={<i className="fa fa-check" aria-hidden="true" />}
                unCheckedChildren={<i className="fa fa-times" aria-hidden="true" />}
                onChange={onUserIsBlacklistedToggle}
                checked={!!user.isBlacklisted}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        <a
          href={`/supervisor/users?userUid=${user.uid}&from=${fromIso}&to=${toIso}`}
        >
          Voir les logs de l'utilisateur
        </a>
      </p>

      <p>
        <a onClick={onUserSignin} href="#">
          Signin as user
        </a>
      </p>

      <form className="form-inline" onSubmit={handleSubmitChangePassword}>
        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe: </label>
          <input
            type="text"
            className="form-control"
            id="password"
            placeholder="No error allowed babe"
            value={password || ''}
            onChange={handleChangePassword}
          />
        </div>
        <button type="submit" className="btn btn-default">
          Change password
        </button>
      </form>

      {error && (
        <div className="text-danger">
          <b>{error}</b>
        </div>
      )}

      <div>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Rôle</th>
              <th>Agenda</th>
              <th>Nombre d'événements</th>
              <th>admin/agendas</th>
              <th>Custom</th>
            </tr>
          </thead>
          <tbody>
            {members?.length ? (
              members.map((member) => renderMember(member))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  N'est pas contributeur !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
