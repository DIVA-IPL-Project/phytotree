sigma.canvas.edges.def = customEdges;

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

s.cameras[0].goTo({ x: 0, y: 0, angle: 0, ratio: 1.1 });

//Create a graph object
const graph = {
    nodes: [
        {id: "n0", label: "A", x: 1.6, y: -3, size: 3},
        {id: "n1", label: "B", x: 1.4, y: -1, size: 3},
        {id: "n2", label: "C", x: 1.2, y: 1, size: 3},
        {id: "n3", x: 1, y: 3, size: 3},
        {id: "n4", label: "D", x: 2.2, y: 2.5, size: 3},
        {id: "n5", label: "E", x: 2.8, y: 3.5, size: 3},
        {id: "n6", label: "F", x: 0, y: 0, size: 3}
    ],
    edges: [
        {id: "e0", source: "n6", target: "n0", type: "def", label: '1.6'},
        {id: "e1", source: "n6", target: "n1", type: "def", label: '1.4'},
        {id: "e2", source: "n6", target: "n2", type: "def", label: '1.2'},
        {id: "e3", source: "n6", target: "n3", type: "def", label: '1'},
        {id: "e4", source: "n3", target: "n4", type: "def", label: '2.2'},
        {id: "e5", source: "n3", target: "n5", type: "def", label: '2.8'}
    ]
}

// Load the graph in sigma
s.graph.read(graph);
// Ask sigma to draw it
s.refresh();

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

    let dx = source[prefix + 'x'] + (target[prefix + 'x'] - source[prefix + 'x'])/2,
        dy = target[prefix + 'y'] - 1.5;

    context.fillText(edge.label, dx, dy);
    // commands to draw
    context.beginPath();
    context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
    context.lineTo(source[prefix + 'x'], target[prefix + 'y']);
    context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
    context.stroke();

}

