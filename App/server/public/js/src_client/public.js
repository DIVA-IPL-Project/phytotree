window.onload = load

let dendrogram, radial
let data
let is_table_profile_create = false
let is_table_isolate_create = false
let view
let lastHValue = 50, lastVValue = 50, lastRValue = 50

/********************* Load Page *********************/

/**
 * Loads page.
 */
function load() {
    dendrogram = dendrogramView()
    radial = radialView()
    setupRepresentationButtons()
    setupTabs()
    setupData()
}

/********************* Setup UI *********************/

/**
 * Displays test app or normal app.
 */
function test_input_handler() {
    const checkBox = document.getElementById('flexCheckDefault')
    if (checkBox.checked === true) {
        display_test_app()
    } else {
        display_app()
    }
}

/**
 * Hides the configuration of graph.
 */
function hideGraphConfig() {
    document.getElementById('graphConfig').style.display = 'none'
}

/**
 * Defines app display.
 */
function display_app() {

    document.getElementById('container').innerHTML = ''

    document.getElementById('nwk').style.display = 'block'
    document.getElementById('nwkBtn').style.display = 'block'
    document.getElementById('formFileNw').style.display = 'block'
    document.getElementById('idNwkBt').style.display = 'block'
    document.getElementById('textData').style.display = 'block'

    document.getElementById('textNwkData').style.display = 'block'
    document.getElementById('textNwkFile').style.display = 'block'

    document.getElementById('radButton').style.display = 'none'
    document.getElementById('denButton').style.display = 'none'
    document.getElementById('visualization').style.display = 'none'
    document.getElementById('downloadSVG').style.display = 'none'
    document.getElementById('save').style.display = 'none'
    document.getElementById('reportName').style.display = 'none'
    document.getElementById('labelReport').style.display = 'none'
    document.getElementById('reportName').value = ''

    hideGraphConfig()

    reset_data()
}

/**
 * Defines test app display.
 */
function display_test_app() {
    reset_data()

    if (document.getElementById('errorProfile')) {
        document.getElementById('errorProfile').remove()
    }

    if (document.getElementById('errorIsolate')) {
        document.getElementById('errorIsolate').remove()
    }

    document.getElementById('radButton').style.display = 'block'
    document.getElementById('denButton').style.display = 'block'
    document.getElementById('visualization').style.display = 'block'
    document.getElementById('downloadSVG').style.display = 'none'
    document.getElementById('save').style.display = 'none'
    document.getElementById('reportName').style.display = 'none'
    document.getElementById('labelReport').style.display = 'none'
    document.getElementById('reportName').value = ''

    document.getElementById('svg_profile').innerHTML = ''
    document.getElementById('svg_isolate').innerHTML = ''

    document.getElementById('container').innerHTML = ''
    document.getElementById('nwk').style.display = 'block'
    document.getElementById('nwkBtn').style.display = 'block'
    document.getElementById('formFileNw').style.display = 'block'
    document.getElementById('idNwkBt').style.display = 'block'
    document.getElementById('textData').style.display = 'block'

    document.getElementById('nwk').style.display = 'none'
    document.getElementById('nwkBtn').style.display = 'none'
    document.getElementById('formFileNw').style.display = 'none'
    document.getElementById('idNwkBt').style.display = 'none'
    document.getElementById('textData').style.display = 'none'
    document.getElementById('textNwkFile').style.display = 'none'
    document.getElementById('textNwkData').style.display = 'none'


    hideGraphConfig()

    set_up_test_data()
}

/**
 * Sets up test data.
 */
async function set_up_test_data() {
    is_table_profile_create = false
    is_table_isolate_create = false
    let headers = {'Content-Type': 'application/json'}
    let response = await fetch('/api/default_data', {headers: headers})
    data = await response.json()
    setupProfileTab()
    setupIsolateTab()
}

/**
 * Resets all app variables.
 */
function reset_data() {
    data = undefined
    is_table_profile_create = false
    is_table_isolate_create = false
    names_isolates = []
    names_profiles = []
    categories = {
        categoriesProfile: new Map(),
        categoriesIsolate: new Map()
    }
    filterTables = {
        name: 'Bar chart',
        line: [],
        column: [],
    }
    categories_colors = []
    document.getElementById('formFileIso').style.display = 'none'
    document.getElementById('formFilePro').style.display = 'none'
    document.getElementById('idIsoBt').style.display = 'none'
    document.getElementById('idPrfBt').style.display = 'none'
    document.getElementById('table_profile').innerHTML = ''
    document.getElementById('table_isolate').innerHTML = ''
}

/**
 * Sets up profile tab display.
 */
function setupProfileTab() {
    if (!is_table_profile_create) {
        try {
            create_table_profile(data)
            document.getElementById('profileDiv').style.display = 'block'
            document.getElementById('svg_profile').style.display = 'block'
            is_table_profile_create = true
        } catch (err) {
            document.getElementById('profileDiv').style.display = 'none'
            document.getElementById('svg_profile').style.display = 'none'
            setUpError(err.message, 'errorProfile', 'profileContent')
        }
    } else {
        addListenersToTables()
    }
}

/**
 * Sets up isoalte tab display.
 */
function setupIsolateTab() {
    if (!is_table_isolate_create) {
        try {
            document.getElementById('linktreebuttonD').style.display = 'none'
            document.getElementById('linktreebuttonR').style.display = 'none'

            create_table_isolate(data)
            document.getElementById('isolateDiv').style.display = 'block'
            document.getElementById('svg_isolate').style.display = 'block'
            is_table_isolate_create = true
        } catch (err) {
            document.getElementById('isolateDiv').style.display = 'none'
            document.getElementById('linktreebuttonD').style.display = 'none'
            document.getElementById('linktreebuttonR').style.display = 'none'
            document.getElementById('svg_isolate').style.display = 'none'
            setUpError(err.message, 'errorIsolate', 'isolateContent')
        }
    } else {
        addListenersToTables()
    }
}

/**
 * Sets up tabs.
 */
function setupTabs() {
    document.getElementById('home-tab').addEventListener('click', () => {
        addListenersToTables()
    })

    document.getElementById('profile-tab').addEventListener('click', () => {
        setupProfileTab()
    })

    document.getElementById('isolate-tab').addEventListener('click', () => {
        setupIsolateTab()
    })
}

/**
 * Sets up representation and action of buttons.
 */
