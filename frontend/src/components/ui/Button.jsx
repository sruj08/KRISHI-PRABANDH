import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', // 'primary', 'secondary', 'success', 'error', 'outline', 'whatsapp'
  size = 'md', // 'sm', 'md', 'lg'
  icon, 
  className = '', 
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const baseClass = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`;

  return (
    <button 
      type={type}
      className={baseClass} 
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="material-symbols-outlined" style={{ fontSize: size === 'sm' ? '18px' : '20px' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
