import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API_URL = 'https://lead-management-backend-pcux.onrender.com/api';

// Login Component
function Login({ onLogin }) {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/${role}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.role, data.username);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Lead Management System</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Login As</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="builder">Builder</option>
            </select>
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ token, username, onLogout }) {
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);

  const fetchLeads = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLeads(data);
  }, [token]);

  const fetchBuilders = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/builders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setBuilders(data);
  }, [token]);

  const fetchProperties = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProperties(data);
  }, [token]);

  useEffect(() => {
    fetchLeads();
    fetchBuilders();
    fetchProperties();
  }, [fetchLeads, fetchBuilders, fetchProperties]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure?')) return;
    await fetch(`${API_URL}/admin/${type}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (type === 'leads') fetchLeads();
    else if (type === 'builders') fetchBuilders();
    else if (type === 'properties') fetchProperties();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-right">
          <span>Welcome, {username}</span>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>Leads</button>
        <button className={activeTab === 'builders' ? 'active' : ''} onClick={() => setActiveTab('builders')}>Builders</button>
        <button className={activeTab === 'properties' ? 'active' : ''} onClick={() => setActiveTab('properties')}>Properties</button>
      </div>

      {activeTab === 'leads' && (
        <div className="content">
          <div className="content-header">
            <h2>Leads Management</h2>
            <button onClick={() => openModal('lead')} className="btn-primary">Add Lead</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Interested In</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Builder</th>
                <th>Property</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.location}</td>
                  <td>{lead.interestedIn}</td>
                  <td>{lead.phoneNumber}</td>
                  <td><span className={`status ${lead.status}`}>{lead.status}</span></td>
                  <td>{lead.builder?.username}</td>
                  <td>{lead.property?.name || '-'}</td>
                  <td>{lead.comments || '-'}</td>
                  <td>
                    <button onClick={() => openModal('lead', lead)} className="btn-small">Edit</button>
                    <button onClick={() => handleDelete('leads', lead._id)} className="btn-small btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'builders' && (
        <div className="content">
          <div className="content-header">
            <h2>Builders Management</h2>
            <button onClick={() => openModal('builder')} className="btn-primary">Add Builder</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {builders.map(builder => (
                <tr key={builder._id}>
                  <td>{builder.username}</td>
                  <td>{builder.email}</td>
                  <td>{builder.phone || '-'}</td>
                  <td>{new Date(builder.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => openModal('builder', builder)} className="btn-small">Edit</button>
                    <button onClick={() => handleDelete('builders', builder._id)} className="btn-small btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="content">
          <div className="content-header">
            <h2>Properties Management</h2>
            <button onClick={() => openModal('property')} className="btn-primary">Add Property</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Description</th>
                <th>Builder</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property._id}>
                  <td>{property.name}</td>
                  <td>{property.location}</td>
                  <td>{property.description || '-'}</td>
                  <td>{property.builder?.username}</td>
                  <td>{new Date(property.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => openModal('property', property)} className="btn-small">Edit</button>
                    <button onClick={() => handleDelete('properties', property._id)} className="btn-small btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          type={modalType}
          item={editItem}
          token={token}
          builders={builders}
          properties={properties}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            if (modalType === 'lead') fetchLeads();
            else if (modalType === 'builder') fetchBuilders();
            else if (modalType === 'property') fetchProperties();
          }}
        />
      )}
    </div>
  );
}

// Builder Dashboard
function BuilderDashboard({ token, username, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);

  const fetchLeads = useCallback(async () => {
    const res = await fetch(`${API_URL}/builder/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLeads(data);
  }, [token]);

  const fetchProperties = useCallback(async () => {
    const res = await fetch(`${API_URL}/builder/properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProperties(data);
  }, [token]);

  useEffect(() => {
    fetchLeads();
    fetchProperties();
  }, [fetchLeads, fetchProperties]);

  const downloadCSV = () => {
    const headers = ['Name', 'Location', 'Interested In', 'Phone Number', 'Status', 'Property', 'Comments', 'Created At'];
    const rows = leads.map(lead => [
      lead.name,
      lead.location,
      lead.interestedIn,
      lead.phoneNumber,
      lead.status,
      lead.property?.name || '',
      lead.comments || '',
      new Date(lead.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Builder Dashboard</h1>
        <div className="header-right">
          <span>Welcome, {username}</span>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="content">
        <div className="content-header">
          <h2>My Leads</h2>
          <button onClick={downloadCSV} className="btn-primary">Download CSV</button>
        </div>

        <div className="stats">
          <div className="stat-card">
            <h3>{leads.length}</h3>
            <p>Total Leads</p>
          </div>
          <div className="stat-card">
            <h3>{leads.filter(l => l.status === 'new').length}</h3>
            <p>New Leads</p>
          </div>
          <div className="stat-card">
            <h3>{leads.filter(l => l.status === 'contacted').length}</h3>
            <p>Contacted</p>
          </div>
          <div className="stat-card">
            <h3>{properties.length}</h3>
            <p>My Properties</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Interested In</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Property</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id}>
                <td>{lead.name}</td>
                <td>{lead.location}</td>
                <td>{lead.interestedIn}</td>
                <td>{lead.phoneNumber}</td>
                <td><span className={`status ${lead.status}`}>{lead.status}</span></td>
                <td>{lead.property?.name || '-'}</td>
                <td>{lead.comments || '-'}</td>
                <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ type, item, token, builders, properties, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    item || (type === 'lead' ? {
      name: '', location: '', interestedIn: '', phoneNumber: '', status: 'new', comments: '', builder: '', property: ''
    } : type === 'builder' ? {
      username: '', password: '', email: '', phone: ''
    } : {
      name: '', location: '', description: '', builder: ''
    })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = item ? `${API_URL}/admin/${type === 'lead' ? 'leads' : type === 'builder' ? 'builders' : 'properties'}/${item._id}` : `${API_URL}/admin/${type === 'lead' ? 'leads' : type === 'builder' ? 'builders' : 'properties'}`;
    
    const res = await fetch(endpoint, {
      method: item ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{item ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <form onSubmit={handleSubmit}>
          {type === 'lead' && (
            <>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Interested In *</label>
                <input type="text" value={formData.interestedIn} onChange={(e) => setFormData({...formData, interestedIn: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Builder *</label>
                <select value={formData.builder} onChange={(e) => setFormData({...formData, builder: e.target.value})} required>
                  <option value="">Select Builder</option>
                  {builders.map(b => <option key={b._id} value={b._id}>{b.username}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Property</label>
                <select value={formData.property} onChange={(e) => setFormData({...formData, property: e.target.value})}>
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})} rows="3" />
              </div>
            </>
          )}
          
          {type === 'builder' && (
            <>
              <div className="form-group">
                <label>Username *</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required disabled={!!item} />
              </div>
              <div className="form-group">
                <label>Password {!item && '*'}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!item} placeholder={item ? 'Leave blank to keep current' : ''} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </>
          )}
          
          {type === 'property' && (
            <>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" />
              </div>
              <div className="form-group">
                <label>Builder *</label>
                <select value={formData.builder} onChange={(e) => setFormData({...formData, builder: e.target.value})} required>
                  <option value="">Select Builder</option>
                  {builders.map(b => <option key={b._id} value={b._id}>{b.username}</option>)}
                </select>
              </div>
            </>
          )}
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  const handleLogin = (newToken, newRole, newUsername) => {
    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('username', newUsername);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'admin') {
    return <AdminDashboard token={token} username={username} onLogout={handleLogout} />;
  }

  return <BuilderDashboard token={token} username={username} onLogout={handleLogout} />;
}

export default App;