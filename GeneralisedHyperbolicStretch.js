/*
 ****************************************************************************
 * GeneralisedHyperbolicStretch Utility
 *
 * GeneralisedHyperbolicStretch.js
 * Copyright (C) 2021, Mike Cranfield
 *
 * This script provides an environment within which to define, appraise and apply
 * a variety of different stretches to an image.  The stretches include a family
 * of stretches known as Generalised Hyperbolic stretches. The script has evolved
 * from a collaborative project between Mike Cranfield and Dave Payne.
*
 * Script coding by Mike Cranfield.
 * Equations and documentation by Dave Payne.
 *
 * If you wish to contact either of us please do so
 * via the Pixinsight Forums (https://pixinsight.com/forum/).
 *
 * This product is based on software from the PixInsight project, developed
 * by Pleiades Astrophoto and its contributors (https://pixinsight.com/).
 *
 * Version history
 * 1.0    2021-12-09 first release
 *
 *
 ****************************************************************************
 */

// ----------------------------------------------------------------------------
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, version 3 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program.  If not, see <http://www.gnu.org/licenses/>.
// ----------------------------------------------------------------------------


#feature-id    GeneralisedHyperbolicStretch : Utilities > GeneralisedHyperbolicStretch

#feature-info  This script provides an environment within which to define, appraise and apply \
a variety of different stretches to an image.  The stretches include a family of stretches \
known as Generalised Hyperbolic stretches.<br/>\
Copyright &copy; 2021 Mike Cranfield.


#include <pjsr/Sizer.jsh>           // needed to instantiate the VerticalSizer and HorizontalSizer objects
#include <pjsr/NumericControl.jsh>  // needed to instantiate the NumericControl control
#include <pjsr/SectionBar.jsh>      // needed to instantiate the SectionBar control


#define KEYPREFIX "GeneralisedHyperbolicStretch"
#define TITLE "GeneralisedHyperbolicStretch"
#define VERSION "1.0"



/*******************************************************************************
 * *****************************************************************************
 *
 * DEFINE GLOBAL CONTROL PARAMETERS
 *
 * These parameters define the look and operation of the script.  There is
 * a section of user defined parameters that persist between sessions.
 *
 * *****************************************************************************
 *******************************************************************************/


