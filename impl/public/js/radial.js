//const margin = ({top: 10, right: 120, bottom: 10, left: 40})
//const tree = d3.tree().nodeSize([dx, dy])
//const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

function buildRadialTree(jsonData) {
    let diameter = height * 0.75;
    let radius = diameter / 2;
    let cluster = radialCalc()//.spread(20)
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
        d3.select('#container').select('svg').select('#graph').remove();
        svg = d3.select('#container').select('svg');
    } else {
        svg = d3
            .select("#container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

    }

    let graphGroup = svg.append('g').attr('id', 'graph').attr("transform", "translate(" + [margin.left,margin.top] + ")");

    addRadialZoom(svg, graphGroup);

    let link = graphGroup
        .selectAll(".link")
        .data(tree.descendants().slice(1))
        .enter()
        .append("g");

    link
        .append("line")
        .on("mouseover", mouseOveredRadial(true))
        .on("mouseout", mouseOveredRadial(false))
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

    //node.append("circle").attr("r", 1).attr('class', 'nodeRadial');
    //
    // node.append("text")
    //     .attr("class", "text-label")
    //     .attr("dx", d => d.x < Math.PI ? 8 : -8)
    //     .attr("dy", ".31em")
    //     .text(d => d.data.name);
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
    let delta = 0;

    function max(input) { return Math.max.apply(null, input); }

    function spreadFirst(root) {
        const ar = []
        if (!root.children) {
            root.spread = root.data.length
            return root.data.length
        }
        else {
            root.spread = root.data.length || 0;
            root.children.forEach(w => {
                ar.push(spreadFirst(w))
            });
            root.spread += max(ar)
        }

        return root.spread;
    }

    function spreadSecond(root) {
        if (!root.children) {
            root.spread = root.data.length
            return root.data.length
        }
        else {
            root.spread = root.data.length || 0;
            root.children.forEach(w => {
                root.spread += root.data.length + spreadSecond(w)
            });
            root.spread /= parseFloat(root.children.length) // ??
            return root.spread
        }
    }

    function radialTest(root) {
        root.eachAfter(d => {
            if (!d.children) d.leafcount = 0;
            else d.leafcount = d.children.reduce((acc, curr) => {
                return acc + (curr.leafcount === 0 ? 1 : curr.leafcount)
            }, 0);
        });

        // spreadFirst(root)
        spreadSecond(root)

        let queue = [root];
        root.rightBorder = 0;
        root.wedgeSize = 2 * pi;
        root.x = 0;
        root.y = 0;
        while (queue.length !== 0) {
            let v = queue.shift();
            let n = v.rightBorder;
            if (v.children) {

                // separation
                v.children.sort((a, b) => a.spread - b.spread)

                v.children.forEach(w => {
                    queue.push(w);
                    w.rightBorder = n;

                    w.wedgeSize = (2 * pi * w.leafcount) / root.leafcount

                    let alpha = w.rightBorder + (w.wedgeSize / 2);
                    w.x = v.x + Math.cos(alpha) * w.data.length * scale;
                    w.y = v.y + Math.sin(alpha) * w.data.length * scale;
                    n = n + w.wedgeSize;
                })
            }
        }
        return root;
    }

    radialTest.spread = function(spreadValue) { delta = spreadValue; return radialTest };

    return radialTest;
}

function mouseOveredRadial(active) {
    return function (event, d) {
        d3.select(this).classed("label--active", active);

        d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();

        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}

/**
 * Adds the zoom event for the svg element.
 * @param svg the svg element where the graph will be placed.
 * @param elem the g element containing the zoom area.
 */
function addRadialZoom(svg, elem) {
    let scale = 0.5
    elem.attr("transform", "translate(" + [width/2 + 100, height/2 - 100] + ") scale(" + scale + ")")

    const zoom = d3.zoom();
    const transform = d3.zoomIdentity.translate(width/2 + 100, height/2 - 100).scale(scale);

    svg
        .call(zoom.transform, transform)
        .call(zoom
            .scaleExtent([0.1, 100])
            .on("zoom", function (event) {
                elem.attr("transform", event.transform)
            }))
}

