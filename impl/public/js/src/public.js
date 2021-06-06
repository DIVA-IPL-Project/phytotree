window.onload = load

let scale = 1000
let scaleVertical = 5

let margin = {
    top: 41,
    right: 10,
    bottom: 30,
    left: 250
}
let width = window.innerWidth - margin.left - margin.right
let height = window.innerHeight - margin.top - margin.bottom

let data
let render
let is_table_profile_create = false
let is_table_isolate_create = false


function create_table_profile(data) {
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
    data.nodes.forEach( node => {
        const body_row = body.insertRow()
        const cell_node_name = body_row.insertCell()
        cell_node_name.textContent = node.key
        const b_cells = node.profile.forEach(profile => {
            const cell = body_row.insertCell()
            cell.textContent = profile
        })
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
    data.nodes.forEach( node => {
        const body_row = body.insertRow()
        const b_cells = node.isolates[0].forEach(profile => {
            const cell = body_row.insertCell()
            cell.textContent = profile
        })
    })

    /** Append table  **/
    div.appendChild(table)
}

async function load() {
    //todo (if the checkbox starts checked we have to run nonShowDataPart, if the checkbox starts unchecked we have to unchecked the box here)
    const checkButton = document.getElementById('checkB')
    checkButton.addEventListener('click', checkListener)

    /*
     * Representation Buttons
     */
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
        addDendrogramButtons()
        isAlign = false
        render = buildTree
        dendrogram = render(data, isAlign)
        addNodeStyle()
        addLinkStyle()
        applyScaleText(scaleText, scale / 1000)
    })

    const primary_data = document.getElementById('profile-tab')
    primary_data.addEventListener('click', () => {
        if(!is_table_profile_create){
            create_table_profile(data)
            is_table_profile_create = true
            console.log('create table profile')
        }
    })

    const auxiliary_data = document.getElementById('isolate-tab')
    auxiliary_data.addEventListener('click', () => {
        if(!is_table_isolate_create){
            console.log('create table isolate')
            create_table_isolate(data)
            is_table_isolate_create = true
        }
    })

    /*
     * Aux Buttons
     */
    //link labels for dendrogram
    const linkLabelsButton = document.querySelector('.linkLabels')
    linkLabelsButton.addEventListener('click', addLinkLabels)

    //align nodes in dendrogram
    const alignNodesInDendrogramButton = document.querySelector('.align-nodes')
    alignNodesInDendrogramButton.addEventListener('click', alignNodes)

    //parent labels for dendrogram
    const parentLabelsButton = document.querySelector('.parentLabels')
    parentLabelsButton.addEventListener('click', addInternalLabels)

    const nwkBtn = document.getElementById('nwkBtn')
    nwkBtn.addEventListener('click', sendNwkData)

    //buttons for rescale
    let leftButton = document.getElementById('leftButton')
    let rightButton = document.getElementById('rightButton')
    let upButton = document.getElementById('upButton')
    let downButton = document.getElementById('downButton')

    setupScaleBtn(upButton, () => verticalRescale(true))
    setupScaleBtn(downButton, () => verticalRescale(false))
    setupScaleBtn(leftButton, () => horizontalRescale(false))
    setupScaleBtn(rightButton, () => horizontalRescale(true))

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
            return { mDown, mUp }
        }
    }


    //button for logarithmic scale
    const logScaleButton = document.querySelector('.logScale')
    logScaleButton.addEventListener('click', applyLogScale)

    //button for linear scale
    const linearScaleButton = document.querySelector('.linearScale')
    linearScaleButton.addEventListener('click', applyLinearScale)

    const nwkSendButton = document.getElementById('idNwkBt')
    nwkSendButton.addEventListener('click', sendNewickData)
    const profSendButton = document.getElementById('idPrfBt')
    profSendButton.addEventListener('click', sendProfileData)

    const isoSendButton = document.getElementById('idIsoBt')
    isoSendButton.addEventListener('click', sendIsolateData)

    let resp = await fetch('http://localhost:8000/api/data')
    if (resp.status !== 200) alertMsg(resp.statusText)
    else data = await resp.json()
    console.log('___')
    console.log(data)

    // windowNavBar()
    // addListenersToTables()z<z<
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

