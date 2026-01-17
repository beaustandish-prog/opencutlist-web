import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function PartInput() {
    const { state, dispatch } = useProject();
    const [part, setPart] = useState({
        name: '',
        length: '',
        width: '',
        thickness: '',
        quantity: 1,
        material: ''
    });

    useEffect(() => {
        if (state.editingPart) {
            const isMetric = state.settings.unit === 'mm' || state.settings.unit === 'cm';
            let factor = 1;
            if (state.settings.unit === 'inch') factor = 1 / 25.4;
            else if (state.settings.unit === 'cm') factor = 0.1;

            setPart({
                ...state.editingPart,
                length: (state.editingPart.length * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                width: (state.editingPart.width * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                thickness: (state.editingPart.thickness * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                material: state.editingPart.material || ''
            });
        } else if (state.parts.length === 0) {
            // "Clear All" was likely pressed
            setPart({
                name: '',
                length: '',
                width: '',
                thickness: '',
                quantity: 1,
                material: ''
            });
        }
    }, [state.editingPart, state.settings.unit, (state.parts || []).length]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!part.name || !part.length || !part.width || !part.thickness || !part.material) {
            alert("Please fill in all fields (Name, Dimensions, Quantity, Material).");
            return;
        }

        let factor = 1;
        if (state.settings.unit === 'inch') factor = 25.4;
        else if (state.settings.unit === 'cm') factor = 10;

        const payload = {
            ...part,
            id: state.editingPart ? state.editingPart.id : uuidv4(),
            length: parseFloat(part.length) * factor,
            width: parseFloat(part.width) * factor,
            thickness: parseFloat(part.thickness) * factor,
            quantity: parseInt(part.quantity)
        };

        if (state.editingPart) {
            dispatch({ type: 'UPDATE_PART', payload });
        } else {
            dispatch({ type: 'ADD_PART', payload });
        }

        setPart({ name: '', length: '', width: '', thickness: '', quantity: 1, material: part.material });
    };

    const handleCancel = () => {
        dispatch({ type: 'CANCEL_EDIT_PART' });
        setPart({ name: '', length: '', width: '', thickness: '', quantity: 1, material: part.material });
    };

    // Extract unique material names from stock for autocomplete
    const stockMaterials = [...new Set((state.stock || []).map(s => s.material).filter(Boolean))];

    return (
        <div className="bg-white p-4 rounded shadow-md border border-gray-100 mb-4">
            <h3 className="text-lg font-bold mb-2 text-brand-dark">Add / Edit Part</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.name}
                        onChange={e => setPart({ ...part, name: e.target.value })}
                        placeholder="e.g. Side Panel"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Length ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.length}
                        onChange={e => setPart({ ...part, length: e.target.value })}
                        placeholder="e.g. 30"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Width ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.width}
                        onChange={e => setPart({ ...part, width: e.target.value })}
                        placeholder="e.g. 20"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Thickness ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.thickness}
                        onChange={e => setPart({ ...part, thickness: e.target.value })}
                        placeholder="e.g. 0.75"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.quantity}
                        onChange={e => setPart({ ...part, quantity: e.target.value })}
                        placeholder="e.g. 1"
                    />
                </div>
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">Material Name</label>
                    <input
                        type="text"
                        list="stock-materials"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={part.material}
                        onChange={e => setPart({ ...part, material: e.target.value })}
                        placeholder="e.g. Plywood"
                        autoComplete="off"
                    />
                    <datalist id="stock-materials">
                        {stockMaterials.map((mat, idx) => (
                            <option key={idx} value={mat} />
                        ))}
                    </datalist>
                </div>
                <div className="md:col-span-1 flex space-x-2">
                    <button
                        type="submit"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${state.editingPart ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                    >
                        {state.editingPart ? 'Update' : 'Add'}
                    </button>
                    {state.editingPart && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
