import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

// Hardcoded salon coordinates (can change to env later)
const SALON_LAT = 12.9716;
const SALON_LNG = 77.5946;

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.floor(R * c);
};

export const useGeoLocation = (activeToken) => {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [arrivalStatus, setArrivalStatus] = useState(activeToken?.arrivalStatus || 'unknown');
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!activeToken) return;

        const tokenDate = new Date(activeToken.date);
        const today = new Date();
        const isToday = tokenDate.toDateString() === today.toDateString();

        if (!isToday) {
            setError('Location tracking is only active on the day of appointment');
            return;
        }

        if (activeToken.arrivalStatus === 'arrived') {
            setArrivalStatus('arrived');
            return; // Already arrived, stop tracking
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const watcher = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                const dist = getDistance(latitude, longitude, SALON_LAT, SALON_LNG);
                setDistance(dist);

                if (dist <= 500 && arrivalStatus !== 'arrived') {
                    try {
                        // Mark as arrived
                        await api.patch(`/tokens/${activeToken._id}/arrival`, { distance: dist });
                        setArrivalStatus('arrived');
                        toast.success("You've arrived! Auto check-in complete.");

                        if (socket) {
                            socket.emit('queue:arrived', { tokenId: activeToken._id, distance: dist });
                        }
                    } catch (err) {
                        console.error('Failed to update arrival status', err);
                    }
                }
            },
            (err) => {
                setError(err.message);
                console.error('Geolocation error:', err);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [activeToken, socket, arrivalStatus]);

    // Keep state in sync if activeToken parent state changes
    useEffect(() => {
        if (activeToken?.arrivalStatus === 'arrived') {
            setArrivalStatus('arrived');
        }
    }, [activeToken]);

    return { location, arrivalStatus, distance, error };
};
