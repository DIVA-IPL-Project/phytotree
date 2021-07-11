# Radial and Dendrogram Visualization for Phylogenetic Trees
Radial and Dendrogram Visualization for Phylogenetic Trees is a modular solution for phylogeneric tree visualization
in **Dendrogram** and **Radial** formats. Can be used in applications such as PHYLOViZ, GrapeTree, Phylo.io, etc.   
The tree visualization is done using Data Driven Documents ([D3.js](https://d3js.org/)), Javascript, HTML and CSS.

### [Radial and Dendrogram Visualization Docs](https://github.com/AdrVB/Radial-Dendrogram-Visualization/wiki/Radial-and-Dendrogram-Visualization-for-Phylogenetic-Trees)

## Visualization Examples
### Dendrogram  

<img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/docs/dendrogram.png">
<img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/docs/dendrogram_isolates.png">

### Radial  
<p float="left">
 <img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/docs/radial.png" width="400">
<img src="https://github.com/AdrVB/Radial-Dendrogram-Visualization/blob/main/docs/radial_isolates.png" width="400">
</p>

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

## Electron App
It was developed an Javascript application, using Electron to test the visualization modules.  
The application receives tree types of input files:
+ Tree file (.txt)
+ Profiles file (.tab)
+ Isolates file (.tab)

The data processing and parsing can be done in server ou client side.

## Contacts
+ Adriano Baptista, a46072@alunos.isel.pt
+ Francisco Filipe, a46018@alunos.isel.pt
+ Inês Sousa, a45997@alunos.isel.pt
