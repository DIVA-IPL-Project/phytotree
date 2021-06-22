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
        scale: {
            type: 'linear',
            // todo func: linearScale,
            value: 500,
            limits: [20, 2000],
        }
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

        graph.element = svg.element
            .append("g")
            .attr("id", "graph")
            .attr("transform", "translate(" + [canvas.zoom.x, canvas.zoom.y] + ")") // [margin.left, margin.top]

        update(tree)
        addRadialZoom()
    }

    function update(tree) {
        if (graph.nodes && !graph.nodes.empty()) graph.nodes.remove()
        if (graph.links && !graph.links.empty()) graph.links.remove()

        let nodes = tree.descendants()
        let links = tree.descendants().slice(1)

        graph.links = graph.element.selectAll('.link')
            .data(links, d => d.data.id).enter()
            .append('g')
        graph.nodes = graph.element.selectAll('.node')
            .data(nodes).enter()
            .append('g')

        linksAttr(graph.links)
        nodesAttrs(graph.nodes)

        graph.element
            .selectAll(".node--leaf")
            .append("text")
            .attr("dx", d => d.x < Math.PI ? 10 : -10)
            .attr("dy", ".31em")
            .style("text-anchor", "start")
            .style("font", "12px sans-serif")
            .text(d => d.data.id)
    }

    /********************* Collapse functions *********************/

    function collapse(parent, children) {
        parent.visibility = false
        collapseAux(children)

        graph.element.select(`#node${parent.data.id}`).remove()
        nodesAttrs(graph.element.data(parent).append('g'))
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
        nodesAttrs(graph.element.data(parent).append('g'))
    }

    function expandAux(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i]
            if (child.visibility === undefined)
                child.visibility = true
            if (child.visibility && child.children) {
                expandAux(child.children)
            }

            linksAttr(graph.element.data(child).append('g'))
            nodesAttrs(graph.element.data(child).append('g'))
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

    function rescale(increment) {
        console.log(graph.scale.value)
        if (increment) {
            if (graph.scale.value > graph.scale.limits[0]) {
                graph.scale.value -= 100
                setNewPositions()
            }
        } else {
            if (graph.scale.value < graph.scale.limits[1]) {
                graph.scale.value += 100
                setNewPositions()
            }
        }
    }

    function setNewPositions() {
        data.root.eachBefore(d => {
            if (d.parent) {
                let alpha = d.rightBorder + (d.wedgeSize / 2);
                d.x = d.parent.x + Math.cos(alpha) * d.data.data.value * graph.scale.value;
                d.y = d.parent.y + Math.sin(alpha) * d.data.data.value * graph.scale.value;

                document.getElementById('node' + d.data.id)
                    .setAttribute('transform', 'translate(' + [d.x, d.y] + ')')
                const link = document.getElementById('link' + d.data.id)
                link.setAttribute('x1', d.parent.x)
                link.setAttribute('y1', d.parent.y)
                link.setAttribute('x2', d.x)
                link.setAttribute('y2', d.y)
            }
        })
    }


    /********************* Style functions *********************/

    function nodesAttrs(nodes) {
        nodes
            .attr("class", d => "node" + (!d.children ?
                " node--leaf" : " node--internal") + (d.parent ? " node--norm" : " node--root"))
            .attr("transform", d => `translate(${[d.x, d.y]})`)
            .attr("id", d => 'node' + d.data.id)
            .on("click", click)
            .append("circle")
            .attr("r", 5)
    }

    function linksAttr(links) {
        links
            .attr('id', d => 'link' + d.data.id)
            .append("line")
            .attr("class", "link")

            .attr("x1", d => d.parent.x)
            .attr("y1", d => d.parent.y)
            .attr("x2", d => d.x)
            .attr("y2", d => d.y)
            .on("mouseover", mouseOveredRadial(true))
            .on("mouseout", mouseOveredRadial(false))
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
        graph.element
            .selectAll(".node--leaf")
            .append("text")
            .attr("dx", d => d.x < Math.PI ? 10 : -10)
            .attr("dy", ".31em")
            .style("text-anchor", "start")
            .style("font", "12px sans-serif")
            .text(d => d.data.id)
    }


    /********************* Private functions *********************/

    function radial() {
        const pi = Math.PI
        let delta = 0;

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
            root.eachAfter(d => {
                if (!d.children)
                    d.leafcount = 1;
                else
                    d.leafcount = d.children.reduce(
                        (acc, curr) => acc + (curr.leafcount === 0 ? 1 : curr.leafcount),
                        0
                    );
            });

            //spreadFirst(root)
            spreadSecond(root)

            let queue = [root];
            root.rightBorder = 0;
            root.wedgeSize = 2 * pi;
            root.x = 0;
            root.y = 0;
            while (queue.length !== 0) {
                let parent = queue.shift();
                if (parent.children) {
                    // separation
                    parent.children.sort((a, b) => a.spread - b.spread)

                    parent.children.forEach(child => {
                        queue.push(child);
                        child.rightBorder = parent.rightBorder;

                        child.wedgeSize = (2 * pi * child.leafcount) / root.leafcount

                        let alpha = child.rightBorder + (child.wedgeSize / 2);
                        child.x = parent.x + Math.cos(alpha) * child.data.data.value * graph.scale.value;
                        child.y = parent.y + Math.sin(alpha) * child.data.data.value * graph.scale.value;
                        parent.rightBorder = parent.rightBorder + child.wedgeSize;
                    })
                }
            }
            return root;
        }

        radial.spread = function (spreadValue) {
            delta = spreadValue;
            return radial
        };

        return radial;
    }

    function mouseOveredRadial(active) {
        return function (event, d) {
            d3.select(this).classed("label--active", active);

            d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();

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
                }))
    }

    return {context, build, draw, rescale}
}()