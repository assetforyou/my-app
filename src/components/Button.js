// src/components/Button.js
import React from 'react';
import PropTypes from 'prop-types';

function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  onClick: () => {},
};

export default Button;
