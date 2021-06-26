window.onload = load

let data
let is_table_profile_create = false
let is_table_isolate_create = false
let view

/********************* Load Page *********************/

async function load() {
    setupRepresentationButtons()
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
        hideGraphConfig()
        view = circularRadial
        let graph = circularRadial.build(data)
        circularRadial.draw('#container', graph.root)
    })

    const radialButton = document.querySelector('.radialTree-btn')
    radialButton.addEventListener('click', () => {
        setupRadialGraphConfiguration()
        view = radial
        let graph = radial.build(data)
        radial.draw('#container', graph.root)

        changeNodeColor(radial.changeNodeColor, radial.getNodes())
        changeNodeSize(radial.changeNodeSize)
        changeLinkSize(radial.changeLinkSize)
        changeLabelsSize(radial.changeLabelsSize)
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        setupDendrogramGraphConfiguration()
        view = dendrogram
        let graph = dendrogram.build(data)
        dendrogram.draw('#container', graph.root)

        dendrogram.addNodeStyle()
        dendrogram.addLinkStyle()

        changeNodeColor(dendrogram.changeNodeColor, dendrogram.getNodes())
        changeNodeSize(dendrogram.changeNodeSize)
        changeLinkSize(dendrogram.changeLinkSize)
        changeLabelsSize(dendrogram.changeLabelsSize)
    })
}

async function setupData() {
    document.getElementById('nwkBtn').addEventListener('click', sendNwkData)

    document.getElementById('idNwkBt').addEventListener('click', sendNewickData)
    document.getElementById('idPrfBt').addEventListener('click', sendProfileData)
    document.getElementById('idIsoBt').addEventListener('click', sendIsolateData)

    document.getElementById('downloadSVG').addEventListener('click', downloadSVG)

    // let resp = await fetch('http://localhost:8000/api/data')
    // if (resp.status !== 200) alertMsg(resp.statusText)
    // else data = await resp.json()
}

/********************* Setup Navbar UI *********************/

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

function setupDendrogramGraphConfiguration() {
    showGraphConfig()

    const parentLabels = document.querySelector('.parentLabels'),
        alignNodes = document.querySelector('.align-nodes'),
        linkLabels = document.querySelector('.linkLabels'),
        linearScale = document.querySelector('.linearScale'),
        logScale = document.querySelector('.logScale')

    parentLabels.addEventListener('click', dendrogram.addInternalLabels)
    alignNodes.addEventListener('click', dendrogram.alignNodes)
    linkLabels.addEventListener('click', dendrogram.addLinkLabels)

    parentLabels.style.display = ''
    alignNodes.style.display = ''
    linkLabels.style.display = ''
    linearScale.style.display = ''
    logScale.style.display = ''

    linearScale.addEventListener('click', dendrogram.applyLinearScale)
    logScale.addEventListener('click', dendrogram.applyLogScale)

    let up = document.getElementById('upButton')
    let down = document.getElementById('downButton')
    let left = document.getElementById('leftButton')
    let right = document.getElementById('rightButton')

    up.style.display = ''
    down.style.display = ''

    setupScaleBtn(up, () => dendrogram.verticalRescale(true))
    setupScaleBtn(down, () => dendrogram.verticalRescale(false))
    setupScaleBtn(left, () => dendrogram.horizontalRescale(false))
    setupScaleBtn(right, () => dendrogram.horizontalRescale(true))
}

