window.onload = load

let scale = 1000
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
let render;

async function load() {
    let rad = document.querySelector('.radial-btn')
    rad.addEventListener('click', evt => {
        render = circularRadial;
        render(data);
    })

    let radialB = document.querySelector('.radialTree-btn')
    radialB.addEventListener('click', evt => {
        render = radial;
        render(data);
    })

    let den = document.querySelector('.dendro-btn')
    den.addEventListener('click', evt => {
        render = buildTree;
        render(data, true);
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
        scale = +slider.value * 10;
        applyScaleText(scaleText)
        render(data, true)
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
                let zoom = document.getElementById("zoom")
                applyScaleText(scaleText)
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