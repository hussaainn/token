import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const NOTIFICATION_TEMPLATES = [
    "Your appointment has been cancelled as you did not arrive on time.",
    "You're up next! Please arrive at Mercy Salon within the next 10 minutes.",
    "Your turn will be skipped if you do not arrive in the next 5 minutes.",
    "Your appointment is confirmed. Please arrive 5 minutes early."
];

const NotificationModal = ({ isOpen, onClose, onSend, customerName }) => {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [customMessage, setCustomMessage] = useState('');

    if (!isOpen) return null;

    const handleSend = () => {
        const message = selectedTemplate === 'custom' ? customMessage : selectedTemplate;
        if (!message.trim()) return;
        onSend(message);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', margin: '20px', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Message {customerName}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Select Template</label>
                        {NOTIFICATION_TEMPLATES.map((msg, idx) => (
                            <label key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="template"
                                    value={msg}
                                    checked={selectedTemplate === msg}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    style={{ marginTop: '0.25rem' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.4 }}>{msg}</span>
                            </label>
                        ))}

                        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="template"
                                value="custom"
                                checked={selectedTemplate === 'custom'}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                style={{ marginTop: '0.25rem' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 600 }}>Custom Message</span>
                        </label>
                    </div>

                    {selectedTemplate === 'custom' && (
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Type a custom message..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            style={{ resize: 'none' }}
                            autoFocus
                        />
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button className="btn btn-outline-primary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSend} disabled={!selectedTemplate || (selectedTemplate === 'custom' && !customMessage.trim())} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Send size={16} /> Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
