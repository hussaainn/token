import { useGeoLocation } from '../hooks/useGeoLocation';
import { MapPin, CheckCircle, Clock, Loader } from 'lucide-react';

const GeoArrivalCard = ({ activeToken }) => {
    const { arrivalStatus, distance, error } = useGeoLocation(activeToken);

    if (!activeToken) return null;
    if (arrivalStatus === 'arrived') {
        return (
            <div className="card" style={{
                background: 'linear-gradient(135deg, #22c55e15, #22c55e30)',
                border: '2px solid var(--success)', marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <CheckCircle size={36} color="var(--success)" />
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--success)' }}>✅ Arrived & In Queue</h3>
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            You've been automatically checked in. Staff has been notified. Please head inside!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) return null; // Silently fail — don't distract customer

    return (
        <div className="card" style={{
            border: '2px dashed var(--primary)', marginBottom: '1.5rem',
            background: 'rgba(244,63,143,0.03)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {distance === null
                    ? <Loader size={28} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                    : <MapPin size={28} color="var(--primary)" style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                        📍 Smart Arrival Detection Active
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {distance === null
                            ? 'Getting your location...'
                            : distance <= 500
                                ? '🎯 You\'re close! Checking you in...'
                                : `Walk towards the salon — auto check-in triggers within 500m`
                        }
                    </div>
                </div>
                <div style={{
                    background: 'rgba(244,63,143,0.1)', color: 'var(--primary)',
                    padding: '4px 12px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700,
                    flexShrink: 0
                }}>
                    LIVE
                </div>
            </div>

            <div style={{
                marginTop: '0.75rem', padding: '0.6rem', background: 'var(--bg-secondary)',
                borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
                <Clock size={14} />
                No-show after 15 minutes past your slot. Make sure location is enabled to avoid this.
            </div>
        </div>
    );
};

export default GeoArrivalCard;
