# Radial and Dendrogram Visualization for Phylogenetic Trees
Radial and Dendrogram Visualization for Phylogenetic Trees is a modular solution for phylogeneric tree visualization
in **Dendrogram** and **Radial** formats. Can be used in applications such as PHYLOViZ, GrapeTree, Phylo.io, etc.   
The tree visualization is done using Data Driven Documents ([D3.js](https://d3js.org/)), Javascript, HTML and CSS.

[Docs](https://github.com/AdrVB/Radial-Dendrogram-Visualization/wiki)

## Visualization Examples
### Dendrogram  

<img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/dendrogram.png" width="1000">

### Radial  

<img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/radial.png" width="1000" height="700">

## Features
+ Tree visualization in Dendrogram, Radial and Circular Radial formats
+ Add labels to the nodes and links
+ Colapse and expand nodes
+ Change node color and size
+ Change link thickness
+ Change labels size
+ Statistics visualization with pie-charts
+ Integration of complementary data (year, location, sex, etc)
+ Save a report with the tree and statistics (in pdf format)
+ Save the current study (in a JSON file)

## Node.js application
It was developed an Node.js application to test the visualization modules.  
The application receives tree types of input files:
+ Tree file (.txt)
+ Profiles file (.tab)
+ Isolates file (.tab)

The data processing and parsing can be done in server ou client side.

## Launch the application
1. Open the terminal in the `impl` folder
2. Run the commnad `npm install`
3. Run the command `node index.js -client` or `node index.js -server` (the option -[client | server] indicates where it will be done the data processing)
4. Open a browser and use the uri http://localhost:8000/home to access the webpage

## System Requirements
+ Node.js

## Contacts
+ Adriano Baptista, a46072@alunos.isel.pt
+ Francisco Filipe, a46018@alunos.isel.pt
+ Inês Sousa, a45997@alunos.isel.pt
