# How to run the app:

### 1. Download the executable according to the OS you are running.

For Windows download the .exe. All files can be found in the Releases tab [here](https://github.com/DIVA-IPL-Project/phytotree/releases/latest).

For Mac download the .dmg. All files can be found in the Releases tab [here](https://github.com/DIVA-IPL-Project/phytotree/releases/latest).

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

- [Tree file](#supported-formats-for-the-tree-file) (.txt)
- [Profile file](#example-of-a-profile-file) (must be tab separated)
- [Isolate file](#example-of-an-isolate-file) (must be tab separated)

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

- [small tree](https://github.com/DIVA-IPL-Project/phytotree/blob/main/documentation/datasets/example1-small%20tree.zip)
- [big tree](https://github.com/DIVA-IPL-Project/phytotree/blob/main/documentation/datasets/example2-big%20tree.zip)

# Example Videos

[Playlist with tutorial of how to use the app](https://www.youtube.com/playlist?list=PLpJSLY0KODw329otPCvENcM4GEoEscxFX)
