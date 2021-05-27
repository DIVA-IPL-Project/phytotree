'use strict'

function parseNewick(newickData) {
    return parse(newickData)
}

const parse = s => {
    const links = []
    const ancestors = []
    let tree = {
    }
    const tokens = s.split(/\s*([;(),:])\s*/)
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
            case ':': // optional length next
                break
            default:
                const x = tokens[i - 1]

                if (x === ')' || x === '(' || x === ',') {
                    tree.name = token
                    if(tree.children){
                        for (let j = 0; j < tree.children.length; j++) {
                            links.push({
                                source: token,
                                target: tree.children[j].name,
                                value: tree.children[j].length
                            })
                        }
                    }
                } else if (x === ':') {
                    tree.length = parseFloat(token)
                }
        }
    }
    links.push({
        source: null,
        target: tree.name,
        value: tree.length
    })
    return links
}

module.exports = parseNewick