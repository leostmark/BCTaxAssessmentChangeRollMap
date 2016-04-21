define(['dojo/_base/declare', 'esri/layers/FeatureLayer', 'jimu/BaseWidget', 'esri/renderers/SimpleRenderer', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleLineSymbol',
'esri/Color', 'esri/lang', 'esri/graphic', 'esri/dijit/PopupTemplate', 'esri/InfoTemplate', 'dijit/popup', 'dojo/dom-style', 'dijit/TooltipDialog', 'esri/tasks/RelationshipQuery',
'dojox/grid/DataGrid', 'dojo/_base/array', 'dojo/data/ItemFileReadStore', 'dojo/domReady!'],
  function(declare, FeatureLayer, BaseWidget, SimpleRenderer, SimpleFillSymbol, SimpleLineSymbol,
  Color, esriLang, Graphic, PopupTemplate, InfoTemplate, dijitPopup, domStyle, TooltipDialog, RelationshipQuery, DataGrid, array, ItemFileReadStore) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here	  

      baseClass: 'jimu-widget-hover1',

      //this property is set by the framework when widget is loaded.
      name: 'Hover1',
      

      //methods to communication with app container:

      // postCreate: function() {
      //   this.inherited(arguments);
      //   console.log('postCreate');
      // },
      
	  
      startup: function(){    
        this.inherited(arguments);		
		var strFeatureLayer = "https://pvdev01.esri.local/arcgis/rest/services/BCAssessment/AssessChangeRoll_WM/MapServer/0";
		var strRelatedTable = "https://pvdev01.esri.local/arcgis/rest/services/BCAssessment/AssessChangeRoll_WM/MapServer/1";
		var mapCtl = this.map;
        //this.mapIdNode.innerHTML = 'map id:' + mapCtl.id;
		/*var popupTemplate = new PopupTemplate({
			"title": "{AA_NUM} {AA_NAMES}",
			"description": "{relationships/0/Jur}"
			});*/
	  
        var flAssessmentAreas = new FeatureLayer(strFeatureLayer, {
          mode: FeatureLayer.MODE_SNAPSHOT,
		//  infoTemplate: popupTemplate,
          outFields: ["*"]
        });
		var symbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([0,0,0]), 1
          ),
          new Color([50,188,173,0.5])
        );

		flAssessmentAreas.setRenderer(new SimpleRenderer(symbol));
		mapCtl.addLayer(flAssessmentAreas);
		mapCtl.infoWindow.resize(245,125);
        
        dialog = new TooltipDialog({
          id: "tooltipDialog",
          style: "position: absolute; whitespace: nowrap; width: 330px; font: normal normal normal 10pt Helvetica;z-index:100"
        });
        dialog.startup();

		var highlightSymbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID, 
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID, 
            new Color([0,0,0]), 3
          ), 
          new Color([7,129,154,0.5])
        );
		
		 //close the dialog when the mouse leaves the highlight graphic
        mapCtl.on("load", function(){
          mapCtl.graphics.enableMouseEvents();          
        });
        mapCtl.graphics.on("mouse-out", function(){
		  mapCtl.graphics.clear();
          dijitPopup.close(dialog);
		});
        flAssessmentAreas.on("mouse-over", function(evt){
		  //Listens for when the onMouseOver event fires on the flAssessmentAreas.
		  var featureAssessment = evt.graphic;		  
		  //Create a new graphic with the geometry from the event.graphic and add it to the maps graphics layer.
          var highlightGraphic = new Graphic(featureAssessment.geometry,highlightSymbol);		  
          mapCtl.graphics.add(highlightGraphic);
          
          
		  
		  //Query the related records.
          var queryJurisdiction = new RelationshipQuery();
          queryJurisdiction.outFields = ["Jur", "Jur Name", "Res", "Bus/Other"];
          queryJurisdiction.relationshipId = 0;
          queryJurisdiction.objectIds = [featureAssessment.attributes.OBJECTID_1];
		  queryJurisdiction.returnGeometry = false;
		  console.log("ObjectID of Assessment Area: ", featureAssessment.attributes.OBJECTID_1);
          
          flAssessmentAreas.queryRelatedFeatures(queryJurisdiction, function(relatedRecords){
            console.log("Related recs: ", relatedRecords);
            if ( ! relatedRecords.hasOwnProperty(featureAssessment.attributes.OBJECTID_1) ) {
              console.log("No related records for ObjectID: ", featureAssessment.attributes.OBJECTID_1);
              return;
            }
            var fset = relatedRecords[featureAssessment.attributes.OBJECTID_1];
            var items = array.map(fset.features, function(feature) {
              return feature.attributes;
            });
			//Create data object to be used in the store
            /*var data = {
                identifier: "Jur",  //This field needs to have unique values
                label: "Jur", //Name field for display. Not pertinent to a grid but may be used elsewhere.
                items: items
            };*/     
		    console.log("fset retrieved in function:");
		    console.log(fset);
			
            //Create data store and bind to grid.
            //var store = new ItemFileReadStore({ data:data });
            //grid.setStore(store);
            //grid.setQuery({ Jur: "*" });
			
			var tableRows = relatedRecords[featureAssessment.attributes.OBJECTID_1].features;
			console.log("tableRows.length=" + tableRows.length);
			
			  //console.log("Data retrieved:");
			  //console.log(data1);
			  //var relatedTemplate = "<table data-dojo-type=\"dojox/grid/DataGrid\" jsid=\"grid\" id=\"grid\" data-dojo-props=\"rowsPerPage:'20', rowSelector:'20px'\" style=\"height:300px; width:250px\">"+
			  
			var headerTemplate = "<b>${AA_NUM} ${AA_NAMES}</b><table><thead><tr><th field=\"Jur\"><b>Jur</b></th><th field=\"Jur Name\"><b>Jur Name</b></th><th field=\"Res\"><b>Res</b></th><th field=\"Bus/Other\"><b>Bus/Other</b></th></tr><hr/></thead><tbody>"
			var bodyTemplate = "<tr><td>${Jur}</td><td>${Jur Name}</td><td align=\"right\">${Res}</td><td align=\"right\">${Bus/Other}</td></tr>"			  
			var footerContent = "</tbody></table>"
			
/* 			   "Jur: <b>${Jur}</b><hr><b>Jur Name: </b>${Jur Name}<br>"
				+ "<b>Res: </b>${Res}<br>"
				+ "<b>Bus/Other: </b>${Bus/Other}<br>"+ */
				
			  
			  //var t = "Result";
			  //console.log("featureAssessment.attributes");
			  //console.log(featureAssessment.attributes);
			  
			var headerContent = esriLang.substitute(featureAssessment.attributes, headerTemplate);
			  //Define the content of the popup
			var bodyContent = "";
			for (i = 0; i < tableRows.length; i++) { 
				bodyContent += esriLang.substitute(tableRows[i].attributes,bodyTemplate);
			}
			
			  //var content = evt.graphic.getContent();
			  //content = "<h1>Hello</h1>" + content;
			  //console.log("content");
			  //console.log(content);
			var popupContent = headerContent + bodyContent + footerContent;
			dialog.setContent(popupContent);
			domStyle.set(dialog.domNode, "opacity", 0.85);
			  
			  //var store1 = new dojo.data.ItemFileReadStore({data: dojo.fromJson(data1)}); //A syntax error occurs in this line.
			  //var store1 = new ItemFileReadStore({data:data}); //This line gives a non-critical message: TypeError this._arrayOfTopLevelItems is undefined.
			  //var grid1 = dijit.byId("grid");
			  //grid1.setStore(store); // An error in the grid occurs in this line.
			  //grid1.setQuery({ Jur: "*"});
			  //grid1.startup();
			  
			dijitPopup.open({
			  popup: dialog, 
			  x: evt.pageX,
			  y: evt.pageY
			})
		  });
		})
	    //End of the mouse-over event.
	  }
      //End of the startup function.
	  
      // onOpen: function(){
      //   console.log('onOpen');
      // },
	
      // onClose: function(){
      //   console.log('onClose');
      // },

      // onMinimize: function(){
      //   console.log('onMinimize');
      // },

      // onMaximize: function(){
      //   console.log('onMaximize');
      // },

      // onSignIn: function(credential){
      //   /* jshint unused:false*/
      //   console.log('onSignIn');
      // },

      // onSignOut: function(){
      //   console.log('onSignOut');
      // }

      // onPositionChange: function(){
      //   console.log('onPositionChange');
      // },

      // resize: function(){
      //   console.log('resize');
      // }

      //methods to communication between widgets:
	})


  });