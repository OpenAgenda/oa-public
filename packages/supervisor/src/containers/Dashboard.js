import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Dashboard() {
  const prefix = useSelector((state) => state.settings.prefix);

  return (
    <div className="container">
      <div className="row">
        <h2>
          Bienvenue chez les <b>super</b>admins !
        </h2>

        <ul>
          <li>
            <Link to={`${prefix}/announcement`}>Gérer les annonces OA</Link>
          </li>
          <li>
            <Link to={`${prefix}/elasticsearch`}>Elasticsearch</Link>
          </li>
          <li>
            <a href={`${prefix}/bullboard`}>Bullboard</a>
          </li>
          <li>
            <a href={`${prefix}/users`}>Tracker les utilisateurs</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
