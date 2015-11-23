/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
ol.control.LayerControl = function(opt_options) {
  var options = typeof(opt_options) !=='undefined' ? opt_options : {};
  //check if key exist or undefined                                       //if not defined asign the default values
   options.title            = typeof(options.title) !=='undefined'            ?  options.title             : 'Layer Management';     //title on top of panel
   options.mapdivid         = typeof(options.mapdivid) !=='undefined'         ?  options.mapdivid          : 'map';                  //div id of map
   options.draggable        = typeof(options.draggable) !=='undefined'        ?  options.draggable         : false;                  //panel draggable or not
   options.width            = typeof(options.width) !=='undefined'            ?  options.width             : 250;                    //panel width
   options.mapconstrained   = typeof(options.mapconstrained) !=='undefined'   ?  options.mapconstrained    : true;                   //contrain panel to map canvas
   options.hidden           = typeof(options.hidden) !=='undefined'           ?  options.hidden            : true;                   //hidden at startup or not
   options.lang             = typeof(options.lang) !=='undefined'             ?  options.lang              : 'en';                   //prefered language for the time being english and greek
   options.capabilitiesURLs = typeof(options.capabilitiesURLs) !=='undefined' ?  options.capabilitiesURLs  : [
   "examples_data/ogcsample1.xml",
   "examples_data/ogcsample2.xml",
   "examples_data/ogcsample3.xml"
   ];
  //initialise the tooltips extjs functionality
  Ext.tip.QuickTipManager.init();


  var divControl = document.createElement('div');
  divControl.innerHTML = '<img class="layrctl-imgbtn" src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS_Coz6FFp-dSQIOmTnSeyzK9D74enD7Tp4uE2xcyAuyOLfAqVY"</img>';   
    
  var divContainerControl =  document.createElement('div');
  divContainerControl.className = "laycntrl-mapcont";
  divContainerControl.id = "laycntrl-mapcont";
  document.getElementById(options.mapdivid).appendChild(divContainerControl); 
  
  
  //hold the otpions to the control
  this.options = options; 
  //initialise the language abbrvs   
  this.initLCLangs();  
  //set the layer moving during dragging a layer to a new position. 
  this.lyrTreeNodeMooving = {};
  //create the object to hold the layers associated with the map. 
  //These are all the layers not just those within then control .
  //the collection populates within setMap method of the control
  this.lyrCollection = new ol.Collection(); 
  //set the locale abbreviations
  //you may add new language abbrevations here and then pass options.lang during control initialasiation
  
    //creates the extjs tree panel 
  this.treePanel = this.createThePanel(options);
  var this_ = this;
    //toggle the panel. show/hide
  this.toggleTreePanel = function(e) {
   var isVisble = this_.treePanel.isVisible();
   if (isVisble){
   this_.hideTreePanel();
   } else {
   this_.showTreePanel()
   }
   this_.treePanel.doLayout(true);
  };
   //add the listeners function to the control button 
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
//and instatiate the control
ol.inherits(ol.control.LayerControl, ol.control.Control);


/**
 * 1. Asign the map to the control
 * 2. Asign the event "add","remove"  to the layers {ol.Collection} of the map
 * 3. Asign the load start load end events to each layer
 * 4. Build the child nodes to add on tree
 */
ol.control.LayerControl.prototype.setMap = function(map) {
ol.control.Control.prototype.setMap.call(this, map);//register the map to the control
    var lyrChildArray = new Array();
    if (map) { 
        //set the layers exist on map to the lyrCollection property    
        this.lyrCollection = map.getLayers();
        //loop through them and collect those with 'lyrControlOpt' key        
        this.lyrCollection.forEach(function(layer){
        var layerTreeConfig = layer.get('lyrControlOpt');
        
        if (typeof(layerTreeConfig) ==='undefined'){
          console.info("layer has not lyrcontrol options and so will not be added within the control. layer obj is-->",layer);
        } else {
          //define the layer type
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
    this.layers = lyrChildArray;
    //populate the tree panel with data 
    this.setPanelData(lyrChildArray);
    //enable the listeners so control is aware on adding or removing a layer  
    var this_ = this;    
    this.enableLayerListeners(this_.lyrCollection);
    }
};


/**
 *  enable the listeners so when adding a new layer on the map
 *  this will be added to the tree as well
 */
ol.control.LayerControl.prototype.enableLayerListeners = function (layersExist){
var this_= this;
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

var groupNames = new Array(); //an array of strings for the groups
   for (var f=0;f<data.length;f++){
     if (!isInArray(data[f].get('lyrControlOpt').legendGroup,groupNames)){//check if group name allready exists
      groupNames.push(data[f].get('lyrControlOpt').legendGroup);
     }
   }
this.groupNames = groupNames; 
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

var store = this.treePanel.getStore();
var rootData = {
        expanded      : true,
        allowDrag     : false, 
        allowDrop     : true, 
        children: childObjects
    }
store.setRoot(rootData);
}

/**
 * show the panel
 */
ol.control.LayerControl.prototype.showTreePanel = function (pos){
if (typeof(pos) !=='undefined'){
console.log("pos",pos);
this.treePanel.setPosition(pos.left,pos.top,false);
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
renderTo        : document.getElementById('laycntrl-mapcont'),
constrain       : opt.mapconstrained,
constrainTo     : elContstrainTo,
manageHeight    : true,
title           : opt.title,
id              : 'ol3treepanel',
style           : {
    'z-index' : 99999
},
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
hidden          : opt.hidden,
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
        itemcontextmenu: function(view, record, item, index, e, eOpts){
          this_.showLyrContextMenu(view, record, item, index, e, eOpts, this_);
        }
},
tbar            : [
            { 
                xtype   : 'button', 
                id      : 'editlyrprops',
                iconCls : 'layrctl-props',
                tooltip : this_.langAbbrevations[opt.lang].ui.lyrPropsTip,
                handler : function(){
                    alert('show properties.....');
                }
            },{ 
                xtype   : 'button', 
                id      : 'addlyr',
                iconCls : 'layrctl-addNew',
                tooltip : this_.langAbbrevations[opt.lang].ui.addlyrTip,
                handler : function(){
                    this_.showNewLayerPanel();
                }
            },{ 
                xtype   : 'button', 
                id      : 'removeLyr',
                iconCls : 'layrctl-remove',
                tooltip : this_.langAbbrevations[opt.lang].ui.removeLyrTip,
                handler : function(btn){
                    this_.removeLayer();
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
var layer = this.getTreeLyrById(lytreerid); 
layer.setVisible(vis);
}


/**
 *supply the treenode id
 *get back the ol.layer object
 */
ol.control.LayerControl.prototype.getTreeLyrById = function(lyrtreeid){
var lyrsOnTree = this.layers;
  for (var i=0;i<lyrsOnTree.length;i++){
  var lyrTreeID = lyrsOnTree[i].get('lyrControlOpt').legendnodeid;
    if (lyrTreeID === lyrtreeid) {
    return  lyrsOnTree[i];
    }
  }
}
/**
 * remove the selected layer node from panel and the map
 * @cntrl pass the control itself
 */
ol.control.LayerControl.prototype.removeLayer = function(){
var selectedNode = this.treePanel.getSelectionModel().getSelection();
  if (selectedNode.length>0){
    if(selectedNode[0].isLeaf() === true){
     var lyrcntrlid = selectedNode[0].get('id').split("___")[0];   
     var lyrToRemove = this.getTreeLyrById(lyrcntrlid);
     this.getMap().removeLayer(lyrToRemove);
     this.setMap(this.getMap());//call the set map to populate the new data and update the panel with nodes using layers exist on map
    } 
  } 
}


/**
 * use the capabilities urls array provided during configuration
 */
ol.control.LayerControl.prototype.showNewLayerPanel = function(btn){
var this_ = this; //get it ready to be passed on listener functions
var urlsArray = this.options.capabilitiesURLs;
var capabJsonDocs = new Array();
this.treePanel.setLoading(true);
  for (var i=0;i<urlsArray.length;i++){
      Ext.Ajax.request({
          url     : urlsArray[i],
          method  : 'GET', 
          async   : false, 
          success: function(response) {
              var parser = new ol.format.WMSCapabilities();
              capabJsonDocs.push(parser.read(response.responseXML));
              console.log("capabJsonDocs",capabJsonDocs)
          }
      });
  }
var childObjects = new Array();
for (var g=0;g<capabJsonDocs.length;g++){
childObjects[g] = { 
      text          : capabJsonDocs[g].Service.Title, 
      expanded      : false, 
      expandable    : true, 
      allowDrag     : true, 
      allowDrop     : true, 
      children      : [],
      lyrloadingcon : ''
  };
var availableLyrs = capabJsonDocs[g].Capability.Layer.Layer  
  for (var s=0;s<availableLyrs.length;s++){
  var uuid = generateUUID();
     childObjects[g].children.push({
       text       : availableLyrs[s].Title,
       sname      : availableLyrs[s].Name,
       onlineURL  : capabJsonDocs[g].Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource,
       leaf       : true,
       valign     : "middle",
       autoHeight : true,
       uuid       : uuid,
       group      : capabJsonDocs[g].Service.Title,
       allowDrag  : true, 
       allowDrop  : false,
       icon       : capabJsonDocs[g].Capability.Request.GetMap.DCPType[0].HTTP.Get.OnlineResource +
                    "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=16&HEIGHT=16&LAYER="+ availableLyrs[s].Name
     })
  }
}

var rootData = {
        expanded      : true,
        allowDrag     : false, 
        allowDrop     : true, 
        children      : childObjects
    }
var store = Ext.create('Ext.data.TreeStore', {
    root  : rootData
});

var thePanel = Ext.create('Ext.tree.Panel', {
    width        : 200,
    height       : 150,
    store        : store,
    rootVisible  : false,
    id           : 'onlinelyrspanel'
});

Ext.create('Ext.window.Window', {
    title           : this.langAbbrevations[this_.options.lang].ui.wintitle1,
    height          : 400,
    width           : 400,
    layout          : 'fit',
    modal           : true,
    items           : thePanel,
    draggable       : true,
    closable        : true,
    resizable       : true,
    plain           : true,
    border          : true,
    autoScroll      : true,
    buttonAlign     : 'center',
    buttons         : [
      {
      text    :this_.langAbbrevations[this_.options.lang].ui.addLyrBtn,
      handler : function(){
        this_.addOnlineLyrOnMap();
        }
      }
    ],
    renderTo        : document.body//document.getElementById(this.options.mapdivid)
}).show();

this.treePanel.setLoading(false);  
}
/**
 * action when button pressed to add the selected layer
 */
ol.control.LayerControl.prototype.addOnlineLyrOnMap = function(){
var selectedNode = Ext.getCmp('onlinelyrspanel').getSelectionModel().getSelection();
  if (selectedNode.length>0){
    if(selectedNode[0].isLeaf() === true){
    var myNewLyr = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      url: selectedNode[0].get('onlineURL'),
      params: {'LAYERS': selectedNode[0].get('sname')},
      }),
    lyrControlOpt : {
           legendGroup  : selectedNode[0].get('group'),
           legendnodeid : selectedNode[0].get('uuid'),
           legendTitle  : selectedNode[0].get('text'),
           legendImgUrl : selectedNode[0].get('icon')
        }
    });
    this.getMap().addLayer(myNewLyr);
    this.setMap(this.getMap());
    }
  }
}


/**
 * right click context menu
 * on each layer to get and set the opacity slider
 */
ol.control.LayerControl.prototype.showLyrContextMenu = function (view, record, item, index, event, eOpts, cntrl){
event.stopEvent();
var lyrid = record.get('id').split('___treeid')[0];
var lyr = cntrl.getTreeLyrById(lyrid);
var curOpacity = lyr.getOpacity()*100;
if (typeof(Ext.getCmp("sliderOpacidad"))!=='undefined'){
Ext.getCmp("sliderOpacidad").destroy();
}
      if (record.data.leaf != false) {
            slider = Ext.create('Ext.slider.Single', {
                id          : 'sliderOpacidad',
                hideLabel   : false,
                floating    : true,
                width       : 200,
                minValue    : 0,
                maxValue    : 100,
                value       : curOpacity,
                listeners   : {
                    change: function (newValue, thumb, eOpts ){
                        lyr.setOpacity(thumb/100);
                    },
                    blur    : function() {
                        slider.setVisible(false);

                    }
                }
            });
            slider.showBy(item, 'tl-tl', [event.getX() - view.getX(), 12]);
        }
        

}



ol.control.LayerControl.prototype.showLyrPropsPanel = function(){
var this_ =  cntrl;
var lyr =  this_.getTreeLyrById(lyrtreeid);
var selectedNode = this_.treePanel.getSelectionModel().getSelection();
  if (selectedNode.length>0){
    if(selectedNode[0].isLeaf() === true){
     var lyrcntrlid = selectedNode[0].get('id').split("___")[0];   
     var lyrToCollectProps = this_.getTreeLyrById(lyrcntrlid);
     
    } 
  } 
}







/**
 *  this point forward 
 *  helper functions
 *
 */
 
 /**
  * supply the map and scale get back the resolution
  * @mymap ol.Map object
  * @scale the scale expressed as number e.g 100000 ....
  * @returns the resolution
  */
 function getResolutionFromScale(mymap,scale){
    var units = mymap.getView().getProjection().getUnits();
    var dpi = 25.4 / 0.28;
    var mpu = ol.proj.METERS_PER_UNIT[units];
    var resolution = scale/(mpu * 39.37 * dpi);
    return resolution;
}

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
 * function to create unique - random ids
 */
function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now();; //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


