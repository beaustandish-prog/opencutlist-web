export class GuillotinePacker {
    constructor(binWidth, binHeight, kerf = 0) {
        this.binWidth = binWidth;
        this.binHeight = binHeight;
        this.kerf = kerf;
        this.freeRectangles = [{ x: 0, y: 0, w: binWidth, h: binHeight }];
        this.placedItems = [];
    }

    fit(items) {
        // Sort items by area descending (heuristic)
        // items should be clones so we don't mutate originals
        // items need: w, h, id

        for (let item of items) {
            let bestScore = Number.MAX_VALUE;
            let bestRect = null;
            let bestRIndex = -1;
            let rotated = false;

            // Find best free rectangle
            for (let i = 0; i < this.freeRectangles.length; i++) {
                const freeRect = this.freeRectangles[i];

                // Try normal orientation
                if (item.w <= freeRect.w && item.h <= freeRect.h) {
                    const score = this.score(freeRect, item.w, item.h);
                    if (score < bestScore) {
                        bestScore = score;
                        bestRect = freeRect;
                        bestRIndex = i;
                        rotated = false;
                    }
                }

                // Try rotated (if allowed - assume yes for now)
                if (item.h <= freeRect.w && item.w <= freeRect.h) {
                    const score = this.score(freeRect, item.h, item.w); // swap dims
                    if (score < bestScore) {
                        bestScore = score;
                        bestRect = freeRect;
                        bestRIndex = i;
                        rotated = true;
                    }
                }
            }

            if (bestRect) {
                this.placeItem(item, bestRect, bestRIndex, rotated);
            }
        }
    }

    score(freeRect, width, height) {
        // Best Area Fit (BAF)
        // Minimize leftover area
        return (freeRect.w * freeRect.h) - (width * height);
    }

    placeItem(item, freeRect, freeRectIndex, rotated) {
        const placedW = rotated ? item.h : item.w;
        const placedH = rotated ? item.w : item.h;

        // Record placement
        this.placedItems.push({
            ...item,
            x: freeRect.x,
            y: freeRect.y,
            w: placedW, // visual width
            h: placedH, // visual height
            rotated
        });

        const wWithKerf = placedW + this.kerf;
        const hWithKerf = placedH + this.kerf;

        // Split the free rectangle using Guillotine split (Split by shorter axis rule or similar)
        // Here we split horizontally then vertically (or configurable)

        // New free rectangles
        // R1: Right of the item
        const r1 = {
            x: freeRect.x + wWithKerf,
            y: freeRect.y,
            w: freeRect.w - wWithKerf,
            h: freeRect.h
        };

        // R2: Below the item (only effectively 'below' relative to the item, but full width of remaining?)
        // Actually guillotine creates only 2 new rects from the remaining L-shape? No.
        // Standard guillotine:
        // Split 1: Split across width (Vertical cut) -> Left piece (contains item), Right piece (Empty)
        // Split 2: Start from Left piece, split across height (Horizontal cut) -> Top piece (Item), Bottom piece (Empty)

        // We need to decide usage of space.
        // Let's maximize the specific free rects.

        // HEURISTIC: Minimize Short Side
        let splitHorizontal = true;
        if (freeRect.w < freeRect.h) splitHorizontal = false;

        // Actually let's assume specific split rule: Split by shorter axis (minimize the length of the cut)

        // Creating two new free rectangles taking into account kerf
        // If we place at top-left of freeRect:

        let newFreeRects = [];

        // Check if remaining width/height allows for new rects
        const rightDiff = freeRect.w - wWithKerf;
        let bottomDiff = freeRect.h - hWithKerf;

        if (rightDiff < 0) r1.w = 0; // Oversized?? shouldn't happen logic check
        if (bottomDiff < 0) bottomDiff = 0; // same

        // Split Horizontally (Cut vertical line first)
        // F1 to the right of item (Height = freeRect.h)
        // F2 below the item (Width = item.w)
        const rightRect = {
            x: freeRect.x + wWithKerf,
            y: freeRect.y,
            w: Math.max(0, freeRect.w - wWithKerf),
            h: freeRect.h
        };

        const bottomRect = {
            x: freeRect.x,
            y: freeRect.y + hWithKerf,
            w: placedW, // only width of item ? Or full width? Guillotine implies full cut?
            // If we make a vertical cut for the rightRect, then bottomRect is restricted to width of item.
            h: Math.max(0, freeRect.h - hWithKerf)
        };

        // Alternative Split (Cut horizontal line first)
        // F1 below item (Width = freeRect.w)
        // F2 right of item (Height = item.h)
        const bottomRectAlt = {
            x: freeRect.x,
            y: freeRect.y + hWithKerf,
            w: freeRect.w,
            h: Math.max(0, freeRect.h - hWithKerf)
        };
        const rightRectAlt = {
            x: freeRect.x + wWithKerf,
            y: freeRect.y,
            w: Math.max(0, freeRect.w - wWithKerf),
            h: placedH
        };

        // Choose heuristics
        // For now, let's pick simple: MAXimize Area of the larger free rect?
        // Usually standard is "Split Shorter Axis Leftover" (Minimize cut length)
        // or "Split Longer Axis Leftover"

        const useVerticalCutFirst = (rightRect.w * rightRect.h) > (bottomRectAlt.w * bottomRectAlt.h);
        // Actually, usually we want to keep the "Longer" dimension or "Larger Area" intact. 

        if (useVerticalCutFirst) {
            if (rightRect.w > 0 && rightRect.h > 0) newFreeRects.push(rightRect);
            if (bottomRect.w > 0 && bottomRect.h > 0) newFreeRects.push(bottomRect);
        } else {
            if (bottomRectAlt.w > 0 && bottomRectAlt.h > 0) newFreeRects.push(bottomRectAlt);
            if (rightRectAlt.w > 0 && rightRectAlt.h > 0) newFreeRects.push(rightRectAlt);
        }

        // Remove used freeRect, add new ones
        this.freeRectangles.splice(freeRectIndex, 1);
        this.freeRectangles.push(...newFreeRects);

        // Merge? Not strictly required for basic packing but improves efficiency.
        // We skip merging for simplicity in v1.
    }
}

