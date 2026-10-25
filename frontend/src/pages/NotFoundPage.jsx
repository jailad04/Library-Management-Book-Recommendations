import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, Home } from 'lucide-react';
import Button from '../components/common/Button';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon-box">
          <BookOpen size={48} strokeWidth={1.5} />
        </div>
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Chapter Not Found</h1>
        <p className="not-found-desc">
          The page or library record you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <div className="not-found-actions">
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/books">
            <Button variant="outline" size="md" icon={Compass}>
              Explore Catalogue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
