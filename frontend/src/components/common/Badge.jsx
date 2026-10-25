import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'success', 'warning', 'danger', 'info', 'purple', 'neutral'
  size = 'md',
  icon: Icon,
  className = '',
  ...rest
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`} {...rest}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
