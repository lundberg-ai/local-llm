import type React from 'react';

const AipifyLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="40"
    height="40"
    fill="currentColor" // Uses text color, can be overridden by className
    {...props}
  >
    <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z M50 20 L25 35 L25 65 L50 80 L75 65 L75 35 Z" />
  </svg>
);

export default AipifyLogo;
