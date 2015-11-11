# extjs_ol3_layercontrol


## Synopsis

Adding a layer control using the extjs treepanel api.

Build on ol3 v3.10.1 and extjs 5.1 versions

Version 0.1


## Code Example

call it like so:
      new ol.control.LayerControl({
         title      : "Layer Management",    //the title on top of the tree panel
         draggable  : true,                  //true||false
         width      : 250                    // width of the tree panel
      })
      
and then for every layer you want to use it 
asign an extra object {lyrControlOpt} during layer initiliasation
like so:
      
      new ol.layer.Tile({  
        title:"OSM Layer",
        source: new ol.source.OSM(),
        lyrControlOpt : {
           legendGroup : 'Tile Layers',               //tree panel group this layer belongs to
           legendnodeid: 'osmid',                     //this must be unique for every layer added
           legendTitle : "Open Street Map",           //Title of tree node
           legendImgUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQuc6e1CN-FTgOjxnG0YLjQ-vxQ4T9jHXdhimbTHn1NmbXxzDJa"  //image next to layrname 
        }
      })


## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

Provide code examples and explanations of how to get the project.

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests

Describe and show how to run the tests with code examples.

## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)