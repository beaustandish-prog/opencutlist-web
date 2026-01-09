/**
 * @typedef {Object} Material
 * @property {string} id
 * @property {string} name
 * @property {string} type - 'solid', 'sheet', 'dimensional'
 * @property {number} thickness - in mm or inch
 * @property {string} color - for visualization
 */

/**
 * @typedef {Object} Part
 * @property {string} id
 * @property {string} name
 * @property {number} length
 * @property {number} width
 * @property {number} quantity
 * @property {string} materialId
 * @property {boolean} grainDirection - true if grain follows length
 */

/**
 * @typedef {Object} Stock
 * @property {string} id
 * @property {string} name
 * @property {number} length
 * @property {number} width
 * @property {number} quantity
 * @property {string} materialId
 */

export const INITIAL_MATERIALS = [
    { id: 'm1', name: 'Plywood 3/4"', type: 'sheet', thickness: 19.05, color: '#eab308' },
    { id: 'm2', name: 'Oak 1x4', type: 'dimensional', thickness: 19.05, color: '#a16207' },
];