function setupRepresentationButtons() {
    const radialButton = document.querySelector('.radialTree-btn')
    radialButton.addEventListener('click', () => {
        try {
            let graph = radial.build(data)
            setupRadialGraphConfiguration()
            view = radial
            radial.draw('#container', graph.tree)

            addRadialZoom()
            changeNodeColor(radial.changeNodeColor, radial.getNodes())
            changeNodeSize(radial.changeNodeSize)
            changeLinkSize(radial.changeLinkSize)
            changeLabelsSize(radial.changeLabelsSize)
            document.getElementById('downloadSVG').style.display = 'block'
            document.getElementById('save').style.display = 'block'
        } catch (err) {
            setUpError(err.message, 'treeError', 'containerError')
        }
    })

    const dendrogramButton = document.querySelector('.dendro-btn')
    dendrogramButton.addEventListener('click', () => {
        try {
            let graph = dendrogram.build(data)
            setupDendrogramGraphConfiguration()
            view = dendrogram
            dendrogram.draw('#container', graph.tree)

            dendrogram.addNodeStyle()
            dendrogram.addLinkStyle()

            addDendrogramZoom()
            changeNodeColor(dendrogram.changeNodeColor, dendrogram.getNodes())
            changeNodeSize(dendrogram.changeNodeSize)
            changeLinkSize(dendrogram.changeLinkSize)
            changeLabelsSize(dendrogram.changeLabelsSize)
            document.getElementById('downloadSVG').style.display = 'block'
            document.getElementById('save').style.display = 'block'
        } catch (err) {
            setUpError(err.message, 'treeError', 'containerError')
        }
    })
}

/**
 * Sets up error message display.
 * @param message {string}
 * @param id {string}
 * @param contentId {string}
 */
function setUpError(message, id, contentId) {
    if (document.getElementById(id) != null) return
    const div = document.createElement('div')
    div.setAttribute('id', id)
    div.setAttribute('class', 'alert alert-danger')
    div.setAttribute('role', 'alert')
    const txt = document.createElement('p')
    txt.innerText = message
    div.appendChild(txt)
    document.getElementById(contentId).appendChild(div)
}

/**
 * Sets up data buttons display and actions.
 */
function setupData() {
    document.getElementById('flexCheckDefault').addEventListener('click', test_input_handler)
    document.getElementById('nwkBtn')
        .addEventListener('click', () => resetViewsOnDataRequest(sendNwkData))

    document.getElementById('idNwkBt')
        .addEventListener('click', () => resetViewsOnDataRequest(sendNewickData))
    document.getElementById('idPrfBt').addEventListener('click', sendProfileData)
    document.getElementById('idIsoBt').addEventListener('click', sendIsolateData)

    document.getElementById('downloadSVG').addEventListener('click', () => {
        document.getElementById('reportName').style.display = 'block'
        document.getElementById('labelReport').style.display = 'block'
        document.getElementById('downloadSVG').style.display = 'none'
        document.getElementById('reportName').addEventListener('change', () => {
            if (document.getElementById('reportName').value === '') return
            downloadReport('report.pdf', document.getElementById('reportName').value)
        })
    })
    document.getElementById('save')
        .addEventListener('click', () => {
            let save = view.save()
            save.isolatePieChart = d3.select('#svg-extra').html()
            downloadFile('save.json', JSON.stringify(save))
        })
    document.getElementById('load')
        .addEventListener('click', () => {
            let save = document.getElementById('loadFile').files[0]
            const ext = save.name.split('.')
            if (ext[1] !== 'json') {
                alertMsg('Extension for save file must be json.')
                return
            }
            save.text().then(text => {
                let save = JSON.parse(text)
                switch (save.type) {
                    case 'dendrogram':
                        try {
                            loadView(dendrogram, save)
                            document.getElementById('radButton').style.display = 'block'
                            document.getElementById('denButton').style.display = 'block'
                            document.getElementById('visualization').style.display = 'block'
                            document.getElementById('downloadSVG').style.display = 'block'
                            document.getElementById('save').style.display = 'block'
                        } catch (e) {
                            alertMsg(e.message)
                            return
                        }
                        setupDendrogramGraphConfiguration()
                        break
                    case 'radial':
                        try {
                            loadView(radial, save)
                            document.getElementById('radButton').style.display = 'block'
                            document.getElementById('denButton').style.display = 'block'
                            document.getElementById('visualization').style.display = 'block'
                            document.getElementById('downloadSVG').style.display = 'block'
                            document.getElementById('save').style.display = 'block'
                        } catch (e) {
                            alertMsg(e.message)
                            return
                        }
                        setupRadialGraphConfiguration()
                        break
                    default:
                        alertMsg('Invalid save file. No tree type specified.')
                }
                if (!is_table_profile_create) {
                    setupProfileTab()
                }

                if (!is_table_isolate_create) {
                    setupIsolateTab()
                }

                if(save.isolatePieChart){
                    addPieChartHTML(save.isolatePieChart)
                    document.getElementById('svg-extra').setAttribute('width', 700)
                    let isolate_value = document.getElementById('isolateFilter').innerHTML
                    isolate_value.split(', ').forEach(iso => {
                        let elem = document.getElementById(iso.concat('_isolate'))
                        clickHeaderIsolates(elem, '#svg_isolate', categories.categoriesIsolate)
                    })
                }
            })
        })
}

/**
 * Loads a visualization
 * @param {*} vis 
 * @param {*} save 
 */
function loadView(vis, save) {
    view = vis
    data = vis.load('#container', save)
    changeNodeColor(vis.changeNodeColor, vis.getNodes())
    changeNodeSize(vis.changeNodeSize)
    changeLinkSize(vis.changeLinkSize)
    changeLabelsSize(vis.changeLabelsSize)
}

/********************* Setup Navbar UI *********************/

/**
 * Adds buttons only applied for dendrogram.
 */
function showGraphConfig() {
    document.getElementById('graphConfig').style.display = 'grid'
}

/**
 * Applies func to search for elem.
 * @param {*} elem 
 * @param {*} func 
 */
function search(elem, func) {
    let event = events()
    elem.addEventListener('keyup', () => event())

    function events() {
        let id

        function search() {
            clearInterval(id)
            id = setTimeout(func, 1000)
        }

        return search
    }
}

/**
 * Sets up dendrogram graph configuration.
 */
function setupDendrogramGraphConfiguration() {
    showGraphConfig()
    const input = document.getElementById('search')
    search(input, () => {
        let value = input.value
        dendrogram.search(value)
    })

    const parentLabels = document.querySelector('.parentLabels'),
        alignNodes = document.querySelector('.align-nodes'),
        linkLabels = document.querySelector('.linkLabels'),
        linearScale = document.querySelector('.linearScale'),
        logScale = document.querySelector('.logScale'),
        spread = document.querySelector('.spread')

    parentLabels.addEventListener('click', dendrogram.addInternalLabels)
    alignNodes.addEventListener('click', dendrogram.alignNodes)
    linkLabels.addEventListener('click', dendrogram.addLinkLabels)

    parentLabels.style.display = 'block'
    alignNodes.style.display = 'block'
    linkLabels.style.display = 'block'
    linearScale.style.display = 'block'
    logScale.style.display = 'block'
    spread.style.display = 'none'

    linearScale.addEventListener('click', dendrogram.applyLinearScale)
    logScale.addEventListener('click', dendrogram.applyLogScale)
}

/**
 * Sets up radial graph configuration.
 */
