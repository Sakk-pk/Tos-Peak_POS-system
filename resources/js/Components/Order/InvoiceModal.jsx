import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { X, Download, Printer } from 'lucide-react';
import InvoiceBody from '@/Components/Order/InvoiceBody';
import { generateInvoicePDF } from '@/Utils/invoiceGenerator';

export default function InvoiceModal({ show, onClose, order, autoDownload = false }) {
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (show && autoDownload && order) {
            handleDownload();
        }
    }, [show, autoDownload, order]);

    if (!order) return null;

    const handleDownload = () => {
        if (isDownloading) return;
        setIsDownloading(true);
        generateInvoicePDF(order)
            .then(() => {
                setIsDownloading(false);
                if (autoDownload) {
                    onClose();
                }
            })
            .catch((err) => {
                console.error("Download failed:", err);
                setIsDownloading(false);
                if (autoDownload) {
                    onClose();
                }
            });
    };

    const triggerPrint = () => {
        window.print();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg" className="overflow-visible">
            {/* Modal Controls (Not printed) */}
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-gray-50/50 px-6 py-4 print:hidden">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black font-display text-gray-400 uppercase tracking-widest">
                        Invoice Preview
                    </span>
                </div>
                <div className="flex items-center gap-2 select-none">
                    <button
                        onClick={triggerPrint}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-black/10 text-gray-500 hover:text-black transition shadow-sm active:scale-95 duration-200"
                        title="Print Invoice"
                    >
                        <Printer size={14} />
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-black/10 text-gray-500 hover:text-black disabled:opacity-50 transition shadow-sm active:scale-95 duration-200"
                        title="Download Invoice"
                    >
                        <Download size={14} className={isDownloading ? 'animate-bounce text-[#f97316]' : ''} />
                    </button>
                    <button
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-black/10 text-gray-500 hover:text-black transition shadow-sm active:scale-95 duration-200"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Print Styling Helper */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #modal, #modal *, #invoice-print-wrapper, #invoice-print-wrapper * {
                        visibility: visible !important;
                    }
                    #invoice-print-wrapper {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}} />

            {/* Invoice Printable Wrapper */}
            <div id="invoice-print-wrapper" className="max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
                <InvoiceBody order={order} />
            </div>
        </Modal>
    );
}