function checkListener(){
    const checkButton = document.getElementById('checkB')

    if (checkButton.checked === true){
        nonShowDataPart()
    } else {
        showDataPart()
    }
}

function showConfig(display){
    document.getElementById('configText').style.display = display
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
    document.querySelector('.align-nodes').style.display = "block"
    document.querySelector('.parentLabels').style.display = "block"
    document.querySelector('.linkLabels').style.display = "block"
    document.getElementById('logScaleButton').style.display = "block"
    document.getElementById('labelLogScale').style.display = "block"
    document.getElementById('linearScaleButton').style.display = "block"
    document.getElementById('labelLinearScale').style.display = "block"
    document.getElementById('scaleButtons').style.display = "block"

    showConfig("block")
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
    document.getElementById('scaleButtons').style.display = "none";

    if (document.querySelector('.horizontalScale')) {
        document.querySelector('.horizontalScale').remove();
    }
    if (document.querySelector('.scaleText')) {
        document.querySelector('.scaleText').remove();
    }
    horizontalScaleVisible = false;
    showConfig("none")
}

/** input data **/

function sendNewickData(){
    let headers = {'Content-Type': 'application/json'}
    //let nwk = document.getElementById('formFileNw').files[0]
    // nwk.text().then(newick => {
    //     console.log(newick)
    //     let body = JSON.stringify({data: newick})
    //     fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
    //         .then(() => {
    //             fetch('/api/data', {method: 'post', body: body, headers: headers})
    //                 .then(async res => {
    //                     if (res.status === 500) alertMsg('error')
    //                     data = await res.json()
    //                     console.log(data)
    //                 })
    //                 .catch(err => alertMsg(err))
    //         })
    //         .catch()
    // })

    //todo
    document.getElementById('idPrfBt').style.display = "block";
    document.getElementById('formFilePro').style.display = "block";
}

function sendProfileData(){
    let headers = {'Content-Type': 'application/json'}
    let profile = document.getElementById('formFilePro').files[0]
    console.log(profile)
    profile.text().then(prof => {
        console.log(prof)
    //     let body = JSON.stringify({data: prof})
    //     fetch('/api/update/profiles', {method: 'post', body: body, headers: headers}).catch()
    })
    //todo
    document.getElementById('formFileIso').style.display = "block";
    document.getElementById('idIsoBt').style.display = "block";
}

function sendIsolateData(){
    let headers = {'Content-Type': 'application/json'}
    let isolate = document.getElementById('formFileIso').files[0]
    console.log(isolate)
    isolate.text().then(iso => {
        console.log(iso)
        // let body = JSON.stringify({data: iso})
        // fetch('/api/update/isolates', {method: 'post', body: body, headers: headers}).catch()
    })
}

function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    let body = JSON.stringify({data: nwk})
    let headers = {'Content-Type': 'application/json'}

    fetch('/api/update/newick', {method: 'post', body: body, headers: headers})
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            console.log('data::')
            data = await res.json()
            console.log('data::')
            console.log(data)
        })
        .catch(err => alertMsg(err))
}

