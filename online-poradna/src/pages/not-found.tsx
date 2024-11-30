import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="notFoundContainer">
      <h1>
        404
        <br />
        Stránka nenalezena
      </h1>
      <p>Stránka, kterou hledáte, neexistuje.</p>
      <Link to="/">Zpět na hlavní stránku</Link>
    </div>
  );
};

export default NotFoundPage;