var controlParameters = {

   //---------------------------------------
   // Parameters controling script execution|
   //---------------------------------------
   suspendControlUpdating: false,
   suspendGraphUpdating: false,
   lastControlUpdate: new Date,
   sesssionStart: new Date,

   //----------------------------------------
   // Parameters definining the graph control|
   //----------------------------------------

   // - static - set at code execution start
   graphMinWidth: 250,
   graphMinHeight: 250,
   graphHGridCount: 4,
   graphVGridCount: 4,
   graphLineWidth: 2,
   refLineWidth: 1,
   graphResolution: 250.0,
   zoomPrecision: 2,
   panPrecision: 3,
   histExcludeZero: true,


   // - dynamic - may be changed by user input
   graphRange: 1.0,
   graphMidValue: 0.5,
   graphZoomCentre: 0.5,
   zoomMax: 200,
   clickLevel: -1,
   graphInfoText: "",
   graphVZoomFactor: 0,    // vertical zoom not currently implemented - zoom fac is 2 ^ gvzf
   graphMaxVZoomFactor: 4,
   linkedSTF: true,
   lastStretchKey: "",
   logHistogram: false,

   //-----------------------------------
   // Parameters defining other controls|
   //-----------------------------------

   // - static - set at code execution start
   DMin: 0.0,
   DMax: 10.0,
   bMin: -10.0,
   bMax: 10.0,
   LPMin: 0.0,
   LPMax: 1.0,
   SPMin: 0.0,
   SPMax: 1.0,
   HPMin: 0.0,
   HPMax: 1.0,
   BPMin: 0.0,
   BPMax: 1.0,
   CPMin: 0.0,
   CPMax: 1.0,
   DPrecision: 2,
   bPrecision: 2,
   LPSPHPPrecision: 5,
   BPCPPrecision: 4,
   newImagePrefix: "ghs_",
   newImageRootName: "ghs_Image",
   newImageUsePrefix: false,

   // - dynamic - may be changed by user input



   //-----------------------------------------------------
   // Parameters defining the layout of the user interface|
   //-----------------------------------------------------

   // - static - set at code execution start
   minLabelWidth: 60,
   minLabelHeight: 16,
   layoutSpacing: 4,
   dialogMinWidth: 500,

   // - dynamic - may be changed by user input


   //---------------------------------------------------------
   // Parameters that can be set by user in preferences dialog|
   //---------------------------------------------------------

   moveTopLeft: true,
   bringToFront: true,
   checkSTF: true,
   selectNewImage: true,
   saveLogCheck: true,
   newImageBaseId: "GHS_Image",
   graphHistActive: new Array(true, true),
   graphHistCol: new Array("Light grey", "Mid grey"),
   graphHistType: new Array("Draw", "Fill"),
   graphRGBHistCol: new Array("Light","Mid"),
   graphLineCol: "Red",
   graphRef1Col: "Mid grey",
   graphRef2Col: "Cyan",
   graphGridCol: "Mid grey",
   graphBackCol: "Dark grey",
   graphLineActive: true,
   graphRef1Active: true,
   graphRef2Active: true,
   graphGridActive: true,



   default_moveTopLeft: true,
   default_bringToFront: true,
   default_checkSTF: true,
   default_selectNewImage: true,
   default_histExcludeZero: false,
   default_saveLogCheck: true,
   default_newImageBaseId: "GHS_Image",
   default_graphHistActive: new Array(true, true),
   default_graphHistCol: new Array("Light grey", "Mid grey"),
   default_graphHistType: new Array("Draw", "Fill"),
   default_graphRGBHistCol: new Array("Light", "Mid"),
   default_graphLineCol: "Red",
   default_graphRef1Col: "Mid grey",
   default_graphRef2Col: "Cyan",
   default_graphGridCol: "Mid grey",
   default_graphBackCol: "Dark grey",
   default_graphLineActive: true,
   default_graphRef1Active: true,
   default_graphRef2Active: true,
   default_graphGridActive: true,


   //----------------------------------------------
   // Parameters defining lists for drop down boxes|
   //----------------------------------------------

   stretchTypes: ["Generalised Hyperbolic Stretch",
                  "Histogram Transformation",
                  "Arcsinh Stretch",
                  "Linear Prestretch",
                  "Image Inversion",
                  "Inverted Gen. Hyp. Stretch"],

   colourArray: [ "Red",
                  "Mid red",
                  "Light red",
                  "Green",
                  "Mid green",
                  "Light green",
                  "Blue",
                  "Mid blue",
                  "Light blue",
                  "Yellow",
                  "Mid yellow",
                  "Light yellow",
                  "Magenta",
                  "Mid magenta",
                  "Light magenta",
                  "Cyan",
                  "Mid cyan",
                  "Light cyan",
                  "White",
                  "Light grey",
                  "Mid grey",
                  "Dark grey",
                  "Black"],

   //--------------------------------------------------
   // Function to convert text colour to hex RGB number|
   //--------------------------------------------------

   getColour: function( ofWhat )
   {
      var c = "None"
      switch (ofWhat)
      {
         case "Histogram": c = controlParameters.graphHistCol[0]; break;
         case "Stretched Histogram": c = controlParameters.graphHistCol[1]; break;
         case "Stretch": c = controlParameters.graphLineCol; break;
         case "Reference1": c = controlParameters.graphRef1Col; break;
         case "Reference2": c = controlParameters.graphRef2Col; break;
         case "Grid": c = controlParameters.graphGridCol; break;
         case "Background": c = controlParameters.graphBackCol; break;
      }
      return this.getColourCode(c);
   },

   getColourCode: function( colour )
   {
      switch (colour)
      {
         case "None": return 0x00000000;
         case "Red": return 0xffff0000;
         case "Mid red": return 0xffff8080;
         case "Light red": return 0xffffc0c0;
         case "Green": return 0xff00ff00;
         case "Mid green": return 0xff80ff80;
         case "Light green": return 0xffc0ffc0;
         case "Blue": return 0xff0000ff;
         case "Mid blue": return 0xff8080ff;
         case "Light blue": return 0xffc0c0ff;
         case "Magenta": return 0xffff00ff;
         case "Mid magenta": return 0xffff80ff;
         case "Light magenta": return 0xffffc0ff;
         case "Cyan": return 0xff00ffff;
         case "Mid cyan": return 0xff80ffff;
         case "Light cyan": return 0xffc0ffff;
         case "Yellow": return 0xffffff00;
         case "Mid yellow": return 0xffffff80;
         case "Light yellow": return 0xffffffc0;
         case "White": return 0xffffffff;
         case "Light grey": return 0xffc0c0c0;
         case "Mid grey": return 0xff808080;
         case "Dark grey": return 0xff404040;
         case "Black": return 0xff000000;
      }
      return 0xff000000;
   },

   //---------------------------------------------------------------
   // Functions to persist user defined preferences between sessions|
   //---------------------------------------------------------------

   // store user defined options between sessions (also store program version number)
   save: function()
   {
      Settings.write(KEYPREFIX + "/version", 13, VERSION);

      Settings.write(KEYPREFIX + "/moveTopLeft", 0, controlParameters.moveTopLeft);
      Settings.write(KEYPREFIX + "/bringToFront", 0, controlParameters.bringToFront);
      Settings.write(KEYPREFIX + "/checkSTF", 0, controlParameters.checkSTF);
      Settings.write(KEYPREFIX + "/selectNewImage", 0, controlParameters.selectNewImage);
      Settings.write(KEYPREFIX + "/saveLogCheck", 0, controlParameters.saveLogCheck);
      Settings.write(KEYPREFIX + "/graphHistActive", 0, controlParameters.graphHistActive[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistActive", 0, controlParameters.graphHistActive[1]);
      Settings.write(KEYPREFIX + "/graphHistCol", 13, controlParameters.graphHistCol[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistCol", 13, controlParameters.graphHistCol[1]);
      Settings.write(KEYPREFIX + "/graphRGBHistCol", 13, controlParameters.graphRGBHistCol[0]);
      Settings.write(KEYPREFIX + "/graphStretchRGBHistCol", 13, controlParameters.graphRGBHistCol[1]);
      Settings.write(KEYPREFIX + "/graphHistType", 13, controlParameters.graphHistType[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistType", 13, controlParameters.graphHistType[1]);
      Settings.write(KEYPREFIX + "/graphLineCol", 13, controlParameters.graphLineCol);
      Settings.write(KEYPREFIX + "/graphRef1Col", 13, controlParameters.graphRef1Col);
      Settings.write(KEYPREFIX + "/graphRef2Col", 13, controlParameters.graphRef2Col);
      Settings.write(KEYPREFIX + "/graphGridCol", 13, controlParameters.graphGridCol);
      Settings.write(KEYPREFIX + "/graphBackCol", 13, controlParameters.graphBackCol);
      Settings.write(KEYPREFIX + "/graphLineActive", 0, controlParameters.graphLineActive);
      Settings.write(KEYPREFIX + "/graphRef1Active", 0, controlParameters.graphRef1Active);
      Settings.write(KEYPREFIX + "/graphRef2Active", 0, controlParameters.graphRef2Active);
      Settings.write(KEYPREFIX + "/graphGridActive", 0, controlParameters.graphGridActive);

   },

   // load user defined options
   load: function()
   {
      var keyValue;
      var lastSaveVersion;

      keyValue = Settings.read(KEYPREFIX + "/version", 13);
      if (Settings.lastReadOK) lastSaveVersion = keyValue;

      keyValue = Settings.read(KEYPREFIX + "/moveTopLeft", 0);
      if (Settings.lastReadOK) controlParameters.moveTopLeft = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/bringToFront", 0);
      if (Settings.lastReadOK) controlParameters.bringToFront = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/checkSTF", 0);
      if (Settings.lastReadOK) controlParameters.checkSTF = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/selectNewImage", 0);
      if (Settings.lastReadOK) controlParameters.selectNewImage = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/saveLogCheck", 0);
      if (Settings.lastReadOK) controlParameters.saveLogCheck = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistActive", 0);
      if (Settings.lastReadOK) controlParameters.graphHistActive[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistActive", 0);
      if (Settings.lastReadOK) controlParameters.graphHistActive[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistCol", 13);
      if (Settings.lastReadOK) controlParameters.graphHistCol[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistCol", 13);
      if (Settings.lastReadOK) controlParameters.graphHistCol[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRGBHistCol", 13);
      if (Settings.lastReadOK) controlParameters.graphRGBHistCol[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchRGBHistCol", 13);
      if (Settings.lastReadOK) controlParameters.graphRGBHistCol[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistType", 13);
      if (Settings.lastReadOK) controlParameters.graphHistType[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistType", 13);
      if (Settings.lastReadOK) controlParameters.graphHistType[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphLineCol", 13);
      if (Settings.lastReadOK) controlParameters.graphLineCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef1Col", 13);
      if (Settings.lastReadOK) controlParameters.graphRef1Col = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef2Col", 13);
      if (Settings.lastReadOK) controlParameters.graphRef2Col = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphGridCol", 13);
      if (Settings.lastReadOK) controlParameters.graphGridCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphBackCol", 13);
      if (Settings.lastReadOK) controlParameters.graphBackCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphLineActive", 0);
      if (Settings.lastReadOK) controlParameters.graphLineActive = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef1Active", 0);
      if (Settings.lastReadOK) controlParameters.graphRef1Active = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef2Active", 0);
      if (Settings.lastReadOK) controlParameters.graphRef2Active = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphGridActive", 0);
      if (Settings.lastReadOK) controlParameters.graphGridActive = keyValue;
   },

   // reset user defined options
   remove: function()
   {
      Settings.remove( KEYPREFIX );
   }
}


/*******************************************************************************
 * *****************************************************************************
 *
 * DEFINE GLOBAL STRETCH PARAMETERS
 *
 * These are the key parameters defining the stretch and are stored
 * in any process instance that is created.
 *
 * *****************************************************************************
 *******************************************************************************/

var stretchParameters = {
   ST: 0,      // stretch type
   D: 1.0,     // stretch amount
   b: 0.0,     // stretch intensity
   SP: 0.0,    // focus point
   HP: 1.0,    // highlight protection
   LP: 0.0,    // shadow protection
   BP: 0.0,    // black point
   CP: 0.0,    // clipping proportion
   channelSelector: new Array(false, false, false, true), // which channels to stretch
   createNewImage: false,
   targetView: undefined,

   // define a function (and its inverse) to convert the D parameter to a value for use in calculations
   convFacD: 1.0,
   convertD: function(D) { return Math.exp(this.convFacD * D) -1.0;},
   invConvertD: function(D) { return Math.ln(1.0 + D) / this.convFacD;},

   // define default values for each of the stretch parameters
   default_ST: 0,      // stretch type
   default_D: 0.0,     // stretch amount
   default_b: 0.0,     // stretch intensity
   default_SP: 0.0,    // focus point
   default_HP: 1.0,    // highlight protection
   default_LP: 0.0,    // shadow protection
   default_BP: 0.0,    // black point
   default_CP: 0.0,    // clipping proportion

   // define user friendly names for each parameter
   name_ST: "Stretch type (ST)",
   name_D: "Stretch factor (ln(D+1))",
   name_b: "Local stretch intensity (b)",
   name_SP: "Symmetry point (SP)",
   name_HP: "Highlight prot. point (HP)",
   name_LP: "Shadow prot. point (LP)",
   name_BP: "Black point (BP)",
   name_CP: "Clipping proportion (CP)",

   getStretchKey: function(includeCNI = false){
      var returnValue = ""

      returnValue += "ST:" + this.ST.toString();
      returnValue += ", D:" + this.D.toFixed(controlParameters.DPrecision);
      returnValue += ", b:" + this.b.toFixed(controlParameters.bPrecision);
      returnValue += ", SP:" + this.SP.toFixed(controlParameters.LPSPHPPrecision);
      returnValue += ", HP:" + this.HP.toFixed(controlParameters.LPSPHPPrecision);
      returnValue += ", LP:" + this.LP.toFixed(controlParameters.LPSPHPPrecision);
      returnValue += ", BP:" + this.BP.toFixed(controlParameters.BPCPPrecision);
      returnValue += ", CP:" + this.CP.toFixed(controlParameters.BPCPPrecision).toString();
      returnValue += ", Red:" + this.channelSelector[0].toString();
      returnValue += ", Green:" + this.channelSelector[1].toString();
      returnValue += ", Blue:" + this.channelSelector[2].toString();
      returnValue += ", RGB/K:" + this.channelSelector[3].toString();
      returnValue += ", TargetView:" + this.targetView.id;
      if (includeCNI) returnValue += ", CreateNewImage:"+ this.createNewImage.toString();

      return returnValue;
   },

   paramArrayFromStretchKey: function(sKey)
   {
      var a = sKey.split(", ");
      var b = new Array;
      var c = new Array;
      for (var i = 0; i < a.length; ++i) {b.push(a[i].split(":")[1]);}
      for (var i = 0; i < a.length; ++i)
      {
         if (i == 0) {c.push(b[i].toInt());}
         else if (i == 12) {c.push(b[i]);}
         else if (i < 8) {c.push(b[i].toDouble());}
         else {c.push(b[i].toBoolean());}
      }
      return c;
   },

   getParameterArray: function(all = false){
      var returnValue = new Array;
      returnValue.push(this.ST);
      returnValue.push(this.D);
      returnValue.push(this.b);
      returnValue.push(this.LP);
      returnValue.push(this.SP);
      returnValue.push(this.HP);
      returnValue.push(this.BP);
      if (all)
      {
         returnValue.push(this.CP);
         returnValue.push(this.channelSelector[0]);
         returnValue.push(this.channelSelector[1]);
         returnValue.push(this.channelSelector[2]);
         returnValue.push(this.channelSelector[3]);
         returnValue.push(this.targetView);
         returnValue.push(this.createNewImage);
      }
      return returnValue;
   },

   setParameterArray: function(spa, all = false)
   {
      this.ST = spa[0];
      this.D = spa[1];
      this.b = spa[2];
      this.LP = spa[3];
      this.SP = spa[4];
      this.HP = spa[5];
      this.BP = spa[6];
      if (all)
      {
         this.CP = spa[7];
         this.channelSelector[0] = spa[7];
         this.channelSelector[1] = spa[8];
         this.channelSelector[2] = spa[9];
         this.channelSelector[3] = spa[10];
         this.targetView = spa[11];
         this.createNewImage = spa[12];
      }

   },

   validateParameterArray: function(spa, correct = false)
   {
      var validST = Math.range(spa[0], 0, 9);
      var validD = Math.range(spa[1], controlParameters.DMin, controlParameters.DMax);
      var validb = Math.range(spa[2], controlParameters.bMin, controlParameters.bMax);
      var validLP = Math.range(spa[3], controlParameters.LPMin, controlParameters.LPMax);
      var validSP = Math.range(spa[4], controlParameters.SPMin, controlParameters.SPMax);
      var validHP = Math.range(spa[5], controlParameters.HPMin, controlParameters.HPMax);
      var validBP = Math.range(spa[6], controlParameters.BPMin, controlParameters.BPMax);

      var valid = true;
      if (spa[0] != validST){
         valid = false;
         if (correct) spa[0] = validST;}
      if (spa[1] != validD){
         valid = false;
         if (correct) spa[1] = validD;}
      if (spa[2] != validb){
         valid = false;
         if (correct) spa[2] = validb;}
      if (spa[3] != validLP){
         valid = false;
         if (correct) spa[3] = validLP;}
      if (spa[4] != validSP){
         valid = false;
         if (correct) spa[4] = validSP;}
      if (spa[5] != validHP){
         valid = false;
         if (correct) spa[5] = validHP;}
      if (spa[6] != validBP){
         valid = false;
         if (correct) spa[6] = validBP;}

      return valid;
   },

   reset: function() {
      stretchParameters.ST = stretchParameters.default_ST;
      stretchParameters.D = stretchParameters.default_D;
      stretchParameters.b = stretchParameters.default_b;
      stretchParameters.SP = stretchParameters.default_SP;
      stretchParameters.HP = stretchParameters.default_HP;
      stretchParameters.LP = stretchParameters.default_LP;
      stretchParameters.BP = stretchParameters.default_BP;
      stretchParameters.CP = stretchParameters.default_CP;
   },

   // stores the current parameter values into the script instance
   save: function() {
      Parameters.set("ST", stretchParameters.ST);
      Parameters.set("D", stretchParameters.D);
      Parameters.set("b", stretchParameters.b);
      Parameters.set("SP", stretchParameters.SP);
      Parameters.set("HP", stretchParameters.HP);
      Parameters.set("LP", stretchParameters.LP);
      Parameters.set("BP",stretchParameters.BP);
      Parameters.set("CP",stretchParameters.CP);
      Parameters.set("C0",stretchParameters.channelSelector[0]);
      Parameters.set("C1",stretchParameters.channelSelector[1]);
      Parameters.set("C2",stretchParameters.channelSelector[2]);
      Parameters.set("C3",stretchParameters.channelSelector[3]);
      Parameters.set("createNewImage",stretchParameters.createNewImage);
   },

   // loads the script instance parameters
   load: function() {
      if (Parameters.has("ST")) stretchParameters.ST = Parameters.getReal("ST");
      if (Parameters.has("D")) stretchParameters.D = Parameters.getReal("D");
      if (Parameters.has("b")) stretchParameters.b = Parameters.getReal("b");
      if (Parameters.has("SP")) stretchParameters.SP = Parameters.getReal("SP");
      if (Parameters.has("HP")) stretchParameters.HP = Parameters.getReal("HP");
      if (Parameters.has("LP")) stretchParameters.LP = Parameters.getReal("LP");
      if (Parameters.has("BP")) stretchParameters.BP = Parameters.getReal("BP");
      if (Parameters.has("CP")) stretchParameters.CP = Parameters.getReal("CP");
      if (Parameters.has("C0")) stretchParameters.channelSelector[0] = Parameters.getBoolean("C0");
      if (Parameters.has("C1")) stretchParameters.channelSelector[1] = Parameters.getBoolean("C1");
      if (Parameters.has("C2")) stretchParameters.channelSelector[2] = Parameters.getBoolean("C2");
      if (Parameters.has("C3")) stretchParameters.channelSelector[3] = Parameters.getBoolean("C3");
      if (Parameters.has("createNewImage")) stretchParameters.createNewImage = Parameters.getBoolean("createNewImage");
   }
}

/*******************************************************************************
 * *****************************************************************************
 *
 * DEFINE GLOBAL HISTOGRAM ARRAY
 *
 * This stores key information relating to the histograms for the current
 * targetView (index 0) and potentially the stretched view if this has been
 * generated (index 1).
 *
 * *****************************************************************************
 *******************************************************************************/
var histArray = [new ghsHist, new ghsHist];

function ghsHist() {
   //per array
   this.channels = [new ghsHistChannel(), new ghsHistChannel(), new ghsHistChannel()];
   this.channelCount = 1;

   this.refresh = function(view)
   {
      if (view.id != "")
      {
         this.channelCount = 1;
         if (view.image.isColor) this.channelCount = 3;

         for (var channel = 0; channel < this.channelCount; ++channel)
         {
            this.channels[channel].refresh(view, channel);
         }
      }
   }
}

function ghsHistChannel() {
   this.data = new Array;
   this.cumData = new Array;
   this.peaks = new Array;
   this.peakToTrough = 2;
   this.maxCount = 0;
   this.maxLevel = 0;
   this.totalCount = 0;
   this.resolution = 0;
   this.lastZero = 0;
   this.lastNonZero = 0;
   this.quantile1000 = new Array;

   this.refresh = function(view, channel)
   {
      if (view.id != "")
      {
         var H0 = view.computeOrFetchProperty("Histogram16");
         var H = H0.toArray();
         var r = Math.pow2(16);

         if ((H.length > 0) && (channel < H0.rows))
         {
            // store histogram array data
            this.data = H.slice(r * channel, r * (channel + 1));
            this.totalCount = Math.sum(this.data);
            this.resolution = this.data.length;

            // some initial variables
            this.cumData = new Array;
            var nextQuantile1000 = 0;
            this.maxCount = 0;
            this.maxLevel = 0;

            this.cumData[0] = this.data[0]
            this.lastZero = 0;
            this.lastNonZero = 0;
            this.quantile100 = [0];

            // iterate through the data
            for (var i = 1; i < r; ++i)
            {

               this.cumData[i] = this.data[i] + this.cumData[i - 1];             //cumulative data array
               if (this.cumData[i] == 0) this.lastZero = i;                      //find last zero level
               if (this.data[i] > 0) this.lastNonZero = i;                       //find last non-zero level
               if (this.cumData[i] >= this.totalCount * nextQuantile1000)        //find quantile 1000s
               {
                  this.quantile1000.push(i);
                  nextQuantile1000 += .001;
               }
               if (this.data[i] > this.maxCount)                                 //find the maximum value
               {
                  this.maxCount = this.data[i];
                  this.maxLevel = i;
               }
            }
         }
      }
   }
}



/*******************************************************************************
 * *****************************************************************************
 *
 * DEFINE VIEWS
 *
 * This is used to hold views for use in the image inspection dialog
 *
 * *****************************************************************************
 *******************************************************************************/

var ghsViews = {

   views: new Array,
   images: new Array,

   getView: function(i){
      if (this.views[i] == undefined)
      {
         switch (i)
         {
            case 0:
               {
                  this.views[0] =  stretchParameters.targetView;
                  return this.views[0];
               }
            case 1:
               {
                  var stretch = calculateStretch();

                  var expr = ["", "", "", ""];
                  if (stretchParameters.channelSelector[3]) {expr[3] = stretch[0];}
                  else{
                     expr = ["$T", "$T", "$T", ""]
                     if (stretchParameters.channelSelector[0]) {expr[0] = stretch[0];}
                     if (stretchParameters.channelSelector[1]) {expr[1] = stretch[0];}
                     if (stretchParameters.channelSelector[2]) {expr[2] = stretch[0];}
                  }
                  expr[4] = stretch[1];

                  Console.show();
                  this.views[1] = applyStretch(stretchParameters.targetView, expr, "_ghsImage", false);
                  Console.hide();
                  histArray[1].refresh(this.views[1]);
                  processEvents();
                  return this.views[1];
               }
            case 2:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(0), true);
                  this.views[2] = applyStretch(this.getView(0), expr, "_ghsImage", false);
                  Console.hide();
                  return this.views[2];
               }
            case 3:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(1), true);
                  this.views[3] = applyStretch(this.getView(1), expr, "_ghsImage", false);
                  Console.hide();
                  return this.views[3];
               }
            case 4:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(0), false);
                  this.views[4] = applyStretch(this.getView(0), expr, "_ghsImage", false);
                  Console.hide();
                  return this.views[4];
               }
            case 5:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(1), false);
                  this.views[5] = applyStretch(this.getView(1), expr, "_ghsImage", false);
                  Console.hide();
                  return this.views[5];
               }
         }
      }
      return this.views[i];
   },

   getImage: function(i){
      if (this.images[i] == undefined) {this.images[i] = this.getView(i).image.render();}
      return this.images[i];
   },

   clear: function(){
      this.tidyUp();
      this.views = new Array;
      this.images = new Array;
   },

   tidyUp: function(){
      // close any copy views no longer needed (note view 0 is the targetView)
      for (var i = 1; i < this.views.length; ++i)
      {
         if (!(this.views[i] == undefined))
         {
            this.views[i].window.forceClose();
            this.views[i] = undefined;
         }
      }
   }

}

/*******************************************************************************
 * *****************************************************************************
 *
 * DEFINE GLOBAL STRETCH LOG
 *
 * This stores information about stretches performed in the current session.
 *
 *
 *
 * *****************************************************************************
 *******************************************************************************/


var ghsStretchLog = new stretchLog();

function stretchLog()
{
   this.items = new Array;
   this.itemCount = function() {return this.items.length;}

   this.findItem = function(imageId)
   {
      var findItem = -1;
      for (var i = 0; i < this.itemCount(); ++i)
      {
         if (this.items[i].imageId == imageId) findItem = i;
      }
      return findItem;
   }

   this.hasItem = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (itemIndex < 0) {return false;}
      else {return true;}
   }

   this.add = function(imageId, stretch)
   {
      var itemIndex = this.findItem(imageId);
      if (itemIndex < 0)
      {
         itemIndex = this.itemCount();
         var creationDate = new Date;
         var timeStamp = creationDate.toLocaleTimeString() + ": ";
         this.items.push(new stretchLogItem(imageId, timeStamp + stretch));
      }
      else
      {
         this.items[itemIndex].add(stretch);
      }
   }

   this.undo = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (!(itemIndex < 0))
      {
         if (this.items[itemIndex].nextIndex > 1) {this.items[itemIndex].nextIndex -= 1;}
         else {this.items[itemIndex].historyIndex -= 1;}
      }
   }

   this.redo = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (!(itemIndex < 0))
      {
         var loggedStretchesAvailable = (this.items[itemIndex].nextIndex < this.items[itemIndex].stretchCount());
         var backHistoryAvailable = (this.items[itemIndex].historyIndex < Math.min(0, this.items[itemIndex].maxHistoryIndex));

         if  (loggedStretchesAvailable && !backHistoryAvailable) {this.items[itemIndex].nextIndex += 1;}
         else {this.items[itemIndex].historyIndex += 1;}
      }
   }

}

function stretchLogItem(imageId, stretch)
{
   this.stretchData = [stretch];
   this.imageId = imageId;
   this.stretchCount = function() {return this.stretchData.length;}
   this.nextIndex = 1;
   this.historyIndex = 0;
   this.maxHistoryIndex = 999;

   this.stretches = function(i)
   {
      var returnValue = this.stretchData[i]
      if (i == 0)
      {
         var initialImageHistoryIndex = this.historyIndex - this.nextIndex;
         if (this.historyIndex < 0) returnValue += " - rolled back to history index: " + this.historyIndex.toString();
         if (this.historyIndex > 0) returnValue += " - rolled forward to history index: +" + this.historyIndex.toString();
      }
      return returnValue;
   }


   this.add = function(stretch)
   {
      var creationDate = new Date;
      var timeStamp = creationDate.toLocaleTimeString() + ": ";
      this.stretchData[this.nextIndex] = timeStamp + stretch;
      this.nextIndex += 1;
      this.maxHistoryIndex = this.historyIndex;
   }
}




/*******************************************************************************
 * *****************************************************************************
 *
 * CALCULATE STRETCH -
 *
 * This function has a two fold purpose:
 *
 * If no input parameter is specified it builds the PixelMath expression
 * required to implement the stretch using the global stretchParameters.
 *
 * If input parameters are specified it will apply the stretch
 * transformation to the range of values defined by the input parameters.
 * In this case it will return an array of stretch values.
 *
 * *****************************************************************************
 *******************************************************************************/

function calculateStretch( startValue, step, endValue )
 {

   //--------------------------------------------------------------------
   // Check whether the function is being run in expression or value mode|
   //--------------------------------------------------------------------
   var mode = "value";
   if (startValue === undefined) mode = "expression";

   var returnSingleValue = false;
   if (step === undefined)
   {
      step = 1;
      endValue = startValue;
      returnSingleValue = true
   }

   var stepCount = 1 + Math.floor((endValue - startValue) / step);

   //-------------------------------------------------------------------------------
   // Initialise some variables that will be used to build the PixelMath expressions|
   //-------------------------------------------------------------------------------
   var ST = stretchParameters.ST;
   var orgD = stretchParameters.D;
   var D = stretchParameters.convertD(orgD);
   var B = stretchParameters.b;
   var SP = stretchParameters.SP;
   var LP = stretchParameters.LP;
   var HP = stretchParameters.HP;
   var BP = stretchParameters.BP;
   var CP = stretchParameters.CP; // we actually use BP rather than CP in this function

   var LPT = 0.0;
   var HPT = 0.0;
   var SPT = 0.0;
   var qor = 0.0;
   var q0 = 0.0;
   var qwp = 0.0;
   var qlp = 0.0;
   var q1 = 0.0;
   var q = 0.0;
   var m = 0.0;
   var a1 = 0.0, a2 = 0.0, a3 = 0.0, a4 = 0.0;
   var b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0;
   var c1 = 0.0, c2 = 0.0, c3 = 0.0, c4 = 0.0;
   var d1 = 0.0, d2 = 0.0, d3 = 0.0, d4 = 0.0;
   var e1 = 0.0, e2 = 0.0, e3 = 0.0, e4 = 0.0;
   var returnValues = new Array;

   var exp1 = "";  // Will hold PixelMath expression if x < LP
   var exp2 = "";  // Will hold PixelMath expression if x < SP
   var exp3 = "";  // Will hold PixelMath expression if SP <= x <= HP
   var exp4 = "";  // Will hold PixelMath expression if x > HP

   var vStr1 = ""; // Will hold variables used in exp 1
   var vStr2 = ""; // Will hold variables used in exp 2
   var vStr3 = ""; // Will hold variables used in exp 3
   var vStr4 = ""; // Will hold variables used in exp 4

   //--------------------------------------------------------
   //Set up the string that will hold the PixelMath equations|
   //--------------------------------------------------------
   var xStr ="x = $T;";

   //--------------------------------------------------------------------
   //Set up the string that will hold all variables used in the equations|
   //--------------------------------------------------------------------
   var vStr = "x";
   vStr += ", ST = " + ST.toString();
   vStr += ", D = " + orgD.toString();
   vStr += ", b = " + B.toString();
   vStr += ", LP = " + LP.toString();
   vStr += ", SP = " + SP.toString();
   vStr += ", HP = " + HP.toString();
   vStr += ", BP = " + BP.toString();


   //--------------------------------------------------------------
   // STRETCHES: TABLE OF CONTENTS
   //
   // Special cases
   // 0. ST = 4: Image inversion
   // 1. ST = 3: Linear prestretch
   // 2. D = 0: No stretch
   //
   // Stretch types
   // 3. ST = 0: Generalised Hyperbolic
   // 3a1. ST = 0, b = -1: Logarithmic
   // 3a2. ST = 5, b = -1: Inverse Logarithmic
   // 3b1. ST = 0, b < 0: Integral
   // 3b2. ST = 5, b < 0: Inverse Integral
   // 3c1. ST = 0, b = 0: Exponential
   // 3c2. ST = 5, b = 0: Inverse Exponential
   // 3d1. ST = 0, b > 1: Hyperbolic, Harmonic, Super-hyperbolic
   // 3d2. ST = 5, b > 1: Inverse Hyperbolic, Harmonic, Super-hyperbolic
   // 4. ST = 1: Traditional histogram transformation
   // 5. ST = 2: Arcsinh stretch

   //-------------------------------------------------------------------
   // 0. If stretch is image inversion (ST = 4)|
   //-------------------------------------------------------------------

   if (ST == 4)
   {
      if (mode == "value")
      {
         for (var i = 0; i < stepCount; ++i) { returnValues.push(1.0 - (startValue + i * step)); }
         if (returnSingleValue) {return returnValues[0];}
         else {return returnValues;}
      }
      if (mode == "expression") return [xStr + "1 - x;", vStr];
   }


   //-------------------------------------------------------------------
   // 1. If stretch is just a linear stretch to new black point (ST = 3)|
   //-------------------------------------------------------------------

   if (ST == 3)
   {
      if (BP == 1.0)
      {
         if (mode == "value")
         {
            for (var i = 0; i < stepCount; ++i) { returnValues.push(0.0); }
            if (returnSingleValue) {return returnValues[0];}
            else {return returnValues;}
         }
         else
         {
            return ["0.0", ""];
         }
      }
      else
      {
         if (mode == "expression")
         {
            xStr = "max(0,($T-BP)/(1-BP))";
            vStr = "BP = " + BP.toString();
            return [xStr, vStr];
         }
         if (mode == "value")
         {
            for (var i = 0; i < stepCount; ++i)
            {
               var x = (startValue + i * step);
               var r = Math.max(0, (x - BP) / (1.0 - BP));
               returnValues.push(r);
            }
            if (returnSingleValue) {return returnValues[0];}
            else {return returnValues;}
         }
      }
   }

   //------------------------------------------------------------------------------------------------------------
   // 2. NO STRETCH: If there is no stretch amount then just return the input value, pre-stretched if appropriate|
   //------------------------------------------------------------------------------------------------------------
   if (D == 0.0)
   {
      if (mode == "value")
      {
         for (var i = 0; i < stepCount; ++i) { returnValues.push(startValue + i * step); }
         if (returnSingleValue) {return returnValues[0];}
         else {return returnValues;}
      }
      if (mode == "expression") return [xStr + "x;", vStr];
   }


   //--------------------------------
   //From here on we deal with D != 0|
   //--------------------------------
   if (D != 0.0)
   {

      //-------------------------------------
      // 3. Generalised Hyperbolic - (ST = 0)|
      //-------------------------------------
      if (ST == 0  || ST==5)
      {
         //-------------------------------
         // 3a. GHS Logarithmic - (b = -1)|
         //-------------------------------
         if (B == -1.0)
         {
            B = -B;
            qlp = -1.0*Math.log(1.0 + D * (SP - LP)) ;
            q0 = qlp - D * LP / (1.0 + D * (SP - LP));
            qwp = Math.log(1.0 + D * (HP - SP)) ;
            q1 = qwp + D * (1.0 - HP) / (1.0 + D * (HP - SP));
            q = 1.0 / (q1 - q0);

            //----------------------------------------
            // 3a1. GHS Logarithmic - (ST = 0, b = -1)|
            //----------------------------------------
            if (ST == 0 )
            {
               LPT=LP;
               SPT=SP;
               HPT=HP;
               // build expression for x < LP
               b1 = D / (1.0 + D * (SP - LP)) * q;
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for x < SP
               a2 = (-q0) * q;
               b2 = -q ;
               c2 = 1.0 + D * SP
               d2 = -D;
               if (mode == "expression") {
                  exp2 = "a2 + b2 *ln(c2 + d2 * x)";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();}

               // build expression for SP <= x <= HP
               a3 = (-q0) * q;
               b3 = q ;
               c3 = 1.0 - D * SP;
               d3 = D;
               if (mode == "expression") {
                  exp3 = "a3 + b3 *ln(c3 + d3 * x)";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();}

               // build expression for x > HP
               a4 = (qwp - q0 - D * HP / (1.0 + D * (HP - SP))) * q;
               b4 = q * D / (1.0 + D * (HP - SP));
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LP) {r = b1 * x;}
                     else if  (x < SP) {r = a2 + b2 * Math.log(c2 + d2 * x);}
                     else if  (x < HP) {r = a3 + b3 * Math.log(c3 + d3 * x);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            else
            //------------------------------------------------
            // 3a2. GHS Inverse Logarithmic - (ST = 5, b = -1)|
            //------------------------------------------------
            {
               LPT=(qlp-q0)*q;
               SPT=-q0*q;
               HPT=(qwp-q0)*q;
               // build expression for x < LPT
               b1 = (1.0 + D * (SP - LP)) / (D * q);
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for x < SPT
               a2 = (1 + D * SP) / D ;
               b2 = -1 / D ;
               c2 = -q0 ;
               d2 = -1/q ;
               if (mode == "expression") {
                  exp2 = "a2 + b2 *exp(c2 + d2 * x)";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();}

               // build expression for SPT <= x <= HPT

               a3 = - (1 - D * SP)/ D ;
               b3 = 1 / D ;
               c3 = q0 ;
               d3 = 1 / q ;
               if (mode == "expression") {
                  exp3 = "a3 + b3 *exp(c3 + d3 * x)";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();}

               // build expression for x > qwp

               a4 = HP + (q0-qwp) * (1+D*(HP-SP))/D ;
               b4 = (1 + D * (HP - SP) )/(q * D) ;
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LPT) {r = b1 * x;}
                     else if  (x < SPT) {r = a2 + b2 * Math.exp(c2 + d2 * x);}
                     else if  (x < HPT) {r = a3 + b3 * Math.exp(c3 + d3 * x);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            B = -B;
         }

         //---------------------------
         // 3b. GHS Integral - (b < 0)|
         //---------------------------
         if ( (B != -1.0) && (B < 0.0) )
         {
            B = -B;
            qlp = (1.0 - Math.pow((1.0 + D * B * (SP - LP)), (B - 1.0) / B)) / (B - 1);
            q0 = qlp - D * LP * (Math.pow((1.0 + D * B * (SP - LP)), - 1.0 / B));
            qwp = (Math.pow((1.0 + D * B * (HP - SP)), (B - 1.0) / B) - 1.0) / (B - 1);
            q1 = qwp + D * (1.0 - HP) * (Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B));
            q = 1.0 / (q1 - q0);

            //------------------------------------
            // 3b1. GHS Integral - (ST = 0, b < 0)|
            //------------------------------------
            if (ST==0)
            {
               LPT=LP;
               SPT=SP;
               HPT=HP;

            // build expression for x < LP
               b1 = D * Math.pow(1.0 + D * B * (SP - LP), -1.0 / B) * q;
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for LP <= x < SP
               a2 = (1/(B-1)-q0) * q;
               b2 = -q/(B-1);
               c2 = 1.0 + D * B * SP;
               d2 = -D * B;
               e2 = (B - 1.0) / B;
               if (mode == "expression") {
                  exp2 = "a2 + b2 * (c2 + d2 * x) ^ e2";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();
                  vStr2 += ", " + "e2 = " + e2.toString();}

               // build expression for SP <= x <= HP
               a3 = (-1/(B - 1) - q0) * q;
               b3 = q/(B-1) ;
               c3 = 1.0 - D * B * SP
               d3 = D * B;
               e3 = (B - 1.0) / B;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * (c3 + d3 * x) ^ e3";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();
                  vStr3 += ", " + "e3 = " + e3.toString();}

               // build expression for x > HP
               a4 = (qwp - q0 - D * HP * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B)) * q;
               b4 = D * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B) * q;
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LP) {r = b1 * x;}
                     else if  (x < SP) {r = a2 + b2 * Math.pow((c2 + d2 * x), e2);}
                     else if  (x < HP) {r = a3 + b3 * Math.pow((c3 + d3 * x), e3);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            else
            //--------------------------------------------
            // 3b2. GHS Inverse Integral - (ST = 5, b < 0)|
            //--------------------------------------------
            {
               LPT=(qlp-q0)*q;
               SPT=-q0*q;
               HPT=(qwp-q0)*q;
            // build expression for x < (qlp-q0)*q
               b1 = Math.pow(1.0 + D * B * (SP - LP), 1.0 / B) / (q * D);
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for (qlp-q0)*q <= x < -q0*q
               a2 = (1.0 + D * B * SP)/ (D * B) ;
               b2 = -1.0 / (D * B);
               c2 = -q0*(B-1) + 1;
               d2 = (1-B)/q ;
               e2 = B / (B-1.0);

               if (mode == "expression") {
                  exp2 = "a2 + b2 * (c2 + d2 * x) ^ e2";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();
                  vStr2 += ", " + "e2 = " + e2.toString();}

               // build expression for -q0*q <= x <= (qwp-q0)*q
               a3 = (D * B * SP - 1)/(D * B);
               b3 = 1/(D * B);
               c3 = 1 + q0 * (B - 1) ;
               d3  = (B-1)/q
               e3 = B / (B-1.0) ;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * (c3 + d3 * x) ^ e3";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();
                  vStr3 += ", " + "e3 = " + e3.toString();}

               // build expression for x > (qwp-q0)*q

               a4 = (q0-qwp)/(D * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B))+HP;
               b4 = 1 / (D * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B) * q) ;
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LPT) {r = b1 * x;}
                     else if  (x < SPT) {r = a2 + b2 * Math.pow((c2 + d2 * x), e2);}
                     else if  (x < HPT) {r = a3 + b3 * Math.pow((c3 + d3 * x), e3);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            B = -B
         }

         //------------------------------
         // 3c. GHS Exponential - (b = 0)|
         //------------------------------
         if (B == 0.0)
         {
            qlp = Math.exp(-D * (SP - LP));
            q0 = qlp - D * LP * Math.exp(-D*(SP - LP));
            qwp = 2.0 - Math.exp(-D * (HP - SP));
            q1 = qwp + D * (1.0 - HP) * Math.exp(-D * (HP - SP));
            q = 1.0 / (q1 - q0);

            //---------------------------------------
            // 3c1. GHS Exponential - (ST = 0, b = 0)|
            //---------------------------------------
            if (ST==0)
            {
               LPT=LP;
               SPT=SP;
               HPT=HP;
            // build expression for x < LP
               a1 = 0.0;
               b1 = D * Math.exp(-D * (SP - LP)) * q;
               if (mode == "expression") {
                  exp1 = "a1 + (b1 * x)";
                  vStr1 += ", " + "a1 = " + a1.toString();
                  vStr1 += ", " + "b1 = " + b1.toString();}

            // build expression for LP <= x < SP
               a2 = -q0 * q;
               b2 = q;
               c2 = -D * SP;
               d2 = D;
               if (mode == "expression") {
                  exp2 = "a2 + b2 * exp(c2 + d2 * x)";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();}

               // build expression for SP <= x <= HP
               a3 = (2.0 - q0) * q;
               b3 = -q;
               c3 = D * SP;
               d3 = -D;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * exp(c3 + d3 * x)";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();}

            // build expression for x > HP
               a4 = (qwp - q0 - D * HP * Math.exp(-D * (HP - SP))) * q;
               b4 = D * Math.exp(-D * (HP - SP)) * q;
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LP) {r = a1 + b1 * x;}
                     else if  (x < SP) {r = a2 + b2 * Math.exp(c2 + d2 * x);}
                     else if  (x < HP) {r = a3 + b3 * Math.exp(c3 + d3 * x);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            else
            //-----------------------------------------------
            // 3c2. GHS Inverse Exponential - (ST = 5, b = 0)|
            //-----------------------------------------------
            {
               LPT=(qlp-q0)*q;
               SPT=(1-q0)*q;
               HPT=(qwp-q0)*q;
            // build expression for x < LP

               a1 = 0.0;
               b1 = 1/(D * Math.exp(-D * (SP - LP)) * q);
               if (mode == "expression") {
                  exp1 = "a1 + (b1 * x)";
                  vStr1 += ", " + "a1 = " + a1.toString();
                  vStr1 += ", " + "b1 = " + b1.toString();}

            // build expression for LP <= x < SP
               a2 = SP;
               b2 = 1 / D;
               c2 = q0;
               d2 = 1/q;
               if (mode == "expression") {
                  exp2 = "a2 + b2 * ln(c2 + d2 * x)";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();}

               // build expression for SP <= x <= HP
               a3 = SP;
               b3 = -1/D;
               c3 = (2.0-q0);
               d3 = -1/q;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * ln(c3 + d3 * x)";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();}

            // build expression for x > HP
               a4 = (q0 - qwp)/(D * Math.exp(-D * (HP - SP))) + HP;
               b4 = 1/(D * Math.exp(-D * (HP - SP)) * q);
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LPT) {r = a1 + b1 * x;}
                     else if  (x < SPT) {r = a2 + b2 * Math.log(c2 + d2 * x);}
                     else if  (x < HPT) {r = a3 + b3 * Math.log(c3 + d3 * x);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
         }

         //--------------------------------------
         // 3d. GHS Hyperbolic/Harmonic - (b > 0)|
         //--------------------------------------
         if (B > 0.0)
         {
            qlp = Math.pow((1 + D * B * (SP - LP)), -1.0 / B);
            q0 = qlp - D * LP * Math.pow((1 + D * B * (SP - LP)), -(1.0 + B) / B);
            qwp = 2.0 - Math.pow(1.0 + D * B * (HP - SP), -1.0 / B);
            q1 = qwp + D * (1.0 - HP) * Math.pow((1.0 + D * B * (HP - SP)), -(1.0 + B) / B);
            q = 1.0 / (q1 - q0);

            //-----------------------------------------------
            // 3d1. GHS Hyperbolic/Harmonic - (ST = 0, b > 0)|
            //-----------------------------------------------
            if (ST==0)
            {
               LPT=LP;
               SPT=SP;
               HPT=HP;
               // build expression for x < LP
               b1 = D * Math.pow((1 + D * B * (SP - LP)), -(1.0 + B) / B) * q;
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for LP <= x < SP
               a2 = -q0 * q;
               b2 = q;
               c2 = 1.0 + D * B * SP;
               d2 = -D * B;
               e2 = -1.0 / B;
               if (mode == "expression") {
                  exp2 = "a2 + b2 * (c2 + d2 * x) ^ e2";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();
                  vStr2 += ", " + "e2 = " + e2.toString();}

               // build expression for SP <= x <= HP
               a3 = (2.0 - q0) * q;
               b3 = -q;
               c3 = 1.0 - D * B * SP;
               d3 = D * B;
               e3 = -1.0 / B;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * (c3 + d3 * x) ^ e3";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();
                  vStr3 += ", " + "e3 = " + e3.toString();}


               // build expression for x > HP
               a4 = (qwp - q0 - D * HP * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B)) * q;
               b4 = (D * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B)) * q;
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LP) {r = b1 * x;}
                     else if  (x < SP) {r = a2 + b2 * Math.pow((c2 + d2 * x), e2);}
                     else if  (x < HP) {r = a3 + b3 * Math.pow((c3 + d3 * x), e3);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
            else
            //-------------------------------------------------------
            // 3d2. GHS Inverse Hyperbolic/Harmonic - (ST = 5, b > 0)|
            //-------------------------------------------------------
            {
               LPT=(qlp-q0)*q;
               SPT=(1-q0)*q;
               HPT=(qwp-q0)*q;
               // build expression for x < LP
               b1 = 1/(D * Math.pow((1 + D * B * (SP - LP)), -(1.0 + B) / B) * q);
               if (mode == "expression") {
                  exp1 = "b1 * x";
                  vStr1 += ", " + "b1 = " + b1.toString();}

               // build expression for LPT <= x < SPT
               a2 = 1/(D * B) + SP;
               b2 = -1/(D * B);
               c2 = q0;
               d2 = 1/q;
               e2 = -B;
               if (mode == "expression") {
                  exp2 = "a2 + b2 * (c2 + d2 * x) ^ e2";
                  vStr2 += ", " + "a2 = " + a2.toString();
                  vStr2 += ", " + "b2 = " + b2.toString();
                  vStr2 += ", " + "c2 = " + c2.toString();
                  vStr2 += ", " + "d2 = " + d2.toString();
                  vStr2 += ", " + "e2 = " + e2.toString();}

               // build expression for SPT <= x <= HPT
               a3 = -1/(D * B) + SP;
               b3 = 1/(D * B);
               c3 = (2.0-q0);
               d3 = -1/q;
               e3 = -B;
               if (mode == "expression") {
                  exp3 = "a3 + b3 * (c3 + d3 * x) ^ e3";
                  vStr3 += ", " + "a3 = " + a3.toString();
                  vStr3 += ", " + "b3 = " + b3.toString();
                  vStr3 += ", " + "c3 = " + c3.toString();
                  vStr3 += ", " + "d3 = " + d3.toString();
                  vStr3 += ", " + "e3 = " + e3.toString();}

               // build expression for x > HPT

               a4 = (q0-qwp)/(D * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B))+HP;
               b4 = 1/((D * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B)) * q);
               if (mode == "expression") {
                  exp4 = "a4 + b4 * x";
                  vStr4 += ", " + "a4 = " + a4.toString();
                  vStr4 += ", " + "b4 = " + b4.toString();}

               if (mode == "value")
               {
                  for (var i = 0; i < stepCount; ++i)
                  {
                     var r;
                     var x = (startValue + i * step);
                     if       (x < LPT) {r = b1 * x;}
                     else if  (x < SPT) {r = a2 + b2 * Math.pow((c2 + d2 * x), e2);}
                     else if  (x < HPT) {r = a3 + b3 * Math.pow((c3 + d3 * x), e3);}
                     else              {r = a4 + b4 * x;}
                     returnValues.push(r);
                  }
               }
            }
         }
      }



      //---------------------------------------------------------------
      // 4. If stretch is traditional histogram transformation (ST = 1)|
      //---------------------------------------------------------------

      if ( ST == 1 ) // Classic Histogram / STF Stretch - b is not used
      {
         m = 1 / (2 * (D + 1));
         qlp = (m - 1) * (LP - SP) / ((1 - 2 * m)*(LP - SP) - m);
         q0 =  qlp + LP * (m - 1) * m * Math.pow((1 - 2 * m)*(LP - SP) - m, -2);
         qwp = (m - 1) * (HP - SP) / ((2 * m - 1) * (HP - SP) - m);
         q1 =  qwp + (HP - 1) * (m - 1) * m * Math.pow((2 * m - 1)*(HP - SP) - m, -2);
         q = 1.0 / (q1 - q0);
         LPT=LP;
         SPT=SP;
         HPT=HP;

         // build expression for x < LP
         a1 = 0.0;
         b1 = m * (1 - m) * Math.pow((1 - 2 * m)*(LP - SP) - m, -2) * q;
         if (mode == "expression") {
            exp1 = "a1 + b1 * x";
            vStr1 += ", " + "a1 = " + a1.toString();
            vStr1 += ", " + "b1 = " + b1.toString();}

         // build expression for LP <= x <= SP
         a2 = -q0 * q;
         b2 = (m-1) * q;
         c2 = b2 * (-SP);
         d2 = (1 - 2 * m);
         e2 = -d2 * SP - m;
         if (mode == "expression") {
            exp2 = "a2 + (b2 * x + c2)/(d2 * x + e2)"
            vStr2 += ", " + "a2 = " + a2.toString();
            vStr2 += ", " + "b2 = " + b2.toString();
            vStr2 += ", " + "c2 = " + c2.toString();
            vStr2 += ", " + "d2 = " + d2.toString();
            vStr2 += ", " + "e2 = " + e2.toString();}

         // build expression for LP <= x <= SP
         a3 = -q0 * q;
         b3 = (m - 1) * q;
         c3 = b3 * (-SP);
         d3 = (2 * m - 1);
         e3 = -d3 * SP - m;
         if (mode == "expression") {
            exp3 = "a3 + (b3 * x + c3)/(d3 * x + e3)";
            vStr3 += ", " + "a3 = " + a3.toString();
            vStr3 += ", " + "b3 = " + b3.toString();
            vStr3 += ", " + "c3 = " + c3.toString();
            vStr3 += ", " + "d3 = " + d3.toString();
            vStr3 += ", " + "e3 = " + e3.toString();}

         // build expression for x > HP
         a4 = (qwp - HP * (1 - m) * m * Math.pow((2 * m - 1)*(HP - SP) - m, -2) - q0) * q;
         b4 = -m * (m - 1) * Math.pow((2 * m - 1)*(HP - SP) - m, -2) * q;
         if (mode == "expression") {
            exp4 = "a4 + b4 * x";
            vStr4 += ", " + "a4 = " + a4.toString();
            vStr4 += ", " + "b4 = " + b4.toString();}

         if (mode == "value")
         {
            for (var i = 0; i < stepCount; ++i)
            {
               var r;
               var x = (startValue + i * step);
               if       (x < LP) {r = a1 + b1 * x;}
               else if  (x < SP) {r = a2 + (b2 * x + c2)/(d2 * x + e2);}
               else if  (x < HP) {r = a3 + (b3 * x + c3)/(d3 * x + e3);}
               else              {r = a4 + b4 * x;}
               returnValues.push(r);
            }
         }
      }


      //--------------------------------------------------
      // 5. If stretch is  arcsinh transformation (ST = 2)|
      //--------------------------------------------------

      if (ST == 2)
      {
         qlp = - Math.ln(D * (SP - LP) + Math.pow((D * D * (SP - LP) * (SP - LP) + 1),0.5));
         q0 = qlp - LP * D * Math.pow((D * D * (SP - LP) * (SP - LP) + 1),-0.5);
         qwp = Math.ln(D * (HP - SP) + Math.pow((D * D * (HP - SP)*(HP - SP) + 1),0.5));
         q1 = qwp + (1.0 - HP) * D * Math.pow((D * D * (HP - SP) * (HP - SP) + 1),-0.5);
         q = 1.0 / (q1 - q0);
         LPT=LP;
         SPT=SP;
         HPT=HP;

         // build expression for x < LP
         a1 = 0.0;
         b1 = D * Math.pow((D * D * (SP - LP) * (SP - LP) + 1),-0.5) * q;
         if (mode == "expression") {
            exp1 = "b1 * x";
            vStr1 += ", " + "b1 = " + b1.toString();}

         // build expression for LP <= x < SP
         a2 = -q0 * q;
         b2 = q;
         c2 = -D;
         d2 = D * D;
         e2 = SP;
         if (mode == "expression") {
            exp2 = "a2 - b2 * ln(c2 * (x - e2) + (d2 * (x - e2) * (x - e2) + 1) ^ 0.5)";
            vStr2 += ", " + "a2 = " + a2.toString();
            vStr2 += ", " + "b2 = " + b2.toString();
            vStr2 += ", " + "c2 = " + c2.toString();
            vStr2 += ", " + "d2 = " + d2.toString();
            vStr2 += ", " + "e2 = " + e2.toString();}

         // build expression for SP <= x <= HP
         a3 = -q0 * q;
         b3 = q;
         c3 = D;
         d3 = D * D;
         e3 = SP;
         if (mode == "expression") {
            exp3 = "a3 + b3 * ln(c3 * (x - e3) + (d3 * (x - e3) * (x - e3) + 1) ^ 0.5)";
            vStr3 += ", " + "a3 = " + a3.toString();
            vStr3 += ", " + "b3 = " + b3.toString();
            vStr3 += ", " + "c3 = " + c3.toString();
            vStr3 += ", " + "d3 = " + d3.toString();
            vStr3 += ", " + "e3 = " + e3.toString();}

         // build expression for x > HP
         a4 = (qwp - HP * D * Math.pow((D * D * (HP - SP)* (HP - SP) + 1), -0.5) - q0) * q;
         b4 = D *  Math.pow((D * D * (HP - SP) * (HP - SP) + 1), -0.5) * q ;
         if (mode == "expression") {
            exp4 = "a4 + b4 * x";
            vStr4 += ", " + "a4 = " + a4.toString();
            vStr4 += ", " + "b4 = " + b4.toString();}

         if (mode == "value")
         {
            for (var i = 0; i < stepCount; ++i)
            {
               var r;
               var x = (startValue + i * step);
               if       (x < LP) {r = b1 * x;}
               else if  (x < SP) {r = a2 - b2 * Math.ln(c2 * (x - e2) + Math.pow(d2 * (x - e2) * (x - e2) + 1, 0.5));}
               else if  (x < HP) {r = a3 + b3 * Math.ln(c3 * (x - e3) + Math.pow(d3 * (x - e3) * (x - e3) + 1, 0.5));}
               else              {r = a4 + b4 * x;}
               returnValues.push(r);
            }
         }
      }
   }

   var logic1 = "iif(x < " + LPT.toString() + ",";
   var logic2 = "iif(x < " + SPT.toString() + ",";
   var logic3 = "iif(x < " + HPT.toString() + ",";

   if (mode == "expression")
   {
      var exp = "";
      if (HPT < 1.0)
      {
         exp = exp4;
         vStr += vStr4;
      }
      if (SPT < HPT)
      {
         if (exp != "") {exp = logic3 + exp3 + "," + exp + ")";}
         else {exp = exp3;}
         vStr += vStr3;
      }
      if (LPT < SPT)
      {
         if (exp != "") {exp = logic2 + exp2 + "," + exp + ")";}
         else {exp = exp2;}
         vStr += vStr2
      }
      if (LPT > 0.0)
      {
         if (exp != "") {exp = logic1 + exp1 + "," + exp + ")";}
         else {exp = exp1;}
         vStr += vStr1
      }
      return [xStr + exp, vStr];
   }

   if (mode == "value")
   {
      if (returnSingleValue) {return returnValues[0];}
      else {return returnValues;}
   }

   return ["$T", ""] // Catch all
}

