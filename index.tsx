/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx';

// Authentication system
const PASSWORD_HASH = (import.meta as any).env?.VITE_PASSWORD_HASH || '4d984e28'; // Hash of "squadradc"

// Simple hash function for password verification
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
};

// Color system for dynamic category colors
const COLOR_PALETTE = [
    { main: '#007BFF', bg: '#e6f2ff' }, // Blue (Effecting)
    { main: '#17A2B8', bg: '#e8f6f8' }, // Teal (Sensing)  
    { main: '#6f42c1', bg: '#f1ecf9' }, // Purple (Deciding)
    { main: '#28a745', bg: '#d4edda' }, // Green
    { main: '#dc3545', bg: '#f8d7da' }, // Red
    { main: '#fd7e14', bg: '#fde2e4' }, // Orange
    { main: '#e83e8c', bg: '#f8d7da' }, // Pink
    { main: '#6610f2', bg: '#e2d9f3' }, // Indigo
    { main: '#20c997', bg: '#d1ecf1' }, // Teal Green
    { main: '#ffc107', bg: '#fff3cd' }, // Yellow
    { main: '#795548', bg: '#e8f5e8' }, // Brown
    { main: '#607d8b', bg: '#eceff1' }, // Blue Grey
    { main: '#f44336', bg: '#ffebee' }, // Deep Red
    { main: '#9c27b0', bg: '#f3e5f5' }, // Deep Purple
    { main: '#3f51b5', bg: '#e8eaf6' }, // Deep Blue
    { main: '#009688', bg: '#e0f2f1' }, // Teal Dark
    { main: '#ff9800', bg: '#fff3e0' }, // Deep Orange
    { main: '#4caf50', bg: '#e8f5e8' }, // Light Green
    { main: '#ff5722', bg: '#fbe9e7' }, // Red Orange
    { main: '#9e9e9e', bg: '#f5f5f5' }  // Grey
];

// Get color for a category based on its index in the categories array
const getCategoryColor = (category: string, categories: string[]) => {
    const index = categories.indexOf(category);
    if (index === -1) return COLOR_PALETTE[0]; // Default to first color
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
};

// Generate CSS class name for a category
const getCategoryColorClass = (category: string, categories: string[]) => {
    const index = categories.indexOf(category);
    return `category-${index % COLOR_PALETTE.length}`;
};

// Dynamic CSS injection component
const DynamicCategoryStyles: React.FC<{ categories: string[] }> = ({ categories }) => {
    const styles = React.useMemo(() => {
        let css = '';
        categories.forEach((category, index) => {
            const colorIndex = index % COLOR_PALETTE.length;
            const color = COLOR_PALETTE[colorIndex];
            
            css += `
                .card-color-bar.category-${colorIndex}, 
                .card-pill.category-${colorIndex}, 
                .matrix-pill.category-${colorIndex} { 
                    background-color: ${color.bg}; 
                    color: ${color.main}; 
                }
                .card-color-bar.category-${colorIndex} { 
                    background-color: ${color.main}; 
                }
            `;
        });
        return css;
    }, [categories]);

    return <style>{styles}</style>;
};

// Type definitions
interface Firm {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    product?: string;
    notes?: string;
    description?: string;
    industry?: string;
    location?: string;
}

interface MarketMap {
    id: string;
    name: string;
    categories: string[];
    firms: Firm[];
}

interface MarketMaps {
    [key: string]: MarketMap;
}

interface ImportedFirm {
    id: string;
    name: string;
    description: string;
    industry: string;
    location: string;
    // Fields to be filled by user
    category: string;
    subcategory: string;
    product: string;
    // Import state
    selected: boolean;
    edited: boolean;
}

interface ExcelImportData {
    firms: ImportedFirm[];
    fileName: string;
}

const initialMarketMapData: MarketMaps = {
    'CUAS': {
        id: 'CUAS',
        name: 'CUAS',
        categories: ['Sensing', 'Deciding', 'Effecting'],
        firms: [
            // Sensing
            { id: 's1', name: 'Chaos Industries', category: 'Sensing', subcategory: 'Radar' },
            { id: 's2', name: 'Fortem Technologies', category: 'Sensing', subcategory: 'Radar' },
            { id: 's3', name: 'Hidden Level', category: 'Sensing', subcategory: 'Radar' },
            { id: 's4', name: 'MatrixSpace', category: 'Sensing', subcategory: 'Radar' },
            { id: 's5', name: 'BLUEiQ', category: 'Sensing', subcategory: 'Acoustic' },
            { id: 's6', name: 'Sky Fortress', category: 'Sensing', subcategory: 'Acoustic' },
            { id: 's7', name: 'Squarehead Technology', category: 'Sensing', subcategory: 'Acoustic' },
            { id: 's8', name: 'Enigma', category: 'Sensing', subcategory: 'Crowdsourcing' },
            // Deciding
            { id: 'd1', name: 'Project Jeff Maas (DZYNE)', category: 'Deciding', subcategory: 'Fire Control' },
            { id: 'd2', name: 'SmartShooter', category: 'Deciding', subcategory: 'Fire Control' },
            { id: 'd3', name: 'ZeroMark', category: 'Deciding', subcategory: 'Fire Control' },
            { id: 'd4', name: 'Anduril Lattice', category: 'Deciding', subcategory: 'C2' },
            { id: 'd5', name: 'Dedrone', category: 'Deciding', subcategory: 'C2' },
            { id: 'd6', name: 'Northrop Grumman', category: 'Deciding', subcategory: 'C2', product: 'FAAD C2' },
            { id: 'd7', name: 'Palantir Maven Smart System', category: 'Deciding', subcategory: 'C2' },
            // Effecting
            { id: 'e1', name: 'Thor Dynamics', category: 'Effecting', subcategory: 'Laser' },
            { id: 'e2', name: 'Anduril Pulsar', category: 'Effecting', subcategory: 'Electronic Attack (jamming)' },
            { id: 'e3', name: 'DZYNE', category: 'Effecting', subcategory: 'Electronic Attack (jamming)', product: 'Dronebuster' },
            { id: 'e4', name: 'Epirus', category: 'Effecting', subcategory: 'HPM (High Power Microwave)', product: 'Leonidas' },
            { id: 'e5', name: 'Project Brendan Nunan (PSI)', category: 'Effecting', subcategory: 'HPM (High Power Microwave)' },
            { id: 'e6', name: 'Hondoq', category: 'Effecting', subcategory: 'EMP (Electro-Magnetic Pulse)' },
            { id: 'e7', name: 'D-fend Solutions', category: 'Effecting', subcategory: 'Cyber' },
        ]
    }
};

