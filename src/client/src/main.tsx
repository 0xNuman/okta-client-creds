import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { OktaAuth } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';
import App from './App.tsx';
import oktaConfig from './okta-config.ts';
import './index.css';

const oktaAuth = new OktaAuth(oktaConfig);

function restoreOriginalUri(_oktaAuth: OktaAuth, originalUri: string) {
  window.location.replace(originalUri ?? '/');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
        <App />
      </Security>
    </BrowserRouter>
  </StrictMode>
);