// function addListenersToTables() {
//     if (document.querySelector('.prof') !== null) {
//         document.querySelectorAll('.prof').forEach(elem => {
//             elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
//             elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#FFFFFF')
//             elem.addEventListener('click', () => clickHeader(elem))
//         })
//     }
//     if (document.querySelector('.iso') !== null) {
//         document.querySelectorAll('.iso').forEach(elem => {
//             elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
//             elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#FFFFFF')
//             elem.addEventListener('click', () => clickHeader(elem))
//         })
//     }
//     if (document.querySelector('.treeButton') !== null) {
//         document.querySelector('.treeButton').addEventListener('click', () => document.location = '/home')
//     }
//     if (document.querySelector('.profilesButton') !== null) {
//         document.querySelector('.profilesButton').addEventListener('click', goToProfiles)
//     }
//     if (document.querySelector('.isolatesButton') !== null) {
//         document.querySelector('.isolatesButton').addEventListener('click', goToIsolates)
//     }
// }
//
// function clickHeader(header) {
//     const HeaderId = header.parentNode.getElementsByTagName('th')[header.id].cellIndex
//     const headerName = header.parentNode.getElementsByTagName('th')[header.id].innerHTML
//     const tdElements = header.parentNode.parentNode.parentNode.lastElementChild.getElementsByTagName('td')
//     const categories = []
//
//     for (let i = 0; i < tdElements.length; i++) {
//         if (tdElements[i].cellIndex === HeaderId) {
//             tdElements[i].style.backgroundColor = '#cfcfcf'
//             categories.push({
//                 profile: tdElements[i].parentNode.cells[0].innerText,
//                 isolate: tdElements[i].innerText
//             })
//         } else {
//             tdElements[i].style.backgroundColor = '#FFFFFF'
//         }
//     }
//
//     let counts = [];
//     categories.forEach(function (d) {
//         let item = {}
//         if (!counts.find(i => i.name === d.isolate)) {
//             item.name = d.isolate
//             item.value = 0;
//             counts.push(item)
//         }
//         counts.find(i => i.name === d.isolate).value++
//     });
//     const totalLength = counts.length
//     if (counts.length > 20) {
//         counts = counts.slice(0, 19)
//         counts.push({name: 'Others', value: totalLength - 20})
//     }
//     constructPieChart(counts, headerName)
// }

const colorsRange = [
    "#1b70fc", "#33f0ff", "#718a90", "#b21bff", "#fe6616",
    "#f9bc0f", "#b65d66", "#07a2e6", "#c091ae", "#10b437",
    "#ea42fe", "#c281fe", "#4f33ff", "#a946aa", "#16977e",
    "#a88178", "#5776a9", "#678007", "#fa9316", "#85c070",
    "#6aa2a9", "#989e5d", "#cd714a", "#c5639c", "#c23271",
    "#678275", "#c5a121", "#a978ba", "#e7160c", "#d24506",
    "#6f7385", "#9a634a", "#48aa6f", "#ad9ad0", "#6a8a53",
    "#8c46fc", "#8f5ab8", "#7133ff", "#d77cd1", "#a9804b",
    "#a67389", "#9e8cfe", "#bd443c", "#6d63ff", "#d110d5",
    "#798cc3", "#25b3a7", "#938c6d", "#a05787", "#9c87a0",
    "#20c773", "#8b696d", "#78762d", "#e154c6", "#40835f",
    "#d73656", "#1397a3", "#f940a5", "#66aeff", "#d097e7",
    "#cf7c97", "#8b900a", "#d47270",
]

function constructPieChart(data, headerName) {
    if (!d3.select('svg').selectAll('g').empty()) {
        d3.select('svg').selectAll('g').remove()
    }
    const g = d3.select('svg').append('g').attr("transform", `translate(550, 150)`).attr('id', 'pieChart')

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
    let labels = []

    document.querySelectorAll('.arc').forEach(item => {
        colors.push(item.getElementsByTagName('path')[0].attributes['fill'].nodeValue)
    })

    document.querySelectorAll('.arc').forEach(item => {
        labels.push(item.getElementsByTagName('path')[0].attributes['id'].nodeValue)
    })

    const pieChart = d3.select('svg').append('g')

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
            .text(labels[i])
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
    labels = []
}

function goToIsolates() {
    fetch('/isolates')
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            else document.location.href = '/isolates'
        })
        .catch(err => alertMsg(err))
}

function goToProfiles() {
    fetch('/profiles')
        .then(async res => {
            if (res.status === 500) alertMsg('error')
            else document.location.href = '/profiles'
        })
        .catch(err => alertMsg(err))
}
