/**
 * Builds a dendrogram with the JSON data received.
 * @param data the JSON data.
 */


let tree

function buildTree(data, flag) {
    let root = d3.hierarchy(data, d => d.children);
    if(flag){
        let dendrogram = clusterTree().size([height, width]);
        tree = dendrogram(root);
        root.eachBefore(d => {
            if (d.parent) d.y = d.parent.y + scale * d.data.length
        })
    } else {
        let dendrogram = d3.cluster().size([height, width]);
        tree = dendrogram(root);
    }

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

    let gElement = gZoom
        .append("g")
        .attr("id", "graph");

    let link = gElement
        .selectAll(".link")
        .data(tree.descendants().slice(1))
        .enter()
        .append("g")

    link
        .append("path")
        .on("mouseover", mouseOveredDend(true))
        .on("mouseout", mouseOveredDend(false))
        .attr("class", "link")
        .attr("d", d => {
            return "M" + [d.parent.y,d.parent.x]
                + "V" + d.x
                + "H" + d.y;
        });



    let node = gElement
        .selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => "translate(" + [d.y,d.x] + ")");

    node
        .append("circle")
        .attr("r", 2.5);

    addZoom(svg, gZoom)
    addLeafLabels(gElement)

    // TODO Dendrogram Styles
    addLinkStyle(gElement)
    addNodeStyle(node)
}

/**
 * Returns a object that represents the tree
 * tha was drawn.
 * @returns {object} the tree previous built.
 */
function getTree() {
    return tree;
}

/**
 * Adds custom style to the nodes.
 * @param elem the html element to add the labels.
 */
function addNodeStyle(elem) {
    elem
        .select(".node circle")
        .style("fill", "#000000")
        .style("stroke", "#000000")
        .style("stroke-width", "3px");
}

/**
 * Adds custom style to the links.
 * @param elem the html element to add the style.
 */
function addLinkStyle(elem) {
    elem
        .selectAll(".link")
        .style("fill", "none")
        .style("stroke", "darkgrey")
        .style("stroke-width", "2px")
        .style("font", "14px sans-serif")
}

function clusterTree() {
    function leafLeft(node) {
        var children;
        while (children = node.children) node = children[0];
        return node;
    }

    function leafRight(node) {
        var children;
        while (children = node.children) node = children[children.length - 1];
        return node;
    }

    function meanX(children) {
        return children.reduce((x, c) => x + c.x, 0) / children.length;
    }

    function meanXReduce(x, c) {
        return x + c.x;
    }

    function maxY(children) {
        return 1 + children.reduce(maxYReduce, 0);
    }

    function maxYReduce(y, c) {
        return Math.max(y, c.y);
    }

    let separation = (a, b) => a.parent === b.parent ? 1 : 2,
        dx = 1,
        dy = 1,
        nodeSize = false;

    function cluster(root) {
        let previousNode,
            x = 0;

        // First walk, computing the initial x & y values.
        root.eachAfter(function (node) {
            let children = node.children;
            if (children) {
                node.x = meanX(children);
                node.y = maxY(children);
            } else {
                node.x = previousNode ? x += separation(node, previousNode) : 0;
                node.y = 0;
                previousNode = node;
            }
        });

        let left = leafLeft(root),
            right = leafRight(root),
            x0 = left.x - separation(left, right) / 2,
            x1 = right.x + separation(right, left) / 2;

        // Second walk, normalizing x & y to the desired size.
        return root.eachAfter(nodeSize ?
            function (node) {
                node.x = (node.x - root.x) * dx;
                node.y = (root.y - node.y) * dy;
            } :
            function (node) {
                node.x = (node.x - x0) / (x1 - x0) * dx;
                //node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
                //node.y = node.depth * dy / root.y;
                node.y = node.depth * scale;
                // node.parent.y + (node.y - node.parent.y) * node.length
            });
    }

    cluster.separation = function (x) {
        return arguments.length ? (separation = x, cluster) : separation;
    };

    cluster.size = function (x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
    };

    cluster.nodeSize = function (x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
    };

    return cluster;
}

//********************* Auxiliary functions ************************

/**
 * Adds labels to the parent nodes.
 * @param elem the html element to append the labels.
 */
function addInternalLabels(elem) {
    elem
        .selectAll(".node--internal")
        .append("text")
        .attr("dy", 20)
        .attr("x", -13)
        .style("text-anchor", "end")
        .style("font", "12px sans-serif")
        .text(d => d.data.name);
}

/**
 * Adds labels to the leaf nodes.
 * @param elem the html element to append the labels.
 */
function addLeafLabels(elem) {
    elem
        .selectAll(".node--leaf")
        .append("text")
        .attr("dy", 5)
        .attr("x", 13)
        .style("text-anchor", "start")
        .style("font", "12px sans-serif")
        .text(d => d.data.name)
        .on("mouseover", mouseOveredDend(true))
        .on("mouseout", mouseOveredDend(false));
}

/**
 * Adds labels to the links.
 * @param elem the html element to append the labels.
 */
function addLinkLabels(elem) {
    elem
        .append("text")
        .attr("x", d => (d.parent.y + d.y) / 2)
        .attr("y", d => d.x - 5)
        .attr("text-anchor", "middle")
        .text(d => d.data.length);
}

/**
 * Adds a horizontal axis with the scale.
 */
//TODO scale
function axis(svg) {
    let elem = svg
        .append("g")

    elem.append("line")
        .attr("class", "scale")
        .attr("x1", 10)
        .attr("x2", width / 3)
        .attr("y1", 710)
        .attr("y2", 710)
        .style("stroke", "#000");

    // d3
    //     .selectAll('.node')
    //     .each(function (d) {
    //         if (d.data.size > maxLinkSize) {
    //             maxLinkSize = d.data.size
    //         }
    //     })

    elem.append("text")
        .text("")
        .attr("x", 180)
        .attr("y", "46em")
}

function mouseOveredDend(active) {
    return function (event, d) {
        d3.select(this).classed("link--active", active).raise();

        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}
