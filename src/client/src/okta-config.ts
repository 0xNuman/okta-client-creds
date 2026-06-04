import type { OktaAuthOptions } from '@okta/okta-auth-js';

const oktaConfig: OktaAuthOptions = {
  issuer: `https://${import.meta.env.VITE_OKTA_DOMAIN}/oauth2/${import.meta.env.VITE_OKTA_AUTH_SERVER_ID}`,
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID,
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', 'profile', 'email', 'books:read', 'books:write'],
  pkce: true,
};

export default oktaConfig;
