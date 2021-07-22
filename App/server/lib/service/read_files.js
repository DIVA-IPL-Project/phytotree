const fs = require('fs/promises')
const path = require('path');

function read_tree_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'nwk.txt'))
}

function read_profile_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'profiles.tsv'))
}

function read_isolate_file(){
    return fs.readFile(path.join(__dirname, 'test_files', 'isolates.tsv'))
}

module.exports = {
    read_tree_file,
    read_profile_file,
    read_isolate_file
}