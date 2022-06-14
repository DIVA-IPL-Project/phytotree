/** Download File **/
function downloadReport(filename, title) {
    // Create the pdf document
    const doc = new jsPDF('p', 'pt', 'a4')
    doc.setProperties({title: 'Report'})
    doc.setFontSize(24)
    doc.text(title, 290, 40, {align: 'center'})
    doc.setFontSize(10)
    doc.text('Total number of profiles: ' + view.getNodes().length.toString(), 100, 500)
    doc.text('Number of isolates: ' + sections.length.toString(), 100, 530)

    const svg = document.getHTML(view.context.svg.element.node(), true)
    const parser = new DOMParser()
    const elem = parser.parseFromString(svg, 'text/html').body
    const graph = elem.children[0]

    const clone = graph.cloneNode(true)
    if (clone.childNodes[3]) {
        clone.removeChild(clone.childNodes[3])
    }

    // Add the tree to the report
    svgAsPngUri(clone, null).then(uri => {
        const imgPropsW = document.getElementById('graph').getAttribute('width')
        const imgPropsH = document.getElementById('graph').getAttribute('height')

        const pdfWidth = doc.internal.pageSize.width
        const pdfHeight = doc.internal.pageSize.height

        const x = imgPropsW + 50
        const y = imgPropsH + 70

        doc.addImage(uri, 'PNG', 10, y, pdfWidth-10, pdfHeight - 450)
    })

    // Add pie chart and legend to the report
    svgAsPngUri(document.getElementById('svg-extra'), null).then(uri => {
        var element = document.getElementById('svg-extra')
        var ratio = 1.8
        var width = element.getBoundingClientRect().width / ratio
        var height = element.getBoundingClientRect().height / ratio

        doc.addImage(uri, 'PNG', 100, 600, width, height)
        doc.save(filename)
    })
    document.getElementById('downloadSVG').style.display = 'block'
    document.getElementById('reportName').style.display = 'none'
    document.getElementById('labelReport').style.display = 'none'
    document.getElementById('reportName').value = ''
}

function downloadFile(filename, text) {
    var pom = document.createElement('a')
    pom.setAttribute('href', 'data:text/plaincharset=utf-8,' + encodeURIComponent(text))
    pom.setAttribute('download', filename)

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents')
        event.initEvent('click', true, true)
        pom.dispatchEvent(event)
    }
    else {
        pom.click()
    }
}

document.getHTML = function (who, deep) {
    if (!who || !who.tagName) return ''
    var txt, ax, el = document.createElement('div')
    el.appendChild(who.cloneNode(false))
    txt = el.innerHTML
    if (deep) {
        ax = txt.indexOf('>') + 1
        txt = txt.substring(0, ax) + who.innerHTML + txt.substring(ax)
    }
    el = null
    return txt
}