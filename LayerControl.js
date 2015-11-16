/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
ol.control.LayerControl = function(opt_options) {

  var options = typeof(opt_options) !=='undefined' ? opt_options : {};
  //set default values if not defined
   options.title            = typeof(options.title) !=='undefined'          ?  options.title          : 'Layer Management';
   options.mapdivid         = typeof(options.mapdivid) !=='undefined'       ?  options.mapdivid       : 'map';
   options.draggable        = typeof(options.draggable) !=='undefined'      ?  options.draggable      : false;
   options.width            = typeof(options.width) !=='undefined'          ?  options.width          : 250; 
   options.mapconstrained   = typeof(options.mapconstrained) !=='undefined' ?  options.mapconstrained : true;     
   console.log("options",options)
   

  
  
  var divControl = document.createElement('div');
  divControl.innerHTML = '<img class="layrctlimgbtn" src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS_Coz6FFp-dSQIOmTnSeyzK9D74enD7Tp4uE2xcyAuyOLfAqVY"</img>';   
    
  var divContainerControl =  document.createElement('div');
  divContainerControl.className = "laycntrlmapcont";
  divContainerControl.id = "laycntrlmapcont";
  document.getElementById(options.mapdivid).appendChild(divContainerControl); 
  
  var this_ = this;
  this_.options = options;
  //set the layer moving during dragging a layer to a new position
  this_.lyrTreeNodeMooving = {};
  //set the layers associated with the map. These are all the layers not just those within then control .
  //the collection populates within setMap method of the control
  this_.lyrCollection = new ol.Collection(); 
  
    //creates the extjs tree panel 
  this_.treePanel = this_.createThePanel(options);
    //toggle the panel. show/hide
  this_.toggleTreePanel = function(e) {
  console.info("toggling the panel");
   var isVisble = this_.treePanel.isVisible();
   if (isVisble){
   this_.hideTreePanel();
   } else {
   this_.showTreePanel(e);
   this_.treePanel.doLayout(true);
   }
  };
    
  divControl.addEventListener('click', this_.toggleTreePanel, false);
  divControl.addEventListener('touchstart', this_.toggleTreePanel, false);

  var element = document.createElement('div');
  element.className = 'ol-unselectable ol-layercontrol';
  element.appendChild(divControl);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });   

};
ol.inherits(ol.control.LayerControl, ol.control.Control);


/**
 * toggle the layer control visibility
 * on show do the ext layout for good and for bad 
 */
 
  
ol.control.LayerControl.prototype.toggleLayerTreePanel = function(e){
console.info("toggleLayerTreePanel");
var this_ = this;
   var isVisble = this_.treePanel.isVisible();
   if (isVisble){
   this_.hideTreePanel();
   } else {
   this_.showTreePanel(e);
   this_.treePanel.doLayout(true);  //force to layout
   }
}
/**
 * 1. Asign the map to the control
 * 2. Asign the event "add","remove"  to the layers {ol.Collection} of the map
 * 3. Asign the load start load end events to each layer
 * 4. Build the child nodes to add on tree
 */
ol.control.LayerControl.prototype.setMap = function(map) {
console.log("setting the map",map);
    ol.control.Control.prototype.setMap.call(this, map);
    var lyrChildArray = new Array();
    if (map) {
        var this_ = this;
        this_.lyrCollection = map.getLayers();
        this_.lyrCollection.forEach(function(layer){
        var layerTreeConfig = layer.get('lyrControlOpt');
        
        if (typeof(layerTreeConfig) ==='undefined'){
          console.info("layer has not lyrcontrol options and so will not be added within the control");
        } else {
          console.log("layer source",layer.getSource());
          var vectorType = layer instanceof ol.layer.Vector;
          var imageType = layer instanceof ol.layer.Image;
          var tileType = layer instanceof ol.layer.Tile;
          if (tileType === true){
          var source = layer.getSource();
               source.on('tileloadstart', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/loading.png';
                   }
               });
               source.on('tileloadend', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/ok.png';
                   }
               });
               source.on('tileloaderror', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/no.png';
                   } 
               });
          }
          else if (imageType === true){
          var source = layer.getSource();
               source.on('imageloadstart', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/loading.png';
                   }
               });
               source.on('imageloadend', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/ok.png';
                   }
               });
               source.on('imageloaderror', function(event) {
               var element = document.getElementById(layerTreeConfig.legendnodeid+'___loadingimg');
                   if (element !==null){
                   element.src = 'css/images/no.png';
                   } 
               });
          
          }
          else {
          
          console.log("no loading action available");
          }
          
           //build control's layers
          lyrChildArray.push(layer);
        }
        
        });
    this_.layers = lyrChildArray;
    //populate the tree panel with data 
    this_.setPanelData(lyrChildArray);
    //enable the listeners so control is aware on adding or removing a layer
    this_.enableLayerListeners(this_.lyrCollection);
    }
};