export function optimizeCutList(parts, stockList, kerf = 0) {
    // 1. Group parts by material
    // 2. For each material, get available stock
    // 3. Pack parts into stock

    const results = [];

    // Group items by material
    const partsByMaterial = parts.reduce((acc, part) => {
        // Normalize material name? Case insensitive? For now strict
        const mat = part.material || 'Unknown';
        if (!acc[mat]) acc[mat] = [];
        acc[mat].push(part);
        return acc;
    }, {});

    for (const [material, materialParts] of Object.entries(partsByMaterial)) {
        const materialStock = stockList.filter(s => (s.material || 'Unknown') === material);

        if (!materialStock.length) {
            results.push({ material, error: 'No stock available' });
            continue;
        }

        // Flatten quantity for parts
        let itemsToPack = [];
        materialParts.forEach(p => {
            for (let i = 0; i < p.quantity; i++) {
                itemsToPack.push({
                    ...p,
                    id: `${p.id}_${i}`,
                    originalId: p.id,
                    w: p.length, // Map length to w (horizontal)
                    h: p.width   // Map width to h (vertical)
                });
            }
        });

        itemsToPack.sort((a, b) => (b.length * b.width) - (a.length * a.width)); // Sort Area Desc

        const placedBins = [];
        let unpackedItems = [...itemsToPack];

        // Simple First Fit Descending Strategy with multiple bins
        // We iterate through available stock types. For simplicity, we just keep adding "best" stock board 
        // that fits most items? Or just iterate stock inventory?
        // If finite stock:

        // Create full list of available stock items (flatten quantity)
        let availableStock = [];
        materialStock.forEach(s => {
            for (let i = 0; i < s.quantity; i++) {
                availableStock.push({ ...s, id: `${s.id}_${i}` });
            }
        });

        // Sort stock by area desc (heuristic: use biggest pieces first)
        availableStock.sort((a, b) => (b.length * b.width) - (a.length * a.width));

        for (const stockPiece of availableStock) {
            if (unpackedItems.length === 0) break;

            // Create packer for this stock piece
            // Pass allowRotation = !grainDirection (default true if grainDirection false/undefined)
            const packer = new GuillotinePacker(
                stockPiece.length,
                stockPiece.width,
                kerf
            );

            // Try to fit current unpacked items
            packer.fit(unpackedItems);

            if (packer.placedItems.length > 0) {
                // Determine which items were actually placed
                const placedItemIds = new Set(packer.placedItems.map(i => i.id));

                // Identify remaining items
                const remaining = unpackedItems.filter(i => !placedItemIds.has(i.id));

                // Push this single bin result
                placedBins.push({
                    stock: stockPiece,
                    items: packer.placedItems,
                    offcuts: packer.freeRectangles, // Expose remaining free space
                    imperfect: remaining.length > 0,
                    waste: (stockPiece.length * stockPiece.width) - packer.placedItems.reduce((sum, i) => sum + (i.w * i.h), 0)
                });

                // Update unpackedItems for next iteration
                unpackedItems = remaining;
            }
        }

        results.push({
            material,
            bins: placedBins,
            unplaced: unpackedItems
        });
    }

    return results;
}
