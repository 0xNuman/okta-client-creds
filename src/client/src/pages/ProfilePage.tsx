import { useEffect, useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';

interface Profile {
  name: string;
  email: string;
  claims: { type: string; value: string }[];
}

export default function ProfilePage() {
  const { authState } = useOktaAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = authState?.accessToken?.accessToken ?? '';

  useEffect(() => {
    if (!token) return;
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setProfile)
      .catch(e => setError(e.message));
  }, [token]);

  if (error) return <p className="status-msg error">Error: {error}</p>;
  if (!profile) return <p className="status-msg">Loading profile…</p>;

  return (
    <div className="page">
      <h1>Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <h2>JWT Claims</h2>
      <table className="books-table">
        <thead>
          <tr><th>Claim</th><th>Value</th></tr>
        </thead>
        <tbody>
          {profile.claims.map((c, i) => (
            <tr key={i}>
              <td><code>{c.type}</code></td>
              <td style={{ wordBreak: 'break-all' }}>{c.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
