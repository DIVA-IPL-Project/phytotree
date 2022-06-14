function dendrogramView() {

    const type = 'dendrogram'
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
            x: 100,
            y: 200,
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
            align: false,
            leafLabels: true,
            linkLabels: false,
            parentLabels: false,
            labels_size: 12,
            links_size: 2,
            nodes_size: 3,
            barChart: false
        },
        scale: scaler.linear,
        nodeSize: [15, 1]
    }
    let isDraw = false
    const ruler = {
        container: null,
        element: null,
        visible: false,
        width: canvas.width * 0.15,
        x: 70,
        y: 20,
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

    const css =
        `.linkPath {
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

    /********************* Main functions *********************/

    /**
     * Builds a dendrogram with the JSON data received.
     * @param input the JSON data.
     */
    function build(input) {
        if (!input) throw new Error('Please insert tree data first.')
        data.input = input
        const strat = d3.stratify().id(d => d.target).parentId(d => d.source)(input.links)

        // Build Tree
        data.tree = d3.hierarchy(strat, d => d.children)
        context.build = clusterTree().nodeSize(graph.nodeSize)
        data.tree = context.build(data.tree)

        // Apply scale
        applyScale(data.tree, 1)

        return data
    }

    /**
     * Draws the dendrogram
     * @param container the element to place the dendrogram
     * @param tree the tree to draw
     */
    function draw(container, tree) {
        canvas.container = d3.select(container)
        svg.element = canvas.container.select('svg')
        if (!svg.element.empty()) {
            svg.element.select('#graph').remove()
        } else {
            svg.element = canvas.container
                .append('svg')
                .attr('id', 'svg_graph')
        }

        // apply css
        svg.element.select('#css').remove()
        svg.element.append('style').attr('id', 'css').text(css)
        // apply xmlns
        svg.element.attr('xmlns', 'http://www.w3.org/2000/svg')

        // creates graph container
        graph.element = svg.element
            .append('g')
            .attr('id', 'graph')
            .attr('transform', 'translate(' + [canvas.zoom.x, canvas.zoom.y] + ')')

        update(tree) // draws the tree
        addDendrogramZoom() // adds move and zoom to graph

        //scale line
        horizontalScale()
        ruler.visible = true
        applyScaleText()

        isDraw = true
    }

    /**
     * Redraws the dendrogram after an update
     * @param tree the tree to draw
     */
    function update(tree) {
        if (graph.nodes && !graph.nodes.empty()) graph.nodes.remove()
        if (graph.links && !graph.links.empty()) graph.links.remove()

        graph.links = graph.element.append('g').attr('id', 'linksContainer')
        graph.nodes = graph.element.append('g').attr('id', 'nodesContainer')

        let nodes = tree.descendants()
        let links = tree.descendants().slice(1)

        linksAttr(graph.links.selectAll('.link').data(links, d => d.data.id).enter())
        nodesAttrs(graph.nodes.selectAll('.node').data(nodes).enter())

        if (!graph.style.barChart) updateLeafLabels(graph.style.leafLabels)
        else {
            graph.element.selectAll('.leafLabelIsolates text').remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        updateLinkLabels(graph.style.linkLabels)
        updateInternalLabels(graph.style.parentLabels)
    }

    /**
     * Places this node at the center of canvas and returns that node id.
     * @param {*} node to center around
     */
    function centerGraph(node) {
        let el = node, curr = node
        while (curr.parent !== null) {
            if (!curr.visibility) {
                el = curr
            }
            curr = curr.parent
        }
        canvas.zoom.x = canvas.width / 2 - el.y
        canvas.zoom.y = canvas.height / 2 - el.x
        canvas.zoom.scale = 1
        addDendrogramZoom()
        return el.data.id
    }

    /**
    * Searches the tree for node with this id and paints it with a different colour momentarily.
    * @param {*} id 
    */
    function search(id) {
        if (id === '') return
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

    /**
     * Applies a logarithmic function with this base to number.
     * @param {*} base of the logarithmic function
     * @param {*} number 
     */
    function log(base, number) {
        return Math.log(number) / Math.log(base)
    }

    /**
     * Gets the triangle that represents the collapsed nodes.
     * @param {*} node 
     */
    function getTriangle(node) {
        let length = node.leaves.length - 1
        let point = length / 2 * graph.nodeSize[0],
            label = node.leaves[0] + '...' + node.leaves[length]
        let base = 1.1
        point = log(base, point / (node.depth || 1))

        return {point, label}
    }

    /**
     * Collapses the children nodes into the parent node.
     * @param {*} parent 
     * @param {*} children 
     */
    function collapse(parent, children) {
        parent.visibility = false
        if (!children) return
        collapseChildren(children)

        let {point, label} = getTriangle(parent)

        graph.element.select(`#node${parent.data.id}`).remove()
        let node = nodesAttrs(graph.nodes.data(parent))

        node.append('polygon')
            .attr('points', d => `0,0 100,${point} 100,${-point}`)
            .style('fill', 'black')
        node.append('text')
            .text(label)
            .attr('dx', '105')
            .attr('dy', '3')
    }

    /**
     * Collapses the children nodes.
     * @param {*} children 
     */
    function collapseChildren(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            let id = child.data.id !== undefined ? child.data.id : child.id
            graph.nodes.select(`#node${id}`).remove()
            graph.links.select(`#link${id}`).remove()
            if (child.children) {
                collapseChildren(child.children)
            }
            if (graph.style.linkLabels) graph.element.select(`#label${id}`).remove()
        }
    }

    /**
     * Expands a collapsed node into its children and parent node.
     * @param {*} parent 
     * @param {*} children 
     */
    function expand(parent, children) {
        parent.visibility = true
        if (!children) return

        expandChildren(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.nodes.data(parent))

        addNodeStyle()
        addLinkStyle()
        updateInternalLabels(graph.style.parentLabels)
        updateLinkLabels(graph.style.linkLabels)
    }

    /**
     * Expands the children nodes.
     * @param {*} children 
     */
    function expandChildren(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            if (child.visibility === undefined)
                child.visibility = true

            if (child.visibility && child.children) {
                expandChildren(child.children)
            }

            linksAttr(graph.links.data(child))
            const nodeContainer = nodesAttrs(graph.nodes.data(child))

            if (graph.style.barChart) {
                addBarCharts(child)
                addLeafLabelsNotIsolates()
            }

            if (!child.visibility) {
                let {point, label} = getTriangle(child)
                nodeContainer
                    .append('polygon')
                    .attr('points', d => `0,0 100,${point} 100,${-point}`)
                    .style('fill', 'black')
                nodeContainer.append('text')
                    .text(label)
                    .attr('dx', '105')
                    .attr('dy', '3')
            }
        }
    }

    /**
     * Function to be added to all nodes to collapse or expand them.
     * @param event the event
     * @param d the node clicked
     */
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
        if (d.children && !graph.style.barChart) {
            updateLeafLabels(graph.style.leafLabels)
        }
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
            .attr('id', d => 'node' + d.data.id)
            .attr('class', d => 'node' + (!d.children ?
                ' node--leaf' : ' node--internal') + (d.parent ? ' node--norm' : ' node--root'))
            .attr('transform', d => 'translate(' + [d.y, d.x] + ')')
            .on('click', click)
        container
            .append('circle')
            .attr('r', 3)
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
            .attr('class', 'link')
        container.append('path')
            .attr('class', 'linkPath')
            .attr('d', d => `M${[d.parent.y, d.parent.x]} V${d.x} H${d.y}`)
            .on('mouseover', mouseOveredDendrogram(true))
            .on('mouseout', mouseOveredDendrogram(false))
        return container
    }

    /**
     * Adds custom style to the nodes.
     */
    function addNodeStyle() {
        graph.nodes
            .selectAll('circle')
            .style('fill', d => d.data.data.color || '#000000')
            .style('stroke', d => d.data.data.color || '#000000')
            .attr('r', `${graph.style.nodes_size}px`)
    }

    /**
     * Adds custom style to the links.
     */
    function addLinkStyle() {
        graph.links
            .selectAll('.linkPath')
            .style('fill', 'none')
            .style('stroke', 'darkgrey')
            .style('stroke-width', `${graph.style.links_size}px`)
            .style('font', `${graph.style.labels_size}px sans-serif`)
    }


    /**
     * Changes the size of the nodes.
     * @param value the new size.
     */
    function changeNodeSize(value) {
        graph.style.nodes_size = value

        graph.nodes
            .selectAll('circle')
            .attr('r', value)
    }

    /**
     * Changes the size of the links.
     * @param value the new size.
     */
    function changeLinkSize(value) {
        graph.style.links_size = value

        graph.links
            .selectAll('.linkPath')
            .style('stroke-width', value)
    }

    /**
     * Changes the size of the labels.
     * @param value the new size.
     */
    function changeLabelsSize(value) {
        graph.style.labels_size = value

        graph.element
            .selectAll('text')
            .style('font', `${value}px sans-serif`)
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
        graph.element.selectAll('.node--leaf:not(.isolates) text').remove()

        graph.element.selectAll('.node--leaf:not(.isolates)')
            .append('text')
            .attr('class', 'leafLabelNoIsolates')
            .attr('dy', 5)
            .attr('x', 13)
            .style('text-anchor', 'start')
            .style('font', `${graph.style.labels_size}px sans-serif`)
            .text(d => d.data.id)
            .on('mouseover', mouseOveredDendrogram(true))
            .on('mouseout', mouseOveredDendrogram(false))
    }

    /**
     * Adds labels to the leaf nodes.
     */
    function updateLeafLabels(active) {
        graph.element.selectAll('.node--leaf text').remove()
        if (active) {
            graph.element.selectAll('.node--leaf')
                .append('text')
                .attr('class', 'leafLabel')
                .attr('dy', 5)
                .attr('x', 13)
                .style('text-anchor', 'start')
                .style('font', `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.id)
                .on('mouseover', mouseOveredDendrogram(true))
                .on('mouseout', mouseOveredDendrogram(false))
        }
    }

    /**
     * Adds internal labels on the nodes, after an update.
     */
    function updateInternalLabels(active) {
        graph.element.selectAll('.internal-label').remove()
        if (active) {
            graph.element
                .selectAll('.node--internal')
                .append('text')
                .attr('class', ' internal-label')
                .attr('dy', 20)
                .attr('x', -13)
                .style('text-anchor', 'end')
                .style('font', `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.id)
        }
    }

    /**
     * Adds labels to the links, after an update.
     */
    function updateLinkLabels(active) {
        graph.element.selectAll('.link text').remove()
        if (active) {
            graph.element.selectAll('.link')
                .append('text')
                .attr('x', d => (d.parent.y + d.y) / 2)
                .attr('y', d => d.x - 5)
                .attr('text-anchor', 'middle')
                .attr('class', 'linkLabel')
                .attr('id', d => 'label' + d.data.id)
                .style('font', `${graph.style.labels_size}px sans-serif`)
                .text(d => d.data.data.value)
        }
    }

    /**
     * Aligns nodes by depth or by link weight
     */
    function alignNodes() {
        graph.style.align = !graph.style.align

        applyScale(data.tree)
        update(data.tree)
        applyScaleText()
        addNodeStyle()
        addLinkStyle()
        updateInternalLabels(graph.style.parentLabels)
        if (graph.style.barChart) {
            graph.element.selectAll('.leafLabelIsolates text').remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }
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
     * Changes the color of an node.
     * @param node the node to change the color
     * @param color the color to apply to the node
     */
    function changeNodeColor(node, color) {
        graph.nodes
            .selectAll(`#node${node} circle`)
            .each(function (d) {
                if (d.data.id === node) {
                    d.data.data.color = color
                    addNodeStyle()
                }
            })
    }


    /********************* Graph Scaling functions ************************/

    /**
     * Applies the scale to the coordinates of the tree.
     * @param {*} tree 
     * @param {*} last 
     */
    function applyScale(tree, last) {
        let horizontal = graph.scale.horizontal
        tree.eachBefore(d => {
            if (tree.data.id === d.data.id) return
            if (last) d.x *= graph.scale.vertical.value / last
            if (d.parent) {
                if (!graph.style.align) {
                    d.y = d.data.data.value * horizontal.value * horizontal.scalingFactor + d.parent.y
                } else d.y = d.depth * horizontal.scalingFactor * horizontal.value
            }
        })
    }

    /**
     * Changes the scaling of the graph to linear scale
     */
    function applyLinearScale() {
        let last = graph.scale.vertical.value
        graph.scale = scaler.linear
        applyScale(data.tree, last)
        applyScaleText()
        update(data.tree)

        if (graph.style.barChart) {
            graph.element.selectAll('.leafLabelIsolates').remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        addNodeStyle()
        addLinkStyle()
    }

    /**
     * Changes the scaling of the graph to logarithmic scale
     */
    function applyLogScale() {
        let last = graph.scale.vertical.value
        graph.scale = scaler.log
        applyScale(data.tree, last)
        applyScaleText()
        update(data.tree)

        if (graph.style.barChart) {
            graph.element.selectAll('.leafLabelIsolates').remove()
            graph.element.selectAll('circle').each(d => addBarCharts(d))
            addLeafLabelsNotIsolates()
        }

        addNodeStyle()
        addLinkStyle()
    }

    /**
     * Linear scale representation
     * @returns {{
     * horizontal: {scalingFactor: number, step: number, value: number, limits: number[]},
     * vertical: {scalingFactor: number, step: number, value: number, limits: number[]}
     * }}
     */
    function linearScale(saved) {
        const linear = {
            vertical: {
                value: 1,
                limits: [0.1, 10],
                scalingFactor: 1,
                step: 0.05
            },
            horizontal: {
                value: 1,
                limits: [0.1, 10],
                scalingFactor: 1000,
                step: 0.01
            }
        }

        if (saved) {
            if (saved.vertical)
                Object.assign(linear.vertical, saved.vertical)
            if (saved.horizontal)
                Object.assign(linear.horizontal, saved.horizontal)
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
    function logScale(saved) {
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

        if (saved) {
            if (saved.vertical)
                Object.assign(log.vertical, saved.vertical)
            if (saved.horizontal)
                Object.assign(log.horizontal, saved.horizontal)
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
     * Rescale svg graph area to fit tree graph.
     */
    function scaleSVGtoDIV(){
        if(document.getElementById('ruler-width')){
            var element = canvas.container.select('g').node()
            var height = element.getBoundingClientRect().height
            var auxHeight = canvas.height + canvas.margin.top + canvas.margin.bottom
            if(auxHeight > height)
                height = auxHeight
            var width = element.getBoundingClientRect().width
            var auxWidth = canvas.width + canvas.margin.left + canvas.margin.right
            if(auxWidth > width)
                width = auxWidth 

            document.getElementById('svg_graph').setAttribute('height', height)
            document.getElementById('svg_graph').setAttribute('width', width)
        }
    }

    /**
     * Rescales the graph vertically according to the applied scale
     * @param increment - true to increment - false to decrement
     */
    function verticalRescale(increment, rate) {
        for (var i = 0; i < rate; i++) {
            if (increment) {
                if (graph.scale.vertical.value > graph.scale.vertical.limits[0]) {
                    let last = graph.scale.vertical.value
                    graph.scale.vertical.increment()
                    setNewXPositions(last)
                }
            } else {
                if (graph.scale.vertical.value < graph.scale.vertical.limits[1]) {
                    let last = graph.scale.vertical.value
                    graph.scale.vertical.decrement()
                    setNewXPositions(last)
                }
            }
        }
    }

    /**
     * Rescales the graph horizontally according to the applied scale
     * @param increment - true to increment - false to decrement
     */
    function horizontalRescale(increment, rate) {
        for (var i = 0; i < rate; i++) {
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
    }

    /**
     * Applies the scale to the X axis
     * @param last - last scale value
     */
    function setNewXPositions(last) {
        data.tree.eachBefore(d => {
            d.x = d.x / last
            d.x = d.x * graph.scale.vertical.value

            let element = d3.select('#node' + d.data.id)
            if (!element) return
            element.attr('transform', 'translate(' + [d.y, d.x] + ')')
            if (d.parent) {
                d3.select('#link' + d.data.id)
                    .select('path')
                    .attr('d', 'M' + [d.parent.y, d.parent.x] + 'V' + d.x + 'H' + d.y)

                if (graph.style.linkLabels) {
                    if (d3.select('#label' + d.data.id)) {
                        d3.select('#label' + d.data.id)
                            .attr('y', (d.x - 5).toString())
                    }
                }
            }
        })
    }

    /**
     * Applies the scale to the Y axis
     */
    function setNewYPositions() {
        data.tree.eachBefore(d => {
            if (d.parent) {
                let horizontal = graph.scale.horizontal
                if (!graph.style.align)
                    d.y = horizontal.value * d.data.data.value * horizontal.scalingFactor + d.parent.y
                else
                    d.y = d.depth * horizontal.scalingFactor * horizontal.value

                let element = d3.select('#node' + d.data.id)
                if (!element) return
                element.attr('transform', 'translate(' + [d.y, d.x] + ')')

                if (d.parent) {
                    if (d3.select('#link' + d.data.id).select('path')) {
                        d3.select('#link' + d.data.id)
                            .select('path')
                            .attr('d', 'M' + [d.parent.y, d.parent.x] + 'V' + d.x + 'H' + d.y)
                    }

                    if (graph.style.linkLabels) {
                        if (d3.select('#label' + d.data.id)) {
                            d3.select('#label' + d.data.id)
                                .attr('x', ((d.parent.y + d.y) / 2).toString())
                        }
                    }
                }
            }
        })
    }


    /********************* Ruler functions ************************/

    /**
     * Adds a horizontal scale.
     * A line to measure the link value and the text with the value
     */
    function horizontalScale() {
        canvas.container.select('#container-extra').remove()
        var element = canvas.container.append('div').attr('id', 'container-extra')
                .append('svg').attr('id', 'svg-extra')
                .attr('width', canvas.container.select('#svg_graph').style("width"))
                .attr('height', 200)

        if (element.select('.horizontalScale')) element.select('.horizontalScale').remove()
        if (ruler.container) ruler.container.remove()

        ruler.container = element
            .append('g')
            .attr('transform', 'translate(' + [ruler.y, ruler.x] + ')')
            .attr('class', 'horizontalScale')

        ruler.container.append('path')
            .attr('d', d => 'M' + ruler.padding + ',10L' + (ruler.width + ruler.padding) + ',10')
            .attr('stroke-width', 1)
            .attr('stroke', '#000')

        ruler.element = ruler.container
            .append('text')
            .attr('id','ruler-width')
            .attr('class', 'ruler-text')
            .attr('x', ruler.width / 2 + ruler.padding)
            .attr('y', 36)
            .attr('font-family', 'sans-serif')
            .text('')
            .attr('font-size', '14px')
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
    }

    /**
     * Applies the value of line to the text
     */
    function applyScaleText(scale) {
        if (data.tree.children) {
            const root = data.tree.y
            const child = data.tree.children[0].y
            const dist = child - root
            let value = data.tree.children[0].data.data.value
            const applyScale = scale ? scale : canvas.zoom.scale
            let text = (ruler.width * value / dist / applyScale).toFixed(2)
            ruler.element.text(text)
        } else {
            ruler.element.text(0)
        }

        scaleSVGtoDIV()
    }


    /********************* Private functions ************************/

    /**
     * Builds the tree into a dendrogram
     * @returns {function} building function
     */
    function clusterTree() {
        function leafLeft(node) {
            var children
            while (children = node.children) node = children[0]
            return node
        }

        function leafRight(node) {
            var children
            while (children = node.children) node = children[children.length - 1]
            return node
        }

        function meanX(children) {
            return children.reduce((x, c) => x + c.x, 0) / children.length
        }

        function meanXReduce(x, c) {
            return x + c.x
        }

        function maxY(children) {
            return 1 + children.reduce(maxYReduce, 0)
        }

        function maxYReduce(y, c) {
            return Math.max(y, c.y)
        }

        let separation = (a, b) => a.parent === b.parent ? 1 : 2,
            dx = 1,
            dy = 1,
            nodeSize = false

        function cluster(root) {
            let previousNode,
                x = 0

            // First walk, computing the initial x & y values.
            root.eachAfter(function (node) {
                let children = node.children
                if (children) {
                    node.x = meanX(children)
                    node.y = maxY(children)
                } else {
                    node.x = previousNode ? x += separation(node, previousNode) : 0
                    node.y = 0
                    previousNode = node
                }
            })

            let left = leafLeft(root),
                right = leafRight(root),
                x0 = left.x - separation(left, right) / 2,
                x1 = right.x + separation(right, left) / 2


            // Second walk, normalizing x & y to the desired size.
            return root.eachAfter(function (node) {
                node.visibility = true
                node.x = (node.x - root.x) * dx
                node.y = (root.y - node.y) * dy

                if (!node.children)
                    node.leaves = [node]
                else {
                    node.leaves = []
                    node.children.forEach(child => {
                        if (!child.children)
                            node.leaves.push(child.data.id)
                        else
                            node.leaves.push(...child.leaves)
                    })
                }
            })
        }

        cluster.separation = function (x) {
            return arguments.length ? (separation = x, cluster) : separation
        }

        cluster.size = function (x) {
            return arguments.length ?
                (nodeSize = false, dx = +x[0], dy = +x[1], cluster) :
                (nodeSize ? null : [dx, dy])
        }

        cluster.nodeSize = function (x) {
            return arguments.length ?
                (nodeSize = true, dx = +x[0], dy = +x[1], cluster) :
                (nodeSize ? [dx, dy] : null)
        }

        return cluster
    }

    /**
     * Makes a node active
     * @param active
     * @returns {(function(*, *): void)|*}
     */
    function mouseOveredDendrogram(active) {
        return function (event, d) {
            d3.select(this).classed('link--active', active).raise()
            do d3.select(d.linkNode).classed('link--active', active).raise()
            while (d = d.parent)
        }
    }

    /**
     * Adds the zoom event for the svg element.
     */
    function addDendrogramZoom() {
        const zoom = d3.zoom()
        const transform = d3.zoomIdentity.translate(canvas.zoom.x, canvas.zoom.y).scale(canvas.zoom.scale)
        let applyScale

        graph.element.attr('transform', 'translate(' + [canvas.zoom.x, canvas.zoom.y] + ') scale(' + canvas.zoom.scale + ')')

        svg.element
            .call(zoom.transform, transform)
            .call(zoom
                .scaleExtent([0.1, 100])
                .filter((event) => {
                    if (event.type === 'mousedown') applyScale = false
                    if (event.type === 'wheel') applyScale = true
                    return true
                })
                .on('zoom', function (event) {
                    canvas.zoom.x = event.transform.x
                    canvas.zoom.y = event.transform.y
                    canvas.zoom.scale = event.transform.k

                    graph.element.attr('transform', event.transform)

                    const zoomElem = d3.select('#graph').attr('transform')

                    const scaleAttr = zoomElem.substring(zoomElem.indexOf('scale'), zoomElem.length)
                    const scaleValue = scaleAttr.substring(scaleAttr.indexOf('(') + 1, scaleAttr.length - 1)

                    if (applyScale) applyScaleText(scaleValue)
                    scaleSVGtoDIV()
                }))
    }


    /**
     * Applies the filter to add bar charts.
     * @param filter the filter to be applied
     */
    function applyFilter(filter) {
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
        graph.element.selectAll('.leafLabel').remove()
        graph.element.selectAll('.leafLabelIsolates text').remove()
        graph.element.selectAll('.addBarChartLabel text').remove()
        graph.element.selectAll('.isolates').selectAll('g').remove()
        graph.style.barChart = true

        const profilesId = lines[0]
        const columns_data = []
        const order_data = []
        const map = new Map()

        const stack = d3.stack()
            .keys(['isolates'])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)

        function getColor(name) {
            for (let i = 0; i < colors.length; i++) {
                if (colors[i].name === name) return colors[i].color
            }
        }

        if (name === '&') {
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
                    const currClass = d3.select('#node' + node.key).attr('class')

                    d3.select('#node' + node.key).attr('class', `${currClass} isolates`)

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
                    const currClass = d3.select('#node' + node.key).attr('class')
                    d3.select('#node' + node.key).attr('class', `${currClass} not-isolates`)
                }
            })
        } else {
            columns.forEach(col => {
                data.input.nodes.forEach(node => {
                    if (node.isolates && node.isolates.length > 0) {
                        const currClass = d3.select('#node' + node.key).attr('class')
                        d3.select('#node' + node.key).attr('class', `${currClass} isolates`)

                        node.isolates.forEach(iso => {
                            columns_data.push({
                                'category': data.input.metadata[col],
                                'isolates': iso[col],
                                'profiles': iso[profilesId]
                            })
                        })
                    } else {
                        const currClass = d3.select('#node' + node.key).attr('class')
                        d3.select('#node' + node.key).attr('class', `${currClass} not-isolates`)
                    }
                })
            })
        }

        graph.element.selectAll('.isolates').each(d => {
            columns_data.forEach(item => {
                if (d.data.id === item.profiles) order_data.push(item)
            })
        })

        if (name === '&') {
            stack(order_data)[0].forEach(d => {
                const counts = {}
                d.data.isolates.forEach(x => {
                    counts[x] = (counts[x] || 0) + 1
                })

                function valuesToArray(obj) {
                    const result = []
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) result.push({'isolate': key, 'counter': obj[key]})
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
            .selectAll('.isolates')
            .append('g')
            .each(function (d) {
                d3.select(this)
                    .selectAll('rect')
                    .data(map)
                d.data.data.barChart = null
            })

        let w = 30, lastX = 0, lastWidth = 5, totalW = 0

        const xScale = d3.scaleLog()
            .domain([0.5, 50])
            .range([0, 50])

        if (name === '&') {
            map.forEach((isolate, profile) => {
                const node = d3.select('#node' + profile).select('g')
                lastX = 0
                lastWidth = 5
                totalW = 0

                isolate.isolates.forEach(item => {
                    const rect = node.append('rect')
                        .attr('y', '-5')
                        .attr('height', '11')
                        .attr('class', 'barChart')
                        .attr('fill', getColor(item.isolate))

                    lastX += lastWidth
                    rect.attr('x', lastX.toString())

                    lastWidth = xScale(item.counter * w)
                    totalW += lastWidth
                    rect.attr('width', lastWidth.toString())

                    graph.nodes
                        .selectAll('circle')
                        .each(function (d) {
                            if (d.data.id === profile) {
                                rectOf(d, rect)
                            }
                        })
                })

                node
                    .append('text')
                    .attr('class', 'leafLabelIsolates')
                    .attr('dy', 5)
                    .attr('x', totalW + 10)
                    .text(d => d.data.id)
                    .style('text-anchor', 'start')
                    .style('font', `${graph.style.labels_size}px sans-serif`)
                    .on('mouseover', mouseOveredDendrogram(true))
                    .on('mouseout', mouseOveredDendrogram(false))
            })
        } else {
            map.forEach((isolate, profile) => {
                const node = d3.select('#node' + profile).select('g')
                lastX = 0
                lastWidth = 5
                totalW = 0

                isolate.forEach(item => {
                    const rect = node.append('rect')
                        .attr('y', '-5')
                        .attr('height', '11')
                        .attr('class', 'barChart')
                        .attr('fill', getColor(item.isolates))

                    lastX += lastWidth
                    rect.attr('x', lastX.toString())

                    lastWidth = xScale(item.numberOfIsolates * w)
                    totalW += lastWidth
                    rect.attr('width', lastWidth.toString())

                    graph.nodes
                        .selectAll('#node' + profile + ' circle')
                        .each(function (d) {
                            if (d.data.id === profile) {
                                rectOf(d, rect)
                            }
                        })
                })

                node
                    .append('text')
                    .attr('class', 'leafLabelIsolates')
                    .attr('dy', 5)
                    .attr('x', totalW + 10)
                    .text(d => d.data.id)
                    .style('text-anchor', 'start')
                    .style('font', `${graph.style.labels_size}px sans-serif`)
                    .on('mouseover', mouseOveredDendrogram(true))
                    .on('mouseout', mouseOveredDendrogram(false))
            })
        }
    }

    function rectOf(node, rect) {
        const elem = rect._groups[0][0]
        let rectObj = {
            width: elem.attributes['width'].nodeValue,
            height: elem.attributes['height'].nodeValue,
            fill: elem.attributes['fill'].nodeValue,
            x: elem.attributes['x'].nodeValue,
            y: elem.attributes['y'].nodeValue
        }
        if (node.data.data.barChart) node.data.data.barChart.push(rectObj)
        else node.data.data.barChart = [rectObj]
    }

    /**
     * Draws the bar charts after an update.
     * @param node the node to add the bar chart
     */
    function addBarCharts(node) {
        graph.element.selectAll('.addBarChartLabel text').remove()

        if (!node.children && node.data.data.barChart) {
            if (!graph.element.select(`#node${node.data.id}`).selectAll('g').empty()) {
                graph.element.select(`#node${node.data.id}`).selectAll('g').remove()
            }
            const nodeElement = graph.element.select(`#node${node.data.id}`)
                .attr('class', 'node node--leaf node--norm isolates')
                .append('g')

            let totalWidth = 0
            for (let i = 0;i < node.data.data.barChart.length; i++) {
                const rect = node.data.data.barChart[i]
                nodeElement
                    .append('rect')
                    .attr('width', d => {
                        totalWidth += Number.parseInt(rect.width)
                        return rect.width
                    })
                    .attr('height', rect.height)
                    .attr('fill', rect.fill)
                    .attr('x', rect.x)
                    .attr('y', rect.y)
                    .attr('class', 'barChart')

                if (i === node.data.data.barChart.length - 1) {
                    nodeElement
                        .append('text')
                        .attr('class', 'addBarChartLabel')
                        .attr('dy', 5)
                        .attr('x', totalWidth + 10)
                        .style('text-anchor', 'start')
                        .style('font', `${graph.style.labels_size}px sans-serif`)
                        .text(d => node.data.id)
                        .on('mouseover', mouseOveredDendrogram(true))
                        .on('mouseout', mouseOveredDendrogram(false))
                }
            }
        }
    }

    /**
     * Saves the current study in a JSON object.
     */
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

    /**
     * Loads the saved study from a json object to container.
     * @param {*} container 
     * @param {*} save 
     */
    function load(container, save) {
        if (!save.graph || !save.data || !save.canvas)
            throw new Error('Save does not contain all needed properties {data, graph, canvas}.')

        Object.assign(graph.style, save.graph.style || {})
        Object.assign(canvas.zoom, save.canvas.zoom || {})
        graph.nodeSize = save.graph.nodeSize || graph.nodeSize

        scaler.linear = linearScale(save.graph.scale?.linear)
        scaler.log = logScale(save.graph.scale?.log)
        graph.scale = scaler.linear

        if (!save.data.input)
            throw new Error('Data must contain an input property.')
        let view = build(save.data.input)
        draw(container, view.tree)

        addNodeStyle()
        addLinkStyle()

        return data.input
    }

    return {
        type,
        context,
        build,
        draw,
        search,
        isDraw,

        addNodeStyle,
        addLinkStyle,
        changeNodeColor,
        changeNodeSize,
        changeLinkSize,
        changeLabelsSize,

        addInternalLabels,
        alignNodes,
        addLinkLabels,

        applyLinearScale,
        applyLogScale,

        horizontalRescale,
        verticalRescale,

        getNodes,

        buildBarChart,
        applyFilter,

        save,
        load
    }
}