const circularRadial = function () {

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
            x: 500,
            y: 400,
            scale: 0.6
        }
    }
    const data = {
        root: null,
        tree: null
    }
    const graph = {
        element: null,
        links: null,
        linkExtensions: null,
        textLabels: null,
        outerRadius: canvas.width / 2,
        innerRadius: canvas.width / 2 - 170
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

    const color = d3.scaleOrdinal()
        .domain(["Bacteria", "Eukaryota", "Archaea"])
        .range(d3.schemeCategory10)

    /********************* Main functions ************************/

    function build(input) {
        context.build = d3.cluster()
            .size([360, graph.innerRadius])
            .separation((a, b) => 1)

        const strat = d3.stratify().id(d => d.target).parentId(d => d.source)(input.links);

        data.root = d3.hierarchy(strat, d => d.children)
            .sum(d => d.children ? 0 : 1)
            .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

        data.tree = context.build(data.root);

        console.log(data.root.data.data.value)
        setRadius(data.root, data.root.data.data.value = 0, graph.innerRadius / maxLength(data.root));

        console.log(data.root)
        return data
    }

    function draw(container, tree) {
        canvas.container = d3.select(container)
        svg.element = canvas.container.select('svg')

        if (!svg.element.empty()) {
            svg.element.select('#graph').remove();
        } else {
            svg.element = d3.select('#container')
                .append("svg")
                .attr("width", canvas.width + margin.left + margin.right)
                .attr("height", canvas.height + margin.top + margin.bottom)
        }

        graph.element = svg.element
            .append("g")
            .attr("id", "graph")
            .attr("transform", "translate(" + [margin.left, margin.top] + ")");

        update(tree)

        addRadialCircularZoom()
    }

    function update(tree) {
        graph.linkExtensions = graph.element
            .selectAll(".linkExtension")
            .data(tree.links().filter(d => !d.target.children)).enter()
            .append('g')

        graph.links = graph.element
            .selectAll('.link')
            .data(tree.links()).enter()
            .append('g')

        graph.textLables = graph.element
            .selectAll('text')
            .data(tree.leaves()).enter()
            .append('g')

        linksExtensionAttr(graph.linkExtensions)
        linksAttr(graph.links)
        labelsAttr(graph.textLables)

        /** transition from constant to variable links lenght **/
        // const t = d3.transition().duration(750)
        // graph.linkExtensions.transition(t).attr("d", linkExtensionVariable)
        // graph.links.transition(t).attr("d", linkVariable)
    }

    /********************* Auxiliary functions ************************/

    function maxLength(d) {
        return d.data.data.value + (d.children ? d3.max(d.children, maxLength) : 0);
    }

    function setRadius(d, y0, k) {
        d.radius = (y0 += d.data.data.value) * k;
        if (d.children) d.children.forEach(d => setRadius(d, y0, k));
    }

    function setColor(d) {
        let name = d.data.name;
        d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
        if (d.children) d.children.forEach(setColor);
    }

    /********************* Style functions ************************/

    function linksAttr(links) {
        links
            .attr('class', 'link-circular')
            .append('path')
            .each(function(d) { d.target.linkNode = this; })
            //.attr("d", linkConstant)
            .attr("d", linkVariable)
    }

    function linksExtensionAttr(linksExtension) {
        linksExtension
            .attr('class', 'link-extension')
            .append("path")
            .each(function(d) { d.target.linkExtensionNode = this; })
            //.attr("d", linkExtensionConstant)
            .attr("d", linkExtensionVariable)
    }

    function labelsAttr(labels) {
        labels
            .append("text")
            .attr("dy", ".31em")
            .attr("transform", d => `rotate(${d.x - 90}) translate(${graph.innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}`)
            .attr("text-anchor", d => d.x < 180 ? "start" : "end")
            .text(d => d.data.id.replace(/_/g, " "))
            .on("mouseover", mouseOveredRadialCircular(true))
            .on("mouseout", mouseOveredRadialCircular(false))
    }

    /********************* Links functions ************************/

    function linkStep(startAngle, startRadius, endAngle, endRadius) {
        const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
        const s0 = Math.sin(startAngle);
        const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
        const s1 = Math.sin(endAngle);
        return "M" + startRadius * c0 + "," + startRadius * s0
            + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 "
                + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
            + "L" + endRadius * c1 + "," + endRadius * s1;
    }

    function linkVariable(d) {
        return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }

    function linkConstant(d) {
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    function linkExtensionVariable(d) {
        return linkStep(d.target.x, d.target.radius, d.target.x, graph.innerRadius);
    }

    function linkExtensionConstant(d) {
        return linkStep(d.target.x, d.target.y, d.target.x, graph.innerRadius);
    }

    function mouseOveredRadialCircular(active) {
        return function (event, d) {
            d3.select(this).classed("label--active", active);
            d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();

            do d3.select(d.linkNode).classed("link--active", active).raise();
            while (d = d.parent);
        };
    }

    /********************* Private functions ************************/

    function addRadialCircularZoom() {
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
                }))
    }

    return {context, build, draw }
}()

