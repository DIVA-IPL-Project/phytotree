Each visualization is a module. For the **Radial visualization** see the file [**radial**](https://github.com/DIVA-IPL-Project/phytotree/blob/master/App/server/public/visualization/radial.js) and for the **Dendrogram Visualization** see the file [**dendrogram**](https://github.com/DIVA-IPL-Project/phytotree/blob/master/App/server/public/visualization/dendrogram.js). Each one of these modules have the same methods to build, draw and manipulate the tree. However, some methods are specific of one of the visualizations.  
This modules draw radial and dendrogram visualizations from a JSON object, containing a phylogenetic tree.

# How to run the app:

### 1. Download the executable according to the OS you are running.

For Windows download the .exe. All files can be found in the Releases tab [here](https://github.com/DIVA-IPL-Project/phytotree/releases/latest).

To generate the executable for MacOS and Linux follow the build instructions found [here](#generate-installation-files).

The data processing and parsing can be done in server or client side.
- To run the app with the data processing executing in the server side download the file that ends with -client.
- To run the app with the data processing executing in the client side download the file that ends with -server.

### 2. Install the app in your computer.

Open the setup file and follow the instructions to install the app in your computer.

## Generate installation files

First of all, it is necessary to run the command `npm install` in the app's folder.

To generate new installation files, run the command `npm run build` in the app's folder.

# Fundamentals

## Input files
The application receives tree types of input files:
+ [Tree file](#supported-formats-for-the-tree-file) (.txt)
+ [Profile file](#example-of-a-profile-file) (must be tab separated)
+ [Isolate file](#example-of-an-isolate-file) (must be tab separated)

In files with allelic profiles and isolated data, there must always be a profile identifier column. The isolated data must have the same format as the allelic profiles, with one of the columns having to coincide, mandatorily, with the identifier column in the corresponding allelic profiles table.

### Supported Formats for the tree File

Supports the Newick format and the Nexus format.

#### **Example of a phylogenetic tree in newick format**
```
(D:1.8125,(A:2.8125,(B:1.625,C:1.375)_:2.1875)_:2.6875,(E:1.25,F:1.75)_:4.4375)_;
```

#### **Example of a phylogenetic tree in nexus format**
```
#NEXUS

BEGIN TAXA;
    Dimensions NTax=6;
    TaxLabels A B C D E F;
END;

BEGIN CHARACTERS;
    Dimensions NChar=20;
    Format DataType=DNA;
    Matrix
        A ACATA GAGGG TACCT CTAAG
        B ACATA GAGGG TACCT CTAAG
        C ACATA GAGGG TACCT CTAAG
        D ACATA GAGGG TACCT CTAAG
        E ACATA GAGGG TACCT CTAAG
        F ACATA GAGGG TACCT CTAAG
END;

BEGIN TREES;
    Tree result =
    (D:1.8125,(A:2.8125,(B:1.625,C:1.375)_:2.1875)_:2.6875,(E:1.25,F:1.75)_:4.4375)_;
END;
```

#### **Example of a profile file**
```
ST	Gene_1	Gene_2	Gene_3	Gene_4	Gene_5
A	10	6	6	12	13
B	5	4	4	2	15
C	5	3	4	6	2
D	2	2	4	8	7
E	2	2	1	1	12
F	1	3	1	1	1
```

#### **Example of an isolate file**
```
ST	Country	Year
A	China	1983
A	United-Kingdom	2012
B	United-Kingdom	2010
C	China	1997
D	China	1996
E	China	2010
E	China	2010
E	China	2010
F	United-Kingdom	2012
```

To test the app with test files, download one of the following:
- [small tree](https://github.com/DIVA-IPL-Project/Visualization/blob/master/Docs/example1-small%20tree.zip)
- [big tree](https://github.com/DIVA-IPL-Project/Visualization/blob/master/Docs/example2-big%20tree.zip)

# Example Videos
[Playlist with tutorial of how to use the app](https://youtube.com/playlist?list=PLSZMwhUOJwPXGFFd7k0HWOL-mA2X_6gxp)

# Features

+ [Tree visualization in Dendrogram and Radial formats](#construct-the-tree)
+ [Add labels to the nodes and links](#tree-labels)
+ [Colapse and expand nodes](#colapse-and-expand)
+ [Change node color and size](#tree-style)
+ [Change link thickness](#change-link-size)
+ [Change labels size](#change-labels-size)
+ [Integration of complementary data (year, location, sex, etc)](#tree-filters)
+ [Rescale the tree](#rescale-tree)
+ [Save the current study (in a JSON file)](#save-study)
+ [Download report](#download-report)

## **Construct the tree**
To view the radial or dendrogram, first, you need to build the tree, by passing the JSON data. Then you can draw it where you want. Each of these steps is a method as specified below:

### 1. Build the tree

```javascript
const graph = build(data)
```

This method receives a JSON object. This objet contains the phylogenetic tree and needs to have at least the field `links`. This field is an array with the tree links. Each link needs to have a `source`, a `target` and a `value` field.

- `source`: the node where the link starts
- `target`: the node where the link ends
- `value`: the link size  

Example of the JSON object:

```json
{
    "links": 
    [
        { "source": "node_A", "target": "node_B", "value": 1.625 }
    ]
}
```
The method returns the tree that was built.

### 2. Draw the tree

```javascript
draw('#container', graph.tree)
```

This method draws the tree that was previous built. Receives the place to draw the tree (container) and the tree (graph.tree).

## **Tree Labels**
The tree can have labels on the nodes and links. The nodes are divided in two types leaf nodes and parent nodes. The labels on the leaf nodes are draw by default. The other labels can be added with the following methods. It is also possible to change the labels size.

### Add labels to the parent nodes
```javascript
addInternalLabels()
```

### Add labels to the links
```javascript
addLinkLabels()
```

### Change labels size
```javascript
changeLabelsSize(value)
```
The value is the new size for the labels. When this method is called, all labels (nodes and links) are affected.

## **Colapse and expand**
By default, a listener is added to all nodes, that when they are clicked, that node is collapsed. When a node is colapsed, all of the children of that node are removed. When the node is clicked again, the children are drawn at the same positions.

## **Tree Style**
It is possible to change the color of the nodes and the thickness of the links.

### Add style to nodes

```javascript
addNodeStyle()
```
This method adds size and color to the nodes. The default color is black.

### Add style to links

```javascript
addLinkStyle()
```
This method adds the thickness to the links.

### Change node color

```javascript
changeNodeColor(node, color)
```
This method changes the color of the node. Receives the node to change and the color.

### Change node size

```javascript
changeNodeSize(value)
```

### Change link size

```javascript
changeLinkSize(value)
```

## **Tree Filters**

```javascript
applyFilter(filter)
```
Applies the filter to the tree. A filter is a object with the following fields:
```JSON
{
    "name": "The filter name",
    "line": "The lines containing the profiles ids",
    "column": "The columns to filter by"
}
```

```javascript
buildBarChart(name, lines, columns, colors)
```
Constructs bar charts in the leaf nodes. The parameters are the filter fields.

## **Rescale tree**
It is possible to rescale the tree. Exists two scales to view the tree, the linear scale and the logarithmic scale.

```javascript
applyLinearScale()
```
To use the linear scale.

```javascript
applyLogScale()
```
To use the logarithmic scale.

```javascript
horizontalRescale(increment)
```
Rescales the tree horizontally, according to the applied scale. The parameter increment indicates if the rescale is to increment or to decrement.

```javascript
verticalRescale(increment)
```
(Dendrogram only) Rescales the tree vertically, according to the applied scale. The parameter increment indicates if the rescale is to increment or to decrement.

## **Align nodes** (Dendrogram only)

```javascript
alignNodes()
```
Ignores the link size and draws the dendrogram with the nodes aligned by dept.

## **Spread Tree** (Radial only)

```javascript
addSpread()
```
Separates the nodes and links, by appling a spread function to the radial algorithm. Increases the algorithm time to O(v^2), where v is the number of nodes.

## **Save and load study**

```javascript
const json = save()
```
Saves the current study in a JSON object.

```javascript
load('#container', json)
```
Loads the saved study from a json object. The json object is the return of the `save` function.

## **Download report**

```
downloadReport(filename, title)
```
The report produced, in PDF format, consists of a title, the phylogenetic tree and, if filters are applied, it also consists of a pie chart, with statistics applied to the tree.

## Other functions

### Get nodes names

```javascript
const nodes = getNodes()
```
Returns the nodes names.
