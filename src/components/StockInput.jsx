import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function StockInput() {
    const { state, dispatch } = useProject();
    const [stock, setStock] = useState({
        name: '',
        length: '',
        width: '',
        thickness: '',
        quantity: 1,
        material: '',
        cost: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state.editingStock) {
            const isMetric = state.settings.unit === 'mm' || state.settings.unit === 'cm';
            let factor = 1;
            if (state.settings.unit === 'inch') factor = 1 / 25.4;
            else if (state.settings.unit === 'cm') factor = 0.1;

            setStock({
                ...state.editingStock,
                length: (state.editingStock.length * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                width: (state.editingStock.width * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                thickness: (state.editingStock.thickness * factor).toFixed(state.settings.unit === 'inch' ? 3 : (state.settings.unit === 'cm' ? 2 : 1)),
                material: state.editingStock.material || '',
                cost: state.editingStock.cost || ''
            });
        } else if (state.stock.length === 0) {
            // "Clear All" was likely pressed, reset form including sticky fields
            setStock({
                name: '',
                length: '',
                width: '',
                thickness: '',
                quantity: 1,
                material: '',
                cost: ''
            });
        }
    }, [state.editingStock, state.settings.unit, (state.stock || []).length]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation check
        if (!stock.length || !stock.width || !stock.thickness || !stock.material) {
            alert("Please fill in all required fields (Dimensions, Quantity, Material).");
            return;
        }

        let factor = 1;
        if (state.settings.unit === 'inch') factor = 25.4;
        else if (state.settings.unit === 'cm') factor = 10;

        const payload = {
            ...stock,
            id: state.editingStock ? state.editingStock.id : uuidv4(),
            name: stock.name || 'Stock',
            length: parseFloat(stock.length) * factor,
            width: parseFloat(stock.width) * factor,
            thickness: parseFloat(stock.thickness) * factor,
            quantity: parseInt(stock.quantity),
            cost: parseFloat(stock.cost) || 0
        };

        if (state.editingStock) {
            dispatch({ type: 'UPDATE_STOCK', payload });
        } else {
            dispatch({ type: 'ADD_STOCK', payload });
            // Show feedback only on new add
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }

        setStock({ name: '', length: '', width: '', thickness: '', quantity: 1, material: stock.material, cost: stock.cost });
    };

    const handleCancel = () => {
        dispatch({ type: 'CANCEL_EDIT_STOCK' });
        setStock({ name: '', length: '', width: '', thickness: '', quantity: 1, material: stock.material, cost: '' });
    };

    return (
        <div className="bg-white p-4 rounded shadow-md border border-gray-100 mb-4">
            <h3 className="text-lg font-bold mb-2 text-brand-dark">Add / Edit Stock</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Label (Optional)</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={stock.name}
                        onChange={e => setStock({ ...stock, name: e.target.value })}
                        placeholder="e.g. Offcut"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Length ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={stock.length}
                        onChange={e => setStock({ ...stock, length: e.target.value })}
                        placeholder="e.g. 96"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Width ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={stock.width}
                        onChange={e => setStock({ ...stock, width: e.target.value })}
                        placeholder="e.g. 48"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Thickness ({state.settings.unit})</label>
                    <input
                        type="number"
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={stock.thickness}
                        onChange={e => setStock({ ...stock, thickness: e.target.value })}
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
                        value={stock.quantity}
                        onChange={e => setStock({ ...stock, quantity: e.target.value })}
                        placeholder="e.g. 1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Material Name</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                        value={stock.material}
                        onChange={e => setStock({ ...stock, material: e.target.value })}
                        placeholder="e.g. Plywood"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cost (Each)</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm border p-2"
                            value={stock.cost}
                            onChange={e => setStock({ ...stock, cost: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="md:col-span-1 flex space-x-2">
                    <button
                        type="submit"
                        className={`w-full inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${state.editingStock ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                    >
                        {state.editingStock ? 'Update' : 'Add'}
                    </button>
                    {state.editingStock && (
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
            {showSuccess && (
                <div className="fixed top-20 right-4 z-50 w-full max-w-md animate-bounce-in">
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-2xl mx-4 md:mx-0 flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold text-green-800">Stock Added!</h3>
                            <div className="mt-1 text-base text-green-700">
                                <p>Great! You can now move to <br /><strong className="underline decoration-2 underline-offset-2">Step 2: Parts List</strong> if you are done adding stock</p>
                            </div>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="text-green-500 hover:text-green-700 focus:outline-none"
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