function setupRadialGraphConfiguration() {
    showGraphConfig()

    const input = document.getElementById('search')
    search(input, () => {
        let value = input.value
        radial.search(value)
    })

    const parentLabels = document.querySelector('.parentLabels'),
        alignNodes = document.querySelector('.align-nodes'),
        linkLabels = document.querySelector('.linkLabels'),
        linearScale = document.querySelector('.linearScale'),
        logScale = document.querySelector('.logScale'),
        spread = document.querySelector('.spread')

    parentLabels.addEventListener('click', radial.addInternalLabels)
    linkLabels.addEventListener('click', radial.addLinkLabels)
    linearScale.addEventListener('click', radial.applyLinearScale)
    logScale.addEventListener('click', radial.applyLogScale)
    spread.addEventListener('click', radial.addSpread)

    parentLabels.style.display = 'block'
    alignNodes.style.display = 'none'
    linkLabels.style.display = 'block'
    linearScale.style.display = 'block'
    logScale.style.display = 'block'
    spread.style.display = 'block'
}


/********************* Graph Style Aux *********************/

/**
 * Adds zoom buttons and behaviour to dendrogram graph configuration.
 */
function addDendrogramZoom() {
    if (document.querySelector('.nodeZoom') != null) {
        document.querySelector('.nodeZoom').remove()
    }

    const nodeZoomDiv = document.createElement('div')
    nodeZoomDiv.setAttribute('class', 'nodeZoom justify-content-center mt-4')
    let viewId = view.type

    const verticalTitle = document.createElement('p')
    verticalTitle.setAttribute('class', 'text-center')
    verticalTitle.setAttribute('id', viewId.concat(' Vertical Zoom'))
    let text = document.createTextNode('Vertical Zoom')
    verticalTitle.appendChild(text)

    const rangeVerticalInput = document.createElement('input')
    rangeVerticalInput.setAttribute('id', 'rangeVerticalInputId')
    rangeVerticalInput.setAttribute('type', 'range')
    rangeVerticalInput.setAttribute('class', 'form-range')
    rangeVerticalInput.setAttribute('min', '0')
    rangeVerticalInput.setAttribute('max', '100')
    rangeVerticalInput.setAttribute('step', '10')
    rangeVerticalInput.setAttribute('value', '50')

    rangeVerticalInput.addEventListener('change', (event) => {
        let rate = Math.abs(event.target.value - lastVValue)
        if(lastVValue <= event.target.value)
            dendrogram.verticalRescale(true, rate)
        else
            dendrogram.verticalRescale(false, rate)
        lastVValue = event.target.value
    })

    const horizontalTitle = document.createElement('p')
    horizontalTitle.setAttribute('class', 'text-center')
    horizontalTitle.setAttribute('id', viewId.concat(' Horizontal Zoom'))
    text = document.createTextNode('Horizontal Zoom')
    horizontalTitle.appendChild(text)

    const rangeHorizontalInput = document.createElement('input')
    rangeHorizontalInput.setAttribute('id', 'rangeHorizontalInputId')
    rangeHorizontalInput.setAttribute('type', 'range')
    rangeHorizontalInput.setAttribute('class', 'form-range')
    rangeHorizontalInput.setAttribute('min', '0')
    rangeHorizontalInput.setAttribute('max', '100')
    rangeHorizontalInput.setAttribute('step', '10')
    rangeHorizontalInput.setAttribute('value', '50')

    rangeHorizontalInput.addEventListener('change', (event) => {
        let rate = Math.abs(event.target.value - lastHValue)
        if(lastHValue <= event.target.value)
            dendrogram.horizontalRescale(true, rate)
        else
            dendrogram.horizontalRescale(false, rate)
        lastHValue = event.target.value
    })

    nodeZoomDiv.appendChild(verticalTitle)
    nodeZoomDiv.appendChild(rangeVerticalInput)
    nodeZoomDiv.appendChild(horizontalTitle)
    nodeZoomDiv.appendChild(rangeHorizontalInput)

    document.getElementById('graphConfig').appendChild(nodeZoomDiv)
}

/**
 * Adds zoom buttons and behaviour to radial graph configuration.
 */
function addRadialZoom() {
    if (document.querySelector('.nodeZoom') != null) {
        document.querySelector('.nodeZoom').remove()
    }

    const nodeZoomDiv = document.createElement('div')
    nodeZoomDiv.setAttribute('class', 'nodeZoom justify-content-center mt-4')
    let viewId = view.type

    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    title.setAttribute('id', viewId.concat('Zoom'))
    const text = document.createTextNode('Radial Zoom')
    title.appendChild(text)

    const rangeInput = document.createElement('input')
    rangeInput.setAttribute('id', 'rangeInputId')
    rangeInput.setAttribute('type', 'range')
    rangeInput.setAttribute('class', 'form-range')
    rangeInput.setAttribute('min', '0')
    rangeInput.setAttribute('max', '100')
    rangeInput.setAttribute('step', '10')
    rangeInput.setAttribute('value', '50')

    rangeInput.addEventListener('change', (event) => {
        let rate = Math.abs(event.target.value - lastRValue)
        if(lastRValue <= event.target.value)
            radial.rescale(true, rate)
        else
            radial.rescale(false, rate)
        lastRValue = event.target.value
    })

    nodeZoomDiv.appendChild(title)
    nodeZoomDiv.appendChild(rangeInput)

    document.getElementById('graphConfig').appendChild(nodeZoomDiv)
}

/**
 * Changes the colour of a specific node to a colour of choice.
 * @param {*} func 
 * @param {*} nodes 
 */
function changeNodeColor(func, nodes) {
    if (document.querySelector('.color') != null) {
        document.querySelector('.color').remove()
    }

    // Create Container and title
    const colorDiv = document.createElement('div')
    colorDiv.setAttribute('class', 'color justify-content-center')
    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    title.setAttribute('id', 'nodeColorId')
    const text = document.createTextNode('Node color')
    title.appendChild(text)

    // Create Color Picker
    const inputColor = document.createElement('input')
    inputColor.setAttribute('class', 'colorInput')
    inputColor.setAttribute('type', 'color')
    inputColor.style.opacity = '0'
    inputColor.style.position = 'absolute'
    inputColor.style.top = '10px'
    inputColor.style.left = '10px'
    inputColor.style.width = '100px'


    const button = document.createElement('button')
    button.style.position = 'relative'
    button.style.bottom = '-10px'
    button.setAttribute('id', 'setColorId')
    button.setAttribute('class', 'selectColorButton btn btn-light')
    button.appendChild(document.createTextNode('Select the color'))

    // Create Node Selector
    const selectNode = document.createElement('select')
    selectNode.setAttribute('id', 'selectAllNodesId')
    selectNode.setAttribute('class', 'selectNode form-select')
    const firstOption = document.createElement('option')
    firstOption.setAttribute('selected', 'true')
    firstOption.setAttribute('disabled', 'disabled')
    firstOption.innerHTML = 'Select the node'
    selectNode.appendChild(firstOption)

    // Add All Nodes to Selector
    nodes.forEach(node => {
        const htmlOptionElement = document.createElement('option')
        htmlOptionElement.setAttribute('value', node)
        htmlOptionElement.innerHTML = node
        selectNode.appendChild(htmlOptionElement)
    })

    let node, color
    selectNode.addEventListener('change', (event) => node = event.target.value)

    colorDiv.appendChild(title)
    colorDiv.appendChild(selectNode)
    colorDiv.appendChild(button)
    button.appendChild(inputColor)

    document.getElementById('graphConfig').appendChild(colorDiv)

    inputColor.addEventListener('change', (event) => {
        color = event.target.value
        if (node && color) func(node, color)
        node = null
        color = null
    })
}

