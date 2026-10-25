import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger'
  size = 'md',        // 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="spinner" aria-hidden="true" style={{
          width: '1em',
          height: '1em',
          border: '2px solid currentColor',
          borderRightColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.75s linear infinite'
        }} />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 18} />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 18} />}
    </button>
  );
};

export default Button;
