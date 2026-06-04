# Okta OAuth 2.0 Demo — BookStore

Two applications that demonstrate the two most common OAuth 2.0 flows using an Okta Integrator Free account.

| App | Flow | Description |
|-----|------|-------------|
| `BookStore.Api` + React SPA | **Authorization Code + PKCE** | Browser-based login via Okta; the SPA holds the access token and calls the API |
| `BookStore.Client` | **Client Credentials** | Console app that acquires a token machine-to-machine and calls the same API |

---

## Project structure

```
OktaDemo.slnx
src/
  BookStore.Api/          ← ASP.NET Core 10 REST API (JWT Bearer validation)
  BookStore.Client/       ← .NET 10 console app (client credentials)
  client/                 ← React 19 + TypeScript + Vite SPA
```

---

## Part 1 — Okta setup

Log in to your Okta Admin Console at `https://<your-domain>-admin.okta.com`.

> **Okta Integrator Free Plan note:** This plan replaced the old Developer Edition accounts. It uses Okta Identity Engine (OIE), which has a different policy model than classic Okta. In particular, user access to apps is controlled by Authentication Policies (not simple user assignments), and every authorization server requires an explicit Access Policy before it will issue any tokens. Both are covered below.

### 1.1 — Configure the default Authorization Server

1. Go to **Security → API → Authorization Servers**.
2. Click the **default** authorization server.
3. On the **Settings** tab, change the **Audience** from `api://default` to `api://bookstore`. Click **Save**.

The Issuer URI you'll need later is shown on this page:
```
https://<your-okta-domain>/oauth2/default
```

### 1.2 — Add custom scopes

Still inside the **default** Authorization Server, click the **Scopes** tab:

1. Click **Add Scope** and create **`books:read`**:
   - Name: `books:read`
   - Display Name: `Books Read access`
   - Description: `Read access to the book catalog`
   - User Consent: `Implicit` (no consent screen)
   - Default scope: unchecked

2. Click **Add Scope** and create **`books:write`**:
   - Name: `books:write`
   - Display Name: `Books Write access`
   - Description: `Create, update, and delete books`
   - User Consent: `Implicit`
   - Default scope: unchecked

### 1.3 — Create Access Policies on the Authorization Server

> **Critical:** Without Access Policies, the authorization server rejects every token request with `access_denied — Policy evaluation failed`. You need one policy per client type.

Still inside the **default** Authorization Server, click the **Access Policies** tab.

#### Policy A — Machine clients (Client Credentials)

1. Click **Add New Access Policy**.
2. Fill in:
   - Name: `Machine clients`
   - Description: `Machine clients policy`
   - Assign to: **The following clients** → select `BookStore Machine Client`
3. Click **Create Policy**.
4. Inside the new policy click **Add rule**:
   - Rule Name: `Allow client credentials`
   - Grant type: leave **Client Credentials** checked; uncheck others
   - User is: (not applicable for client credentials)
   - Scopes requested: **Any scopes**
   - Access token lifetime: `1 Hour`
5. Click **Create rule**.

#### Policy B — SPA clients (Authorization Code)

1. Click **Add New Access Policy**.
2. Fill in:
   - Name: `SPA clients`
   - Description: `Access policy for SPA clients using Authorization Code flow`
   - Assign to: **All clients**
3. Click **Create Policy**.
4. Inside the new policy click **Add rule**:
   - Rule Name: `Allow authorization code`
   - Grant types: leave all checked (Authorization Code, Client Credentials, Device Authorization)
   - User is: **Any user assigned the app**
   - Scopes requested: **Any scopes**
   - Access token lifetime: `1 Hour`
5. Click **Create rule**.

> The Machine clients policy has Priority 1 and is assigned only to the machine client, so it handles the console app. The SPA clients policy has Priority 2 and covers all other clients.

### 1.4 — Create the SPA app integration (Authorization Code + PKCE)

1. Go to **Applications → Applications → Create App Integration**.
2. Select **OIDC – OpenID Connect**, then **Single-Page Application**. Click **Next**.
3. Fill in:
   - App integration name: `BookStore SPA`
   - Grant type: **Authorization Code** (pre-selected for SPAs; PKCE is enforced automatically)
   - Sign-in redirect URIs: `http://localhost:5173/login/callback`
   - Sign-out redirect URIs: `http://localhost:5173`
