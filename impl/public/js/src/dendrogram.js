const dendrogram = function () {

    const margin = {
        top: 20,
        right: 90,
        bottom: 30,
        left: 90
    }
    const canvas = {
        container: null,
        width: window.innerWidth - margin.left - margin.right,
        height: window.innerHeight - margin.top - margin.bottom,
        margin: margin,
        zoom: {
            x: 100,
            y: 200,
            scale: 1
        }
    }
    const data = {
        root: null,
        tree: null
    }
    const graph = {
        element: null,
        nodes: null,
        links: null,
        align: false,
        style: {
            linkLabels: false,
            parentLabels: false
        },
        scale: linearScale()
    }
    const ruler = {
        container: null,
        element: null,
        visible: false,
        width: canvas.width * 0.15,
        x: canvas.height - 50,
        y: 100,
        padding: 10,
    }
    const svg = {
        element: null,
        graph: graph,
        ruler: ruler
    }

    const context = {
        canvas: canvas,
        build: null,
        data: data,
        svg: svg
    }


    /********************* Main functions *********************/

    /**
     * Builds a dendrogram with the JSON data received.
     * @param input the JSON data.
     * @param align if the nodes are align.
     */
    function build(input) {
        const strat = d3.stratify()
            .id(d => d.target)
            .parentId(d => d.source)(input.links);
        data.root = d3.hierarchy(strat, d => d.children)
        context.build = clusterTree()
            .size([300, 400]) // todo calculate initial value for size
        //.nodeSize([1, 1])
        //.separation((a, b) => graph.scale.vertical)

        data.tree = context.build(data.root)

        // apply scale
        applyScale()

        return data
    }

    function draw(container, tree) {
        canvas.container = d3.select(container)
        svg.element = canvas.container.select('svg')
        if (!svg.element.empty()) {
            svg.element.select('#graph').remove();
        } else {
            svg.element = canvas.container
                .append("svg")
                .attr("width", canvas.width + canvas.margin.left + canvas.margin.right)
                .attr("height", canvas.height + canvas.margin.top + canvas.margin.bottom)
        }

        graph.element = svg.element
            .append("g")
            .attr("id", "graph")
            .attr("transform", "translate(" + [canvas.zoom.x, canvas.zoom.y] + ")")

        update(tree)
        addDendrogramZoom()

        //scale line
        horizontalScale();
        ruler.visible = true;
        applyScaleText()
    }

    function update(tree) {
        if (graph.nodes && !graph.nodes.empty()) graph.nodes.remove()
        if (graph.links && !graph.links.empty()) graph.links.remove()

        let nodes = tree.descendants()
        let links = tree.descendants().slice(1)

        graph.links = linksAttr(graph.element.selectAll('.link').data(links, d => d.id).enter())
        graph.nodes = nodesAttrs(graph.element.selectAll('.node').data(nodes).enter())

        addLeafLabels()
    }

    // /********************* IDK functions *********************/ //todo
    // function search(root, id) {
    //     if (root.data.id === id) {
    //         return root.data
    //     }
    //     return searchInChildren(root.data.children, id)
    // }
    // function searchInChildren(children, id) {
    //     if (children.children) {
    //         for (let i = 0; i < children.children.length; i++) {
    //             let child = children.children[i]
    //             if (child.data.id === id) {
    //                 return child.data
    //             }
    //             return searchInChildren(child.children, id)
    //         }
    //     }
    // }


    /********************* Collapse functions *********************/

    function collapse(parent, children) {
        parent.visibility = false
        collapseAux(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.element.data(parent))
            .append('polygon')
            .attr('points', d => `0,0 50,20 50,-20}`) // todo triangle size
            .style('fill', 'black')
    }

    function collapseAux(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            let id = child.data.id !== undefined ? child.data.id : child.id
            //child.visibility = false
            graph.element.select(`#node${id}`).remove()
            graph.element.select(`#link${id}`).remove()
            if (child.children) {
                collapseAux(child.children)
            }
        }
    }

    function expand(parent, children) {
        parent.visibility = true
        expandAux(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.element.data(parent))
    }

    function expandAux(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            if (child.visibility === undefined)
                child.visibility = true

            if (child.visibility && child.children) {
                expandAux(child.children)
            }

            linksAttr(graph.element.data(child))
            nodesAttrs(graph.element.data(child))
        }
    }

    function click(event, d) {
        if (d.visibility !== null) {
            if (d.visibility === false) {
                d.visibility = true
                expand(d, d.children)
            } else {
                d.visibility = false
                collapse(d, d.children)
            }
        } else {
            d.visibility = false
            collapse(d, d.children)
        }
        addLeafLabels()
    }


    /********************* Style functions *********************/

    /**
     * Nodes representations
     * @param nodes
     * @returns the d3 representation for the node container
     */
    function nodesAttrs(nodes) {
        let container = nodes.append('g')
        container
            .attr("id", d => 'node' + d.data.id)
            .attr("class", d => "node" + (!d.children ?
                " node--leaf" : " node--internal") + (d.parent ? " node--norm" : " node--root"))
            .attr("transform", d => "translate(" + [d.y, d.x] + ")")
            .on("click", click)
        container
            .append("circle")
            .attr("r", 3)
        return container
    }

    /**
     * Links representations
     * @param links
     * @returns the d3 representation for the link container
     */
    function linksAttr(links) {
        let container = links.append('g')
        container
            .attr('id', d => 'link' + d.data.id)
        container.append('path')
            .attr("class", "link")
            .attr("d", d => `M${[d.parent.y, d.parent.x]} V${d.x} H${d.y}`)
            .on("mouseover", mouseOveredDendrogram(true))
            .on("mouseout", mouseOveredDendrogram(false))
        return container
    }

    /**
     * Adds custom style to the nodes.
     */
    function addNodeStyle() {
        graph.nodes
            .select(".node circle")
            .style("fill", '#000000')
            .style("stroke", '#000000')
            .style("stroke-width", "10px");
    }

    /**
     * Adds custom style to the links.
     */
    function addLinkStyle() {
        graph.element
            .selectAll(".link")
            .style("fill", "none")
            .style("stroke", "darkgrey")
            .style("stroke-width", "2px")
            .style("font", "14px sans-serif");
    }

    /**
     * Adds labels to the parent nodes.
     */
    function addInternalLabels() {
        if (graph.style.parentLabels) {
            canvas.container.select('svg').select('#graph').selectAll(".node--internal text").remove();
            graph.style.parentLabels = false;
        } else {
            canvas.container.select('svg').select('#graph')
                .selectAll(".node--internal")
                .append("text")
                .attr("dy", 20)
                .attr("x", -13)
                .style("text-anchor", "end")
                .style("font", "12px sans-serif")
                .text(d => d.data.id);

            graph.style.parentLabels = true;
        }
    }

    /**
     * Adds labels to the links.
     */
    function addLinkLabels() {
        if (graph.style.linkLabels) {
            graph.links.select("text").remove();
            graph.style.linkLabels = false;
        } else {
            graph.links
                .append("text")
                .attr("x", d => (d.parent.y + d.y) / 2)
                .attr("y", d => d.x - 5)
                .attr("text-anchor", "middle")
                .style("font", "12px sans-serif")
                .text(d => d.data.data.value);

            graph.style.linkLabels = true;
        }
    }

    /**
     * Adds labels to the leaf nodes.
     */
    function addLeafLabels() {
        graph.element.selectAll(".node--leaf text").remove();
        graph.element
            .selectAll(".node--leaf")
            .append("text")
            .attr("dy", 5)
            .attr("x", 13)
            .style("text-anchor", "start")
            .style("font", "12px sans-serif")
            .text(d => d.data.id)
            .on("mouseover", mouseOveredDendrogram(true))
            .on("mouseout", mouseOveredDendrogram(false));
    }

    /**
     * Aligns nodes by depth or by link weight
     */
    function alignNodes() {
        graph.align = !graph.align
        if (graph.align) data.root.eachBefore(d => {
            let horizontal = graph.scale.horizontal
            d.y = d.depth * (horizontal.value * horizontal.scalingFactor)
        })
        else data.root.eachBefore(d => {
            if (d.parent) {
                let horizontal = graph.scale.horizontal
                d.y = (horizontal.value * horizontal.scalingFactor * d.data.data.value) + d.parent.y
            }
        })
        update(data.tree)
        applyScaleText()
    }


    /********************* Graph Scaling functions ************************/

    /**
     * Applies the scale to the coordinates of the tree
     */
    function applyScale() {
        data.tree.eachBefore(d => {
            d.x = d.x * graph.scale.vertical.value
            if (d.parent) {
                let horizontal = graph.scale.horizontal
                if (!graph.align) {
                    d.y = horizontal.value * d.data.data.value * horizontal.scalingFactor + d.parent.y
                }
            }
        })
    }

    /**
     * Changes the scaling of the graph to linear scale
     */
    function applyLinearScale() {
        graph.scale = linearScale()
        applyScale()
        applyScaleText()
        update(data.root)
    }

    /**
     * Changes the scaling of the graph to logarithmic scale
     */
    function applyLogScale() {
        graph.scale = logScale()
        applyScale()
        applyScaleText()
        update(data.root)
    }

    /**
     * Linear scale representation
     * @returns {{
     * horizontal: {scalingFactor: number, step: number, value: number, limits: number[]},
     * vertical: {scalingFactor: number, step: number, value: number, limits: number[]}
     * }}
     */
    function linearScale() {
        const linear = {
            vertical: {
                value: 1,
                limits: [0.1, 10],
                scalingFactor: 1,
                step: 0.02
            },
            horizontal: {
                value: 1,
                limits: [0.1, 10],
                scalingFactor: 1000,
                step: 0.01
            }
        }

        function incrementV() {
            linear.vertical.value += linear.vertical.step
        }

        function decrementV() {
            linear.vertical.value -= linear.vertical.step
        }

        function incrementH() {
            linear.horizontal.value += linear.horizontal.step
        }

        function decrementH() {
            linear.horizontal.value -= linear.horizontal.step
        }

        linear.vertical.increment = incrementV
        linear.vertical.decrement = decrementV
        linear.horizontal.increment = incrementH
        linear.horizontal.decrement = decrementH

        return linear
    }

    /**
     * Logarithmic scale representation
     * @returns {{
     * horizontal: {scalingFactor: number, step: number, value: number, limits: number[]},
     * vertical: {scalingFactor: number, step: number, value: number, limits: number[]}
     * }}
     */
    function logScale() {
        let value = 1.1

        const log = {
            vertical: {
                value: 1,
                limits: [1, 100],
                scalingFactor: 0.01,
                step: 0.02
            },
            horizontal: {
                value: 30,
                limits: [1, 100],
                scalingFactor: 15,
                step: 2
            }
        }

        function incrementV() {
            log.vertical.step *= value
            log.vertical.value += log.vertical.step
        }

        function decrementV() {
            log.vertical.value -= log.vertical.step
            log.vertical.step /= value
        }

        function incrementH() {
            log.horizontal.value += log.horizontal.step
            log.horizontal.step *= value
        }

        function decrementH() {
            log.horizontal.step /= value
            log.horizontal.value -= log.horizontal.step
        }

        log.vertical.increment = incrementV
        log.vertical.decrement = decrementV
        log.horizontal.increment = incrementH
        log.horizontal.decrement = decrementH

        return log
    }


    /********************* Rescale Graph functions ************************/

    /**
     * Rescales the graph vertically according to the applied scale
     * @param increment - true to increment - false to decrement
     */
    function verticalRescale(increment) {
        if (increment) {
            if (graph.scale.vertical.value > graph.scale.vertical.limits[0]) {
                let last = graph.scale.vertical.value
                graph.scale.vertical.decrement()
                setNewXPositions(last)
            }
        } else {
            if (graph.scale.vertical.value < graph.scale.vertical.limits[1]) {
                let last = graph.scale.vertical.value
                graph.scale.vertical.increment()
                setNewXPositions(last)
            }
        }
    }

    /**
     * Rescales the graph horizontally according to the applied scale
     * @param increment - true to increment - false to decrement
     */
    function horizontalRescale(increment) {
        if (increment) {
            if (graph.scale.horizontal.value < graph.scale.horizontal.limits[1]) {
                graph.scale.horizontal.increment()
                setNewYPositions()
                applyScaleText()
            }
        } else {
            if (graph.scale.horizontal.value > graph.scale.horizontal.limits[0]) {
                graph.scale.horizontal.decrement()
                setNewYPositions()
                applyScaleText()
            }
        }
    }

    /**
     * Applies the scale to the X axis
     * @param last - last scale value
     */
    function setNewXPositions(last) {
        data.root.eachBefore(d => {
            d.x = d.x / last
            d.x = d.x * graph.scale.vertical.value

            document.getElementById('node' + d.data.id)
                .setAttribute('transform', 'translate(' + [d.y, d.x] + ')')
            if (d.parent) {
                document.getElementById('link' + d.data.id)
                    .querySelector('.link')
                    .setAttribute('d', "M" + [d.parent.y, d.parent.x] + "V" + d.x + "H" + d.y)
            }
        })
    }

    /**
     * Applies the scale to the Y axis
     */
    function setNewYPositions() {
        data.root.eachBefore(d => {
            if (d.parent) {
                let horizontal = graph.scale.horizontal
                if (!graph.align)
                    d.y = horizontal.value * d.data.data.value * horizontal.scalingFactor + d.parent.y
                else
                    d.y = d.depth * horizontal.scalingFactor * horizontal.value

                document.getElementById('node' + d.data.id)
                    .setAttribute('transform', 'translate(' + [d.y, d.x] + ')')
                document.getElementById('link' + d.data.id)
                    .querySelector('.link')
                    .setAttribute('d', "M" + [d.parent.y, d.parent.x] + "V" + d.x + "H" + d.y)
            }
        })
    }


    /********************* Scale Line functions ************************/

    /**
     * Adds a horizontal scale.
     * A line to measure the link value and the text with the value
     */
    function horizontalScale() {
        if (ruler.container) ruler.container.remove()
        ruler.container = svg.element
            .append("g")
            .attr("transform", "translate(" + [ruler.y, ruler.x] + ")")
            .attr("class", "horizontalScale")

        ruler.container.append("path")
            .attr("d", d => "M" + ruler.padding + ",10L" + (ruler.width + ruler.padding) + ",10")
            .attr("stroke-width", 1)
            .attr("stroke", "#000")

        ruler.element = ruler.container
            .append("text")
            .attr("class", "ruler-text")
            .attr("x", ruler.width / 2 + ruler.padding)
            .attr("y", 36)
            .attr("font-family", "sans-serif")
            .text("")
            .attr("font-size", "14px")
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
    }

    /**
     * Applies the value of line to the text
     */
    function applyScaleText() { // todo
        if (data.tree.children) {
            const root = data.tree.y
            const child = data.tree.children[0].y
            const dist = child - root
            let value = data.tree.children[0].data.data.value

            let text = (ruler.width * value / dist / canvas.zoom.scale).toFixed(2)
            ruler.element.text(text)
        } else {
            ruler.element.text(0)
        }
    }


    /********************* Private functions ************************/

    /**
     * Builds the tree into a dendrogram
     * @returns {function} building function
     */
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
                    node.y = node.depth * graph.scale.horizontal.value * graph.scale.horizontal.scalingFactor
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

    /**
     * Makes a node active
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
        const transform = d3.zoomIdentity.translate(canvas.zoom.x, canvas.zoom.y).scale(canvas.zoom.scale)
        let applyScale

        graph.element.attr("transform", "translate(" + [canvas.zoom.x, canvas.zoom.y] + ") scale(" + canvas.zoom.scale + ")")

        svg.element
            .call(zoom.transform, transform)
            .call(zoom
                .scaleExtent([0.1, 100])
                .filter((event) => {
                    if (event.type === 'mousedown') applyScale = false
                    if (event.type === 'wheel') applyScale = true
                    return true
                })
                .on("zoom", function (event) {
                    canvas.zoom.x = event.transform.x
                    canvas.zoom.y = event.transform.y
                    canvas.zoom.scale = event.transform.k

                    graph.element.attr("transform", event.transform)

                    const zoomElem = document
                        .getElementById("graph")
                        .getAttribute("transform")

                    const scaleAttr = zoomElem.substring(zoomElem.indexOf("scale"), zoomElem.length)
                    const scaleValue = scaleAttr.substring(scaleAttr.indexOf("(") + 1, scaleAttr.length - 1)

                    if (applyScale) applyScaleText()
                }))
    }

    return {
        context,
        build,
        draw,
        addNodeStyle,
        addLinkStyle,
        applyScaleText,
        addInternalLabels,
        alignNodes,
        addLinkLabels,
        applyLinearScale,
        applyLogScale,
        horizontalRescale,
        verticalRescale
    }
}()