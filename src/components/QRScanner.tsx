
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Safety check to prevent double initialization in React Strict Mode
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    onScanSuccess(decodedText);
                    scanner.clear(); // Stop scanning after success
                },
                (error) => {
                    if (onScanFailure) onScanFailure(error);
                }
            );
            scannerRef.current = scanner;
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/20">
            <div id="reader" className="bg-black"></div>
        </div>
    );
};

export default QRScanner;
