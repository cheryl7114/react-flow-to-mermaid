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
    const { parentMap, rootNodes } = groupNodesByParent(reactFlowData.nodes)

    // Convert nodes (including subflows)
    const nodes = convertNodes(rootNodes, parentMap)

    // Convert edges
    const edges = convertEdges(reactFlowData.edges)

    return `${header}\n${nodes}\n${edges}`
}


async function handleConvert() {
    // Convert to mermaid syntax
    const mermaidSyntax = convertToMermaid(sampleData)

    // Display the mermaid syntax in the textarea
    document.getElementById('mermaidCode').value = mermaidSyntax;

    // Render the mermaid diagram
    const outputDiv = document.getElementById('mermaidOutput')
    outputDiv.innerHTML = '' // Clear previous output

    const { svg } = await mermaid.render('mermaid-diagram', mermaidSyntax)
    outputDiv.innerHTML = svg

    document.getElementById('exportSvgBtn').disabled = false
    document.getElementById('exportPngBtn').disabled = false

}

function exportAsSvg() {
    const svg = document.querySelector('#mermaidOutput svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    downloadFile(blob, 'mermaid-diagram.svg')
}

function exportAsPng() {
    const svg = document.querySelector('#mermaidOutput svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Get SVG dimensions from viewBox or bounding box
    const bbox = svg.getBBox()
    const viewBox = svg.viewBox.baseVal
    const width = viewBox.width || bbox.width || 800
    const height = viewBox.height || bbox.height || 600

    // Clone and set explicit dimensions on SVG
    const svgClone = svg.cloneNode(true)
    svgClone.setAttribute('width', width)
    svgClone.setAttribute('height', height)

    const svgData = new XMLSerializer().serializeToString(svgClone)
    const img = new Image()

    img.onload = function () {
        const scale = 3
        canvas.width = width * scale
        canvas.height = height * scale

        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(function (blob) {
            downloadFile(blob, 'mermaid-diagram.png')
        })
    }

    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)))
    img.src = 'data:image/svg+xml;base64,' + svgBase64
}

function downloadFile(blob, filename) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}
