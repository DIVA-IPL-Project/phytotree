const fs = require('fs/promises')

function read_tree_file(){
    return fs.readFile(__dirname + '\\test_files\\nwk.txt')
}

function read_profile_file(){
    return fs.readFile(__dirname + '\\test_files\\profiles.tab')
}

function read_isolate_file(){
    return fs.readFile(__dirname + '\\test_files\\isolates.tab')
}

module.exports = {
    read_tree_file,
    read_profile_file,
    read_isolate_file
}