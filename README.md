# openlayers 3 .Layer tree panel using extjs 5.1


## Synopsis

Adding a layer control using the extjs treepanel api.

Build on ol3 v3.10.1 and extjs 5.1 versions 
but also works with latest openlayers v4.0.x
and extjs 6.x

Version 0.2

## Supported Functionality


1. drag and drop within group of layers and accossiated layer ordering on map
2. check box to toggle layer visibility
3. associated icons next to layer name for loadstart, loadend, loaderror events
4. Add and remove layers dynamically  (working on it)
5. icons before layer name for the legend style
6. drag treepanel


## Code Example
example here

[first example](http://ptsagkis.github.io/extjs_ol3_layercontrol/example.html)

[mininalistic example](http://ptsagkis.github.io/extjs_ol3_layercontrol/example0_minimalistic.html)

[example with options](http://ptsagkis.github.io/extjs_ol3_layercontrol/example1_withoptions.html)

[with other controls](http://ptsagkis.github.io/extjs_ol3_layercontrol/example2_morecontrols.html)

[switching themes](http://ptsagkis.github.io/extjs_ol3_layercontrol/example3_themes.html)

[legend icons from geoserver](http://ptsagkis.github.io/extjs_ol3_layercontrol/example3.html)

[dynamic add preconfigured layers](http://ptsagkis.github.io/extjs_ol3_layercontrol/example4_dynamic_add_layer.html)

[use an extjs layout for best UI experince](http://ptsagkis.github.io/extjs_ol3_layercontrol/example5_extjslayout.html)

[change visibility programmticaly and fire the listener to toggle check box ](http://ptsagkis.github.io/extjs_ol3_layercontrol/example6_vector.html)

[set a target outside the map to place the control](http://ptsagkis.github.io/extjs_ol3_layercontrol/example7_target.html)

your html:

          <div class='laycntrl-wrapper'>
          <div id="map" style="height:50%" ></div>
          </div>


your javascript:

      
      
      new ol.control.LayerControl({
         title              : "Layer Management",    //the title on top of the tree panel
         draggable          : true,                  //true||false treepanel is drggable or not
         width              : 250,                   //width of the tree panel
         mapdivid           : 'map',                 //div element of map
         mapconstrained     : true                   //true||false treepanel contstrained to mapdiv element 
         hidden             : true                   //true||false treepanel should be visible or not at start up
         lang               : 'en'                   //laguage to use for abbrevations . default is 'en',   
         capabilitiesURLs   : [
           "http://giswebservices.massgis.state.ma.us/geoserver/wms?request=GetCapabilities",  //add as many online resources you feel like
           "examples_data/ogcsample1.xml"                                                      //you will be able to get a list of the available layers
          ]                                                                                    //and add this on map. If not supplied the following capabilitiesURLs will be used
                                                                                               // "examples_data/ogcsample1.xml",
                                                                                               // "examples_data/ogcsample2.xml"
         
      })
      
and then for every layer you want to use it 
asign an extra object {lyrControlOpt} during layer initiliasation
like so:
      
      new ol.layer.Tile({  
        title:"OSM Layer",
        source: new ol.source.OSM(),
        lyrControlOpt : {
           legendGroup : 'Tile Layers',               // tree group this layer belongs to. A parent tree node will be created for each group found
           legendnodeid: 'osmid',                     //this must be unique for every layer added
           legendTitle : "Open Street Map",           //Title of tree node
           legendImgUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQuc6e1CN-FTgOjxnG0YLjQ-vxQ4T9jHXdhimbTHn1NmbXxzDJa"  //a url for the image next to title
        }
      }


## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

you need to include the following extjs files within the header of you html page
these are:

1. https://extjs.cachefly.net/ext/gpl/5.1.0/packages/ext-theme-classic/build/resources/ext-theme-classic-all-debug.css

2. http://cdn.sencha.com/ext/gpl/5.1.0/build/ext-all-debug.js

and the load your ol3 files as usual


## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests

Describe and show how to run the tests with code examples.

## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)