/**
 * Changes nodes size according to visualization function.
 * @param {*} func 
 */
function changeNodeSize(func) {
    if (document.querySelector('.nodeSize') != null) {
        document.querySelector('.nodeSize').remove()
    }

    const nodeSizeDiv = document.createElement('div')
    nodeSizeDiv.setAttribute('class', 'nodeSize justify-content-center mt-4')

    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    title.setAttribute('id', 'nodeSizeId')
    const text = document.createTextNode('Node Size')
    title.appendChild(text)

    const rangeInput = document.createElement('input')
    rangeInput.setAttribute('id', 'rangeInputId')
    rangeInput.setAttribute('type', 'range')
    rangeInput.setAttribute('class', 'form-range')
    rangeInput.setAttribute('min', '1')
    rangeInput.setAttribute('max', '15')
    rangeInput.setAttribute('value', '3')

    rangeInput.addEventListener('change', (event) => func(event.target.value))

    nodeSizeDiv.appendChild(title)
    nodeSizeDiv.appendChild(rangeInput)

    document.getElementById('graphConfig').appendChild(nodeSizeDiv)

}

/**
 * Changes links size according to visualization function.
 * @param {*} func 
 */
function changeLinkSize(func) {
    if (document.querySelector('.linkSize') != null) {
        document.querySelector('.linkSize').remove()
    }
    const linkSizeDiv = document.createElement('div')
    linkSizeDiv.setAttribute('class', 'linkSize justify-content-center mt-4')

    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    title.setAttribute('id', 'linkThicknessId')
    const text = document.createTextNode('Link Thickness')
    title.appendChild(text)

    const rangeInput = document.createElement('input')
    rangeInput.setAttribute('id', 'rangeInputLink')
    rangeInput.setAttribute('type', 'range')
    rangeInput.setAttribute('class', 'form-range')
    rangeInput.setAttribute('min', '1')
    rangeInput.setAttribute('max', '15')
    rangeInput.setAttribute('value', '2')

    rangeInput.addEventListener('change', (event) => func(event.target.value))

    linkSizeDiv.appendChild(title)
    linkSizeDiv.appendChild(rangeInput)

    document.getElementById('graphConfig').appendChild(linkSizeDiv)

}

/**
 * Changes labels size according to visualization function.
 * @param {*} func 
 */
function changeLabelsSize(func) {
    if (document.querySelector('.labelsSize') != null) {
        document.querySelector('.labelsSize').remove()
    }
    const labelsSize = document.createElement('div')
    labelsSize.setAttribute('class', 'labelsSize justify-content-center mt-4')

    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    title.setAttribute('id', 'labelsSizeId')
    const text = document.createTextNode('Labels Size')
    title.appendChild(text)

    const rangeInput = document.createElement('input')
    rangeInput.setAttribute('id', 'rangeInputLabel')
    rangeInput.setAttribute('type', 'range')
    rangeInput.setAttribute('class', 'form-range')
    rangeInput.setAttribute('min', '5')
    rangeInput.setAttribute('max', '35')
    rangeInput.setAttribute('value', '12')

    rangeInput.addEventListener('change', (event) => func(event.target.value))

    labelsSize.appendChild(title)
    labelsSize.appendChild(rangeInput)

    document.getElementById('graphConfig').appendChild(labelsSize)

}

/**
 * Changes pie colours.
 */
function changePieColor() {
    if (document.querySelector('.pieColor') != null) {
        document.querySelector('.pieColor').remove()
    }

    // Create Container and title
    const colorDiv = document.createElement('div')
    colorDiv.setAttribute('class', 'pieColor justify-content-center mt-5')
    const title = document.createElement('p')
    title.setAttribute('class', 'text-center')
    const text = document.createTextNode('Pie color')
    title.appendChild(text)

    // Create Color Picker
    const inputColor = document.createElement('input')
    inputColor.setAttribute('class', 'colorInput')
    inputColor.setAttribute('type', 'color')
    inputColor.style.opacity = '0'
    inputColor.style.position = 'absolute'
    inputColor.style.top = '10px'
    inputColor.style.left = '10px'
    inputColor.style.width = '100px'


    const button = document.createElement('button')
    button.style.position = 'relative'
    button.style.bottom = '-10px'
    button.setAttribute('class', 'selectColorButton btn btn-light')
    button.appendChild(document.createTextNode('Select the color'))

    // Create Node Selector
    const selectNode = document.createElement('select')
    selectNode.setAttribute('class', 'selectNode form-select')
    const firstOption = document.createElement('option')
    firstOption.setAttribute('selected', 'true')
    firstOption.setAttribute('disabled', 'disabled')
    firstOption.innerHTML = 'Select the category'
    selectNode.appendChild(firstOption)

    //Add All Nodes to Selector
    sections.forEach(pie => {
        const htmlOptionElement = document.createElement('option')
        htmlOptionElement.setAttribute('value', pie.name)
        htmlOptionElement.innerHTML = pie.name
        selectNode.appendChild(htmlOptionElement)
    })

    let node, color
    selectNode.addEventListener('change', (event) => node = event.target.value)

    colorDiv.appendChild(title)
    colorDiv.appendChild(selectNode)
    colorDiv.appendChild(button)
    button.appendChild(inputColor)

    document.getElementById('graphConfig').appendChild(colorDiv)

    inputColor.addEventListener('change', (event) => {
        color = event.target.value
        if (node && color) {
            categories_colors.forEach(item => {
                if (item.name === node) {
                    item.color = color
                }
            })

            const pieChartTransform = 'translate(700, 500) scale(0.7)'
            const legendTransform = 'translate(510, 400) scale(0.7)'
            changePieChartColor(sections, names_isolates, pieChartTransform, '#tree_pieChart', legendTransform)

            const pieChartIsolatesTransform = 'translate(340, 140) scale(0.7)'
            const legendTransformIsolates = 'translate(100, 50) scale(0.7)'
            changePieChartColor(sections, names_isolates, pieChartIsolatesTransform, '#svg_isolate', legendTransformIsolates)

            changePieChartColor(sections, names_isolates, pieChartIsolatesTransform, '#g_isolate', legendTransformIsolates)

            filterTables.colors = categories_colors

            if (view === dendrogram) {
                filterTables.transform = dendrogram.buildBarChart
                dendrogram.applyFilter(filterTables)
            } else {
                filterTables.transform = radial.buildBarChart
                radial.applyFilter(filterTables)
            }
            addListenersToTables()
        }
        node = null
        color = null
    })
}

