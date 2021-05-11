window.onload = load

let scale = 100
let numberOfNodes
let maxLinkSize = 0
let margin = {
    top: 20,
    right: 90,
    bottom: 30,
    left: 90
}
// let width = 1400 - margin.left - margin.right;
// let height = 800 - margin.top - margin.bottom;


let width = window.innerWidth - margin.left - margin.right
let height = window.innerHeight - margin.top - margin.bottom

// let height = 1920;
// let width = 1920;
const dx = 10;
const dy = width / 6;

let data;

async function load() {
    let rad = document.querySelector('.radial-btn')
    rad.addEventListener('click', evt => {
        radial(data)
    })

    let radialB = document.querySelector('.radialTree-btn')
    radialB.addEventListener('click', evt => {
        radialTree(data)
    })

    let den = document.querySelector('.dendro-btn')
    den.addEventListener('click', evt => {
        buildTree(data, true)
    })

    let b = document.querySelector('.b')
    b.addEventListener('click', evt => {
        let g = d3.select('#container')
            .select('svg')
            .select('#graph')
        addInternalLabels(g)
    })

    let nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    let slider = document.getElementById("slider");
    let variable = document.getElementById('variable');
    variable.textContent = slider.value;
    slider.addEventListener('input', function(e) {
        variable.textContent = slider.value;
        scale = +slider.value;
        buildTree(data, true)
    });


    let resp = await fetch('http://localhost:8000/api/data')

    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
}

function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    let body = JSON.stringify({data: nwk})
    let headers = { 'Content-Type': 'application/json' }

    fetch('/api/data', {method: 'post', body: body, headers: headers})
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            data = await res.json()
        })
        .catch(err => alertMsg(err))
}

function addZoom(svg, elem) {
    svg
        .call(d3.zoom()
            .scaleExtent([0.1, 100])
            .on("zoom", function (event) {
                elem.attr("transform", event.transform)
            }))
}

function mouseovered(active) {
    return function (event, d) {
        d3.select(this).classed("label--active", active);
        d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();
        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}

function mouseOveredDend(active) {
    return function (event, d) {
        d3.select(this).classed("link--active", active).raise();
        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
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

function alertMsg(message, kind) {
    if (!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML =
        `<div class="alert alert-${kind} alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${message}
            </div>`
}