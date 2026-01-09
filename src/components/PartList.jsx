import { Trash2, Edit } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDimension } from '../utils/formatters';

export default function PartList() {
    const { state, dispatch } = useProject();

    if (state.parts.length === 0) return null;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-4 border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-brand-dark text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dimensions ({state.settings.unit})</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Material</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {state.parts.map((part) => (
                            <tr
                                key={part.id}
                                className={`
                                    ${state.editingPart?.id === part.id ? 'bg-amber-50' : ''} 
                                    ${state.highlightedPartId === part.id ? 'bg-blue-50 ring-2 ring-blue-200 z-10 relative' : 'hover:bg-gray-50'}
                                    transition-colors duration-150
                                `}
                                onMouseEnter={() => dispatch({ type: 'SET_HIGHLIGHTED_PART', payload: part.id })}
                                onMouseLeave={() => dispatch({ type: 'SET_HIGHLIGHTED_PART', payload: null })}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDimension(part.length, state.settings.unit)} x {formatDimension(part.width, state.settings.unit)} x {formatDimension(part.thickness, state.settings.unit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {part.material || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => dispatch({ type: 'START_EDIT_PART', payload: part })}
                                        className="text-brand-primary hover:text-amber-800"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'DELETE_PART', payload: part.id })}
                                        className="text-gray-400 hover:text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
