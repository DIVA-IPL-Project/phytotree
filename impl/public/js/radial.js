//const margin = ({top: 10, right: 120, bottom: 10, left: 40})
//const tree = d3.tree().nodeSize([dx, dy])
//const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

function buildRadialTree(jsonData) {
    let diameter = height * 0.75;
    let radius = diameter / 2;
    let tree = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    let data = d3.hierarchy(jsonData);
    return tree(data);
}

// function radial() {
//     const tree = buildRadialTree(data)
//
//     d3.select('#container')
//         .select('svg').remove()
//     let svg = d3.select('#container')
//         .append('svg')
//         .attr('width', width)
//         .attr('height', height);
//
//     let nodes = tree.descendants();
//     let links = tree.links();
//
//     let graphGroup = svg.append('g')
//         .attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")");
//
//     graphGroup.selectAll(".link")
//         .data(links)
//         .join("path")
//         .attr("class", "link")
//         .attr("d", d3.linkRadial().angle(d => d.x).radius(d => d.y));
//
//     let node = graphGroup
//         .selectAll(".node")
//         .data(nodes)
//         .join("g")
//         .attr("class", "node")
//         .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);
//
//     node.append("circle").attr("r", 4);
//
//     node.append("text")
//         .attr("font-family", "sans-serif")
//         .attr("font-size", 12)
//         .attr("stroke", "blue")
//         .attr("dx", d => d.x < Math.PI ? 8 : -8)
//         .attr("dy", ".31em")
//         .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
//         .attr("transform", d => d.x < Math.PI ? null : "rotate(180)")
//         .text(d => d.data.name);
// }

function radial(data) {
    const width = 900
    const outerRadius = width / 2
    const innerRadius = outerRadius - 170
    const cluster = d3.cluster()
        .size([360, innerRadius])
        .separation((a, b) => 1)

    const color = d3.scaleOrdinal()
        .domain(["Bacteria", "Eukaryota", "Archaea"])
        .range(d3.schemeCategory10)

    function maxLength(d) {
        return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
    }

    function setRadius(d, y0, k) {
        d.radius = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach(d => setRadius(d, y0, k));
    }

    function setColor(d) {
        let name = d.data.name;
        d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
        if (d.children) d.children.forEach(setColor);
    }

    function linkVariable(d) {
        return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }

    function linkConstant(d) {
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    function linkExtensionVariable(d) {
        return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
    }

    function linkExtensionConstant(d) {
        return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
    }

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

    const legend = svg => {
        const g = svg
            .selectAll("g")
            .data(color.domain())
            .join("g")
            .attr("transform", (d, i) => `translate(${-outerRadius},${-outerRadius + i * 20})`);

        g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);

        g.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d);
    }

    function chart() {
        const root = d3.hierarchy(data, d => d.children)
            .sum(d => d.children ? 0 : 1)
            .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

        cluster(root);
        setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
        //setColor(root);

        d3.select('#container')
            .select('svg').remove()
        const svg = d3.select('#container')
            .append("svg")
            .attr("viewBox", [-outerRadius, -outerRadius, width, width])
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)

        addZoom(svg, svg)

        // svg.append("g")
        //     .call(legend);
        // svg.append("style").text(`
        //     .link--active {
        //       stroke: #000 !important;
        //       stroke-width: 1.5px;
        //     }
        //
        //     .link-extension--active {
        //       stroke-opacity: .6;
        //     }
        //
        //     .label--active {
        //       font-weight: bold;
        //     }
        //     `
        // );

        const linkExtension = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.25)
            .selectAll("path")
            .data(root.links().filter(d => !d.target.children))
            .join("path")
            .each(function (d) {
                d.target.linkExtensionNode = this;
            })
            .attr("d", linkExtensionConstant);

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .selectAll("path")
            .data(root.links())
            .join("path")
            .each(function (d) {
                d.target.linkNode = this;
            })
            .attr("d", linkConstant)
            .attr("stroke", d => d.target.color);

        svg.append("g")
            .selectAll("text")
            .data(root.leaves())
            .join("text")
            .attr("dy", ".31em")
            .attr("transform", d => `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}`)
            .attr("text-anchor", d => d.x < 180 ? "start" : "end")
            .text(d => d.data.name.replace(/_/g, " "))
            .on("mouseover", mouseovered(true))
            .on("mouseout", mouseovered(false));

        function update(checked) {
            const t = d3.transition().duration(750);
            linkExtension.transition(t).attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
            link.transition(t).attr("d", checked ? linkVariable : linkConstant);
        }

        let node = svg.node()
        node.update = update
        return node;
    }

    const update = chart().update(true)
}

function collapseNode(node) {

}

function addStyle() {

}

function getTree() {

}