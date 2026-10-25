import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  padding = '1.25rem',
  style = {},
  ...rest
}) => {
  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
