

const radial = function () {
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
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
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
    }

    const context = {
        canvas: canvas,
        build: null,
        data: data,
        svg: svg
    }

    const css =
        `.link {
            fill: none;
            stroke: #808080;
            stroke-width: 2px;
        }
        
        .link--active {
            stroke: blue !important;
            stroke-width: 3px;
        }
        
        .label--active {
            fill: blue;
            font-weight: bold;
            stroke: blue;
        }
        
        .text-label {
            stroke: black;
            font-size: 12px;
            fill: black;
        }`

    function build(input) {
        const strat = d3.stratify().id((d) => d.target).parentId((d) => d.source)(input.links);
        data.root = d3.hierarchy(strat, d => d.children);
        context.build = radial()

        data.tree = context.build(data.root)

        return data;
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

        // apply css
        svg.element.select('#css').remove()
        svg.element.append("style").attr('id', 'css').text(css);
        // apply xmlns
        svg.element.attr('xmlns', 'http://www.w3.org/2000/svg')

        graph.element = svg.element
            .append("g")
            .attr("id", "graph")
            .attr("transform", "translate(" + [canvas.zoom.x, canvas.zoom.y] + ")")

        update(tree)

        addRadialZoom()

        horizontalScale()
        ruler.visible = true
        applyScaleText()
    }

    function update(tree) {
        if (graph.nodes && !graph.nodes.empty()) graph.nodes.remove()
        if (graph.links && !graph.links.empty()) graph.links.remove()

        graph.links = graph.element.append('g').attr('id', 'linksContainer')
        graph.nodes = graph.element.append('g').attr('id', 'nodesContainer')

        let nodes = tree.descendants()
        let links = tree.descendants().slice(1)

        nodesAttrs(graph.nodes.selectAll('.node').data(nodes).enter())
        linksAttr(graph.links.selectAll('.link').data(links).enter())

        addLeafLabels()
    }


    /********************* Collapse functions *********************/
    function log(base, number) {
        return Math.log(number) / Math.log(base);
    }

    function angle(node) {
        let px = (node.parent?.x | 0), py = (node.parent?.y | 0)
        let y = node.y - py, x = node.x - px
        let value = radToDeg(Math.atan(y/x))
        if (node.parent && node.x < node.parent.x) value += 180
        return value
    }

    function radToDeg(radian) {
        let pi = Math.PI;
        return radian * (180/pi);
    }

    function getTriangle(node) {
        let length = node.leaves.length - 1
        let point = length / 2 * 15,
            label = node.leaves[0] + '...' + node.leaves[length]
        let base = 1.1
        point = log(base, point / (node.depth || 1))

        return { point, label }
    }

    function collapse(parent, children) {
        parent.visibility = false
        if (!children) return
        collapseAux(children)

        let {point, label} = getTriangle(parent)

        graph.element.select(`#node${parent.data.id}`).remove()
        let node = nodesAttrs(graph.nodes.data(parent))
        let rot = angle(parent)

        node.append('polygon')
            .attr('points', d => `0,0 100,${point} 100,${-point}`)
            .attr('transform', `rotate(${rot})`)
            .style('fill', 'black')
        node.append('text')
            .text(label)
            .attr('transform', `rotate(${rot})`)
            .attr('dx', '100')
            .attr('dy', '3')
    }

    function collapseAux(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            let id = child.data.id !== undefined ? child.data.id : child.id
            graph.nodes.select(`#node${id}`).remove()
            graph.links.select(`#link${id}`).remove()
            if (child.children) {
                collapseAux(child.children)
            }
            if (graph.style.linkLabels) graph.element.select(`#label${id}`).remove();
        }
    }

    function expand(parent, children) {
        parent.visibility = true
        expandAux(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.nodes.data(parent))
    }

    function expandAux(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            if (child.visibility === undefined)
                child.visibility = true
            if (child.visibility && child.children) {
                expandAux(child.children)
            }

            linksAttr(graph.links.data(child))
            nodesAttrs(graph.nodes.data(child))

            if (!child.visibility) {
                let {point, label} = getTriangle(child)

                graph.element.select(`#node${child.data.id}`).remove()
                let node = nodesAttrs(graph.nodes.data(child))
                let rot = angle(child)

                node.append('polygon')
                    .attr('points', d => `0,0 100,${point} 100,${-point}`)
                    .attr('transform', `rotate(${rot})`)
                    .style('fill', 'black')
                node.append('text')
                    .text(label)
                    .attr('transform', `rotate(${rot})`)
                    .attr('dx', '100')
                    .attr('dy', '3')
            }
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


    /********************* Rescale Graph functions ************************/

    /**
     * Applies the scale to the coordinates of the tree
     */
    function applyScale(tree, last) {
        tree.eachBefore(d => {
            d.x = (d.x / last) * graph.scale.value
            d.y = (d.y / last) * graph.scale.value
        })
    }

    /**
     * Linear scale representation
     * @returns {{
     *  scalingFactor: number,
     *  step: number,
     *  value: number,
     *  limits: number[],
     *  decrement: function,
     *  increment: function
     * }}
     */
    function linearScale() {
        const linear = {
            value: 500,
            limits: [50, 2000],
            scalingFactor: 1,
            step: 25,
            decrement: decrement,
            increment: increment
        }

        function increment() {
            linear.value += linear.step
        }

        function decrement() {
            linear.value -= linear.step
        }

        return linear
    }

    /**
     * Logarithmic scale representation
     * @returns {{
     *  scalingFactor: number,
     *  step: number,
     *  value: number,
     *  limits: number[],
     *  decrement: function,
     *  increment: function
     * }}
     */
    function logScale() {
        let value = 1.1
        const log = {
            value: 500,
            limits: [61, 2000],
            scalingFactor: 0.5,
            step: 40,
            decrement: decrement,
            increment: increment
        }

        function increment() {
            log.step *= value
            log.value += log.step
        }

        function decrement() {
            log.value -= log.step
            log.step /= value
        }

        return log
    }

    /**
     * Changes the scaling of the graph to linear scale
     */
    function applyLinearScale() {
        graph.element.selectAll('.linkLabel').remove()
        graph.element.selectAll('.link').remove()
        graph.element.selectAll('.node').remove()
        graph.element.selectAll('g').remove()

        const last = graph.scale.value
        graph.scale = linearScale()
        applyScale(data.tree, last)
        applyScaleText()
        update(data.root)
        addNodeStyle()
        addLinkStyle()
    }

    /**
     * Changes the scaling of the graph to logarithmic scale
     */
    function applyLogScale() {
        graph.element.selectAll('.linkLabel').remove()
        graph.links.selectAll('.link').remove()
        graph.nodes.selectAll('.node').remove()
        // graph.element.selectAll('g').remove()

        const last = graph.scale.value
        graph.scale = logScale()
        applyScale(data.tree, last)
        applyScaleText()
        update(data.root)
        addNodeStyle()
        addLinkStyle()
    }

    function rescale(increment) {
        if (increment) {
            if (graph.scale.value > graph.scale.limits[0]) {
                let last = graph.scale.value
                graph.scale.decrement()
                setNewPositions(last)
                applyScaleText()
            }
        } else {
            if (graph.scale.value < graph.scale.limits[1]) {
                let last = graph.scale.value
                graph.scale.increment()
                setNewPositions(last)
                applyScaleText()
            }
        }
    }

    function setNewPositions(last) {
        data.root.eachBefore(d => {
            if (d.parent) {
                d.x = (d.x / last) * graph.scale.value
                d.y = (d.y / last) * graph.scale.value

                const node = document.getElementById('node' + d.data.id)
                if (!node) return

                node.setAttribute('transform', 'translate(' + [d.x, d.y] + ')')

                const link = document.getElementById('link' + d.data.id)
                const line = link.querySelector('line')
                line.setAttribute('x1', d.parent.x)
                line.setAttribute('y1', d.parent.y)
                line.setAttribute('x2', d.x)
                line.setAttribute('y2', d.y)

                if (graph.style.linkLabels) {
                    const label = link.querySelector('text')
                    if (label) {
                        label.setAttribute('x', ((d.parent.x + d.x) / 2 - 15).toString())
                        label.setAttribute('y', ((d.parent.y + d.y) / 2 - 15).toString())
                    }
                }
            }
        })
    }


    /********************* Style functions *********************/

    function nodesAttrs(nodes) {
        const container = nodes.append('g')
        container
            .attr("id", d => 'node' + d.data.id)
            .attr("class", d => "node" + (!d.children ?
                " node--leaf" : " node--internal") + (d.parent ? " node--norm" : " node--root"))
            .attr("transform", d => `translate(${[d.x, d.y]})`)
            .on("click", click)
        container.append("circle")
            .attr("r", graph.style.nodes_size || 3)
            .style("fill", d => d.data.color || '#000000')
            .style("stroke", d => d.data.color || '#000000')
        return container
    }

    function linksAttr(links) {
        const container = links.append('g')
        container
            .attr('id', d => 'link' + d.data.id)
            .attr('class', 'gLink')
        container
            .append("line")
            .attr("class", "link")
            .attr("x1", d => d.parent.x)
            .attr("y1", d => d.parent.y)
            .attr("x2", d => d.x)
            .attr("y2", d => d.y)
            .style("stroke-width", graph.style.links_size)
            .on("mouseover", mouseOveredRadial(true))
            .on("mouseout", mouseOveredRadial(false))
        return container
    }

    /**
     * Adds custom style to the nodes.
     */
    function addNodeStyle() {
        graph.nodes
            .selectAll("circle")
            .style("fill", d => d.data.color || '#000000')
            .style("stroke", d => d.data.color || '#000000')
    }

    /**
     * Changes the color of an node.
     * @param nodeId the node to change the color
     * @param color the color to apply to the node
     */
    function changeNodeColor(nodeId, color) {
        graph.nodes
            .select('#node' + nodeId)
            .select("circle")
            .each(d => d.data.color = color)
            .style("fill", d => d.data.color || '#000000')
            .style("stroke", d => d.data.color || '#000000')
    }

    /**
     * Changes the size of the nodes.
     * @param value the new size.
     */
    function changeNodeSize(value) {
        graph.style.nodes_size = value
        graph.nodes
            .selectAll("circle")
            .attr("r", value);
    }

    /**
     * Changes the size of the links.
     * @param value the new size.
     */
    function changeLinkSize(value) {
        graph.style.links_size = value
        graph.links
            .selectAll(".link")
            .style("stroke-width", value)
    }

    /**
     * Changes the size of the labels.
     * @param value the new size.
     */
    function changeLabelsSize(value) {
        graph.style.labels_size = value

        graph.element
            .selectAll(".label")
            .style("font", `${value}px sans-serif`)
    }

    /**
     * Adds custom style to the links.
     */
    function addLinkStyle() {
        graph.links
            .selectAll(".link")
            .style("fill", "none")
            .style("stroke-width", graph.style.links_size)
            .style("font", `${graph.style.labels_size}px sans-serif`);
    }

    /**
     * Adds labels to the parent nodes.
     */
    function addInternalLabels() {
        if (graph.style.parentLabels) {
            graph.nodes.selectAll(".node--internal text").remove();
            graph.style.parentLabels = false;
        } else {
            graph.nodes
                .selectAll(".node--internal")
                .append("text")
                .attr('class', 'label')
                .attr("x", -13)
                .attr("y", 13)
                .style("text-anchor", "end")
                .style("font", `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.id);

            graph.style.parentLabels = true;
        }
    }

    /**
     * Adds labels to the links.
     */
    function addLinkLabels() {
        if (graph.style.linkLabels) {
            graph.links.selectAll('.gLink text').remove();
            graph.style.linkLabels = false;
        } else {
            graph.links
                .selectAll('.gLink')
                .append("text")
                .attr('class', 'label')
                .attr("x", d => (d.parent.x + d.x) / 2 - 15)
                .attr("y", d => (d.parent.y + d.y) / 2 - 15)
                .attr("text-anchor", "middle")
                .style("font", `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.data.value);

            graph.style.linkLabels = true;
        }
    }

    /**
     * Adds labels to the leaf nodes.
     */
    function addLeafLabels() {
        graph.nodes.selectAll(".node--leaf text").remove();
        graph.nodes
            .selectAll(".node--leaf")
            .append("text")
            .attr('class', 'label')
            .attr("dx", d => d.x < Math.PI ? 10 : -10)
            .attr("dy", ".31em")
            .style("text-anchor", "start")
            .style("font", `${graph.style.labels_size}px sans-serif`)
            .text(d => d.data.id)
            .on("mouseover", mouseOveredRadial(true))
            .on("mouseout", mouseOveredRadial(false))
    }


    /********************* Ruler functions ************************/

    /**
     * Adds a horizontal scale.
     * A line to measure the link value and the text with the value
     */
    function horizontalScale() {
        if (svg.element.select('.horizontalScale')) svg.element.select('.horizontalScale').remove()
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
    function applyScaleText(scale) {
        if (data.tree.children) {
            const root = {
                x: data.tree.x,
                y: data.tree.y
            }
            const child = {
                x: data.tree.children[0].x,
                y: data.tree.children[0].y
            }

            let a = root.x - child.x;
            let b = root.y - child.y;
            const dist = Math.sqrt(a * a + b * b);

            let value = data.tree.children[0].data.data.value
            const applyScale = scale ? scale : canvas.zoom.scale
            let text = (ruler.width * value / dist / applyScale).toFixed(2)

            ruler.element.text(text)
        } else {
            ruler.element.text(0)
        }
    }


    /********************* Private functions *********************/

    function radial() {
        const pi = Math.PI

        function max(input) {
            return Math.max.apply(null, input);
        }

        function spreadFirst(root) {
            const ar = []
            if (!root.children) {
                root.spread = root.data.data.value
                return root.data.data.value
            } else {
                root.spread = root.data.data.value || 0;
                root.children.forEach(w => {
                    ar.push(spreadFirst(w))
                });
                root.spread += max(ar)
            }

            return root.spread;
        }

        function spreadSecond(root) {
            if (!root.children) {
                root.spread = root.data.data.value
                return root.data.data.value
            } else {
                root.spread = root.data.data.value || 0;
                root.children.forEach(w => {
                    root.spread += root.data.data.value + spreadSecond(w)
                });
                root.spread /= parseFloat(root.children.length) // ??
                return root.spread
            }
        }

        function radial(root) {
            //get leaves
            root.eachAfter(node => {
                if (!node.children)
                    node.leaves = [node];
                else {
                    node.leaves = []
                    node.children.forEach(child => {
                        if (!child.children)
                            node.leaves.push(child.data.id)
                        else
                            node.leaves.push(...child.leaves)
                    })
                }
            });

            //spreadFirst(root)
            spreadSecond(root)

            root.rightBorder = 0;
            root.alpha = 0;
            root.wedgeSize = 2 * pi;
            root.x = 0;
            root.y = 0;

            root.eachBefore(parent => {
                if (parent.children) {
                    // separation
                    parent.children.sort((a, b) => a.spread - b.spread)

                    parent.children.forEach(child => {
                        child.rightBorder = parent.rightBorder;

                        child.wedgeSize = (2 * pi * child.leaves.length) / root.leaves.length

                        child.alpha = child.rightBorder + (child.wedgeSize / 2);

                        child.x = parent.x + Math.cos(child.alpha) * child.data.data.value * graph.scale.value;
                        child.y = parent.y + Math.sin(child.alpha) * child.data.data.value * graph.scale.value;
                        parent.rightBorder = parent.rightBorder + child.wedgeSize;
                    })
                }
            })
            return root;
        }

        return radial;
    }

    function mouseOveredRadial(active) {
        return function (event, d) {
            d3.select(this).classed("label--active", active);

            do d3.select(d.linkNode).classed("link--active", active).raise();
            while (d = d.parent);
        };
    }

    function addRadialZoom() {
        const zoom = d3.zoom();
        const transform = d3.zoomIdentity.translate(canvas.zoom.x, canvas.zoom.y).scale(canvas.zoom.scale);

        graph.element.attr("transform", "translate(" + [canvas.zoom.x, canvas.zoom.y] + ") scale(" + canvas.zoom.scale + ")")

        svg.element
            .call(zoom.transform, transform)
            .call(zoom
                .scaleExtent([0.1, 100])
                .on("zoom", function (event) {
                    canvas.zoom.x = event.transform.x
                    canvas.zoom.y = event.transform.y
                    canvas.zoom.scale = event.transform.k

                    graph.element.attr("transform", event.transform)
                    applyScaleText()
                }))
    }


    /**
     * Returns the nodes names.
     * @returns {*[]} array with nodes names
     */
    function getNodes() {
        const nodes = []
        data.tree.each(d => nodes.push(d.data.id))
        return nodes
    }

    return {
        type: 'radial',
        context,
        build,
        draw,

        addNodeStyle,
        addLinkStyle,
        changeNodeColor,
        changeNodeSize,
        changeLinkSize,
        changeLabelsSize,

        addInternalLabels,
        // alignNodes,
        addLinkLabels,

        applyLinearScale,
        applyLogScale,

        rescale,

        getNodes
    }
}()
