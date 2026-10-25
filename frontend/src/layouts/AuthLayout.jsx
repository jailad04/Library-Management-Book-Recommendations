import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import './AuthLayout.css';

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Decorative left panel */}
      <div className="auth-panel" aria-hidden="true">
        <div className="auth-panel-content">
          <div className="auth-panel-brand">
            <BookOpen size={36} />
            <span>BookNest</span>
          </div>
          <blockquote className="auth-panel-quote">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            <cite>— George R.R. Martin</cite>
          </blockquote>
          <div className="auth-panel-decoration" />
        </div>
      </div>

      {/* Form area */}
      <div className="auth-form-area">
        {/* Mobile brand */}
        <Link to="/login" className="auth-mobile-brand">
          <BookOpen size={22} />
          <span>BookNest</span>
        </Link>

        <div className="auth-form-box fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
