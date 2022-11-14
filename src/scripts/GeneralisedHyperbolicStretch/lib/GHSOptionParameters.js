
 /*
 * *****************************************************************************
 *
 * OPTION PARAMETER OBJECT
 * This object forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.4
 *
 * Copyright (C) 2022  Mike Cranfield
 *
 * *****************************************************************************
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


#define KEYPREFIX "GeneralisedHyperbolicStretch"

function GHSOptionParameters() {
   this.__base__ = Object;
   this.__base__();


   this.moveTopLeft = true;
   this.bringToFront = true;
   this.optimalZoom = true;
   this.checkSTF = true;
   this.selectNewImage = true;
   this.saveLogCheck = true;
   this.startupRTP = true;
   this.paramHistLink = false;
   this.supressModuleNotice = false;
   this.useProcess = true;
   this.zoomMax = 200;
   this.readoutAreaMax = 256;
   this.graphHistActive = new Array(true, true);
   this.graphHistCol = new Array("Light grey", "Mid grey");
   this.graphHistType = new Array("Draw", "Fill");
   this.graphRGBHistCol = new Array("Light","Mid");
   this.graphLineCol = "Red";
   this.graphRef1Col = "Mid grey";
   this.graphRef2Col = "Cyan";
   this.graphRef3Col = "Yellow";
   this.graphGridCol = "Mid grey";
   this.graphBackCol = "Dark grey";
   this.graphLineActive = true;
   this.graphBlockActive = true;
   this.graphBlockCol = "Blue";
   this.graphRef1Active = true;
   this.graphRef2Active = true;
   this.graphRef3Active = true;
   this.graphGridActive = true;
   this.previewWidth = 800;
   this.previewHeight = 600;
   this.previewDelay = .2;
   this.previewCrossColour = "Yellow";
   this.previewCrossActive = true;
   this.colourClip = "Clip";     // can be "Clip" or "Rescale"
   this.lumCoeffSource = "Default"; // can be "Default", "Image", or "Manual"
   this.lumCoefficients = [1, 1, 1];

   this.clone = function()
   {
      let returnValue = new GHSOptionParameters();

      returnValue.moveTopLeft = this.moveTopLeft;
      returnValue.bringToFront = this.bringToFront;
      returnValue.optimalZoom = this.optimalZoom;
      returnValue.checkSTF = this.checkSTF;
      returnValue.selectNewImage = this.selectNewImage;
      returnValue.saveLogCheck = this.saveLogCheck;
      returnValue.startupRTP = this.startupRTP;
      returnValue.paramHistLink = this.paramHistLink;
      returnValue.supressModuleNotice = this.supressModuleNotice;
      returnValue.useProcess = this.useProcess;
      returnValue.zoomMax = this.zoomMax;
      returnValue.readoutAreaMax = this.readoutAreaMax;

      returnValue.graphHistActive = new Array();
      returnValue.graphHistActive.push(this.graphHistActive[0]);
      returnValue.graphHistActive.push(this.graphHistActive[1]);

      returnValue.graphHistCol = new Array();
      returnValue.graphHistCol.push(this.graphHistCol[0]);
      returnValue.graphHistCol.push(this.graphHistCol[1]);

      returnValue.graphHistType = new Array();
      returnValue.graphHistType.push(this.graphHistType[0]);
      returnValue.graphHistType.push(this.graphHistType[1]);

      returnValue.graphRGBHistCol = new Array();
      returnValue.graphRGBHistCol.push(this.graphRGBHistCol[0]);
      returnValue.graphRGBHistCol.push(this.graphRGBHistCol[1]);

      returnValue.graphLineActive = this.graphLineActive;
      returnValue.graphBlockActive = this.graphBlockActive;
      returnValue.graphRef1Active = this.graphRef1Active;
      returnValue.graphRef2Active = this.graphRef2Active;
      returnValue.graphRef3Active = this.graphRef3Active;
      returnValue.graphGridActive = this.graphGridActive;

      returnValue.graphLineCol = this.graphLineCol;
      returnValue.graphBlockCol = this.graphBlockCol;
      returnValue.graphRef1Col = this.graphRef1Col;
      returnValue.graphRef2Col = this.graphRef2Col;
      returnValue.graphRef3Col = this.graphRef3Col;
      returnValue.graphGridCol = this.graphGridCol;
      returnValue.graphBackCol = this.graphBackCol;

      returnValue.previewWidth = this.previewWidth;
      returnValue.previewHeight = this.previewHeight;
      returnValue.previewDelay = this.previewDelay;
      returnValue.previewCrossColour = this.previewCrossColour;
      returnValue.previewCrossActive = this.previewCrossActive;

      returnValue.colourClip = this.colourClip;
      returnValue.lumCoeffSource = this.lumCoeffSource;
      returnValue.lumCoefficients[0] = this.lumCoefficients[0];
      returnValue.lumCoefficients[1] = this.lumCoefficients[1];
      returnValue.lumCoefficients[2] = this.lumCoefficients[2];

      return returnValue;
   }

   this.copy = function(ghsOP)
   {
      this.moveTopLeft = ghsOP.moveTopLeft;
      this.bringToFront = ghsOP.bringToFront;
      this.optimalZoom = ghsOP.optimalZoom;
      this.checkSTF = ghsOP.checkSTF;
      this.selectNewImage = ghsOP.selectNewImage;
      this.saveLogCheck = ghsOP.saveLogCheck;
      this.startupRTP = ghsOP.startupRTP;
      this.paramHistLink = ghsOP.paramHistLink;
      this.supressModuleNotice = ghsOP.supressModuleNotice;
      this.useProcess = ghsOP.useProcess;
      this.zoomMax = ghsOP.zoomMax;
      this.readoutAreaMax = ghsOP.readoutAreaMax;

      this.graphHistActive = ghsOP.graphHistActive;
      this.graphHistCol = ghsOP.graphHistCol;
      this.graphHistType = ghsOP.graphHistType;
      this.graphRGBHistCol = ghsOP.graphRGBHistCol;

      this.graphLineActive = ghsOP.graphLineActive;
      this.graphBlockActive = ghsOP.graphBlockActive;
      this.graphRef1Active = ghsOP.graphRef1Active;
      this.graphRef2Active = ghsOP.graphRef2Active;
      this.graphRef3Active = ghsOP.graphRef3Active;
      this.graphGridActive = ghsOP.graphGridActive;

      this.graphLineCol = ghsOP.graphLineCol;
      this.graphBlockCol = ghsOP.graphBlockCol;
      this.graphRef1Col = ghsOP.graphRef1Col;
      this.graphRef2Col = ghsOP.graphRef2Col;
      this.graphRef3Col = ghsOP.graphRef3Col;
      this.graphGridCol = ghsOP.graphGridCol;
      this.graphBackCol = ghsOP.graphBackCol;

      this.previewWidth = ghsOP.previewWidth;
      this.previewHeight = ghsOP.previewHeight;
      this.previewDelay = ghsOP.previewDelay;
      this.previewCrossColour = ghsOP.previewCrossColour;
      this.previewCrossActive = ghsOP.previewCrossActive;

      this.colourClip = ghsOP.colourClip;
      this.lumCoeffSource = ghsOP.lumCoeffSource;
      this.lumCoefficients[0] = ghsOP.lumCoefficients[0];
      this.lumCoefficients[1] = ghsOP.lumCoefficients[1];
      this.lumCoefficients[2] = ghsOP.lumCoefficients[2];
   }

   //---------------------------------------------------------------
   // Functions to persist user defined preferences between sessions|
   //---------------------------------------------------------------

   // store user defined options between sessions (also store program version number)
   this.save = function(version)
   {
      Settings.write(KEYPREFIX + "/version", 13, version);

      Settings.write(KEYPREFIX + "/moveTopLeft", 0, this.moveTopLeft);
      Settings.write(KEYPREFIX + "/bringToFront", 0, this.bringToFront);
      Settings.write(KEYPREFIX + "/optimalZoom", 0, this.optimalZoom);
      Settings.write(KEYPREFIX + "/checkSTF", 0, this.checkSTF);
      Settings.write(KEYPREFIX + "/selectNewImage", 0, this.selectNewImage);
      Settings.write(KEYPREFIX + "/saveLogCheck", 0, this.saveLogCheck);
      Settings.write(KEYPREFIX + "/startupRTP", 0, this.startupRTP);
      Settings.write(KEYPREFIX + "/paramHistLink", 0, this.paramHistLink);
      Settings.write(KEYPREFIX + "/supressModuleNotice", 0, this.supressModuleNotice);
      Settings.write(KEYPREFIX + "/useProcess", 0, this.useProcess);
      Settings.write(KEYPREFIX + "/graphHistActive", 0, this.graphHistActive[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistActive", 0, this.graphHistActive[1]);
      Settings.write(KEYPREFIX + "/graphHistCol", 13, this.graphHistCol[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistCol", 13, this.graphHistCol[1]);
      Settings.write(KEYPREFIX + "/graphRGBHistCol", 13, this.graphRGBHistCol[0]);
      Settings.write(KEYPREFIX + "/graphStretchRGBHistCol", 13, this.graphRGBHistCol[1]);
      Settings.write(KEYPREFIX + "/graphHistType", 13, this.graphHistType[0]);
      Settings.write(KEYPREFIX + "/graphStretchHistType", 13, this.graphHistType[1]);
      Settings.write(KEYPREFIX + "/graphLineCol", 13, this.graphLineCol);
      Settings.write(KEYPREFIX + "/graphBlockCol", 13, this.graphBlockCol);
      Settings.write(KEYPREFIX + "/graphRef1Col", 13, this.graphRef1Col);
      Settings.write(KEYPREFIX + "/graphRef2Col", 13, this.graphRef2Col);
      Settings.write(KEYPREFIX + "/graphRef3Col", 13, this.graphRef3Col);
      Settings.write(KEYPREFIX + "/graphGridCol", 13, this.graphGridCol);
      Settings.write(KEYPREFIX + "/graphBackCol", 13, this.graphBackCol);
      Settings.write(KEYPREFIX + "/graphLineActive", 0, this.graphLineActive);
      Settings.write(KEYPREFIX + "/graphBlockActive", 0, this.graphBlockActive);
      Settings.write(KEYPREFIX + "/graphRef1Active", 0, this.graphRef1Active);
      Settings.write(KEYPREFIX + "/graphRef2Active", 0, this.graphRef2Active);
      Settings.write(KEYPREFIX + "/graphRef3Active", 0, this.graphRef3Active);
      Settings.write(KEYPREFIX + "/graphGridActive", 0, this.graphGridActive);
      Settings.write(KEYPREFIX + "/previewWidth", 5, this.previewWidth);
      Settings.write(KEYPREFIX + "/previewHeight", 5, this.previewHeight);
      Settings.write(KEYPREFIX + "/previewDelay", 9, this.previewDelay);
      Settings.write(KEYPREFIX + "/zoomMax", 5, this.zoomMax);
      Settings.write(KEYPREFIX + "/readoutAreaMax", 5, this.readoutAreaMax);
      Settings.write(KEYPREFIX + "/previewCrossColour", 13, this.previewCrossColour);
      Settings.write(KEYPREFIX + "/previewCrossActive", 0, this.previewCrossActive);
      Settings.write(KEYPREFIX + "/lumCoeffSource", 13, this.lumCoeffSource);
      Settings.write(KEYPREFIX + "/colourClip", 13, this.colourClip);
      Settings.write(KEYPREFIX + "/lumCoefficients0", 9, this.lumCoefficients[0]);
      Settings.write(KEYPREFIX + "/lumCoefficients1", 9, this.lumCoefficients[1]);
      Settings.write(KEYPREFIX + "/lumCoefficients2", 9, this.lumCoefficients[2]);
   };

   // load user defined options
   this.load = function()
   {
      var keyValue;
      var lastSaveVersion;

      keyValue = Settings.read(KEYPREFIX + "/version", 13);
      if (Settings.lastReadOK) lastSaveVersion = keyValue;

      keyValue = Settings.read(KEYPREFIX + "/moveTopLeft", 0);
      if (Settings.lastReadOK) this.moveTopLeft = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/bringToFront", 0);
      if (Settings.lastReadOK) this.bringToFront = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/optimalZoom", 0);
      if (Settings.lastReadOK) this.optimalZoom = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/checkSTF", 0);
      if (Settings.lastReadOK) this.checkSTF = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/selectNewImage", 0);
      if (Settings.lastReadOK) this.selectNewImage = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/saveLogCheck", 0);
      if (Settings.lastReadOK) this.saveLogCheck = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/startupRTP", 0);
      if (Settings.lastReadOK) this.startupRTP = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/paramHistLink", 0);
      if (Settings.lastReadOK) this.paramHistLink = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/supressModuleNotice", 0);
      if (Settings.lastReadOK) this.supressModuleNotice = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/useProcess", 0);
      if (Settings.lastReadOK) this.useProcess = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistActive", 0);
      if (Settings.lastReadOK) this.graphHistActive[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistActive", 0);
      if (Settings.lastReadOK) this.graphHistActive[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistCol", 13);
      if (Settings.lastReadOK) this.graphHistCol[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistCol", 13);
      if (Settings.lastReadOK) this.graphHistCol[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRGBHistCol", 13);
      if (Settings.lastReadOK) this.graphRGBHistCol[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchRGBHistCol", 13);
      if (Settings.lastReadOK) this.graphRGBHistCol[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphHistType", 13);
      if (Settings.lastReadOK) this.graphHistType[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphStretchHistType", 13);
      if (Settings.lastReadOK) this.graphHistType[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphLineCol", 13);
      if (Settings.lastReadOK) this.graphLineCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphBlockCol", 13);
      if (Settings.lastReadOK) this.graphBlockCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef1Col", 13);
      if (Settings.lastReadOK) this.graphRef1Col = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef2Col", 13);
      if (Settings.lastReadOK) this.graphRef2Col = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef3Col", 13);
      if (Settings.lastReadOK) this.graphRef3Col = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphGridCol", 13);
      if (Settings.lastReadOK) this.graphGridCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphBackCol", 13);
      if (Settings.lastReadOK) this.graphBackCol = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphLineActive", 0);
      if (Settings.lastReadOK) this.graphLineActive = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphBlockActive", 0);
      if (Settings.lastReadOK) this.graphBlockActive = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef1Active", 0);
      if (Settings.lastReadOK) this.graphRef1Active = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef2Active", 0);
      if (Settings.lastReadOK) this.graphRef2Active = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphRef3Active", 0);
      if (Settings.lastReadOK) this.graphRef3Active = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/graphGridActive", 0);
      if (Settings.lastReadOK) this.graphGridActive = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewWidth", 5);
      if (Settings.lastReadOK) this.previewWidth = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewHeight", 5);
      if (Settings.lastReadOK) this.previewHeight = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewDelay", 9);
      if (Settings.lastReadOK) this.previewDelay = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/zoomMax", 5);
      if (Settings.lastReadOK) this.zoomMax = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/readoutAreaMax", 5);
      if (Settings.lastReadOK) this.readoutAreaMax = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewCrossColour", 13);
      if (Settings.lastReadOK) this.previewCrossColour = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewCrossActive", 0);
      if (Settings.lastReadOK) this.previewCrossActive = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/lumCoeffSource", 13);
      if (Settings.lastReadOK) this.lumCoeffSource = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/colourClip", 13);
      if (Settings.lastReadOK) this.colourClip = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/lumCoefficients0", 9);
      if (Settings.lastReadOK) this.lumCoefficients[0] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/lumCoefficients1", 9);
      if (Settings.lastReadOK) this.lumCoefficients[1] = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/lumCoefficients2", 9);
      if (Settings.lastReadOK) this.lumCoefficients[2] = keyValue;
   };

   // reset user defined options
   this.remove = function()
   {
      Settings.remove( KEYPREFIX );
   }
}
GHSOptionParameters.prototype = new Object;
