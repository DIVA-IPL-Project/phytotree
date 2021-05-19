window.onload = load
//window.onresize = resize

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

let data;
let render;
let dendrogram;
let linearScale;
let horizontalScaleVisible;
let linksVisible;
let parentLabelsVisible;
let isAlign;

// function resize(){
//     console.log('OnResize')
//     width = window.innerWidth - margin.left - margin.right
//     height = window.innerHeight - margin.top - margin.bottom
//     load()
// }

async function load() {

    //todo (if the checkbox starts checked we have to run nonShowDataPart, if the checkbox starts unchecked we have to unchecked the box here)
    const checkButton = document.getElementById('checkB')
    checkButton.addEventListener('click', checkListener)

    const circularRadialButton = document.querySelector('.radial-btn')
    circularRadialButton.addEventListener('click', () => {
        removeDendrogramButtons();
        render = circularRadial;
        render(data);
    })

    const radialButton = document.querySelector('.radialTree-btn')
    radialButton.addEventListener('click', () => {
        removeDendrogramButtons();
        addSlider();
        render = radial;
        render(data);
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        addDendrogramButtons();
        addSlider();

        render = buildTree;
        isAlign = false;
        dendrogram = render(data, isAlign);

        addNodeStyle(dendrogram.node);
        addLinkStyle(dendrogram.gElement);
    })

    const linkLabelsButton = document.querySelector('.linkLabels')
    linkLabelsButton.addEventListener('click', () => {
        addLinkLabels(dendrogram.links, linksVisible);
    })

    const alignNodesInDendrogramButton = document.querySelector('.align-nodes')
    alignNodesInDendrogramButton.addEventListener('click', () => {
        isAlign = !isAlign;
        dendrogram = render(data, isAlign);
    })

    const parentLabelsButton = document.querySelector('.parentLabels')
    parentLabelsButton.addEventListener('click', () => {
        const graph = d3.select('#container').select('svg').select('#graph');
        addInternalLabels(graph, parentLabelsVisible);
    })

    const nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    let slider = document.getElementById("slider");
    let variable = document.getElementById('variable');
    variable.textContent = slider.value;
    slider.addEventListener('input', function () {
        variable.textContent = slider.value;
        scale = +slider.value * 10;
        if (render.name === "buildTree") applyScaleText(scaleText, scale / 1000, linearScale);
        render(data, false)
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


    const nwkSendButton = document.getElementById('idNwkBt')
    //if (!nwkSendButton.addEventListener){
        nwkSendButton.addEventListener('click', sendNewickData)
    //}
    const profSendButton = document.getElementById('idPrfBt')
    profSendButton.addEventListener('click', sendProfileData)

    const isoSendButton = document.getElementById('idIsoBt')
    isoSendButton.addEventListener('click', sendIsolateData)

    let resp = await fetch('http://localhost:8000/api/data')
    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
}

function checkListener(){
    const checkButton = document.getElementById('checkB')

    if (checkButton.checked === true){
        nonShowDataPart()
    } else {
        showDataPart()
    }
}

function showDataPart() {
    document.getElementById('formFileNw').style.display = "block";
    document.getElementById('idNwkBt').style.display = "block";
    document.getElementById('nwk').style.display = "block";
    document.getElementById('nwkBtn').style.display = "block";
    document.getElementById('textData').style.display = "block";
}

function nonShowDataPart(){
    document.getElementById('formFileNw').style.display = "none";
    document.getElementById('idNwkBt').style.display = "none";
    document.getElementById('formFilePro').style.display = "none";
    document.getElementById('idPrfBt').style.display = "none";
    document.getElementById('formFileIso').style.display = "none";
    document.getElementById('idIsoBt').style.display = "none";
    document.getElementById('nwk').style.display = "none";
    document.getElementById('nwkBtn').style.display = "none";
    document.getElementById('textData').style.display = "none";
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

    document.querySelector('.linkLabels').style.display = "block";
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

    document.querySelector('.linkLabels').style.display = "none";

    removeHorizontalScale();

    removeSlider();
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
    horizontalScaleVisible = false;
}

/**
 * Adds the slider for horizontal rescale.
 */
function addSlider() {
    document.getElementById('slider').style.display = "block";
    document.getElementById('variable').style.display = "block";
}

/**
 * Removes de slider for the horizontal rescale.
 */
function removeSlider() {
    document.getElementById('slider').style.display = "none";
    document.getElementById('variable').style.display = "none";
}

function sendNewickData(){
    let headers = {'Content-Type': 'application/json'}
    let nwk = document.getElementById('formFileNw').files[0]
    nwk.text().then(newick => {
        console.log(newick)
        let body = JSON.stringify({data: newick})
        fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
            .then(() => {
                fetch('/api/data', {method: 'post', body: body, headers: headers})
                    .then(async res => {
                        if (res.status === 500) alertMsg('error')
                        data = await res.json()
                    })
                    .catch(err => alertMsg(err))
            })
            .catch()
    })

    //todo
    document.getElementById('idPrfBt').style.display = "block";
    document.getElementById('formFilePro').style.display = "block";
}

function sendProfileData(){
    let headers = {'Content-Type': 'application/json'}
    let profile = document.getElementById('formFilePro').files[0]
    profile.text().then(prof => {
        console.log(prof)
        let body = JSON.stringify({data: prof})
        fetch('/api/update/newick', {method: 'post', body: body, headers: headers}).catch()
    })
    //todo
    document.getElementById('formFileIso').style.display = "block";
    document.getElementById('idIsoBt').style.display = "block";
}

function sendIsolateData(){
    let headers = {'Content-Type': 'application/json'}
    let isolate = document.getElementById('formFileIso').files[0]
    isolate.text().then(iso => {
        console.log(iso)
        let body = JSON.stringify({data: iso})
        fetch('/api/update/newick', {method: 'post', body: body, headers: headers}).catch()
    })
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
    if (render.name === "buildTree") {
        elem.attr("transform", "translate(" + [80, -20] + ")")
    }
    if (render.name === "circularRadial" || render.name === "radial") {
        elem.attr("transform", "translate(" + [width/2 - 100, height/2] + ")")
    }

    //reset the zoom
    svg.call(d3.zoom().transform, d3.zoomIdentity.scale(1));

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

                if (render.name === "buildTree") applyScaleText(scaleText, scaleValue, linearScale);
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