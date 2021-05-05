window.onload = load

let numberOfNodes
let tree
let maxLinkSize = 0
let margin = {
    top: 20,
    right: 90,
    bottom: 30,
    left: 90
}
let width = 1400 - margin.left - margin.right;
let height = 800 - margin.top - margin.bottom;


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
        buildTree(data)
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
            console.log(data)
        })
        .catch(err => alertMsg(err))
}

function addZoom(svg, elem) {
    svg
        .call(d3.zoom()
            .scaleExtent([0.5, 5])
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