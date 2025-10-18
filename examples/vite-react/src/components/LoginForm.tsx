import { useGhost } from '../../../../src/index';
import { useState } from 'react';

export function LoginForm() {
  const ghostId = useGhost();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Each input and button gets its own unique ghost ID via alias
  const usernameInputGhost = useGhost('username');
  const passwordInputGhost = useGhost('password');
  const submitButtonGhost = useGhost('submit');
  const cancelButtonGhost = useGhost('cancel');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in as: ${username}`);
  };

  return (
    <form
      data-gh={ghostId}
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '300px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}
    >
      <h3 style={{ margin: '0 0 12px 0' }}>Login Form</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          data-gh={usernameInputGhost}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          data-gh={passwordInputGhost}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          type="submit"
          data-gh={submitButtonGhost}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
        <button
          type="button"
          data-gh={cancelButtonGhost}
          onClick={() => {
            setUsername('');
            setPassword('');
          }}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
