window.onload = load

let data
let is_table_profile_create = false
let is_table_isolate_create = false

async function load() {
    setupRepresentationButtons()
    setupGraphConfiguration()
    setupTabs()
    await setupData()
}

/********************* Setup UI *********************/

function setupTabs() {
    document.getElementById('profile-tab').addEventListener('click', () => {
        if (!is_table_profile_create) {
            create_table_profile(data)
            is_table_profile_create = true
            console.log('create table profile')
        }
    })

    document.getElementById('isolate-tab').addEventListener('click', () => {
        if (!is_table_isolate_create) {
            console.log('create table isolate')
            create_table_isolate(data)
            is_table_isolate_create = true
        }
    })
}

function setupRepresentationButtons() {
    const circularRadialButton = document.querySelector('.radial-btn')
    circularRadialButton.addEventListener('click', () => {
        hideGraphConfig();
        let graph = circularRadial.build(data)
        circularRadial.draw('#container', graph.root)
    })

    const radialButton = document.querySelector('.radialTree-btn')
    radialButton.addEventListener('click', () => {
        hideGraphConfig();
        let graph = radial.build(data)
        radial.draw('#container', graph.root)
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        showGraphConfig()
        let graph = dendrogram.build(data)
        dendrogram.draw('#container', graph.root)

        // todo download svg file
        //const svg = document.getHTML(dendrogram.context.svg.element.node(), true)
        //download("dendro.svg", svg)

        // todo review
        //dendrogram.addNodeStyle()
        //dendrogram.addLinkStyle()
    })
}

async function setupData() {
    document.getElementById('nwkBtn').addEventListener('click', sendNwkData)

    document.getElementById('idNwkBt').addEventListener('click', sendNewickData)
    document.getElementById('idPrfBt').addEventListener('click', sendProfileData)
    document.getElementById('idIsoBt').addEventListener('click', sendIsolateData)

    // let resp = await fetch('http://localhost:8000/api/data')
    // if (resp.status !== 200) alertMsg(resp.statusText)
    // else data = await resp.json()
}

function setupGraphConfiguration() {
    document.querySelector('.parentLabels').addEventListener('click', dendrogram.addInternalLabels)
    document.querySelector('.align-nodes').addEventListener('click', dendrogram.alignNodes)
    document.querySelector('.linkLabels').addEventListener('click', dendrogram.addLinkLabels)

    document.querySelector('.linearScale').addEventListener('click', dendrogram.applyLinearScale)
    document.querySelector('.logScale').addEventListener('click', dendrogram.applyLogScale)


    let up = document.getElementById('upButton')
    let down = document.getElementById('downButton')
    let left = document.getElementById('leftButton')
    let right = document.getElementById('rightButton')

    setupScaleBtn(up, () => dendrogram.verticalRescale(true))
    setupScaleBtn(down, () => dendrogram.verticalRescale(false))
    setupScaleBtn(left, () => dendrogram.horizontalRescale(false))
    setupScaleBtn(right, () => dendrogram.horizontalRescale(true))

    function setupScaleBtn(elem, func) {
        let event = events()
        elem.addEventListener('mousedown', event.mDown)
        elem.addEventListener('mouseup', event.mUp)

        function events() {
            let id

            function mDown() {
                func()
                id = setInterval(func, 100);
            }

            function mUp() {
                clearInterval(id);
            }

            return {mDown, mUp}
        }
    }
}


/** Visualizations **/

function showDataPart() {
    document.getElementById('formFileNw').style.display = "block";
    document.getElementById('idNwkBt').style.display = "block";
    document.getElementById('nwk').style.display = "block";
    document.getElementById('nwkBtn').style.display = "block";
    document.getElementById('textData').style.display = "block";
}

function hideDataPart() {
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

/** Tables **/

function create_table_profile(data) {
    console.log(data)
    console.log('create table')
    const div = document.getElementById('profileContent')
    /** Table **/
    const table = document.createElement('table')
    table.setAttribute('class', 'table table-bordered table-hover table-responsive')
    table.setAttribute('height', '450')
    table.clientHeight = 450

    /** head **/
    const head = table.createTHead()
    const head_row = head.insertRow()
    data.schemeGenes.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('scope', 'col')
    })

    /** body **/
    const body = table.createTBody()
    data.nodes.forEach(node => {
        if(node.profile !== undefined) {
            const body_row = body.insertRow()
            // const cell_node_name = body_row.insertCell()
            // cell_node_name.textContent = node.key
            const b_cells = node.profile.forEach(profile => {
                const cell = body_row.insertCell()
                cell.textContent = profile
            })
        }
    })

    /** Append table  **/
    div.appendChild(table)
}