/**
 *  enable the listeners so when adding a new layer on the map
 *  this will be added to the tree as well
 */
ol.control.LayerControl.prototype.enableLayerListeners = function (layersExist){
var this_= this;
console.log("enabling listeners");
  //when adding a new layer on map
  layersExist.on('add',this_.onLayerAdd);
  //when moving a layer from map
  layersExist.on('remove',this_.onLayerMove);
}

/**
 *  disable the above listeners
 */

ol.control.LayerControl.prototype.disableLayerListeners = function (layersExist){
var this_= this;
console.log("disabling listeners")
  //when adding a new layer on map
  layersExist.un('add',this_.onLayerAdd);
  //when moving a layer from map
  layersExist.un('remove',this_.onLayerMove);
}

/**
 * action to take when adding a new layer on map
 */
ol.control.LayerControl.prototype.onLayerAdd = function(e){
console.log("layer added",e);
}
/**
 * action to take when removing a layer from map
 */
ol.control.LayerControl.prototype.onLayerMove = function(e){
console.log("layer removed",e);
}




/**
 * set the data object to be loaded
 * on the store of tree panel
 * and do the loading
 */
ol.control.LayerControl.prototype.setPanelData = function(data){
console.log("setting panel data")
var this_ = this;
console.log("data",data)
console.log("this_layers",this_.layers)
var groupNames = new Array(); //an array of strings for the groups
   for (var f=0;f<data.length;f++){
     if (!isInArray(data[f].get('lyrControlOpt').legendGroup,groupNames)){//check if group name allready exists
      groupNames.push(data[f].get('lyrControlOpt').legendGroup);
     }
   }
  console.log("groupNames",groupNames);
this_.groupNames = groupNames; 
var childObjects = new Array();
for (var g=0;g<groupNames.length;g++){
childObjects[g] = { 
      text          : groupNames[g], 
      expanded      : true, 
      expandable    : true, 
      allowDrag     : true, 
      allowDrop     : true, 
      children      : [],
      lyrloadingcon : ''
  };
  
  for (var s=0;s<data.length;s++){
     if (data[s].get('lyrControlOpt').legendGroup === childObjects[g].text){
     childObjects[g].children.push({
       text       : data[s].get('lyrControlOpt').legendTitle,
       leaf       : true,
       valign     : "middle",
       autoHeight : true,
       checked    : data[s].get('visible'),
       id         : data[s].get('lyrControlOpt').legendnodeid +"___treeid",
       allowDrag  : true, 
       allowDrop  : false,
       icon       : data[s].get('lyrControlOpt').legendImgUrl
     })
     }
  }
}
 console.log("childObjects",childObjects);

var store = this_.treePanel.getStore();
var rootData = {
        expanded: true,
        allowDrag     : false, 
        allowDrop     : true, 
        children: childObjects
    }
store.setRoot(rootData);

}

/**
 * show the panel
 */
ol.control.LayerControl.prototype.showTreePanel = function (e){
if (typeof(e) !=='undefined'){
this.treePanel.setPosition(e.clientX-260,e.clientY+50,false);
}
this.treePanel.show();
}


/**
 * hide the pane
 */
ol.control.LayerControl.prototype.hideTreePanel = function (e){
this.treePanel.hide();
}


/**
 *create the panel
 *@returns the panel itself {Ext.tree.Panel}
 */
