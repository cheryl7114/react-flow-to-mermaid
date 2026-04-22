# React Flow to Mermaid Converter

A tool that converts React Flow diagrams into Mermaid flowchart syntax, with support for nested workflows, subgraphs, and various edge types.

## Features

- 🔄 **Convert React Flow to Mermaid**: Transform React Flow node/edge data into Mermaid flowchart syntax
- 🎯 **Edge Types**: Handle different edge types including conditional and error flows
- 📊 **Visual Preview**: Real-time Mermaid diagram rendering
- 💾 **Export Options**: Export diagrams as SVG or PNG files


## Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone or download the repository**:
   ```bash
   git clone https://github.com/cheryl7114/react-flow-to-mermaid.git
   cd react-flow-to-mermaid
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build TypeScript files** (required for CLI conversion):
   ```bash
   npm run build
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   
   This will:
   - Start an HTTP server on port 8080
   - Automatically open the application in your default browser
   - Navigate to `http://localhost:8080` if it doesn't open automatically

### Alternative: Direct Browser Access

You can also open `index.html` directly in your browser, but using `npm start` is recommended for the best experience.

### CLI Workflow Conversion

Convert Serverless Workflow YAML files to Mermaid diagrams from the command line:

1. **Place your workflow YAML file** in the `examples/` directory (or modify the path in `src/sdk-to-mermaid.ts`)

2. **Run the conversion**:
   ```bash
   npm run convert-workflow
   ```

3. **View the output**: The Mermaid diagram code will be printed to the console

**Example workflow.yaml structure:**
```yaml
document:
  dsl: '1.0.0'
  namespace: default
  name: order-processing
  version: '1.0.0'
do:
  - validateOrder:
      call: http
      with:
        method: post
        endpoint: https://api.example.com/validate
  - checkInventory:
      call: http
      with:
        method: get
        endpoint: https://api.example.com/inventory
```

This feature uses the [@serverlessworkflow/sdk](https://github.com/serverlessworkflow/sdk-typescript) to parse Serverless Workflow DSL and convert it to Mermaid flowchart syntax.

## Usage

### Basic Usage

1. **View Sample Data**: The page loads with a complex nested workflow example
2. **Click "Convert to Mermaid"**: Generates Mermaid syntax and renders the diagram
3. **Export**: Use "Export As SVG" or "Export As PNG" buttons to save the diagram

### Using Your Own Data

Replace the `sampleData` object in `index.html` with your React Flow data:

```javascript
const sampleData = {
    nodes: [
        { 
            id: 'node1', 
            data: { label: 'Start' }, 
            position: { x: 0, y: 0 } 
        },
        // Add more nodes...
    ],
    edges: [
        { 
            id: 'e1', 
            source: 'node1', 
            target: 'node2',
            label: 'Optional Label',
            type: 'error' // Optional: 'error', 'conditional', or omit for default
        },
        // Add more edges...
    ]
};
```

### Creating Nested Workflows

To create nested subgraphs, use the `parentNode` property:

```javascript
// Parent node (becomes a subgraph)
{
    id: 'parent',
    data: { label: 'Parent Container' },
    position: { x: 0, y: 0 },
    style: { width: 400, height: 300, backgroundColor: 'rgba(240, 240, 255, 0.5)' }
}

// Child node (inside parent)
{
    id: 'child',
    data: { label: 'Child Node' },
    parentNode: 'parent',
    extent: 'parent',
    position: { x: 50, y: 50 }
}

// Grandchild node (nested deeper)
{
    id: 'grandchild',
    data: { label: 'Grandchild Node' },
    parentNode: 'child',
    extent: 'parent',
    position: { x: 20, y: 20 }
}
```

## Core Functions

### `convertToMermaid(reactFlowData)`
Main conversion function that orchestrates the transformation.

**Parameters:**
- `reactFlowData`: Object with `nodes` and `edges` arrays

**Returns:** Mermaid flowchart syntax string

### `sanitizeId(id)`
Sanitizes node IDs to be Mermaid-compatible (replaces special characters with underscores).

### `groupNodesByParent(nodes)`
Groups nodes by their parent relationships to build the nested structure.

### `convertNodes(nodes, parentMap)`
Converts React Flow nodes to Mermaid node syntax, including subgraphs.

### `convertEdges(edges)`
Converts React Flow edges to Mermaid edge syntax with styling for error edges.

## Edge Types

The converter supports different edge types:

- **Default**: Standard arrow (`-->`)
- **Conditional**: Use `type: 'conditional'` for decision branches
- **Error**: Use `type: 'error'` for error paths (rendered in red)

Example:
```javascript
{ id: 'e1', source: 'a', target: 'b', type: 'error', label: 'Exception' }
```

## Technologies Used

- **React Flow** (v11.11.4): Flow diagram library
- **Mermaid** (v10): Diagram rendering
- **Carbon Web Components** (v2): IBM Carbon Design System UI components
- **React** (v18): UI framework (for React Flow)

All libraries are loaded via CDN - no build process required!

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Internet Explorer: Not supported

## Limitations

- **Nested Depth**: While the code supports unlimited nesting, very deep hierarchies (5+ levels) may become visually complex
- **Node IDs**: Special characters in node IDs are replaced with underscores
- **Edge Styling**: Currently only error edges have custom styling (red)
- **Layout**: Mermaid auto-layouts the diagram; manual positioning from React Flow is not preserved
