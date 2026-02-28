import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const useGeoLocation = (activeTokenId) => {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [arrivalStatus, setArrivalStatus] = useState('unknown');
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);

    const updateLocationOnServer = useCallback(async (lat, lng) => {
        if (!activeTokenId) return;
        try {
            const res = await api.post('/geo/update', {
                tokenId: activeTokenId,
                lat,
                lng,
            });
            setArrivalStatus(res.data.arrivalStatus);
            setDistance(res.data.distance);

            if (res.data.arrivalStatus === 'arrived') {
                toast.success("You've arrived! Auto check-in complete.", { id: 'arrival-toast' });
            }
        } catch (err) {
            console.error('Failed to update location on server', err);
        }
    }, [activeTokenId]);

    useEffect(() => {
        if (!activeTokenId || !navigator.geolocation) return;

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                updateLocationOnServer(latitude, longitude);
            },
            (err) => {
                setError(err.message);
                console.error('Geolocation error:', err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [activeTokenId, updateLocationOnServer]);

    return { location, arrivalStatus, distance, error };
};