/********************* Tables *********************/

let filterTables = {
    name: 'Bar chart',
    line: [],
    column: [],
}

/**
 * Creates profile data table.
 * @param {*} data 
 */
function create_table_profile(data) {
    document.getElementById('table_profile').innerHTML = ''


    //check if is possible build table
    if (!data || !data.schemeGenes || data.schemeGenes.length <= 0) {
        throw new Error('Please insert the profiles file first.')
    }

    const table = document.getElementById('table_profile')
    table.setAttribute('class', 'table table-bordered table-hover')
    table.setAttribute('height', '450')

    /** head **/
    const head = table.createTHead()
    head.setAttribute('class', 'table-dark')
    const head_row = head.insertRow()
    head_row.setAttribute('class', 'text-center')
    data.schemeGenes.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('class', 'prof')
        cell.setAttribute('id', row + '_profile')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style', 'cursor: pointer')
    })

    /** body **/
    const body = table.createTBody()
    data.nodes.forEach(node => {
        if (node.profile !== undefined) {
            const body_row = body.insertRow()
            body_row.setAttribute('class', 'text-center')
            const b_cells = node.profile.forEach(profile => {
                const cell = body_row.insertCell()
                cell.textContent = profile
                cell.setAttribute('style', 'cursor: pointer')
            })
        }
    })

    table.setAttribute('class', 'table table-bordered table-hover')
    table.setAttribute('height', '450')
    addListenersToTables()
}

/**
 * Creates isolate data table.
 * @param {*} data 
 */
function create_table_isolate(data) {
    document.getElementById('table_isolate').innerHTML = ''

    //check if is possible build table
    if (!data || !data.metadata || data.metadata.length <= 0) {
        throw new Error('Please insert the isolates file first.')
    }

    /** Table **/
    const table = document.getElementById('table_isolate')

    /** head **/
    const head = table.createTHead()
    head.setAttribute('class', 'table-dark')
    const head_row = head.insertRow()
    head_row.setAttribute('class', 'text-center')
    data.metadata.forEach(row => {
        const cell = head_row.insertCell()
        cell.textContent = row
        cell.setAttribute('class', 'iso')
        cell.setAttribute('id', row + '_isolate')
        cell.setAttribute('scope', 'col')
        cell.setAttribute('style', 'cursor: pointer')
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
                body_row.setAttribute('class', 'text-center')
                isolate.forEach(iso => {
                    const cell = body_row.insertCell()
                    cell.textContent = iso
                    cell.setAttribute('style', 'cursor: pointer')
                })
            })
        }
    })

    table.setAttribute('class', 'table table-bordered table-hover table-responsive')
    table.setAttribute('height', '450')
    addListenersToTables()

    linkToTree()
}

/**
 * Adds listeners to profile and isolate tables
 */
function addListenersToTables() {
    if (document.querySelector('.prof') !== null) {
        document.querySelectorAll('.prof').forEach(elem => {
            elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
            elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#212529')
            elem.addEventListener('click', () => clickHeaderProfiles(elem, '#svg_profile', categories.categoriesProfile))
        })
    }
    if (document.querySelector('.iso') !== null) {
        document.querySelectorAll('.iso').forEach(elem => {
            elem.addEventListener('mouseover', () => elem.style.backgroundColor = '#cfcfcf')
            elem.addEventListener('mouseout', () => elem.style.backgroundColor = '#212529')
            elem.addEventListener('click', () => clickHeaderIsolates(elem, '#svg_isolate', categories.categoriesIsolate))
        })
    }
}

let categories = {
    categoriesProfile: new Map(),
    categoriesIsolate: new Map()
}

let names_profiles = []
let names_isolates = []
let counts_ordered
let sections = []

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
 * Highlights a column in profile table and builds pieChart with that column values.
 * @param header {}
 * @param id {string}
 * @param categories {Map}
 */
function clickHeaderProfiles(header, id, categories) {
    const HeaderId = header.parentNode.getElementsByTagName('td')[header.id].cellIndex
    const headerName = header.parentNode.getElementsByTagName('td')[header.id].innerHTML
    const tdElements = header.parentNode.parentNode.parentNode.lastElementChild.getElementsByTagName('td')

    let counts = []
    let length = -1
    counts_ordered = []

    // Check and remove the map
    if (categories.has(HeaderId.toString())) {
        length = categories.get(HeaderId.toString()).length
        categories.delete(HeaderId.toString())
        //remove column color
        removeColumn(tdElements, HeaderId, categories)
        removeColumnNameProfiles(headerName)

        if (categories.size === 0) {
            length = -1
        }
    } else {
        // Put in map for the first time
        if (tdElements.length > 0) {
            categories.set(HeaderId.toString(), [])
            const array = categories.get(HeaderId.toString())
            length = addColumn(tdElements, HeaderId, array, categories)
            addColumnNameProfiles(headerName)
        }
    }

    if (length > 0) {
        for (let i = 0; i < length; i++) {
            let str = ''
            categories.forEach((value, key) => {
                if (str === '') {
                    str = str + value[i].isolate
                } else {
                    str = str + ',' + value[i].isolate
                }
            })
            if (!counts.find(i => i.name === str)) {
                counts.push({
                    name: str,
                    value: 0
                })
            }
            counts.find(i => i.name === str).value++
        }
    }

    counts_ordered = counts.slice(0)
    counts_ordered.sort(function (a, b) {
        return b.value - a.value
    })

    let total = 0
    counts_ordered.forEach(c => total += c.value)
    counts_ordered.push({total: total})

    sections = counts
    constructPieChart(counts_ordered, names_profiles, id)
}

/**
 * Highlights a column in isolate table and builds pieChart with that column values.
 * @param header {}
 * @param id {string}
 * @param categories {Map}
 */