function setupRadialGraphConfiguration() {
    showGraphConfig()

    const parentLabels = document.querySelector('.parentLabels'),
        alignNodes = document.querySelector('.align-nodes'),
        linkLabels = document.querySelector('.linkLabels'),
        linearScale = document.querySelector('.linearScale'),
        logScale = document.querySelector('.logScale')

    parentLabels.addEventListener('click', radial.addInternalLabels)
    linkLabels.addEventListener('click', radial.addLinkLabels)
    linearScale.addEventListener('click', radial.applyLinearScale)
    logScale.addEventListener('click', radial.applyLogScale)

    parentLabels.style.display = ''
    alignNodes.style.display = 'none'
    linkLabels.style.display = ''
    linearScale.style.display = ''
    logScale.style.display = ''

    document.getElementById('upButton').style.display = 'none'
    document.getElementById('downButton').style.display = 'none'
    let left = document.getElementById('leftButton')
    let right = document.getElementById('rightButton')

    setupScaleBtn(left, () => radial.rescale(true))
    setupScaleBtn(right, () => radial.rescale(false))

}


/********************* Graph Style Aux *********************/

function changeNodeColor(func, nodes) {
    if (document.querySelector(".color") != null) {
        document.querySelector(".color").remove()
    }

    // Create Container and title
    const colorDiv = document.createElement("div");
    colorDiv.setAttribute("class", "color justify-content-center");
    const title = document.createElement("p");
    title.setAttribute("class", "text-center");
    const text = document.createTextNode("Node color");
    title.appendChild(text);

    // Create Color Picker
    const inputColor = document.createElement("input");
    inputColor.setAttribute("class", "colorInput");
    inputColor.setAttribute("type", "color");
    inputColor.style.opacity = "0";
    inputColor.style.position = "absolute"
    inputColor.style.top = "10px"
    inputColor.style.left = "10px"
    inputColor.style.width = "100px"


    const button = document.createElement("button")
    button.style.position = "relative"
    button.style.bottom = "-10px"
    button.setAttribute("class", "selectColorButton btn btn-light")
    button.appendChild(document.createTextNode("Select the color"))

    // Create Node Selector
    const selectNode = document.createElement("select");
    selectNode.setAttribute("class", "selectNode form-select")
    const firstOption = document.createElement("option");
    firstOption.setAttribute("selected", "true");
    firstOption.setAttribute("disabled", "disabled");
    firstOption.innerHTML = "Select the node";
    selectNode.appendChild(firstOption);

    // Add All Nodes to Selector
    nodes.forEach(node => {
        const htmlOptionElement = document.createElement("option");
        htmlOptionElement.setAttribute("value", node);
        htmlOptionElement.innerHTML = node;
        selectNode.appendChild(htmlOptionElement);
    })

    let node, color
    selectNode.addEventListener("change", (event) => node = event.target.value)

    colorDiv.appendChild(title);
    colorDiv.appendChild(selectNode);
    colorDiv.appendChild(button);
    button.appendChild(inputColor);

    document.getElementById("graphConfig").appendChild(colorDiv);

    inputColor.addEventListener("change", (event) => {
        color = event.target.value
        if (node && color) func(node, color)
        node = null
        color = null
    });

}

function changeNodeSize(func) {
    if (document.querySelector(".nodeSize") != null) {
        document.querySelector(".nodeSize").remove()
    }

    const nodeSizeDiv = document.createElement("div");
    nodeSizeDiv.setAttribute("class", "nodeSize justify-content-center mt-4");

    const title = document.createElement("p");
    title.setAttribute("class", "text-center");
    const text = document.createTextNode("Node size");
    title.appendChild(text);

    const rangeInput = document.createElement("input");
    rangeInput.setAttribute("type", "range");
    rangeInput.setAttribute("class", "form-range");
    rangeInput.setAttribute("min", "1");
    rangeInput.setAttribute("max", "15");
    rangeInput.setAttribute("value", "3");

    rangeInput.addEventListener("change", (event) => func(event.target.value))

    nodeSizeDiv.appendChild(title);
    nodeSizeDiv.appendChild(rangeInput);

    document.getElementById("graphConfig").appendChild(nodeSizeDiv);

}