function create_table_isolate(data) {
    console.log('create table')
    const div = document.getElementById('isolateContent')
    /** Table **/
    const table = document.createElement('table')
    table.setAttribute('class', 'table table-bordered table-hover table-responsive')
    table.setAttribute('height', '450')
    table.clientHeight = 450

    /** head **/
    const head = table.createTHead()
    const head_row = head.insertRow()
    data.metadata.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('scope', 'col')
    })

    /** body **/
    const body = table.createTBody()
    data.nodes.forEach(node => {
        const body_row = body.insertRow()
        const b_cells = node.isolates[0].forEach(profile => {
            const cell = body_row.insertCell()
            cell.textContent = profile
        })
    })

    /** Append table  **/
    div.appendChild(table)
}


/********************* API data functions *********************/

function sendNewickData() {
    let headers = {'Content-Type': 'application/json'}
    let nwk = document.getElementById('formFileNw').files[0]
    nwk.text().then(newick => {
        let body = JSON.stringify({data: newick})
        console.log('fetch ')
        return fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
            .then(() => {
                console.log('fetch 2')
                return fetch('/api/data', {headers: headers})
                    .then(async res => {
                        if (res.status === 500) alertMsg('error')
                        data = await res.json()
                        console.log(data)
                    })
                    .catch(err => alertMsg(err))
            })
            .catch(err => alertMsg(err))
    })

    //todo
    document.getElementById('idPrfBt').style.display = "block";
    document.getElementById('formFilePro').style.display = "block";
}

function sendProfileData() {
    let headers = {'Content-Type': 'application/json'}
    let profile = document.getElementById('formFilePro').files[0]
    profile.text().then(prof => {
        let body = JSON.stringify({data: prof})
        fetch('/api/update/profiles', {method: 'post', body: body, headers: headers}).then(() => {
            fetch('/api/data', {headers: headers})
                .then(async res => {
                    if (res.status === 500) alertMsg('error')
                    data = await res.json()
                    console.log(data)
                })
                .catch(err => alertMsg(err))
        }).catch(err => alertMsg(err))
    })
    //todo
    document.getElementById('formFileIso').style.display = "block";
    document.getElementById('idIsoBt').style.display = "block";
}

function sendIsolateData() {
    let headers = {'Content-Type': 'application/json'}
    let isolate = document.getElementById('formFileIso').files[0]
    isolate.text().then(iso => {

        let body = JSON.stringify({data: iso})
        fetch('/api/update/isolates', {method: 'post', body: body, headers: headers}).then(() => {
            fetch('/api/data', {headers: headers})
                .then(async res => {
                    if (res.status === 500) alertMsg('error')
                    data = await res.json()
                    console.log(data)
                })
                .catch(err => alertMsg(err))
        }).catch(err => alertMsg(err))
    })
}

function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    let body = JSON.stringify({data: nwk})
    let headers = {'Content-Type': 'application/json'}

    fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            data = await res.json()
        })
        .catch(err => alertMsg(err))
}


/********************* Aux function *********************/

function alertMsg(message, kind) {
    if (!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML = `<div class="alert alert-${kind} alert-dismissible" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${message}
            </div>`
}

/**
 * Adds buttons only applied for dendrogram.
 */
function showGraphConfig() {
    document.getElementById('graphConfig').style.display = "grid";
}

/**
 * Removes buttons only applied for dendrogram.
 */
function hideGraphConfig() {
    document.getElementById('graphConfig').style.display = "none";

    if (document.querySelector('.horizontalScale')) {
        document.querySelector('.horizontalScale').remove();
    }
    if (document.querySelector('.scaleText')) {
        document.querySelector('.scaleText').remove();
    }
    //horizontalScaleVisible = false;
}


/** Download File **/
function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.getHTML = function (who, deep) {
    if (!who || !who.tagName) return '';
    var txt, ax, el = document.createElement("div");
    el.appendChild(who.cloneNode(false));
    txt = el.innerHTML;
    if (deep) {
        ax = txt.indexOf('>') + 1;
        txt = txt.substring(0, ax) + who.innerHTML + txt.substring(ax);
    }
    el = null;
    return txt;
}
