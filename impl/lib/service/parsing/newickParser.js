'use strict'

function parseNewick(newickData) {
    return parse(newickData)
}

const parse = s => {
    const links = []
    const ancestors = []
    let tree = {
    }
    const tokens = s.split(/\s*([;(),])\s*/)
    console.log(tokens)
    let subtree
    //(a:1,b:2)c:3;
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
                idx = 0
                map = new Map()
                return links
            default:
                // const x = tokens[i - 1]
                // if (x === ')' || x === '(' || x === ',') {
                //     console.log({token, x})
                //     tree.name = token // todo empty_node_idx
                //     if(tree.children){
                //         for (let j = 0; j < tree.children.length; j++) {
                //             links.push({
                //                 source: token,
                //                 target: tree.children[j].name,
                //                 value: tree.children[j].length
                //             })
                //         }
                //     }
                // } else if (x === ':') {
                //     tree.length = parseFloat(token)
                // }
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
                    }
                }
        }
    }
    idx = 0
    map = new Map()
    return links // todo throw err invalid format
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