const radial = function () {

    const type = 'radial'
    const scaler = {
        linear: linearScale(),
        log: logScale()
    }

    const margin = {
        top: 20,
        right: 90,
        bottom: 30,
        left: 90
    }
    const canvas = {
        container: null,
        width: window.innerWidth,
        height: window.innerHeight,
        margin: margin,
        zoom: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 1
        }
    }
    const data = {
        tree: null,
        input: null
    }
    const graph = {
        element: null,
        nodes: null,
        links: null,
        style: {
            leafLabels: true,
            linkLabels: false,
            parentLabels: false,
            labels_size: 12,
            links_size: 2,
            nodes_size: 3,
            barChart: false,
            spread: false
        },
        scale: linearScale()
    }
    let isDraw = false
    const ruler = {
        container: null,
        element: null,
        visible: false,
        width: canvas.width * 0.15,
        x: canvas.height - 150,
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
        if(!input) throw new Error('Please insert tree file first.')
        data.input = input
        const strat = d3.stratify().id(d => d.target).parentId(d => d.source)(input.links);
        data.tree = d3.hierarchy(strat, d => d.children);
        context.build = radial()

        data.tree = context.build(data.tree)

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
                .attr("id", "svg_graph")
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
        isDraw = true
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

        if (!graph.style.barChart) updateLeafLabels()
        else {
            graph.element.selectAll(".leafLabelIsolates text").remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        updateLinkLabels(graph.style.linkLabels)
        updateInternalLabels(graph.style.parentLabels)
    }

    function centerGraph(node) {
        let el = node, curr = node
        while (curr.parent !== null) {
            if (!curr.visibility) {
                el = curr
            }
            curr = curr.parent
        }
        canvas.zoom.x = canvas.width / 2 - el.x
        canvas.zoom.y = canvas.height / 2 - el.y
        canvas.zoom.scale = 1
        addRadialZoom()
        return el.data.id
    }

    function search(id) {
        if (id === "") return
        let collapsedId = id
        data.tree.each(d => {
            if (d.data.id === id) {
                collapsedId = centerGraph(d)
            }
        })
        let selected = graph.nodes
            .select(`#node${collapsedId}`)
            .selectAll('circle')
        selected
            .attr('r', graph.style.nodes_size * 3)
            .style('stroke', 'blue')
            .style('fill', 'blue')
        selected.transition()
            .duration(1500)
            .attr('r', graph.style.nodes_size)
            .style('stroke', d => d.data.data.color)
            .style('fill', d => d.data.data.color)
    }

    /********************* Collapse functions *********************/
    function log(base, number) {
        return Math.log(number) / Math.log(base);
    }

    function getTriangle(node) {
        let length = node.leaves.length - 1 || 1
        let point = length / 2 * 15,
            label = node.leaves.length !== 1 ?
                node.leaves[0] + '...' + node.leaves[length] :
                '...' + node.leaves[0]
        let base = 1.1
        point = log(base, point / (node.depth || 1))

        return {point, label}
    }

    function collapse(parent, children) {
        parent.visibility = false
        if (!children) return
        collapseAux(children)

        let {point, label} = getTriangle(parent)

        graph.element.select(`#node${parent.data.id}`).remove()
        let node = nodesAttrs(graph.nodes.data(parent))

        node.append('polygon')
            .attr('points', d => `0,0 100,${point} 100,${-point}`)
            .attr('transform', `rotate(${parent.angle})`)
            .style('fill', 'black')
        node.append('text')
            .text(label)
            .attr('transform', `rotate(${parent.angle})`)
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
        if (!children) return
        expandAux(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.nodes.data(parent))

        addNodeStyle()
        addLinkStyle()
        updateInternalLabels(graph.style.parentLabels)
        updateLinkLabels(graph.style.linkLabels)
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
            const nodeContainer = nodesAttrs(graph.nodes.data(child))

            if (graph.style.barChart) {
                addBarCharts(child)
                addLeafLabelsNotIsolates()
            }

            addNodeStyle()
            addLinkStyle()
            updateLinkLabels(graph.style.linkLabels)
            updateInternalLabels(graph.style.parentLabels)

            if (!child.visibility) {
                let {point, label} = getTriangle(child)

                nodeContainer.append('polygon')
                    .attr('points', d => `0,0 100,${point} 100,${-point}`)
                    .attr('transform', `rotate(${child.angle})`)
                    .style('fill', 'black')
                nodeContainer.append('text')
                    .text(label)
                    .attr('transform', `rotate(${child.angle})`)
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
        if (d.children && !graph.style.barChart) updateLeafLabels()
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
    function linearScale(saved) {
        const linear = saved ? saved : {
            value: 500,
            limits: [50, 2000],
            scalingFactor: 1,
            step: 25
        }

        function increment() {
            linear.value += linear.step
        }
        function decrement() {
            linear.value -= linear.step
        }

        linear.increment = increment
        linear.decrement = decrement
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
    function logScale(saved) {
        let value = 1.1
        const log = saved ? saved : {
            value: 500,
            limits: [61, 2000],
            scalingFactor: 0.5,
            step: 40,
        }

        function increment() {
            log.step *= value
            log.value += log.step
        }
        function decrement() {
            log.value -= log.step
            log.step /= value
        }

        log.increment = increment
        log.decrement = decrement
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
        update(data.tree)

        if (graph.style.barChart) {
            graph.element.selectAll(".leafLabelIsolates").remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        addNodeStyle()
        addLinkStyle()

        updateInternalLabels(graph.style.parentLabels)
    }

    /**
     * Changes the scaling of the graph to logarithmic scale
     */
    function applyLogScale() {
        graph.element.selectAll('.linkLabel').remove()
        graph.links.selectAll('.link').remove()
        graph.nodes.selectAll('.node').remove()
        graph.element.selectAll('g').remove()

        const last = graph.scale.value
        graph.scale = logScale()
        applyScale(data.tree, last)
        applyScaleText()
        update(data.tree)

        if (graph.style.barChart) {
            graph.element.selectAll(".leafLabelIsolates").remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        addNodeStyle()
        addLinkStyle()

        updateInternalLabels(graph.style.parentLabels)
    }

    function rescale(increment) {
        if (increment) {
            if (graph.scale.value < graph.scale.limits[1]) {
                let last = graph.scale.value
                graph.scale.increment()
                setNewPositions(last)
                applyScaleText()
            }
        } else {
            if (graph.scale.value > graph.scale.limits[0]) {
                let last = graph.scale.value
                graph.scale.decrement()
                setNewPositions(last)
                applyScaleText()
            }
        }
    }

    function setNewPositions(last) {
        data.tree.eachBefore(d => {
            if (d.parent) {
                d.x = (d.x / last) * graph.scale.value
                d.y = (d.y / last) * graph.scale.value

                const node = document.getElementById('node' + d.data.id)
                if (!node) return

                node.setAttribute('transform', 'translate(' + [d.x, d.y] + ')')

                const link = document.getElementById('link' + d.data.id)
                const line = link.querySelector('line')
                if (line) {
                    line.setAttribute('x1', d.parent.x)
                    line.setAttribute('y1', d.parent.y)
                    line.setAttribute('x2', d.x)
                    line.setAttribute('y2', d.y)
                }

                if (graph.style.linkLabels) {
                    if (document.getElementById('label' + d.data.id)) {
                        document.getElementById('label' + d.data.id)
                            .setAttribute('x', ((d.parent.x + d.x) / 2 - 15).toString())
                        document.getElementById('label' + d.data.id)
                            .setAttribute('y', ((d.parent.y + d.y) / 2 - 15).toString())
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
            .style("fill", d => d.data.data.color || '#000000')
            .style("stroke", d => d.data.data.color || '#000000')
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
            .style("fill", d => d.data.data.color || '#000000')
            .style("stroke", d => d.data.data.color || '#000000')
    }

    /**
     * Changes the color of an node.
     * @param nodeId the node to change the color
     * @param color the color to apply to the node
     */
    function changeNodeColor(nodeId, color) {
        graph.nodes
            .selectAll("circle")
            .each(function (d) {
                if (d.data.id === nodeId) {
                    d.data.data.color = color;
                    addNodeStyle();
                }
            });
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
            .selectAll("text")
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
        graph.style.parentLabels = !graph.style.parentLabels
        updateInternalLabels(graph.style.parentLabels)
    }

    /**
     * Adds labels to the links.
     */
    function addLinkLabels() {
        graph.style.linkLabels = !graph.style.linkLabels
        updateLinkLabels(graph.style.linkLabels)
    }

    /**
     * Adds labels to the leaf nodes that dont have bar charts.
     */
    function addLeafLabelsNotIsolates() {
        graph.element.selectAll(".node--leaf:not(.isolates) text").remove()

        graph.element.selectAll(".node--leaf:not(.isolates)")
            .append("text")
            .attr('class', 'leafLabelNoIsolates')
            .attr("dx", 10)
            .attr("dy", ".31em")
            .attr('transform', d => `rotate(${d.angle})`)
            .style("text-anchor", "start")
            .style("font", `${graph.style.labels_size}px sans-serif`)
            .text(d => d.data.id)
            .on("mouseover", mouseOveredRadial(true))
            .on("mouseout", mouseOveredRadial(false))
    }


    /**
     * Adds labels to the leaf nodes.
     */
    function updateLeafLabels() {
        graph.nodes.selectAll(".node--leaf text").remove();

        graph.nodes
            .selectAll(".node--leaf")
            .append("text")
            .attr('class', 'leafLabel')
            .attr("dx", 10)
            .attr("dy", ".31em")
            .attr('transform', d => `rotate(${d.angle})`)
            .style("text-anchor", "start")
            .style("font", `${graph.style.labels_size}px sans-serif`)
            .text(d => d.data.id)
            .on("mouseover", mouseOveredRadial(true))
            .on("mouseout", mouseOveredRadial(false))
    }

    /**
     * Adds internal labels on the nodes, after an update.
     */
    function updateInternalLabels(active) {
        graph.element.selectAll(".internal-label").remove()
        if (active) {
            graph.element
                .selectAll(".node--internal")
                .append("text")
                .attr("class", "internal-label")
                .attr("x", -13)
                .attr("y", 13)
                .style("text-anchor", "end")
                .style("font", `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.id);
        }
    }

    /**
     * Adds labels to the links, after an update.
     */
    function updateLinkLabels(active) {
        graph.element.selectAll(".gLink text").remove()
        if (active) {
            graph.element.selectAll(".gLink")
                .append("text")
                .attr("x", d => (d.parent.x + d.x) / 2 - 5)
                .attr("y", d => (d.parent.y + d.y) / 2 - 5)
                .attr("text-anchor", "middle")
                .attr("class", "linkLabel")
                .attr("id", d => "label" + d.data.id)
                .style("font", `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.data.value)
        }
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

    /**
     * Applies the spread function to the tree, to separate the nodes.
     */
    function addSpread() {
        graph.style.spread = !graph.style.spread
        build(data.input)
        draw("#container", data.tree)
        addNodeStyle()
        addLinkStyle()

        canvas.container.select('svg').select('#graph').selectAll(".gLink")
        updateLinkLabels(graph.style.linkLabels)
        updateInternalLabels(graph.style.parentLabels)
    }


    /********************* Private functions *********************/

    function spread(root) {
        if (!root.children) {
            root.spread = root.data.data.value
            return root.data.data.value
        } else {
            root.spread = root.data.data.value || 0;
            root.children.forEach(w => {
                root.spread += root.data.data.value + spread(w)
            });
            root.spread /= parseFloat(root.children.length) // ??
            return root.spread
        }
    }

    function radial() {
        const pi = Math.PI

        function angle(node) {
            let px = (node.parent?.x || 0),
                py = (node.parent?.y || 0),
                y = node.y - py,
                x = node.x - px

            if (x === 0 && y === 0) return node.parent?.angle || 0
            let value = radToDeg(Math.atan(y / x))
            if (node.parent && node.x < node.parent.x) value += 180
            return value
        }

        function radToDeg(radian) {
            let pi = Math.PI;
            return radian * (180 / pi);
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

            if (graph.style.spread) spread(root)

            root.rightBorder = 0;
            root.alpha = 0;
            root.wedgeSize = 2 * pi;
            root.x = 0;
            root.y = 0;

            root.eachBefore(parent => {
                parent.angle = angle(parent)
                parent.visibility = true
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

    /**
     * Applies the filter to add bar charts.
     * @param filter the filter to be applied
     */
    function applyFilter(filter){
        graph.style.barChart.filter = filter
        filter.transform(filter.name, filter.line, filter.column, filter.colors)
        addLeafLabelsNotIsolates()
    }

    /**
     * Builds bar charts to be added to the leaf nodes.
     * @param name the name of the filter
     * @param lines the isolates
     * @param columns the categories to be added to the bar charts
     * @param colors the colors of the sections
     */
    function buildBarChart(name, lines, columns, colors) {
        graph.element.selectAll('rect').remove()
        graph.element.selectAll(".leafLabel").remove()
        graph.element.selectAll(".leafLabelIsolates text").remove()
        graph.element.selectAll(".addBarChartLabel text").remove()
        graph.element.selectAll(".isolates").selectAll("g").remove()
        graph.style.barChart = true

        const profilesId = lines[0]
        const columns_data = []
        const order_data = []
        const map = new Map()

        const stack = d3.stack()
            .keys(["isolates"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)

        function getColor(name) {
            for (let i = 0; i < colors.length; i++) {
                if (colors[i].name === name) return colors[i].color
            }
        }

        if (name === "&") {
            let columns_names
            columns.forEach((c, i) => {
                if (i === 0) columns_names = data.input.metadata[c] + ','
                else if (i === c.length - 1) columns_names += data.input.metadata[c]
                else columns_names += data.input.metadata[c] + ','
            })
            columns_names = columns_names.slice(0, columns_names.length - 1)

            data.input.nodes.forEach(node => {
                let isolates = [], profiles
                if (node.isolates && node.isolates.length > 0) {
                    const currClass = document.getElementById('node' + node.key)
                        .getAttribute("class")
                    document.getElementById('node' + node.key)
                        .setAttribute("class", `${currClass} isolates`)

                    node.isolates.forEach(iso => columns.forEach((c, i) => {
                        if (i === 0) isolates.push(iso[c] + ',')
                        else if (i === c.length - 1) isolates.push(iso[c])
                        else {
                            const last = isolates.pop()
                            isolates.push(last + iso[c] + ',')
                        }
                    }))
                    isolates = isolates.map(i => i.slice(0, i.length - 1))

                    node.isolates.forEach(iso => profiles = iso[profilesId])

                    columns_data.push({
                        'category': columns_names,
                        'isolates': isolates,
                        'profiles': profiles
                    })

                } else {
                    const currClass = document.getElementById('node' + node.key)
                        .getAttribute("class")
                    document.getElementById('node' + node.key)
                        .setAttribute("class", `${currClass} not-isolates`)
                }
            })
        } else {
            columns.forEach(col => {
                data.input.nodes.forEach(node => {
                    if (node.isolates && node.isolates.length > 0) {
                        const currClass = document.getElementById('node' + node.key)
                            .getAttribute("class")
                        document.getElementById('node' + node.key)
                            .setAttribute("class", `${currClass} isolates`)

                        node.isolates.forEach(iso => {
                            columns_data.push({
                                'category': data.input.metadata[col],
                                'isolates': iso[col],
                                'profiles': iso[profilesId]
                            })
                        })
                    } else {
                        const currClass = document.getElementById('node' + node.key)
                            .getAttribute("class")
                        document.getElementById('node' + node.key)
                            .setAttribute("class", `${currClass} not-isolates`)
                    }
                })
            })
        }

        graph.element.selectAll(".isolates").each(d => {
            columns_data.forEach(item => {
                if (d.data.id === item.profiles) order_data.push(item)
            })
        })

        if (name === "&") {
            stack(order_data)[0].forEach(d => {
                const counts = {}
                d.data.isolates.forEach(x => { counts[x] = (counts[x] || 0) + 1 })

                function valuesToArray(obj) {
                    const result = []
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) result.push({ 'isolate': key, 'counter': obj[key] })
                    }
                    return result
                }
                const data = {
                    'category': d.data.category,
                    'isolates': valuesToArray(counts),
                    'profiles': d.data.profiles
                }
                map.set(d.data.profiles, data)
            })
        } else {
            stack(order_data)[0].forEach(d => {
                if (map.has(d.data.profiles)) {
                    const existing = map.get(d.data.profiles)
                    existing.forEach((item, i) => {
                        if (item.isolates === d.data.isolates) {
                            existing[i].numberOfIsolates = existing[i].numberOfIsolates + 1
                            const data = Array.from(existing)
                            map.set(d.data.profiles, data)
                        } else {
                            const data = Array.from(existing)
                            d.data.numberOfIsolates = 1
                            data.push(d.data)
                            map.set(d.data.profiles, data)
                        }
                    })
                } else {
                    d.data.numberOfIsolates = 1
                    const data = Array.of(d.data)
                    map.set(d.data.profiles, data)
                }
            })
        }

        graph.element
            .selectAll(".isolates")
            .append("g")
            .each(function (d) {
                d3.select(this)
                    .selectAll("rect")
                    .data(map)
                d.data.data.barChart = null
            })

        let w = 30, lastX = 0, lastWidth = 5, totalW = 0, rotate

        const xScale = d3.scaleLog()
            .domain([0.5, 50])
            .range([0, 50])

        if (name === "&") {
            map.forEach((isolate, profile) => {
                const node = document.getElementById('node' + profile).querySelector("g")
                lastX = 0
                lastWidth = 5
                totalW = 0

                graph.nodes
                    .selectAll("circle")
                    .each(function (d) {
                        if (d.data.id === profile) rotate = d.angle
                    })

                isolate.isolates.forEach(item => {
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                    rect.setAttribute("y", "-5")
                    rect.setAttribute("height", "11")
                    rect.setAttribute("class", "barChart")
                    rect.setAttribute('transform', `rotate(${rotate})`)
                    rect.setAttribute("fill", getColor(item.isolate))

                    lastX += lastWidth
                    rect.setAttribute("x", lastX.toString())

                    lastWidth = xScale(item.counter * w)
                    totalW += lastWidth
                    rect.setAttribute("width", lastWidth.toString())

                    node.appendChild(rect)
                    graph.nodes
                        .selectAll("circle")
                        .each(function (d) {
                            if (d.data.id === profile) {
                                rectOf(d, rect)
                            }
                        })
                })

                d3.select(node)
                    .append("text")
                    .attr("class", "leafLabelIsolates")
                    .attr("dx", totalW + 10)
                    .attr("dy", ".31em")
                    .attr('transform', d => `rotate(${d.angle})`)
                    .style("text-anchor", "start")
                    .style("font", `${graph.style.labels_size}px sans-serif`)
                    .text(d => d.data.id)
                    .on("mouseover", mouseOveredRadial(true))
                    .on("mouseout", mouseOveredRadial(false))
            })
        } else {
            map.forEach((isolate, profile) => {
                const node = document.getElementById('node' + profile).querySelector("g")
                lastX = 0
                lastWidth = 5
                totalW = 0

                graph.nodes
                    .selectAll("circle")
                    .each(function (d) {
                        if (d.data.id === profile) rotate = d.angle
                    })

                isolate.forEach(item => {
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
                    rect.setAttribute("y", "-5")
                    rect.setAttribute("height", "11")
                    rect.setAttribute("class", "barChart")
                    rect.setAttribute('transform', `rotate(${rotate})`)
                    rect.setAttribute("fill", getColor(item.isolates))

                    lastX += lastWidth
                    rect.setAttribute("x", lastX.toString())

                    lastWidth = xScale(item.numberOfIsolates * w)
                    totalW += lastWidth
                    rect.setAttribute("width", lastWidth.toString())

                    node.appendChild(rect)
                    graph.nodes
                        .selectAll("circle")
                        .each(function (d) {
                            if (d.data.id === profile) {
                                rectOf(d, rect)
                            }
                        })
                })

                d3.select(node)
                    .append("text")
                    .attr('class', 'leafLabelIsolates')
                    .attr("dx", totalW + 10)
                    .attr("dy", ".31em")
                    .attr('transform', d => `rotate(${d.angle})`)
                    .style("text-anchor", "start")
                    .style("font", `${graph.style.labels_size}px sans-serif`)
                    .text(d => d.data.id)
                    .on("mouseover", mouseOveredRadial(true))
                    .on("mouseout", mouseOveredRadial(false))
            })
        }
    }

    function rectOf(node, rect) {
        let rectObj = {
            width: rect.attributes['width'].nodeValue,
            height: rect.attributes['height'].nodeValue,
            fill: rect.attributes['fill'].nodeValue,
            x: rect.attributes['x'].nodeValue,
            y: rect.attributes['y'].nodeValue
        }
        if (node.data.data.barChart) node.data.data.barChart.push(rectObj)
        else node.data.data.barChart = [rectObj]
    }

    /**
     * Draws the bar charts after an update.
     * @param node the node to add the bar chart
     */
    function addBarCharts(node) {
        graph.element.selectAll(".addBarChartLabel text").remove()

        if (!node.children && node.data.data.barChart) {
            if (!graph.element.select(`#node${node.data.id}`).selectAll('g').empty()) {
                graph.element.select(`#node${node.data.id}`).selectAll('g').remove()
            }
            const nodeElement = graph.element.select(`#node${node.data.id}`)
                .attr("class", "node node--leaf node--norm isolates")
                .append("g")

            let totalWidth = 0
            for (let i = 0; i < node.data.data.barChart.length; i++) {
                const rect = node.data.data.barChart[i]
                nodeElement
                    .append("rect")
                    .attr("width", d => {
                        totalWidth += Number.parseInt(rect.width)
                        return rect.width
                    })
                    .attr("height", rect.height)
                    .attr("fill", rect.fill)
                    .attr("x", rect.x)
                    .attr("y", rect.y)
                    .attr("transform", `rotate(${node.angle})`)
                    .attr("class", "barChart")

                if (i === node.data.data.barChart.length - 1) {
                    nodeElement
                        .append("text")
                        .attr("class", "addBarChartLabel")
                        .attr("dx", totalWidth + 10)
                        .attr("dy", ".31em")
                        .attr('transform', d => `rotate(${d.angle})`)
                        .style("text-anchor", "start")
                        .style("font", `${graph.style.labels_size}px sans-serif`)
                        .text(d => d.data.id)
                        .on("mouseover", mouseOveredRadial(true))
                        .on("mouseout", mouseOveredRadial(false))
                }
            }
        }
    }

    function save() {
        const tree = []
        data.tree.eachBefore(d => {
            const node = {
                source: d.parent ? d.parent.data.id : null,
                target: d.data.id,
                value: d.data.data.value,
                color: d.data.data.color,
                barChart: d.data.data.barChart
            }
            tree.push(node)
        })

        data.input.links = tree

        return {
            type,
            data: {
                tree,
                input: data.input
            },
            graph: {
                nodeSize: graph.nodeSize,
                style: graph.style,
                scale: scaler
            },
            canvas: {
                zoom: canvas.zoom
            }
        }
    }

    function load(container, save) {
        scaler.linear = save.graph.scale.linear
        scaler.log = save.graph.scale.log

        graph.style = save.graph.style
        graph.nodeSize = save.graph.nodeSize

        canvas.zoom = save.canvas.zoom

        scaler.linear = linearScale(save.graph.scale.linear)
        scaler.log = logScale(save.graph.scale.log)
        graph.scale = scaler.linear

        let view = build(save.data.input)
        draw(container, view.tree)

        addNodeStyle()
        addLinkStyle()
    }

    return {
        type,
        context,
        build,
        draw,
        search,

        addNodeStyle,
        addLinkStyle,
        changeNodeColor,
        changeNodeSize,
        changeLinkSize,
        changeLabelsSize,

        addInternalLabels,
        addLinkLabels,

        applyLinearScale,
        applyLogScale,

        rescale,

        getNodes,
        buildBarChart,
        applyFilter,
        isDraw,
        addSpread,

        save,
        load
    }
}()