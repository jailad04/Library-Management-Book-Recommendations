import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export default Skeleton;
