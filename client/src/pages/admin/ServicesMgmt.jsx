import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Plus, Search, Edit2, Power, Clock, DollarSign, X, Layers } from 'lucide-react';

const ServicesMgmt = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', duration: 30, price: 0, category: 'hair', isActive: true
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/services?isActive=all');
            setServices(res.data.services);
        } catch (err) {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            duration: service.duration,
            price: service.price,
            category: service.category,
            isActive: service.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.put(`/services/${editingService._id}`, formData);
                toast.success('Service updated successfully');
            } else {
                await api.post('/services', formData);
                toast.success('Service created successfully');
            }
            setShowModal(false);
            setEditingService(null);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const toggleStatus = async (service) => {
        try {
            await api.put(`/services/${service._id}`, { isActive: !service.isActive });
            toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'}`);
            fetchServices();
        } catch (err) {
            toast.error('Failed to toggle status');
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Services Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your salon catalog, pricing, and timing</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingService(null); setFormData({ name: '', description: '', duration: 30, price: 0, category: 'hair', isActive: true }); setShowModal(true); }}>
                    <Plus size={18} /> New Service
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search services by name or category..."
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper card" style={{ padding: 0 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Service Details</th>
                            <th>Category</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map(service => (
                            <tr key={service._id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{service.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px' }} className="text-truncate">{service.description}</div>
                                </td>
                                <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{service.category}</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                        <Clock size={14} className="text-muted" /> {service.duration}m
                                    </div>
                                </td>
                                <td><div style={{ fontWeight: 700 }}>₹{service.price}</div></td>
                                <td>
                                    <span className={`badge ${service.isActive ? 'badge-success' : 'badge-cancelled'}`}>
                                        {service.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(service)}><Edit2 size={14} /></button>
                                        <button
                                            className={`btn btn-sm ${service.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                            onClick={() => toggleStatus(service)}
                                            title={service.isActive ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Service Name</label>
                                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="2"></textarea>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label"><DollarSign size={14} /> Price (₹)</label>
                                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><Clock size={14} /> Duration (mins)</label>
                                    <input type="number" name="duration" className="form-control" value={formData.duration} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label"><Layers size={14} /> Category</label>
                                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                                    <option value="hair">Hair</option>
                                    <option value="skin">Skin</option>
                                    <option value="nail">Nail</option>
                                    <option value="makeup">Makeup</option>
                                    <option value="beard">Beard</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-full">
                                    {editingService ? 'Save Changes' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesMgmt;
