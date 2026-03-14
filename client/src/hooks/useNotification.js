import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

<<<<<<< HEAD
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
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
<<<<<<< HEAD

=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
            if (!vpk) {
                console.warn('VAPID public key not found');
                return;
            }

            const subscribeOptions = {
                userVisibleOnly: true,
<<<<<<< HEAD
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
=======
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
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
        }
    };

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
<<<<<<< HEAD

=======
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
        if (result === 'granted') {
            subscribeUser();
        }
    };

    return { permission, requestPermission, subscription };
<<<<<<< HEAD
};
=======
};
>>>>>>> df36bf6cc73aa31f12c1ca87b2e06d5d17eb4f1f
