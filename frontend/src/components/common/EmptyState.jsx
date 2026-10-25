import React from 'react';
import { BookOpen } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-color)',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
