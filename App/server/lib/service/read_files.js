const fs = require('fs/promises')
const path = require('path');

function read_tree_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'nwk.txt'))
}

function read_profile_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'profiles.tab'))
}

function read_isolate_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'isolates.tab'))
}

function read_file(file){
    return file.text()
}

module.exports = {
    read_tree_file,
    read_profile_file,
    read_isolate_file,
    read_file
}