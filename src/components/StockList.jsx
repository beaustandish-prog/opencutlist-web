import { Trash2, Edit } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDimension } from '../utils/formatters';

export default function StockList() {
    const { state, dispatch } = useProject();

    if (state.stock.length === 0) return null;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-4 border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-brand-dark text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dimensions ({state.settings.unit})</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Material</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {state.stock.map((item) => (
                            <tr key={item.id} className={state.editingStock?.id === item.id ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDimension(item.length, state.settings.unit)} x {formatDimension(item.width, state.settings.unit)} x {formatDimension(item.thickness, state.settings.unit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.material || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.cost ? `$${parseFloat(item.cost).toFixed(2)}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => dispatch({ type: 'START_EDIT_STOCK', payload: item })}
                                        className="text-brand-primary hover:text-amber-800"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'DELETE_STOCK', payload: item.id })}
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