4. Under **Assignments**, leave the default (Federation Broker Mode controls access via policy).
5. Click **Save**.
6. From the **General** tab, copy the **Client ID**.

### 1.5 — Create an Authentication Policy for the SPA

> **Okta Identity Engine uses Federation Broker Mode by default.** This means the Assignments tab shows "This app is implicitly assigned to users" and actual access is gated by Authentication Policies, not user/group assignments. Without a permissive policy assigned to the SPA, users see *"You are not allowed to access this app."*

1. Go to **Security → Authentication Policies**.
2. Click **Add a Policy**:
   - Name: `Dev Allow All`
3. Inside the new policy, add a **Rule**:
   - Rule name: `Allow all users with password`
   - IF User's group membership: (leave as Any)
   - AND Authenticator is: **Password** only (remove any MFA requirement)
   - THEN: **Allow access**
4. Click **Save rule**.
5. Back in the policy list, click the **Applications** tab inside **Dev Allow All**.
6. Click **Add app** → select **BookStore SPA** → **Add**.

### 1.6 — Create the API Services app integration (Client Credentials)

1. Go to **Applications → Applications → Create App Integration**.
2. Select **API Services**. Click **Next**.
3. Name it `BookStore Machine Client`. Click **Save**.
4. From the **General** tab, copy the **Client ID** and **Client Secret**.

> **DPoP note:** The Okta Integrator Free Plan enables DPoP (Demonstrating Proof of Possession) by default on API Services apps. The console client in this demo uses the simpler client_secret method. To disable DPoP: go to the app's **General** tab → **General Settings** → set **Proof of possession** to **Disabled** (or **Not required**) → **Save**.

### 1.7 — Add a Trusted Origin for the SPA (CORS)

1. Go to **Security → API → Trusted Origins → Add Origin**.
2. Name: `BookStore Dev`
3. Origin URL: `http://localhost:5173`
4. Check both **CORS** and **Redirect**.
5. Click **Save**.

---

## Part 2 — Configure the applications

### BookStore.Api — `src/BookStore.Api/appsettings.json`

```json
{
  "Okta": {
    "Domain": "your-domain.okta.com",
    "AuthorizationServerId": "default",
    "Audience": "api://bookstore"
  }
}
```

Replace `your-domain.okta.com` with your Okta domain (no `https://`).

### React SPA — `src/client/.env.local`

```
VITE_OKTA_DOMAIN=your-domain.okta.com
VITE_OKTA_AUTH_SERVER_ID=default
VITE_OKTA_CLIENT_ID=<Client ID from step 1.4>
```

After editing `.env.local`, restart the Vite dev server (`Ctrl+C` → `npm run dev`) so the new values are picked up.

### BookStore.Client (console) — environment variables

```bash
# macOS / Linux
export OKTA_DOMAIN=your-domain.okta.com
export OKTA_AUTH_SERVER_ID=default
export OKTA_CLIENT_ID=<Client ID from step 1.6>
export OKTA_CLIENT_SECRET=<Client Secret from step 1.6>
export API_BASE_URL=http://localhost:5062
```

```powershell
# Windows PowerShell
$env:OKTA_DOMAIN         = "your-domain.okta.com"
$env:OKTA_AUTH_SERVER_ID = "default"
$env:OKTA_CLIENT_ID      = "<Client ID from step 1.6>"
$env:OKTA_CLIENT_SECRET  = "<Client Secret from step 1.6>"
$env:API_BASE_URL         = "http://localhost:5062"
```

---

## Part 3 — Running the applications

### Terminal 1 — API

```bash
cd src/BookStore.Api
dotnet run
# Listening on http://localhost:5062
```

### Terminal 2 — React SPA

```bash
cd src/client
npm install   # first time only
npm run dev
# Running on http://localhost:5173
```

Open `http://localhost:5173`. You'll be redirected to Okta to sign in. After login, browse the book catalog, add/edit/delete books, and view the raw JWT claims on the Profile page.

### Terminal 3 — Console client (client credentials)

After setting the environment variables above:

```bash
cd src/BookStore.Client
dotnet run
```

