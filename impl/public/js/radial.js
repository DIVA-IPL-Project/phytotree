//const margin = ({top: 10, right: 120, bottom: 10, left: 40})
//const tree = d3.tree().nodeSize([dx, dy])
//const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

function buildRadialTree(jsonData) {
    let diameter = height * 0.75;
    let radius = diameter / 2;
    let cluster = radialCalc()
    // .size([2 * Math.PI, radius])
    // .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    let tree = d3.hierarchy(jsonData);
    let toReturn = cluster(tree)
    // data.eachBefore(d => {
    //     if (d.parent) d.y = d.parent.y + scale * d.data.length
    // })
    return toReturn;
}

function radial(data) {
    const tree = buildRadialTree(data)

    let svg, gZoom
    if (!d3.select('#container').select('svg').empty()) {
        d3.select('#container').select('svg').select('#zoom').select('#graph').remove();
        svg = d3.select('#container').select('svg');
        gZoom = svg.select('#zoom');
    } else {
        svg = d3
            .select("#container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

        gZoom = svg.append("g")
            .attr("id", "zoom")
            .attr("transform", "translate(" + [margin.left,margin.top] + ")")
    }
    addZoom(svg, gZoom);

    let graphGroup = gZoom.append('g').attr('id', 'graph');

    let link = graphGroup
        .selectAll(".link")
        .data(tree.descendants().slice(1))
        .enter()
        .append("g");

    link
        .append("line")
        .on("mouseover", mouseOveredDend(true))
        .on("mouseout", mouseOveredDend(false))
        .attr("class", "link")
        .attr("x1", d => d.parent.x)
        .attr("y1", d => d.parent.y)
        .attr("x2", d => d.x)
        .attr("y2", d => d.y);

    let node = graphGroup
        .selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${[d.x, d.y]})`);

    node.append("circle").attr("r", 1).attr('class', 'nodeRadial');

    node.append("text")
        .attr("class", "text-label")
        .attr("dx", d => d.x < Math.PI ? 8 : -8)
        .attr("dy", ".31em")
        .text(d => d.data.name);
}

function collapseNode(node) {

}

function addStyle() {

}

function getTree() {

}



/*
private functions
 */

function radialCalc() {
    const pi = Math.PI

    function radialTest(root) {
        root.eachAfter(d => {
            if (!d.children) d.leafcount = 1;
            else d.leafcount = d.children.reduce((acc, curr) => acc + curr.leafcount, 0);
        });

        let queue = [root];
        root.rb = 0;
        root.ws = 2 * pi;
        root.x = 0;
        root.y = 0;
        while (queue.length !== 0) {
            let v = queue.shift();
            let n = v.rb;
            if (v.children) {
                v.children.forEach(w => {
                    queue.push(w);
                    w.rb = n;
                    w.ws = (2 * pi * w.leafcount) / root.leafcount
                    let alpha = w.rb + (w.ws / 2);
                    w.x = v.x + Math.cos(alpha) * w.data.length * scale;
                    w.y = v.y + Math.sin(alpha) * w.data.length * scale;
                    n = n + w.ws;
                })
            }
        }
        return root;
    }

    return radialTest;
}

function mouseovered(active) {
    return function (event, d) {
        d3.select(this).classed("label--active", active);

        d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();

        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}

