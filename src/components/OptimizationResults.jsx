import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { optimizeCutList } from '../utils/packer';
import CutDiagram from './CutDiagram';
import { formatDimension } from '../utils/formatters';

export default function OptimizationResults() {
    const { state } = useProject();
    const [results, setResults] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Auto-update results when data changes (e.g. unit switch or part edits)
    // If we already have results, we want to keep them in sync rather than clearing them.
    useEffect(() => {
        // If data is cleared, ensure results are cleared so we don't auto-optimize on next load
        if (state.parts.length === 0 || state.stock.length === 0) {
            setResults(null);
            return;
        }

        // Only auto-update if we ALREADY have results (and data is valid)
        if (results) {
            try {
                const res = optimizeCutList(state.parts, state.stock, state.settings.kerf);
                setResults(res);
            } catch (e) {
                console.error("Auto-optimization failed", e);
            }
        }
    }, [state.parts, state.stock, state.settings.kerf]);

    const handleOptimize = () => {
        setIsOptimizing(true);
        // Timeout to allow UI update
        setTimeout(() => {
            try {
                const res = optimizeCutList(state.parts, state.stock, state.settings.kerf);
                setResults(res);
            } catch (e) {
                console.error(e);
                alert("Optimization failed");
            }
            setIsOptimizing(false);
        }, 100);
    };

    if (state.parts.length === 0 || state.stock.length === 0) {
        return (
            <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">Add parts and stock to generate cut list.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 self-start md:self-center">Cutting Diagrams</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                    {results && (() => {
                        let totalCost = 0;
                        results.forEach(res => {
                            if (res.bins) {
                                res.bins.forEach(bin => {
                                    if (bin.stock && bin.stock.cost) {
                                        const usedArea = bin.items.reduce((sum, i) => sum + (i.w * i.h), 0);
                                        const totalArea = bin.stock.length * bin.stock.width;
                                        if (totalArea > 0) {
                                            totalCost += (usedArea / totalArea) * bin.stock.cost;
                                        }
                                    }
                                });
                            }
                        });
                        return totalCost > 0 ? (
                            <div className="bg-brand-primary/10 px-4 py-2 rounded-md border border-brand-primary/20 w-full sm:w-auto text-center">
                                <span className="text-sm font-medium text-gray-600 mr-2">Est. Material Cost:</span>
                                <span className="text-xl font-bold text-brand-primary">${totalCost.toFixed(2)}</span>
                            </div>
                        ) : null;
                    })()}
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-6 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isOptimizing ? 'Optimizing...' : 'Generate Cut List'}
                    </button>
                </div>
            </div>

            {results && results.map(res => {
                const materialName = res.material || 'Unknown Material';

                if (res.error) {
                    return (
                        <div key={materialName} className="mb-8">
                            <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2 rounded">
                                {materialName}
                            </h3>
                            <div className="bg-amber-50 p-4 rounded border border-amber-200 text-amber-800">
                                ⚠️ {res.error}
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={materialName} className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 bg-gray-100 p-2 rounded">
                            {materialName}
                        </h3>

                        {res.bins && res.bins.map((bin, idx) => (
                            <CutDiagram
                                key={idx}
                                bin={bin}
                                materialColor="#A0522D"
                                unit={state.settings.unit}
                                offcuts={bin.offcuts}
                                highlightedPartId={state.highlightedPartId}
                                onPartHover={(id) => dispatch({ type: 'SET_HIGHLIGHTED_PART', payload: id })}
                            />
                        ))}

                        {res.unplaced && res.unplaced.length > 0 && (
                            <div className="bg-red-50 p-4 rounded border border-red-200 mt-4">
                                <h4 className="text-red-800 font-medium">Unplaced Parts (Insufficient Stock):</h4>
                                <ul className="list-disc pl-5 text-red-700 mt-2">
                                    {res.unplaced.map((p, i) => (
                                        <li key={i}>{p.name} ({formatDimension(p.length, state.settings.unit)} x {formatDimension(p.width, state.settings.unit)})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
