import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './design-system/tokens.css';
import './design-system/typography.css';
import './design-system/globals.css';
import './app/App.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