/*******************************************************************************
 * *****************************************************************************
 *
 * STRETCH FUNCTION
 *
 * This function is used to apply the specified stretch to an image using the
 * global stretchParameters. The parameter stretchExpression is an array:
 *
 *    stretchExpression[n]
 *
 *    n = 0, 1, 2, 3:  PixelMath expressions for R, G, B, RGB/K
 *    n = 4: PixelMath symbols used in the equations
 *
 *
 * *****************************************************************************
 *******************************************************************************/

function applyStretch(view, stretchExpression, newImageId = "", showNewImage = true) {

   controlParameters.suspendControlUpdating = true;

   var P = new PixelMath;

   if (stretchExpression[3] != "")
   {
      P.expression = stretchExpression[3];
      P.expression1 = "";
      P.expression2 = "";
      P.useSingleExpression = true;
   }
   else
   {
      P.expression = stretchExpression[0];
      P.expression1 = stretchExpression[1];
      P.expression2 = stretchExpression[2];
      P.useSingleExpression = false;
   }

   P.symbols = "";
   if (stretchExpression[4] != undefined) P.symbols = stretchExpression[4];


   if (newImageId == "")
   {
      var createNewImage = stretchParameters.createNewImage;
      if (createNewImage) newImageId = getCreateNewImageName(view);
   }
   else
   {
      var createNewImage = true;
      newImageId = getNewName(newImageId) //make sure to have a unique name
   }

   P.expression3 = "";
   P.clearImageCacheAndExit = false;
   P.cacheGeneratedImages = false;
   P.singleThreaded = false;
   P.optimization = true;
   P.use64BitWorkingImage = false;
   P.rescale = false;
   P.rescaleLower = 0;
   P.rescaleUpper = 1;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.generateOutput = true;
   P.newImageId = newImageId;
   P.newImageWidth = 0;
   P.newImageHeight = 0;
   P.newImageAlpha = false;
   P.newImageColorSpace = PixelMath.prototype.SameAsTarget;
   P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
   P.showNewImage = showNewImage;
   P.createNewImage = createNewImage;

   if (!createNewImage) newImageId = view.id;

   var success = P.executeOn(view);

   controlParameters.suspendControlUpdating = false;

   if (success)
   {
      return View.viewById(newImageId);
   }
   else
   {
      return null;
   }
}

/*******************************************************************************
 * *****************************************************************************
 *
 * HELPER FUNCTIONS - various functions to help along elsewhere
 *
 * *****************************************************************************
 *******************************************************************************/

//---------------------------------------------------------
// Functions to return cumulative statistics on a histogram|
//---------------------------------------------------------
function percentileToLevel(histogram, percentile)
{
   if (!(percentile > 0.0)) return 0;
   if (!(percentile < 1.0)) return hist.resolution;

   var cumulativeCount = 0;
   var histResolution = histogram.resolution;
   var targetCount = percentile * histogram.totalCount;
   var targetLevel = -1;
   var index = 0;
   do {
      cumulativeCount +=histogram.count(index);
      if (cumulativeCount > targetCount) targetLevel = index;
      ++index;}
   while ( (targetLevel < 0) && (index < histResolution) )
   if (index == 0) {return 0;}
   else {return index -1;}
}

function percentileToNormLevel(histogram, percentile)
{
   var level = percentileToLevel(histogram, percentile)
   return (1.0 * level) / histogram.resolution;
}

function normLevelToPercentile(histogram, normLevel)
{
   if (normLevel >= 1.0) return 1.0;
   if (normLevel <= 0.0) return 0.0;

   var level = histogram.histogramLevel(normLevel);
   var cummulativeCount = 0;
   for (var i = 0; i <= level; ++i) {cummulativeCount += histogram.count(i);}
   return (1.0 * cummulativeCount) / histogram.totalCount;
}

//------------------------------------------------------------------
// Reset blackpoint and histogram information on new image selection|
//------------------------------------------------------------------
function newImageRefresh() {

   histArray[0].refresh(stretchParameters.targetView);

   stretchParameters.channelSelector = [false, false, false, true];

   if (stretchParameters.targetView.id != "")
   {
      if (controlParameters.bringToFront) stretchParameters.targetView.window.bringToFront();
      if (controlParameters.moveTopLeft) stretchParameters.targetView.window.position = new Point(0,0);
   }

   controlParameters.lastStretchKey = "";
   ghsViews.tidyUp();
}


//----------------------------------
// get a unique name for a new image|
//----------------------------------
function getNewName(name)
{
   var newName = name;
   let n = 1;
   while (!ImageWindow.windowById(newName).isNull)
   {
      ++n;
      newName = name + n;
   }
   return newName;
}

//-------------------
// get new image name|
//-------------------
function getCreateNewImageName(targetView)
{
   var returnValue;
   if (controlParameters.newImageUsePrefix){returnValue = getNewName(controlParameters.newImagePrefix + targetView.id);}
   else {returnValue = getNewName(controlParameters.newImageRootName);}
   return returnValue
}


function getSizedFont(control, string, lines = 1)
{
   var currentFont = control.font;
   var textSize = currentFont.boundingRect(string);
   var hRatio =  control.width / textSize.width;
   var vRatio = control.height / (lines * textSize.height);

   if ((hRatio < 1.0) || (vRatio < 1.0)) {
      minRatio = Math.min(hRatio, vRatio);
      currentFont.pixelSize = Math.floor(minRatio * currentFont.pixelSize);}

   return currentFont;
}


/*******************************************************************************
 * *****************************************************************************
 *
 * HISTOGRAM DATA CONTROL for use in both the main dialog and the image inspector
 *
 * *****************************************************************************
 *******************************************************************************/

function histDataControl()
{

   this.control = new Control();

   // size the font to fit the labels
   var sizingLabel = new Label( this.control );
   var labelWidth = 40;
   sizingLabel.width = labelWidth;
   var labelFont = getSizedFont(sizingLabel, "Total Count");
   sizingLabel.hide();

   var histTableArray = new Array(new Array( 28 ), new Array( 28 ), new Array( 28 ));
   for (var channel = 0; channel < 3; ++channel)
   {
      var rowCount = 7;
      var colCount = 4;
      var cellNumber = 0
      for (var row = 0; row < rowCount; ++row) {
         for (var col = 0; col < colCount; ++col) {
            cellNumber = colCount * row + col
            histTableArray[channel][cellNumber] = new Label( this.control );
            histTableArray[channel][cellNumber].width = labelWidth;
            histTableArray[channel][cellNumber].text = "";
            histTableArray[channel][cellNumber].useRichText = true;
            histTableArray[channel][cellNumber].sizingLabel = labelFont;
         }
      }
   }



   var histTableRows = [new Array( 7 ), new Array( 7 ), new Array( 7 )];
   var histDataPages = [new Control( this.control ), new Control( this.control ), new Control( this.control )];

   for (var channel = 0; channel < 3; ++channel)
   {
      histDataPages[channel].sizer = new VerticalSizer( this.control );
      for (var row = 0; row < rowCount; ++row) {
         histTableRows[channel][row] = new HorizontalSizer( this.control );
         for (var col = 0; col < colCount; ++col) {
            histTableRows[channel][row].add(histTableArray[channel][colCount * row + col]);
            if ((Math.round(row / 2) * 2) == row) {histTableArray[channel][colCount * row + col].backgroundColor = 0xffb8b8b8;}
            else {histTableArray[channel][colCount * row + col].backgroundColor = 0xffd0d0d0;}
         }
         histDataPages[channel].sizer.add(histTableRows[channel][row]);
      }
   }

   var histogramData = new TabBox( this.control )
   histogramData.insertPage(0, histDataPages[0], "R/K");
   histogramData.insertPage(1, histDataPages[1], "G");
   histogramData.insertPage(2, histDataPages[2], "B");

   var headingsColour = 0xff000000;
   for (var channel = 0; channel < 3; ++channel)
   {
      setHistTableArray(channel, 0, 0, "<b>Histogram</b>", headingsColour);
      setHistTableArray(channel, 0, 1, "<b>Level</b>", headingsColour);
      setHistTableArray(channel, 0, 2, "<b>Norm level</b>", headingsColour);
      setHistTableArray(channel, 0, 3, "<b>Count</b>", headingsColour);
      setHistTableArray(channel, 1, 0, "<b>Left</b>", headingsColour);
      setHistTableArray(channel, 2, 0, "<b>Peak</b>", headingsColour);
      setHistTableArray(channel, 3, 0, "<b>Right</b>", headingsColour);
      setHistTableArray(channel, 4, 0, "<b>Selected</b>", headingsColour);
      setHistTableArray(channel, 5, 0, "<b>Resolution</b>", headingsColour);
      setHistTableArray(channel, 6, 0, "<b>Total count</b>", headingsColour);
   }

   this.control.sizer = new VerticalSizer
   this.control.sizer.add(histogramData);

   function setHistTableArray(channel, row, col, text, colour = 0xff000000) {
      histTableArray[channel][row * colCount + col].textColor = colour;
      histTableArray[channel][row * colCount + col].text = text;
   }

   this.setTable = function(n, selected) {
      var zeroCount, maxLevel, histRes, maxNormLevel, maxCount, endLevel, endNormLevel, endCount, totalCount;
      for (var channel = 0; channel < histArray[n].channelCount; ++ channel)
      {
         zeroCount = histArray[n].channels[channel].data[0];
         maxLevel = histArray[n].channels[channel].maxLevel;
         maxCount = histArray[n].channels[channel].maxCount;
         histRes = histArray[n].channels[channel].resolution;
         maxNormLevel = 1.0 * maxLevel / histRes;
         endLevel = histRes - 1;
         endNormLevel = 1.0 * endLevel / histRes;
         endCount = histArray[n].channels[channel].data[endLevel];
         totalCount = histArray[n].channels[channel].totalCount;

         setHistTableArray(channel, 1, 1, "0");
         setHistTableArray(channel, 1, 2, "0.00000");
         setHistTableArray(channel, 1, 3, zeroCount.toString());
         setHistTableArray(channel, 2, 1, maxLevel.toString());
         setHistTableArray(channel, 2, 2, maxNormLevel.toFixed(5));
         setHistTableArray(channel, 2, 3, maxCount.toString());
         setHistTableArray(channel, 3, 1, endLevel.toString());
         setHistTableArray(channel, 3, 2, endNormLevel.toFixed(5));
         setHistTableArray(channel, 3, 3, endCount.toString());
         setHistTableArray(channel, 5, 1, histRes.toString());
         setHistTableArray(channel, 6, 3, totalCount.toString());

         setHistTableArray(channel, 4, 1, "");
         setHistTableArray(channel, 4, 2, "");
         setHistTableArray(channel, 4, 3, "");
         if (!(selected === undefined)) {
         if ( (selected[channel] >= 0.0) && (selected[channel] <= 1.0))
         {
            var level = Math.floor(selected[channel] * histRes);
            var normLevel = selected[channel];
            var count = histArray[n].channels[channel].data[level]
            setHistTableArray(channel, 4, 1, level.toString());
            setHistTableArray(channel, 4, 2, normLevel.toFixed(5));
            setHistTableArray(channel, 4, 3, count.toString());
         }}

      }

      if (histArray[n].channelCount == 3)
      {
         histogramData.enablePage(0);
         histogramData.enablePage(1);
         histogramData.enablePage(2);
      }
      else
      {
         histogramData.enablePage(0);
         histogramData.disablePage(1);
         histogramData.disablePage(2);
      }
   }

   this.clearTable = function(message1 = "", message2 = "") {
      for (var row = 1; row < rowCount; ++row) {
         for (var col = 1; col < colCount; ++col) {
            for (var channel = 0; channel < 3; ++channel)
            {
               setHistTableArray(channel, row, col, "");
            }
         }
      }
      setHistTableArray(0, 3, 2, message1);
      setHistTableArray(0, 4, 2, message2);
      histogramData.enablePage(0);
      histogramData.disablePage(1);
      histogramData.disablePage(2);
   }
}

/*******************************************************************************
 * *****************************************************************************
 *
 * AUTO SCREEN TRANSFER FUNCTIONS
 *
 * *****************************************************************************
 *******************************************************************************/

//----------------------------------------------------------------------------------
// Pixinsight standard STF approach - calculation of histogram transformation matrix|
//----------------------------------------------------------------------------------

