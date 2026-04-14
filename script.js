function getReactFlowData(reactFlowInstance) {
    return {
        nodes: reactFlowInstance.getNodes(),
        edges: reactFlowInstance.getEdges()
    }
}

function sanitizeId(id) {
    return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

function groupNodesByParent(nodes) {
    const parentMap = new Map()
    const rootNodes = []
    const nodeMap = new Map()

    // First pass: create a map of all nodes by ID
    nodes.forEach(node => {
        nodeMap.set(node.id, node)
    })

    // Second pass: build parent-child relationships
    nodes.forEach(node => {
        if (node.parentNode) {
            // This is a child node
            if (!parentMap.has(node.parentNode)) {
                parentMap.set(node.parentNode, [])
            }
            parentMap.get(node.parentNode).push(node)
        } else {
            // This is a root level node (no parent)
            rootNodes.push(node)
        }
    })

    return { parentMap, rootNodes }
}

function convertNodes(nodes, parentMap, indentLevel = 1) {
    const lines = []
    const indent = '    '.repeat(indentLevel)

    nodes.forEach(node => {
        const id = sanitizeId(node.id)
        const label = node.data.label || node.id

        // Check if this node is a parent node (has children)
        if (parentMap.has(node.id)) {
            // Create a subgraph
            lines.push(`${indent}subgraph ${id}[${label}]`)

            // Recursively add child nodes (which may themselves be subgraphs)
            const children = parentMap.get(node.id)
            const childLines = convertNodes(children, parentMap, indentLevel + 1)
            lines.push(childLines)

            lines.push(`${indent}end`)
        } else {
            // Regular node (leaf node with no children)
            lines.push(`${indent}${id}[${label}]`)
        }
    })

    return lines.join('\n')
}

function convertEdges(edges) {
    const edgeLines = []
    const errorEdgeIndices = [] // Track which edges are error types

    edges.forEach((edge, index) => {
        const source = sanitizeId(edge.source)
        const target = sanitizeId(edge.target)
        const label = edge.label ? `|${edge.label}|` : ''

        const arrow = '-->'

        if (edge.type === 'error') {
            // Track error edges for styling
            errorEdgeIndices.push(index)
        }

        // Build the edge line
        edgeLines.push(`    ${source} ${arrow}${label} ${target}`)
    })

    // Add linkStyle directives for error edges
    // linkStyle uses 0-based index to reference edges
    const styleLines = errorEdgeIndices.map(idx =>
        `    linkStyle ${idx} stroke:red,stroke-width:3px`
    )

    // Combine edge lines and style directives
    return [...edgeLines, ...styleLines].join('\n')
}

function convertToMermaid(reactFlowData) {
    const direction = 'TD' // Top to down, or 'LR' for left to right
    const header = `flowchart ${direction}`

    // Group nodes by parent relationship
    const { parentMap, rootNodes } = groupNodesByParent(reactFlowData.nodes)

    // Convert nodes (including subflows)
    const nodes = convertNodes(rootNodes, parentMap)

    // Convert edges
    const edges = convertEdges(reactFlowData.edges)

    return `${header}\n${nodes}\n${edges}`
}
