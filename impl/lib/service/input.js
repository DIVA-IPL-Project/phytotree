'use strict'

const API = {
    getTree,
    getProfiles,
    getNextProfile,
    getNProfiles,
    getFirstColumnName,
    getIsolate,
    getNextIsolate,
    getNIsolates,
    getXIsolate,
    getXProfile
}

const fs = require('fs').promises

const extensionTreeFiles = ["nwk", "nex", "nxs"]
const extensionProfileAndIsolateFiles = ["tab"]

let treeFile
let profilesFile
let isolatesFile

let tree
let profiles
let isolates

let profilesIdentifier
let isolatesIdentifier

let firstColumnName

let idxProfile = 0
let idxIsolate = 0

let idxColumnIsolate

/**
 * Init Part.
 */

function init(tFile, pFile, iFile){
    checkFiles(tFile, pFile, iFile)
    return API
}

function checkFiles(tFile, pFile, iFile){
    if(!tFile) throw new Error('You have to put tree file.')
    let extension = tFile.split('.', 2)
    if(!extensionTreeFiles.includes(extension[1])){
        throw new Error(`${tFile} extension is not supported.`)
    }
    treeFile = tFile

    if(pFile){
        extension = pFile.split('.', 2)
        if(!extensionProfileAndIsolateFiles.includes(extension[1])){
            throw new Error(`${pFile} extension is not supported.`)
        }
        profilesFile = pFile
    }
    if(iFile) {
        extension = iFile.split('.', 2)
        if(!extensionProfileAndIsolateFiles.includes(extension[1])){
            throw new Error(`${iFile} extension is not supported.`)
        }
        isolatesFile = iFile
    }
}

/**
 *  Tree Part.
 */

function getTree(){
    if(tree){
        return tree
    }
    return fs.readFile(treeFile)
        .then(data => tree = data.toString())
        .catch(err=> Error(err))
}

/**
 *  Profile Data Part.
 */

function getProfileData() {
    return fs
        .readFile(profilesFile)
        .then(data => {
            const file = renderFiles(data.toString())
            profilesIdentifier = file[0]
            profiles = file.slice(1, file.length)
            firstColumnName = profilesIdentifier[0]
        })
        .catch(err => Error(err))
}

async function getProfiles() {
    if(!profiles){
        await getProfileData()
    }
    return profiles
}

async function getNextProfile(){
    if(profiles == null){
        await getProfileData()
    }
    if(idxProfile >= profiles.length) return
    let toReturn = profiles[idxProfile]
    idxProfile++
    return toReturn
}

async function getNProfiles(size) {
    if (profiles == null) {
        await getProfileData()
    }
    return profiles.slice(0, size-1)
}

async function getFirstColumnName() {
    if(firstColumnName != null) return firstColumnName
    if(profiles == null){
        await getProfileData()
    }
    firstColumnName = profilesIdentifier[0]
    return firstColumnName
}

async function getXProfile(id) {
    if (profiles == null) {
        await getProfileData()
    }
    let curr
    for (let i = 0; i < profiles.length; i++) {
        curr = profiles[i]
        if(curr[0] === id) return curr
    }
}

/**
 *  Isolate Data Part.
 */

function getIsolateData() {
    return fs
        .readFile(isolatesFile)
        .then(data => {
            let file = renderFiles(data.toString())
            isolatesIdentifier = file[0]
            isolates = file.slice(1, file.length)
        })
        .catch(err => Error(err))
}

async function getIsolate() {
    if (isolates == null) {
        await getIsolateData()
    }
    return isolates
}

async function getNextIsolate() {
    if (isolates == null) {
        await getIsolateData()
    }
    let toReturn = isolates[idxIsolate]
    idxIsolate++
    return toReturn
}

async function getNIsolates(size) {
    if (isolates == null) {
        await getIsolateData()
    }
    return isolates.slice(0, size - 1 )
}

async function getXIsolate(id) {
    if (profiles == null) { await getProfileData() }
    if (isolates == null) { await getIsolateData() }
    if(!idxColumnIsolate){
        idxColumnIsolate = isolatesIdentifier.indexOf(firstColumnName)
    }
    let toReturn = []
    let curr
    for (let i = 0; i < isolates.length; i++) {
        curr = isolates[i]
        if(curr[idxColumnIsolate] === id){
            toReturn.push(curr)
        }
    }
    return toReturn
}

/**
 * Auxiliary Functions.
 */

/**
 *
 * @param {string} file
 * @returns {string[][]}
 */
function renderFiles(file) {
    const toReturn = file.split('\r\n').map(str => {
        return str.split('\t')
    })
    return toReturn
}

module.exports = init