import React from 'react';

import { formatDimension } from '../utils/formatters';

export default function CutDiagram({ bin, materialColor, unit, offcuts, highlightedPartId, onPartHover }) {
    // bin contains: stock (dimensions), items (placed items with x, y, w, h)
    const scale = 800 / Math.max(bin.stock.length, bin.stock.width); // Scale to fit width/container
    const width = bin.stock.length * scale; // Visualization usually length horizontal
    const height = bin.stock.width * scale;

    // Filter usable offcuts (e.g. at least 10x10 or 100 area)
    const usableOffcuts = (bin.offcuts || []).filter(o => o.w * o.h > 50 && Math.min(o.w, o.h) > 2);

    return (
        <div className="mb-6">
            <div className="text-sm font-medium mb-1">
                Stock: {bin.stock.name} ({formatDimension(bin.stock.length, unit)} x {formatDimension(bin.stock.width, unit)})
                <span className="ml-4 text-gray-500">Waste: {((bin.waste / (bin.stock.length * bin.stock.width)) * 100).toFixed(1)}%</span>
            </div>
            <div style={{ overflow: 'auto' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#f0f0f0', border: '1px solid #ccc' }}>
                    {/* Stock Background */}
                    <rect x={0} y={0} width={width} height={height} fill="#e5e5e5" />

                    {/* Offcuts Visualization (darker gray) */}
                    {usableOffcuts.map((item, idx) => (
                        <rect
                            key={`off-${idx}`}
                            x={item.x * scale}
                            y={item.y * scale}
                            width={item.w * scale}
                            height={item.h * scale}
                            fill="#d4d4d4"
                            stroke="#a3a3a3"
                            strokeWidth="1"
                            strokeDasharray="4"
                        >
                            <title>Offcut: {formatDimension(item.w, unit)} x {formatDimension(item.h, unit)}</title>
                        </rect>
                    ))}

                    {/* Placed Items */}
                    {bin.items.map((item, idx) => {
                        const isHighlighted = highlightedPartId === item.originalId;
                        return (
                            <g
                                key={idx}
                                transform={`translate(${item.x * scale}, ${item.y * scale})`}
                                onMouseEnter={() => onPartHover && onPartHover(item.originalId)}
                                onMouseLeave={() => onPartHover && onPartHover(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                <rect
                                    width={item.w * scale}
                                    height={item.h * scale}
                                    fill={isHighlighted ? '#2563eb' : (materialColor || '#3b82f6')}
                                    stroke={isHighlighted ? '#1e40af' : '#fff'}
                                    strokeWidth={isHighlighted ? '2' : '1'}
                                    opacity={isHighlighted ? '1' : '0.9'}
                                    className="transition-colors duration-150"
                                />
                                {/* Only show label if the part is big enough */}
                                {item.w * scale > 30 && item.h * scale > 20 && (
                                    <>
                                        <text
                                            x={(item.w * scale) / 2}
                                            y={(item.h * scale) / 2 - 8}
                                            fontSize="14"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            fill="#fff"
                                            dominantBaseline="middle"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {item.name}
                                        </text>
                                        <text
                                            x={(item.w * scale) / 2}
                                            y={(item.h * scale) / 2 + 8}
                                            fontSize="11"
                                            textAnchor="middle"
                                            fill="#fff"
                                            dominantBaseline="middle"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {formatDimension(item.length, unit)} x {formatDimension(item.width, unit)}
                                        </text>
                                    </>
                                )}
                                <title>{item.name} ({formatDimension(item.length, unit)} x {formatDimension(item.width, unit)})</title>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Offcut List */}
            {usableOffcuts.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                    <span className="font-semibold">Usable Offcuts: </span>
                    {usableOffcuts.map((o, i) => (
                        <span key={i} className="inline-block bg-gray-200 rounded px-2 py-1 mr-2 mb-1">
                            {formatDimension(o.w, unit)} x {formatDimension(o.h, unit)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