function getAutoSTFH(view, linked = false)
{
   // set up and initialise variables
   var shadowsClipping = -2.8;
   var targetBackground = 0.25;
   var channelCount = 1;
   if (view.image.isColor) channelCount = 3;

   var c0 = [0.0, 0.0, 0.0];
   var c1 = [0.0, 0.0, 0.0];
   var m = [0.0, 0.0, 0.0];
   var invC0 = [0.0, 0.0, 0.0];
   var invC1 = [0.0, 0.0, 0.0];
   var invM = [0.0, 0.0, 0.0];
   var lnkC0 = 0.0;
   var lnkC1 = 0.0;
   var lnkM = 0.0;
   var histTransform = new Array;

   var medians = view.computeOrFetchProperty("Median");
   var mads = view.computeOrFetchProperty("MAD");
   mads.mul(1.4826);

   var allInverted = true;
   var channelInverted = new Array
   for (var channel = 0; channel < channelCount; ++channel)
   {
      channelInverted.push((medians.at(channel) > 0.5));
      allInverted = allInverted && channelInverted[channel];
   }

   // calculate unlinked stretch parameters per channel
   for (var channel = 0; channel < channelCount; ++channel)
   {
      var median = medians.at(channel);
      var mad = mads.at(channel)

      if (mad != 0.0)
      {
         c0[channel] = Math.range(median + shadowsClipping * mad, 0.0, 1.0);
         c1[channel] = 1.0;
         invC0[channel] = 0.0;
         invC1[channel] = Math.range(median - shadowsClipping * mad, 0.0, 1.0);
      }
      else
      {
         c0[channel] = 0.0;
         c1[channel] = 1.0;
         invC0[channel] = 0.0;
         invC1[channel] = 1.0;
      }

      m[channel] = Math.mtf(targetBackground, median - c0[channel]);
      invM[channel] = Math.mtf(invC1[channel] - median, targetBackground);
   }

   //  derive linked stretch parameters
   if (allInverted)
   {
      lnkC0 = Math.sum(invC0) / channelCount;
      lnkC1 = Math.sum(invC1) / channelCount;
      lnkM = Math.sum(invM) / channelCount;
   }
   else
   {
      lnkC0 = Math.sum(c0) / channelCount;
      lnkC1 = Math.sum(c1) / channelCount;
      lnkM = Math.sum(m) / channelCount;
   }

   // generate the histogram transformation
   if (linked || (channelCount == 1))
   {

      histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);
      histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);
      histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);
      histTransform.push([lnkC0, lnkM, lnkC1, 0.0, 1.0]);
      histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);
   }
   else
   {
      if (allInverted)
      {
         for (var row = 0; row < 5; ++row)
         {
            if (row < channelCount) {histTransform.push([invC0[row], invM[row], invC1[row], 0.0, 1.0]);}
            else{histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);}
         }
      }
      else
      {
         for (var row = 0; row < 5; ++row)
         {
            if (row < channelCount) {histTransform.push([c0[row], m[row], c1[row], 0.0, 1.0]);}
            else{histTransform.push([0.0, 0.5, 1.0, 0.0, 1.0]);}
         }
      }
   }

   return histTransform;
}

//----------------------------------------------------------------------------
// Pixinsight standard STF approach - generate required Pixel Math expressions|
//----------------------------------------------------------------------------

function generatePixelMathAutoSTF(view, linked = false)
{
   var H = getAutoSTFH(view, linked);

   var expr = new Array

   if ( (linked) || (view.image.isGrayscale) )
   {
      var c0 = H[3][0];
      var m = H[3][1];
      var c1 = H[3][2];
      var d = (1.0 / (c1 - c0));
      expr.push("");
      expr.push("");
      expr.push("");
      expr.push("mtf(" + m.toFixed(12) + ",($T-" + c0.toFixed(12) + ")*" + d.toFixed(12) + ")");
   }
   else
   {
      for (var i = 0; i < 3; ++i)
      {
         var c0 = H[i][0];
         var m = H[i][1];
         var c1 = H[i][2];
         var d = (1.0 / (c1 - c0));
         expr.push("mtf(" + m.toFixed(12) + ",($T-" + c0.toFixed(12) + ")*" + d.toFixed(12) + ")");
      }
      expr.push("");
   }
   return expr;
}

//------------------------------------
// Alternative auto stretch approaches|
//------------------------------------
function getAutoStretchParametersSTF()
{
   if (stretchParameters.targetView.id == "")
   {
      return null;
   }
   else
   {
      var spa = stretchParameters.getParameterArray()
      var H = getAutoSTFH(stretchParameters.targetView, false);


      var returnValue = new Array;
      if (histArray[0].channelCount == 1)
      {
         var c0 = H[3][0];
         var m = H[3][1];
         var c1 = H[3][2];
         var d = (1.0 / (c1 - c0));

         var suggestedBP = c0;
         //if (c0 == 0.0) {suggestedBP = c1 - 1.0;}

         var suggestedD = stretchParameters.invConvertD((1.0 / (2.0 * m)) - 1.0);

         returnValue.push([8, suggestedD, 0.0, 0.0, 0.0, 1.0, suggestedBP]);
     }
      else
      {
         for (var channel = 0; channel < histArray[0].channelCount; ++channel)
         {
            var c0 = H[channel][0];
            var m = H[channel][1];
            var c1 = H[channel][2];
            var d = (1.0 / (c1 - c0));

            var suggestedBP = c0;
            //if (c0 == 0.0) {suggestedBP = c1 - 1.0;}

            var suggestedD = stretchParameters.invConvertD((1.0 / (2.0 * m)) - 1.0);

            returnValue.push([8, suggestedD, 0.0, 0.0, 0.0, 1.0, suggestedBP]);
         }
      }

      return returnValue;
   }
}



function getAutoStretchParameters()
{
   if (stretchParameters.targetView.id == "")
   {
      return null;
   }
   else
   {
      for (var c = 0; c < histArray[0].channelCount; ++c)
      {
         var suggestedSPA = stretchParameters.getParameterArray();

         //Module under development

         returnValue.push(suggestedSPA);
      }
   }
   return returnValue;
}



/*******************************************************************************
 * *****************************************************************************
 *
 * STRETCH LOG DIALOG
 *
 * This creates a dialog to view the stretches performed in the current session
 *
 * *****************************************************************************
 *******************************************************************************/

function logDialog() {
   this.__base__ = Dialog;
   this.__base__();

   // let the dialog be resizable
   this.userResizable = true;
   this.minWidth = 700;

   this.windowTitle = "Log Viewer"


   // Build string array containing the log information
   var logStrings = new Array

   logStrings.push("<b>");
   logStrings.push("GHS Log");
   logStrings.push("</b>");
   logStrings.push("<br>");

   var startDate = controlParameters.sessionStart;
   logStrings.push("Session start time: " + startDate.toLocaleDateString() + ": " + startDate.toLocaleTimeString());
   logStrings.push("<br>");

   var creationDate = new Date;
   logStrings.push("Log creation time:  " + creationDate.toLocaleDateString() + ": " + creationDate.toLocaleTimeString());
   logStrings.push("<br>");


   for (var imgIndex = 0; imgIndex < ghsStretchLog.itemCount(); ++imgIndex)
   {
      //Heading for a new image
      logStrings.push("<br>");
      logStrings.push("<b>");
      logStrings.push(ghsStretchLog.items[imgIndex].imageId);
      logStrings.push("</b>");
      logStrings.push("<br>");

      for (var strIndex = 0; strIndex < Math.max(1, ghsStretchLog.items[imgIndex].nextIndex); ++strIndex)
      {
         //Interogate the stretch details to see if it is a GHS stretch, in which case extract the natural language name of the stretch
         var stretchKey = ghsStretchLog.items[imgIndex].stretches(strIndex);
         var keyStartsAt = stretchKey.search(/ST:/);
         if (keyStartsAt >= 0) stretchKey = stretchKey.slice(keyStartsAt, stretchKey.length);
         var stretchName = "";
         if (stretchKey.startsWith("ST:")) stretchName = controlParameters.stretchTypes[stretchParameters.paramArrayFromStretchKey(stretchKey)[0]];

         if (strIndex == 0)
         {
            logStrings.push("Initial state: ");
            logStrings.push(stretchName);
            logStrings.push("<br>");
         }
         else
         {
            logStrings.push("Stretch " + strIndex.toString() + ": ");
            logStrings.push(stretchName);
            logStrings.push("<br>");
         }
         logStrings.push(ghsStretchLog.items[imgIndex].stretches(strIndex));
         logStrings.push("<br>");
      }
   }


   // Concatenate log information strings into a single string for display
   var displayString = ""
   for (var i = 0; i < logStrings.length; ++i) {displayString += logStrings[i];}


   // Define log viewer text box
   this.logView = new TextBox(this);
   this.logView.readOnly = true;
   this.logView.text = displayString;


   //Define file save button
   this.fileSaveButton = new PushButton( this );
   this.fileSaveButton.text = "Save"
   this.fileSaveButton.toolTip = "Reset all parameters to default values";
   this.fileSaveButton.onClick = function(){
      let sfd = new SaveFileDialog;
      sfd.overwritePrompt = true;
      sfd.caption = "Save log";

      if ( sfd.execute() )
      {
         var saveFileName = sfd.fileName;
         var saveFile = new File();
         saveFile.createForWriting(saveFileName);

         for (var i = 0; i < logStrings.length; ++i)
         {
            var s = logStrings[i]
            if ((s == "<b>") || (s == "</b>")) {}  // do nothing
            else if (s == "<br>") {saveFile.outTextLn("");}
            else {saveFile.outText(s);}
         }

         saveFile.close();
      }
   }

   // Define a close dialog button
   this.closeButton = new PushButton( this )
   this.closeButton.text = "Close"
   this.closeButton.onClick = function(){
      this.dialog.ok();}



   // Layout dialog
   this.buttons = new HorizontalSizer( this );
   this.buttons.add(this.fileSaveButton);
   this.buttons.addStretch();
   this.buttons.add(this.closeButton);

   this.sizer = new VerticalSizer();
   this.sizer.add(this.logView);
   this.sizer.addSpacing(16);
   this.sizer.add(this.buttons);
   this.sizer.addSpacing(16);
}
logDialog.prototype = new Dialog;



/*******************************************************************************
 * *****************************************************************************
 *
 * INSPECT IMAGE DIALOG - create a dialog to inspect the current target image
 *
 * *****************************************************************************
 *******************************************************************************/

function imageDialog() {
   this.__base__ = Dialog;
   this.__base__();

   this.windowTitle = "Image Inspector"


   if (stretchParameters.targetView.id == "") {
      //catch no target view
      return;
   }

   //---------------------
   // Initial housekeeping|
   //---------------------
   // let the dialog be resizable
   this.userResizable = true;

   this.suspendUpdating = false;

   this.width = 1000;
   this.height = 800;

   this.onResize = function(wNew, hNew, wOld, hOld)
   {
      if (this.dialog.suspendUpdating) return;
      this.dialog.update();
   }

   var regenerateImages = (controlParameters.lastStretchKey != stretchParameters.getStretchKey());
   if (regenerateImages) ghsViews.clear();
   controlParameters.lastStretchKey = stretchParameters.getStretchKey()


   // define the current image
   this.imageIndex = 0;
   this.stfIndex = [0, 0];
   this.currentImage = function()
   {
      this.dialog.suspendUpdating = true;
      var returnValue = ghsViews.getImage(2 * this.stfIndex[this.imageIndex] + this.imageIndex);
      this.dialog.suspendUpdating = false;
      return returnValue;
   }

   // coordinate transformation functions
   this.frameToImage = function(p)
   {
      var topLeftX = this.frameTopLeft.x;
      var topLeftY = this.frameTopLeft.y;
      var zoom = this.zoom;
      var x = topLeftX + p.x / zoom;
      var y = topLeftY + p.y / zoom;
      return new Point(x, y);
   }

   this.imageToFrame = function(p)
   {
      var topLeftX = this.frameTopLeft.x;
      var topLeftY = this.frameTopLeft.y;
      var zoom = this.zoom;
      var x = (p.x - topLeftX) * zoom;
      var y = (p.y - topLeftY) * zoom;
      return new Point(x, y);
   }

   // set up data for drawing
   this.lastMousePress = new Point;             // in frame coordinates
   this.readoutPoint = new Point(-100, -100);   // in image coordinates
   this.viewTopLeft = new Point(0, 0);           // in image coordinates
   this.viewDisplace = new Point(0, 0);         // in image coordinates
   this.frameTopLeft = new Point(0, 0);         // in image coordinates
   this.thumbFrameTopLeft = new Point(0,0);
   this.dragging = false;
   this.zoom = 1.0;
   this.topRowHeight = 150;
   this.targetColour = 0xffffffff;
   this.readoutData = [[0, 0, 0], [0, 0, 0]];


   //---------------------------------------------------------------------
   // define the image frame that will display the 1-1 bitmap of the image|
   //---------------------------------------------------------------------
   this.imageFrame = new Frame( this );
   this.imageFrame.minWidth = 800;
   this.imageFrame.minHeight = 600;
   this.imageFrame.toolTip = "Click for read out at selected pixel. Click and drag to pan the image.";

   this.imageFrame.onPaint = function(x0, y0, x1, y1)
   {
      if (this.dialog.suspendUpdating) {return;}

      var image = this.dialog.currentImage();

      var zoom = this.dialog.zoom;
      var imgW = image.width;
      var imgH = image.height;
      var frmW = this.width;
      var frmH = this.height;
      var zmFW = frmW / zoom;
      var zmFH = frmH / zoom;
      var topLeftX = this.dialog.viewTopLeft.x + this.dialog.viewDisplace.x;
      var topLeftY = this.dialog.viewTopLeft.y + this.dialog.viewDisplace.y;
      var tlx, rx0, rx1, tly, ry0, ry1, xl, xr, yt, yb, ftlx, ftly;

      if (imgW < zmFW)
      {
         tlx = 0.5 * (zmFW - imgW);
         rx0 = 0;
         rx1 = imgW - 1;
         ftlx = - tlx;
      }

      if (imgH < zmFH)
      {
         tly = 0.5 * (zmFH - imgH);
         ry0 = 0;
         ry1 = imgH - 1;
         ftly = -tly;
      }

      if (imgW >= zmFW)
      {
         tlx = 0;
         rx0 = Math.max(0, Math.min(topLeftX, imgW - zmFW));
         rx1 = rx0 + zmFW;
         ftlx = rx0;
      }

      if (imgH >= zmFH)
      {
         tly = 0;
         ry0 = Math.max(0, Math.min(topLeftY, imgH - zmFH));
         ry1 = ry0 + zmFH;
         ftly = ry0;
      }

      this.dialog.frameTopLeft.x = ftlx;
      this.dialog.frameTopLeft.y = ftly;

      var readoutP = this.dialog.readoutPoint;
      var readoutX = readoutP.x;
      var readoutY = readoutP.y;

      var viewRect = new Rect(rx0, ry0, rx1, ry1);

      var g = new VectorGraphics( this );
      g.antialiasing = true;
      g.scaleTransformation(zoom, zoom);
      g.drawBitmapRect(new Point(tlx, tly), image, viewRect);

      var imgRect = new Rect(0, 0, imgW - 1, imgH - 1)

      if ( imgRect.includes(readoutP) )
      {
         var lineLength = 16 / zoom;
         var circleRadius = lineLength / 2;
         var lineThickness = Math.floor(1 / zoom);
         var ztlx = ftlx;
         var ztly = ftly;
         var cx = readoutX - ztlx;
         var cy = readoutY - ztly;
         g.pen = new Pen(this.dialog.targetColour, lineThickness);
         g.drawLine(cx - lineLength, cy, cx + lineLength, cy);
         g.drawLine(cx, cy - lineLength, cx, cy + lineLength);
         g.drawCircle(cx, cy, circleRadius);
      }

      if (this.dialog.stfIndex[this.dialog.imageIndex] > 0)
      {
         g.pen = new Pen(0xff00c000, 4);
         g.resetTransformation();
         g.drawRect(0, 0, frmW, frmH);
      }
      g.end();

      this.dialog.viewRect = viewRect;
   }

   this.imageFrame.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      if (this.dialog.suspendUpdating) return;

      if ( (button == MouseButton_Left) && !(modifiers == KeyModifier_Control) )
      {
         this.dialog.lastMousePress = new Point(x, y);
         this.dialog.dragging = true;

         var imgW = this.dialog.currentImage().width;
         var imgH = this.dialog.currentImage().height;

         var imageP = this.dialog.frameToImage(new Point(x, y));
         var imageP = new Point(Math.floor(imageP.x), Math.floor(imageP.y));
         var imgRect = new Rect(0, 0, imgW - 1, imgH - 1)
         if ( imgRect.includes(imageP) ) this.dialog.readoutPoint = imageP;

         this.dialog.update();
      }

      if (modifiers == KeyModifier_Control)
      {
         this.dialog.imageIndex = 1 - this.dialog.imageIndex;
         this.dialog.update();
      }


   }

   this.imageFrame.onMouseRelease = function(x, y, button, buttonState, modifiers)
   {
      if (this.dialog.suspendUpdating) return;
      if (button == MouseButton_Left)
      {
         this.dialog.viewTopLeft.x += this.dialog.viewDisplace.x
         this.dialog.viewTopLeft.y += this.dialog.viewDisplace.y

         this.dialog.viewDisplace = new Point(0, 0);
         this.dialog.dragging = false;

         this.dialog.update();
      }
   }

   this.imageFrame.onMouseMove = function(x, y, buttonState, modifiers)
   {
      if (this.dialog.suspendUpdating) return;

      if (this.dialog.dragging)
      {
         var zoom = this.dialog.zoom;
         var lastX = this.dialog.lastMousePress.x;
         var lastY = this.dialog.lastMousePress.y;
         var topLeft = this.dialog.viewTopLeft;
         var imgW = this.dialog.currentImage().width;
         var imgH = this.dialog.currentImage().height;
         var frmW = this.width;
         var frmH = this.height
         var zmFW = frmW / zoom;
         var zmFH = frmH / zoom;

         var dx = (lastX - x) / zoom;
         var dy = (lastY - y) / zoom;

         this.dialog.viewDisplace = new Point(dx, dy);

         this.dialog.update();
      }
   }

   //-------------------------------------------------------------------------------
   // define the frame that will hold the thumbnail of the image used for navigation|
   //-------------------------------------------------------------------------------
   this.thumbFrame = new Frame( this );
   this.thumbFrame.minHeight = this.topRowHeight;
   this.thumbFrame.maxHeight = this.topRowHeight;
   this.thumbFrame.minWidth = 10;
   this.thumbFrame.toolTip = "Click on thumbnail to position zoom window";

   this.thumbFrame.onPaint = function(x0, y0, x1, y1)
   {
      if (this.dialog.suspendUpdating) return;

      var imgW = this.dialog.currentImage().width;
      var imgH = this.dialog.currentImage().height;
      this.minWidth = this.dialog.topRowHeight * imgW / imgH;
      this.maxWidth = this.dialog.topRowHeight * imgW / imgH;

      var w = this.width;
      var h = this.height;
      var frmW = this.dialog.imageFrame.width;
      var frmH = this.dialog.imageFrame.height;
      var zoom = this.dialog.zoom;
      var zmFW = frmW / zoom;
      var zmFH = frmH / zoom;
      var scaleX = w / imgW;
      var scaleY = h / imgH;
      var scale = Math.min(scaleX, scaleY);

      var rx0 = this.dialog.frameTopLeft.x;
      var ry0 = this.dialog.frameTopLeft.y;
      rx0 = Math.max(0, Math.min(imgW - zmFW, rx0));
      ry0 = Math.max(0, Math.min(imgH - zmFH, ry0));
      var rx1 = rx0 + Math.min(zmFW, imgW);
      var ry1 = ry0 + Math.min(zmFH, imgH);



      var viewRect = new Rect(rx0, ry0, rx1, ry1);

      var g = new VectorGraphics( this );
      g.scaleTransformation(scaleY, scaleY);
      g.drawBitmap(0,0,this.dialog.currentImage());
      g.brush = new Brush(0x20ffffff);
      g.pen = new Pen(0xffff0000,10);
      g.fillRect(viewRect);
      g.drawRect(viewRect);
      g.end();
   }

   this.thumbFrame.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      if (this.dialog.suspendUpdating) return;

      if (button == MouseButton_Left)
      {
         var w = this.width;
         var h = this.height;
         var imgW = this.dialog.currentImage().width;
         var imgH = this.dialog.currentImage().height;
         var frmW = this.dialog.imageFrame.width;
         var frmH = this.dialog.imageFrame.height;
         var zoom = this.dialog.zoom;
         var zmFW = frmW / zoom;
         var zmFH = frmH / zoom;

         var tlX = Math.round(imgW * (x / w) - (zmFW / 2));
         var tlY = Math.round(imgH * (y / h) - (zmFH / 2));

         var ntlX = Math.min(Math.max(0, tlX), imgW - zmFW);
         var ntlY = Math.min(Math.max(0, tlY), imgH - zmFH);

         this.dialog.viewTopLeft = new Point(ntlX, ntlY);
         this.dialog.viewDisplace = new Point(0, 0);

         this.dialog.update();
      }
   }

   //----------------------------
   // define the readout text box|
   //----------------------------

   this.readout = new TextBox( this );
   this.readout.text = "<b>Image readout</b><br>";
   this.readout.readOnly = true;
   this.readout.minWidth = 50;
   this.readout.minHeight = this.topRowHeight;
   this.readout.maxHeight = this.topRowHeight;
   this.readout.font = getSizedFont(this.readout, "X".repeat(27), 11);

   //---------------
   // define buttons|
   //---------------

   // define the button to show the auto stretched image
   this.stfOnButton = new ToolButton(this);
   this.stfOnButton.icon = this.scaledResource( ":/toolbar/image-stf-auto.png" );
   this.stfOnButton.setScaledFixedSize( 24, 24 );
   this.stfOnButton.toolTip = "<p>Apply STF.</p>";
   this.stfOnButton.onMousePress = function( x, y, button, buttonState, modifiers ) {
      if (this.dialog.suspendUpdating) return;
      if (modifiers == KeyModifier_Shift) controlParameters.linkedSTF = true;
      if (modifiers == KeyModifier_Control) controlParameters.linkedSTF = false;
      this.dialog.stfIndex[this.dialog.imageIndex] = 1;
      if ((histArray[0].channelCount > 1) && (!controlParameters.linkedSTF)) this.dialog.stfIndex[this.dialog.imageIndex] = 2;
      this.dialog.update();
   }

   // define the button to show the unstretched image
   this.stfOffButton = new ToolButton(this);
   this.stfOffButton.icon = this.scaledResource( ":/toolbar/image-stf-reset.png" );
   this.stfOffButton.setScaledFixedSize( 24, 24 );
   this.stfOffButton.toolTip = "<p>Remove STF.</p>";
   this.stfOffButton.onClick = function( checked ) {
      if (this.dialog.suspendUpdating) return;
      this.dialog.stfIndex[this.dialog.imageIndex] = 0;
      this.dialog.update();
   }

   // define the button to toggle the colour of the target marker
   this.colourToggleButton = new ToolButton(this);
   this.colourToggleButton.icon = this.scaledResource( ":/icons/track.png" );
   this.colourToggleButton.setScaledFixedSize( 24, 24 );
   this.colourToggleButton.toolTip = "<p>Cycle the colour of the selection marker between: white, black, and invisible.</p>";
   this.colourToggleButton.onClick = function( checked ) {
      if (this.dialog.suspendUpdating) return;
      switch (this.dialog.targetColour)
      {
         case 0xffffffff: this.dialog.targetColour = 0xff000000; break;
         case 0xff000000: this.dialog.targetColour = 0x00000000; break;
         case 0x00000000: this.dialog.targetColour = 0xffffffff; break;
      }
      this.dialog.update();
   }

   // define zoom in button
   this.zoomInButton = new ToolButton(this);
   this.zoomInButton.icon = this.scaledResource( ":/icons/move-right-limit.png" );
   this.zoomInButton.setScaledFixedSize( 24, 24 );
   this.zoomInButton.toolTip = "<p>Zoom 1 to 1</p>";
   this.zoomInButton.onClick = function( checked ) {
      if (this.dialog.suspendUpdating) return;
      this.dialog.zoomSlider.normalizedValue = 1.0;
      this.dialog.update();
   }

   // define zoom out button
   this.zoomOutButton = new ToolButton(this);
   this.zoomOutButton.icon = this.scaledResource( ":/icons/move-left-limit.png" );
   this.zoomOutButton.setScaledFixedSize( 24, 24 );
   this.zoomOutButton.toolTip = "<p>Zoom to fit</p>";
   this.zoomOutButton.onClick = function( checked ) {
      if (this.dialog.suspendUpdating) return;
      this.dialog.zoomSlider.normalizedValue = 0.0;
      this.dialog.update();
   }

   // define zoom slider
   this.zoomSlider = new Slider( this );
   this.zoomSlider.minWidth = 150;
   this.zoomSlider.setRange(0, 100);
   this.zoomSlider.normalizedValue = 0.0;
   this.zoomSlider.toolTip = "<p>Slide to zoom</p>";
   this.zoomSlider.onValueUpdated = function( value)
   {
      if (this.dialog.suspendUpdating) return;
      this.dialog.update();
   }

   //---------------------
   // define radio buttons|
   //---------------------

   this.unstretchedRadio = new RadioButton( this );
   this.unstretchedRadio.text = "Show target image";
   this.unstretchedRadio.checked = true;
   this.unstretchedRadio.toolTip = "Show target image without stretch applied." +
         " You can also ctl-Click on the image (cmd-Click on Mac) to toggle between views.";
   this.unstretchedRadio.onClick = function(checked)
   {
      if (this.dialog.suspendUpdating) return;
      this.dialog.imageIndex = 0;
      this.dialog.update();
   }

   this.stretchedRadio = new RadioButton( this );
   this.stretchedRadio.text = "Preview stretch";
   this.stretchedRadio.checked = false;
   this.stretchedRadio.toolTip = "Show/Preview image with stretch applied." +
         " You can also ctl-Click on the image (cmd-Click on Mac) to toggle between views.";
   this.stretchedRadio.onClick = function(checked)
   {
      if (this.dialog.suspendUpdating) return;
      this.dialog.imageIndex = 1;
      this.dialog.update();
   }

   this.histDataObject = new histDataControl();
   this.histControl = this.histDataObject.control;
   this.histDataObject.setTable(0);
   this.histControl.minWidth = 350;
   this.histControl.minHeight = this.topRowHeight;
   this.histControl.maxHeight = this.topRowHeight;


   //------------------
   // update the dialog|
   //------------------

   this.update = function()
   {
      if (this.dialog.suspendUpdating) return;

      var imgW = this.dialog.currentImage().width;
      var imgH = this.dialog.currentImage().height;
      var frmW = this.dialog.imageFrame.width;
      var frmH = this.dialog.imageFrame.height;

      var z1 = frmW / imgW;
      var z2 = frmH / imgH;
      var zFit = Math.min(z1, z2);
      var z1to1 = 1.0;
      var zoomSliderValue = this.dialog.zoomSlider.normalizedValue;
      this.dialog.zoom = zFit + zoomSliderValue * (z1to1 - zFit);

      if (this.dialog.imageIndex == 1)
      {
         this.unstretchedRadio.checked = false;
         this.stretchedRadio.checked = true;
      }
      else
      {
         this.unstretchedRadio.checked = true;
         this.stretchedRadio.checked = false;
      }

      // update text for readout point
      var imgRect = new Rect(0, 0, imgW - 1, imgH - 1)
      if ( imgRect.includes(this.readoutPoint) )
      {
         var roText = "<b>Image readout</b><br><br>";
         var imageX = this.readoutPoint.x;
         var imageY = this.readoutPoint.y;

         var xText = "<b>X:    </b>" + imageX.toString();
         var yText = "<b>Y:    </b>" + imageY.toString();
         roText += xText + "<br>" + yText + "<br><br><b>       Before      After</b><br>";

         if (ghsViews.getView(0).image.isColor)
         {
            var rValue = [0, 0];
            var gValue = [0, 0];
            var bValue = [0, 0];

            rValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 0);
            gValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 1);
            bValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 2);
            this.dialog.readoutData[0] = [rValue[0], gValue[0], bValue[0]];

            rValue[1] = calculateStretch(rValue[0]);
            gValue[1] = calculateStretch(gValue[0]);
            bValue[1] = calculateStretch(bValue[0]);
            this.dialog.readoutData[1] = [rValue[1], gValue[1], bValue[1]];

            var rText = "<b>R:    </b>" + rValue[0].toFixed(5) + "    " + rValue[1].toFixed(5);
            var gText = "<b>G:    </b>" + gValue[0].toFixed(5) + "    " + gValue[1].toFixed(5);
            var bText = "<b>B:    </b>" + bValue[0].toFixed(5) + "    " + bValue[1].toFixed(5);
            roText += rText + "<br>" + gText + "<br>" + bText;
         }
         else
         {
            var kValue = [0, 0];

            kValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 0);
            this.dialog.readoutData[0] = [kValue[0], 0, 0];

            kValue[1] = calculateStretch(kValue[0]);
            this.dialog.readoutData[1] = [kValue[1], 0, 0];

            var kText = "<b>K:    </b>" + kValue[0].toFixed(5) + "    " + kValue[1].toFixed(5);
            roText += kText;
         }
         this.dialog.readout.text = roText;
      }

      this.histDataObject.setTable(this.dialog.imageIndex, this.dialog.readoutData[this.dialog.imageIndex]);

      this.dialog.imageFrame.repaint();
      this.dialog.thumbFrame.repaint();

   }

   //------------------
   // layout the dialog|
   //------------------

   this.zoomButtons = new HorizontalSizer( this );
   this.zoomButtons.margin = 0;
   this.zoomButtons.add(this.unstretchedRadio);
   this.zoomButtons.addStretch();
   this.zoomButtons.add(this.zoomOutButton);
   this.zoomButtons.add(this.zoomSlider);
   this.zoomButtons.add(this.zoomInButton);
   this.zoomButtons.addStretch();
   this.zoomButtons.add(this.stretchedRadio);

   this.stfButtons = new VerticalSizer( this );
   this.stfButtons.margin = 0;
   this.stfButtons.add(this.stfOnButton);
   this.stfButtons.addSpacing(4);
   this.stfButtons.add(this.stfOffButton);
   this.stfButtons.addSpacing(4);
   this.stfButtons.add(this.colourToggleButton);

   this.topRow = new HorizontalSizer( this );
   this.topRow.margin = 0;
   this.topRow.add(this.readout);
   this.topRow.addStretch();
   this.topRow.add(this.histControl);
   this.topRow.addStretch();
   this.topRow.add(this.thumbFrame);
   this.topRow.add(this.stfButtons);

   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.add(this.topRow);
   this.sizer.addSpacing(4);
   this.sizer.add(this.imageFrame);
   this.sizer.add(this.zoomButtons);

   this.update();

}

