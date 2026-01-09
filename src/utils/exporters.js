import jsPDF from 'jspdf';
import { optimizeCutList } from './packer';
import { formatDimension } from './formatters';

/**
 * Export parts and stock to a CSV file
 * @param {Object} state - Project state containing parts and stock
 */
export const exportToCSV = (state) => {
    const unit = state.settings.unit;
    const partsHeader = `Type,Name,Length (${unit}),Width (${unit}),Thickness (${unit}),Quantity,Material,Cost\n`;

    const partsRows = state.parts.map(p =>
        `Part,${JSON.stringify(p.name)},"${formatDimension(p.length, unit)}","${formatDimension(p.width, unit)}","${formatDimension(p.thickness, unit)}",${p.quantity},${JSON.stringify(p.material)},""`
    ).join("\n");

    const stockRows = state.stock.map(s =>
        `Stock,${JSON.stringify(s.name)},"${formatDimension(s.length, unit)}","${formatDimension(s.width, unit)}","${formatDimension(s.thickness, unit)}",${s.quantity},${JSON.stringify(s.material)},${s.cost}`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,"
        + partsHeader
        + partsRows + "\n"
        + stockRows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cutlist_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export the project to a vector PDF
 * @param {Object} state - The full project state
 */
export const exportToPDF = (state) => {
    // 1. Initialize PDF
    // Landscape A4: 297mm x 210mm
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    let currentY = margin;
    const unit = state.settings.unit;

    // --- Helper: Add Text ---
    const addText = (text, x, y, size = 10, style = 'normal', align = 'left', color = null) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        if (color) doc.setTextColor(color[0], color[1], color[2]);
        else doc.setTextColor(0, 0, 0);
        doc.text(text, x, y, { align });
    };

    // --- Page 1: Summary & Lists ---
    addText("OpenCutList Export", margin, currentY, 18, 'bold');
    currentY += 8;
    addText(`Date: ${new Date().toLocaleDateString()}`, margin, currentY, 10);
    currentY += 10;

    // Stock List Table
    addText("Stock Inventory", margin, currentY, 12, 'bold');
    currentY += 6;
    doc.setLineWidth(0.1);
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, currentY, pageWidth - margin, currentY); // Header line
    currentY += 5;

    // Header Row
    addText("Name", margin, currentY, 9, 'bold');
    addText(`Dims (${unit})`, margin + 60, currentY, 9, 'bold');
    addText("Qty", margin + 110, currentY, 9, 'bold');
    addText("Material", margin + 130, currentY, 9, 'bold');
    currentY += 2;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Data Rows
    state.stock.forEach(s => {
        addText(s.name, margin, currentY, 9);
        addText(`${formatDimension(s.length, unit)} x ${formatDimension(s.width, unit)} x ${formatDimension(s.thickness, unit)}`, margin + 60, currentY, 9);
        addText(s.quantity.toString(), margin + 110, currentY, 9);
        addText(s.material, margin + 130, currentY, 9);
        currentY += 5;
    });
    currentY += 10;

    // Parts List Table
    addText("Parts List", margin, currentY, 12, 'bold');
    currentY += 6;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Header Row
    addText("Name", margin, currentY, 9, 'bold');
    addText(`Dims (${unit})`, margin + 60, currentY, 9, 'bold');
    addText("Qty", margin + 110, currentY, 9, 'bold');
    addText("Material", margin + 130, currentY, 9, 'bold');
    currentY += 2;
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    // Data Rows
    state.parts.forEach(p => {
        if (currentY > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
        }
        addText(p.name, margin, currentY, 9);
        addText(`${formatDimension(p.length, unit)} x ${formatDimension(p.width, unit)} x ${formatDimension(p.thickness, unit)}`, margin + 60, currentY, 9);
        addText(p.quantity.toString(), margin + 110, currentY, 9);
        addText(p.material, margin + 130, currentY, 9);
        currentY += 5;
    });

    // --- Cut Diagrams ---
    // Pre-process safe numbers for sorting/optimizing
    // We clone the arrays to avoid mutating state
    const safeParts = state.parts.map(p => ({
        ...p,
        length: parseFloat(p.length),
        width: parseFloat(p.width),
        thickness: parseFloat(p.thickness),
        quantity: parseInt(p.quantity, 10)
    }));

    const safeStock = state.stock.map(s => ({
        ...s,
        length: parseFloat(s.length),
        width: parseFloat(s.width),
        thickness: parseFloat(s.thickness),
        quantity: parseInt(s.quantity, 10)
    }));

    const safeKerf = parseFloat(state.settings.kerf) || 0;

    const results = optimizeCutList(safeParts, safeStock, safeKerf);

    results.forEach(matResult => {
        matResult.bins.forEach((bin, binIndex) => {
            doc.addPage();
            currentY = margin;

            // Title
            const wastePct = ((bin.waste / (bin.stock.length * bin.stock.width)) * 100).toFixed(1);
            addText(`Material: ${matResult.material} - Bin ${binIndex + 1} (${bin.stock.name})`, margin, currentY, 12, 'bold');
            addText(`Stock: ${formatDimension(bin.stock.length, unit)} x ${formatDimension(bin.stock.width, unit)} - Waste: ${wastePct}%`, pageWidth - margin, currentY, 10, 'normal', 'right');
            currentY += 10;

            // Draw Diagram
            // Available area
            const maxDrawWidth = pageWidth - (margin * 2);
            const maxDrawHeight = pageHeight - currentY - margin;

            // Calculate Scale
            // fit stock into maxDrawWidth/Height
            const scaleX = maxDrawWidth / bin.stock.length;
            const scaleY = maxDrawHeight / bin.stock.width;
            const scale = Math.min(scaleX, scaleY);

            // Origin
            const originX = margin;
            const originY = currentY;

            // Draw Stock Boundary
            doc.setDrawColor(200, 200, 200); // Light gray stroke
            doc.setFillColor(229, 229, 229); // #e5e5e5 (GUI Stock Color)
            doc.rect(
                originX,
                originY,
                bin.stock.length * scale,
                bin.stock.width * scale,
                'FD' // Fill and Stroke
            );

            // Draw Parts
            // GUI uses #A0522D (Sienna)
            // RGB for #A0522D is 160, 82, 45
            // Note: We MUST set colors inside the loop because doc.setTextColor (called for labels)
            // changes the active fill color state in PDF, which would make subsequent rects white!

            bin.items.forEach(part => {
                // RESET STATE FOR EVERY RECTANGLE
                doc.setDrawColor(255, 255, 255); // White stroke
                doc.setFillColor(160, 82, 45); // Sienna fill
                doc.setLineWidth(0.3);

                const px = originX + (part.x * scale);
                const py = originY + (part.y * scale);
                const pw = part.w * scale;
                const ph = part.h * scale;

                doc.rect(px, py, pw, ph, 'FD');

                // Label - try to fit text
                // Only show if reasonably large
                if (pw > 15 && ph > 10) {

                    // Name
                    // Auto-scale font based on height, max 10pt
                    const nameFontSize = Math.min(10, ph / 3);

                    const text = part.name;
                    doc.setFontSize(nameFontSize);
                    doc.setFont('helvetica', 'bold');
                    const textWidth = doc.getTextWidth(text);

                    // Center X,Y
                    const centerX = px + (pw / 2);
                    const centerY = py + (ph / 2);

                    // If text fits, draw name
                    if (textWidth < pw - 2) {
                        // This helper calls setTextColor, which changes the fill state!
                        addText(text, centerX, centerY - (nameFontSize / 2) + 1, nameFontSize, 'bold', 'center', [255, 255, 255]);
                    }

                    // Dims (below name)
                    // Use formatDimension to match GUI (fractional inches etc)
                    const dimText = `${formatDimension(part.w, unit)} x ${formatDimension(part.h, unit)}`;
                    const dimFontSize = Math.max(6, nameFontSize - 2);
                    doc.setFontSize(dimFontSize);
                    doc.setFont('helvetica', 'normal');

                    const dimWidth = doc.getTextWidth(dimText);
                    if (dimWidth < pw - 2 && ph > (nameFontSize + dimFontSize + 4)) {
                        addText(dimText, centerX, centerY + (dimFontSize / 2) + 2, dimFontSize, 'normal', 'center', [255, 255, 255]);
                    }
                }
            });

            // Draw Offcuts
            // GUI: fill #d4d4d4 (212, 212, 212), stroke #a3a3a3 (163, 163, 163)
            doc.setLineDashPattern([2, 2], 0); // Dashed

            bin.offcuts.forEach(offcut => {
                // RESET STATE FOR EVERY RECTANGLE
                doc.setDrawColor(163, 163, 163);
                doc.setFillColor(212, 212, 212);
                doc.setLineWidth(0.1);

                const ox = originX + (offcut.x * scale);
                const oy = originY + (offcut.y * scale);
                const ow = offcut.w * scale;
                const oh = offcut.h * scale;

                // Only draw significant offcuts
                if (ow > 10 && oh > 10) {
                    doc.rect(ox, oy, ow, oh, 'FD');

                    // Label
                    if (ow > 20 && oh > 10) {
                        const label = `${formatDimension(offcut.w, unit)} x ${formatDimension(offcut.h, unit)}`;
                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'normal');
                        const labelW = doc.getTextWidth(label);
                        if (labelW < ow) {
                            addText(label, ox + (ow / 2), oy + (oh / 2), 7, 'normal', 'center', [100, 100, 100]);
                        }
                    }
                }
            });

            // Reset state
            doc.setLineDashPattern([], 0);
            doc.setTextColor(0);
        });
    });

    doc.save("cutlist_plan.pdf");
};
