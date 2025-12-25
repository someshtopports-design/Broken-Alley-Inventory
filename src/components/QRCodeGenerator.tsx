
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';

interface QRCodeGeneratorProps {
    value: string;
    label: string;
    size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ value, label, size = 120 }) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                onClick={() => handlePrint()}
                className="text-[10px] uppercase font-black tracking-widest text-lime-400 hover:text-white transition-colors flex items-center gap-2"
            >
                <i className="fa-solid fa-print"></i> Print
            </button>

            <div ref={componentRef} className="bg-white p-4 rounded-xl items-center justify-center flex flex-col w-[150px] h-[190px]">
                <h4 className="text-black font-black text-[10px] uppercase mb-1 text-center leading-none">{label}</h4>
                <QRCodeSVG value={value} size={size} level="H" />
                <p className="text-black text-[8px] font-mono mt-1 text-center break-all">{value}</p>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
