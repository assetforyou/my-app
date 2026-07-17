// src/components/Button.js
import React from 'react';
import '../style/Button.css';
import PropTypes from 'prop-types';

function Button({ children, onClick, className, type, disabled, ariaLabel, variant, ...rest }) {
  const cls = `vk-btn ${variant ? `vk-btn--${variant}` : ''} ${className || ''}`.trim();
  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
  variant: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  className: '',
  type: 'button',
  disabled: false,
  ariaLabel: undefined,
  variant: undefined,
};

export default Button;
