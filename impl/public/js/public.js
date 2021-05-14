window.onload = load

let scale = 1000
let maxLinkSize = 0
let margin = {
    top: 20,
    right: 90,
    bottom: 30,
    left: 90
}

let width = window.innerWidth - margin.left - margin.right
let height = window.innerHeight - margin.top - margin.bottom

const dx = 10;
const dy = width / 6;

let data;
let render;
let linearScale;
let horizontalScaleVisible;

async function load() {
    const circularRadialButton = document.querySelector('.radial-btn')
    circularRadialButton.addEventListener('click', () => {
        removeDendrogramButtons();
        removeHorizontalScale();
        horizontalScaleVisible = false;

        render = circularRadial;
        render(data);
    })

    const radialButton = document.querySelector('.radialTree-btn')
    radialButton.addEventListener('click', () => {
        removeDendrogramButtons();
        removeHorizontalScale();
        horizontalScaleVisible = false;

        render = radial;
        render(data);
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        addDendrogramButtons();

        render = buildTree;
        const dendrogram = render(data, false);

        addNodeStyle(dendrogram.node);
        addLinkStyle(dendrogram.gElement);
    })

    const alignNodesInDendrogramButton = document.querySelector('.align-nodes')
    alignNodesInDendrogramButton.addEventListener('click', () => {
        render = buildTree;
        render(data, true);
    })

    const parentLabelsButton = document.querySelector('.parentLabels')
    parentLabelsButton.addEventListener('click', () => {
        const graph = d3.select('#container').select('svg').select('#graph');
        addInternalLabels(graph);
    })

    const nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    let slider = document.getElementById("slider");
    let variable = document.getElementById('variable');
    variable.textContent = slider.value;
    slider.addEventListener('input', function () {
        variable.textContent = slider.value;
        scale = +slider.value * 10;
        applyScaleText(scaleText, scale / 1000, linearScale);
        render(data, true)
    });

    const logScaleButton = document.querySelector('.logScale')
    logScaleButton.addEventListener('click', () => {
        linearScale = false;

        render = buildTree;
        applyScaleText(scaleText, scale / 1000, linearScale);

        render(data, false);
    })

    const linearScaleButton = document.querySelector('.linearScale')
    linearScaleButton.addEventListener('click', () => {
        linearScale = true;
        render = buildTree;
        applyScaleText(scaleText, scale / 1000, linearScale);
        render(data, false);
    })

    let resp = await fetch('http://localhost:8000/api/data')
    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
}

/**
 * Adds buttons only applied for dendrogram.
 */
function addDendrogramButtons() {
    document.querySelector('.align-nodes').style.display = "block";
    document.querySelector('.parentLabels').style.display = "block";

    document.getElementById('logScaleButton').style.display = "block";
    document.getElementById('labelLogScale').style.display = "block";

    document.getElementById('linearScaleButton').style.display = "block";
    document.getElementById('labelLinearScale').style.display = "block";
}

/**
 * Removes buttons only applied for dendrogram.
 */
function removeDendrogramButtons() {
    document.querySelector('.align-nodes').style.display = "none";
    document.querySelector('.parentLabels').style.display = "none";

    document.getElementById('logScaleButton').style.display = "none";
    document.getElementById('labelLogScale').style.display = "none";

    document.getElementById('linearScaleButton').style.display = "none";
    document.getElementById('labelLinearScale').style.display = "none";
}

/**
 * Remove horizontal scale only applied for dendrogram.
 */
function removeHorizontalScale() {
    if (document.querySelector('.horizontalScale')) {
        document.querySelector('.horizontalScale').remove();
    }
    if (document.querySelector('.scaleText')) {
        document.querySelector('.scaleText').remove();
    }
}

function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    let body = JSON.stringify({data: nwk})
    let headers = {'Content-Type': 'application/json'}

    fetch('/api/data', {method: 'post', body: body, headers: headers})
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            data = await res.json()
        })
        .catch(err => alertMsg(err))
}

/**
 * Adds the zoom event for the svg element.
 * @param svg the svg element where the graph will be placed.
 * @param elem the g element containing the zoom area.
 */
function addZoom(svg, elem) {
    svg
        .call(d3.zoom()
            .scaleExtent([0.1, 100])
            .on("zoom", function (event) {
                elem.attr("transform", event.transform)
                const zoom = document
                    .getElementById("zoom")
                    .getAttribute("transform");

                const scaleAttr = zoom.substring(zoom.indexOf("scale"), zoom.length);
                const scaleValue = scaleAttr.substring(scaleAttr.indexOf("(") + 1, scaleAttr.length - 1);

                applyScaleText(scaleText, scaleValue, linearScale);
            }))
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

//TODO change name
function mouseOveredDend(active) {
    return function (event, d) {
        d3.select(this).classed("link--active", active).raise();

        do d3.select(d.linkNode).classed("link--active", active).raise();
        while (d = d.parent);
    };
}