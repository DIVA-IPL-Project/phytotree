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

    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 10,
        springCoeff: 0.0001,
        dragCoeff: 0.02,
        gravity: -30
    });

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
    var ui = Viva.Graph.svg('g');
    var circle = Viva.Graph.svg('circle')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('fill', node.data.typeColor)
        .attr('r', radius)
        .attr('stroke', node.data.typeColor)
        .attr('stroke-width', stroke_width);

    var label = Viva.Graph.svg('text').text(node.id)
    ui.append(circle);
    ui.append(label);

    return ui;
}

function placeCustomNode(nodeUI, pos) {
    var offset = parseInt(nodeUI.node.data.weight * max_radius + min_radius, 10);
    nodeUI.attr('transform', 'translate(' + (pos.x - offset) + ',' + (pos.y - offset) + ')');
}

function createCustomLink(link) {
    var ui = Viva.Graph.svg('path')
        .attr('fill', 'transparent')
        .attr('stroke', 'black')
        .attr('stroke-width', '2');
        // .attr('stroke-width', link.data.weight * max_fitness + min_fitness);
    return ui;
}

function placeCustomLink(linkUI, fromPos, toPos) {
    var path = `M${fromPos.x},${fromPos.y}` +
        `H${(fromPos.x + (toPos.x - fromPos.x) / 2)}` +
        `V${toPos.y}` +
        `H${toPos.x}`;
    linkUI.attr("d", path);
}

function constructGraph() {
    var graph = Viva.Graph.graph();

    graph.addNode('1', {
        x: -100 * 3,
        y: 0 * 3,
        weight: 0.1,
        typeColor: 'green'
    });
    graph.addNode('2', {
        x: -60 * 3,
        y: -40 * 3,
        weight: 0.1,
        typeColor: 'green'
    });
    graph.addNode('3', {
        x: -60 * 3,
        y: 40 * 3,
        weight: 0.1,
        typeColor: 'yellow'
    });
    graph.addNode('4', {
        x: -20 * 3,
        y: -50 * 3,
        weight: 1.0,
        typeColor: 'yellow'
    });
    graph.addNode('5', {
        x: -20 * 3,
        y: -20 * 3,
        weight: 0.4,
        typeColor: 'blue'
    });
    graph.addNode('6', {
        x: -20 * 3,
        y: 0 * 3,
        weight: 0.9,
        typeColor: 'green'
    });
    graph.addNode('7', {
        x: -20 * 3,
        y: 50 * 3,
        weight: 0.2,
        typeColor: 'blue'
    });
    graph.addNode('8', {
        x: 20 * 3,
        y: -50 * 3,
        weight: 0.2,
        typeColor: 'blue'
    });

    graph.addLink('1', '2');
    graph.addLink('1', '3');
    graph.addLink('2', '4');
    graph.addLink('2', '5');
    graph.addLink('3', '6');
    graph.addLink('3', '7');
    graph.addLink('4', '8');

    return graph;
}


/* ------------------------------------------------------------------------------------------------*/
/*
function idk() {
    var graph = Viva.Graph.graph();

    var graphics = Viva.Graph.View.svgGraphics(),
        nodeSize = 24;

    var renderer = Viva.Graph.View.renderer(graph, {
        graphics: graphics
    });
    renderer.run();

    graphics.node(function (node) {
        return Viva.Graph.svg('image')
            .attr('width', nodeSize)
            .attr('height', nodeSize)
            .link('https://secure.gravatar.com/avatar/' + node.data);
    }).placeNode(function (nodeUI, pos) {
        nodeUI.attr('x', pos.x - nodeSize / 2).attr('y', pos.y - nodeSize / 2);
    });


    var createMarker = function (id) {
        return Viva.Graph.svg('marker')
            .attr('id', id)
            .attr('viewBox', "0 0 10 10")
            .attr('refX', "10")
            .attr('refY', "5")
            .attr('markerUnits', "strokeWidth")
            .attr('markerWidth', "10")
            .attr('markerHeight', "5")
            .attr('orient', "auto");
    },

        marker = createMarker('Triangle');
    marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

    var defs = graphics.getSvgRoot().append('defs');
    defs.append(marker);

    var geom = Viva.Graph.geom();

    graphics.link(function (link) {
        var label = Viva.Graph.svg('text').attr('id', 'label_' + link.data.id).text(link.data.id);
        graphics.getSvgRoot().childNodes[0].append(label);

        return Viva.Graph.svg('path')
            .attr('stroke', 'gray')
            .attr('marker-end', 'url(#Triangle)')
            .attr('id', link.data.id);
    }).placeLink(function (linkUI, fromPos, toPos) {
        var toNodeSize = nodeSize,
            fromNodeSize = nodeSize;

        var from = geom.intersectRect(
            fromPos.x - fromNodeSize / 2, // left
            fromPos.y - fromNodeSize / 2, // top
            fromPos.x + fromNodeSize / 2, // right
            fromPos.y + fromNodeSize / 2, // bottom
            fromPos.x, fromPos.y, toPos.x, toPos.y)
            || fromPos;

        var to = geom.intersectRect(
            toPos.x - toNodeSize / 2, // left
            toPos.y - toNodeSize / 2, // top
            toPos.x + toNodeSize / 2, // right
            toPos.y + toNodeSize / 2, // bottom
            // segment:
            toPos.x, toPos.y, fromPos.x, fromPos.y)
            || toPos;

        var data = 'M' + from.x + ',' + from.y +
            'L' + to.x + ',' + to.y;

        linkUI.attr("d", data);

        document.getElementById('label_' + linkUI.attr('id'))
            .attr("x", (from.x + to.x) / 2)
            .attr("y", (from.y + to.y) / 2);
    });

    // Finally we add something to the graph:
    graph.addNode('anvaka', '91bad8ceeec43ae303790f8fe238164b');
    graph.addNode('indexzero', 'd43e8ea63b61e7669ded5b9d3c2e980f');
    graph.addNode('test', 'd43e8ea63b61e7669ded5b9d3c2e980f');
    graph.addLink('anvaka', 'indexzero', { id: 1 });
    graph.addLink('anvaka', 'test', { id: 2 });
}*/