imageDialog.prototype = new Dialog;


/*******************************************************************************
 * *****************************************************************************
 *
 * OPTIONS DIALOG - create a dialog to control user defined options
 *
 * *****************************************************************************
 *******************************************************************************/

//options dialog
function optionsDialog() {
   this.__base__ = Dialog;
   this.__base__();

   this.windowTitle = "Preferences"

   //----------------
   // Define controls|
   //----------------

   // create "move top left" checkbox
   this.topLeftCheck = new CheckBox( this );
   this.topLeftCheck.text = "Move selected view top left";
   this.topLeftCheck.checked = controlParameters.moveTopLeft;
   this.topLeftCheck.toolTip =
         "<p>Move window to top left of workspace when a target view is selected.</p>";
   this.topLeftCheck.onCheck = function( checked )
   {
      controlParameters.moveTopLeft = checked;
   }

   // create "bring to front" checkbox
   this.toFrontCheck = new CheckBox( this );
   this.toFrontCheck.text = "Bring selected view to front";
   this.toFrontCheck.checked = controlParameters.bringToFront;
   this.toFrontCheck.toolTip =
         "<p>Bring window to the front when a target view is selected.</p>";
   this.toFrontCheck.onCheck = function( checked )
   {
      controlParameters.bringToFront = checked;
   }

   // create "check STF and mask" checkbox
   this.stfCheck = new CheckBox( this );
   this.stfCheck.text = "Check selected view for STF and mask";
   this.stfCheck.checked = controlParameters.checkSTF;
   this.stfCheck.toolTip =
         "<p>Check whether a screen transfer function or mask has been applied when a target view is selected." +
         " If so ask whether to remove them.</p>";
   this.stfCheck.onCheck = function( checked )
   {
      controlParameters.checkSTF = checked;
   }

   // create select new image checkbox
   this.selectNewImage = new CheckBox( this );
   this.selectNewImage.text = "Select new image on execute";
   this.selectNewImage.checked = controlParameters.selectNewImage;
   this.selectNewImage.toolTip =
         "<p>If the script is run with create new image checked," +
         " this option will select the new image after the stretch has been applied." +
         " Otherwise the old pre-stretched image remains selected.</p>";
   this.selectNewImage.onCheck = function( checked )
   {
      controlParameters.selectNewImage = checked;
   }

   // create save log checkbox
   this.saveLogCheck = new CheckBox( this );
   this.saveLogCheck.text = "Check save log on exit";
   this.saveLogCheck.checked = controlParameters.saveLogCheck;
   this.saveLogCheck.toolTip =
         "<p>Check whether the log is to be saved when exiting the script.</p>";
   this.saveLogCheck.onCheck = function( checked )
   {
      controlParameters.saveLogCheck = checked;
   }

   //create histogram picker headings graphHistActive
   this.histHeadLabel1 = new Label(this);
   this.histHeadLabel1.minWidth = controlParameters.minLabelWidth;
   this.histUnstretchActive = new CheckBox(this);
   this.histUnstretchActive.text = "Unstretched";
   this.histUnstretchActive.toolTip = "Check box controls whether unstretched histograms are plotted"
   this.histUnstretchActive.checked = controlParameters.graphHistActive[0];
   this.histUnstretchActive.onCheck = function(checked)
   {
      controlParameters.graphHistActive[0] = checked;
   }
   this.histStretchActive = new CheckBox(this);
   this.histStretchActive.text = "Stretched";
   this.histStretchActive.toolTip = "Check box controls whether stretched histograms are plotted"
   this.histStretchActive.checked = controlParameters.graphHistActive[1];
   this.histStretchActive.onCheck = function(checked)
   {
      controlParameters.graphHistActive[1] = checked;
   }

   this.histHeadControls = new HorizontalSizer( this )
   this.histHeadControls.margin = 0;
   this.histHeadControls.spacing = 4;
   this.histHeadControls.add(this.histHeadLabel1);
   this.histHeadControls.add(this.histUnstretchActive);
   this.histHeadControls.add(this.histStretchActive);


   // create mono histogram colour picker control
   this.histColLabel = new Label(this);
   this.histColLabel.minWidth = controlParameters.minLabelWidth;
   this.histColLabel.text = "Mono histogram colours:";
   this.histColLabel.textAlignment = -1;

   this.histColList = new ComboBox ( this );
   this.histColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.histColList.addItem(controlParameters.colourArray[i]);
   }
   this.histColList.currentItem = this.histColList.findItem(controlParameters.graphHistCol[0]);;
   this.histColList.toolTip =
      "<p>Specifies the colour to use for the unstretched greyscale histogram." +
      " Light RGB will be used for colour images.</p>";
   this.histColList.onItemSelected = function( index )
   {
      controlParameters.graphHistCol[0] = this.itemText(index);
   }

   this.stretchHistColList = new ComboBox ( this );
   this.stretchHistColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.stretchHistColList.addItem(controlParameters.colourArray[i]);
   }
   this.stretchHistColList.currentItem = this.histColList.findItem(controlParameters.graphHistCol[1]);;
   this.stretchHistColList.toolTip =
      "<p>Specifies the colour to use for the stretched greyscale histogram." +
      " RGB will be used for colour images.</p>";
   this.stretchHistColList.onItemSelected = function( index )
   {
      controlParameters.graphHistCol[1] = this.itemText(index);
   }

   this.histColControl = new HorizontalSizer(this);
   this.histColControl.margin = 0;
   this.histColControl.spacing = 4;
   this.histColControl.add(this.histColLabel);
   this.histColControl.add(this.histColList);
   this.histColControl.add(this.stretchHistColList);
   this.histColControl.addStretch();

   // create rgb histogram colour picker control
   this.rgbHistColLabel = new Label(this);
   this.rgbHistColLabel.minWidth = controlParameters.minLabelWidth;
   this.rgbHistColLabel.text = "RGB histogram colours:";
   this.rgbHistColLabel.textAlignment = -1;

   this.rgbHistColList = new ComboBox ( this );
   this.rgbHistColList.minWidth = controlParameters.minLabelWidth;
   this.rgbHistColList.addItem("Light");
   this.rgbHistColList.addItem("Mid");
   this.rgbHistColList.addItem("Dark");
   this.rgbHistColList.currentItem = this.rgbHistColList.findItem(controlParameters.graphRGBHistCol[0]);
   this.rgbHistColList.toolTip =
      "<p>Specifies the colours to use for the unstretched rgb histogram.</p>";
   this.rgbHistColList.onItemSelected = function( index )
   {
      controlParameters.graphRGBHistCol[0] = this.itemText(index);
   }

   this.rgbStretchHistColList = new ComboBox ( this );
   this.rgbStretchHistColList.minWidth = controlParameters.minLabelWidth;
   this.rgbStretchHistColList.addItem("Light");
   this.rgbStretchHistColList.addItem("Mid");
   this.rgbStretchHistColList.addItem("Dark");
   this.rgbStretchHistColList.currentItem = this.rgbStretchHistColList.findItem(controlParameters.graphRGBHistCol[1]);
   this.rgbStretchHistColList.toolTip =
      "<p>Specifies the colours to use for the stretched rgb histogram.</p>";
   this.rgbStretchHistColList.onItemSelected = function( index )
   {
      controlParameters.graphRGBHistCol[1] = this.itemText(index);
   }

   this.rgbHistColControl = new HorizontalSizer(this);
   this.rgbHistColControl.margin = 0;
   this.rgbHistColControl.spacing = 4;
   this.rgbHistColControl.add(this.rgbHistColLabel);
   this.rgbHistColControl.add(this.rgbHistColList);
   this.rgbHistColControl.add(this.rgbStretchHistColList);
   this.rgbHistColControl.addStretch();

   // create histogram type picker control
   this.histTypeLabel = new Label(this);
   this.histTypeLabel.minWidth = controlParameters.minLabelWidth;
   this.histTypeLabel.text = "Histogram plot type:";
   this.histTypeLabel.textAlignment = -1;

   this.histTypeList = new ComboBox ( this );
   this.histTypeList.minWidth = controlParameters.minLabelWidth;
   this.histTypeList.addItem("Fill");
   this.histTypeList.addItem("Draw");
   this.histTypeList.currentItem = this.histTypeList.findItem(controlParameters.graphHistType[0]);
   this.histTypeList.toolTip =
      "<p>Specifies the plot type to use for unstretched histograms.</p>";
   this.histTypeList.onItemSelected = function( index )
   {
      controlParameters.graphHistType[0] = this.itemText(index);
   }

   this.histStretchTypeList = new ComboBox ( this );
   this.histStretchTypeList.minWidth = controlParameters.minLabelWidth;
   this.histStretchTypeList.addItem("Fill");
   this.histStretchTypeList.addItem("Draw");
   this.histStretchTypeList.currentItem = this.histStretchTypeList.findItem(controlParameters.graphHistType[1]);
   this.histStretchTypeList.toolTip =
      "<p>Specifies the plot type to use for unstretched histograms.</p>";
   this.histStretchTypeList.onItemSelected = function( index )
   {
      controlParameters.graphHistType[1] = this.itemText(index);
   }

   this.histTypeControl = new HorizontalSizer(this);
   this.histTypeControl.margin = 0;
   this.histTypeControl.spacing = 4;
   this.histTypeControl.add(this.histTypeLabel);
   this.histTypeControl.add(this.histTypeList);
   this.histTypeControl.add(this.histStretchTypeList);
   this.histTypeControl.addStretch();

   // create grid colour picker control
   this.gridColLabel = new Label(this);
   this.gridColLabel.minWidth = controlParameters.minLabelWidth;
   this.gridColLabel.text = "Grid:";
   this.gridColLabel.textAlignment = -1;
   this.gridColList = new ComboBox ( this );
   this.gridColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.gridColList.addItem(controlParameters.colourArray[i]);
   }
   this.gridColList.currentItem = this.gridColList.findItem(controlParameters.graphGridCol);;
   this.gridColList.toolTip =
      "<p>Specifies the colour to use for the grid.</p>";
   this.gridColList.onItemSelected = function( index )
   {
      controlParameters.graphGridCol = this.itemText(index);
   }
   this.gridActive = new CheckBox(this);
   this.gridActive.text = "";
   this.gridActive.toolTip = "Check box controls whether grid lines are plotted";
   this.gridActive.checked = controlParameters.graphGridActive;
   this.gridActive.onCheck = function(checked)
   {
      controlParameters.graphGridActive = checked;
   }
   this.gridColControl = new HorizontalSizer(this);
   this.gridColControl.margin = 0;
   this.gridColControl.spacing = 4;
   this.gridColControl.add(this.gridColLabel);
   this.gridColControl.add(this.gridColList);
   this.gridColControl.add(this.gridActive);
   this.gridColControl.addStretch();

   // create stretch plot colour picker control
   this.stretchColLabel = new Label(this);
   this.stretchColLabel.minWidth = controlParameters.minLabelWidth;
   this.stretchColLabel.text = "Stretch transformation:";
   this.stretchColLabel.textAlignment = -1;
   this.stretchColList = new ComboBox ( this );
   this.stretchColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.stretchColList.addItem(controlParameters.colourArray[i]);
   }
   this.stretchColList.currentItem = this.stretchColList.findItem(controlParameters.graphLineCol);;
   this.stretchColList.toolTip =
      "<p>Specifies the colour to use for the stretch plot.</p>";
   this.stretchColList.onItemSelected = function( index )
   {
      controlParameters.graphLineCol = this.itemText(index);
   }
   this.stretchActive = new CheckBox(this);
   this.stretchActive.text = "";
   this.stretchActive.toolTip = "Check box controls whether stretch transformation is plotted";
   this.stretchActive.checked = controlParameters.graphLineActive;
   this.stretchActive.onCheck = function(checked)
   {
      controlParameters.graphLineActive = checked;
   }
   this.stretchColControl = new HorizontalSizer(this);
   this.stretchColControl.margin = 0;
   this.stretchColControl.spacing = 4;
   this.stretchColControl.add(this.stretchColLabel);
   this.stretchColControl.add(this.stretchColList);
   this.stretchColControl.add(this.stretchActive);
   this.stretchColControl.addStretch();

   // create "neutral stretch line" colour picker control
   this.ref1ColLabel = new Label(this);
   this.ref1ColLabel.minWidth = controlParameters.minLabelWidth;
   this.ref1ColLabel.text = "Neutral stretch:";
   this.ref1ColLabel.textAlignment = -1;
   this.ref1ColList = new ComboBox ( this );
   this.ref1ColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.ref1ColList.addItem(controlParameters.colourArray[i]);
   }
   this.ref1ColList.currentItem = this.ref1ColList.findItem(controlParameters.graphRef1Col);
   this.ref1ColList.toolTip =
      "<p>Specifies the colour to use for a reference line showing no stretch.";
   this.ref1ColList.onItemSelected = function( index )
   {
      controlParameters.graphRef1Col = this.itemText(index);
   }
   this.ref1Active = new CheckBox(this);
   this.ref1Active.text = "";
   this.ref1Active.toolTip = "Check box controls whether neutral stretch line is plotted";
   this.ref1Active.checked = controlParameters.graphRef1Active;
   this.ref1Active.onCheck = function(checked)
   {
      controlParameters.graphRef1Active = checked;
   }
   this.ref1ColControl = new HorizontalSizer(this);
   this.ref1ColControl.margin = 0;
   this.ref1ColControl.spacing = 4;
   this.ref1ColControl.add(this.ref1ColLabel);
   this.ref1ColControl.add(this.ref1ColList);
   this.ref1ColControl.add(this.ref1Active);
   this.ref1ColControl.addStretch();

   // create "graph click indicator line" colour picker control
   this.ref2ColLabel = new Label(this);
   this.ref2ColLabel.minWidth = controlParameters.minLabelWidth;
   this.ref2ColLabel.text = "Graph selection line:";
   this.ref2ColLabel.textAlignment = -1;
   this.ref2ColList = new ComboBox ( this );
   this.ref2ColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.ref2ColList.addItem(controlParameters.colourArray[i]);
   }
   this.ref2ColList.currentItem = this.ref2ColList.findItem(controlParameters.graphRef2Col);
   this.ref2ColList.toolTip =
      "<p>Specifies the colour to use for a reference line showing where on the graph the user has clicked." +
      " The graph click information displayed relates to this location on the graph.";
   this.ref2ColList.onItemSelected = function( index )
   {
      controlParameters.graphRef2Col = this.itemText(index);
   }
   this.ref2Active = new CheckBox(this);
   this.ref2Active.text = "";
   this.ref2Active.toolTip = "Check box controls whether graph selection line is plotted";
   this.ref2Active.checked = controlParameters.graphRef2Active;
   this.ref2Active.onCheck = function(checked)
   {
      controlParameters.graphRef2Active = checked;
   }
   this.ref2ColControl = new HorizontalSizer(this);
   this.ref2ColControl.margin = 0;
   this.ref2ColControl.spacing = 4;
   this.ref2ColControl.add(this.ref2ColLabel);
   this.ref2ColControl.add(this.ref2ColList);
   this.ref2ColControl.add(this.ref2Active);
   this.ref2ColControl.addStretch();

   // create graph background colour picker control
   this.backColLabel = new Label(this);
   this.backColLabel.minWidth = controlParameters.minLabelWidth;
   this.backColLabel.text = "Graph background:";
   this.backColLabel.textAlignment = -1;
   this.backColList = new ComboBox ( this );
   this.backColList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.colourArray.length; ++i)
   {
      this.backColList.addItem(controlParameters.colourArray[i]);
   }
   this.backColList.currentItem = this.backColList.findItem(controlParameters.graphBackCol);
   this.backColList.toolTip =
      "<p>Specifies the colour to use for the graph background</p>";
   this.backColList.onItemSelected = function( index )
   {
      controlParameters.graphBackCol = this.itemText(index);
   }

   this.backColControl = new HorizontalSizer(this);
   this.backColControl.margin = 0;
   this.backColControl.spacing = 4;
   this.backColControl.add(this.backColLabel);
   this.backColControl.add(this.backColList);
   this.backColControl.addStretch();

   // create a label header for the colour selectors
   this.lineColourLabel = new Label(this);
   this.lineColourLabel.minWidth = controlParameters.minLabelWidth;
   this.lineColourLabel.text = "Select colours for graph:";

   //---------------
   // Define buttons|
   //---------------

   this.resetButton = new PushButton( this )
   this.resetButton.text = "Reset";
   this.resetButton.toolTip = "<p>Reset all stretch parameters to default values.";
   this.resetButton.onClick = function(){
      this.dialog.resetDefaults();
   }

   this.closeButton = new PushButton( this )
   this.closeButton.text = "Close"
   this.closeButton.onClick = function(){
      this.dialog.ok();
   }

   //------------------------------
   // Reset default values function|
   //------------------------------

   this.resetDefaults = function()
   {
      controlParameters.moveTopLeft = controlParameters.default_moveTopLeft;
      controlParameters.bringToFront = controlParameters.default_bringToFront;
      controlParameters.checkSTF = controlParameters.default_checkSTF;
      controlParameters.selectNewImage = controlParameters.default_selectNewImage;
      controlParameters.saveLogCheck = controlParameters.default_saveLogCheck;
      controlParameters.graphHistActive[0] = controlParameters.default_graphHistActive[0];
      controlParameters.graphHistActive[1] = controlParameters.default_graphHistActive[1]
      controlParameters.graphHistCol[0] = controlParameters.default_graphHistCol[0];
      controlParameters.graphHistCol[1] = controlParameters.default_graphHistCol[1];
      controlParameters.graphRGBHistCol[0] = controlParameters.default_graphRGBHistCol[0];
      controlParameters.graphRGBHistCol[1] = controlParameters.default_graphRGBHistCol[1];
      controlParameters.graphHistType[0] = controlParameters.default_graphHistType[0];
      controlParameters.graphHistType[1] = controlParameters.default_graphHistType[1];
      controlParameters.graphGridCol = controlParameters.default_graphGridCol;
      controlParameters.graphLineCol = controlParameters.default_graphLineCol;
      controlParameters.graphRef1Col = controlParameters.default_graphRef1Col;
      controlParameters.graphRef2Col = controlParameters.default_graphRef2Col;
      controlParameters.graphBackCol = controlParameters.default_graphBackCol;
      controlParameters.graphLineActive = controlParameters.default_graphLineActive;
      controlParameters.graphGridActive = controlParameters.default_graphGridActive;
      controlParameters.graphRef1Active = controlParameters.default_graphRef1Active;
      controlParameters.graphRef2Active = controlParameters.default_graphRef2Active;


      this.topLeftCheck.checked = controlParameters.default_moveTopLeft;
      this.toFrontCheck.checked = controlParameters.default_bringToFront;
      this.stfCheck.checked = controlParameters.default_checkSTF;
      this.selectNewImage.checked = controlParameters.default_selectNewImage;
      this.saveLogCheck.checked = controlParameters.default_saveLogCheck;
      this.histUnstretchActive.checked = controlParameters.default_graphHistActive[0];
      this.histStretchActive.checked = controlParameters.default_graphHistActive[1];
      this.histColList.currentItem = this.histColList.findItem(controlParameters.default_graphHistCol[0]);
      this.stretchHistColList.currentItem = this.stretchHistColList.findItem(controlParameters.default_graphHistCol[1]);
      this.rgbHistColList.currentItem = this.rgbHistColList.findItem(controlParameters.default_graphRGBHistCol[0]);
      this.rgbStretchHistColList.currentItem = this.rgbStretchHistColList.findItem(controlParameters.default_graphRGBHistCol[1]);
      this.histTypeList.currentItem = this.histTypeList.findItem(controlParameters.default_graphHistType[0]);
      this.histStretchTypeList.currentItem = this.histStretchTypeList.findItem(controlParameters.default_graphHistType[1]);
      this.gridColList.currentItem = this.gridColList.findItem(controlParameters.default_graphGridCol);
      this.stretchColList.currentItem = this.stretchColList.findItem(controlParameters.default_graphLineCol);
      this.ref1ColList.currentItem = this.ref1ColList.findItem(controlParameters.default_graphRef1Col);
      this.ref2ColList.currentItem = this.ref2ColList.findItem(controlParameters.default_graphRef2Col);
      this.backColList.currentItem = this.backColList.findItem(controlParameters.default_graphBackCol);
      this.gridActive.checked = controlParameters.default_graphGridActive;
      this.stretchActive.checked = controlParameters.default_graphLineActive;
      this.ref1Active.checked = controlParameters.default_graphRef1Active;
      this.ref2Active.checked = controlParameters.default_graphRef2Active;
   }


   //--------------------
   // Layout the controls|
   //--------------------

   this.optionPicker = new VerticalSizer( this )
   this.optionPicker.margin = 32;
   this.optionPicker.add(this.saveLogCheck);
   this.optionPicker.addSpacing(controlParameters.layoutSpacing);
   this.optionPicker.add(this.topLeftCheck);
   this.optionPicker.addSpacing(controlParameters.layoutSpacing);
   this.optionPicker.add(this.toFrontCheck);
   this.optionPicker.addSpacing(controlParameters.layoutSpacing);
   this.optionPicker.add(this.stfCheck);
   this.optionPicker.addSpacing(controlParameters.layoutSpacing);
   this.optionPicker.add(this.selectNewImage);

   this.colourPicker = new VerticalSizer( this )
   this.colourPicker.margin = 0;
   this.colourPicker.add(this.lineColourLabel);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.histHeadControls);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.histColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.rgbHistColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.histTypeControl);
   this.colourPicker.addSpacing(2 * controlParameters.layoutSpacing);
   this.colourPicker.add(this.stretchColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.gridColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.ref1ColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.ref2ColControl);
   this.colourPicker.addSpacing(controlParameters.layoutSpacing);
   this.colourPicker.add(this.backColControl);

   this.buttons = new HorizontalSizer( this )
   this.buttons.margin = 0;
   this.buttons.add(this.resetButton);
   this.buttons.addStretch();
   this.buttons.add(this.closeButton);

   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.addSpacing(4 * controlParameters.layoutSpacing);
   this.sizer.add(this.colourPicker);
   this.sizer.addSpacing(4 * controlParameters.layoutSpacing);
   this.sizer.add(this.optionPicker);
   this.sizer.addSpacing(2 * controlParameters.layoutSpacing);
   this.sizer.add(this.buttons)

}
optionsDialog.prototype = new Dialog;