function changeLinkSize(func) {
    if (document.querySelector(".linkSize") != null) {
        document.querySelector(".linkSize").remove()
    }
    const linkSizeDiv = document.createElement("div");
    linkSizeDiv.setAttribute("class", "linkSize justify-content-center mt-4");

    const title = document.createElement("p");
    title.setAttribute("class", "text-center");
    const text = document.createTextNode("Link Thickness");
    title.appendChild(text);

    const rangeInput = document.createElement("input");
    rangeInput.setAttribute("type", "range");
    rangeInput.setAttribute("class", "form-range");
    rangeInput.setAttribute("min", "1");
    rangeInput.setAttribute("max", "15");
    rangeInput.setAttribute("value", "2");

    rangeInput.addEventListener("change", (event) => func(event.target.value))

    linkSizeDiv.appendChild(title);
    linkSizeDiv.appendChild(rangeInput);

    document.getElementById("graphConfig").appendChild(linkSizeDiv);

}

function changeLabelsSize(func) {
    if (document.querySelector(".labelsSize") != null) {
        document.querySelector(".labelsSize").remove()
    }
    const labelsSize = document.createElement("div");
    labelsSize.setAttribute("class", "labelsSize justify-content-center mt-4");

    const title = document.createElement("p");
    title.setAttribute("class", "text-center");
    const text = document.createTextNode("Labels Size");
    title.appendChild(text);

    const rangeInput = document.createElement("input");
    rangeInput.setAttribute("type", "range");
    rangeInput.setAttribute("class", "form-range");
    rangeInput.setAttribute("min", "5");
    rangeInput.setAttribute("max", "35");
    rangeInput.setAttribute("value", "12");

    rangeInput.addEventListener("change", (event) => func(event.target.value))

    labelsSize.appendChild(title);
    labelsSize.appendChild(rangeInput);

    document.getElementById("graphConfig").appendChild(labelsSize);

}


/********************* Navbar UI Aux *********************/