function clickHeaderIsolates(header, id, categories) {
    const HeaderId = header.parentNode.getElementsByTagName('td')[header.id].cellIndex
    const headerName = header.parentNode.getElementsByTagName('td')[header.id].innerHTML
    const tdElements = header.parentNode.parentNode.parentNode.lastElementChild.getElementsByTagName('td')

    let counts = []
    let length = -1
    counts_ordered = []

    // Check and remove the map
    if (categories.has(HeaderId.toString())) {
        length = categories.get(HeaderId.toString()).length
        categories.delete(HeaderId.toString())
        //remove column color
        removeColumn(tdElements, HeaderId, categories)
        removeColumnNameIsolates(headerName)

        if (categories.size === 0) {
            length = -1
        }

        for (let i = 0; i < filterTables.column.length; i++) {
            if (filterTables.column[i] === HeaderId) {
                filterTables.column.splice(i, 1)
            }
        }

    } else {
        // Put in map for the first time
        if (tdElements.length > 0) {

            filterTables.column.push(HeaderId)
            if (filterTables.column.length > 1) {
                filterTables.name = '&'
            }

            categories.set(HeaderId.toString(), [])
            const array = categories.get(HeaderId.toString())
            length = addColumn(tdElements, HeaderId, array, categories)
            addColumnNameIsolates(headerName)
        }
    }

    if (length > 0) {
        for (let i = 0; i < length; i++) {
            let str = ''
            categories.forEach((value, key) => {
                if (str === '') {
                    str = str + value[i].isolate
                } else {
                    str = str + ',' + value[i].isolate
                }
            })
            if (!counts.find(i => i.name === str)) {
                counts.push({
                    name: str,
                    value: 0
                })
            }
            counts.find(i => i.name === str).value++
        }
    }

    counts_ordered = counts.slice(0)
    counts_ordered.sort(function (a, b) {
        return b.value - a.value
    })

    let total = 0
    counts_ordered.forEach(c => total += c.value)
    counts_ordered.push({total: total})

    sections = counts
    constructPieChart(counts_ordered, names_isolates, id)
    isolateHTML = d3.select('#svg_isolate').html()
}

/**
 * Auxiliar method to add a column.
 * @param {*} tdElements 
 * @param {*} HeaderId 
 * @param {*} array 
 * @param {*} categories 
 */
function addColumn(tdElements, HeaderId, array, categories) {
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
    return array.length
}

/**
 * Auxiliar method to remove a column.
 * @param {*} tdElements 
 * @param {*} HeaderId 
 * @param {*} categories 
 */
function removeColumn(tdElements, HeaderId, categories) {
    for (let i = 0; i < tdElements.length; i++) {
        if (tdElements[i].cellIndex === HeaderId || !contains(tdElements[i].cellIndex.toString(), categories)) {
            tdElements[i].style.backgroundColor = '#FFFFFF'
        } else {
            tdElements[i].style.backgroundColor = '#cfcfcf'
        }
    }
}

/**
 * Auxiliar method to add column name to highlighted profile list.
 * @param {*} name 
 */
function addColumnNameProfiles(name) {
    names_profiles.push(name)
}

/**
 * Auxiliar method to remove column name from highlighted profile list.
 * @param {*} name 
 */
function removeColumnNameProfiles(name) {
    for (let i = 0; i < names_profiles.length; i++) {
        if (names_profiles[i] === name) {
            names_profiles.splice(i, 1)
        }
    }
}

/**
 * Auxiliar method to add column name to highlighted isolate list.
 * @param {*} name 
 */
function addColumnNameIsolates(name) {
    names_isolates.push(name)
}

/**
 * Auxiliar method to remove column name from highlighted isolate list.
 * @param {*} name 
 */
function removeColumnNameIsolates(name) {
    for (let i = 0; i < names_isolates.length; i++) {
        if (names_isolates[i] === name) {
            names_isolates.splice(i, 1)
        }
    }
}

const colorsRange = [
    '#1b70fc', '#33f0ff', '#718a90', '#b21bff', '#fe6616',
    '#f9bc0f', '#b65d66', '#07a2e6', '#c091ae', '#10b437',
    '#ea42fe', '#c281fe', '#4f33ff', '#a946aa', '#16977e',
    '#a88178', '#5776a9', '#678007', '#fa9316', '#85c070',
    '#6aa2a9', '#989e5d', '#cd714a', '#c5639c', '#c23271',
    '#678275', '#c5a121', '#a978ba', '#ee534e', '#d24506',
    '#6f7385', '#9a634a', '#48aa6f', '#ad9ad0', '#6a8a53',
    '#8c46fc', '#8f5ab8', '#7133ff', '#d77cd1', '#a9804b',
    '#a67389', '#9e8cfe', '#bd443c', '#6d63ff', '#d110d5',
    '#798cc3', '#25b3a7', '#938c6d', '#a05787', '#9c87a0',
    '#20c773', '#8b696d', '#78762d', '#e154c6', '#40835f',
    '#d73656', '#1397a3', '#f940a5', '#66aeff', '#d097e7',
    '#cf7c97', '#8b900a', '#d47270', '#00ffff', '#cc00cc'
]

let categories_colors = []

/**
 * Method to change the colour of pieChart and its legend.
 * @param {*} data 
 * @param {*} names 
 * @param {*} transform 
 * @param {*} id 
 * @param {*} legendTransform 
 */
function changePieChartColor(data, names, transform, id, legendTransform) {
    if (!d3.select(id).selectAll('g').empty()) {
        d3.select(id).selectAll('g').remove()
    }

    const pieName = id.replace('#', '-')

    const g = d3.select(id).append('g').attr('transform', `${transform}`).attr('id', 'pieChart' + pieName)
    const pie = d3.pie().value(d => d.value)
    const path = d3.arc().outerRadius(130).innerRadius(30)

    if (data.length > 20) {
        const piesInvisible = g.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .classed('arc', true)
            .style('display', 'none')
            .attr('class', 'pieChartInvisible')

        piesInvisible.append('path')
            .attr('d', d => path(d))
            .attr('fill', d => getColor(d.data.name))
            .attr('id', d => d.data.name)
            .style('display', 'none')
    }

    const pies = g.selectAll('.arc')
        .data(pie(data.slice(0, 20)))
        .enter()
        .append('g')
        .classed('arc', true)

    pies.append('path')
        .attr('d', d => path(d))
        .attr('fill', d => getColor(d.data.name))
        .attr('id', d => d.data.name)

    function getColor(name) {
        for (let i = 0; i < categories_colors.length; i++) {
            if (categories_colors[i].name === name) return categories_colors[i].color
        }
    }
        
    const pieChart = d3.select(id).append('g')

    let position = 40, yOthersPosition = 40, xOthersPosition = 750
    let x_coordinate_legend = 500
    const total = counts_ordered[0].total

    data.forEach((item, i) => {
        if (i < 20) {
            pieChart.append('circle')
                .attr('cy', position)
                .attr('cx', x_coordinate_legend)
                .attr('r', 6)
                .style('fill', () => getColor(item.name))

            pieChart.append('text')
                .attr('y', position + 5)
                .attr('x', x_coordinate_legend + 10)
                .text(`${item.name} ${((item.value / total) * 100).toFixed(2)}%`)
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')

        } else if (i === 20) {
            pieChart.append('circle')
                .attr('cy', position)
                .attr('cx', x_coordinate_legend)
                .attr('r', 6)
                .style('fill', () => getColor(item.name))
                .attr('class', 'showOthers')

            if (document.querySelector('.showOthers')) {
                document.querySelector('.showOthers').addEventListener('click', () => {
                    document.querySelectorAll('.others').forEach(item => item.style.display = 'block')
                    document.querySelectorAll('.showOthers').forEach(item => item.style.display = 'none')
                })
            }

            pieChart.append('text')
                .attr('y', position + 5)
                .attr('x', x_coordinate_legend + 10)
                .text('Others')
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'showOthers')

        } else {
            pieChart.append('circle')
                .attr('cy', yOthersPosition)
                .attr('cx', xOthersPosition)
                .attr('r', 6)
                .attr('class', 'others')
                .style('fill', () => getColor(item.name))
                .style('display', 'none')

            pieChart.append('text')
                .attr('y', othersPosition + 5)
                .attr('x', xOthersPosition + 10)
                .text(`${item.name} ${((item.value / total) * 100).toFixed(2)}%`)
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'others')
                .style('display', 'none')

            if (i % 20 === 0) {
                yOthersPosition = 30
                xOthersPosition += 200
            } else yOthersPosition += 20
        }
        position += 20
    })

    //labels
    let label_x = 250, label_y = 300
    const legend = legendTransform ? pieChart.attr('id', 'legend').attr('transform', `${legendTransform}`) :
        pieChart.attr('id', 'legend')

    legend.append('text')
        .attr('y', label_y)
        .attr('x', label_x)
        .text(formatArray(names))
        .style('font-size', '15px')
        .attr('alignment-baseline', 'middle')

    legend.append('text')
        .attr('y', label_y + 30)
        .attr('x', label_x + 40)
        .text('Categories: ' + data.length)
        .style('font-size', '15px')
        .attr('alignment-baseline', 'middle')
}

