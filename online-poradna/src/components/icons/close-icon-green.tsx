import React from 'react';

interface IconProps {
  onClick?: () => void;
}

const CustomCloseIconGreen: React.FC<IconProps> = ({ onClick }) => (
  <svg
    onClick={onClick}
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ cursor: 'pointer' }}
  >
    <path
      d="M5 5L25 25" // Adjusted to make the line 25px long
      stroke="#24AE60"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 25L25 5" // Adjusted to make the line 25px long
      stroke="#24AE60"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CustomCloseIconGreen;
