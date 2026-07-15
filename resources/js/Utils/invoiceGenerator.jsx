import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import InvoiceBody from '@/Components/Order/InvoiceBody';

/**
 * Generates and downloads a high-quality A4 PDF invoice for the given order.
 * Renders the InvoiceBody component offscreen, captures it via html2canvas,
 * and writes to a jsPDF instance.
 *
 * @param {Object} order
 * @returns {Promise<void>}
 */
export const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        if (!order) {
            return reject(new Error("No order data provided"));
        }

        const waitForImages = async (rootElement) => {
            const images = Array.from(rootElement.querySelectorAll('img'));
            if (images.length === 0) {
                return;
            }

            await Promise.all(
                images.map((image) => {
                    if (image.complete) {
                        return Promise.resolve();
                    }

                    return new Promise((resolveImage) => {
                        image.onload = () => resolveImage();
                        image.onerror = () => resolveImage();
                    });
                })
            );
        };

        // Create offscreen container within document layout viewport for canvas tracking
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '794px'; // standard A4 pixel width at 96 DPI
        container.style.zIndex = '-9999';
        container.style.pointerEvents = 'none';
        container.style.backgroundColor = '#ffffff';
        document.body.appendChild(container);

        try {
            const root = createRoot(container);
            root.render(<InvoiceBody order={order} isPDF={true} />);

            // Give a short timeout for rendering, then wait for images before capture
            setTimeout(() => {
                waitForImages(container)
                    .then(() => html2canvas(container, {
                        scale: 2.2,
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        logging: true,
                        x: 0,
                        y: 0,
                        scrollX: 0,
                        scrollY: 0,
                        windowWidth: 794,
                        windowHeight: container.scrollHeight || 1000
                    }))
                    .then((canvas) => {
                    const imgData = canvas.toDataURL('image/jpeg', 0.98);
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const imgWidth = 210; // A4 width in mm
                    const pageHeight = 295; // A4 height in mm
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    // Automatically paginate long orders
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }

                    // Format filename following user instructions
                    const orderNumber = order.order_number || String(order.id).padStart(4, '0');
                    const fileName = order.order_number 
                        ? `Invoice-ORDER-${order.order_number}.pdf`
                        : `Invoice-INV-${String(order.id).padStart(6, '0')}.pdf`;

                    pdf.save(fileName);
                    
                    // Cleanup DOM and React root context
                    root.unmount();
                    container.remove();
                    resolve();
                }).catch((err) => {
                    root.unmount();
                    container.remove();
                    reject(err);
                });
            }, 350); // wait 350ms for React root mounting and render tree compilation
        } catch (err) {
            container.remove();
            reject(err);
        }
    });
};