let isolateHTML

/**
 * Builds the pieChart.
 * @param {*} data 
 * @param {*} names 
 * @param {*} id 
 */
function constructPieChart(data, names, id) {
    if (!d3.select(id).selectAll('g').empty()) {
        d3.select(id).selectAll('g').remove()
        d3.select(id).selectAll('.arc').remove()
    }

    categories_colors = []

    const pieName = id.replace('#', '-')
    d3.select('pieChart' + pieName).selectAll('.arc').remove()

    //remove and return if data equals empty
    if (data[0].total === 0) {
        d3.select('#linktreebuttonD').style('display', 'none')
        d3.select('#linktreebuttonR').style('display', 'none')

        if (d3.select('#pieChart' + pieName) && d3.select('#legend')) {
            d3.select('#pieChart' + pieName).remove()
            d3.select('#legend').remove()
        }
        return
    } else {
        if (id === '#svg_isolate') {
            d3.select('#linktreebuttonD').style('display', 'block')
            d3.select('#linktreebuttonR').style('display', 'block')
        }
    }

    const g = d3
        .select(id)
        .append('g')
        .attr('transform', `translate(340, 140) scale(0.7)`)
        .attr('id', 'pieChart' + pieName)

    const pie = d3.pie().value(d => d.value)

    const path = d3.arc().outerRadius(130).innerRadius(30)

    const color = d3.scaleOrdinal()
        .domain(d3.range(0, length))
        .range(colorsRange)

    const colors = []

    if (data.length > 20) {
        const piesInvisible = g.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .classed('arc', true)
            .style('display', 'none')
            .attr('class', 'pieChartInvisible')

        piesInvisible.append('path')
            .attr('d', d => path(d))
            .attr('fill', (d, i) => {
                colors.push({
                    name: d.data.name,
                    color: color(i)
                })
                return color(i)
            })
            .attr('id', d => d.data.name)
            .style('display', 'none')
    }

    const pies = g.selectAll('.arc')
        .data(pie(data.slice(0, 20)))
        .enter()
        .append('g')
        .classed('arc', true)

    pies.append('path')
        .attr('d', d => path(d))
        .attr('fill', (d, i) => {
            colors.push({
                name: d.data.name,
                color: color(i)
            })
            return color(i)
        })
        .attr('id', d => d.data.name)

    function getColor(name) {
        for (let i = 0; i < colors.length; i++) {
            if (colors[i].name === name) return colors[i].color
        }
    }

    const pieChart = d3.select(id).append('g')

    let position = 40, yOthersPosition = 40, xOthersPosition = 750
    let x_coordinate_legend = 500
    const total = data[data.length - 1].total
    data = data.splice(0, data.length - 1)

    data.forEach((item, i) => {
        if (i < 20) {
            pieChart.append('circle')
                .attr('cy', position)
                .attr('cx', x_coordinate_legend)
                .attr('r', 6)
                .style('fill', getColor(item.name))

            pieChart.append('text')
                .attr('y', position + 5)
                .attr('x', x_coordinate_legend + 10)
                .text(`${item.name} ${((item.value / total) * 100).toFixed(2)}%`)
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')

        } else if (i === 20) {
            pieChart.append('circle')
                .attr('cy', position)
                .attr('cx', x_coordinate_legend)
                .attr('r', 6)
                .style('fill', getColor(item.name))
                .attr('class', 'showOthers')

            if (document.querySelector('.showOthers')) {
                document.querySelector('.showOthers').addEventListener('click', () => {
                    document.querySelectorAll('.others').forEach(item => item.style.display = 'block')
                    document.querySelectorAll('.showOthers').forEach(item => item.style.display = 'none')
                })
            }

            pieChart.append('text')
                .attr('y', position + 5)
                .attr('x', x_coordinate_legend + 10)
                .text('Others')
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'showOthers')

        } else {
            pieChart.append('circle')
                .attr('cy', yOthersPosition)
                .attr('cx', xOthersPosition)
                .attr('r', 6)
                .attr('class', 'others')
                .style('fill', getColor(item.name))
                .style('display', 'none')

            pieChart.append('text')
                .attr('y', yOthersPosition + 5)
                .attr('x', xOthersPosition + 10)
                .text(`${item.name} ${((item.value / total) * 100).toFixed(2)}%`)
                .style('font-size', '15px')
                .attr('alignment-baseline', 'middle')
                .attr('class', 'others')
                .style('display', 'none')

            if (i % 20 === 0) {
                yOthersPosition = 30
                xOthersPosition += 200
            } else yOthersPosition += 20
        }

        if (id === '#svg_isolate') {
            categories_colors.push({
                name: item.name,
                color: colors[i].color
            })
        }

        position += 20
    })

    //labels
    let label_x = 250, label_y = 300
    const legend = pieChart.attr('id', 'legend').attr('transform', `translate(100, 50) scale(0.7)`)
    legend.append('text')
        .attr('y', label_y)
        .attr('x', label_x)
        .attr('id', 'isolateFilter')
        .text(formatArray(names))
        .style('font-size', '15px')
        .attr('alignment-baseline', 'middle')

        legend.append('text')
        .attr('y', label_y + 30)
        .attr('x', label_x + 40)
        .text('Categories: ' + data.length)
        .style('font-size', '15px')
        .attr('alignment-baseline', 'middle')
}

/**
 * Defines buttons behaviour in isolate tab when a pie chart is seen.
 */