The console app will:
1. Exchange its client ID + secret for an access token at the Okta `/token` endpoint.
2. Call `GET /api/books` (requires `books:read` scope).
3. Create a new book via `POST /api/books` (requires `books:write` scope).
4. Fetch, update, and delete the created book.
5. Print a final book list.

---

## How the flows differ

### Authorization Code + PKCE (SPA)

```
Browser → Okta /authorize  (with code_challenge + code_challenge_method=S256)
Okta    → redirect back    (?code=...)
Browser → Okta /token      (code + code_verifier)
Okta    → access_token + id_token
Browser → API              (Authorization: Bearer <access_token>)
```

The user explicitly authenticates. The access token contains identity claims (`name`, `email`, `sub`) and the `scp` array with `books:read books:write`.

### Client Credentials (console)

```
Console → Okta /token  (client_id + client_secret + scope)
Okta    → access_token (no user context)
Console → API          (Authorization: Bearer <access_token>)
```

No user is involved. The token carries machine identity (`cid`) and the granted scopes. There is no `sub` user claim.

---

## API endpoints

| Method | Path | Scope required |
|--------|------|----------------|
| GET | `/api/books` | `books:read` |
| GET | `/api/books/{id}` | `books:read` |
| POST | `/api/books` | `books:write` |
| PUT | `/api/books/{id}` | `books:write` |
| DELETE | `/api/books/{id}` | `books:write` |
| GET | `/api/profile` | (any valid token) |

---

## Troubleshooting

This section documents issues encountered when setting this up on a real Okta Integrator Free account.

### "You are not allowed to access this app"

**Cause:** The Okta Integrator Free Plan uses Federation Broker Mode. User access to the SPA is not controlled by the Assignments tab — it is controlled by Authentication Policies. If no permissive policy is assigned to the app, all users are blocked.

**Fix:** Follow step 1.5 — create a `Dev Allow All` authentication policy and assign it to the BookStore SPA.

### `access_denied` — "Policy evaluation failed for this request"

**Cause:** The authorization server has no Access Policy covering the requesting client. Without an Access Policy, Okta rejects every `/authorize` and `/token` request before authentication even begins.

**Fix:** Follow step 1.3 — add the SPA clients and Machine clients Access Policies on the default authorization server.

### Console client: `invalid_dpop_proof` — "The DPoP proof JWT header is missing"

**Cause:** The Okta Integrator Free Plan enables DPoP (a stronger token binding mechanism) by default on API Services app integrations. The console client uses the simpler client_secret method which does not send a DPoP proof header.

**Fix:** In the Okta Admin Console, open the **BookStore Machine Client** app → **General** tab → **General Settings** → set **Proof of possession** to **Disabled** → **Save**.

### API returns 403 even though the token contains the correct scopes

**Cause:** .NET's JWT Bearer middleware remaps claim types from their JWT names to long Microsoft schema URIs by default (`MapInboundClaims = true`). The `scp` claim in the Okta token becomes `http://schemas.microsoft.com/identity/claims/scope` inside the `ClaimsPrincipal`, so any code checking for `"scp"` never finds the claim.

**Fix:** Set `MapInboundClaims = false` in the `AddJwtBearer` options (already done in this project). This preserves the original JWT claim names so `scp`, `sub`, etc. remain as-is.

```csharp
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false; // Keep JWT claim names (scp, sub, etc.)
    ...
});
```

### Okta access token `scp` is a JSON array, not a space-separated string

**Cause:** Okta encodes granted scopes as a JSON array (`"scp": ["books:read", "books:write"]`). When .NET parses this (with `MapInboundClaims = false`), each array element becomes its own separate `Claim("scp", value)` entry. Code that reads only the first `scp` claim and tries to split it by spaces will fail.

**Fix:** Use `ClaimsPrincipal.HasClaim(type, value)` instead of `FindFirst`. `HasClaim` iterates all claims of the given type, so it correctly handles the expanded array.

```csharp
// Correct — checks all scp claims
if (context.User.HasClaim("scp", requirement.Scope))
    context.Succeed(requirement);

// Wrong — only reads the first scp claim ("books:read"), splits it,
// and misses all other scopes
var scp = context.User.FindFirst("scp")?.Value;
if (scp?.Split(' ').Contains(requirement.Scope) == true) ...
```
