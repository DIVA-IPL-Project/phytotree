let tree
let root
let dendrogram_fun
let dendrogram
let textScale = '100';

//graph configurations
let linksVisible
let parentLabelsVisible
let isAlign
let linearScale

//graph elements
let svg
let link
let graphElement
let node

//zoom
let zoomPosition = {x: 100, y: 400}
let zoomScale = 1

//horizontal line with text scale
let horizontalScaleVisible
let scaleText
let scaleLineWidth
let translateWidth = 100
let translateHeight = height - 10
let scaleLinePadding = 10

/**
 * Builds a dendrogram with the JSON data received.
 * @param data the JSON data.
 * @param align if the nodes are align.
 */
function buildTree(data, align) {
    const treeD = d3.stratify()
        .id(function(d) { return d.target; })
        .parentId(function(d) { return d.source; })
        (data);

    root = d3.hierarchy(treeD, d => d.children)

    //discoverLeafTree(data)
    if (!d3.select('#container').select('svg').empty()) {
        d3.select('#container').select('svg').select('#graph').remove();
        svg = d3
            .select('#container')
            .select('svg')
    } else {
        //scaleVertical = scaleVertical + leaf
        svg = d3
            .select("#container")
            .append("svg")
            .attr("width", width  + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    }
    return update(align)
}

function update(align) {
    d3.select('#container').select('svg').select('#graph').remove()

    graphElement = svg
        .append("g")
        .attr("id", "graph")
        .attr("transform", "translate(" + [zoomPosition.x, zoomPosition.y] + ")")

    let treeData

    if (!align) {
        dendrogram_fun = clusterTree()
            .nodeSize([1, 1])
            .separation((a, b) => scaleVertical)
        tree = treeData = dendrogram_fun(root);
        console.log('obj')
        console.log(tree)
        console.log('obj')
        root.eachBefore(d => {
            d.x = d.x * scaleVertical
            if (d.parent) {
                d.y = d.parent.y + scale * d.data.data.value
            }
        })
    } else {
        dendrogram_fun = d3.cluster()
            .nodeSize([1, 0])
            .separation((a, b) => scaleVertical)
        tree = treeData = dendrogram_fun(root)
        root.eachBefore(d => {
            if (d.parent) d.y = d.parent.y + scale
        })
    }

    let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    console.log('inks')
    console.log(links)
    link = graphElement.selectAll('.link')
        .data(links, function (d) {
            return d.id;
        })
        .enter().append('g');

    console.log(link)

    link.append('path')
        .on("mouseover", mouseOveredDendrogram(true))
        .on("mouseout", mouseOveredDendrogram(false))
        .attr("class", "link")
        .attr('id', d => 'link'+d.data.id)
        .attr('style', 'z-index: -1;')
        .attr("d", d => {
            return "M" + [d.parent.y, d.parent.x]
                + "V" + d.x
                + "H" + d.y;
        });

    node = graphElement.selectAll('.node')
        .data(nodes);

    let nodeEnter = node.enter().append('g')
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf") + (d.parent ? " node--norm" : " node--root") )
        .attr("transform", d => "translate(" + [d.y, d.x] + ")")
        .attr("id", d => 'node'+d.data.id)
        .on("click", click);

    nodeEnter.append("circle").attr("r", 3);

    addDendrogramZoom();
    addLeafLabels();

    if (!horizontalScaleVisible) {
        scaleText = horizontalScale();
        horizontalScaleVisible = true;
        linearScale = true;
    }
}

function click(event, d) {

    if(d.visibility !== null){
        if (d.visibility === false){
            d.visibility = true
            addNodesAndLinks(d, d.children)
        } else {
            d.visibility = false
            removeNodesAndLinks(d.children)
        }
    } else {
        d.visibility = false
        removeNodesAndLinks(d.children)
    }

    addLeafLabels()
}

function search(root, id){
    if(root.data.id === id){
        return root.data
    }
    return searchInChildren(root.data.children, id)
}

function searchInChildren(children, id){

    if (children.children) {
        for (let i = 0; i < children.children.length; i++) {
            let child = children.children[i]
            if(child.data.id === id){
                return child.data
            }
            return searchInChildren(child.children, id)
        }
    }
}

function removeNodesAndLinks(children){
    for (let i = 0; i < children.length; i++) {
        let child= children[i]
        let id = child.data.id !== undefined? child.data.id : child.id
        child.visibility = false
        graphElement.select(`#node${id}`).remove()
        graphElement.select(`#link${id}`).remove()
        // document.getElementById('node'+id).remove()
        // document.getElementById('link'+id).remove()
        if(child.children !== undefined){
            removeNodesAndLinks(child.children)
        }
    }
}

function addNodesAndLinks(parent, children){
    for (let i = 0; i < children.length; i++) {
        let child = children[i]
        let id = child.data.id
        child.visibility = true

        graphElement.data(child).append('g').append('path')
            .on("mouseover", mouseOveredDendrogram(true))
            .on("mouseout", mouseOveredDendrogram(false))
            .attr("class", "link")
            .attr('style', 'z-index: -1;')
            .attr('id', d => {
                return 'link'+id
            })
            .attr("d", d => {
                return "M" + [child.parent.y, child.parent.x]
                    + "V" + child.x
                    + "H" + child.y;
            })

        graphElement.data(child).append('g')
            .attr("class", d => "node" + (child.children ? " node--internal" : " node--leaf") + (child.parent ? " node--norm" : " node--root") )
            .attr("transform", d => "translate(" + [child.y, child.x] + ")")
            .attr("id", d => 'node'+id)
            .on("click", click)
            .append("circle").attr("r", 3)

        if(child.children !== undefined){
            addNodesAndLinks(child, child.children)
        }
    }
}

/**
 * Returns a object that represents the tree.
 * @returns {object} the tree previous built.
 */
function getTree() {
    return tree;
}

//styles
/**
 * Adds custom style to the nodes.
 */
function addNodeStyle() {
    node
        .select(".node circle")
        .style("fill", '#000000')
        .style("stroke", '#000000')
        .style("stroke-width", "10px");
}

/**
 * Adds custom style to the links.
 */
function addLinkStyle() {
    graphElement
        .selectAll(".link")
        .style("fill", "none")
        .style("stroke", "darkgrey")
        .style("stroke-width", "2px")
        .style("font", "14px sans-serif");
}

//labels
/**
 * Adds labels to the parent nodes.
 */
function addInternalLabels() {
    if (parentLabelsVisible) {
        d3.select('#container').select('svg').select('#graph').selectAll(".node--internal text").remove();
        parentLabelsVisible = false;
    } else {
        d3.select('#container').select('svg').select('#graph')
            .selectAll(".node--internal")
            .append("text")
            .attr("dy", 20)
            .attr("x", -13)
            .style("text-anchor", "end")
            .style("font", "12px sans-serif")
            .text(d => d.data.id);

        parentLabelsVisible = true;
    }
}

/**
 * Adds labels to the links.
 */
function addLinkLabels() {
    if (linksVisible) {
        link.select("text").remove();
        linksVisible = false;
    } else {
        link
            .append("text")
            .attr("x", d => (d.parent.y + d.y) / 2)
            .attr("y", d => d.x - 5)
            .attr("text-anchor", "middle")
            .style("font", "12px sans-serif")
            .text(d => d.data.data.value);

        linksVisible = true;
    }
}

/**
 * Adds labels to the leaf nodes.
 */
function addLeafLabels() {
    console.log(graphElement
        .selectAll(".node--leaf"))
    graphElement
        .selectAll(".node--leaf")
        .append("text")
        .attr("dy", 5)
        .attr("x", 13)
        .style("text-anchor", "start")
        .style("font", "12px sans-serif")
        .text(d => {
            //console.log(d)
            return d.data.id
        })
        .on("mouseover", mouseOveredDendrogram(true))
        .on("mouseout", mouseOveredDendrogram(false));
}

//align nodes
function alignNodes() {
    isAlign = !isAlign
    update(isAlign)
    applyScaleText(scaleText, scale / 1000)
}

//********************* Auxiliary functions ************************

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
                node.y = node.depth * scale;
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

//horizontal line for scale text
/**
 * Adds a horizontal scale.
 */
function horizontalScale() {
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + translateWidth + "," + translateHeight + ")")
        .attr("class", "horizontalScale")
        .append("path")
        .attr("d", d => {
            scaleLineWidth = width * 0.15;
            return "M" + scaleLinePadding + ",10L" + (scaleLineWidth + scaleLinePadding) + ",10"
        })
        .attr("stroke-width", 1)
        .attr("stroke", "#000");

    return d3.select("svg").append("text")
        .attr("transform", "translate(" + translateWidth + "," + translateHeight + ")")
        .attr("class", "scaleText")
        .attr("x", scaleLineWidth / 2 + scaleLinePadding)
        .attr("y", 36)
        .attr("font-family", "sans-serif")
        .text("")
        .attr("font-size", "14px")
        .attr("fill", "#000")
        .attr("text-anchor", "middle");
}

