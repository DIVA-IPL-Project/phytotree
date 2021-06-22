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
        }
    })

    document.getElementById('isolate-tab').addEventListener('click', () => {
        if (!is_table_isolate_create) {
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
    const table = document.getElementById('table_profile')
    table.setAttribute('class', 'table table-bordered table-hover')
    table.setAttribute('height', "450")

    /** head **/
    const head = table.createTHead()
    head.setAttribute('class', 'table-dark')
    const head_row = head.insertRow()
    head_row.setAttribute('class', "text-center")
    data.schemeGenes.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('class', 'prof')
        cell.setAttribute('id', row+'_profile')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style',"cursor: pointer")
    })

    /** body **/
    const body = table.createTBody()
    data.nodes.forEach(node => {
        if (node.profile !== undefined) {
            const body_row = body.insertRow()
            body_row.setAttribute('class', "text-center")
            const b_cells = node.profile.forEach(profile => {
                const cell = body_row.insertCell()
                cell.textContent = profile
                cell.setAttribute('style',"cursor: pointer")
            })
        }
    })

    table.setAttribute('class', 'table table-bordered table-hover')
    table.setAttribute('height', "450")
    addListenersToTables()
}

function create_table_isolate(data) {

    /** Table **/
    const table = document.getElementById('table_isolate')

    /** head **/
    const head = table.createTHead()
    head.setAttribute('class', 'table-dark')
    const head_row = head.insertRow()
    head_row.setAttribute('class', "text-center")
    data.metadata.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('class', 'iso')
        cell.setAttribute('id', row+'_isolate')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style',"cursor: pointer")
    })

    /** body **/
    const body = table.createTBody()
    data.nodes.forEach(node => {
        if (node.isolates !== undefined) {
            const b_cells = node.isolates.forEach(isolate => {
                const body_row = body.insertRow()
                body_row.setAttribute('class', "text-center")
                isolate.forEach(iso => {
                    const cell = body_row.insertCell()
                    cell.textContent = iso
                    cell.setAttribute('style',"cursor: pointer")
                })
            })
        }
    })

    table.setAttribute('class', 'table table-bordered table-hover table-responsive')
    table.setAttribute('height', '450')
    addListenersToTables()
}

function addListenersToTables() {
    if (document.querySelector('.prof') !== null) {
        document.querySelectorAll('.prof').forEach(elem => {
            elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
            elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#212529')
            elem.addEventListener('click', () => clickHeader(elem, '#svg_profile'))
        })
    }
    if (document.querySelector('.iso') !== null) {
        document.querySelectorAll('.iso').forEach(elem => {
            elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
            elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#212529')
            elem.addEventListener('click', () => clickHeader(elem, '#svg_isolate'))
        })
    }
}


function clickHeader(header, id) {
    const HeaderId = header.parentNode.getElementsByTagName('td')[header.id].cellIndex
    const headerName = header.parentNode.getElementsByTagName('td')[header.id].innerHTML
    const tdElements = header.parentNode.parentNode.parentNode.lastElementChild.getElementsByTagName('td')
    const categories = []

    for (let i = 0; i < tdElements.length; i++) {
        if (tdElements[i].cellIndex === HeaderId) {
            tdElements[i].style.backgroundColor = '#cfcfcf'
            categories.push({
                profile: tdElements[i].parentNode.cells[0].innerText,
                isolate: tdElements[i].innerText
            })
        } else {
            tdElements[i].style.backgroundColor = '#FFFFFF'
        }
    }

    let counts = [];
    categories.forEach(function (d) {
        let item = {}
        if (!counts.find(i => i.name === d.isolate)) {
            item.name = d.isolate
            item.value = 0;
            counts.push(item)
        }
        counts.find(i => i.name === d.isolate).value++
    });
    const totalLength = counts.length
    if (counts.length > 20) {
        counts = counts.slice(0, 19)
        counts.push({name: 'Others', value: totalLength - 20})
    }
    constructPieChart(counts, headerName, id)
}

const colorsRange = [
    "#1b70fc", "#33f0ff", "#718a90", "#b21bff", "#fe6616",
    "#f9bc0f", "#b65d66", "#07a2e6", "#c091ae", "#10b437",
    "#ea42fe", "#c281fe", "#4f33ff", "#a946aa", "#16977e",
    "#a88178", "#5776a9", "#678007", "#fa9316", "#85c070",
    "#6aa2a9", "#989e5d", "#cd714a", "#c5639c", "#c23271",
    "#678275", "#c5a121", "#a978ba", "#ee534e", "#d24506",
    "#6f7385", "#9a634a", "#48aa6f", "#ad9ad0", "#6a8a53",
    "#8c46fc", "#8f5ab8", "#7133ff", "#d77cd1", "#a9804b",
    "#a67389", "#9e8cfe", "#bd443c", "#6d63ff", "#d110d5",
    "#798cc3", "#25b3a7", "#938c6d", "#a05787", "#9c87a0",
    "#20c773", "#8b696d", "#78762d", "#e154c6", "#40835f",
    "#d73656", "#1397a3", "#f940a5", "#66aeff", "#d097e7",
    "#cf7c97", "#8b900a", "#d47270",
]

function constructPieChart(data, headerName, id) {
    if (!d3.select(id).selectAll('g').empty()) {
        d3.select(id).selectAll('g').remove()
    }
    const g = d3.select(id).append('g').attr("transform", `translate(550, 150)`).attr('id', 'pieChart')

    const pie = d3.pie().value(d => d.value)

    const path = d3.arc().outerRadius(150).innerRadius(30)

    const color = d3.scaleOrdinal()
        .domain(d3.range(0, length))
        .range(colorsRange)

    const pies = g.selectAll('.arc')
        .data(pie(data))
        .enter()
        .append('g')
        .classed('arc', true)

    pies.append('path')
        .attr('d', d => path(d))
        .attr('fill', (d, i) => color(i))
        .attr('id', d => d.data.name)

    let colors = []

    document.querySelectorAll('.arc').forEach(item => {
        colors.push(item.getElementsByTagName('path')[0].attributes['fill'].nodeValue)
    })

    const pieChart = d3.select(id).append('g')

    let position = 30
    data.forEach((item, i) => {
        pieChart.append('circle')
            .attr('cy', position)
            .attr('cx', 760)
            .attr('r', 6)
            .style('fill', colors[i])

        pieChart.append('text')
            .attr('y', position)
            .attr('x', 770)
            .text(item.name)
            .style("font-size", "15px")
            .attr("alignment-baseline", "middle")

        position += 20
    })

    const legend = pieChart.attr('id', 'legend')
    legend.append('text')
        .attr('y', 350)
        .attr('x', 525)
        .text(headerName)
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

    legend.append('text')
        .attr('y', 380)
        .attr('x', 510)
        .text('Categories: ' + data.length)
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

    colors = []
}


/********************* API data functions *********************/

function sendNewickData() {
    let headers = {'Content-Type': 'application/json'}
    let nwk = document.getElementById('formFileNw').files[0]
    nwk.text().then(newick => {
        let body = JSON.stringify({data: newick})
        return fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
            .then(() => {
                return fetch('/api/data', {headers: headers})
                    .then(async res => {
                        if (res.status === 500) alertMsg('error')
                        data = await res.json()
                    })
                    .catch(err => alertMsg(err))
            })
            .catch(err => alertMsg(err))
    })

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
            fetch('/api/data', {headers: headers})
                .then(async res => {
                    if (res.status === 500) alertMsg('error')
                    data = await res.json()
                })
                .catch(err => alertMsg(err))
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
