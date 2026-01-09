import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function MaterialManager() {
    const { state, dispatch } = useProject();
    const [newMaterial, setNewMaterial] = useState({
        name: '',
        type: 'sheet',
        thickness: '',
        color: '#3b82f6'
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMaterial.name || !newMaterial.thickness) return;

        dispatch({
            type: 'ADD_MATERIAL',
            payload: {
                ...newMaterial,
                id: uuidv4(),
                thickness: parseFloat(newMaterial.thickness)
            }
        });

        setNewMaterial({ name: '', type: 'sheet', thickness: '', color: '#3b82f6' });
    };

    return (
        <div className="bg-white p-4 rounded shadow mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Materials</h2>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    {isOpen ? 'Hide Manager' : 'Manage Materials'}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {state.materials.map(m => (
                    <div key={m.id} className="border rounded p-3 flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: m.color }}></div>
                        <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-gray-500">{m.type} • {m.thickness}mm</div>
                        </div>
                    </div>
                ))}
            </div>

            {isOpen && (
                <form onSubmit={handleSubmit} className="border-t pt-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newMaterial.name}
                            onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                            placeholder="New Material Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newMaterial.type}
                            onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}
                        >
                            <option value="sheet">Sheet Goods</option>
                            <option value="dimensional">Dimensional Lumber</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thickness (mm)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={newMaterial.thickness}
                            onChange={e => setNewMaterial({ ...newMaterial, thickness: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <input
                            type="color"
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm p-1"
                            value={newMaterial.color}
                            onChange={e => setNewMaterial({ ...newMaterial, color: e.target.value })}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Add Material
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