function setupScaleBtn(elem, func) {
    let event = events()
    elem.addEventListener('mousedown', event.mDown)
    elem.addEventListener('mouseup', event.mUp)
    elem.addEventListener('mouseleave', event.mUp)

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


/********************* Data UI *********************/

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


/********************* Tables *********************/

const filterTables = {
    name : 'Bar chart',
    line: [],
    column : [],
    transform : () => {}//dendrogram.buildBarChart
}

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
        cell.setAttribute('id', row + '_profile')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style', "cursor: pointer")
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
                cell.setAttribute('style', "cursor: pointer")
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
        cell.setAttribute('id', row + '_isolate')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style', "cursor: pointer")
    })

    const id = data.schemeGenes[0]
    const metadataID = data.metadata.indexOf(id)
    //
    filterTables.line.push(metadataID)
    //



    /** body **/
    const body = table.createTBody()
    data.nodes.forEach((node, i) => {
        if (node.isolates !== undefined) {
            const b_cells = node.isolates.forEach(isolate => {

                const body_row = body.insertRow()
                body_row.setAttribute('class', "text-center")
                isolate.forEach(iso => {
                    const cell = body_row.insertCell()
                    cell.textContent = iso
                    cell.setAttribute('style', "cursor: pointer")
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
            elem.addEventListener('click', () => clickHeader(elem, '#svg_profile', categories.categoriesProfile, false))
        })
    }
    if (document.querySelector('.iso') !== null) {
        document.querySelectorAll('.iso').forEach(elem => {
            elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
            elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#212529')
            elem.addEventListener('click', () => clickHeader(elem, '#svg_isolate', categories.categoriesIsolate, true))
        })
    }
}


const categories = {
    categoriesProfile: new Map(),
    categoriesIsolate: new Map()
}

const names = []

/**
 *
 * @param id {string}
 * @param map {Map}
 * @returns {*}
 */
function contains(id, map) {
    return map.has(id)
}

/**
 *
 * @param header {}
 * @param id {string}
 * @param categories {Map}
 */
function clickHeader(header, id, categories, isolate) {
    const HeaderId = header.parentNode.getElementsByTagName('td')[header.id].cellIndex
    const headerName = header.parentNode.getElementsByTagName('td')[header.id].innerHTML
    const tdElements = header.parentNode.parentNode.parentNode.lastElementChild.getElementsByTagName('td')

    // Check and remove the map
    if (categories.has(HeaderId.toString())) {
        categories.delete(HeaderId.toString())
        //remove column color
        removeColumn(tdElements, HeaderId, categories)
        removeColumnName(headerName)

        if(isolate) {
            for (let i = 0; i < filterTables.column.length; i++) {
                if (filterTables.column[i] === HeaderId) {
                    filterTables.column.splice(i, 1)
                }
            }
        }
    } else {
        // Put in map for the first time
        if (tdElements.length > 0) {
            if (isolate) {
                filterTables.column.push(HeaderId)
            }
            categories.set(HeaderId.toString(), [])
            const array = categories.get(HeaderId.toString())
            addColumn(tdElements, HeaderId, array, categories)
            addColumnName(headerName)
        }
    }

    console.log(filterTables)

    let counts = []


    categories.forEach((value, key) => {
        value.forEach((val) => {
            let item = {}
            if (!counts.find(i => i.name === val.isolate)) {
                item.name = val.isolate
                item.value = 0
                counts.push(item)
            }
            counts.find(i => i.name === val.isolate).value++
        })
    })

    const totalLength = counts.length
    if (counts.length > 20) {
        counts = counts.slice(0, 19)
        counts.push({name: 'Others', value: totalLength - 20})
    }
    constructPieChart(counts, names, id)
}

function addColumn(tdElements, HeaderId, array, categories){
    for (let i = 0; i < tdElements.length; i++) {
        if (tdElements[i].cellIndex === HeaderId || contains(tdElements[i].cellIndex.toString(), categories)) {
            if (tdElements[i].cellIndex === HeaderId) {
                array.push({
                    profile: tdElements[i].parentNode.cells[0].innerText,
                    isolate: tdElements[i].innerText
                })
            }
            tdElements[i].style.backgroundColor = '#cfcfcf'
        } else {
            tdElements[i].style.backgroundColor = '#FFFFFF'
        }
    }
}

function removeColumn(tdElements, HeaderId, categories){
    for (let i = 0; i < tdElements.length; i++) {
        if (tdElements[i].cellIndex === HeaderId || !contains(tdElements[i].cellIndex.toString(), categories)) {
            tdElements[i].style.backgroundColor = '#FFFFFF'
        } else {
            tdElements[i].style.backgroundColor = '#cfcfcf'
        }
    }
}

function addColumnName(name){
    names.push(name)
}

function removeColumnName(name){
    for (let i = 0; i < names.length; i++) {
        if(names[i] === name){
            names.splice(i, 1)
        }
    }
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

const categories_colors = []

function constructPieChart(data, names, id) {
    if (!d3.select(id).selectAll('g').empty()) {
        d3.select(id).selectAll('g').remove()
    }

    //remove and return if data equals empty
    if(data.length === 0) return

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

        categories_colors.push({
            name: item.name,
            color: colors[i]
        })

        position += 20
    })

    const legend = pieChart.attr('id', 'legend')
    legend.append('text')
        .attr('y', 350)
        .attr('x', 525)
        .text(formatArray(names))
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

    legend.append('text')
        .attr('y', 380)
        .attr('x', 510)
        .text('Categories: ' + data.length)
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle")

    colors = []
    console.log(categories_colors)
}

function formatArray(names){
    let toReturn = ''
    names.forEach(name => {
        toReturn += `${name}, `
    })
    return toReturn.slice(0, toReturn.length - 2)
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

function downloadSVG() {
    console.log(dendrogram.context)
    const svg = document.getHTML(view.context.svg.element.node(), true)
    download("view.svg", svg)
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
