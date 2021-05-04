

//******************** INTERFACE METHODS ****************************

/**
 * Builds a dendrogram with the JSON data received.
 * @param data the JSON data.
 */
function buildTree(data) {
    // d3.json("dendrogram03.json").then(json => {
    //     tree = d3.hierarchy(json, d => d.children);
    //     d3.cluster().size([height, width])(tree);

    let dendrogram = d3
        .cluster()
        .size([height, width]);

    let root = d3.hierarchy(data, d => d.children);

    tree = dendrogram(root);

    d3.select('#container')
        .select('svg').remove()
    // the svg body
    let svg = d3
        .select("#container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let gElement = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "graph");

    // links
    let link = gElement
        .selectAll(".link")
        .data(tree.descendants().slice(1))
        .enter()
        .append("g")

    link
        .append("path")
        .attr("class", "link")
        .attr("d", d => {
            return "M" + d.parent.y + "," + d.parent.x
               // + "H" + (d.parent.y + (d.y - d.parent.y) / 2)
                + "V" + d.x
                + "H" + d.y;
        });

    addLinkStyle(gElement)
    //addLinkLabels(link)

    // nodes
    let node = gElement
        .selectAll(".node")
        .data(tree.descendants())
        .enter()
        .append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

    node
        .append("circle")
        .attr("r", 2.5)
        .on("mouseover", mouseovered(true))
        .on("mouseout", mouseovered(false));;

    //addInternalLabels(gElement)
    //addLeafLabels(gElement)
    addNodeStyle(node)

    xAxis(svg)
    addZoom(svg, gElement)
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
 *
 * @param elem
 */
function addNodeStyle(elem) {
    elem
        .select(".node circle")
        .style("fill", "#000000")
        .style("stroke", "#000000")
        .style("stroke-width", "3px");
}

/**
 *
 * @param elem
 */
function addLinkStyle(elem) {
    elem
        .selectAll(".link")
        .style("fill", "none")
        .style("stroke", "darkgrey")
        .style("stroke-width", "2px")
        .style("font", "14px sans-serif")
}

//********************* Auxiliary functions ************************

/**
 *
 * @param elem
 */
function addInternalLabels(elem) {
    elem
        .selectAll(".node--internal")
        .append("text")
        .attr("dy", 20)
        .attr("x", -13)
        .style("text-anchor", "end")
        .style("font", "14px sans-serif")
        .text(d => d.data.name);
}

/**
 *
 * @param elem
 */
function addLeafLabels(elem) {
    elem
        .selectAll(".node--leaf")
        .append("text")
        .attr("dy", 5)
        .attr("x", 13)
        .style("text-anchor", "start")
        .style("font", "12px sans-serif")
        .text(d => d.data.name);
}

/**
 *
 * @param elem
 */
function addLinkLabels(elem) {
    elem
        .append("text")
        .attr("x", d => (d.parent.y + d.y) / 2)
        .attr("y", d => (d.parent.x + d.x) / 2)
        .attr("text-anchor", "end")
        .text(d => d.data.size)
}

/**
 *
 */
function xAxis(svg) {
    let elem = svg
        .append("g")

    elem.append("line")
        .attr("class", "scale")
        .attr("x1", 10)
        .attr("x2", width / 3)
        .attr("y1", 710)
        .attr("y2", 710)
        .style("stroke", "#000");

    d3
        .selectAll('.node')
        .each(function (d) {
            if (d.data.size > maxLinkSize) {
                maxLinkSize = d.data.size
            }
        })

    elem.append("text")
        .text(maxLinkSize.toString())
        .attr("x", 180)
        .attr("y", "46em")
}


