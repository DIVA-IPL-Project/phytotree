'use strict'

const render = function () {
    /* Tree Part */
    let tree_data
    let tree_data_change = false

    /**
     * Set Tree data.
     * @param data {String} Tree data.
     * @returns {Object} All functions for tree data.
     */
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

    /**
     * get Tree data.
     * @returns {Promise} tree data.
     */
    function get_tree_data() {
        if (tree_data !== undefined) {
            return Promise.resolve(tree_data)
        }
        throw new Error('Tree data must be set first')
    }

    /**
     * Setup tree variables.
     */
    function set_tree_variables() {
        tree_data = undefined
    }

    /* Profiles Part */
    let profiles_data
    let profiles_id
    let profile_data_change = false

    /**
     * Set Profiles data.
     * @param data {String} Profile data.
     * @returns {Object} Return all functions for profiles data.
     */
    function set_profiles_data(data) {
        set_profiles_variables()
        set_isolates_variables()
        profile_data_change = true
        if (data !== undefined) {
            const aux_data = split_tabular_data(data)
            profiles_id = aux_data[0]
            profiles_data = aux_data.slice(1, aux_data.length)

            console.log(profiles_id)
            console.log(profiles_data)
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

    /**
     * Get the profiles identifiers.
     * @returns {Promise}
     */
    function get_profiles_ids() {
        if (profiles_id !== undefined) {
            return Promise.resolve(profiles_id)
        }
        return Promise.reject(new Error('Profiles data must be set first'))
    }

    /**
     * Get profile data.
     * @returns {Promise<Buffer | Error>}
     */
    function get_profiles_data() {
        if (profiles_data !== undefined) {
            return Promise.resolve(profiles_data)
        }
        return Promise.reject(new Error('Profiles data must be set first'))
    }

    let idx_line_profile = 0

    /**
     * Get next profile.
     * @returns {String[] | null} Return data or null if idx is bigger then profiles length.
     */
    function get_next_profile() {
        if (profiles_data !== undefined) {
            if (idx_line_profile >= profiles_data.length) return undefined
            let toReturn = profiles_data[idx_line_profile]
            idx_line_profile++
            return Promise.resolve(toReturn)
        }
        return Promise.reject(new Error('Profiles data must be set first'))
    }

    /**
     * Get a number of profiles.
     * @param number_of_profiles {Number} Number of profiles to return.
     * @returns {Promise}
     */
    function get_n_profiles(number_of_profiles) {
        if (isolates_data !== undefined) {
            if (number_of_profiles >= profiles_data.length) return profiles_data
            return Promise.resolve(profiles_data.slice(0, number_of_profiles - 1))
        }
        return Promise.reject(new Error('Profiles data must be set first'))
    }

    let first_column_name

    /**
     * Get first column name.
     * @returns {String}
     */
    function get_first_column_name() {
        if (first_column_name !== undefined) return first_column_name
        if (profiles_id !== undefined) {
            first_column_name = profiles_id[0]
            return Promise.resolve(first_column_name)
        }
        return Promise.reject(new Error('Profiles data must be set first'))
    }

    /**
     * Get a determinate profile.
     * @param id {String} Profile identifier.
     * @returns {Promise}
     */
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

    /**
     * Setup profiles variables.
     */
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

    /**
     * Set isolate data.
     * @param data {String} isolate data.
     * @returns {Object} Return all functions for isolate data.
     */
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

    /**
     * Get the isolates identifiers.
     * @returns {Promise}
     */
    function get_isolates_ids() {
        if (isolates_id !== undefined) {
            return Promise.resolve(isolates_id)
        }
        return Promise.reject(new Error('Isolates data must be set first'))
    }

    /**
     * Get all isolates.
     * @returns {Promise}
     */
    function get_isolates_data() {
        if (isolates_data !== undefined) {
            return Promise.resolve(isolates_data)
        }
        return Promise.reject(new Error('Isolates data must be set first'))
    }

    let idx_line_isolate = 0

    /**
     * Get next isolate.
     * @returns {Promise<String[] | null>} return null if idx is bigger than isolates length, else return the isolate.
     */
    function get_next_isolate() {
        if (isolates_data !== undefined) {
            if (idx_line_isolate >= isolates_data.length) return undefined
            let toReturn = isolates_data[idx_line_isolate]
            idx_line_isolate++
            return Promise.resolve(toReturn)
        }
        return Promise.reject(new Error('Isolates data must be set first'))
    }

    /**
     * Get next isolate.
     * @param number_of_isolates {String} Number of isolate to return.
     * @returns {Promise<String[][]>}
     */
    function get_n_isolates(number_of_isolates) {
        if (isolates_data !== undefined) {
            if (number_of_isolates >= isolates_data.length) return isolates_data
            return Promise.resolve(isolates_data.slice(0, number_of_isolates - 1))
        }
        return Promise.reject(new Error('Isolates data must be set first'))
    }

    /**
     * Get a determinate isolate.
     * This function only cloud be call if already exist profiles file.
     * @param id {Number} Isolate identifier.
     * @returns {Promise<String[]>}
     */
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

    /**
     * Setup isolates variables.
     */
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

    /**
     * Returns a object with the data.
     * @returns {Promise<{metadata: *[], nodes: *[], schemeGenes: *[], links: *[]}>}
     */
    async function getRenderData() {
        data = {
            schemeGenes: [],
            nodes: [],
            links: [],
            metadata: []
        }

        if (tree_data_change) {
            if (tree_data === undefined) return Promise.reject(new Error('Tree data must be set first'))
            const data_parsing = parser.parseNewick(tree_data)

            data.links = data_parsing.links
            data.nodes = data_parsing.nodes
        }

        console.log(profiles_data)
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

    return {
        set_tree_data,
        set_profiles_data,
        set_isolates_data,
        getRenderData
    }
}()