/**
 * Adds the text to be append in the horizontal scale.
 * @param scaleText the place to put the text.
 * @param scale the current scale value.
 */
function applyScaleText(scaleText, scale) {
    if (tree.children) {
        let children = getChildren(tree);
        let length = 0;
        let offset = 0;

        for (let i = 0; i < children.length; i++) {
            length = getLength(children[i]);
            offset = children[i].x;
            if (offset < 1) {
                offset = children[i].y // 10;
            }
            const test_length = length.toFixed(3);
            if (parseFloat(test_length) !== 0 && offset !== 0) {
                break;
            }
        }

        let text = (((scaleLineWidth / offset) * length) / scale).toFixed(2);
        scaleText.text(text);
    }
}

/**
 * Returns the length of a node.
 * @param d the node to search the length.
 * @returns {number|*} the length of the node or zero if the
 * node does not have a length.
 */
function getLength(d) {
    if (d.parent) return d.data.data.value+ getLength(d.parent);
    else return 0;
}

/**
 * Returns the children of a node.
 * @param d the node to search the children.
 * @returns {*|*[]} an array with the children or an empty array if
 * the node does not have children.
 */
function getChildren(d) {
    return d.children ? d.children : [];
}

/**
 *
 * @param active
 * @returns {(function(*, *): void)|*}
 */
