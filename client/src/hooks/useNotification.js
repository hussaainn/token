import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const useNotification = () => {
    const [subscription, setSubscription] = useState(null);
    const [permission, setPermission] = useState(Notification.permission);

    const subscribeUser = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            const vpk = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vpk) {
                console.warn('VAPID public key not found');
                return;
            }

            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: vpk
            };

            const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
            setSubscription(pushSubscription);

            // Send subscription to server
            await api.post('/notifications/subscribe', pushSubscription);
            toast.success('Push notifications enabled!');
        } catch (err) {
            console.error('Failed to subscribe user:', err);
            toast.error('Failed to enable push notifications');
        }
    };

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            subscribeUser();
        }
    };

    return { permission, requestPermission, subscription };
};
