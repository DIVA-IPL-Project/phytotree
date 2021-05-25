'use strict'

const API = {
    getTreeSync,
    getTreeAsync,
    getProfilesSync,
    getNextProfileSync,
    getNProfilesSync,
    getFirstColumnNameSync,
    getXProfileSync,
    getProfilesAsync,
    getNextProfileAsync,
    getNProfilesAsync,
    getFirstColumnNameAsync,
    getXProfileAsync,
    getIsolateSync,
    getNextIsolateSync,
    getNIsolatesSync,
    getXIsolateSync,
    getIsolateAsync,
    getNextIsolateAsync,
    getNIsolatesAsync,
    getXIsolateAsync
}

const treeFunctions = {
    getTreeSync,
    getTreeAsync
}

const profileFunctions = {
    getProfilesSync,
    getNextProfileSync,
    getNProfilesSync,
    getFirstColumnNameSync,
    getXProfileSync,
    getProfilesAsync,
    getNextProfileAsync,
    getNProfilesAsync,
    getFirstColumnNameAsync,
    getXProfileAsync
}

const isolateFunctions = {
    getIsolateSync,
    getNextIsolateSync,
    getNIsolatesSync,
    getIsolateAsync,
    getNextIsolateAsync,
    getNIsolatesAsync,
}

const isolateFunctions2 = {
    getIsolateSync,
    getNextIsolateSync,
    getNIsolatesSync,
    getXIsolateSync,
    getIsolateAsync,
    getNextIsolateAsync,
    getNIsolatesAsync,
    getXIsolateAsync,
}

const fs = require('fs')

const extensionTreeFiles = ["nwk", "nex", "nxs"]
const extensionProfileAndIsolateFiles = ["tab"]


/**
 * Init Part.
 */

/**
 * Set tree, profiles, isolates files to be read.
 * @param tFile {String} Tree file.
 * @param pFile {String} Profiles file.
 * @param iFile {String} Isolates file.
 * @returns {Object} Return all functions that can be use.
 */
function setAllFilesPath(tFile, pFile, iFile){
    checkFiles(tFile, pFile, iFile)
    return API
}

/**
 * Check if files can be use.
 * @param tFile {String} Tree file.
 * @param pFile {String} Profiles file.
 * @param iFile {String} Isolates file.
 */
function checkFiles(tFile, pFile, iFile){
    setNewTreeFilePath(tFile)
    if(pFile){
        setNewProfilesFilePath(pFile)
    }
    if(iFile) {
        setNewIsolatesFilePath(iFile)
    }
}

/**
 *  Tree Part.
 */

let treeFile

/**
 * Set or change Tree file.
 * @param tFile {String} Tree file.
 * @returns {Object} All functions for tree file.
 */
function setNewTreeFilePath(tFile) {
    if (!tFile) throw new Error('You have to put tree file.')
    const divided = tFile.split('\\');
    let extension = divided[divided.length-1].split('.', 2)
    if (!extensionTreeFiles.includes(extension[1])) {
        throw new Error(`${tFile} extension is not supported.`)
    }
    setUpTreeVariables()
    treeFile = tFile
    return treeFunctions
}

let tree_a
let tree_s

function setNewTreeFileData(data){
    setUpTreeVariables()
    tree_a = tree_s = data
    return treeFunctions
}

/**
 * Setup tree variables.
 */
function setUpTreeVariables() {
    tree_a = null
    tree_s = null
}

/**
 * Read synchronously the tree file.
 * @returns {string} The data in the file
 * @throws {Error} If file can´t be reader
 */
function getTreeSync() {
    if (tree_s) {
        return tree_s
    }
    let data
    try {
        data = fs.readFileSync(treeFile, {encoding: 'utf8', flag: 'r'});
    } catch (exception){
        throw new Error(`Error on read file ${treeFile}`)
    }
    tree_s = data.toString()
    return tree_s
}

/**
 * Read asynchronously the tree file.
 * @returns {Promise<string | Error>} Promise with data or error.
 */