// API utilities for Redis persistence
const API_BASE_URL = '/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

const loadFromApi = async (): Promise<MarketMaps> => {
    try {
        return await apiRequest('/data');
    } catch (error) {
        console.error('Failed to load data from API:', error);
        return initialMarketMapData;
    }
};

const saveToApi = async (data: MarketMaps): Promise<void> => {
    try {
        await apiRequest('/data', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Failed to save data to API:', error);
        throw error;
    }
};

// Excel parsing utilities
const parseExcelFile = async (file: File): Promise<ExcelImportData | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first worksheet
                const worksheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[worksheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Parse the data - Monday.com template columns: A=Name, I=Description, J=Industry, M=Location
                const firms: ImportedFirm[] = [];
                
                for (let i = 5; i < jsonData.length; i++) { // Skip first 5 rows (template headers)
                    const row = jsonData[i] as any[];
                    const name = row[0]?.toString()?.trim(); // Column A
                    const description = row[8]?.toString()?.trim() || ''; // Column I (index 8)
                    const industry = row[9]?.toString()?.trim() || ''; // Column J (index 9)
                    const location = row[12]?.toString()?.trim() || ''; // Column M (index 12)
                    
                    if (name) {
                        firms.push({
                            id: `import_${Date.now()}_${i}`,
                            name,
                            description,
                            industry,
                            location,
                            category: '',
                            subcategory: '',
                            product: '',
                            selected: true,
                            edited: false
                        });
                    }
                }
                
                resolve({
                    firms,
                    fileName: file.name
                });
            } catch (error) {
                console.error('Error parsing Excel file:', error);
                resolve(null);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

// Real-time sync using Server-Sent Events
const subscribeToUpdates = (onUpdate: (data: MarketMaps) => void) => {
    try {
        const eventSource = new EventSource('/api/sync');
        
        eventSource.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'market_maps_updated') {
                    onUpdate(message.data);
                }
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            // Fallback to polling if SSE fails
            setTimeout(() => {
                eventSource.close();
                const pollInterval = setInterval(async () => {
                    try {
                        const data = await loadFromApi();
                        onUpdate(data);
                    } catch (error) {
                        console.error('Failed to poll for updates:', error);
                    }
                }, 30000);
                
                return () => clearInterval(pollInterval);
            }, 5000);
        };
        
        return () => {
            eventSource.close();
        };
    } catch (error) {
        console.error('Failed to establish SSE connection:', error);
        // Fallback to polling
        const pollInterval = setInterval(async () => {
            try {
                const data = await loadFromApi();
                onUpdate(data);
            } catch (error) {
                console.error('Failed to poll for updates:', error);
            }
        }, 30000);

        return () => clearInterval(pollInterval);
    }
};

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                {children}
            </div>
        </div>
    );
};

