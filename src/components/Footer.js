import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`footer ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="footer-content">
        <div className="footer-main">
          <p className="footer-text">
            Project by{' '}
            <a 
              href="https://github.com/prakhar3125" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Prakhar Sinha
            </a>
          </p>
          <div className="footer-links">
            <a 
              href="https://github.com/prakhar3125" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
            <span className="footer-separator">•</span>
            <a 
              href="https://www.linkedin.com/in/prakhar3125/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="footer-branding">
          <p className="footer-brand">ExpenseFlow - AI Powered Expense Tracker</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
