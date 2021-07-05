'use strict'

function parseNewick(newickData) {
    //parse nexus to JSON
    if (newickData[0] !== '(') {
        return parse(newickData.substring(newickData.indexOf('('), newickData.length + 1))
    }
    //parse newick to JSON
    return parse(newickData)
}

const parse = s => {
    const links = []
    const nodes = []
    const ancestors = []
    let tree = {
    }
    const tokens = s.split(/\s*([;(),])\s*/)
    let subtree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        switch (token) {
            case '(': // new children
                subtree = {}
                tree.children = [subtree]

                ancestors.push(tree)
                tree = subtree
                break
            case ',': // another branch
                subtree = {}
                ancestors[ancestors.length - 1].children.push(subtree)
                tree = subtree
                break
            case ')': // optional name next
                tree = ancestors.pop()
                break
            case '':
                break
            case ';':
                links.push({
                    source: null,
                    target: tree.name,
                    value: tree.length
                })
                nodes.push({
                    name: tree.name
                })
                idx = 0
                map = new Map()
                return { links, nodes }
            default:
                let node = token.split(':')
                const name = validName(node[0])
                tree.name = name
                tree.length = parseFloat(node[1] ? node[1].split('[')[0] : 0)
                if(tree.children){
                    for (let j = 0; j < tree.children.length; j++) {
                        links.push({
                            source: name,
                            target: tree.children[j].name,
                            value: tree.children[j].length
                        })
                        nodes.push({
                            name: tree.children[j].name
                        })
                    }
                }
        }
    }
    idx = 0
    map = new Map()
    return { links, nodes } // todo throw err invalid format
}

let idx = 0
let map = new Map()
function validName(name) {
    if (name === '' || name === ' ' || name === '_' || name === undefined || name === null) {
        return `unnamed_node_${idx++}`
    } else {
        if (map.has(name)) {
            map.set(name, map.get(name)+1)
            return `${name}_${map.get(name)}`
        } else {
            map.set(name, 1)
            return name
        }
    }
}

module.exports = parseNewick