function getTreeAsync() {
    if (tree_a) {
        return Promise.resolve(tree_a)
    }
    return fs.promises.readFile(treeFile)
        .then(data => tree_a = data.toString())
        .catch(err => Error(err))
}

/**
 *  Profile Data Part.
 */

let profilesFile

/**
 * Set or change Profiles file.
 * @param pFile {String} Profile file.
 * @returns {Object} Return all functions for profiles file
 */
function setNewProfilesFilePath(pFile){
    const divided = pFile.split('\\');
    let extension = divided[divided.length-1].split('.', 2)
    if(!extensionProfileAndIsolateFiles.includes(extension[1])){
        throw new Error(`${pFile} extension is not supported.`)
    }
    stepUpProfileVariables()
    profilesFile = pFile
    return profileFunctions
}

/**
 * Setup profiles variables.
 */
function stepUpProfileVariables(){
    profiles_s = null
    profilesIdentifier_s = null
    firstColumnName_s = null
    idxProfile_s = 0
    profiles_a = null
    profilesIdentifier_a = null
    firstColumnName_a = null
    idxProfile_a = 0
}

//Sync
let profiles_s
let profilesIdentifier_s
let firstColumnName_s
let idxProfile_s = 0

/**
 * Read synchronously data from profiles file.
 * @throws {Error} If file can´t be reader
 */
function getProfileDataSync() {
    let data
    try{
        data = fs.readFileSync(profilesFile, {encoding:'utf8', flag:'r'})
    } catch (exception){
        throw new Error(`Error on read file ${profilesFile}`)
    }
    const file = renderFiles(data.toString())
    profilesIdentifier_s = file[0]
    profiles_s = file.slice(1, file.length)
    firstColumnName_s = profilesIdentifier_s[0]
}

/**
 * Get synchronously all profiles.
 * @returns {String[][]}
 */
function getProfilesSync() {
    if(!profiles_s){
        getProfileDataSync()
    }
    return profiles_s
}

/**
 * Get synchronously next profile.
 * @returns {String[] | null} Return data or null if idx is bigger then profiles length.
 */
function getNextProfileSync(){
    if(!profiles_s){
        getProfileDataSync()
    }
    if(idxProfile_s >= profiles_s.length) return null
    let toReturn = profiles_s[idxProfile_s]
    idxProfile_s++
    return toReturn
}

/**
 * Get synchronously a number of profiles.
 * @param size {Number} Number of profiles to be returned.
 * @returns {String[][]}
 */
function getNProfilesSync(size) {
    if (!profiles_s) {
        getProfileDataSync()
    }
    if(size > profiles_s.length) return profiles_s
    return profiles_s.slice(0, size-1)
}

/**
 * Get synchronously first column name.
 * @returns {String}
 */
function getFirstColumnNameSync() {
    if(!firstColumnName_s) return firstColumnName_s
    if(!profiles_s){
        getProfileDataSync()
    }
    firstColumnName_s = profilesIdentifier_s[0]
    return firstColumnName_s
}

/**
 * Get synchronously a determinate profile.
 * @param id Profile id.
 * @returns {String[] | null} return profile or null if profile not exist.
 */
function getXProfileSync(id) {
    if (!profiles_s) {
        getProfileDataSync()
    }
    let curr
    for (let i = 0; i < profiles_s.length; i++) {
        curr = profiles_s[i]
        if(curr[0] === id) return curr
    }
    return null
}

//Async
let profiles_a
let profilesIdentifier_a
let firstColumnName_a
let idxProfile_a = 0


/**
 * Read asynchronously data from profiles file.
 * @returns {Promise<Buffer | Error>}
 */
function getProfileDataAsync() {
    return fs.promises
        .readFile(profilesFile)
        .then(data => {
            const file = renderFiles(data.toString())
            profilesIdentifier_a = file[0]
            profiles_a = file.slice(1, file.length)
            firstColumnName_a = profilesIdentifier_a[0]
        })
        .catch(err => Error(err))
}

/**
 * Get asynchronously all profiles.
 * @returns {Promise<String[][]>}
 */
