import React from 'react';

const UI_THEME = {
  pageBg: '#E8E8E8',
  cardBg: '#FFFFFF',
  headerBg: '#2D2D2D',
  primary: '#8B1A1A',
  applyBtn: '#991B1B',
  text: '#000000',
  placeholder: '#6B7280',
  star: '#DC2626',
  inputBorder: '#D1D5DB',
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  radii: {
    card: '18px',
    input: '12px',
    smallBtn: '8px',
    mainBtn: '12px'
  },
  shadow: '0 1px 3px rgba(0,0,0,0.08)'
};

export default function Icon({ name, className = 'inline-block', size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
  switch (name) {
    case 'dineIn':
      return (
        <svg {...common} className={className}>
          <path d="M7 3v11" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 3v11" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 14c0 2.8 2 4 5 4s5-1.2 5-4" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'delivery':
      return (
        <svg {...common} className={className}>
          <path d="M3 6h11v7h4l3 3V6" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7.5" cy="18.5" r="1.5" fill={UI_THEME.primary}/>
          <circle cx="18.5" cy="18.5" r="1.5" fill={UI_THEME.primary}/>
        </svg>
      );
    case 'pickup':
      return (
        <svg {...common} className={className}>
          <path d="M5 11h14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...common} className={className}>
          <path d="M21 11.5A9.5 9.5 0 1 0 11.5 21L7 22l1.1-4.5A9.5 9.5 0 0 0 21 11.5z" fill="#25D366"/>
          <path d="M15.5 14.2c-.3 0-1 .1-1.9-.4-.4-.2-1.2-.6-2-.9-.6-.2-1-.3-1.4.3-.4.6-.9.9-1.6.8-.6-.1-1.3-.8-2-1.6-.6-.8-.2-1.3.4-1.9.4-.4.8-.9.9-1.3.1-.4 0-.9-.1-1.4-.1-.5-.5-.8-1-1.1-.4-.2-1-.4-1.5-.6-.5-.1-1-.2-1.3-.2-.2 0-.4 0-.6.1" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'cash':
      return (
        <svg {...common} className={className}>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke={UI_THEME.primary} strokeWidth="1.6" fill="none"/>
          <path d="M7 12h10" stroke={UI_THEME.primary} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      );
    case 'card':
      return (
        <svg {...common} className={className}>
          <rect x="2" y="6" width="20" height="12" rx="2" stroke={UI_THEME.primary} strokeWidth="1.6" fill="none"/>
          <rect x="6" y="10" width="4" height="2" fill={UI_THEME.primary} />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common} className={className}>
          <path d="M2 12l8 8 10-10-8-8L2 12z" stroke={UI_THEME.primary} strokeWidth="1.4" fill="none" />
          <circle cx="8" cy="8" r="1" fill={UI_THEME.primary} />
        </svg>
      );
    default:
      return null;
  }
}