function linkToTree() {

    document.getElementById('linktreebuttonD').addEventListener('click', () => {

        if (!dendrogram.isDraw) {
            setupDendrogramGraphConfiguration()
            view = dendrogram
            let graph = dendrogram.build(data)
            dendrogram.draw('#container', graph.tree)

            dendrogram.addNodeStyle()
            dendrogram.addLinkStyle()

            changeNodeColor(dendrogram.changeNodeColor, dendrogram.getNodes())
            changePieColor()
            changeNodeSize(dendrogram.changeNodeSize)
            changeLinkSize(dendrogram.changeLinkSize)
            changeLabelsSize(dendrogram.changeLabelsSize)
            document.getElementById('downloadSVG').style.display = 'block'
            document.getElementById('save').style.display = 'block'
        }

        // call the filter to add the bar charts
        filterTables.colors = categories_colors
        filterTables.transform = dendrogram.buildBarChart
        dendrogram.applyFilter(filterTables)

        hideButton()
        addPieChartHTML(isolateHTML)

        // go to tree tab
        document.getElementById('home-tab').click()
    })

    document.getElementById('linktreebuttonR').addEventListener('click', () => {
        if (!radial.isDraw) {
            setupRadialGraphConfiguration()
            view = radial
            let graph = radial.build(data)
            radial.draw('#container', graph.tree)

            radial.addNodeStyle()
            radial.addLinkStyle()

            changeNodeColor(radial.changeNodeColor, radial.getNodes())
            changePieColor()
            changeNodeSize(radial.changeNodeSize)
            changeLinkSize(radial.changeLinkSize)
            changeLabelsSize(radial.changeLabelsSize)
            document.getElementById('downloadSVG').style.display = 'block'
            document.getElementById('save').style.display = 'block'
        }

        // call the filter to add the bar charts
        filterTables.colors = categories_colors
        filterTables.transform = radial.buildBarChart
        radial.applyFilter(filterTables)

        hideButton()
        addPieChartHTML(isolateHTML)

        document.getElementById('home-tab').click()
    })
}

/**
 * Auxiliar method to place the pieChart on the tree tab.
 * @param {*} html 
 */
function addPieChartHTML(html){
    d3.select('#container').select('#svg-extra').select('#g_isolate').remove()

    let split = html.split('Categories: ')[1].split('<')[0]
    let height
    if(split < 16)
        height = 40 + 18 * 15
    else
        height = 40 + 23 * 15
    
    d3.select('#container').select('#container-extra')
        .select('#svg-extra')
        .append('g')
        .attr('id','g_isolate')
        .html(html)

    document.getElementById('svg-extra').setAttribute('height', height)
}

/**
 * Auxiliar method to hide buttons.
 */
function hideButton(){
    const hide = document.getElementById('btnHide')
    hide.style.display = 'block'
    hide.onclick = () => {
        if (document.getElementById('pieChart-svg_isolate').style.display === 'none') {
            document.getElementById('pieChart-svg_isolate').style.display = 'block'
            document.getElementById('legend').style.display = 'block'
        } else {
            document.getElementById('pieChart-svg_isolate').style.display = 'none'
            document.getElementById('legend').style.display = 'none'
        }
    }
}

function formatArray(names) {
    let toReturn = ''
    names.forEach(name => {
        toReturn += `${name}, `
    })
    return toReturn.slice(0, toReturn.length - 2)
}

/********************* API data functions *********************/

/**
 * Sends newick data according to loaded file.
 */
function sendNewickData() {
    document.getElementById('container').innerHTML = ''
    if (view) view.isDraw = false

    filterTables = {
        name: 'Bar chart',
        line: [],
        column: [],
    }

    const err = document.getElementById('treeError')
    if (err != null) {
        err.remove()
    }


    let nwk = document.getElementById('formFileNw').files[0]

    const ext = nwk.name.split('.')
    if (ext[1] !== 'txt') {
        alertMsg('Extension for tree file must be txt.')
        return
    }

    nwk.text().then(async newick => {
        try {
            render.set_tree_data(newick)
            data = await render.getRenderData()
            //
            document.getElementById('radButton').style.display = 'block'
            document.getElementById('denButton').style.display = 'block'
            document.getElementById('visualization').style.display = 'block'
            //
            document.getElementById('idPrfBt').style.display = 'block'
            document.getElementById('formFilePro').style.display = 'block'
        } catch (err) {
            alertMsg(err.message)
        }
    })
}

/**
 * Sends profile data according to loaded file. Columns must be tab separated. 
 */
function sendProfileData() {
    data = null
    document.getElementById('svg_profile').innerHTML = ''
    names_profiles = []
    const err = document.getElementById('errorProfile')
    if (err != null) {
        err.remove()
    }

    //
    is_table_profile_create = false
    //

    let profile = document.getElementById('formFilePro').files[0]

    profile.text().then(async prof => {
        try {
            render.set_profiles_data(prof)
            data = await render.getRenderData()
            document.getElementById('formFileIso').style.display = 'block'
            document.getElementById('idIsoBt').style.display = 'block'
        } catch (err) {
            alertMsg(err.message)
        }
    })
}

/**
 * Sends isolate data according to loaded file. Columns must be tab separated.
 */
function sendIsolateData() {
    data = null
    document.getElementById('svg_isolate').innerHTML = ''
    names_isolates = []
    const err = document.getElementById('errorIsolate')
    if (err != null) {
        err.remove()
    }

    //
    is_table_isolate_create = false
    //

    let isolate = document.getElementById('formFileIso').files[0]

    isolate.text().then(async iso => {
        try {
            render.set_isolates_data(iso)
            data = await render.getRenderData()
        } catch (err) {
            alertMsg(err.message)
        }
    })
}

/**
 * Sends newick data according to inserted text data.
 */
async function sendNwkData() {
    let nwk = document.getElementById('nwk').value
    try {
        render.set_tree_data(nwk)
        data = await render.getRenderData()
        document.getElementById('radButton').style.display = 'block'
        document.getElementById('denButton').style.display = 'block'
        document.getElementById('visualization').style.display = 'block'
    } catch (err) {
        alertMsg(err.message)
    }
}

/**
 * Resets views and all data.
 * @param {*} func 
 */
function resetViewsOnDataRequest(func) {
    func()
    clearVisualizations()
    reset_data()
}

/********************* Aux function *********************/

/**
 * Shows an alert message.
 * @param {*} message 
 * @param {*} kind 
 */
function alertMsg(message, kind) {
    if (!kind) kind = 'danger'
    document
        .querySelector('.messages')
        .innerHTML = `<div class='alert alert-${kind} alert-dismissible fade show' role='alert' id='divErr'>
                <button type='button' class='btn' data-dismiss='alert' aria-label='Close' id='buttonErr'>
                    <i class='bi bi-x-lg'></i>
                </button>
                ${message}
            </div>`
    document.getElementById('buttonErr').addEventListener('click', () => {
        document.getElementById('divErr').remove()
    })
}

/**
 * Clears the container.
 */
function clearVisualizations() {
    document.getElementById('container').innerHTML = ''
    dendrogram = dendrogramView()
    radial = radialView()
}