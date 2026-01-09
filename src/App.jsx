import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { LayoutGrid, Trash2, Save, FolderOpen, FileSpreadsheet, FileText } from 'lucide-react';
import { formatDimension } from './utils/formatters';
import { exportToCSV, exportToPDF } from './utils/exporters';
import PartInput from './components/PartInput';
import PartList from './components/PartList';
import StockInput from './components/StockInput';
import StockList from './components/StockList';
import OptimizationResults from './components/OptimizationResults';

function AppContent() {
  const { state, dispatch } = useProject();
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all parts and stock?')) {
      dispatch({ type: 'CLEAR_ALL' });
    }
  };

  const handleSaveProject = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cutlist_project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        // Basic validation
        if (Array.isArray(json.parts) && Array.isArray(json.stock)) {
          dispatch({ type: 'LOAD_PROJECT', payload: json });
        } else {
          alert("Invalid project file");
        }
      } catch (err) {
        console.error(err);
        alert("Error reading file");
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    };
    reader.readAsText(file);
  };
  return (
    <div className="min-h-screen bg-brand-light p-8 text-brand-text font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center bg-brand-dark text-white p-6 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OpenCutList Web</h1>
          <p className="text-gray-300 opacity-90">Free, open source cut list optimizer</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center justify-center md:justify-end gap-3">
          {/* Handle Kerf Display/Input */}
          <div className="flex items-center space-x-2 bg-brand-text/10 p-1 rounded-md border border-white/20">
            <label className="text-sm font-medium text-gray-200 pl-2">Kerf:</label>
            <input
              type="number"
              step={state.settings.unit === 'mm' ? "0.1" : "0.001"}
              className="w-20 text-sm bg-brand-dark border-gray-600 rounded text-white focus:ring-brand-primary focus:border-brand-primary"
              value={state.settings.unit === 'mm' ? state.settings.kerf : (state.settings.kerf / 25.4).toFixed(3)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) {
                  const mmValue = state.settings.unit === 'mm' ? val : val * 25.4;
                  dispatch({ type: 'SET_KERF', payload: mmValue });
                }
              }}
            />
          </div>

          <div className="bg-brand-text/10 rounded-md border border-white/20 p-1 flex">
            <button
              onClick={() => dispatch({ type: 'SET_UNIT', payload: 'inch' })}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${state.settings.unit === 'inch' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              Inch
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_UNIT', payload: 'mm' })}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${state.settings.unit === 'mm' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              MM
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            id="load-project-input"
            onChange={handleLoadProject}
          />
          <button
            onClick={() => exportToCSV(state)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary text-sm font-medium transition-colors"
            title="Export to CSV"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => exportToPDF(state)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary text-sm font-medium transition-colors"
            title="Export to PDF"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </button>
          <button
            onClick={handleSaveProject}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary text-sm font-medium transition-colors"
            title="Save current project data to a JSON file"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </button>
          <button
            onClick={() => document.getElementById('load-project-input').click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary text-sm font-medium transition-colors"
            title="Load project data from a JSON file"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Load
          </button>
          <button
            onClick={() => dispatch({ type: 'LOAD_EXAMPLE' })}
            className="bg-green-600 text-white border border-green-700 hover:bg-green-700 px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
            title="Populate with sample data"
          >
            Load Example
          </button>
          <button
            onClick={handleClearAll}
            className="bg-red-600 text-white border border-red-700 hover:bg-red-700 px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors"
            title="Remove all materials, stock, and parts"
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-text border-b border-gray-300 pb-2 flex items-center">
            <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full mr-2">1</span>
            Stock Inventory
            <span className="ml-3 text-xs font-normal text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">Start Here</span>
          </h2>
          <StockInput />
          <StockList />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-text border-b border-gray-300 pb-2 flex items-center">
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">2</span>
            Parts List
          </h2>
          <PartInput />
          <PartList />
        </div>
      </div>

      <OptimizationResults />
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;
