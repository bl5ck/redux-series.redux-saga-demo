import React from 'react';
import StarIcon from '@material-ui/icons/Star';
import PropTypes from 'prop-types';

const ButtonFavorite = ({ iconProps, checked, ...props }) => (
  <button
    {...props}
    style={{
      ...props.style,
      background: 'rgba(0, 0, 0, .3)',
      border: 'none',
      padding: '10px',
      cursor: 'pointer',
      outline: 'none'
    }}
  >
    <StarIcon
      {...iconProps}
      style={{
        color: 'white',
        fontSize: '30px',
        ...iconProps.style,
        opacity: !checked ? 0.5 : 1
      }}
    />
  </button>
);
ButtonFavorite.propTypes = {
  checked: PropTypes.bool,
  iconProps: PropTypes.object
};
ButtonFavorite.defaultProps = {
  checked: false,
  iconProps: { style: {} }
};
export default ButtonFavorite;
