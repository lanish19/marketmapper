/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';

// Type definitions
interface Firm {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    product?: string;
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

interface CardProps {
    firm: Firm;
    onEdit: (firm: Firm) => void;
    onDelete: (firmId: string) => void;
}

const Card: React.FC<CardProps> = React.memo(({ firm, onEdit, onDelete }) => {
    const handleEdit = React.useCallback(() => onEdit(firm), [onEdit, firm]);
    const handleDelete = React.useCallback(() => onDelete(firm.id), [onDelete, firm.id]);

    return (
        <div className="card" role="listitem">
            <div className={`card-color-bar ${firm.category}`}></div>
            <div className="card-actions">
                <button onClick={handleEdit} className="card-action-btn" aria-label={`Edit ${firm.name}`}><EditIcon /></button>
                <button onClick={handleDelete} className="card-action-btn" aria-label={`Delete ${firm.name}`}><DeleteIcon /></button>
            </div>
            <h3 className="card-title">{firm.name}</h3>
            <div className="card-field">
                <div className="card-field-label">Subcategory</div>
                <div className={`card-pill ${firm.category}`}>{firm.subcategory}</div>
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
        onSave({ ...firm, name, subcategory, product, category });
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
        onAddFirm({ name, subcategory, product, category });
        setName('');
        setSubcategory('');
        setProduct('');
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
}

const PageTabs: React.FC<PageTabsProps> = ({ maps, activeMapId, onSelect, onAddMap }) => (
    <nav className="page-tabs">
        {Object.values(maps).map(map => (
            <button
                key={map.id}
                className={`tab-btn ${map.id === activeMapId ? 'active' : ''}`}
                onClick={() => onSelect(map.id)}
            >
                {map.name}
            </button>
        ))}
        <button className="tab-btn add-map-btn" onClick={onAddMap}>+ Add Map</button>
    </nav>
);


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
}

const MatrixView: React.FC<MatrixViewProps> = React.memo(({ categories, firms }) => {
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
                                            <div key={firm.id} className={`matrix-pill ${firm.category}`}>
                                                {firm.name}
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


// Data persistence utilities
const STORAGE_KEY = 'market-map-creator-data';

const saveToStorage = (data: MarketMaps) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save data to localStorage:', error);
    }
};

const loadFromStorage = (): MarketMaps | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        return null;
    }
};

const App = () => {
    // Load saved data or use initial data
    const [marketMaps, setMarketMaps] = React.useState<MarketMaps>(() => {
        const saved = loadFromStorage();
        return saved || initialMarketMapData;
    });
    const [activeMapId, setActiveMapId] = React.useState<string>(() => {
        const saved = loadFromStorage();
        if (saved) {
            const mapIds = Object.keys(saved);
            return mapIds.length > 0 ? mapIds[0] : 'CUAS';
        }
        return 'CUAS';
    });
    const [modal, setModal] = React.useState<{ isOpen: boolean; type: 'edit-firm' | null; data: Firm | null }>({ isOpen: false, type: null, data: null });
    const [view, setView] = React.useState<'map' | 'add-map'>('map');
    const [currentView, setCurrentView] = React.useState<'kanban' | 'matrix'>('kanban');

    const activeMap = marketMaps[activeMapId];

    // Auto-save to localStorage whenever marketMaps changes
    React.useEffect(() => {
        saveToStorage(marketMaps);
    }, [marketMaps]);

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
            [newMapId]: { id: newMapId, name: newMapName, categories: ['New Bucket'], firms: [] }
        }));
        setActiveMapId(newMapId);
        setView('map');
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
        const dataStr = JSON.stringify(marketMaps, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'market-maps-export.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

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
        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

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
            <PageTabs maps={marketMaps} activeMapId={activeMapId} onSelect={setActiveMapId} onAddMap={handleShowAddMapPage} />
            <div className="app-container">
                <header className="header">
                    <h1>Market Map {'>'} <span>{activeMap.name}</span></h1>
                    <div className="header-actions">
                        <div className="data-controls">
                            <button onClick={handleExportData} className="btn btn-secondary">
                                Export Data
                            </button>
                            <label className="btn btn-secondary">
                                Import Data
                                <input
                                    type="file"
                                    accept=".json"
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
                                                filteredFirms.map(firm => <Card key={firm.id} firm={firm} onEdit={handleEditFirm} onDelete={handleDeleteFirm} />)
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
                       <MatrixView categories={activeMap.categories} firms={activeMap.firms} />
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
        </>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(<App />);