// Login Modal Component
interface LoginModalProps {
    onAuthenticate: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onAuthenticate }) => {
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Hash the entered password and compare
        const enteredHash = simpleHash(password);
        
        if (enteredHash === PASSWORD_HASH) {
            // Store authentication in sessionStorage (cleared when browser closed)
            sessionStorage.setItem('market-map-auth', 'true');
            onAuthenticate();
        } else {
            setError('Incorrect password. Please try again.');
            setPassword('');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay login-modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content login-modal-content">
                <div className="login-header">
                    <h2>Market Map Access</h2>
                    <p>Please enter the password to continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className={`form-control ${error ? 'error' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                            disabled={isLoading}
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary login-btn"
                        disabled={!password.trim() || isLoading}
                    >
                        {isLoading ? 'Verifying...' : 'Access Market Map'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Authorized personnel only</p>
                </div>
            </div>
        </div>
    );
};

interface DeleteConfirmationModalProps {
    mapName: string;
    firmCount: number;
    categoryCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
    mapName, 
    firmCount, 
    categoryCount, 
    onConfirm, 
    onCancel 
}) => {
    const [confirmationText, setConfirmationText] = React.useState('');
    const [step, setStep] = React.useState<'warning' | 'confirmation'>('warning');

    const handleProceed = () => {
        if (step === 'warning') {
            setStep('confirmation');
        } else if (confirmationText === mapName) {
            onConfirm();
        }
    };

    const isConfirmationValid = confirmationText === mapName;

    return (
        <Modal onClose={onCancel}>
            <div className="delete-confirmation-modal">
                {step === 'warning' ? (
                    <>
                        <div className="warning-icon">⚠️</div>
                        <h3>Delete Market Map</h3>
                        <p>Are you sure you want to delete <strong>"{mapName}"</strong>?</p>
                        <div className="deletion-details">
                            <p>This will permanently delete:</p>
                            <ul>
                                <li>{firmCount} firms</li>
                                <li>{categoryCount} categories</li>
                                <li>All associated data</li>
                            </ul>
                            <p className="warning-text">⚠️ This action cannot be undone.</p>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-danger" onClick={handleProceed}>
                                Continue
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="danger-icon">🚨</div>
                        <h3>Final Confirmation</h3>
                        <p>To confirm deletion, please type the exact map name:</p>
                        <div className="confirmation-name">"{mapName}"</div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="Type the map name here"
                                autoFocus
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setStep('warning')}>
                                Back
                            </button>
                            <button 
                                type="button" 
                                className={`btn btn-danger ${!isConfirmationValid ? 'disabled' : ''}`}
                                onClick={handleProceed}
                                disabled={!isConfirmationValid}
                            >
                                Delete Forever
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

interface ExcelImportModalProps {
    importData: ExcelImportData;
    categories: string[];
    allFirms: Firm[];
    onImport: (selectedFirms: ImportedFirm[]) => void;
    onCancel: () => void;
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ 
    importData, 
    categories, 
    allFirms, 
    onImport, 
    onCancel 
}) => {
    const [firms, setFirms] = React.useState<ImportedFirm[]>(importData.firms);
    const [editingFirm, setEditingFirm] = React.useState<string | null>(null);
    const [typingNewSubcategory, setTypingNewSubcategory] = React.useState<{[key: string]: boolean}>({});

    const uniqueSubcategories = React.useMemo(() => {
        const subcats = new Set(allFirms.map(f => f.subcategory));
        return Array.from(subcats).sort();
    }, [allFirms]);

    const selectedCount = firms.filter(f => f.selected).length;

    const handleToggleSelect = (firmId: string) => {
        setFirms(prev => prev.map(firm => 
            firm.id === firmId ? { ...firm, selected: !firm.selected } : firm
        ));
    };

    const handleSelectAll = () => {
        const allSelected = firms.every(f => f.selected);
        setFirms(prev => prev.map(firm => ({ ...firm, selected: !allSelected })));
    };

    const handleEditFirm = (firmId: string, updates: Partial<ImportedFirm>) => {
        setFirms(prev => prev.map(firm => 
            firm.id === firmId ? { ...firm, ...updates, edited: true } : firm
        ));
    };

    const handleImport = () => {
        const selectedFirms = firms.filter(f => f.selected);
        
        // Validate that all selected firms have required fields
        const incompleteFields = selectedFirms.filter(f => !f.name || !f.category || !f.subcategory);
        if (incompleteFields.length > 0) {
            alert(`Please complete all required fields (Name, Category, Subcategory) for all selected firms.`);
            return;
        }

        onImport(selectedFirms);
    };

    return (
        <Modal onClose={onCancel}>
            <div className="excel-import-modal">
                <h3>Import from Excel: {importData.fileName}</h3>
                <p>Select firms to import and fill in the required information:</p>
                
                <div className="import-summary">
                    <div className="summary-actions">
                        <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={handleSelectAll}
                        >
                            {firms.every(f => f.selected) ? 'Deselect All' : 'Select All'}
                        </button>
                        <span className="selected-count">
                            {selectedCount} of {firms.length} selected
                        </span>
                    </div>
                </div>

                <div className="import-list">
                    {firms.map(firm => (
                        <div key={firm.id} className={`import-item ${firm.selected ? 'selected' : ''}`}>
                            <div className="import-item-header">
                                <label className="import-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={firm.selected}
                                        onChange={() => handleToggleSelect(firm.id)}
                                    />
                                    <span className="firm-name">{firm.name}</span>
                                </label>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditingFirm(editingFirm === firm.id ? null : firm.id)}
                                >
                                    {editingFirm === firm.id ? 'Done' : 'Edit'}
                                </button>
                            </div>
                            
                            {(firm.description || firm.industry || firm.location) && (
                                <div className="firm-description">
                                    {firm.description && <div><strong>Description:</strong> {firm.description}</div>}
                                    {firm.industry && <div><strong>Industry:</strong> {firm.industry}</div>}
                                    {firm.location && <div><strong>Location:</strong> {firm.location}</div>}
                                </div>
                            )}

                            {editingFirm === firm.id && (
                                <div className="edit-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Firm Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={firm.name}
                                                onChange={(e) => handleEditFirm(firm.id, { name: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Product (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={firm.product}
                                                onChange={(e) => handleEditFirm(firm.id, { product: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Subcategory</label>
                                            {typingNewSubcategory[firm.id] ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={firm.subcategory}
                                                    onChange={(e) => handleEditFirm(firm.id, { subcategory: e.target.value })}
                                                    onBlur={() => {
                                                        if (!firm.subcategory.trim()) {
                                                            setTypingNewSubcategory(prev => ({ ...prev, [firm.id]: false }));
                                                            handleEditFirm(firm.id, { subcategory: '' });
                                                        }
                                                    }}
                                                    placeholder="Enter new subcategory"
                                                    autoFocus
                                                />
                                            ) : (
                                                <select
                                                    className="form-control"
                                                    value={firm.subcategory}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '_new_') {
                                                            setTypingNewSubcategory(prev => ({ ...prev, [firm.id]: true }));
                                                            handleEditFirm(firm.id, { subcategory: '' });
                                                        } else {
                                                            setTypingNewSubcategory(prev => ({ ...prev, [firm.id]: false }));
                                                            handleEditFirm(firm.id, { subcategory: value });
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select or create new</option>
                                                    <option value="_new_">Type new subcategory</option>
                                                    {uniqueSubcategories.map(sc => (
                                                        <option key={sc} value={sc}>{sc}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>Category *</label>
                                            <select
                                                className="form-control"
                                                value={firm.category}
                                                onChange={(e) => handleEditFirm(firm.id, { category: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-control"
                                                value={firm.description}
                                                onChange={(e) => handleEditFirm(firm.id, { description: e.target.value })}
                                                rows={3}
                                                placeholder="Firm description..."
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Industry #</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={firm.industry}
                                                onChange={(e) => handleEditFirm(firm.id, { industry: e.target.value })}
                                                placeholder="e.g., defense, COMM, uxv"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={firm.location}
                                                onChange={(e) => handleEditFirm(firm.id, { location: e.target.value })}
                                                placeholder="e.g., Palm Beach Gardens, FL, USA"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={handleImport}
                        disabled={selectedCount === 0}
                    >
                        Import {selectedCount} Firm{selectedCount !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

interface CardProps {
    firm: Firm;
    categories: string[];
    onEdit: (firm: Firm) => void;
    onDelete: (firmId: string) => void;
    onViewNotes: (firm: Firm) => void;
}

const Card: React.FC<CardProps> = React.memo(({ firm, categories, onEdit, onDelete, onViewNotes }) => {
    const handleEdit = React.useCallback(() => onEdit(firm), [onEdit, firm]);
    const handleDelete = React.useCallback(() => onDelete(firm.id), [onDelete, firm.id]);
    const handleViewNotes = React.useCallback(() => onViewNotes(firm), [onViewNotes, firm]);

    return (
        <div className="card" role="listitem" onClick={handleViewNotes} style={{ cursor: 'pointer' }}>
            <div className={`card-color-bar ${getCategoryColorClass(firm.category, categories)}`}></div>
            <div className="card-actions">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className="card-action-btn" aria-label={`Edit ${firm.name}`}><EditIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="card-action-btn" aria-label={`Delete ${firm.name}`}><DeleteIcon /></button>
            </div>
            <h3 className="card-title">
                {firm.name}
                {firm.notes && firm.notes.trim() && (
                    <span className="notes-indicator" title="Has notes">📝</span>
                )}
                {firm.description && firm.description.trim() && (
                    <span className="notes-indicator" title="Has description">📄</span>
                )}
                {firm.industry && firm.industry.trim() && (
                    <span className="notes-indicator" title="Has industry">🏭</span>
                )}
                {firm.location && firm.location.trim() && (
                    <span className="notes-indicator" title="Has location">📍</span>
                )}
            </h3>
            <div className="card-field">
                <div className="card-field-label">Subcategory</div>
                <div className={`card-pill ${getCategoryColorClass(firm.category, categories)}`}>{firm.subcategory}</div>
            </div>
            {firm.product && (
                <div className="card-field">
                    <div className="card-field-label">Product</div>
                    <div className="card-product-value">{firm.product}</div>
                </div>
            )}
        </div>
    );
});

interface FirmNotesModalProps {
    firm: Firm;
    onUpdateNotes: (firmId: string, notes: string) => void;
    onClose: () => void;
}

const FirmNotesModal: React.FC<FirmNotesModalProps> = ({ firm, onUpdateNotes, onClose }) => {
    const [notes, setNotes] = React.useState(firm.notes || '');

    const handleSave = () => {
        onUpdateNotes(firm.id, notes);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-content notes-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                <h3>Notes: {firm.name}</h3>
                <div className="firm-details">
                    <div className="firm-detail">
                        <span className="label">Category:</span> {firm.category}
                    </div>
                    <div className="firm-detail">
                        <span className="label">Subcategory:</span> {firm.subcategory}
                    </div>
                    {firm.product && (
                        <div className="firm-detail">
                            <span className="label">Product:</span> {firm.product}
                        </div>
                    )}
                    {firm.description && (
                        <div className="firm-detail">
                            <span className="label">Description:</span> {firm.description}
                        </div>
                    )}
                    {firm.industry && (
                        <div className="firm-detail">
                            <span className="label">Industry #:</span> {firm.industry}
                        </div>
                    )}
                    {firm.location && (
                        <div className="firm-detail">
                            <span className="label">Location:</span> {firm.location}
                        </div>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="modalNotes">Notes</label>
                    <textarea
                        id="modalNotes"
                        className="form-control notes-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes about this firm..."
                        rows={8}
                        autoFocus
                    />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave}>
                        Save Notes
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FirmFormProps {
    firm: Firm;
    categories: string[];
    allFirms: Firm[];
    onSave: (firm: Firm) => void;
    onCancel: () => void;
    formTitle: string;
}

const FirmForm: React.FC<FirmFormProps> = ({ firm, categories, allFirms, onSave, onCancel, formTitle }) => {
    const [name, setName] = React.useState('');
    const [subcategory, setSubcategory] = React.useState('');
    const [product, setProduct] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [industry, setIndustry] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [isTypingNewSubcategory, setIsTypingNewSubcategory] = React.useState(false);

    const uniqueSubcategories = React.useMemo(() => {
        const subcats = new Set(allFirms.map(f => f.subcategory));
        return Array.from(subcats).sort();
    }, [allFirms]);

    React.useEffect(() => {
        setName(firm.name);
        setSubcategory(firm.subcategory);
        setProduct(firm.product || '');
        setCategory(firm.category);
        setNotes(firm.notes || '');
        setDescription(firm.description || '');
        setIndustry(firm.industry || '');
        setLocation(firm.location || '');
        setIsTypingNewSubcategory(!uniqueSubcategories.includes(firm.subcategory));
    }, [firm, uniqueSubcategories]);

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '_new_') {
            setIsTypingNewSubcategory(true);
            setSubcategory('');
        } else if (value !== '') {
            setIsTypingNewSubcategory(false);
            setSubcategory(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !subcategory.trim() || !category) {
            alert('Please fill in Firm Name, Subcategory, and select a Category.');
            return;
        }
        onSave({ ...firm, name, subcategory, product, category, notes, description, industry, location });
    };

    return (
        <form className="modal-form" onSubmit={handleSubmit}>
            <h3>{formTitle}</h3>
            <div className="form-group">
                <label htmlFor="firmName">Firm Name</label>
                <input id="firmName" type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="subcategory">Subcategory</label>
                {isTypingNewSubcategory ? (
                     <input
                        id="subcategory"
                        type="text"
                        className="form-control"
                        value={subcategory}
                        onChange={e => setSubcategory(e.target.value)}
                        onBlur={() => {
                            // If user clicks away from an empty input, revert to original state
                            if (!subcategory.trim()) {
                                setSubcategory(firm.subcategory);
                                setIsTypingNewSubcategory(!uniqueSubcategories.includes(firm.subcategory));
                            }
                        }}
                        required
                        autoFocus
                    />
                ) : (
                    <select
                        id="subcategory"
                        className="form-control"
                        value={subcategory}
                        onChange={handleSubcategoryChange}
                        required
                    >
                         <option value="_new_">Insert/Type new subcategory</option>
                         {uniqueSubcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                )}
            </div>
            <div className="form-group">
                <label htmlFor="product">Product (Optional)</label>
                <input id="product" type="text" className="form-control" value={product} onChange={e => setProduct(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea 
                    id="description" 
                    className="form-control" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the firm and its capabilities..."
                    rows={3}
                />
            </div>
            <div className="form-group">
                <label htmlFor="industry">Industry # (Optional)</label>
                <input 
                    id="industry" 
                    type="text" 
                    className="form-control" 
                    value={industry} 
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g., defense, COMM, uxv"
                />
            </div>
            <div className="form-group">
                <label htmlFor="location">Location (Optional)</label>
                <input 
                    id="location" 
                    type="text" 
                    className="form-control" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Palm Beach Gardens, FL, USA"
                />
            </div>
            <div className="form-group">
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea 
                    id="notes" 
                    className="form-control notes-textarea" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add your notes about this firm..."
                    rows={4}
                />
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Firm</button>
            </div>
        </form>
    );
};

interface AddFirmFormProps {
    categories: string[];
    firms: Firm[];
    onAddFirm: (newFirm: Omit<Firm, 'id'>) => void;
}


const AddFirmForm: React.FC<AddFirmFormProps> = ({ categories, firms, onAddFirm }) => {
    const [name, setName] = React.useState('');
    const [subcategory, setSubcategory] = React.useState('');
    const [isTypingNewSubcategory, setIsTypingNewSubcategory] = React.useState(false);
    const [product, setProduct] = React.useState('');
    const [category, setCategory] = React.useState(categories[0] || '');
    const [description, setDescription] = React.useState('');
    const [industry, setIndustry] = React.useState('');
    const [location, setLocation] = React.useState('');

    const uniqueSubcategories = React.useMemo(() => {
        const subcats = new Set(firms.map(f => f.subcategory));
        return Array.from(subcats).sort();
    }, [firms]);

     React.useEffect(() => {
        if (!category && categories.length > 0) {
            setCategory(categories[0]);
        }
    }, [categories, category]);

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '_new_') {
            setIsTypingNewSubcategory(true);
            setSubcategory('');
        } else if (value !== '') {
            setIsTypingNewSubcategory(false);
            setSubcategory(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !subcategory.trim() || !category) {
            alert('Please fill in Firm Name, Subcategory and select a category.');
            return;
        }
        onAddFirm({ name, subcategory, product, category, description, industry, location });
        setName('');
        setSubcategory('');
        setProduct('');
        setDescription('');
        setIndustry('');
        setLocation('');
        setIsTypingNewSubcategory(false);

    };

    return (
        <section className="add-firm-section" aria-labelledby="add-firm-heading">
            <h2 id="add-firm-heading">Add New Firm</h2>
            <form className="add-firm-form" onSubmit={handleSubmit}>
                <div className="form-group firm-name-group">
                    <label htmlFor="add-firmName">Firm Name</label>
                    <input id="add-firmName" type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                 <div className="form-group subcategory-group">
                    <label htmlFor="add-subcategory">Subcategory</label>
                     {isTypingNewSubcategory ? (
                        <input
                            id="add-subcategory"
                            type="text"
                            className="form-control"
                            value={subcategory}
                            onChange={e => setSubcategory(e.target.value)}
                            onBlur={() => {
                                if (!subcategory.trim()) {
                                    setIsTypingNewSubcategory(false);
                                    setSubcategory('');
                                }
                            }}
                            required
                            autoFocus
                        />
                    ) : (
                        <select
                            id="add-subcategory"
                            className="form-control"
                            value={subcategory}
                            onChange={handleSubcategoryChange}
                            required
                        >
                            <option value="" disabled>Select or create new</option>
                            <option value="_new_">Insert/Type new subcategory</option>
                            {uniqueSubcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                        </select>
                    )}
                </div>
                 <div className="form-group product-group">
                    <label htmlFor="add-product">Product (Optional)</label>
                    <input id="add-product" type="text" className="form-control" value={product} onChange={e => setProduct(e.target.value)} />
                </div>
                <div className="form-group category-group">
                    <label htmlFor="add-category">Category</label>
                    <select id="add-category" className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                         {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="button-group">
                    <button type="submit" className="btn btn-primary">Add Firm</button>
                </div>
            </form>
        </section>
    );
};

interface PageTabsProps {
    maps: MarketMaps;
    activeMapId: string;
    onSelect: (id: string) => void;
    onAddMap: () => void;
    onEditMap: (mapId: string) => void;
    onDeleteMap: (mapId: string) => void;
}

const PageTabs: React.FC<PageTabsProps> = ({ maps, activeMapId, onSelect, onAddMap, onEditMap, onDeleteMap }) => {
    const [showDropdown, setShowDropdown] = React.useState<string | null>(null);

    const handleTabClick = (mapId: string, event: React.MouseEvent) => {
        // Right click or ctrl+click to show dropdown
        if (event.button === 2 || event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setShowDropdown(showDropdown === mapId ? null : mapId);
        } else {
            onSelect(mapId);
            setShowDropdown(null);
        }
    };

    const handleContextMenu = (mapId: string, event: React.MouseEvent) => {
        event.preventDefault();
        setShowDropdown(showDropdown === mapId ? null : mapId);
    };

    React.useEffect(() => {
        const handleClickOutside = () => setShowDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <nav className="page-tabs">
            {Object.values(maps).map(map => (
                <div key={map.id} className="tab-container">
                    <button
                        className={`tab-btn ${map.id === activeMapId ? 'active' : ''}`}
                        onClick={(e) => handleTabClick(map.id, e)}
                        onContextMenu={(e) => handleContextMenu(map.id, e)}
                        title="Right-click for options"
                    >
                        {map.name}
                        <button 
                            className="tab-options-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(showDropdown === map.id ? null : map.id);
                            }}
                            aria-label={`Options for ${map.name}`}
                        >
                            ⋮
                        </button>
                    </button>
                    {showDropdown === map.id && (
                        <div className="tab-dropdown">
                            <button
                                className="dropdown-item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditMap(map.id);
                                    setShowDropdown(null);
                                }}
                            >
                                <EditIcon /> Edit Name
                            </button>
                            <button
                                className="dropdown-item delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMap(map.id);
                                    setShowDropdown(null);
                                }}
                            >
                                <DeleteIcon /> Delete Map
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button className="tab-btn add-map-btn" onClick={onAddMap}>+ Add Map</button>
        </nav>
    );
};


interface AddMapPageProps {
    onCancel: () => void;
    onCreateMap: (mapName: string) => void;
}

const AddMapPage: React.FC<AddMapPageProps> = ({ onCancel, onCreateMap }) => {
    const [mapName, setMapName] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mapName.trim()) {
            onCreateMap(mapName.trim());
        } else {
            alert("Please enter a map name.");
        }
    };

    return (
        <div className="add-map-page">
            <div className="form-container">
                <h2>Create a New Market Map</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newMapName">Market Map Name</label>
                        <input
                            id="newMapName"
                            type="text"
                            className="form-control"
                            value={mapName}
                            onChange={e => setMapName(e.target.value)}
                            placeholder="e.g., Autonomous Vehicles"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Map
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface MatrixViewProps {
    categories: string[];
    firms: Firm[];
    onViewNotes: (firm: Firm) => void;
}

const MatrixView: React.FC<MatrixViewProps> = React.memo(({ categories, firms, onViewNotes }) => {
    const subcategories = React.useMemo(() => {
        const subcats = new Set(firms.map(f => f.subcategory));
        return Array.from(subcats).sort();
    }, [firms]);

    const matrixData = React.useMemo(() => {
        const data: { [key: string]: { [key: string]: Firm[] } } = {};
        categories.forEach(cat => {
            data[cat] = {};
            subcategories.forEach(subcat => {
                data[cat][subcat] = [];
            });
        });
        firms.forEach(firm => {
            if (data[firm.category] && data[firm.category][firm.subcategory]) {
                data[firm.category][firm.subcategory].push(firm);
            }
        });
        return data;
    }, [categories, firms, subcategories]);

    return (
        <div className="matrix-view-container">
            <table className="matrix-table">
                <thead>
                    <tr>
                        <th className="sticky-header"></th>
                        {categories.map(cat => (
                            <th key={cat} className="sticky-header category-header">{cat}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {subcategories.map(subcat => (
                        <tr key={subcat}>
                            <th className="sticky-header subcategory-header">{subcat}</th>
                            {categories.map(cat => (
                                <td key={cat}>
                                    <div className="cell-content">
                                        {(matrixData[cat]?.[subcat] || []).map(firm => (
                                            <div 
                                                key={firm.id} 
                                                className={`matrix-pill ${getCategoryColorClass(firm.category, categories)}`}
                                                onClick={() => onViewNotes(firm)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to view/edit notes"
                                            >
                                                <span className="firm-name">
                                                    {firm.name}
                                                    {firm.notes && firm.notes.trim() && (
                                                        <span className="notes-indicator" title="Has notes"> 📝</span>
                                                    )}
                                                    {firm.description && firm.description.trim() && (
                                                        <span className="notes-indicator" title="Has description"> 📄</span>
                                                    )}
                                                    {firm.industry && firm.industry.trim() && (
                                                        <span className="notes-indicator" title="Has industry"> 🏭</span>
                                                    )}
                                                    {firm.location && firm.location.trim() && (
                                                        <span className="notes-indicator" title="Has location"> 📍</span>
                                                    )}
                                                </span>
                                                {firm.product && (
                                                    <span className="product-name"> ({firm.product})</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

const App = () => {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [authLoading, setAuthLoading] = React.useState(true);
    
    // State management with loading and error states
    const [marketMaps, setMarketMaps] = React.useState<MarketMaps>({});
    const [activeMapId, setActiveMapId] = React.useState<string>('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [modal, setModal] = React.useState<{ isOpen: boolean; type: 'edit-firm' | 'delete-map' | 'excel-import' | 'firm-notes' | null; data: Firm | null; mapId?: string; importData?: ExcelImportData }>({ isOpen: false, type: null, data: null });
    const [view, setView] = React.useState<'map' | 'add-map'>('map');
    const [currentView, setCurrentView] = React.useState<'kanban' | 'matrix'>('kanban');

    const activeMap = marketMaps[activeMapId];

    // Check authentication status on app load
    React.useEffect(() => {
        const checkAuth = () => {
            const isAuthed = sessionStorage.getItem('market-map-auth') === 'true';
            setIsAuthenticated(isAuthed);
            setAuthLoading(false);
        };
        
        checkAuth();
    }, []);

    const handleAuthentication = () => {
        setIsAuthenticated(true);
    };

    // Load initial data from API (only when authenticated)
    React.useEffect(() => {
        if (!isAuthenticated) return;
        
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await loadFromApi();
                setMarketMaps(data);
                
                // Set active map to first available map
                const mapIds = Object.keys(data);
                if (mapIds.length > 0) {
                    setActiveMapId(mapIds[0]);
                }
            } catch (err) {
                setError('Failed to load data. Please try refreshing the page.');
                console.error('Failed to load initial data:', err);
                // Fallback to initial data
                setMarketMaps(initialMarketMapData);
                setActiveMapId('CUAS');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isAuthenticated]);

    // Save data to API whenever marketMaps changes
    const saveData = React.useCallback(async (data: MarketMaps) => {
        try {
            setSaving(true);
            await saveToApi(data);
        } catch (err) {
            setError('Failed to save data. Your changes may not be persistent.');
            console.error('Failed to save data:', err);
        } finally {
            setSaving(false);
        }
    }, []);

    // Auto-save whenever marketMaps changes (with debouncing)
    React.useEffect(() => {
        if (Object.keys(marketMaps).length === 0) return; // Don't save empty state
        
        const timeoutId = setTimeout(() => {
            saveData(marketMaps);
        }, 1000); // Debounce saves by 1 second

        return () => clearTimeout(timeoutId);
    }, [marketMaps, saveData]);

    // Real-time sync subscription (only when authenticated)
    React.useEffect(() => {
        if (!isAuthenticated) return;
        
        const unsubscribe = subscribeToUpdates((newData) => {
            setMarketMaps(newData);
        });

        return unsubscribe;
    }, [isAuthenticated]);

    const closeModal = React.useCallback(() => setModal({ isOpen: false, type: null, data: null }), []);

    const handleAddFirm = React.useCallback((newFirm: Omit<Firm, 'id'>) => {
        setMarketMaps(prev => {
            const map = prev[activeMapId];
            const updatedFirms = [...map.firms, { ...newFirm, id: String(Date.now()) }];
            return { ...prev, [activeMapId]: { ...map, firms: updatedFirms }};
        });
    }, [activeMapId]);

    const handleEditFirm = React.useCallback((firmToEdit: Firm) => {
        setModal({ isOpen: true, type: 'edit-firm', data: firmToEdit });
    }, []);

    const handleViewNotes = React.useCallback((firm: Firm) => {
        setModal({ isOpen: true, type: 'firm-notes', data: firm });
    }, []);

    const handleUpdateNotes = React.useCallback((firmId: string, notes: string) => {
        setMarketMaps(prev => {
            const map = prev[activeMapId];
            const updatedFirms = map.firms.map(f => f.id === firmId ? { ...f, notes } : f);
            return { ...prev, [activeMapId]: { ...map, firms: updatedFirms } };
        });
    }, [activeMapId]);

    const handleDeleteFirm = React.useCallback((firmId: string) => {
        if (window.confirm('Are you sure you want to delete this firm?')) {
            setMarketMaps(prev => {
                const map = prev[activeMapId];
                const updatedFirms = map.firms.filter(f => f.id !== firmId);
                return { ...prev, [activeMapId]: { ...map, firms: updatedFirms } };
            });
        }
    }, [activeMapId]);

    const handleSaveFirm = React.useCallback((firmData: Firm) => {
        setMarketMaps(prev => {
            const map = prev[activeMapId];
            const updatedFirms = map.firms.map(f => f.id === firmData.id ? firmData : f);
            return { ...prev, [activeMapId]: { ...map, firms: updatedFirms } };
        });
        closeModal();
    }, [activeMapId, closeModal]);

    const handleShowAddMapPage = () => {
        setView('add-map');
    };

    const handleCreateMap = (newMapName: string) => {
        const newMapId = newMapName.replace(/\s+/g, '-').toLowerCase();
        if (marketMaps[newMapId]) {
            alert("A map with this name already exists.");
            return;
        }
        setMarketMaps(prev => ({
            ...prev,
            [newMapId]: { id: newMapId, name: newMapName, categories: ['Category 1'], firms: [] }
        }));
        setActiveMapId(newMapId);
        setView('map');
    };

    const handleEditMap = (mapId: string) => {
        const currentMap = marketMaps[mapId];
        if (!currentMap) return;

        const newName = window.prompt(`Enter new name for "${currentMap.name}":`, currentMap.name);
        if (!newName || newName.trim() === currentMap.name) return;

        const trimmedName = newName.trim();
        if (!trimmedName) {
            alert("Map name cannot be empty.");
            return;
        }

        // Check if a map with this name already exists (case-insensitive)
        const newMapId = trimmedName.replace(/\s+/g, '-').toLowerCase();
        if (newMapId !== mapId && marketMaps[newMapId]) {
            alert("A map with this name already exists.");
            return;
        }

        setMarketMaps(prev => {
            const updated = { ...prev };
            
            if (newMapId !== mapId) {
                // If ID changes, we need to create new entry and delete old one
                updated[newMapId] = { ...currentMap, id: newMapId, name: trimmedName };
                delete updated[mapId];
                
                // Update active map ID if this was the active map
                if (activeMapId === mapId) {
                    setActiveMapId(newMapId);
                }
            } else {
                // Just update the name
                updated[mapId] = { ...currentMap, name: trimmedName };
            }
            
            return updated;
        });
    };

    const handleDeleteMap = (mapId: string) => {
        setModal({ isOpen: true, type: 'delete-map', data: null, mapId });
    };

    const confirmDeleteMap = (mapId: string) => {
        const currentMap = marketMaps[mapId];
        if (!currentMap) return;

        setMarketMaps(prev => {
            const updated = { ...prev };
            delete updated[mapId];

            // If we deleted the active map, switch to another map
            if (activeMapId === mapId) {
                const remainingMapIds = Object.keys(updated);
                if (remainingMapIds.length > 0) {
                    setActiveMapId(remainingMapIds[0]);
                } else {
                    // No maps left, create a default one
                    const defaultMap = {
                        id: 'default',
                        name: 'New Market Map',
                        categories: ['Category 1'],
                        firms: []
                    };
                    updated['default'] = defaultMap;
                    setActiveMapId('default');
                }
            }

            return updated;
        });

        closeModal();
        // Show success message briefly
        setError(null);
        setTimeout(() => {
            alert(`"${currentMap.name}" has been successfully deleted.`);
        }, 100);
    };

    const handleAddColumn = () => {
        const name = window.prompt("Enter new bucket name:");
        if (name && !activeMap.categories.includes(name)) {
            setMarketMaps(prev => ({
                ...prev,
                [activeMapId]: { ...prev[activeMapId], categories: [...prev[activeMapId].categories, name] }
            }));
        } else if (name) {
            alert("A bucket with this name already exists.");
        }
    };

    const handleEditColumn = (oldName: string) => {
        const newName = window.prompt(`Enter new name for "${oldName}" bucket:`, oldName);
        if (newName && newName !== oldName && !activeMap.categories.includes(newName)) {
            setMarketMaps(prev => ({
                ...prev,
                [activeMapId]: {
                    ...prev[activeMapId],
                    categories: prev[activeMapId].categories.map(c => c === oldName ? newName : c),
                    firms: prev[activeMapId].firms.map(f => f.category === oldName ? { ...f, category: newName } : f)
                }
            }));
        } else if (newName) {
            alert("A bucket with this name already exists or the name is unchanged.");
        }
    };

    const handleDeleteColumn = (name: string) => {
        if (window.confirm(`Are you sure you want to delete the "${name}" bucket and all its firms? This cannot be undone.`)) {
            setMarketMaps(prev => ({
                ...prev,
                [activeMapId]: {
                    ...prev[activeMapId],
                    categories: prev[activeMapId].categories.filter(c => c !== name),
                    firms: prev[activeMapId].firms.filter(f => f.category !== name)
                }
            }));
        }
    };

    const handleExportData = () => {
        // Convert market maps to CSV format
        const activeMapData = marketMaps[activeMapId];
        if (!activeMapData) return;

        // CSV headers
        const headers = ['Firm Name', 'Category', 'Subcategory', 'Product', 'Description', 'Industry #', 'Location', 'Notes'];
        
        // Convert firms to CSV rows
        const rows = activeMapData.firms.map(firm => [
            firm.name,
            firm.category,
            firm.subcategory,
            firm.product || '',
            firm.description || '',
            firm.industry || '',
            firm.location || '',
            firm.notes || ''
        ]);

        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeMapData.name}-export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        
        // Check if it's an Excel file
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            try {
                const importData = await parseExcelFile(file);
                if (importData && importData.firms.length > 0) {
                    setModal({ 
                        isOpen: true, 
                        type: 'excel-import', 
                        data: null, 
                        importData 
                    });
                } else {
                    alert('No valid data found in Excel file. Please ensure the file has firm names in column A and descriptions in column B.');
                }
            } catch (error) {
                alert('Error reading Excel file. Please ensure it\'s a valid Excel file.');
            }
        } else {
            // Handle JSON import (existing functionality)
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target?.result as string);
                    if (typeof importedData === 'object' && importedData !== null) {
                        setMarketMaps(importedData);
                        const mapIds = Object.keys(importedData);
                        if (mapIds.length > 0) {
                            setActiveMapId(mapIds[0]);
                        }
                        alert('Data imported successfully!');
                    } else {
                        alert('Invalid file format. Please select a valid JSON file.');
                    }
                } catch (error) {
                    alert('Error reading file. Please ensure it\'s a valid JSON file.');
                }
            };
            reader.readAsText(file);
        }
        
        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

    const handleExcelImport = (selectedFirms: ImportedFirm[]) => {
        // Convert imported firms to regular firms and add them to the current map
        const newFirms: Firm[] = selectedFirms.map(importedFirm => ({
            id: String(Date.now() + Math.random()),
            name: importedFirm.name,
            category: importedFirm.category,
            subcategory: importedFirm.subcategory,
            product: importedFirm.product || undefined,
            description: importedFirm.description || undefined,
            industry: importedFirm.industry || undefined,
            location: importedFirm.location || undefined
        }));

        setMarketMaps(prev => {
            const map = prev[activeMapId];
            const updatedFirms = [...map.firms, ...newFirms];
            return { ...prev, [activeMapId]: { ...map, firms: updatedFirms }};
        });

        closeModal();
        alert(`Successfully imported ${selectedFirms.length} firm${selectedFirms.length !== 1 ? 's' : ''}!`);
    };

    // Authentication check
    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Checking access...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginModal onAuthenticate={handleAuthentication} />;
    }

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading market maps...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (view === 'add-map') {
        return <AddMapPage onCreateMap={handleCreateMap} onCancel={() => setView('map')} />;
    }

    if (!activeMap) {
      const availableMapIds = Object.keys(marketMaps);
      if (availableMapIds.length > 0) {
        const firstMapId = availableMapIds[0];
        if (firstMapId !== activeMapId) {
          setActiveMapId(firstMapId);
        }
        return <div>Loading map...</div>;
      }
      // No maps available, show empty state
      return <div>No market maps available. Create one to get started.</div>;
    }

    return (
        <>
            <DynamicCategoryStyles categories={activeMap.categories} />
            <PageTabs 
                maps={marketMaps} 
                activeMapId={activeMapId} 
                onSelect={setActiveMapId} 
                onAddMap={handleShowAddMapPage}
                onEditMap={handleEditMap}
                onDeleteMap={handleDeleteMap}
            />
            <div className="app-container">
                <header className="header">
                    <h1>Market Map {'>'} <span>{activeMap.name}</span></h1>
                    <div className="header-actions">
                        <div className="sync-status">
                            {saving && <span className="sync-indicator saving">Saving...</span>}
                            {!saving && <span className="sync-indicator synced">✓ Synced</span>}
                        </div>
                        <div className="data-controls">
                            <button onClick={handleExportData} className="btn btn-secondary">
                                Export Data
                            </button>
                            <label className="btn btn-secondary">
                                Import Monday Dashboard Data (Excel)
                                <input
                                    type="file"
                                    accept=".json,.xlsx,.xls"
                                    onChange={handleImportData}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                        <div className="view-toggle">
                            <button onClick={() => setCurrentView('kanban')} className={`view-btn ${currentView === 'kanban' ? 'active' : ''}`}>Kanban View</button>
                            <button onClick={() => setCurrentView('matrix')} className={`view-btn ${currentView === 'matrix' ? 'active' : ''}`}>Matrix View</button>
                        </div>
                    </div>
                </header>
                 <main className="main-content" role="main">
                    {currentView === 'kanban' ? (
                        <div className="market-map">
                            {activeMap.categories.map(category => {
                                const filteredFirms = activeMap.firms.filter(firm => firm.category === category);
                                return (
                                    <section className="column" key={category} aria-labelledby={`${category}-heading`}>
                                        <div className="column-header">
                                            <h2 id={`${category}-heading`}>{category}</h2>
                                            <span className="count">{filteredFirms.length}</span>
                                            <div className="column-actions">
                                                <button onClick={() => handleEditColumn(category)} className="column-action-btn" aria-label={`Edit ${category} bucket name`}><EditIcon /></button>
                                                <button onClick={() => handleDeleteColumn(category)} className="column-action-btn" aria-label={`Delete ${category} bucket`}><DeleteIcon /></button>
                                            </div>
                                        </div>
                                        <div className="card-list" role="list">
                                            {filteredFirms.length > 0 ? (
                                                filteredFirms.map(firm => <Card key={firm.id} firm={firm} categories={activeMap.categories} onEdit={handleEditFirm} onDelete={handleDeleteFirm} onViewNotes={handleViewNotes} />)
                                            ) : (
                                                <div className="no-records">No records</div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                             <div className="column add-column">
                                <button className="add-column-btn" onClick={handleAddColumn}>+ Add Bucket</button>
                            </div>
                        </div>
                    ) : (
                       <MatrixView categories={activeMap.categories} firms={activeMap.firms} onViewNotes={handleViewNotes} />
                    )}
                </main>
            </div>
            <AddFirmForm categories={activeMap.categories} firms={activeMap.firms} onAddFirm={handleAddFirm} />
            {modal.isOpen && modal.type === 'edit-firm' && modal.data && (
                 <Modal onClose={closeModal}>
                    <FirmForm
                        firm={modal.data}
                        categories={activeMap.categories}
                        allFirms={activeMap.firms}
                        onSave={handleSaveFirm}
                        onCancel={closeModal}
                        formTitle="Edit Firm"
                    />
                </Modal>
            )}
            {modal.isOpen && modal.type === 'delete-map' && modal.mapId && marketMaps[modal.mapId] && (
                <DeleteConfirmationModal
                    mapName={marketMaps[modal.mapId].name}
                    firmCount={marketMaps[modal.mapId].firms.length}
                    categoryCount={marketMaps[modal.mapId].categories.length}
                    onConfirm={() => confirmDeleteMap(modal.mapId!)}
                    onCancel={closeModal}
                />
            )}
            {modal.isOpen && modal.type === 'excel-import' && modal.importData && (
                <ExcelImportModal
                    importData={modal.importData}
                    categories={activeMap.categories}
                    allFirms={activeMap.firms}
                    onImport={handleExcelImport}
                    onCancel={closeModal}
                />
            )}
            {modal.isOpen && modal.type === 'firm-notes' && modal.data && (
                <FirmNotesModal
                    firm={modal.data}
                    onUpdateNotes={handleUpdateNotes}
                    onClose={closeModal}
                />
            )}
        </>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(<App />);