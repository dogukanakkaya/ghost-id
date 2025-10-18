import { useEffect } from 'react';
import { LoginButton } from './components/LoginButton';
import { LoginForm } from './components/LoginForm';
import { useGhostActions, useGhostRegistry } from '../../../src/index';

function App() {
    const actions = useGhostActions();
    const registry = useGhostRegistry();

    useEffect(() => {
        // Log the ghost registry after components mount
        setTimeout(() => {
            if (registry) {
                console.log('👻 Ghost Registry:');
                console.table(registry.list());
                console.log('\n📋 Detailed Registry:');
                console.table(registry.getDetails());
            }
        }, 100);
    }, [registry]);

    return (
        <div style={{
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <h1 style={{ marginBottom: '20px' }}>
                👻 React Ghost - Auto Test ID Generation
            </h1>

            <p style={{
                marginBottom: '30px',
                color: '#666',
                maxWidth: '600px'
            }}>
                This demo shows how Ghost automatically generates unique, deterministic
                test selectors for React components. Open DevTools to inspect the
                <code style={{
                    padding: '2px 6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                    margin: '0 4px'
                }}>
                    data-gh
                </code>
                attributes and check the console for the registry output.
            </p>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}>
                <div>
                    <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>
                        Simple Component
                    </h2>
                    <LoginButton />
                </div>

                <div>
                    <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>
                        Component with Multiple Ghost IDs (using aliases)
                    </h2>
                    <LoginForm />
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '8px',
                    border: '1px solid #b3d9ff'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        marginTop: 0,
                        marginBottom: '10px'
                    }}>
                        💡 How to use in tests:
                    </h3>
                    <pre style={{
                        margin: 0,
                        fontSize: '13px',
                        backgroundColor: '#fff',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto'
                    }}>
                        {`// Playwright example:
await page.click('[data-gh*="LoginButton"]');
await page.fill('[data-gh*="username-input"]', 'user123');

// Cypress example:
cy.get('[data-gh*="LoginButton"]').click();
cy.get('[data-gh*="username-input"]').type('user123');`}
                    </pre>
                </div>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        marginTop: 0,
                        marginBottom: '10px'
                    }}>
                        📦 Export Ghost IDs:
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => actions.download('json')}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                backgroundColor: '#0ea5e9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📥 Download JSON
                        </button>
                        <button
                            onClick={() => actions.download('ts')}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            📥 Download TypeScript
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
                        Export ghost IDs to use in your tests. Check the console for more details!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