/*******************************************************************************
 * *****************************************************************************
 *
 * MAIN DIALOG
 *
 * This creates the main script dialog interface
 *
 * *****************************************************************************
 *******************************************************************************/

function stretchDialog() {
   this.__base__ = Dialog;
   this.__base__();

   // let the dialog be resizable
   this.userResizable = true;

   // set the minimum width of the dialog
   this.minWidth = controlParameters.dialogMinWidth;
   controlParameters.minLabelWidth = this.font.width( "Highlight protection point: " );

   this.windowTitle = TITLE + " - Version: " + VERSION



/*******************************************************************************
 * MAIN DIALOG - Create the graphical display control section
 *******************************************************************************/

   //----------------------------------
   // Create graphical display controls|
   //----------------------------------
   this.stretchGraph = new Frame(this);
   this.stretchGraph.backgroundColor = controlParameters.getColour("Background");
   this.stretchGraph.toolTip = "<b>Click</b> to see readout at that point.  <b>Double click</b> to centre zoom at that point"
   this.stretchGraph.setMinSize(controlParameters.graphMinWidth,controlParameters.graphMinHeight);
   this.stretchGraph.style = Frame.FrameStyle_Sunken;

   // graph onPaint function
   this.stretchGraph.onPaint = function( x0, y0, x1, y1 )
   {
      if (controlParameters.suspendGraphUpdating) return;

      // Graph geometry
      var vDim = this.height;
      var hDim = this.width;
      var gMid = controlParameters.graphMidValue;
      var gRange = controlParameters.graphRange;
      var gRes = hDim;
      var graphVZoomAdjust = Math.pow2(controlParameters.graphVZoomFactor);

      // Set background colour for the graph
      var g = new VectorGraphics(this);
      g.fillRect(0, 0, hDim, vDim, new Brush(controlParameters.getColour("Background")));
      g.end();

      // Graph horizontal axis variables
      var startX = gMid - 0.5 * gRange;
      var endX = startX + gRange;
      if (startX < 0.0)
      {
         startX = 0.0;
         endX = gRange;
      }
      if (endX > 1.0)
      {
         startX = 1.0 - gRange;
         endX = 1.0
      }
      var stepX = (endX - startX) / gRes;
      var stepCount = gRes;


      // Plot histogram and stretched histogram
      if ( !(stretchParameters.targetView.id == "") )
      {
         // get initial histogram information
         var channelCount = histArray[0].channelCount;

         var startHistMaxAt = 0;
         if (controlParameters.histExcludeZero) startHistMaxAt = 1;

         var histRes = histArray[0].channels[0].resolution;
         var normFac = [0, 0, 0];
         var normStretchFac = [0, 0, 0];

         var histColour = new Array;
         histColour.push(controlParameters.getColour("Histogram"));
         histColour.push(controlParameters.getColour("Stretched Histogram"));

         var histType = controlParameters.graphHistType;
         var rgbCol = controlParameters.graphRGBHistCol;
         var histActive = controlParameters.graphHistActive;

         // calculate some plot specific variables
         var plotDim = Math.floor(hDim / (endX - startX));
         var plotStep = 1.0 / plotDim;
         var startIndex = Math.round(startX * plotDim);
         var endIndex = startIndex + hDim - 1;
         var barsPerPixel = 1.0 * histRes / plotDim;

         // intialise histogram plot arrays histPlot[n] holds three channels of: (n = 0: unstretched), or (n = 1: stretched), histogram
         var histPlot = new Array([new Array, new Array, new Array], [new Array, new Array, new Array]);

         // calculate an array holding required stretched values
         var stretched = calculateStretch(0.0, 1.0 / histRes, 1.0);
         stretched.push(1.0);

         for (var c = 0; c < channelCount; ++c)
         {
            for (var i = 0; i < plotDim + 1; ++i) {
               histPlot[0][c].push(0);
               histPlot[1][c].push(0);}

            // create plot array and calculate maximum count for normalisation
            if ( histActive[0] ) {
               var intBar, fracBar;
               var lastCumArray = 0;
               var cumArray = 0;
               for (var i = 1; i < plotDim; ++i) {
                  intBar = Math.floor(i * barsPerPixel);
                  fracBar = Math.frac(i * barsPerPixel);
                  cumArray = fracBar * histArray[0].channels[c].data[intBar];
                  if (intBar > 0) cumArray += histArray[0].channels[c].cumData[intBar - 1];
                  histPlot[0][c][i - 1] = (cumArray - lastCumArray);
                  lastCumArray = cumArray;}
               normFac[c] =  Math.maxElem(histPlot[0][c].slice(startHistMaxAt, histPlot[0][c].length - 1)) / graphVZoomAdjust;}

            //create stretch plot array and calculate maximum count for normalisation
            if ( histActive[1] ) {
               var si, ji;
               var s0 = Math.range(stretched[0], 0.0, 1.0);
               var j0 = 0.0;
               for (var i = 0; i < histRes; ++i) {
                  si = Math.range(stretched[i], 0.0, 1.0);
                  ji = Math.min(plotDim, Math.floor(si / plotStep));
                  if (si == s0) {histPlot[1][c][j0] += histArray[0].channels[c].data[i];}
                  else {
                     for (var j = j0; j <= ji; ++j)
                     {
                        histPlot[1][c][j] += histArray[0].channels[c].data[i] * (Math.min(si, (j + 1) * plotStep) - Math.max(s0, j * plotStep)) / (si - s0);}}
                  j0 = ji;
                  s0 = si;}
               normStretchFac[c] = Math.maxElem(histPlot[1][c].slice(startHistMaxAt, histPlot[1][c].length - 1)) / graphVZoomAdjust;}
         }

         var maxNormFac =  new Array;
         maxNormFac.push(Math.maxElem(normFac));
         maxNormFac.push(Math.maxElem(normStretchFac));

         // modify plot arays if user wants a logarithmic plot otherwise just normalise data
         for (var c = 0; c < channelCount; ++c)
         {
            for (var h = 0; h < 2; ++h)
            {
               var lnMaxNormFac = Math.ln(1 + maxNormFac[h]);
               for (var i = 0; i < histPlot[h][c].length; ++i)
               {
                  if (controlParameters.logHistogram) {histPlot[h][c][i] = Math.ln(1.0 + (histPlot[h][c][i])) / lnMaxNormFac;}
                  else {histPlot[h][c][i] = histPlot[h][c][i] / maxNormFac[h];}
               }
            }
         }

         // plot any filled histograms first
         for (var H = 0; H < 2; ++H)                                                   // iterate between unstretched and stretched histograms
         {
            if ( (histType[H] == "Fill") && (maxNormFac[H] > 0) && (histActive[H]) )   // type is "fill", there's something to plot and we have been asked to plot it
            {
               if (channelCount == 1)                                                  // greyscale image
               {
                  if ( (H == 0) || (stretchParameters.channelSelector[3]) )            // it is either the unstretched histogram or it is stretched and the user has selected this channel
                  {
                     var g = new VectorGraphics(this);
                     g.antialiasing = true;
                     g.pen = new Pen(histColour[H], 1);

                     var barHeight = 0;
                     for (var i = 0; i < hDim; ++i)
                     {
                        barHeight = vDim * histPlot[H][0][startIndex + i];
                        g.drawLine(i, vDim, i, vDim - barHeight);
                     }
                     g.end();
                  }
               }
               else                                                                    // rgb image
               {
                  var pens = new Array;
                  if (rgbCol[H] == "Light")
                  {
                     pens.push(new Pen(controlParameters.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(controlParameters.getColourCode("Light red"), 1)); //Index 1: colour red
                     pens.push(new Pen(controlParameters.getColourCode("Light green"), 1)); //Index 2: colour green
                     pens.push(new Pen(controlParameters.getColourCode("Light yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(controlParameters.getColourCode("Light blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(controlParameters.getColourCode("Light magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(controlParameters.getColourCode("Light cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(controlParameters.getColourCode("Light grey"), 1)); //Index 7: colour red, green and blue = grey
                  }
                  else if (rgbCol[H] == "Mid")
                  {
                     pens.push(new Pen(controlParameters.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(controlParameters.getColourCode("Mid red"), 1)); //Index 1: colour red
                     pens.push(new Pen(controlParameters.getColourCode("Mid green"), 1)); //Index 2: colour green
                     pens.push(new Pen(controlParameters.getColourCode("Mid yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(controlParameters.getColourCode("Mid blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(controlParameters.getColourCode("Mid magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(controlParameters.getColourCode("Mid cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(controlParameters.getColourCode("Mid grey"), 1)); //Index 7: colour red, green and blue = grey
                  }
                  else
                  {
                     pens.push(new Pen(controlParameters.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(controlParameters.getColourCode("Red"), 1)); //Index 1: colour red
                     pens.push(new Pen(controlParameters.getColourCode("Green"), 1)); //Index 2: colour green
                     pens.push(new Pen(controlParameters.getColourCode("Yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(controlParameters.getColourCode("Blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(controlParameters.getColourCode("Magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(controlParameters.getColourCode("Cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(controlParameters.getColourCode("Mid grey"), 1)); //Index 7: colour red, green and blue = grey
                  }

                  var barHeight = new Array(0, 0, 0)
                  for (var i = 0; i < hDim; ++i)
                  {
                     for (var channel = 0; channel < 3; ++channel)
                     {
                        barHeight[channel] = vDim * histPlot[H][channel][startIndex + i];
                     }
                     var includeChannel = new Array;
                     includeChannel.push((H == 0) || (stretchParameters.channelSelector[0]) || (stretchParameters.channelSelector[3]))
                     includeChannel.push((H == 0) || (stretchParameters.channelSelector[1]) || (stretchParameters.channelSelector[3]))
                     includeChannel.push((H == 0) || (stretchParameters.channelSelector[2]) || (stretchParameters.channelSelector[3]))

                     var g = new VectorGraphics(this);
                     g.antialiasing = true;
                     for (var j = 0; j < vDim; ++j)
                     {
                        var plotColour = 0;
                        plotColour += (barHeight[0] >= j) * includeChannel[0];
                        plotColour += (barHeight[1] >= j) * 2 * includeChannel[1];
                        plotColour += (barHeight[2] >= j) * 4 * includeChannel[2];
                        g.pen = pens[plotColour];
                        g.drawPoint(i, vDim - j);
                     }
                     g.end();
                  }
               }//end rgb image
            }//end fill type histogram
         }//end histogram iteration

         // now plot any outline histograms
         for (var H = 0; H < 2; ++H) // iterate between unstretched and stretched histograms
         {
            if ( (histType[H] == "Draw") && (maxNormFac[H] > 0) && (histActive[H]) )   // the type is "draw", there is something to plot and we have been asked to plot it
            {
               if (channelCount == 1)                                                  // it is a greyscale image
               {
                  if ( (H == 0) || (stretchParameters.channelSelector[3]) )            // it is either the unstretched histogram or it is stretched and the user has selected this channel
                  {
                     var g = new VectorGraphics(this);
                     g.antialiasing = true;
                     g.pen = new Pen(histColour[H], 1);

                     var plotPoint = new Point;
                     var lastPlotPoint = new Point;
                     for (var i = 0; i < hDim; ++i)
                     {
                        plotPoint = new Point(i, Math.round(vDim * (1.0 - histPlot[H][0][startIndex + i])));
                        if (i > 0) g.drawLine(lastPlotPoint, plotPoint);
                        lastPlotPoint = plotPoint;
                     }
                     g.end();
                  }
               }//end greyscale image
               else                                                                    // it is an rgb colour image
               {
                  for (var c = 0; c < channelCount; ++c)                               // iterate channels
                  {
                     if ( (H == 0) || stretchParameters.channelSelector[c] || stretchParameters.channelSelector[3])
                                                                                       // it is either the unstretched histogram or it is stretched and the user has selected this channel
                     {
                        var plotColour;
                        if (rgbCol[H] == "Light")
                        {
                           switch (c)
                           {
                              case 0: plotColour = controlParameters.getColourCode("Light red"); break;
                              case 1: plotColour = controlParameters.getColourCode("Light green"); break;
                              case 2: plotColour = controlParameters.getColourCode("Light blue"); break;
                              plotColour = controlParameters.getColour("Stretched Histogram");
                           }
                        }
                        else if (rgbCol[H] == "Mid")
                        {
                           switch (c)
                           {
                              case 0: plotColour = controlParameters.getColourCode("Mid red"); break;
                              case 1: plotColour = controlParameters.getColourCode("Mid green"); break;
                              case 2: plotColour = controlParameters.getColourCode("Mid blue"); break;
                              plotColour = controlParameters.getColour("Stretched Histogram");
                           }
                        }
                        else
                        {
                           switch (c)
                           {
                              case 0: plotColour = controlParameters.getColourCode("Red"); break;
                              case 1: plotColour = controlParameters.getColourCode("Green"); break;
                              case 2: plotColour = controlParameters.getColourCode("Blue"); break;
                              plotColour = controlParameters.getColour("Stretched Histogram");
                           }
                        }

                        var g = new VectorGraphics(this);
                        g.antialiasing = true;
                        g.pen = new Pen(plotColour, 1);

                        var plotPoint = new Point;
                        var lastPlotPoint = new Point;
                        for (var i = 0; i < hDim; ++i)
                        {
                           plotPoint = new Point(i, Math.round(vDim * (1.0 - histPlot[H][c][startIndex + i])));
                           if (i > 0) g.drawLine(lastPlotPoint, plotPoint);
                           lastPlotPoint = plotPoint;
                        }
                        g.end();
                     }
                  }//end channel
               }//end rgb image
            }//end draw type histogram
         }//end histogram iteration
      }//end histogram block


      // Draw the grid
      if (controlParameters.graphGridActive)
      {
         var g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(controlParameters.getColour("Grid"));
         var hGridStep = hDim / controlParameters.graphHGridCount;
         var vGridStep = vDim / controlParameters.graphVGridCount;
         for (var i = 0; i < controlParameters.graphHGridCount; ++i)
         {
            var s = i * hGridStep;
            g.drawLine(s, vDim, s, 0);
         }
         for (var i = 0; i < controlParameters.graphVGridCount; ++i)
         {
            var s = i * vGridStep;
            g.drawLine(0, s, hDim, s);
         }
         g.end();
      }


      // Plot reference line indicating a neutral or zero stretch
      if (controlParameters.graphRef1Active)
      {
         var g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(controlParameters.getColour("Reference1"), controlParameters.refLineWidth);
         g.drawLine(0, (1.0 - startX) * vDim, hDim, (1.0 - endX) * vDim);
         g.end();
      }

      // Plot a reference line showing where the graph was last clicked
      if ( (controlParameters.graphRef2Active) && !(controlParameters.clickLevel < 0.0) )
      {
         var g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(controlParameters.getColour("Reference2"), controlParameters.refLineWidth);
         var clickX = controlParameters.clickLevel;
         if ( !(clickX < startX) && !(clickX > endX) )
         {
            g.drawLine(hDim * (clickX - startX) / (endX - startX), vDim * graphVZoomAdjust, hDim * (clickX - startX) / (endX - startX), 0);
         }
         g.end();
      }

      // Plot the stretch transformation graph
      var stretchValues = calculateStretch(startX, stepX, endX);
      stretchValues.push(1.0);
      if ( (controlParameters.graphLineActive) )
      {
         var g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(controlParameters.getColour("Stretch"), controlParameters.graphLineWidth);
         var xOld = 0;
         var yOld = (1.0 - stretchValues[0]) * vDim;
         for (var i = 0; i < stepCount; ++i)
         {
            var x = startX + stepX * (i + 1.0);
            var xNew = (i + 1) * hDim / stepCount;
            var y = stretchValues[i + 1] * graphVZoomAdjust;
            var yNew = (1.0 - y) * vDim;
            g.drawLine(xOld, yOld, xNew, yNew);
            xOld = xNew;
            yOld = yNew;
         }
         g.end();
      }
   }

   //graph mouse click  function
   this.stretchGraph.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      var p  = x / this.width;
      var currentMidValue = controlParameters.graphMidValue;
      var currentRange = controlParameters.graphRange;
      var currentMinValue = currentMidValue - 0.5 * currentRange;
      var currentMaxValue = currentMidValue + 0.5 * currentRange;
      if (currentMinValue < 0.0) currentMinValue = 0.0;
      if (currentMaxValue > 1.0) currentMinValue = 1.0 - currentRange;
      controlParameters.clickLevel = currentMinValue + p  * currentRange;
      this.dialog.updateControls();
   }

   // graph mouse double click function
   this.stretchGraph.onMouseDoubleClick = function(x, y, button, buttonState, modifiers)
   {   // Centre the pan control at the click point
      var p  = x / this.width;
      var currentMidValue = controlParameters.graphMidValue;
      var currentRange = controlParameters.graphRange;
      var currentMinValue = currentMidValue - 0.5 * currentRange;
      var currentMaxValue = currentMidValue + 0.5 * currentRange;
      if (currentMinValue < 0.0) currentMinValue = 0.0;
      if (currentMaxValue > 1.0) currentMinValue = 1.0 - currentRange;
      var newMidValue = currentMinValue + p  * currentRange;
      this.dialog.panControl.setValue(newMidValue);
      controlParameters.graphMidValue = newMidValue;
      this.dialog.updateControls();
   }

/*******************************************************************************
 * MAIN DIALOG - Create the graph click information controls
 *******************************************************************************/

   // create the graph click information controls
   this.graphInfo1 = new Label( this )
   this.graphInfo1.style = Frame.FrameStyle_Box;
   this.graphInfo1.text = controlParameters.graphInfoText;
   this.graphInfo1.minWidth = controlParameters.minLabelWidth;
   this.graphInfo1.readOnly = true;
   this.graphInfo1.useRichText = true;
   this.graphInfoButton = new ToolButton( this );
   this.graphInfoButton.icon = this.scaledResource(":/icons/clear.png");
   this.graphInfoButton.setScaledFixedSize(24, 24);
   this.graphInfoButton.toolTip =
            "<p>Reset graph selection point</p>";
   this.graphInfoButton.onClick = function( checked ) {
      controlParameters.clickLevel = -1.0;
      this.dialog.updateControls();
   }

   this.graphInfoLabels = new VerticalSizer( this )
   this.graphInfoLabels.margin = 0;
   this.graphInfoLabels.spacing = controlParameters.layoutSpacing;
   this.graphInfoLabels.add(this.graphInfo1);

   this.graphInfoControls = new HorizontalSizer( this )
   this.graphInfoControls.margin = 0;
   this.graphInfoControls.spacing = controlParameters.layoutSpacing;
   this.graphInfoControls.add(this.graphInfoLabels);
   this.graphInfoControls.add(this.graphInfoButton);

/*******************************************************************************
 * MAIN DIALOG - Create the channel selection checkboxes
 *******************************************************************************/

   // create RGB/K checkbox
   this.selectRGBKCheck = new RadioButton( this )
   this.selectRGBKCheck.text = "RGB/K";
   this.selectRGBKCheck.checked = stretchParameters.channelSelector[3];
   this.selectRGBKCheck.toolTip =
         "<p>Apply stretch to all channels</p>";
   this.selectRGBKCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[3] = checked;
      this.dialog.updateControls();
   }

   // create R checkbox
   this.selectRCheck = new RadioButton( this )
   this.selectRCheck.text = "R";
   this.selectRCheck.checked = stretchParameters.channelSelector[0];
   this.selectRCheck.toolTip =
         "<p>Apply stretch to R channel only</p>";
   this.selectRCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[0] = checked;
      this.dialog.updateControls();
   }

   // create G checkbox
   this.selectGCheck = new RadioButton( this )
   this.selectGCheck.text = "G";
   this.selectGCheck.checked = stretchParameters.channelSelector[1];
   this.selectGCheck.toolTip =
         "<p>Apply stretch to G channel only</p>";
   this.selectGCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[1] = checked;
      this.dialog.updateControls();
   }

   // create B checkbox
   this.selectBCheck = new RadioButton( this )
   this.selectBCheck.text = "B";
   this.selectBCheck.checked = stretchParameters.channelSelector[2];
   this.selectBCheck.toolTip =
         "<p>Apply stretch to B channel only</p>";
   this.selectBCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[2] = checked;
      this.dialog.updateControls();
   }


   // create log graph checkbox
   this.logGraphCheck = new CheckBox( this )
   this.logGraphCheck.text = "Show log histogram";
   this.logGraphCheck.checked = controlParameters.logHistogram;
   this.logGraphCheck.toolTip =
         "<p>Plot histogram count on a log scale. " +
         "The log scale histogram is useful to check for small pixel counts. " +
         "These are often brighter pixels that are very important for the image, " +
         "despite their low counts. An example is stars which may not be visible in the " +
         "linear histogram view. </p>";
   this.logGraphCheck.onCheck = function( checked )
   {
      controlParameters.logHistogram = checked;
      this.dialog.updateControls();
   }

   // layout channel selector checkboxes
   this.channelSelectorControls = new HorizontalSizer( this )
   this.channelSelectorControls.margin = 0;
   this.channelSelectorControls.spacing = 4;
   this.channelSelectorControls.add(this.selectRCheck);
   this.channelSelectorControls.add(this.selectGCheck);
   this.channelSelectorControls.add(this.selectBCheck);
   this.channelSelectorControls.add(this.selectRGBKCheck);
   this.channelSelectorControls.addStretch();
   this.channelSelectorControls.add(this.logGraphCheck);


   this.plotControlsLeft = new VerticalSizer( this )
   this.plotControlsLeft.margin = 0;
   this.plotControlsLeft.spacing = controlParameters.layoutSpacing;
   this.plotControlsLeft.add(this.stretchGraph);
   this.plotControlsLeft.add(this.channelSelectorControls);
   this.plotControlsLeft.add(this.graphInfoControls);

/*******************************************************************************
 * MAIN DIALOG - Create the graph navigation controls
 *******************************************************************************/

   //Add zoom control for the graph
   this.zoomControl = new NumericControl(this);
   this.zoomControl.label.text = "Zoom:";
   this.zoomControl.label.minWidth = controlParameters.minLabelWidth;
   this.zoomControl.setRange(1.0, controlParameters.zoomMax);
   this.zoomControl.setPrecision( controlParameters.zoomPrecision );
   this.zoomControl.slider.setRange( 1.0, Math.pow10(controlParameters.zoomPrecision) );
   this.zoomControl.setValue(1.0);
   this.zoomControl.toolTip = "<p>Zooms the graph view centred on the panning point.</p>";
   this.zoomControl.onValueUpdated = function(value) {
      controlParameters.graphRange = 1.0 / value;
      this.dialog.updateControls();
   }

   // create zoom reset button
   this.resetZoomButton = new ToolButton(this);
   this.resetZoomButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetZoomButton.setScaledFixedSize( 24, 24 );
   this.resetZoomButton.toolTip = "<p>Reset zoom.</p>";
   this.resetZoomButton.onClick = () => {
      controlParameters.graphRange = 1.0;
      this.dialog.updateControls();
   }

   // layout zoom controls
   this.zoomControls = new HorizontalSizer( this )
   this.zoomControls.margin = 0;
   this.zoomControls.spacing = 4;
   this.zoomControls.add(this.zoomControl);
   this.zoomControls.add(this.resetZoomButton);

   //Add pan control for the graph
   this.panControl = new NumericControl( this );
   this.panControl.label.text = "Pan:";
   this.panControl.label.minWidth = controlParameters.minLabelWidth;
   this.panControl.setRange(0.0, 1.0);
   this.panControl.setPrecision( controlParameters.panPrecision );
   this.panControl.slider.setRange( 0, Math.pow10(controlParameters.panPrecision) );
   this.panControl.setValue(0.0);
   this.panControl.toolTip = "<p>Pans the graph view and specifies the centre point for a zoom." +
            " The pan point may be set by double mouse click on the graph.</p>";
   this.panControl.onValueUpdated = function(value) {
      controlParameters.graphMidValue = value;
      this.dialog.updateControls();
   }

   // create pan reset button
   this.resetPanButton = new ToolButton(this);
   this.resetPanButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetPanButton.setScaledFixedSize( 24, 24 );
   this.resetPanButton.toolTip = "<p>Reset zoom.</p>";
   this.resetPanButton.onClick = () => {
      controlParameters.graphMidValue = 0.0;
      this.dialog.updateControls();
   }

   // layout pan controls
   this.panControls = new HorizontalSizer( this )
   this.panControls.margin = 0;
   this.panControls.spacing = 4;
   this.panControls.add(this.panControl);
   this.panControls.add(this.resetPanButton);

/*******************************************************************************
 * MAIN DIALOG - Create the histogram data controls
 *******************************************************************************/

   this.histDataObject = new histDataControl();
   this.histogramData = this.histDataObject.control;
   this.histogramData.minWidth = 350;

/*******************************************************************************
 * MAIN DIALOG - Create the view picker
 *******************************************************************************/

   // add a view picker
   this.viewListLabel = new Label(this);
   this.viewListLabel.minWidth = controlParameters.minLabelWidth;
   this.viewListLabel.text = "Target view:";
   this.viewListLabel.textAlignment = -1;
   this.viewList = new ViewList(this);
   this.viewList.getAll();
   stretchParameters.targetView = this.viewList.currentView;
   this.viewList.onViewSelected = function (view) {
      // If the selected view has an STF applied then offer to remove this
      if ((view.id != "") && (controlParameters.checkSTF))
      {
         var A = new Array();
         A =   [[ 0.5, 0, 1, 0, 1],
               [ 0.5, 0, 1, 0, 1],
               [ 0.5, 0, 1, 0, 1],
               [ 0.5, 0, 1, 0, 1]];

         var stfApplied = false;
         for (var i = 0; i < view.stf.length; i++) {
            if (view.stf[i].toString() != A[i].toString()) stfApplied = true;}

         if (stfApplied) {
            var stfWarning = "Seleted view has a screen transfer function applied.<br><br>Do you wish to remove this?";
            var stfMsgReturn = (new MessageBox( stfWarning, "Warning", StdIcon_Warning, StdButton_Yes, StdButton_No )).execute();
            if (stfMsgReturn == StdButton_Yes) { view.stf = A;}}
      }

      // If the selected view has a mask enabled then warn user how this will be treated and offer to disable
      if ((view.id != "") && (controlParameters.checkSTF))
      {
         if ((view.window.mask.currentView.id != "") && view.window.maskEnabled)
         {
            var maskWarning = "Selected view has a mask enabled.<br><br>"
            maskWarning += "If left enabled the mask will be applied when a stretch is applied to the existing image.<br><br>"
            maskWarning += "However, it will be ignored if a stretch is applied with the create new image option enabled.<br><br>"
            maskWarning += "Would you prefer to disable the current mask?"
            var maskMsgReturn = new MessageBox( maskWarning, "Warning", StdIcon_Warning, StdButton_Yes, StdButton_No).execute();
            if (maskMsgReturn == StdButton_Yes)
            {
               view.window.maskEnabled = false;
               view.window.maskVisible = false;
            }
         }
      }

      stretchParameters.targetView = view;
      if ((view.id != "") && (!ghsStretchLog.hasItem(view.id))) {ghsStretchLog.add(view.id, "First opened from view list");}

      newImageRefresh();
      this.dialog.updateControls();
   }

   // prepare the image inspection button
   this.imageInspectorButton = new ToolButton( this );
   this.imageInspectorButton.icon = this.scaledResource( ":/icons/picture.png" );
   this.imageInspectorButton.setScaledFixedSize( 24, 24 );
   this.imageInspectorButton.toolTip = "<p>Open a new dialog to inspect the image.  " +
                  "Here you will be able to query the target image to match the histogram " +
                  "and preview/query the stretch according to the currently set parameters. </p>";
   this.imageInspectorButton.onClick = () => {
      if (stretchParameters.targetView.id != "")
      {
         var imgDialog = new imageDialog();
         imgDialog.execute();
      }
      else
      {
         var warn2Message = "Image inspector cannot be run without a target image being selected";
         var msgReturn = (new MessageBox( warn2Message, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      ghsViews.tidyUp()
      this.dialog.viewList.reload();
      this.dialog.updateControls();
   }


   this.viewPicker = new HorizontalSizer(this);
   this.viewPicker.margin = 0;
   this.viewPicker.spacing = controlParameters.layoutSpacing;
   this.viewPicker.add(this.viewListLabel);
   this.viewPicker.add(this.viewList);
   this.viewPicker.add(this.imageInspectorButton);
   this.viewPicker.addStretch();

   // create new image checkbox
   this.newImageLabel = new Label(this);
   this.newImageLabel.minWidth = controlParameters.minLabelWidth;
   this.newImageLabel.text = "";
   this.newImageLabel.textAlignment = -1;
   this.newImageCheck = new CheckBox( this )
   this.newImageCheck.text = "Create new image on execution";
   this.newImageCheck.checked = stretchParameters.createNewImage;
   this.newImageCheck.toolTip =
         "<p>Create a new image on application of the stretch. When selected, the target " +
         "image will remain unchanged or unstretched.  Instead a new image will be generated. " +
         "When selected, any mask applied to the target image will be ignored. To apply an active mask " +
         "this box must be left unchecked, so that the target image will be replaced (over-written) " +
         "by the stretch result. </p>";
   this.newImageCheck.onCheck = function( checked )
   {
      stretchParameters.createNewImage = checked;
   }

   this.newImageControl = new HorizontalSizer(this);
   this.newImageControl.margin = 0;
   this.newImageControl.spacing = controlParameters.layoutSpacing;
   this.newImageControl.add(this.newImageLabel);
   this.newImageControl.add(this.newImageCheck);
   this.newImageControl.addStretch();


/*******************************************************************************
 * MAIN DIALOG - Create the main parameter input controls
 *******************************************************************************

   *****************************************************************************
   *********** create the stretch type selector ********************************
*/

   this.algoListLabel = new Label(this);
   this.algoListLabel.minWidth = controlParameters.minLabelWidth;
   this.algoListLabel.text = stretchParameters.name_ST;
   this.algoListLabel.textAlignment = -1;
   this.algoList = new ComboBox ( this );
   this.algoList.minWidth = controlParameters.minLabelWidth;
   for (var i = 0; i < controlParameters.stretchTypes.length; ++i)
   {
      this.algoList.addItem(controlParameters.stretchTypes[i]);
   }
   this.algoList.currentItem = stretchParameters.ST;
   this.algoList.toolTip =
      "<p>Specifies the algorithm to use for stretching. In most cases " +
      "this will be the Generalised Hyperbolic Stretch equations designed for this script. " +
      "Other options include the standard HT/STF and arcsinh functions to which the script brings " +
      "additional functionality.  Set to 'Linear Pre-stretch' to set the black-point level and conduct " +
      "a linear stretch to regain contrast.  'Invert Image' inverts the target image which can be useful to " +
      "work on brighter areas, after which the image can be re-inverted.</p>";
   this.algoList.onItemSelected = function( index )
   {
      if ( !(stretchParameters.ST == index) )
      {
         stretchParameters.ST = index;
         this.dialog.updateControls();
      }
   }

   // define a button to suggest parameter values
   this.suggestParametersButton = new ToolButton(this);
   this.suggestParametersButton.icon = this.scaledResource( ":/icons/process.png" );
   this.suggestParametersButton.setScaledFixedSize( 24, 24 );
   this.suggestParametersButton.toolTip = "<p>Suggest parameter values</p>";
   this.suggestParametersButton.onMousePress = function( x, y, button, buttonState, modifiers ) {
      if (stretchParameters.targetView.id == "")
      {
         var warn1Message = "Parameter suggestion cannot be run without a view being selected";
         var msgReturn = (new MessageBox( warn1Message, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      else
      {
         var warnMessage = "Unable to calculate suggested stretch parameters.";
         var invertMessage = "Image appears to be inverted. Please invert and try again.";

         if (modifiers == KeyModifier_Control) {var suggestedSPAs = getAutoStretchParameters();}
         else {var suggestedSPAs = getAutoStretchParametersSTF();}

         if (suggestedSPAs[0][6] < 0.0)
         {
            var msgReturn = (new MessageBox( invertMessage, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
            return;
         }

         var currentSPA = stretchParameters.getParameterArray();

         if (histArray[0].channelCount == 1)
         {
            if (suggestedSPAs[0][1] < 0.0)
            {
               var msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
               return;
            }
            else
            {
               stretchParameters.validateParameterArray(suggestedSPAs[0], true);
               stretchParameters.setParameterArray(suggestedSPAs[0]);
            }
         }
         else
         {
            var red = stretchParameters.channelSelector[0];
            var green = stretchParameters.channelSelector[1];
            var blue = stretchParameters.channelSelector[2];
            var rgb = stretchParameters.channelSelector[3];

            var trySPA = new Array;
            trySPA.push(suggestedSPAs[0][0]);
            for (var i = 1; i < suggestedSPAs[0].length; ++i)
            {
               var nextValue = (red + rgb / 3) * suggestedSPAs[0][i];
               nextValue += (green + rgb / 3) * suggestedSPAs[1][i];
               nextValue += (blue + rgb / 3) * suggestedSPAs[2][i];
               trySPA.push(nextValue);
            }

            if (trySPA[1] < 0.0)
            {
               var msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
               return;
            }
            else
            {
               stretchParameters.validateParameterArray(trySPA, true);
               stretchParameters.setParameterArray(trySPA);
            }
         }
         this.dialog.updateControls();

         var qtnMessage = "<p>Parameters have been updated to suggested values.<br>" +
                           "<br>Do you want to keep these parameters?</p>";
         var qtnAnswer = (new MessageBox( qtnMessage, "", StdIcon_Question, StdButton_Yes, StdButton_No)).execute();
         if (qtnAnswer == StdButton_No)
         {
            this.dialog.setControls(currentSPA)
         }
         this.dialog.updateControls();
      }
   }

   this.algoPicker = new HorizontalSizer(this);
   this.algoPicker.margin = 0;
   this.algoPicker.spacing = 4;
   this.algoPicker.add(this.algoListLabel);
   this.algoPicker.add(this.algoList);
   this.algoPicker.addStretch();
   this.algoPicker.add(this.suggestParametersButton)

/*
   ***************************************************************************
   *********** create the D input slider *************************************
*/

   this.DControl = new NumericControl(this);
   this.DControl.label.text = stretchParameters.name_D;
   this.DControl.label.minWidth = controlParameters.minLabelWidth;
   this.DControl.setRange(controlParameters.DMin, controlParameters.DMax);
   this.DControl.setPrecision( controlParameters.DPrecision );
   this.DControl.slider.setRange( 0, Math.pow10(controlParameters.DPrecision) );
   this.DControl.setValue(stretchParameters.D);
   this.DControl.toolTip = "<p>Controls the amount of stretch. D is a variable that independently controls the contrast added (the slope of " +
      "the stretch transform) at SP, thus adjusting the amount of stretch applied to the rest of the image.  D does not change the 'form' of " +
      "the stretch, simply the amount.  D should be used in tandem with b to control the distribution of contrast and brightness. When D is set " +
      "to zero, the stretch transform will be the identity (y=x) or 'no stretch' transform.</p>";
   this.DControl.onValueUpdated = function( value )
   {
      stretchParameters.D = value;
      this.dialog.updateControls();
   }

   // create D reset button
   this.resetDButton = new ToolButton(this);
   this.resetDButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetDButton.setScaledFixedSize( 24, 24 );
   this.resetDButton.toolTip = "Reset " + stretchParameters.name_D + " to " +
            stretchParameters.default_D.toFixed(controlParameters.DPrecision) + ".";
   this.resetDButton.onClick = () => {
      stretchParameters.D = stretchParameters.default_D;
      this.dialog.updateControls();
   }

   // layout D controls
   this.DControls = new HorizontalSizer( this )
   this.DControls.margin = 0;
   this.DControls.spacing = 4;
   this.DControls.add(this.DControl);
   this.DControls.add(this.resetDButton);

/*
   ***************************************************************************
   *********** create the b input slider *************************************
*/

   this.bControl = new NumericControl(this);
   this.bControl.label.text = stretchParameters.name_b;
   this.bControl.label.minWidth = controlParameters.minLabelWidth;
   this.bControl.setRange(controlParameters.bMin, controlParameters.bMax);
   this.bControl.setPrecision( controlParameters.bPrecision );
   this.bControl.slider.setRange( 0, Math.pow10(controlParameters.bPrecision));
   this.bControl.setValue(stretchParameters.b);
   this.bControl.toolTip = "<p>Controls how tightly focused the stretch is around " + stretchParameters.name_SP +
      " by changing the form of the transform iteself. For concentrated stretches (such as initial stretches on linear images)" +
      " a large +ve b factor should be employed to focus" +
      " a stretch within a histogram peak while de-focusing the stretch away from the histogram peak (such as bright stars)." +
      " For adjustment of non-linear images, lower or -ve b (and/or lower D) parameters should be employed to distribute" +
      " contrast and brightness more evenly.  Large positive values of 'b' can be thought of as a histogram widener, ie spreading the histogram wider about the" +
      " focus point, SP.  By contrast, lower and -ve values of b tend to shift the histogram to a brighter (or dimmer) position without affecting its width too greatly." +
      " As a general rule, the level of b employed will decrease as a stretch sequence nears completion, although" +
      " larger +ve b values (with small D) can still be employed for precise placement of additional contrast.</p>";
   this.bControl.onValueUpdated = function( value )
   {
      stretchParameters.b = value;
      this.dialog.updateControls();
   }

   // create b reset button
   this.resetbButton = new ToolButton(this);
   this.resetbButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetbButton.setScaledFixedSize( 24, 24 );
   this.resetbButton.toolTip = "Reset " + stretchParameters.name_b + " to " +
            stretchParameters.default_b.toFixed(controlParameters.bPrecision) + ".";
   this.resetbButton.onClick = () => {
      stretchParameters.b = stretchParameters.default_b;
      this.dialog.updateControls();
   }

   // layout b controls
   this.bControls = new HorizontalSizer( this )
   this.bControls.margin = 0;
   this.bControls.spacing = 4;
   this.bControls.add(this.bControl);
   this.bControls.add(this.resetbButton);
/*
   ***************************************************************************
   *********** create the SP input slider ************************************
*/

   this.SPControl = new NumericControl(this);
   this.SPControl.label.text = stretchParameters.name_SP;
   this.SPControl.label.minWidth = controlParameters.minLabelWidth;
   this.SPControl.setRange(controlParameters.SPMin, controlParameters.SPMax);
   this.SPControl.setPrecision( controlParameters.LPSPHPPrecision );
   this.SPControl.slider.setRange( 0, Math.pow10(controlParameters.LPSPHPPrecision));
   this.SPControl.setValue(stretchParameters.SP);
   this.SPControl.toolTip = "<p>Sets the focus point around which the stretch is applied - " +
      "contrast will be distributed symmetrically about SP.  While 'b' provides the degree of focus of the stretch," +
      " SP determines where that focus is applied.  SP should generally be placed within a histogram peak so that the stretch " +
      " will widen and lower the peak by adding the most contrast in the stretch at that point.  Pixel values will move away from" +
      " the SP location.  " +
      "This parameter must be greater than or equal to " + stretchParameters.name_LP + " and less than or equal to " + stretchParameters.name_HP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.SPControl.onValueUpdated = function( value )
   {
      var SP = value;
      var HP = stretchParameters.HP;
      var LP = stretchParameters.LP;
      var q = Math.pow10(-controlParameters.LPSPHPPrecision);


      if (SP >= HP)
      {
         // SP must be <= HP
         stretchParameters.SP = HP;
      }
      else if (SP < LP)
      {
         // SP must be >= LP
         stretchParameters.SP = LP;
      }
      else
      {
         stretchParameters.SP = SP;
      }

      this.setValue(stretchParameters.SP);
      this.dialog.updateControls();
   }

   // create SP reset button
   this.resetSPButton = new ToolButton(this);
   this.resetSPButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetSPButton.setScaledFixedSize( 24, 24 );
   this.resetSPButton.toolTip = "Reset " + stretchParameters.name_SP + " to " +
            stretchParameters.default_SP.toFixed(controlParameters.LPSPHPPrecision) + ".";
   this.resetSPButton.onClick = () => {
      stretchParameters.SP = stretchParameters.default_SP;
      this.dialog.updateControls();
   }

   // layout SP controls
   this.SPControls = new HorizontalSizer( this )
   this.SPControls.margin = 0;
   this.SPControls.spacing = 4;
   this.SPControls.add(this.SPControl);
   this.SPControls.add(this.resetSPButton);

/*
   ***************************************************************************
   *********** create the LP input slider ************************************
*/
   this.LPControl = new NumericControl(this);
   this.LPControl.label.text = stretchParameters.name_LP;
   this.LPControl.label.minWidth = controlParameters.minLabelWidth;
   this.LPControl.setRange(controlParameters.LPMin,controlParameters.LPMax);
   this.LPControl.setPrecision( controlParameters.LPSPHPPrecision );
   this.LPControl.slider.setRange( 0, Math.pow10(controlParameters.LPSPHPPrecision));
   this.LPControl.setValue(stretchParameters.LP);
   this.LPControl.toolTip = "<p>Sets a value below which the stretch is modified to preserve contrast in the shadows/lowlights. " +
      "This is done by performing a linear stretch of the data below the 'LP' level by reserving contrast from the rest of the image." +
      " Moving the LP level towards the current setting of SP changes both the scope (range) and the amount of this contrast reservation, the net effect" +
      " is to push the overal stretch to higher brightness levels while keeping the contrast and definition in the background.  The amount of" +
      " contrast reserved for the lowlights is such that the continuity of the stretch is preserved.  " +
      "This parameter must be greater than or equal to 0 and not greater than " + stretchParameters.name_SP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.LPControl.onValueUpdated = function( value )
   {
      var SP = stretchParameters.SP;
      var LP = value;
      var q = Math.pow10(-controlParameters.LPSPHPPrecision);

      if (LP > SP)
      {
         // LP must be <= SP
         stretchParameters.LP = SP;
      }
      else
      {
            stretchParameters.LP = LP;
      }

      this.setValue(stretchParameters.LP);
      this.dialog.updateControls();

   }

   // create LP reset button
   this.resetLPButton = new ToolButton(this);
   this.resetLPButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetLPButton.setScaledFixedSize( 24, 24 );
   this.resetLPButton.toolTip = "Reset " + stretchParameters.name_LP + " to " +
            stretchParameters.default_LP.toFixed(controlParameters.LPSPHPPrecision) + ".";
   this.resetLPButton.onClick = () => {
      stretchParameters.LP = stretchParameters.default_LP;
      this.dialog.updateControls();
   }

   // layout LP controls
   this.LPControls = new HorizontalSizer( this )
   this.LPControls.margin = 0;
   this.LPControls.spacing = 4;
   this.LPControls.add(this.LPControl);
   this.LPControls.add(this.resetLPButton);


/*
   ***************************************************************************
   *********** create the HP input slider ************************************
*/
   this.HPControl = new NumericControl(this);
   this.HPControl.label.text = stretchParameters.name_HP;
   this.HPControl.label.minWidth = controlParameters.minLabelWidth;
   this.HPControl.setRange(controlParameters.HPMin, controlParameters.HPMax);
   this.HPControl.setPrecision( controlParameters.LPSPHPPrecision );
   this.HPControl.slider.setRange( 0, Math.pow10(controlParameters.LPSPHPPrecision));
   this.HPControl.setValue(stretchParameters.HP);
   this.HPControl.toolTip = "<p>Sets a value above which the stretch is modified to preserve contrast in the highlights/stars. " +
      "This is done by performing a linear stretch of the data above the 'HP' level by reserving contrast from the rest of the image." +
      " Moving the HP level towards the current setting of SP increases both the scope (range) and the amount of this contrast reservation, the net effect" +
      " is to push the overal stretch to lower brightness levels while keeping the contrast and definition in the highlights.  The amount of" +
      " contrast reserved for the highlights is such that the continuity of the stretch is preserved.  " +
      "This parameter must be less than or equal to 1 and not less than " + stretchParameters.name_SP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.HPControl.onValueUpdated = function( value )
   {
      var SP = stretchParameters.SP;
      var HP = value;
      var q = Math.pow10(-controlParameters.LPSPHPPrecision);

      if (HP < SP)
      {
         // HP must be >= SP
         stretchParameters.HP = SP;
      }
      else
      {
         stretchParameters.HP = HP;
      }
      this.setValue(stretchParameters.HP);
      this.dialog.updateControls();
   }

   // create HP reset button
   this.resetHPButton = new ToolButton(this);
   this.resetHPButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetHPButton.setScaledFixedSize( 24, 24 );
   this.resetHPButton.toolTip = "Reset " + stretchParameters.name_HP + " to " +
            stretchParameters.default_HP.toFixed(controlParameters.LPSPHPPrecision) + ".";
   this.resetHPButton.onClick = () => {
      stretchParameters.HP = stretchParameters.default_HP;
      this.dialog.updateControls();
   }

   // layout HP controls
   this.HPControls = new HorizontalSizer( this )
   this.HPControls.margin = 0;
   this.HPControls.spacing = 4;
   this.HPControls.add(this.HPControl);
   this.HPControls.add(this.resetHPButton);

/*
   ***************************************************************************
   *********** create the BP input slider ************************************
*/
   this.BPControl = new NumericControl(this);
   this.BPControl.label.text = stretchParameters.name_BP;
   this.BPControl.label.minWidth = controlParameters.minLabelWidth;
   this.BPControl.setRange(controlParameters.BPMin, controlParameters.BPMax);
   this.BPControl.setPrecision( controlParameters.BPCPPrecision );
   this.BPControl.slider.setRange( 0, Math.pow10(controlParameters.BPCPPrecision));
   this.BPControl.setValue(stretchParameters.BP);
   this.BPControl.toolTip = "<p>Sets the black point for a linear stretch of the image." +
         "  Note that any pixel with values less than the blackpoint input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be dimmed.  Pixels with values less than the blackpoint will appear black and have 0 value." +
         "  Updating this parameter will automatically update " + stretchParameters.name_CP + "</p>";
   this.BPControl.onValueUpdated = function( value )
   {
      stretchParameters.BP = Math.range(value, controlParameters.BPMin, controlParameters.BPMax);
      var histogram = new Histogram(stretchParameters.targetView.image);
      stretchParameters.CP = normLevelToPercentile(histogram, stretchParameters.BP);
      this.dialog.updateControls();
   }
   // create button to set BP to zero
   this.resetBPButton = new ToolButton(this);
   this.resetBPButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetBPButton.setScaledFixedSize( 24, 24 );
   this.resetBPButton.toolTip = "<p>Reset pre-stretch black point to " + controlParameters.BPMin.toFixed(controlParameters.BPCPPrecision) + ".</p>";
   this.resetBPButton.onClick = () => {
      stretchParameters.BP = 0.0;
      stretchParameters.CP = 0.0;
      this.dialog.updateControls();
   }

   // layout BP controls
   this.BPControls = new HorizontalSizer( this )
   this.BPControls.margin = 0;
   this.BPControls.spacing = 4;
   this.BPControls.add(this.BPControl);
   this.BPControls.add(this.resetBPButton);

/*
   ***************************************************************************
   *********** create the CP input slider ************************************
*/

   this.CPControl = new NumericControl(this);
   this.CPControl.label.text = stretchParameters.name_CP;
   this.CPControl.label.minWidth = controlParameters.minLabelWidth;
   this.CPControl.setRange(controlParameters.CPMin, controlParameters.CPMax);
   this.CPControl.setPrecision( controlParameters.BPCPPrecision );
   this.CPControl.slider.setRange( 0, Math.pow10(controlParameters.BPCPPrecision));
   this.CPControl.setValue(stretchParameters.CP);
   this.CPControl.toolTip = "<p>Sets the clipping level for linear stretch of the image." +
         " Updating this parameter will automatically update " + stretchParameters.name_BP +
         " in such a way that only the 'CP' fraction of pixels will be clipped and set to zero in the" +
         " linear stretch." +
         "  Note that any pixel with values less than the black-point input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be dimmed.  Pixels with values less than the blackpoint will appear black and have 0 value.</p>";
   this.CPControl.onValueUpdated = function( value )
   {
      stretchParameters.CP = Math.range(value, controlParameters.CPMin, controlParameters.CPMax);
      var histogram = new Histogram(stretchParameters.targetView.image);
      stretchParameters.BP = percentileToNormLevel(histogram, stretchParameters.CP);
      this.dialog.updateControls();
   }

   // create auto detect blackpoint button
   this.resetCPButton = new ToolButton(this);
   this.resetCPButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetCPButton.setScaledFixedSize( 24, 24 );
   this.resetCPButton.toolTip = "<p>Set pre-stretch black point to maximum level for which clipping percentage is zero.</p>";
   this.resetCPButton.onClick = () => {
      if ( !(stretchParameters.targetView == "") ) {
         stretchParameters.BP = stretchParameters.targetView.image.minimum();
         stretchParameters.CP = 0.0;}
      this.dialog.updateControls();
   }

   // layout CP controls
   this.CPControls = new HorizontalSizer( this )
   this.CPControls.margin = 0;
   this.CPControls.spacing = 4;
   this.CPControls.add(this.CPControl);
   this.CPControls.add(this.resetCPButton);

/*******************************************************************************
 * MAIN DIALOG - Prepare the buttons
 *******************************************************************************/

   // prepare the create instance button
   this.newInstanceButton = new ToolButton( this );
   this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
   this.newInstanceButton.setScaledFixedSize( 24, 24 );
   this.newInstanceButton.toolTip = "New Instance";
   this.newInstanceButton.onMousePress = () => {
      // stores the parameters
      stretchParameters.save();
      // create the script instance
      this.newInstance();
   }

   // prepare the execute button
   this.execButton = new ToolButton(this);
   this.execButton.icon = this.scaledResource( ":/process-interface/execute.png" );
   this.execButton.setScaledFixedSize( 24, 24 );
   this.execButton.toolTip = "<p>Stretch the target view image using the specified parameters.</p>";
   this.execButton.onClick = () => {
      // check if a valid target view has been selected
      if (stretchParameters.targetView && stretchParameters.targetView.id) {
         // build stretch expression
         var stretch = calculateStretch();

         var expr = ["", "", "", ""];
         if (stretchParameters.channelSelector[3]) {expr[3] = stretch[0];}
         else{
            expr = ["$T", "$T", "$T", ""]
            if (stretchParameters.channelSelector[0]) {expr[0] = stretch[0];}
            if (stretchParameters.channelSelector[1]) {expr[1] = stretch[0];}
            if (stretchParameters.channelSelector[2]) {expr[2] = stretch[0];}
         }
         expr[4] = stretch[1];


         // get new image id
         var newImageId = "";
         if (stretchParameters.createNewImage) {newImageId = getCreateNewImageName(stretchParameters.targetView);}

         // Let user know what is happening
         Console.show();
         Console.writeln("Applying stretch with the following parameters:");
         Console.writeln("Stretch type:                     ", controlParameters.stretchTypes[stretchParameters.ST]);
         Console.writeln("Stretch factor:                   ", stretchParameters.D);
         Console.writeln("Local stretch intensity:          ", stretchParameters.b);
         Console.writeln("Maximum intensity point (SP):     ", stretchParameters.SP);
         Console.writeln("Shadows protection point (LP):    ", stretchParameters.LP);
         Console.writeln("Highlight protection point (HP):  ", stretchParameters.HP);
         Console.writeln("Pre-stretch blackpoint (BP):      ", stretchParameters.BP);
         Console.writeln("Pre-stretch clip proportion (CP): ", stretchParameters.CP);
         Console.writeln("Stretch channel R:                ", stretchParameters.channelSelector[0]);
         Console.writeln("Stretch channel G:                ", stretchParameters.channelSelector[1]);
         Console.writeln("Stretch channel B:                ", stretchParameters.channelSelector[2]);
         Console.writeln("Stretch channel RGB/K:            ", stretchParameters.channelSelector[3]);
         Console.writeln("Create new image:                 ", stretchParameters.createNewImage);

         Console.writeln("Variables:<br>", expr[4]);

         // perform the stretch
         var newView = applyStretch(stretchParameters.targetView, expr, newImageId, true);

         // log stretch
         ghsStretchLog.add(newView.id, stretchParameters.getStretchKey());

         // select the new image if that is what the user wants
         if (controlParameters.selectNewImage) stretchParameters.targetView = newView;

         Console.hide();

         newImageRefresh();
         this.updateControls();

      } else {
         var warnMessage = "No target view is specified";
         var msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
      }
   }

   // prepare the cancel button
   this.cancelButton = new ToolButton(this);
   this.cancelButton.icon = this.scaledResource( ":/process-interface/cancel.png" );
   this.cancelButton.setScaledFixedSize( 24, 24 );
   this.cancelButton.toolTip = "<p>Close dialog with no action.</p>";
   this.cancelButton.onClick = () => {
      this.cancel();
   }

   // prepare the undo button
   this.undoButton = new ToolButton(this);
   this.undoButton.icon = this.scaledResource( ":/toolbar/image-undo.png" );
   this.undoButton.setScaledFixedSize( 24, 24 );
   this.undoButton.toolTip = "<p>Move one step back in the process history of the target view. " +
      "<b>Beware</b> that if the view has process history that predates running this script, " +
      "repeated application of this button will undo that history as well.</p>";
   this.undoButton.onClick = () => {
      if (stretchParameters.targetView.canGoBackward) {
         stretchParameters.targetView.historyIndex -=1;
         ghsStretchLog.undo(stretchParameters.targetView.id);
      }
      newImageRefresh();
      this.updateControls();
   }

   // prepare the redo button
   this.redoButton = new ToolButton(this);
   this.redoButton.icon = this.scaledResource( ":/toolbar/image-redo.png" );
   this.redoButton.setScaledFixedSize( 24, 24 );
   this.redoButton.toolTip = "<p>Move one step forward in the process history of the target view.</p>";
   this.redoButton.onClick = () => {
      if (stretchParameters.targetView.canGoForward) {
         stretchParameters.targetView.historyIndex +=1;
         ghsStretchLog.redo(stretchParameters.targetView.id);
      }
      newImageRefresh();
      this.updateControls();
   }

   this.browseDocumentationButton = new ToolButton(this);
   this.browseDocumentationButton.icon = this.scaledResource(":/process-interface/browse-documentation.png");
   this.browseDocumentationButton.setScaledFixedSize(24, 24);
   this.browseDocumentationButton.toolTip =
            "<p>Opens a browser to view the script's documentation.</p>";
   this.browseDocumentationButton.onClick = function () {
            Dialog.browseScriptDocumentation("GeneralisedHyperbolicStretch");
            return;
    }

   // prepare the reset button
   this.resetButton = new ToolButton( this );
   this.resetButton.icon = this.scaledResource( ":/process-interface/reset.png" );
   this.resetButton.setScaledFixedSize( 24, 24 );
   this.resetButton.toolTip = "<p>Reset the stretch parameters to their default initial values.</p>";
   this.resetButton.onClick = () => {
      this.resetStretchParameterValues();
      this.updateControls();
   }

   // prepare the preferences button
   this.preferencesButton = new ToolButton( this );
   this.preferencesButton.icon = this.scaledResource( ":/process-interface/edit-preferences.png" );
   this.preferencesButton.setScaledFixedSize( 24, 24 );
   this.preferencesButton.toolTip = "<p>Set preferences.</p>";
   this.preferencesButton.onClick = () => {
      var optDialog = new optionsDialog();
      optDialog.show();
   }

   // prepare the log view button
   this.logViewButton = new ToolButton( this );
   this.logViewButton.icon = this.scaledResource( ":/icons/book-open.png" );
   this.logViewButton.setScaledFixedSize( 24, 24 );
   this.logViewButton.toolTip = "<p>View stretch log.</p>";
   this.logViewButton.onClick = () => {
      var logViewDialog = new logDialog();
      logViewDialog.execute();
   }



/*******************************************************************************
 * MAIN DIALOG - control update function
 *******************************************************************************/

   // Function to update any controls that need updating on change of input parameters
   this.updateControls = function()
   {
      if (!controlParameters.suspendUpdating)
      {
         //Check any modifications to reflect stretch type
         var ST = stretchParameters.ST;

         //if (ST != 3) stretchParameters.BP = 0.0;//Only allow linear prestretch on its own

         //Update CP to ensure consistent with BP
         var histogram = new Histogram(stretchParameters.targetView.image);
         stretchParameters.CP = normLevelToPercentile(histogram, stretchParameters.BP);

         // Update stretch parameter controls
         this.algoList.currentItem = stretchParameters.ST;
         this.DControl.setValue(stretchParameters.D);
         this.bControl.setValue(stretchParameters.b);
         this.SPControl.setValue(stretchParameters.SP);
         this.LPControl.setValue(stretchParameters.LP);
         this.HPControl.setValue(stretchParameters.HP);
         this.BPControl.setValue(stretchParameters.BP);
         this.CPControl.setValue(stretchParameters.CP);
         this.viewList.currentView = stretchParameters.targetView;

         // enable or disable stretch parameter controls as appropriate
         if ( (ST == 0) ) {                     // GHS general form
            this.DControl.enabled = true;
            this.bControl.enabled = true;
            this.SPControl.enabled = true;
            this.LPControl.enabled = true;
            this.HPControl.enabled = true;
            this.BPControl.enabled = false;
            this.CPControl.enabled = false;
            this.resetDButton.enabled = true;
            this.resetbButton.enabled = true;
            this.resetSPButton.enabled = true;
            this.resetLPButton.enabled = true;
            this.resetHPButton.enabled = true;
            this.resetBPButton.enabled = false;
            this.resetCPButton.enabled = false;}

         if (ST == 1) {                         // Traditional histogram transformation
            this.DControl.enabled = true;
            this.bControl.enabled = false;
            this.SPControl.enabled = true;
            this.LPControl.enabled = true;
            this.HPControl.enabled = true;
            this.BPControl.enabled = false;
            this.CPControl.enabled = false;
            this.resetDButton.enabled = true;
            this.resetbButton.enabled = false;
            this.resetSPButton.enabled = true;
            this.resetLPButton.enabled = true;
            this.resetHPButton.enabled = true;
            this.resetBPButton.enabled = false;
            this.resetCPButton.enabled = false;}

         if (ST == 2) {                         // Arcsinh stretch
            this.DControl.enabled = true;
            this.bControl.enabled = false;
            this.SPControl.enabled = true;
            this.LPControl.enabled = true;
            this.HPControl.enabled = true;
            this.BPControl.enabled = false;
            this.CPControl.enabled = false;
            this.resetDButton.enabled = true;
            this.resetbButton.enabled = false;
            this.resetSPButton.enabled = true;
            this.resetLPButton.enabled = true;
            this.resetHPButton.enabled = true;
            this.resetBPButton.enabled = false;
            this.resetCPButton.enabled = false;}

         if ( ST == 3) {                       // Linear prestretch
            this.DControl.enabled = false;
            this.bControl.enabled = false;
            this.SPControl.enabled = false;
            this.LPControl.enabled = false;
            this.HPControl.enabled = false;
            this.BPControl.enabled = true;
            this.CPControl.enabled = true;
            this.resetDButton.enabled = false;
            this.resetbButton.enabled = false;
            this.resetSPButton.enabled = false;
            this.resetLPButton.enabled = false;
            this.resetHPButton.enabled = false;
            this.resetBPButton.enabled = true;
            this.resetCPButton.enabled = true;}

            if ( ST == 4) {                       // Image inversion
            this.DControl.enabled = false;
            this.bControl.enabled = false;
            this.SPControl.enabled = false;
            this.LPControl.enabled = false;
            this.HPControl.enabled = false;
            this.BPControl.enabled = false;
            this.CPControl.enabled = false;
            this.resetDButton.enabled = false;
            this.resetbButton.enabled = false;
            this.resetSPButton.enabled = false;
            this.resetLPButton.enabled = false;
            this.resetHPButton.enabled = false;
            this.resetBPButton.enabled = false;
            this.resetCPButton.enabled = false;}



         if (stretchParameters.targetView.id == "")
         {
            this.CPControl.enabled = false;
            this.resetCPButton.enabled = false;
            this.imageInspectorButton.enabled = false;
            this.suggestParametersButton.enabled = false;
            this.logGraphCheck.enabled = false;
         }
         else
         {
            this.imageInspectorButton.enabled = true;
            this.suggestParametersButton.enabled = true;
            this.logGraphCheck.enabled = true;
         }

         this.dialog.viewList.reload()
         this.dialog.viewList.currentView = stretchParameters.targetView;

         var clickX = controlParameters.clickLevel;

         if ( stretchParameters.targetView.id != "" )
         {
            if (clickX < 0.0) {this.histDataObject.setTable(0);}
            else {this.histDataObject.setTable(0, [clickX, clickX, clickX]);}
         }
         else {this.histDataObject.clearTable("Select a target view", "to see histogram data");}

         this.selectRCheck.checked = stretchParameters.channelSelector[0];
         this.selectGCheck.checked = stretchParameters.channelSelector[1];
         this.selectBCheck.checked = stretchParameters.channelSelector[2];
         this.selectRGBKCheck.checked = stretchParameters.channelSelector[3];

         if (histArray[0].channelCount == 3)
         {
            this.selectRCheck.enabled = true;
            this.selectGCheck.enabled = true;
            this.selectBCheck.enabled = true;
         }
         else
         {
            this.selectRCheck.enabled = false;
            this.selectGCheck.enabled = false;
            this.selectBCheck.enabled = false;
         }

         // update the graph information
         var info1 = "<b>Readout: </b>";
         var info2 = "";
         if ( (clickX < 0.0) )
         {
            info2 = "[None]";
         }
         else
         {
            var plotY = calculateStretch(clickX);
            info2 = "x="  + clickX.toFixed(5) + ", y=" + plotY.toFixed(5);

            if ( stretchParameters.targetView.id != "" )
            {
               var level = Math.floor(clickX * histArray[0].channels[0].resolution);
               info2 += ", level=" + level
               if (histArray[0].channelCount == 1)
               {
                  var count = histArray[0].channels[0].data[level];
                  info2 += ", K=" + count;
               }
               else
               {
                  var h = ["R", "G", "B"];
                  for (var c = 0; c < histArray[0].channelCount; ++c)
                  {
                     var count = histArray[0].channels[c].data[level];
                     info2 += ", " + h[c] + "=" + count;

                  }
               }
            }
         }
         this.graphInfo1.text = info1 + info2;

         // Update the graph navigation controls
         this.zoomControl.setValue(1.0 / controlParameters.graphRange);
         this.panControl.setValue(controlParameters.graphMidValue);

         // Update the graph
         this.stretchGraph.repaint();

         // update the undo and redo buttons
         if (stretchParameters.targetView.canGoBackward) {this.undoButton.enabled = true;}
         else {this.undoButton.enabled = false;}
         if (stretchParameters.targetView.canGoForward) {this.redoButton.enabled = true;}
         else {this.redoButton.enabled = false;}


         if (clickX < 0.0) {this.graphInfoButton.enabled = false;}
         else {this.graphInfoButton.enabled = true;}
      }

      controlParameters.lastControlUpdate = new Date;
   }


   // function to reset default control values
   this.resetControls = function()
   {
      controlParameters.clickLevel = -1;
      controlParameters.graphRange = 1.0;
      controlParameters.graphMidValue = 0.0;
      stretchParameters.ST = stretchParameters.default_ST;
      this.resetStretchParameterValues();
      this.updateControls();
   }

   this.resetStretchParameterValues = function()
   {
      stretchParameters.D = stretchParameters.default_D;
      stretchParameters.b = stretchParameters.default_b;
      stretchParameters.SP = stretchParameters.default_SP;
      stretchParameters.LP = stretchParameters.default_LP;
      stretchParameters.HP = stretchParameters.default_HP;
      stretchParameters.BP = stretchParameters.default_BP;
      stretchParameters.CP = stretchParameters.default_CP;
      stretchParameters.channelSelector = [false, false, false, true];
   }

   this.setControls = function(stretchParameterArray)
   {
      stretchParameters.ST = stretchParameterArray[0];
      stretchParameters.D = stretchParameterArray[1];
      stretchParameters.b = stretchParameterArray[2];
      stretchParameters.LP = stretchParameterArray[3];
      stretchParameters.SP = stretchParameterArray[4];
      stretchParameters.HP = stretchParameterArray[5];
      stretchParameters.BP = stretchParameterArray[6];
      if (stretchParameters.targetView.id != "")
      {
         var histogram = new Histogram(stretchParameters.targetView.image);
         stretchParameters.CP = normLevelToPercentile(histogram, stretchParameters.BP);
      }
   }


/*******************************************************************************
 * DIALOG - Layout
 *******************************************************************************/
   var layoutSpacing = controlParameters.layoutSpacing;

   // layout the graph controls
   this.graphControls = new Control( this );
   this.graphControls.sizer = new VerticalSizer( this );
   this.graphControls.sizer.margin = 0;
   this.graphControls.sizer.add(this.plotControlsLeft);
   this.graphControls.sizer.addSpacing(layoutSpacing);
   this.graphControls.sizer.add(this.channelSelectorControls);
   this.graphControls.sizer.addSpacing(layoutSpacing);
   this.graphControls.sizer.add(this.zoomControls);
   this.graphControls.sizer.addSpacing(layoutSpacing);
   this.graphControls.sizer.add(this.panControls);
   this.graphBar = new SectionBar(this, "Stretch graph");
   this.graphBar.setSection(this.graphControls);

   // layout graph data controls
   this.dataControls = new Control( this );
   this.dataControls.sizer = new VerticalSizer( this );
   this.dataControls.sizer.margin = 8;
   this.dataControls.sizer.add(this.histogramData);
   this.dataBar = new SectionBar(this, "Image histogram data");
   this.dataBar.setSection(this.dataControls);

   // layout view controls
   this.viewControls = new Control( this );
   this.viewControls.sizer = new VerticalSizer( this );
   this.viewControls.sizer.margin = 0;
   this.viewControls.sizer.add(this.viewPicker);
   this.viewControls.sizer.addSpacing(layoutSpacing);
   this.viewControls.sizer.add(this.newImageControl);
   this.viewBar = new SectionBar(this, "Image control");
   this.viewBar.setSection(this.viewControls);

   // layout the main stretch controls
   this.mainStretchControls = new Control( this );
   this.mainStretchControls.sizer = new VerticalSizer( this );
   this.mainStretchControls.sizer.margin = 0;
   this.mainStretchControls.sizer.add(this.algoPicker);
   this.mainStretchControls.sizer.addSpacing(3 * layoutSpacing);
   this.mainStretchControls.sizer.add(this.DControls);
   this.mainStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.mainStretchControls.sizer.add(this.bControls);
   this.mainStretchControls.sizer.addSpacing(3 * layoutSpacing);
   this.mainStretchControls.sizer.add(this.SPControls);
   this.mainStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.mainStretchControls.sizer.add(this.LPControls);
   this.mainStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.mainStretchControls.sizer.add(this.HPControls);
   this.mainStretchControls.sizer.addSpacing(3 * layoutSpacing);
   this.mainStretchControls.sizer.add(this.BPControls);
   this.mainStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.mainStretchControls.sizer.add(this.CPControls);
   this.mainStretchBar = new SectionBar(this, "Stretch parameters");
   this.mainStretchBar.setSection(this.mainStretchControls);

   // layout the buttons
   this.buttonSizer = new HorizontalSizer;
   this.buttonSizer.margin = 0;
   this.buttonSizer.spacing = layoutSpacing;
   this.buttonSizer.add(this.newInstanceButton);
   this.buttonSizer.add(this.execButton);
   this.buttonSizer.add(this.cancelButton);
   this.buttonSizer.addStretch();
   this.buttonSizer.add(this.undoButton);
   this.buttonSizer.add(this.redoButton);
   this.buttonSizer.addStretch();
   this.buttonSizer.add(this.logViewButton);
   this.buttonSizer.add(this.preferencesButton);
   this.buttonSizer.add(this.browseDocumentationButton);
   this.buttonSizer.add(this.resetButton);

   // layout the dialog
   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.add(this.graphBar);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.graphControls);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.dataBar);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.dataControls);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.viewBar);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.viewControls);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.mainStretchBar);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.mainStretchControls);
   this.sizer.addSpacing(layoutSpacing);
   this.sizer.add(this.buttonSizer);

   this.dataControls.hide();
   this.suggestParametersButton.hide(); // this won't work even for STF version because cannot set BP with HT

   this.resetControls();

}

stretchDialog.prototype = new Dialog;

/*******************************************************************************
 * *****************************************************************************
 *
 * FUNCTION MAIN
 *
 * Script entry point
 *
 * *****************************************************************************
 *******************************************************************************/

function main() {

   //Log session start time
   controlParameters.sessionStart = new Date;

   // hide the console
   Console.hide();

   // perform the script in view context
   if (Parameters.isViewTarget) {
      // load parameters
      stretchParameters.load();

      var stretch = calculateStretch();

      // build stretch expression
      var expr = ["", "", "", ""];
      if (stretchParameters.channelSelector[3]) {expr[3] = stretch[0];}
      else{
         expr = ["$T", "$T", "$T", ""]
         if (stretchParameters.channelSelector[0]) {expr[0] = stretch[0];}
         if (stretchParameters.channelSelector[1]) {expr[1] = stretch[0];}
         if (stretchParameters.channelSelector[2]) {expr[2] = stretch[0];}
      }
      expr[4] = stretch[1];

      // get new image id
      var newImageId = "";
      if (stretchParameters.createNewImage) {newImageId = getCreateNewImageName(Parameters.targetView);}

      Console.show();
      applyStretch(Parameters.targetView, expr, newImageId, true);
      Console.hide();

      return;
   }

   // perform the script in global context
   if (Parameters.isGlobalTarget) {
      var warnMessage = "Script cannot execute in global context";
      msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
      return;
   }

   // direct context, load control parameters and create and show the dialog
   controlParameters.load();
   var dialog = new stretchDialog;
   var dialogReturn = dialog.execute();
   if (controlParameters.saveLogCheck)
   {
      var warnMessage = "Do you want to save your log before leaving?";
      var msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Question, StdButton_Yes, StdButton_No )).execute();
      if (msgReturn == StdButton_Yes)
      {
         var logViewDialog = new logDialog();
         logViewDialog.execute();
      }
   }
   controlParameters.save();
   ghsViews.tidyUp();
}

main();
