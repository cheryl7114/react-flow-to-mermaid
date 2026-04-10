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

    nodes.forEach(node => {
        if (node.parentNode) {
            // This is a child node
            if (!parentMap.has(node.parentNode)) {
                parentMap.set(node.parentNode, [])
            }
            parentMap.get(node.parentNode).push(node)
        } else {
            // This is a root level node
            rootNodes.push(node)
        }
    })

    return { parentMap, rootNodes }
}

function convertNodes(nodes, parentMap) {
    const lines = []

    nodes.forEach(node => {
        const id = sanitizeId(node.id)
        const label = node.data.label || node.id

        // Check if this node is a parent node (has children)
        if (parentMap.has(node.id)) {
            // Create a subgraph
            lines.push(`    subgraph ${id}[${label}]`)

            // Add child nodes
            const children = parentMap.get(node.id)
            children.forEach(child => {
                const childId = sanitizeId(child.id);
                const childLabel = child.data.label || child.id;
                lines.push(`        ${childId}[${childLabel}]`);
            })

            lines.push(`    end`)
        } else {
            // Regular node
            lines.push(`    ${id}[${label}]`)
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
    const nodes = convertNodes(reactFlowData.nodes)
    const edges = convertEdges(reactFlowData.edges)

    return `${header}\n${nodes}\n${edges}`
}
