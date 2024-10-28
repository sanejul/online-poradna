import React from 'react';

interface IconProps {
  onClick?: () => void;
}

const CustomNextIcon: React.FC<IconProps> = ({ onClick }) => (
  <svg
    onClick={onClick}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ cursor: 'pointer', display: 'block' }}
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CustomNextIcon;
