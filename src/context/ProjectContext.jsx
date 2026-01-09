import React, { createContext, useContext, useReducer, useEffect } from 'react';

const ProjectContext = createContext();

const initialState = {
    parts: [],
    stock: [],
    editingPart: null,
    editingStock: null,
    settings: {
        unit: 'inch', // 'mm' or 'inch'
        kerf: 3.175, // blade thickness (0.125 inch)
    },
    highlightedPartId: null
};

// Helper to load from storage
const loadState = () => {
    try {
        const saved = localStorage.getItem('cutlist_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...initialState,
                ...parsed,
                // Ensure arrays are actually arrays (fix for potential nulls)
                parts: Array.isArray(parsed.parts) ? parsed.parts : initialState.parts,
                stock: Array.isArray(parsed.stock) ? parsed.stock : initialState.stock,
                settings: { ...initialState.settings, ...parsed.settings }
            };
        }
    } catch (e) {
        console.error("Failed to load local storage", e);
    }
    return initialState;
};

function projectReducer(state, action) {
    switch (action.type) {
        case 'ADD_PART':
            return { ...state, parts: [...state.parts, action.payload] };
        case 'UPDATE_PART':
            return { ...state, parts: state.parts.map(p => p.id === action.payload.id ? action.payload : p), editingPart: null };
        case 'DELETE_PART':
            return { ...state, parts: state.parts.filter(p => p.id !== action.payload) };
        case 'ADD_STOCK':
            return { ...state, stock: [...state.stock, action.payload] };
        case 'UPDATE_STOCK':
            return { ...state, stock: state.stock.map(s => s.id === action.payload.id ? action.payload : s), editingStock: null };
        case 'DELETE_STOCK':
            return { ...state, stock: state.stock.filter(s => s.id !== action.payload) };
        case 'START_EDIT_PART':
            return { ...state, editingPart: action.payload };
        case 'CANCEL_EDIT_PART':
            return { ...state, editingPart: null };
        case 'START_EDIT_STOCK':
            return { ...state, editingStock: action.payload };
        case 'CANCEL_EDIT_STOCK':
            return { ...state, editingStock: null };
        case 'SET_UNIT':
            return {
                ...state,
                settings: { ...state.settings, unit: action.payload }
            };
        case 'SET_KERF':
            return {
                ...state,
                settings: { ...state.settings, kerf: parseFloat(action.payload) }
            };
        case 'LOAD_EXAMPLE':
            return {
                ...state,
                stock: [
                    { id: 's1', name: 'Full Sheet', length: 2440, width: 1220, thickness: 19.05, quantity: 1, material: 'Birch Plywood', cost: 45.00 },
                    { id: 's2', name: 'Short Board', length: 1200, width: 150, thickness: 19.05, quantity: 2, material: 'Walnut', cost: 12.50 },
                ],
                parts: [
                    { id: 'p1', name: 'Cabinet Side', length: 762, width: 600, thickness: 19.05, quantity: 2, material: 'Birch Plywood' },
                    { id: 'p2', name: 'Cabinet Bottom', length: 762, width: 600, thickness: 19.05, quantity: 1, material: 'Birch Plywood' },
                    { id: 'p3', name: 'Shelf', length: 724, width: 580, thickness: 19.05, quantity: 3, material: 'Birch Plywood' },
                    { id: 'p4', name: 'Face Frame Stile', length: 762, width: 50, thickness: 19.05, quantity: 2, material: 'Walnut' },
                    { id: 'p5', name: 'Face Frame Rail', length: 662, width: 50, thickness: 19.05, quantity: 2, material: 'Walnut' },
                    { id: 'p6', name: 'Oversized Panel', length: 2500, width: 1300, thickness: 19.05, quantity: 1, material: 'Birch Plywood' },
                ]
            };
        case 'CLEAR_ALL':
            return {
                ...state,
                parts: [],
                stock: [],
                editingPart: null,
                editingStock: null
            };
        case 'SET_HIGHLIGHTED_PART':
            return {
                ...state,
                highlightedPartId: action.payload
            };
        case 'LOAD_PROJECT':
            const loaded = action.payload || {};
            return {
                ...initialState,
                ...loaded,
                parts: Array.isArray(loaded.parts) ? loaded.parts : [],
                stock: Array.isArray(loaded.stock) ? loaded.stock : [],
                settings: { ...initialState.settings, ...(loaded.settings || {}) },
                editingPart: null,
                editingStock: null,
                highlightedPartId: null
            };
        default:
            return state;
    }
}

export function ProjectProvider({ children }) {
    const [state, dispatch] = useReducer(projectReducer, null, loadState);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('cutlist_data', JSON.stringify(state));
    }, [state]);

    return (
        <ProjectContext.Provider value={{ state, dispatch }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    return useContext(ProjectContext);
}