function mouseOveredDendrogram(active) {
    return function (event, d) {
        d3.select(this).classed("link--active", active).raise();
        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}

/**
 * Adds the zoom event for the svg element.
 */
function addDendrogramZoom() {
    const zoom = d3.zoom()
    const transform = d3.zoomIdentity.translate(zoomPosition.x, zoomPosition.y).scale(zoomScale)
    let applyScale

    graphElement.attr("transform", "translate(" + [zoomPosition.x, zoomPosition.y] + ") scale(" + zoomScale + ")")

    svg
        .call(zoom.transform, transform)
        .call(zoom
            .scaleExtent([0.1, 100])
            .filter((event) => {
                if (event.type === 'mousedown') applyScale = false
                if (event.type === 'wheel') applyScale = true
                return true
            })
            .on("zoom", function (event) {
                zoomPosition.x = event.transform.x
                zoomPosition.y = event.transform.y
                zoomScale = event.transform.k

                graphElement.attr("transform", event.transform)

                const zoomElem = document
                    .getElementById("graph")
                    .getAttribute("transform")

                const scaleAttr = zoomElem.substring(zoomElem.indexOf("scale"), zoomElem.length)
                const scaleValue = scaleAttr.substring(scaleAttr.indexOf("(") + 1, scaleAttr.length - 1)

                if (applyScale) applyScaleText(scaleText, scaleValue)
            }))
}

//rescaling
/**
 * Builds the logarithmic scale.
 * @returns {logarithmicScale}
 */
function logarithmicScale() {
    const minValue = Math.log(1);
    const maxValue = Math.log(100);
    const maxPosition = 100;
    const minPosition = 1;

    const scale = (maxValue - minValue) / (maxPosition - minPosition);

    this.value = function (position) {
        return Math.exp((position - minPosition) * scale + minValue);
    }

    this.position = function (value) {
        return minPosition + (Math.log(value) - minValue) / scale;
    }

    return this;
}

function setNewYPositions() {
    root.eachBefore(d => {
        if (d.parent) {
            d.y = d.parent.y + scale * d.data.data.value
            document.getElementById('node' + d.data.id)
                .setAttribute('transform', 'translate(' + [d.y, d.x] + ')')
            document.getElementById('link' + d.data.id)
                .setAttribute('d', "M" + [d.parent.y, d.parent.x] + "V" + d.x + "H" + d.y)
        }
    })
}

function applyLinearScale() {
    if (!linearScale) {
        linearScale = true
        scale = +textScale * 10
        setNewYPositions();
    }
}

function applyLogScale() {
    if(linearScale) {
        linearScale = false
        scale = logarithmicScale().value(textScale)
        setNewYPositions()
    }
}

// todo
function verticalRescale(increment) {
    if (increment) {
        if (scaleVertical > 1) {
            let last = scaleVertical
            scaleVertical -= 1
            setNewXPositions(last)
        }
    } else {
        if (scaleVertical < 100) {
            let last = scaleVertical
            scaleVertical += 1
            setNewXPositions(last)
        }
    }
}

function setNewXPositions(last) {
    root.eachBefore(d => {
        d.x = d.x / last
        d.x = d.x * scaleVertical

        document.getElementById('node' + d.data.id)
            .setAttribute('transform', 'translate(' + [d.y, d.x] + ')')
        if (d.parent) {
            document.getElementById('link' + d.data.id)
                .setAttribute('d', "M" + [d.parent.y, d.parent.x] + "V" + d.x + "H" + d.y)
        }
    })
}

function horizontalRescale(right) {
    if (right) {
        if (parseInt(textScale) + 10 < 1000) { //todo (here we can optimize)
            textScale = parseInt(textScale) + 10
        }
    } else {
        if (parseInt(textScale) - 10 > 0) { //todo (here we can optimize)
            textScale = parseInt(textScale) - 10
        }
    }
    if (linearScale) scale =+ textScale * 10
    else scale = logarithmicScale().value(textScale)
    setNewYPositions()
    applyScaleText(scaleText, scale/1000)
}

const links = [
    {
        source: null,
        target: "NC_022655.fna",
        value: 0
    },
    {
        "source": "NC_022655.fna",
        "target": "ERR067990.fa",
        "value": 5
    },
    {
        "source": "NC_022655.fna",
        "target": "ERR068035.fa",
        "value": 6
    },
    {
        "source": "NC_022655.fna",
        "target": "ERR129062.fa",
        "value": 8
    },
    {
        "source": "ERR067990.fa",
        "target": "ERR069843.fa",
        "value": 9
    },
    {
        "source": "ERR069843.fa",
        "target": "ERR065973.fa",
        "value": 3
    },
    {
        "source": "ERR069843.fa",
        "target": "ERR124233.fa",
        "value": 10
    },
    {
        "source": "ERR124233.fa",
        "target": "ERR129193.fa",
        "value": 1
    },
    {
        "source": "ERR124233.fa",
        "target": "NC_014251.fna",
        "value": 1
    },
    {
        "source": "ERR124233.fa",
        "target": "ERR129036.fa",
        "value": 1
    },
    {
        "source": "ERR124233.fa",
        "target": "ERR124222.fa",
        "value": 6
    },
    {
        "source": "NC_022655.fna",
        "target": "ERR067999.fa",
        "value": 19
    },
    {
        "source": "ERR067999.fa",
        "target": "ERR069699.fa",
        "value": 4
    },
    {
        "source": "ERR067999.fa",
        "target": "7011_4#1",
        "value": 5
    },
    {
        "source": "7011_4#1",
        "target": "6680_6#8",
        "value": 4
    },
    {
        "source": "ERR067999.fa",
        "target": "ERR069791.fa",
        "value": 6
    },
    {
        "source": "ERR069791.fa",
        "target": "ERR069842.fa",
        "value": 1
    },
    {
        "source": "ERR067999.fa",
        "target": "6871_2#13",
        "value": 6
    },
    {
        "source": "6871_2#13",
        "target": "6775_1#23",
        "value": 2
    },
    {
        "source": "6775_1#23",
        "target": "7038_4#7",
        "value": 1
    },
    {
        "source": "6775_1#23",
        "target": "6925_3#4",
        "value": 2
    },
    {
        "source": "6775_1#23",
        "target": "6899_5#24",
        "value": 2
    },
    {
        "source": "6925_3#4",
        "target": "7068_4#2",
        "value": 2
    },
    {
        "source": "7038_4#7",
        "target": "7004_7#50",
        "value": 4
    },
    {
        "source": "ERR067999.fa",
        "target": "6259_8#2",
        "value": 6
    },
    {
        "source": "ERR067999.fa",
        "target": "6823_7#10",
        "value": 6
    },
    {
        "source": "ERR067999.fa",
        "target": "NC_012469.fna",
        "value": 6
    },
    {
        "source": "ERR067999.fa",
        "target": "ERR129078.fa",
        "value": 7
    },
    {
        "source": "ERR129078.fa",
        "target": "ERR065314.fa",
        "value": 1
    },
    {
        "source": "ERR067999.fa",
        "target": "ERR069762.fa",
        "value": 7
    },
    {
        "source": "ERR069762.fa",
        "target": "ERR069706.fa",
        "value": 8
    },
    {
        "source": "7011_4#1",
        "target": "6731_4#4",
        "value": 9
    },
    {
        "source": "6731_4#4",
        "target": "6938_8#21",
        "value": 1
    },
    {
        "source": "6731_4#4",
        "target": "6631_6#14",
        "value": 2
    },
    {
        "source": "6731_4#4",
        "target": "6823_7#8",
        "value": 6
    },
    {
        "source": "7011_4#1",
        "target": "6680_5#11",
        "value": 10
    },
    {
        "source": "6680_5#11",
        "target": "6925_4#16",
        "value": 1
    },
    {
        "source": "6680_5#11",
        "target": "6823_6#24",
        "value": 1
    },
    {
        "source": "6871_2#13",
        "target": "6871_2#15",
        "value": 10
    },
    {
        "source": "6871_2#15",
        "target": "6630_3#6",
        "value": 3
    },
    {
        "source": "ERR067999.fa",
        "target": "7004_5#21",
        "value": 12
    },
    {
        "source": "7004_5#21",
        "target": "6736_8#14",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6925_7#14",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6899_5#17",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6680_5#18",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6983_5#13",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6731_1#1",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6753_3#1",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6823_3#11",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6710_7#4",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6807_2#24",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6972_3#13",
        "value": 1
    },
    {
        "source": "6736_8#14",
        "target": "7011_4#3",
        "value": 1
    },
    {
        "source": "6925_7#14",
        "target": "6807_3#1",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6823_2#2",
        "value": 2
    },
    {
        "source": "6823_2#2",
        "target": "6731_5#3",
        "value": 1
    },
    {
        "source": "6823_2#2",
        "target": "6925_5#1",
        "value": 1
    },
    {
        "source": "6823_2#2",
        "target": "7011_6#1",
        "value": 1
    },
    {
        "source": "6823_2#2",
        "target": "6823_1#18",
        "value": 1
    },
    {
        "source": "6823_2#2",
        "target": "6730_4#18",
        "value": 1
    },
    {
        "source": "6731_5#3",
        "target": "6805_4#10",
        "value": 1
    },
    {
        "source": "6731_5#3",
        "target": "6899_5#15",
        "value": 1
    },
    {
        "source": "6805_4#10",
        "target": "7011_6#14",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6259_8#16",
        "value": 2
    },
    {
        "source": "6259_8#16",
        "target": "6731_4#5",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6871_1#3",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6840_3#7",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6823_3#18",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "7038_6#1",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6680_7#22",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6641_6#19",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6731_5#9",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6710_7#20",
        "value": 2
    },
    {
        "source": "7004_5#21",
        "target": "6731_5#21",
        "value": 2
    },
    {
        "source": "6736_8#14",
        "target": "6823_5#10",
        "value": 2
    },
    {
        "source": "6823_5#10",
        "target": "6871_1#1",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6593_4#7",
        "value": 3
    },
    {
        "source": "7004_5#21",
        "target": "6840_1#16",
        "value": 3
    },
    {
        "source": "7004_5#21",
        "target": "6775_2#19",
        "value": 3
    },
    {
        "source": "7004_5#21",
        "target": "6755_1#22",
        "value": 3
    },
    {
        "source": "7004_5#21",
        "target": "6807_1#19",
        "value": 3
    },
    {
        "source": "6259_8#16",
        "target": "6755_4#22",
        "value": 3
    },
    {
        "source": "7004_5#21",
        "target": "6731_1#15",
        "value": 4
    },
    {
        "source": "7004_5#21",
        "target": "6949_2#18",
        "value": 5
    },
    {
        "source": "7004_5#21",
        "target": "6680_4#24",
        "value": 6
    },
    {
        "source": "6680_4#24",
        "target": "6680_4#1",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6823_3#22",
        "value": 6
    },
    {
        "source": "7004_5#21",
        "target": "6680_4#22",
        "value": 7
    },
    {
        "source": "6731_5#3",
        "target": "6925_7#18",
        "value": 9
    },
    {
        "source": "6925_7#18",
        "target": "7054_4#6",
        "value": 1
    },
    {
        "source": "7004_5#21",
        "target": "6680_6#13",
        "value": 10
    },
    {
        "source": "6753_3#1",
        "target": "6731_3#6",
        "value": 10
    },
    {
        "source": "7004_5#21",
        "target": "6755_4#23",
        "value": 11
    },
    {
        "source": "6755_4#23",
        "target": "6731_5#15",
        "value": 1
    },
    {
        "source": "6731_4#4",
        "target": "6925_3#21",
        "value": 12
    },
    {
        "source": "ERR067999.fa",
        "target": "ERR068003.fa",
        "value": 14
    },
    {
        "source": "ERR067999.fa",
        "target": "NC_017769.fna",
        "value": 15
    },
    {
        "source": "6680_5#11",
        "target": "6649_8#9",
        "value": 88
    },
    {
        "source": "6649_8#9",
        "target": "6631_4#19",
        "value": 1
    },
    {
        "source": "ERR124233.fa",
        "target": "6823_6#3",
        "value": 101
    },
    {
        "source": "6823_6#3",
        "target": "6807_1#11",
        "value": 22
    },
    {
        "source": "6823_6#3",
        "target": "6755_1#6",
        "value": 39
    },
    {
        "source": "6823_6#3",
        "target": "6680_7#12",
        "value": 60
    },
    {
        "source": "6680_7#12",
        "target": "6730_1#11",
        "value": 27
    },
    {
        "source": "6680_7#12",
        "target": "6730_7#7",
        "value": 42
    },
    {
        "source": "6649_8#9",
        "target": "6823_3#1",
        "value": 104
    },
    {
        "source": "6823_3#1",
        "target": "6805_6#20",
        "value": 1
    },
    {
        "source": "6805_6#20",
        "target": "6983_7#54",
        "value": 103
    },
    {
        "source": "6983_7#54",
        "target": "6972_3#15",
        "value": 1
    },
    {
        "source": "6972_3#15",
        "target": "6938_6#19",
        "value": 1
    },
    {
        "source": "6983_7#54",
        "target": "6938_5#19",
        "value": 1
    },
    {
        "source": "6938_6#19",
        "target": "ERR069775.fa",
        "value": 39
    },
    {
        "source": "ERR069775.fa",
        "target": "ERR069773.fa",
        "value": 1
    },
    {
        "source": "ERR069775.fa",
        "target": "ERR129040.fa",
        "value": 1
    },
    {
        "source": "ERR069775.fa",
        "target": "ERR129188.fa",
        "value": 1
    },
    {
        "source": "ERR069775.fa",
        "target": "ERR068039.fa",
        "value": 16
    },
    {
        "source": "6871_2#15",
        "target": "6731_4#10",
        "value": 104
    },
    {
        "source": "6731_4#10",
        "target": "6259_6#13",
        "value": 11
    },
    {
        "source": "6259_6#13",
        "target": "6630_1#23",
        "value": 1
    },
    {
        "source": "6259_6#13",
        "target": "6755_4#12",
        "value": 1
    },
    {
        "source": "6259_6#13",
        "target": "6680_7#20",
        "value": 2
    },
    {
        "source": "6755_4#12",
        "target": "6972_2#1",
        "value": 3
    },
    {
        "source": "6805_6#20",
        "target": "7038_8#35",
        "value": 106
    },
    {
        "source": "7038_8#35",
        "target": "6983_6#42",
        "value": 7
    },
    {
        "source": "6983_6#42",
        "target": "6805_5#5",
        "value": 5
    },
    {
        "source": "6805_5#5",
        "target": "7038_7#10",
        "value": 1
    },
    {
        "source": "6805_5#5",
        "target": "6899_6#10",
        "value": 1
    },
    {
        "source": "6805_5#5",
        "target": "6823_6#5",
        "value": 2
    },
    {
        "source": "6823_6#5",
        "target": "7038_5#12",
        "value": 2
    },
    {
        "source": "6983_6#42",
        "target": "6631_5#23",
        "value": 6
    },
    {
        "source": "6631_5#23",
        "target": "6714_8#18",
        "value": 1
    },
    {
        "source": "6631_5#23",
        "target": "6899_6#19",
        "value": 1
    },
    {
        "source": "6631_5#23",
        "target": "6630_2#2",
        "value": 2
    },
    {
        "source": "6983_6#42",
        "target": "6730_3#7",
        "value": 12
    },
    {
        "source": "6730_3#7",
        "target": "7011_5#14",
        "value": 1
    },
    {
        "source": "6730_3#7",
        "target": "7038_4#22",
        "value": 1
    },
    {
        "source": "6730_3#7",
        "target": "ERR069840.fa",
        "value": 1
    },
    {
        "source": "6730_3#7",
        "target": "6755_4#10",
        "value": 1
    },
    {
        "source": "6730_3#7",
        "target": "6938_7#17",
        "value": 1
    },
    {
        "source": "7011_5#14",
        "target": "6938_6#22",
        "value": 1
    },
    {
        "source": "7011_5#14",
        "target": "6755_5#17",
        "value": 1
    },
    {
        "source": "6730_3#7",
        "target": "6736_6#11",
        "value": 2
    },
    {
        "source": "6631_5#23",
        "target": "6899_5#16",
        "value": 12
    },
    {
        "source": "6983_6#42",
        "target": "6755_3#11",
        "value": 12
    },
    {
        "source": "6631_5#23",
        "target": "7054_6#19",
        "value": 14
    }
]


