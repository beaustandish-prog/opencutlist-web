# GrainGuard Application Technical Specification

## 1. Executive Summary
**GrainGuard** is a professional lumber optimization tool designed for woodworkers to calculate cut lists and estimate material costs. This document outlines the technical specifications required to recreate the application, matching its original design and functionality as observed in the legacy build artifacts (`index.html`, `counter.js`, `grainguard.css`).

## 2. Technology Stack
*   **Framework**: React (reconstructed from static build analysis).
*   **Build Tool**: Vite.
*   **Styling**: Tailwind CSS.
*   **Icons**: Lucide React.
*   **Fonts**: Inter (Google Fonts).

## 3. UI/UX Specification

### 3.1. Design System
*   **Color Palette**:
    *   **Primary Background**: `bg-slate-50` (#f8fafc).
    *   **Surface**: `bg-white` (#ffffff).
    *   **Text Primary**: `text-slate-800` (#1e293b).
    *   **Text Secondary**: `text-slate-500` (#64748b).
    *   **Inputs**: `bg-slate-50`, `border-slate-200`.
    *   **Accents**:
        *   **Stock Section**: Blue theme (`bg-blue-500` dot, `focus:ring-blue-500`).
        *   **Part Section**: Orange theme (`bg-orange-500` dot, `focus:ring-orange-500`).
    *   **Buttons**:
        *   **Add Stock**: Dark (`bg-slate-900` hover `bg-slate-800`).
        *   **Add Part**: Orange (`bg-orange-600` hover `bg-orange-700`).
        *   **Reset**: Bright Green (`#66ff00`), Text Black.
        *   **Generate**: Blue (`bg-blue-600`).

*   **Typography**:
    *   Font Family: **Inter** (`sans-serif`).
    *   Headers: Semibold/Bold.
    *   Input Labels: Uppercase, tracking-wide, text-xs, font-semibold.

### 3.2. Layout Structure
*   **Header**:
    *   Logo: Hammer icon (Orange) + Title "GrainGuard".
    *   Subtitle: "Precision Lumber Optimization".
    *   Right Side:
        *   Counter: "Number of Projects Planned: 1,234" (Static).
        *   Reset Button: Green, icon `RotateCcw`.

*   **Main Content** (Two-Column Layout on Desktop):
    *   **Left Column**:
        *   **Stock Inventory Form**:
            *   Header: "Stock Inventory" with `Package` icon.
            *   Fields: Species, Length, Width, Thick, Qty, Cost.
            *   Action: "Add Stock" button.
        *   **Settings**:
            *   Blade Kerf input.
            *   Measurement System toggle (Imperial/Metric).
    *   **Right Column**:
        *   **Project Parts Form**:
            *   Header: "Project Parts" with `Layers` icon.
            *   Fields: Part Name, Species (Optional), Qty, Length, Width, Thick.
            *   Action: "Add Part" button.

*   **Lists**:
    *   Displayed below forms (or dynamically).
    *   Tables with specific styling:
        *   Header Background: `#eff6ff` (Light Blue).
        *   Header Text: `text-slate-700 font-semibold`.
        *   Columns: Species/Name, Dimensions, Qty, Cost/Action.
        *   Actions: Edit (Blue/Orange), Delete (Red).

## 4. Functional Requirements

### 4.1. Core Features
1.  **Stock Inventory Management**:
    *   User can add lumber stock with dimensions and cost.
    *   Inputs: Species (Text), Length (Number), Width (Number), Thick (Number), Qty (Int), Cost (Float).
    *   List view shows added stock.
2.  **Project Parts Management**:
    *   User can add required parts for a project.
    *   Inputs: Name (Text), Species (Text), Length (Number), Width (Number), Thick (Number), Qty (Int).
    *   List view shows added parts.
3.  **Settings**:
    *   **Blade Kerf**: Defines material lost during cutting (default `0.125`).
    *   **Units**: Toggle between Imperial (inches) and Metric (mm).
4.  **Reset**:
    *   Button clears **all** data (Stock and Parts).
    *   Must show a confirmation dialog before clearing.
5.  **Optimization Trigger**:
    *   "Generate Cut List" button.
    *   (Placeholder) Triggers calculation logic.

### 4.2. Specific "Legacy" Behaviors
*   **User Counter**: The application must display a static counter "Number of Projects Planned: 1,234" in the header. Use `counter.js` logic or hardcode in component.
*   **Reset Button Style**: Must be specifically hex `#66ff00` range for background.

## 5. Data Structures

### 5.1. Stock Item
```typescript
interface StockItem {
  id: string; // UUID
  species: string;
  length: number;
  width: number;
  thick: number;
  qty: number;
  cost: number;
  type: 'stock';
}
```

### 5.2. Part Item
```typescript
interface PartItem {
  id: string; // UUID
  name: string;
  species: string; // Optional
  length: number;
  width: number;
  thick: number;
  qty: number;
  type: 'part';
}
```

## 6. CSS / Styling (from `grainguard.css`)
*   **Global Reset**: Standard Tailwind preflight.
*   **Custom Utilities**:
    *   `.btn-reset`: `background-color: #66ff00; color: #000;`
    *   Stock table headers use specific width percentages (20%, 30%, 15%, 15%).
    *   Part table headers: Name (25%), Species (20%), Dimensions (30%), Qty (10%).

## 7. Implementation Notes
*   **Persistence**: Application state should strictly sync with `localStorage` to persist across reloads.
*   **Responsiveness**: Mobile-friendly (stacking columns), Desktop (grid layout).
