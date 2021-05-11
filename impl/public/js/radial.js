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

    const width = 1920
    const outerRadius = width / 2
    const innerRadius = outerRadius - 170

    d3.select('#container').select('svg').select('#zoom').select('#graph').remove()

    if(!svg){
        svg = d3
            .select("#container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    }

    if(!gZoom){
        gZoom = svg.append("g")
            .attr("id", "zoom")
            .attr("transform", "translate(" + [margin.left,margin.top] + ")")
    }


    let graphGroup = gZoom.append('g').attr('id', 'graph')
    //.attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")")
    //.attr('transform', "translate(" + [margin.left, margin.top] + ")");

    let link = graphGroup
        .selectAll(".link")
        .data(tree.descendants().slice(1))
        .enter()
        .append("g")

    link
        .append("line")
        .on("mouseover", mouseOveredDend(true))
        .on("mouseout", mouseOveredDend(false))
        .attr("class", "link")
        .attr("x1", d => d.parent.x)
        .attr("y1", d => d.parent.y)
        .attr("x2", d => d.x)
        .attr("y2", d => d.y)
        //.attr("transform", d => `rotate(${d.x * 180 / Math.PI + 180}) translate(${d.y},0)`);

    let node = graphGroup
        .selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))

        //.attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);
    // .attr("transform", d => {
    //     let dx = d.x,
    //         dy = d.y,
    //         length = d.data.length
    //     let point = radialPoint(dx,  dy * length)
    //     return `translate(${point})`
    // });

    // node.append("circle").attr("r", 1).attr('class', 'nodeRadial');

    node.append("text")
        .attr("class", "text-label")
        .attr("dx", d => d.x < Math.PI ? 8 : -8)
        .attr("dy", ".31em")
        //.attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        //.attr("transform", d => d.x < Math.PI ? null : "rotate(180)")
        .text(d => d.data.name);

    addZoom(svg, graphGroup)
}

function collapseNode(node) {

}

function addStyle() {

}

function getTree() {

}

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
                    w.x = v.x + Math.cos(alpha) * w.data.length;
                    w.y = v.y + Math.sin(alpha) * w.data.length;
                    n = n + w.ws;
                })
            }
        }
        return root;
    }

    return radialTest;
}

/*
aux functions
 */
function radialPoint(x, y) {
    // rotate(${d.x * 180 / Math.PI - 90})
    // translate(${d.y},0)
    //return [x * 180 / Math.PI - 90, y];
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}

function mouseovered(active) {
    return function (event, d) {
        d3.select(this).classed("label--active", active);

        d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();

        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}

