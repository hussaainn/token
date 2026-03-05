import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError, fps = 10, qrbox = 250 }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            fps,
            qrbox,
            rememberLastUsedCamera: true,
            supportedScanTypes: [0] // 0 means only camera
        });

        scanner.render(onScanSuccess, onScanError);

        return () => {
            scanner.clear().catch(err => console.error('Failed to clear scanner', err));
        };
    }, []);

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            <div id="reader" ref={scannerRef}></div>
        </div>
    );
};

export default QRScanner;
