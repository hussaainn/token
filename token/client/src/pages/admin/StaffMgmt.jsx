import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, Phone, Mail, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const StaffMgmt = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', specialization: '', isActive: true
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/admin/staff');
            setStaff(res.data.staff);
        } catch (err) {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleEdit = (member) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            specialization: member.specialization || '',
            isActive: member.isActive,
            password: '' // Don't show password
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await api.put(`/admin/staff/${editingStaff._id}`, formData);
                toast.success('Staff updated successfully');
            } else {
                await api.post('/admin/staff', formData);
                toast.success('Staff added successfully');
            }
            setShowModal(false);
            setEditingStaff(null);
            fetchStaff();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.specialization.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Staff Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your salon professionals and their specializations</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingStaff(null); setFormData({ name: '', email: '', password: '', phone: '', specialization: '', isActive: true }); setShowModal(true); }}>
                    <UserPlus size={18} /> Add Staff
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search staff by name or specialization..."
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid-3">
                {filteredStaff.map(member => (
                    <div key={member._id} className="card" style={{ opacity: member.isActive ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <Users size={24} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-icon" onClick={() => handleEdit(member)} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                <button className="btn-icon" style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}><Shield size={16} /></button>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '0.25rem' }}>{member.name}</h3>
                        <p className="badge badge-primary" style={{ marginBottom: '1rem' }}>{member.specialization || 'General Staff'}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <Mail size={14} /> {member.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <Phone size={14} /> {member.phone || 'No phone'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                            <span className={`badge ${member.isActive ? 'badge-success' : 'badge-cancelled'}`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joined {format(new Date(member.createdAt), 'MMM yyyy')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '1.5rem'
                }}>
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', transform: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required disabled={!!editingStaff} />
                            </div>
                            {!editingStaff && (
                                <div className="form-group">
                                    <label className="form-label">Initial Password</label>
                                    <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                                </div>
                            )}
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input type="text" name="specialization" className="form-control" placeholder="e.g. Hair, Skin" value={formData.specialization} onChange={handleChange} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <label htmlFor="isActive" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Staff Member</label>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-full">
                                    {editingStaff ? 'Save Changes' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffMgmt;
