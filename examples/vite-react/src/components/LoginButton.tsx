import { useGhost } from '../../../../src/index';

export function LoginButton() {
  const ghostId = useGhost();

  return (
    <button
      data-gh={ghostId}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}
      onClick={() => alert('Login clicked!')}
    >
      Login
    </button>
  );
}