async function getProfilesAsync() {
    if(!profiles_a){
        await getProfileDataAsync()
    }
    return profiles_a
}


/**
 * Get asynchronously next profile.
 * @returns {Promise<String[]>}
 */
async function getNextProfileAsync(){
    if(profiles_a == null){
        await getProfileDataAsync()
    }
    if(idxProfile_a >= profiles_a.length) return
    let toReturn = profiles_a[idxProfile_a]
    idxProfile_a++
    return toReturn
}

/**
 * Get asynchronously a number of profiles.
 * @param size {Number} Number of profiles to return.
 * @returns {Promise<String[][]>}
 */
async function getNProfilesAsync(size) {
    if (profiles_a == null) {
        await getProfileDataAsync()
    }
    return profiles_a.slice(0, size-1)
}

/**
 * Get asynchronously first column name.
 * @returns {Promise<String>}
 */
async function getFirstColumnNameAsync() {
    if(firstColumnName_a != null) return firstColumnName_a
    if(profiles_a == null){
        await getProfileDataAsync()
    }
    firstColumnName_a = profilesIdentifier_a[0]
    return firstColumnName_a
}

/**
 * Get asynchronously a determinate profile.
 * @param id {String} Profile identifier.
 * @returns {Promise<null|String[]>}
 */
async function getXProfileAsync(id) {
    if (!profiles_a) {
        await getProfileDataAsync()
    }
    let curr
    for (let i = 0; i < profiles_a.length; i++) {
        curr = profiles_a[i]
        if (curr[0] === id) return curr
    }
    return null
}

function setNewProfilesFileData(data){
    stepUpProfileVariables()
    profiles_a = profiles_s = data
    return profileFunctions
}

/**
 *  Isolate Data Part.
 */

let isolatesFile

/**
 * Set or change Profiles file.
 * @param iFile
 * @returns {Object} All functions for isolates.
 */
function setNewIsolatesFilePath(iFile) {
    const divided = iFile.split('\\');
    let extension = divided[divided.length-1].split('.', 2)
    if(!extensionProfileAndIsolateFiles.includes(extension[1])){
        throw new Error(`${iFile} extension is not supported.`)
    }
    setUpIsolateVariables()
    isolatesFile = iFile
    return (profilesFile != null)? isolateFunctions : isolateFunctions2
}

/**
 * Setup isolate variables.
 */
function setUpIsolateVariables(){
    isolates_s = null
    isolatesIdentifier_s = null
    idxIsolate_s = 0
    idxColumnIsolate_s = null
    isolates_a = null
    isolatesIdentifier_a = null
    idxIsolate_a = 0
    idxColumnIsolate_a = null

}

//Sync

let isolates_s
let isolatesIdentifier_s
let idxIsolate_s = 0
let idxColumnIsolate_s

/**
 * Read synchronously data from isolates file.
 * @throws {Error} If file can´t be reader
 */
function getIsolateDataSync() {
    let data
    try{
        data = fs.readFileSync(isolatesFile, {encoding:'utf8', flag:'r'})
    } catch (exception){
        throw new Error(`Error on read file ${isolatesFile}`)
    }

    let file = renderFiles(data.toString())
    isolatesIdentifier_s = file[0]
    isolates_s = file.slice(1, file.length)
}

/**
 * Get synchronously all isolates.
 * @returns {String[][]}
 */
function getIsolateSync() {
    if (!isolates_s) {
        getIsolateDataSync()
    }
    return isolates_s
}

/**
 * Get synchronously next isolate.
 * @returns {String[] | null} return null if idx is bigger than isolates length, else return the isolate.
 */
function getNextIsolateSync() {
    if (!isolates_s) {
        getIsolateDataSync()
    }
    if(idxColumnIsolate_s >= isolates_s.length) return null
    let toReturn = isolates_s[idxIsolate_s]
    idxIsolate_s++
    return toReturn
}

/**
 * Get synchronously a number of isolates.
 * @param size {Number}
 * @returns {String[][]}
 */
