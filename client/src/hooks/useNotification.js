import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

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
                applicationServerKey: urlBase64ToUint8Array(vpk)
            };

            const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);

            setSubscription(pushSubscription);

            await api.post('/notifications/subscribe', pushSubscription);

            toast.success('Push notifications enabled!');

        } catch (err) {
            console.error(err);
            toast.error(
                err?.message || 'Failed to enable push notifications'
            );
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