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
let textScale = '100';

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
        render = radial;
        render(data);
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        showConfig()
        addDendrogramButtons()

        render = buildTree
        isAlign = false
        renderDendrogram()
    })

    const linkLabelsButton = document.querySelector('.linkLabels')
    linkLabelsButton.addEventListener('click', () => {
        console.log(dendrogram)
        addLinkLabels(dendrogram.links, linksVisible);
    })

    const alignNodesInDendrogramButton = document.querySelector('.align-nodes')
    alignNodesInDendrogramButton.addEventListener('click', () => {
        isAlign = !isAlign;
        if (isAlign) showRescaleButtons("none");
        else showRescaleButtons("block");
        renderDendrogram()
    })

    const parentLabelsButton = document.querySelector('.parentLabels')
    parentLabelsButton.addEventListener('click', () => {
        const graph = d3.select('#container').select('svg').select('#graph');
        addInternalLabels(graph, parentLabelsVisible);
    })

    const nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    //let slider = document.getElementById("slider");
    let variable = document.getElementById('variable')
    variable.textContent = (parseInt(textScale)/10).toString()
    let leftButton = document.getElementById('leftButton')
    let rightButton = document.getElementById('rightButton')

    leftButton.addEventListener('click', function(){
        if(parseInt(textScale) - 10 > 0){ //todo (here we can optimize)
            textScale = parseInt(textScale) - 10
            variable.textContent = (parseInt(textScale)/10).toString();

            if (linearScale) scale =+ textScale * 10;
            else scale = logarithmicScale().value(textScale);

            if (render.name === "buildTree") renderDendrogram();
            else render(data, false)
        }
    })
    rightButton.addEventListener('click', function (){
        if (parseInt(textScale) + 10 < 1000){ //todo (here we can optimize)
            textScale = parseInt(textScale) + 10
            variable.textContent = (parseInt(textScale)/10).toString();

            if (linearScale) scale =+ textScale * 10;
            else scale = logarithmicScale().value(textScale);

            if (render.name === "buildTree") renderDendrogram();
            else render(data, false)
        }
    })

    const logScaleButton = document.querySelector('.logScale')
    logScaleButton.addEventListener('click', () => {
        linearScale = false;
        scale = logarithmicScale().value(textScale);
        if (render.name === "buildTree") renderDendrogram();
        else render(data);
    })

    const linearScaleButton = document.querySelector('.linearScale')
    linearScaleButton.addEventListener('click', () => {
        linearScale = true;
        scale =+ textScale * 10;
        if (render.name === "buildTree") renderDendrogram();
        else render(data);
    })


    const nwkSendButton = document.getElementById('idNwkBt')
    //if (!nwkSendButton.addEventListener){
    nwkSendButton.addEventListener('click', sendNewickData)
    //}
    // const profSendButton = document.getElementById('idPrfBt')
    // profSendButton.addEventListener('click', sendProfileData)
    //
    // const isoSendButton = document.getElementById('idIsoBt')
    // isoSendButton.addEventListener('click', sendIsolateData)

    let resp = await fetch('http://localhost:8000/api/data')
    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
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

/** Visualizations **/

/**
 * Builds the logarithmic scale.
 * @returns {logarithmicScale}
 */
function logarithmicScale() {
    const minValue = Math.log(10);
    const maxValue = Math.log(100);
    const maxPosition = 100;
    const minPosition = 10;

    const scale = (maxValue - minValue) / (maxPosition - minPosition);

    this.value = function (position) {
        return Math.exp((position - minPosition) * scale + minValue);
    }

    this.position = function (value) {
        return minPosition + (Math.log(value) - minValue) / scale;
    }

    return this;
}

function checkListener(){
    const checkButton = document.getElementById('checkB')

    if (checkButton.checked === true){
        nonShowDataPart()
    } else {
        showDataPart()
    }
}

function showConfig(){
    document.getElementById('configText').style.display = "block"
}

function nonShowConfig(){
    document.getElementById('configText').style.display = "none"
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
    //document.getElementById('formFilePro').style.display = "none";
    //document.getElementById('idPrfBt').style.display = "none";
    //document.getElementById('formFileIso').style.display = "none";
    //document.getElementById('idIsoBt').style.display = "none";
    document.getElementById('nwk').style.display = "none";
    document.getElementById('nwkBtn').style.display = "none";
    document.getElementById('textData').style.display = "none";
}

/**
 * Calls the render for the dendrogram function
 * and applies style to the nodes and links.
 */
function renderDendrogram() {
    dendrogram = render(data, isAlign);
    addNodeStyle(dendrogram.node);
    addLinkStyle(dendrogram.gElement);

    applyScaleText(scaleText, scale / 1000);
}

/**
 * Adds buttons only applied for dendrogram.
 */
function addDendrogramButtons() {
    document.querySelector('.align-nodes').style.display = "block"
    document.querySelector('.parentLabels').style.display = "block"
    document.querySelector('.linkLabels').style.display = "block"
    document.getElementById('logScaleButton').style.display = "block"
    document.getElementById('labelLogScale').style.display = "block"
    document.getElementById('linearScaleButton').style.display = "block"
    document.getElementById('labelLinearScale').style.display = "block"

    showRescaleButtons("block")
}

/**
 * Removes buttons only applied for dendrogram.
 */
function removeDendrogramButtons() {
    document.querySelector('.align-nodes').style.display = "none";
    document.querySelector('.parentLabels').style.display = "none";
    document.querySelector('.linkLabels').style.display = "none";

    document.getElementById('logScaleButton').style.display = "none";
    document.getElementById('labelLogScale').style.display = "none";

    document.getElementById('linearScaleButton').style.display = "none";
    document.getElementById('labelLinearScale').style.display = "none";

    if (document.querySelector('.horizontalScale')) {
        document.querySelector('.horizontalScale').remove();
    }
    if (document.querySelector('.scaleText')) {
        document.querySelector('.scaleText').remove();
    }
    horizontalScaleVisible = false;

    showRescaleButtons("none");
}

/**
 * Adds or removes de buttons for the horizontal rescale.
 * @param display keyword "none" to remove the buttons or "block" to add.
 */
function showRescaleButtons(display) {
    document.getElementById('leftButton').style.display = display;
    document.getElementById('rightButton').style.display = display;
    document.getElementById('variable').style.display = display;

    document.getElementById('logScaleButton').style.display = display;
    document.getElementById('labelLogScale').style.display = display;

    document.getElementById('linearScaleButton').style.display = display;
    document.getElementById('labelLinearScale').style.display = display;
}

/** Data **/

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
    //document.getElementById('idPrfBt').style.display = "block";
    //document.getElementById('formFilePro').style.display = "block";
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
    //document.getElementById('formFileIso').style.display = "block";
    //document.getElementById('idIsoBt').style.display = "block";
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