function getNIsolatesSync(size) {
    if (isolates_s == null) {
        getIsolateDataSync()
    }
    if(size >= isolates_s.length) return isolates_s
    return isolates_s.slice(0, size - 1 )
}

/**
 * Get synchronously a determinate isolate.
 * This function only cloud be call if already exist profiles file.
 * @param id {Number} Isolate identifier.
 * @returns {String[][]}
 */
function getXIsolateSync(id) {
    if (!profiles_s) { getProfileDataSync() }
    if (!isolates_s) { getIsolateDataSync() }
    if(!idxColumnIsolate_s){
        idxColumnIsolate_s = isolatesIdentifier_s.indexOf(firstColumnName_s)
    }
    let toReturn = []
    let curr
    for (let i = 0; i < isolates_s.length; i++) {
        curr = isolates_s[i]
        if(curr[idxColumnIsolate_s] === id){
            toReturn.push(curr)
        }
    }
    return toReturn
}

//Async

let isolates_a
let isolatesIdentifier_a
let idxIsolate_a = 0
let idxColumnIsolate_a

/**
 * Read asynchronously data from isolates file.
 * @returns {Promise<Buffer | Error>}
 */
function getIsolateDataAsync() {
    return fs.promises
        .readFile(isolatesFile)
        .then(data => {
            let file = renderFiles(data.toString())
            isolatesIdentifier_a = file[0]
            isolates_a = file.slice(1, file.length)
        })
        .catch(err => Error(err))
}

/**
 * Get asynchronously all isolates.
 * @returns {Promise<String[][]>}
 */
async function getIsolateAsync() {
    if (isolates_a == null) {
        await getIsolateDataAsync()
    }
    return isolates_a
}

/**
 * Get asynchronously next isolate.
 * @returns {Promise<String[] | null>} return null if idx is bigger than isolates length, else return the isolate.
 */
async function getNextIsolateAsync() {
    if (isolates_a == null) {
        await getIsolateDataAsync()
    }
    if(idxColumnIsolate_a >= isolates_a.length) return null
    let toReturn = isolates_a[idxIsolate_a]
    idxIsolate_a++
    return toReturn
}

/**
 * Get asynchronously next isolate.
 * @param size {String} Number of isolate to return.
 * @returns {Promise<String[][]>}
 */
async function getNIsolatesAsync(size) {
    if (isolates_a == null) {
        await getIsolateDataAsync()
    }
    if(size >= isolates_a.length) return isolates_a
    return isolates_a.slice(0, size - 1 )
}


/**
 * Get asynchronously a determinate isolate.
 * This function only cloud be call if already exist profiles file.
 * @param id {Number} Isolate identifier.
 * @returns {Promise<String[]>}
 */
async function getXIsolateAsync(id) {
    if(!id) throw new Error('Id is missing.')
    if (profiles_a == null) { await getProfileDataAsync() }
    if (isolates_a == null) { await getIsolateDataAsync() }
    if(!idxColumnIsolate_a){
        idxColumnIsolate_a = isolatesIdentifier_a.indexOf(firstColumnName_a)
    }
    let toReturn = []
    let curr
    for (let i = 0; i < isolates_a.length; i++) {
        curr = isolates_a[i]
        if(curr[idxColumnIsolate_a] === id){
            toReturn.push(curr)
        }
    }
    return toReturn
}

function setNewIsolatesFileData(data){
    setUpIsolateVariables()
    isolates_a = isolates_s = data
    return isolateFunctions2
}

/**
 * Auxiliary Functions.
 */

/**
 * Separate the data into lines and columns.
 * @param {string} file
 * @returns {string[][]}
 */
function renderFiles(file) {
    const toReturn = file.split('\r\n').map(str => {
        return str.split('\t')
    })
    return toReturn
}

module.exports = {
    setAllFilesPath,
    setNewTreeFilePath,
    setNewProfilesFilePath,
    setNewIsolatesFilePath,
    setNewIsolatesFileData,
    setNewProfilesFileData,
    setNewTreeFileData,
}