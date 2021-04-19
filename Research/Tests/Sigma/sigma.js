let options = {
    numberOfNodes: 400,
    numberOfChildrenPerNode: 5,
    useCustomLinks: true,
    useCustomNodes: false, // ainda nao funciona
    useLabels: {
        nodeLabels: true,
        linkLabels: false
    }
}

drawGraph(options);

function drawGraph(options) {
    if (options.useCustomNodes)
        sigma.canvas.nodes.custom = customNodes;
    if (options.useCustomLinks)
        sigma.canvas.edges.custom = customEdges;

    let graph = constructGraph(options.numberOfNodes, options.numberOfChildrenPerNode, options.useLabels);

    console.time('time')

    const s = new sigma({
        renderer: {
            container: document.getElementById('container'),
            type: 'canvas'
        },
        settings: {
            minEdgeSize: 0.1,
            maxEdgeSize: 2,
            minNodeSize: 1,
            maxNodeSize: 4,
            labelThreshold: 0
        }
    });
    console.log(graph)
    s.graph.read(graph);

    s.refresh();

    console.timeEnd('time');
}

function customNodes(node, context, settings) {
    let color = 'red';
    let prefix = settings('prefix') || '';
}

function customEdges(edge, source, target, context, settings) {
    let color = edge.color; // or 'blue', 'red', 'black'
    let prefix = settings('prefix') || '';

    // define color if does not exist
    let edgeColor = settings('edgeColor');
    let defaultNodeColor = settings('defaultNodeColor');
    let defaultEdgeColor = settings('defaultEdgeColor');
    if (!color)
        switch (edgeColor) {
            case 'source':
                color = source.color || defaultNodeColor;
                break;
            case 'target':
                color = target.color || defaultNodeColor;
                break;
            default:
                color = defaultEdgeColor;
                break;
        }

    // attributes
    context.strokeStyle = color;
    context.lineWidth = edge[prefix + 'size'] || 1;

    if (edge.label) {
        let lx = source[prefix + 'x'] + (target[prefix + 'x'] - source[prefix + 'x'])/2;
        let ly = target[prefix + 'y'] - 1.5;
        context.fillText(edge.label, lx, ly);
    }

    // commands to draw
    context.beginPath();
    context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
    context.lineTo(source[prefix + 'x'], target[prefix + 'y']);
    context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
    context.stroke();
}

function constructGraph(max_nodes, n_of_children_per_node, label) {
    let edge_id = 0;
    let root = {id: 'n0', x: 0, y: 0, size: 3};
    if (label.nodeLabels)
        root.label = 'n0';
    let graph = {
        nodes: [root],
        edges: []
    }
    let queue = [], parent = root;
    let node, edge, x, y;
    for (let i = 1; i < max_nodes; i+=n_of_children_per_node) {
        for (let j = 0; j < n_of_children_per_node && i+j < max_nodes; j++) {
            x = Math.floor(Math.random() * max_nodes);
            y = Math.floor(Math.random() * max_nodes);

            node = {id: `n${i+j}`, x: x, y: y, size: 3, };
            if (label.nodeLabels)
                node.label = `n${(i+j).toString()}`;
            graph.nodes.push(node);
            queue.push(node);

            edge = {id: `e${edge_id++}`, source: parent.id, target: node.id, type: "custom"};
            if (label.linkLabels)
                edge.label = `e${edge_id}`;
            graph.edges.push(edge);
        }
        parent = queue.shift();
    }

    return graph;
}