ol.control.LayerControl.prototype.createThePanel = function (opt){
console.log("opt",opt)
var this_ = this;
var store = Ext.create('Ext.data.TreeStore', {
    root: {
        expanded: true,
        children: []
    }
});
var elContstrainTo = "";
if (opt.mapconstrained === true){ //if map constrain is true then constrain it within supplied map div
elContstrainTo = opt.mapdivid
}
var retPanel = 
Ext.create('Ext.tree.Panel', {
renderTo        : document.getElementById('laycntrlmapcont'),
constrain       : opt.mapconstrained,
constrainTo     : elContstrainTo,
manageHeight    : true,
title           : opt.title,
id              : 'ol3treepanel',
width           : opt.width,
anchor          : '100%', 
shadow          : true,
autoScroll      : true,
store           : store,
rootVisible     : false,
draggable       : opt.draggable,
floating        : true, 
plain           : true,
closable        : true,
closeAction     : 'hide',
hidden          : true,
useArrows       : true,
hideHeaders     : true,
columns         : [
                    {
                          xtype: 'treecolumn',
                          flex:1,
                          sortable:false,
                          resizable:true,
                          menuDisabled: true,
                          dataIndex: 'text',
                          width: 200
                    },{
                          width: 55,
                          menuDisabled: true,
                          sortable:false,
                          resizable:false,
                          dataIndex: 'lyrloadingcon',
                          renderer:renderLoadingIcon,
                          align: 'center'
                    }
                  ],
viewConfig      : {
            plugins: {
              ptype: 'treeviewdragdrop'     
            },
            listeners: {    
            beforedrop:function(node, data, overModel, dropPosition, dropHandlers) {
            var parentBefore = data.records[0].parentNode.data.text;
            var parentAfter = overModel.parentNode.data.text;
            console.log("parentBefore",parentBefore);
            console.log("parentAfter",parentAfter);
                if (parentBefore!==parentAfter || (parentBefore==="Root" && parentAfter==="Root"))
                {
                dropHandlers.cancelDrop();    
                }
                else
                {
                var parentGroup = data.records[0].parentNode.data.text
                var parentCount = getIndexOfString(this_.groupNames,parentGroup)+1;
                var idx = Ext.getCmp('ol3treepanel').getView().indexOf(data.records[0]) - parentCount;
                var layersCollection = this_.getMap().getLayers();
                this_.disableLayerListeners(this_.lyrCollection);
                this_.lyrTreeNodeMooving = layersCollection.removeAt(idx);
                dropHandlers.processDrop();   
                }
            },
            drop: function( node, data, overModel, dropPosition, eOpts){
            var parentGroup = data.records[0].parentNode.data.text
            var parentCount = getIndexOfString(this_.groupNames,parentGroup)+1;
            var idx = Ext.getCmp('ol3treepanel').getView().indexOf(data.records[0])- parentCount;
            var layersCollection = this_.getMap().getLayers();
            layersCollection.insertAt(idx,this_.lyrTreeNodeMooving);
            this_.lyrTreeNodeMooving = {};
            this_.enableLayerListeners(this_.lyrCollection);
            }
        }
},
listeners       : {
        checkchange : function(node,check){
            this_.toggleLyrVisibility(node.get('id').split("___")[0],check);
        },
        itemcontextmenu: showLyrContextMenu
},
tbar            : [
            { 
                xtype   : 'button', 
                id      : 'editlyrprops',
                text    : 'properties',
                iconCls : 'props',
                tooltip : 'Layer Properties',
                handler : function(){
                    alert('show properties.....');
                }
            },{ 
                xtype   : 'button', 
                id      : 'addlyr',
                text    : 'add new',
                iconCls : 'addlyr',
                tooltip : 'Add Layer',
                handler : function(){
                    alert('add layer.....');
                }
            }
      ]
});
retPanel.doLayout(true);
return retPanel;
};


/**
 *toggle the visbility 
 *for the supplied layer tree node id
 */

ol.control.LayerControl.prototype.toggleLyrVisibility = function(lytreerid,vis)
{
var this_ = this;
var layer = this_.getTreeLyrById(lytreerid); 
console.log("setting visibility :"+vis+" for layer",layer)
layer.setVisible(vis);
}


/**
 *supply the treenode id
 *get back the ol.layer object
 */
ol.control.LayerControl.prototype.getTreeLyrById = function(lyrtreeid){
var this_ = this;
var lyrsOnTree = this_.layers;
  for (var i=0;i<lyrsOnTree.length;i++){
  var lyrTreeID = lyrsOnTree[i].get('lyrControlOpt').legendnodeid;
    if (lyrTreeID === lyrtreeid) {
    return  lyrsOnTree[i];
    }
  }
}



/**
 *  this point forward 
 *  helper functions
 *
 */

/**
 * check if value exist in array
 * @param {type} value
 * @param {type} array
 * @returns {Boolean}
 */
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

/**
 * function to get the index of a string within an array of strings
 * it should retur the first index found or if no found should return -1
 * @param {array} arrayToSearch the array of strings to search with
 * @param {string} stringToSearch the string to search
 * @returns -1 if not found or the first index of found
 */
function getIndexOfString(arrayToSearch, stringToSearch) {
    for (var i = 0; i < arrayToSearch.length; i++) 
     {  
        if (arrayToSearch[i] == stringToSearch)
            return i;
     }
    return -1;
}

/**
 * function to render the icon
 * verifing whether layer has benn loaded succesfully or not
 * @param {type} value
 * @param {type} metaData
 * @param {type} record
 * @returns {String}
 */
function renderLoadingIcon(value,metaData,record ) {
    if (record.get('leaf')){
    var id = record.get("id");
    var lyrname = id.split("___treeid")[0];
    var imageId = lyrname+"___loadingimg";
    return '<img id="' + imageId + '" src="css/images/ok.png">';
    }
    else
    {
    return '';    
    }
}

/**
 * right click context menu
 * on each layer
 */
function showLyrContextMenu(){
alert("context menu here")
}
