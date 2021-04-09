var max_radius = 20;
var min_radius = 5;
var max_fitness = 10;
var min_fitness = 2;
var contenedor;

function main() {
    var graph = constructGraph();

    var graphics = Viva.Graph.View.svgGraphics();

    var defs = Viva.Graph.svg('defs');
    graphics.getSvgRoot().append(defs);

    graphics.node(createCustomNode)
        .placeNode(placeCustomNode)
        .link(createCustomLink)
        .placeLink(placeCustomLink);

    var layout = Viva.Graph.Layout.constant(graph);

    var renderer = Viva.Graph.View.renderer(graph, {
        layout: layout,
        graphics: graphics,
        container: contenedor,
        prerender: 100
    });

    renderer.run();
    renderer.pause();
}

function createCustomNode(node) {
    var radius = parseInt(max_radius * node.data.weight, 10) + min_radius;
    var stroke_width = parseInt(radius * 0.09375, 10) + 1;
    var ui = Viva.Graph.svg('g')
    var circle = Viva.Graph.svg('circle')
        .attr('r', 5)
        .attr('fill', node.data.typeColor)
        .attr('stroke', node.data.typeColor)
        .attr('stroke-width', stroke_width);

    var label = Viva.Graph.svg('text')
        .text(node.id)
        .attr('x', -15)
        .attr('y', -5)
    ui.append(circle);
    ui.append(label);

    return ui;
}

function placeCustomNode(nodeUI) {
    var position = nodeUI.node.data.position, weight = nodeUI.node.data.weight;
    nodeUI.attr('transform', 'translate(' + (position.x + (weight * 100)) + ',' + (position.y) + ')');
}

function createCustomLink(link) {
    var ui = Viva.Graph.svg('path')
        .attr('fill', 'transparent')
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
    // .attr('stroke-width', link.data.weight * max_fitness + min_fitness);
    return ui;
}

function placeCustomLink(linkUI, fromPosi, toPosi) {
    var fromPos = linkUI.link.data.from.data
    var toPos = linkUI.link.data.to.data
    var path = `M${fromPos.position.x + (fromPos.weight * 100)},${fromPos.position.y}` +
        //`H${(fromPos.x + (toPos.x - fromPos.x) / 2)}` +
        `V${toPos.position.y}` +
        `H${toPos.position.x + (toPos.weight * 100)}`;
    linkUI.attr("d", path);
}

function constructGraph() {
    var graph = Viva.Graph.graph();

    var a = graph.addNode('A', {
        position: {
            x: 50,
            y: -100,
        },
        weight: 0.5,
        typeColor: 'green'
    });
    var b = graph.addNode('B', {
        position: {
            x: 50,
            y: -50
        },
        weight: 0.2,
        typeColor: 'green'
    });
    var c = graph.addNode('C', {
        position: {
            x: 50,
            y: 50
        },
        weight: 0.3,
        typeColor: 'green'
    });
    var unnamed = graph.addNode('', {
        position: {
            x: 60,
            y: 100
        },
        weight: 0.1,
        typeColor: 'green'
    });
    var d = graph.addNode('D', {
        position: {
            x: 100,
            y: 75
        },
        weight: 0.4,
        typeColor: 'green'
    });
    var e = graph.addNode('E', {
        position: {
            x: 100,
            y: 125
        },
        weight: 0.6,
        typeColor: 'green'
    });
    var f = graph.addNode('F', {
        position: {
            x: 0,
            y: 0
        },
        weight: 0,
        typeColor: 'green'
    });

    graph.addLink('F', 'A', { from: f, to: a });
    graph.addLink('F', 'B', { from: f, to: b });
    graph.addLink('F', 'C', { from: f, to: c });
    graph.addLink('F', '', { from: f, to: unnamed });
    graph.addLink('', 'D', { from: unnamed, to: d });
    graph.addLink('', 'E', { from: unnamed, to: e });

    return graph;
}