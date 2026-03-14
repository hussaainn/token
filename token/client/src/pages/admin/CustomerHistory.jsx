import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerHistory = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        isWalkIn: '',
        startDate: '',
        endDate: ''
    });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filters.isWalkIn !== '') params.isWalkIn = filters.isWalkIn;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const res = await api.get('/admin/customer-history', { params });
            if (res.data.success) {
                setTokens(res.data.tokens);
                setTotal(res.data.total);
            }
        } catch (err) {
            console.error('Failed to load customer history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, filters]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    };

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Customer History</h2>
                    <p style={{ color: 'var(--text-muted)' }}>View and filter all customer visits</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} color="var(--text-secondary)" />
                    <span style={{ fontWeight: 500 }}>Filters:</span>
                </div>

                <select
                    name="isWalkIn"
                    value={filters.isWalkIn}
                    onChange={handleFilterChange}
                    className="form-control"
                    style={{ width: 'auto' }}
                >
                    <option value="">All Types</option>
                    <option value="false">Registered Users</option>
                    <option value="true">Walk-in</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                    <span>to</span>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="form-control"
                    />
                </div>

                <button className="btn btn-secondary btn-sm" onClick={() => {
                    setFilters({ isWalkIn: '', startDate: '', endDate: '' });
                    setPage(1);
                }}>Clear</button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}><div className="spinner"></div></div>
                ) : tokens.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                        <p>No records found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Token</th>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Staff</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Points Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map(token => (
                                        <tr key={token._id}>
                                            <td>
                                                <div>{format(new Date(token.date), 'MMM dd, yyyy')}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{token.timeSlot}</div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{token.tokenNumber}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {token.customer ? token.customer.name : token.customerName}
                                                    {token.isWalkIn && <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Walk-in</span>}
                                                </div>
                                            </td>
                                            <td>{token.service?.name}</td>
                                            <td>{token.staff ? token.staff.name : 'Unassigned'}</td>
                                            <td>
                                                <span className={`badge badge-${token.status === 'completed' ? 'success' :
                                                        token.status === 'cancelled' ? 'danger' : 'warning'
                                                    }`}>
                                                    {token.status}
                                                </span>
                                            </td>
                                            <td>
                                                {token.paymentStatus === 'completed' ? (
                                                    <div>
                                                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{token.amountPaid}</span>
                                                        <span style={{ fontSize: '0.8rem', marginLeft: '4px', textTransform: 'capitalize' }}>({token.paymentMethod})</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                {token.customer && token.customer.loyaltyPoints !== undefined ? token.customer.loyaltyPoints : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {total > 20 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} entries
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-secondary btn-sm btn-icon"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm btn-icon"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * 20 >= total}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerHistory;
