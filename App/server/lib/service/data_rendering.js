'use strict'

const nwkParser = require('./parsing/newickParser')

/* Tree Part */
let tree_data
let tree_data_change = false

function set_tree_data(data) {
    set_isolates_variables()
    set_profiles_variables()
    set_tree_variables()
    tree_data_change = true

    if (data !== undefined) {
        tree_data = data
        return {
            get_tree_data
        }
    }
    throw new Error('Tree data can´t be undefined')
}

function get_tree_data() {
    if (tree_data !== undefined) {
        return Promise.resolve(tree_data)
    }
    throw new Error('Tree data must be set first')
}

function set_tree_variables() {
    tree_data = undefined
}

/* Profiles Part */
let profiles_data
let profiles_id
let profile_data_change = false

function set_profiles_data(data) {
    set_profiles_variables()
    set_isolates_variables()
    profile_data_change = true
    if (data !== undefined) {
        const aux_data = split_tabular_data(data)
        profiles_id = aux_data[0]
        profiles_data = aux_data.slice(1, aux_data.length)

        return {
            get_profiles_ids,
            get_profiles_data,
            get_next_profile,
            get_n_profiles,
            get_determined_profile
        }
    }
    throw new Error('Profiles data can´t be undefined')
}

function get_profiles_ids() {
    if (profiles_id !== undefined) {
        return Promise.resolve(profiles_id)
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

function get_profiles_data() {
    if (profiles_data !== undefined) {
        return Promise.resolve(profiles_data)
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

let idx_line_profile = 0

function get_next_profile() {
    if (profiles_data !== undefined) {
        if (idx_line_profile >= profiles_data.length) return undefined
        let toReturn = profiles_data[idx_line_profile]
        idx_line_profile++
        return Promise.resolve(toReturn)
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

function get_n_profiles(number_of_profiles) {
    if (isolates_data !== undefined) {
        if (number_of_profiles >= profiles_data.length) return profiles_data
        return Promise.resolve(profiles_data.slice(0, number_of_profiles - 1))
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

let first_column_name

function get_first_column_name() {
    if (first_column_name !== undefined) return first_column_name
    if (profiles_id !== undefined) {
        first_column_name = profiles_id[0]
        return Promise.resolve(first_column_name)
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

function get_determined_profile(id) {
    if (profiles_data !== undefined) {
        let curr

        for (let i = 0; i < profiles_data.length; i++) {
            curr = profiles_data[i]
            if (curr[0] === id) return Promise.resolve(curr)
        }
        return Promise.reject(new Error(`Profile with id ${id} not exist`))
    }
    return Promise.reject(new Error('Profiles data must be set first'))
}

function set_profiles_variables() {
    profiles_data = undefined
    profiles_id = undefined
    first_column_name = undefined
    idx_line_profile = 0
    profile_data_change = false
}

/* Isolates Part */
let isolates_data
let isolates_id
let isolate_data_change = false

function set_isolates_data(data) {
    set_isolates_variables()
    isolate_data_change = true
    if (data !== undefined) {
        const aux_data = split_tabular_data(data)
        isolates_data = aux_data.slice(1, aux_data.length)
        isolates_id = aux_data[0]
        return {
            get_isolates_ids,
            get_isolates_data,
            get_next_isolate,
            get_n_isolates,
            get_determined_isolate,
        }
    }
    return Promise.reject(new Error('Isolate data can´t be undefined'))
}

function get_isolates_ids() {
    if (isolates_id !== undefined) {
        return Promise.resolve(isolates_id)
    }
    return Promise.reject(new Error('Isolates data must be set first'))
}

function get_isolates_data() {
    if (isolates_data !== undefined) {
        return Promise.resolve(isolates_data)
    }
    return Promise.reject(new Error('Isolates data must be set first'))
}

let idx_line_isolate = 0

function get_next_isolate() {
    if (isolates_data !== undefined) {
        if (idx_line_isolate >= isolates_data.length) return undefined
        let toReturn = isolates_data[idx_line_isolate]
        idx_line_isolate++
        return Promise.resolve(toReturn)
    }
    return Promise.reject(new Error('Isolates data must be set first'))
}

function get_n_isolates(number_of_isolates) {
    if (isolates_data !== undefined) {
        if (number_of_isolates >= isolates_data.length) return isolates_data
        return Promise.resolve(isolates_data.slice(0, number_of_isolates - 1))
    }
    return Promise.reject(new Error('Isolates data must be set first'))
}

function get_determined_isolate(id) {
    if (first_column_name === undefined) get_first_column_name()
    if (isolates_data !== undefined) {
        const idx = isolates_id.indexOf(first_column_name)
        let curr
        const toReturn = []
        for (let i = 0; i < isolates_data.length; i++) {
            curr = isolates_data[i]
            if (curr[idx] === id) {
                toReturn.push(curr)
            }
        }
        return Promise.resolve(toReturn)
        //return Promise.reject(new Error(`Isolate with id ${id} not exist`))
    }
    return Promise.reject(new Error('Isolates data must be set first'))
}

function set_isolates_variables() {
    isolates_data = undefined
    isolates_id = undefined
    idx_line_isolate = 0
    isolate_data_change = false
}


/* Json Part */
let data = {
    schemeGenes: [],
    nodes: [],
    links: [],
    metadata: []
}

async function getRenderData() {

    if (tree_data_change) {
        if (tree_data === undefined) return Promise.reject(new Error('Tree data must be set first'))
        const data_parsing = nwkParser(tree_data)

        data.links = data_parsing.links
        data.nodes = data_parsing.nodes.map(obj => {
            return {key: obj.name}
        })
    }
    if (profile_data_change) {
        if (profiles_data !== undefined && profiles_id !== undefined) {
            data.schemeGenes = profiles_id
            for (const node of data.nodes) {
                const aux = node.key.split('_')
                if (aux[0] !== 'unnamed' && aux[1] !== 'node') {
                    const data = await get_determined_profile(node.key)
                    node.profile = data
                }
            }
        }
    }
    if (isolate_data_change) {
        if (isolates_data !== undefined && isolates_id !== undefined) {
            data.metadata = isolates_id
            for (const node of data.nodes) {
                const aux = node.key.split('_')
                if (aux[0] !== 'unnamed' && aux[1] !== 'node') {
                    const data = await get_determined_isolate(node.key)
                    if (data !== []) {
                        node.isolates = data
                    }
                }
            }
        }
    }
    return Promise.resolve(data)
}

/* Aux function */

function split_tabular_data(data) {
    return data.split('\r\n').map(str => {
        return str.split('\t')
    })
}

module.exports = {
    set_tree_data,
    set_profiles_data,
    set_isolates_data,
    getRenderData
}