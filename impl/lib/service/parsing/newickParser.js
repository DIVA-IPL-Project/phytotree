'use strict'

function parseNewick(newickData) {
    return parse(newickData)
}

const parse = s => {
    const ancestors = []
    let tree = {
        //------
        children_Size: 0,
        tree_size:0
        //------
    }
    const tokens = s.split(/\s*([;(),:])\s*/)
    let subtree
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        switch (token) {
            case '(': // new children
                subtree = {
                    //------
                    children_Size: 0,
                    tree_size:0
                    //------
                }
                tree.children = [subtree]
                //------
                tree.children_Size++
                tree.tree_size++
                //------
                ancestors.push(tree)
                tree = subtree
                break
            case ',': // another branch
                subtree = {
                    //------
                    children_Size: 0,
                    tree_size:0
                    //------
                }
                ancestors[ancestors.length - 1].children.push(subtree)
                //------
                ancestors[ancestors.length - 1].children_Size++
                ancestors[ancestors.length - 1].tree_size++
                //------
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
                    //------
                    if(tree.children != null){
                        tree.children.forEach(children => {
                            tree.tree_size += children.tree_size
                        })
                    }

                    //------
                } else if (x === ':') {
                    tree.length = parseFloat(token)
                }
        }
    }

    return tree
}

//console.log(parse('(((F:0.2, G:0.3)D:0.3,(H:0.5, (J:0.2,K:0.3)I:0.3)E:0.2)B:0.3, C:0.7)A:1.0;'))

module.exports = parseNewick