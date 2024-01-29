
 /*
 * *****************************************************************************
 *
 * OPTIONS DIALOG
 * This dialog forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.7
 *
 * Copyright (C) 2022-2023  Mike Cranfield
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

#include "GHSOptionParameters.js"

function DialogOptions(optionParameters) {
   this.__base__ = Dialog;
   this.__base__();

   this.windowTitle = "Preferences"
   var minLabelWidth = 150;

   //---------------------------------
   // Colour array for drop down boxes|
   //---------------------------------

   this.colourArray = [ "Red",
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
                        "Black"];

   //----------------
   // Define controls|
   //----------------

   // create "move top left" checkbox
   this.topLeftCheck = new CheckBox( this );
   this.topLeftCheck.text = "Move selected view top left";
   this.topLeftCheck.checked = optionParameters.moveTopLeft;
   this.topLeftCheck.toolTip =
         "<p>Move window to top left of workspace when a target view is selected.</p>";
   this.topLeftCheck.onCheck = function( checked )
   {
      optionParameters.moveTopLeft = checked;
   }

   // create "bring to front" checkbox
   this.toFrontCheck = new CheckBox( this );
   this.toFrontCheck.text = "Bring selected view to front";
   this.toFrontCheck.checked = optionParameters.bringToFront;
   this.toFrontCheck.toolTip =
         "<p>Bring window to the front when a target view is selected.</p>";
   this.toFrontCheck.onCheck = function( checked )
   {
      optionParameters.bringToFront = checked;
   }

   // create "check STF and mask" checkbox
   this.stfCheck = new CheckBox( this );
   this.stfCheck.text = "Check selected view for STF";
   this.stfCheck.checked = optionParameters.checkSTF;
   this.stfCheck.toolTip =
         "<p>Check whether a screen transfer function has been applied when a target view is selected." +
         " If so ask whether to remove it.</p>";
   this.stfCheck.onCheck = function( checked )
   {
      optionParameters.checkSTF = checked;
   }

   // create select new image checkbox
   this.selectNewImage = new CheckBox( this );
   this.selectNewImage.text = "Select new image on execute";
   this.selectNewImage.checked = optionParameters.selectNewImage;
   this.selectNewImage.toolTip =
         "<p>If the script is run with create new image checked," +
         " this option will select the new image after the stretch has been applied." +
         " Otherwise the old pre-stretched image remains selected.</p>";
   this.selectNewImage.onCheck = function( checked )
   {
      optionParameters.selectNewImage = checked;
   }

   // create optimal zoom checkbox
   this.optimalZoom = new CheckBox( this );
   this.optimalZoom.text = "Zoom target image to optimal fit";
   this.optimalZoom.checked = optionParameters.optimalZoom;
   this.optimalZoom.toolTip =
         "<p>If the script is run with optimal zoom checked," +
         " the target image will be zoomed to optimal fit." +
         " Otherwise its current zoom will  be unaffected.</p>";
   this.optimalZoom.onCheck = function( checked )
   {
      optionParameters.optimalZoom = checked;
   }

   // create save log checkbox
   this.saveLogCheck = new CheckBox( this );
   this.saveLogCheck.text = "Check save log on exit";
   this.saveLogCheck.checked = optionParameters.saveLogCheck;
   this.saveLogCheck.toolTip =
         "<p>Check whether the log is to be saved when exiting the script.</p>";
   this.saveLogCheck.onCheck = function( checked )
   {
      optionParameters.saveLogCheck = checked;
   }

   // create checkbox to show RTP at start up
   this.startupRTPCheck = new CheckBox( this );
   this.startupRTPCheck.text = "Show RTP on startup";
   this.startupRTPCheck.checked = optionParameters.startupRTP;
   this.startupRTPCheck.toolTip =
         "<p>Show real time preview when the script starts up.</p>";
   this.startupRTPCheck.onCheck = function( checked )
   {
      optionParameters.startupRTP = checked;
   }

   // create checkbox to enable linking parameters to histogram
   this.paramHistLinkCheck = new CheckBox( this );
   this.paramHistLinkCheck.text = "Enable parameter/histogram linking";
   this.paramHistLinkCheck.checked = optionParameters.paramHistLink;
   this.paramHistLinkCheck.toolTip =
         "<p>Add additional buttons for histogram related parameters " +
         "allowing them to be set directly from the histogram selection readout.</p>";
   this.paramHistLinkCheck.onCheck = function( checked )
   {
      optionParameters.paramHistLink = checked;
   }

   // create "supress module notice" checkbox
   this.supressModuleNoticeCheck = new CheckBox( this );
   this.supressModuleNoticeCheck.text = "Don't show Process module notice";
   this.supressModuleNoticeCheck.checked = optionParameters.supressModuleNotice;
   this.supressModuleNoticeCheck.toolTip =
         "<p>When checked the notice relating to the GHS module will not be shown at start up.</p>";
   this.supressModuleNoticeCheck.onCheck = function( checked )
   {
      optionParameters.supressModuleNotice = checked;
   }

   // create use process checkbox
   this.useProcessCheck = new CheckBox( this );
   this.useProcessCheck.text = "Use Process module if possible";
   this.useProcessCheck.checked = optionParameters.useProcess;
   this.useProcessCheck.toolTip =
         "<p>If possible use the GHS process module, ie if the process module is installed and the transformation type is available as an option.</p>";
   this.useProcessCheck.onCheck = function( checked )
   {
      optionParameters.useProcess = checked;
   }

   // create preview width input
   this.previewWidthNum = new NumericEdit( this );
   this.previewWidthNum.label.text = "Preview width";
   this.previewWidthNum.setRange(200, 1600);
   this.previewWidthNum.setPrecision(0);
   this.previewWidthNum.setValue(optionParameters.previewWidth);
   this.previewWidthNum.toolTip =
         "<p>Specify the width for the preview window.</p>";
   this.previewWidthNum.onValueUpdated = function( value )
   {
      optionParameters.previewWidth = value;
   }
   this.previewWidthSizer = new HorizontalSizer();
   this.previewWidthSizer.addStretch();
   this.previewWidthSizer.add(this.previewWidthNum);


   // create preview height input
   this.previewHeightNum = new NumericEdit( this );
   this.previewHeightNum.label.text = "Preview height";
   this.previewHeightNum.setRange(200, 1600);
   this.previewHeightNum.setPrecision(0);
   this.previewHeightNum.setValue(optionParameters.previewHeight);
   this.previewHeightNum.toolTip =
         "<p>Specify the height for the preview window.</p>";
   this.previewHeightNum.onValueUpdated = function( value )
   {
      optionParameters.previewHeight = value;
   }
   this.previewHeightSizer = new HorizontalSizer();
   this.previewHeightSizer.addStretch();
   this.previewHeightSizer.add(this.previewHeightNum);

   // create preview delay input
   this.previewDelayNum = new NumericEdit( this );
   this.previewDelayNum.label.text = "Preview delay";
   this.previewDelayNum.setRange(.1, 2);
   this.previewDelayNum.setPrecision(1);
   this.previewDelayNum.setValue(optionParameters.previewDelay);
   this.previewDelayNum.toolTip =
         "<p>Specify a delay time for the preview update between 0.1 and 2 seconds." +
         " if this is set too short the sliders may become sticky;" +
         " if set too long the preview may be less responsive than you like.</p>";
   this.previewDelayNum.onValueUpdated = function( value )
   {
      optionParameters.previewDelay = value;
   }
   this.previewDelaySizer = new HorizontalSizer();
   this.previewDelaySizer.addStretch();
   this.previewDelaySizer.add(this.previewDelayNum);

   // create zoom maximum input
   this.zoomMaxNum = new NumericEdit( this );
   this.zoomMaxNum.label.text = "Zoom maximum";
   this.zoomMaxNum.setRange(100, 10000);
   this.zoomMaxNum.setPrecision(0);
   this.zoomMaxNum.setValue(optionParameters.zoomMax);
   this.zoomMaxNum.toolTip =
         "<p>Specify the maximim zoom factor for the histogram zoom slider. " +
         "Note that at higher zoom levels the histogram can become blocky in appearance.</p>";
   this.zoomMaxNum.onValueUpdated = function( value )
   {
      optionParameters.zoomMax = value;
   }
   this.zoomMaxSizer = new HorizontalSizer();
   this.zoomMaxSizer.addStretch();
   this.zoomMaxSizer.add(this.zoomMaxNum);

   // create readout area maximum input
   this.roaMaxNum = new NumericEdit( this );
   this.roaMaxNum.label.text = "Readout maximum size";
   this.roaMaxNum.setRange(2, 10000);
   this.roaMaxNum.setPrecision(0);
   this.roaMaxNum.setValue(optionParameters.readoutAreaMax);
   this.roaMaxNum.toolTip =
         "<p>Specify the maximim size for the preview readout size slider. " +
         "The readout area is specified as a square around the specified readout point. " +
         "The readout area slider sets the size of the sides of this square area measured in " +
         "pixels of the target image.</p>";
   this.roaMaxNum.onValueUpdated = function( value )
   {
      optionParameters.readoutAreaMax = value;
   }
   this.roaMaxSizer = new HorizontalSizer();
   this.roaMaxSizer.addStretch();
   this.roaMaxSizer.add(this.roaMaxNum);

   //create histogram picker headings graphHistActive
   this.histHeadLabel1 = new Label(this);
   this.histHeadLabel1.minWidth = minLabelWidth;
   this.histUnstretchActive = new CheckBox(this);
   this.histUnstretchActive.text = "Unstretched";
   this.histUnstretchActive.toolTip = "Check box controls whether unstretched histograms are plotted"
   this.histUnstretchActive.checked = optionParameters.graphHistActive[0];
   this.histUnstretchActive.onCheck = function(checked)
   {
      optionParameters.graphHistActive[0] = checked;
   }
   this.histStretchActive = new CheckBox(this);
   this.histStretchActive.text = "Stretched";
   this.histStretchActive.toolTip = "Check box controls whether stretched histograms are plotted"
   this.histStretchActive.checked = optionParameters.graphHistActive[1];
   this.histStretchActive.onCheck = function(checked)
   {
      optionParameters.graphHistActive[1] = checked;
   }

   this.histHeadControls = new HorizontalSizer( this )
   this.histHeadControls.margin = 0;
   this.histHeadControls.spacing = 4;
   this.histHeadControls.add(this.histHeadLabel1);
   this.histHeadControls.add(this.histUnstretchActive);
   this.histHeadControls.add(this.histStretchActive);


   // create mono histogram colour picker control
   this.histColLabel = new Label(this);
   this.histColLabel.minWidth = minLabelWidth;
   this.histColLabel.text = "Mono histogram colours:";
   this.histColLabel.textAlignment = -1;

   this.histColList = new ComboBox ( this );
   this.histColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.histColList.addItem(this.colourArray[i]);
   }
   this.histColList.currentItem = this.histColList.findItem(optionParameters.graphHistCol[0]);;
   this.histColList.toolTip =
      "<p>Specifies the colour to use for the unstretched greyscale histogram." +
      " Light RGB will be used for colour images.</p>";
   this.histColList.onItemSelected = function( index )
   {
      optionParameters.graphHistCol[0] = this.itemText(index);
   }

   this.stretchHistColList = new ComboBox ( this );
   this.stretchHistColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.stretchHistColList.addItem(this.colourArray[i]);
   }
   this.stretchHistColList.currentItem = this.histColList.findItem(optionParameters.graphHistCol[1]);;
   this.stretchHistColList.toolTip =
      "<p>Specifies the colour to use for the stretched greyscale histogram." +
      " RGB will be used for colour images.</p>";
   this.stretchHistColList.onItemSelected = function( index )
   {
      optionParameters.graphHistCol[1] = this.itemText(index);
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
   this.rgbHistColLabel.minWidth = minLabelWidth;
   this.rgbHistColLabel.text = "RGB histogram colours:";
   this.rgbHistColLabel.textAlignment = -1;

   this.rgbHistColList = new ComboBox ( this );
   this.rgbHistColList.minWidth = minLabelWidth;
   this.rgbHistColList.addItem("Light");
   this.rgbHistColList.addItem("Mid");
   this.rgbHistColList.addItem("Dark");
   this.rgbHistColList.currentItem = this.rgbHistColList.findItem(optionParameters.graphRGBHistCol[0]);
   this.rgbHistColList.toolTip =
      "<p>Specifies the colours to use for the unstretched rgb histogram.</p>";
   this.rgbHistColList.onItemSelected = function( index )
   {
      optionParameters.graphRGBHistCol[0] = this.itemText(index);
   }

   this.rgbStretchHistColList = new ComboBox ( this );
   this.rgbStretchHistColList.minWidth = minLabelWidth;
   this.rgbStretchHistColList.addItem("Light");
   this.rgbStretchHistColList.addItem("Mid");
   this.rgbStretchHistColList.addItem("Dark");
   this.rgbStretchHistColList.currentItem = this.rgbStretchHistColList.findItem(optionParameters.graphRGBHistCol[1]);
   this.rgbStretchHistColList.toolTip =
      "<p>Specifies the colours to use for the stretched rgb histogram.</p>";
   this.rgbStretchHistColList.onItemSelected = function( index )
   {
      optionParameters.graphRGBHistCol[1] = this.itemText(index);
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
   this.histTypeLabel.minWidth = minLabelWidth;
   this.histTypeLabel.text = "Histogram plot type:";
   this.histTypeLabel.textAlignment = -1;

   this.histTypeList = new ComboBox ( this );
   this.histTypeList.minWidth = minLabelWidth;
   this.histTypeList.addItem("Fill");
   this.histTypeList.addItem("Draw");
   this.histTypeList.currentItem = this.histTypeList.findItem(optionParameters.graphHistType[0]);
   this.histTypeList.toolTip =
      "<p>Specifies the plot type to use for unstretched histograms.</p>";
   this.histTypeList.onItemSelected = function( index )
   {
      optionParameters.graphHistType[0] = this.itemText(index);
   }

   this.histStretchTypeList = new ComboBox ( this );
   this.histStretchTypeList.minWidth = minLabelWidth;
   this.histStretchTypeList.addItem("Fill");
   this.histStretchTypeList.addItem("Draw");
   this.histStretchTypeList.currentItem = this.histStretchTypeList.findItem(optionParameters.graphHistType[1]);
   this.histStretchTypeList.toolTip =
      "<p>Specifies the plot type to use for unstretched histograms.</p>";
   this.histStretchTypeList.onItemSelected = function( index )
   {
      optionParameters.graphHistType[1] = this.itemText(index);
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
   this.gridColLabel.minWidth = minLabelWidth;
   this.gridColLabel.text = "Grid:";
   this.gridColLabel.textAlignment = -1;
   this.gridColList = new ComboBox ( this );
   this.gridColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.gridColList.addItem(this.colourArray[i]);
   }
   this.gridColList.currentItem = this.gridColList.findItem(optionParameters.graphGridCol);;
   this.gridColList.toolTip =
      "<p>Specifies the colour to use for the grid.</p>";
   this.gridColList.onItemSelected = function( index )
   {
      optionParameters.graphGridCol = this.itemText(index);
   }
   this.gridActive = new CheckBox(this);
   this.gridActive.text = "";
   this.gridActive.toolTip = "Check box controls whether grid lines are plotted";
   this.gridActive.checked = optionParameters.graphGridActive;
   this.gridActive.onCheck = function(checked)
   {
      optionParameters.graphGridActive = checked;
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
   this.stretchColLabel.minWidth = minLabelWidth;
   this.stretchColLabel.text = "Stretch transformation:";
   this.stretchColLabel.textAlignment = -1;
   this.stretchColList = new ComboBox ( this );
   this.stretchColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.stretchColList.addItem(this.colourArray[i]);
   }
   this.stretchColList.currentItem = this.stretchColList.findItem(optionParameters.graphLineCol);;
   this.stretchColList.toolTip =
      "<p>Specifies the colour to use for the stretch plot.</p>";
   this.stretchColList.onItemSelected = function( index )
   {
      optionParameters.graphLineCol = this.itemText(index);
   }
   this.stretchActive = new CheckBox(this);
   this.stretchActive.text = "";
   this.stretchActive.toolTip = "Check box controls whether stretch transformation is plotted";
   this.stretchActive.checked = optionParameters.graphLineActive;
   this.stretchActive.onCheck = function(checked)
   {
      optionParameters.graphLineActive = checked;
   }
   this.stretchColControl = new HorizontalSizer(this);
   this.stretchColControl.margin = 0;
   this.stretchColControl.spacing = 4;
   this.stretchColControl.add(this.stretchColLabel);
   this.stretchColControl.add(this.stretchColList);
   this.stretchColControl.add(this.stretchActive);
   this.stretchColControl.addStretch();

   // create stretch block colour picker control
   this.stretchBlockLabel = new Label(this);
   this.stretchBlockLabel.minWidth = minLabelWidth;
   this.stretchBlockLabel.text = "Stretch visualisation block:";
   this.stretchBlockLabel.textAlignment = -1;
   this.stretchBlockList = new ComboBox ( this );
   this.stretchBlockList.minWidth = minLabelWidth;
   this.stretchBlockList.addItem("Red");
   this.stretchBlockList.addItem("Green");
   this.stretchBlockList.addItem("Blue");
   this.stretchBlockList.currentItem = this.stretchBlockList.findItem(optionParameters.graphBlockCol);;
   this.stretchBlockList.enabled = true;
   this.stretchBlockList.toolTip =
      "<p>Specifies the colour to use for the stretch visualisation block when saturation channel is selected. " +
      "For all other intensity channels, grayscale will be used.</p>";
   this.stretchBlockList.onItemSelected = function( index )
   {
      optionParameters.graphBlockCol = this.itemText(index);
   }
   this.stretchBlockActive = new CheckBox(this);
   this.stretchBlockActive.text = "";
   this.stretchBlockActive.toolTip = "Check box controls whether stretch transformation is plotted";
   this.stretchBlockActive.checked = optionParameters.graphBlockActive;
   this.stretchBlockActive.onCheck = function(checked)
   {
      optionParameters.graphBlockActive = checked;
   }
   this.stretchBlockControl = new HorizontalSizer(this);
   this.stretchBlockControl.margin = 0;
   this.stretchBlockControl.spacing = 4;
   this.stretchBlockControl.add(this.stretchBlockLabel);
   this.stretchBlockControl.add(this.stretchBlockList);
   this.stretchBlockControl.add(this.stretchBlockActive);
   this.stretchBlockControl.addStretch();

   // create "neutral stretch line" colour picker control
   this.ref1ColLabel = new Label(this);
   this.ref1ColLabel.minWidth = minLabelWidth;
   this.ref1ColLabel.text = "Neutral stretch:";
   this.ref1ColLabel.textAlignment = -1;
   this.ref1ColList = new ComboBox ( this );
   this.ref1ColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.ref1ColList.addItem(this.colourArray[i]);
   }
   this.ref1ColList.currentItem = this.ref1ColList.findItem(optionParameters.graphRef1Col);
   this.ref1ColList.toolTip =
      "<p>Specifies the colour to use for a reference line showing no stretch.";
   this.ref1ColList.onItemSelected = function( index )
   {
      optionParameters.graphRef1Col = this.itemText(index);
   }
   this.ref1Active = new CheckBox(this);
   this.ref1Active.text = "";
   this.ref1Active.toolTip = "Check box controls whether neutral stretch line is plotted";
   this.ref1Active.checked = optionParameters.graphRef1Active;
   this.ref1Active.onCheck = function(checked)
   {
      optionParameters.graphRef1Active = checked;
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
   this.ref2ColLabel.minWidth = minLabelWidth;
   this.ref2ColLabel.text = "Histogram readout line:";
   this.ref2ColLabel.textAlignment = -1;
   this.ref2ColList = new ComboBox ( this );
   this.ref2ColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.ref2ColList.addItem(this.colourArray[i]);
   }
   this.ref2ColList.currentItem = this.ref2ColList.findItem(optionParameters.graphRef2Col);
   this.ref2ColList.toolTip =
      "<p>Specifies the colour to use for a reference line showing where on the graph the user has clicked." +
      " The graph click information displayed relates to this location on the graph.";
   this.ref2ColList.onItemSelected = function( index )
   {
      optionParameters.graphRef2Col = this.itemText(index);
   }
   this.ref2Active = new CheckBox(this);
   this.ref2Active.text = "";
   this.ref2Active.toolTip = "Check box controls whether graph selection line is plotted";
   this.ref2Active.checked = optionParameters.graphRef2Active;
   this.ref2Active.onCheck = function(checked)
   {
      optionParameters.graphRef2Active = checked;
   }
   this.ref2Active.hide();

   this.ref2ColControl = new HorizontalSizer(this);
   this.ref2ColControl.margin = 0;
   this.ref2ColControl.spacing = 4;
   this.ref2ColControl.add(this.ref2ColLabel);
   this.ref2ColControl.add(this.ref2ColList);
   this.ref2ColControl.add(this.ref2Active);
   this.ref2ColControl.addStretch();

   // create "preview readout indicator line" colour picker control
   this.ref3ColLabel = new Label(this);
   this.ref3ColLabel.minWidth = minLabelWidth;
   this.ref3ColLabel.text = "Preview readout line:";
   this.ref3ColLabel.textAlignment = -1;
   this.ref3ColList = new ComboBox ( this );
   this.ref3ColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.ref3ColList.addItem(this.colourArray[i]);
   }
   this.ref3ColList.currentItem = this.ref3ColList.findItem(optionParameters.graphRef3Col);
   this.ref3ColList.toolTip =
      "<p>Specifies the colour to use for a reference line showing the current preview readout value.</p>";
   this.ref3ColList.onItemSelected = function( index )
   {
      optionParameters.graphRef3Col = this.itemText(index);
   }
   this.ref3Active = new CheckBox(this);
   this.ref3Active.text = "";
   this.ref3Active.toolTip = "Check box controls whether preview readout value line is plotted";
   this.ref3Active.checked = optionParameters.graphRef3Active;
   this.ref3Active.onCheck = function(checked)
   {
      optionParameters.graphRef3Active = checked;
   }
   this.ref3Active.hide();

   this.ref3ColControl = new HorizontalSizer(this);
   this.ref3ColControl.margin = 0;
   this.ref3ColControl.spacing = 4;
   this.ref3ColControl.add(this.ref3ColLabel);
   this.ref3ColControl.add(this.ref3ColList);
   this.ref3ColControl.add(this.ref3Active);
   this.ref3ColControl.addStretch();

   // create graph background colour picker control
   this.backColLabel = new Label(this);
   this.backColLabel.minWidth = minLabelWidth;
   this.backColLabel.text = "Graph background:";
   this.backColLabel.textAlignment = -1;
   this.backColList = new ComboBox ( this );
   this.backColList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.backColList.addItem(this.colourArray[i]);
   }
   this.backColList.currentItem = this.backColList.findItem(optionParameters.graphBackCol);
   this.backColList.toolTip =
      "<p>Specifies the colour to use for the graph background</p>";
   this.backColList.onItemSelected = function( index )
   {
      optionParameters.graphBackCol = this.itemText(index);
   }

   this.backColControl = new HorizontalSizer(this);
   this.backColControl.margin = 0;
   this.backColControl.spacing = 4;
   this.backColControl.add(this.backColLabel);
   this.backColControl.add(this.backColList);
   this.backColControl.addStretch();

   // create preview cross colour picker control
   this.previewCrossLabel = new Label(this);
   this.previewCrossLabel.minWidth = minLabelWidth;
   this.previewCrossLabel.text = "Preview cross:";
   this.previewCrossLabel.textAlignment = -1;
   this.previewCrossList = new ComboBox ( this );
   this.previewCrossList.minWidth = minLabelWidth;
   for (var i = 0; i < this.colourArray.length; ++i)
   {
      this.previewCrossList.addItem(this.colourArray[i]);
   }
   this.previewCrossList.currentItem = this.previewCrossList.findItem(optionParameters.previewCrossColour);
   this.previewCrossList.toolTip =
      "<p>Specifies the colour to use for the cross through of the current image while a new image is generated. " +
      "It can be helpful to set this to a colour that stands out against the predominant colours in your image.</p>";
   this.previewCrossList.onItemSelected = function( index )
   {
      optionParameters.previewCrossColour = this.itemText(index);
   }

   this.previewCrossActive = new CheckBox(this);
   this.previewCrossActive.text = "";
   this.previewCrossActive.toolTip = "Check box controls whether a cross is drawn across the preview when " +
      "the transformation has been changed and the preview is waiting for things to stabilise before updating.";
   this.previewCrossActive.checked = optionParameters.previewCrossActive;
   this.previewCrossActive.onCheck = function(checked)
   {
      optionParameters.previewCrossActive = checked;
   }

   this.previewCrossControl = new HorizontalSizer(this);
   this.previewCrossControl.margin = 0;
   this.previewCrossControl.spacing = 4;
   this.previewCrossControl.add(this.previewCrossLabel);
   this.previewCrossControl.add(this.previewCrossList);
   this.previewCrossControl.add(this.previewCrossActive);
   this.previewCrossControl.addStretch();

   // create Luminance R coefficient input
   this.lumRNum = new NumericEdit( this );
   this.lumRNum.label.text = "Lum coefficients: Red: ";
   this.lumRNum.setRange(0, 100);
   this.lumRNum.setPrecision(5);
   this.lumRNum.setValue(optionParameters.lumCoefficients[0]);
   if (optionParameters.lumCoeffSource != "Manual") this.lumRNum.enabled = false;
   this.lumRNum.toolTip =
         "<p>Specify the R luminance coefficient to use when source is Manual.</p>";
   this.lumRNum.onValueUpdated = function( value )
   {
      if (value > 0) {optionParameters.lumCoefficients[0] = value;}
      else
      {
         let warning = "Colour stretch luminance coefficients must be greater than zero.";
         var msgReturn = (new MessageBox( warning, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
         this.setValue(optionParameters.lumCoefficients[0]);
      }
   }

   // create Luminance G coefficient input
   this.lumGNum = new NumericEdit( this );
   this.lumGNum.label.text = "Green: ";
   this.lumGNum.setRange(0, 100);
   this.lumGNum.setPrecision(5);
   this.lumGNum.setValue(optionParameters.lumCoefficients[1]);
   if (optionParameters.lumCoeffSource != "Manual") this.lumGNum.enabled = false;
   this.lumGNum.toolTip =
         "<p>Specify the G luminance coefficient to use when source is Manual.</p>";
   this.lumGNum.onValueUpdated = function( value )
   {
      if (value > 0) {optionParameters.lumCoefficients[1] = value;}
      else
      {
         let warning = "Colour stretch luminance coefficients must be greater than zero.";
         var msgReturn = (new MessageBox( warning, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
         this.setValue(optionParameters.lumCoefficients[1]);
      }
   }

   // create Luminance B coefficient input
   this.lumBNum = new NumericEdit( this );
   this.lumBNum.label.text = "Blue: ";
   this.lumBNum.setRange(0, 100);
   this.lumBNum.setPrecision(5);
   this.lumBNum.setValue(optionParameters.lumCoefficients[2]);
   if (optionParameters.lumCoeffSource != "Manual") this.lumBNum.enabled = false;
   this.lumBNum.toolTip =
         "<p>Specify the B luminance coefficient to use when source is Manual.</p>";
   this.lumBNum.onValueUpdated = function( value )
   {
      if (value > 0) {optionParameters.lumCoefficients[2] = value;}
      else
      {
         let warning = "Colour stretch luminance coefficients must be greater than zero.";
         var msgReturn = (new MessageBox( warning, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
         this.setValue(optionParameters.lumCoefficients[2]);
      }
   }

   this.lumSizer = new HorizontalSizer();
   this.lumSizer.margin = 8;
   this.lumSizer.spacing = 4;
   this.lumSizer.add(this.lumRNum);
   this.lumSizer.add(this.lumGNum);
   this.lumSizer.add(this.lumBNum);
   this.lumSizer.addStretch();

   // create luminance source list
   this.lumSourceLabel = new Label(this);
   this.lumSourceLabel.minWidth = this.lumRNum.label.width;
   this.lumSourceLabel.text = "Luminance source:";
   this.lumSourceLabel.textAlignment = -1;
   this.lumSourceList = new ComboBox ( this );
   this.lumSourceList.minWidth = minLabelWidth;
   this.lumSourceList.addItem("Default");
   this.lumSourceList.addItem("Image");
   this.lumSourceList.addItem("Manual");
   this.lumSourceList.currentItem = this.lumSourceList.findItem(optionParameters.lumCoeffSource);
   this.lumSourceList.toolTip =
      "<p>Where to take the luminance coefficients from for a colour stretch. " +
      "<b>Default</b>: will use equal weights for each channel. " +
      "<b>Image</b>: will take the luminance coefficients from the target image rgb working space. " +
      "<b>Manual</b>: will allow you to specify the coefficients to use below.</p>";
   this.lumSourceList.onItemSelected = function( index )
   {
      optionParameters.lumCoeffSource = this.itemText(index);
      if (optionParameters.lumCoeffSource == "Manual")
      {
         this.dialog.lumRNum.enabled = true;
         this.dialog.lumGNum.enabled = true;
         this.dialog.lumBNum.enabled = true;
      }
      else
      {
         this.dialog.lumRNum.enabled = false;
         this.dialog.lumGNum.enabled = false;
         this.dialog.lumBNum.enabled = false;
      }
   }

   this.lumSourceControl = new HorizontalSizer(this);
   this.lumSourceControl.margin = 0;
   this.lumSourceControl.spacing = 4;
   this.lumSourceControl.add(this.lumSourceLabel);
   this.lumSourceControl.add(this.lumSourceList);
   this.lumSourceControl.addStretch();

   // create clip behaviour list
   this.clipLabel = new Label(this);
   this.clipLabel.minWidth = this.lumRNum.label.width;
   this.clipLabel.text = "Colour stretch clipping:";
   this.clipLabel.textAlignment = -1;
   this.clipList = new ComboBox ( this );
   this.clipList.minWidth = minLabelWidth;
   this.clipList.addItem("Clip");
   this.clipList.addItem("Rescale");
   this.clipList.currentItem = this.clipList.findItem(optionParameters.colourClip);
   this.clipList.toolTip =
      "<p>This parameter specifies what to do when undertaking a colour stretch if any channels " +
      "relating to a specific pixel stretch to a value greater than 1.  " +
      "Clip: will simply clip all channels greater than 1 for that pixel back to 1. " +
      "Rescale: will scale all three channels for that pixel down by the ratio 1/max(R,G,B).</p>";
   this.clipList.onItemSelected = function( index )
   {
      optionParameters.colourClip = this.itemText(index);
   }

   this.clipControl = new HorizontalSizer(this);
   this.clipControl.margin = 0;
   this.clipControl.spacing = 4;
   this.clipControl.add(this.clipLabel);
   this.clipControl.add(this.clipList);
   this.clipControl.addStretch();

   // create a label header for the colour selectors
   this.lineColourLabel = new Label(this);
   this.lineColourLabel.minWidth = minLabelWidth;
   this.lineColourLabel.text = "Select colours:";

   //---------------
   // Define buttons|
   //---------------

   this.resetButton = new PushButton( this )
   this.resetButton.defaultButton = false;
   this.resetButton.text = "Reset";
   this.resetButton.toolTip = "<p>Reset all stretch parameters to default values.";
   this.resetButton.onClick = function(){
      this.dialog.resetDefaults();
   }

   this.okButton = new PushButton( this )
   this.okButton.defaultButton = true;
   this.okButton.text = "OK"
   this.okButton.onClick = function(){
      this.dialog.ok();
   }

   this.cancelButton = new PushButton( this )
   this.cancelButton.defaultButton = false;
   this.cancelButton.text = "Cancel"
   this.cancelButton.onClick = function(){
      this.dialog.cancel();
   }

   //------------------------------
   // Reset default values function|
   //------------------------------

   this.resetDefaults = function()
   {
      optionParameters.copy(new GHSOptionParameters());

      this.topLeftCheck.checked = optionParameters.moveTopLeft;
      this.toFrontCheck.checked = optionParameters.bringToFront;
      this.optimalZoom.checked = optionParameters.optimalZoom;
      this.stfCheck.checked = optionParameters.checkSTF;
      this.selectNewImage.checked = optionParameters.selectNewImage;
      this.saveLogCheck.checked = optionParameters.saveLogCheck;
      this.startupRTPCheck.checked = optionParameters.startupRTP;
      this.paramHistLinkCheck.checked = optionParameters.paramHistLink;
      this.supressModuleNoticeCheck = optionParameters.supressModuleNoticeCheck;
      this.useProcessCheck = optionParameters.useProcess;
      this.zoomMaxNum.setValue(optionParameters.zoomMax);
      this.roaMaxNum.setValue(optionParameters.readoutAreaMax);
      this.previewWidthNum.setValue(optionParameters.previewWidth);
      this.previewHeightNum.setValue(optionParameters.previewHeight);
      this.previewDelayNum.setValue(optionParameters.previewDelay);
      this.previewCrossList.currentItem = this.previewCrossList.findItem(optionParameters.previewCrossColour);
      this.previewCrossActive.checked = optionParameters.previewCrossActive;
      this.histUnstretchActive.checked = optionParameters.graphHistActive[0];
      this.histStretchActive.checked = optionParameters.graphHistActive[1];
      this.histColList.currentItem = this.histColList.findItem(optionParameters.graphHistCol[0]);
      this.stretchHistColList.currentItem = this.stretchHistColList.findItem(optionParameters.graphHistCol[1]);
      this.rgbHistColList.currentItem = this.rgbHistColList.findItem(optionParameters.graphRGBHistCol[0]);
      this.rgbStretchHistColList.currentItem = this.rgbStretchHistColList.findItem(optionParameters.graphRGBHistCol[1]);
      this.histTypeList.currentItem = this.histTypeList.findItem(optionParameters.graphHistType[0]);
      this.histStretchTypeList.currentItem = this.histStretchTypeList.findItem(optionParameters.graphHistType[1]);
      this.gridColList.currentItem = this.gridColList.findItem(optionParameters.graphGridCol);
      this.stretchColList.currentItem = this.stretchColList.findItem(optionParameters.graphLineCol);
      this.ref1ColList.currentItem = this.ref1ColList.findItem(optionParameters.graphRef1Col);
      this.ref2ColList.currentItem = this.ref2ColList.findItem(optionParameters.graphRef2Col);
      this.backColList.currentItem = this.backColList.findItem(optionParameters.graphBackCol);
      this.gridActive.checked = optionParameters.graphGridActive;
      this.stretchActive.checked = optionParameters.graphLineActive;
      this.stretchBlockActive.checked = optionParameters.graphBlockActive;
      this.stretchBlockList.currentItem = this.stretchBlockList.findItem(optionParameters.graphBlockCol);
      this.ref1Active.checked = optionParameters.graphRef1Active;
      this.ref2Active.checked = optionParameters.graphRef2Active;
      this.clipList.currentItem = this.clipList.findItem(optionParameters.colourClip);
      this.lumSourceList.currentItem = this.lumSourceList.findItem(optionParameters.lumCoeffSource);
      this.lumRNum.setValue(optionParameters.lumCoefficients[0]);
      this.lumGNum.setValue(optionParameters.lumCoefficients[1]);
      this.lumBNum.setValue(optionParameters.lumCoefficients[2]);
   }


   //--------------------
   // Layout the controls|
   //--------------------

   var layoutSpacing = 4

   this.optionPickerLeft = new VerticalSizer( this )
   this.optionPickerLeft.margin = 0;
   this.optionPickerLeft.add(this.saveLogCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.topLeftCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.toFrontCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.optimalZoom);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.stfCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.selectNewImage);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.startupRTPCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.paramHistLinkCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.supressModuleNoticeCheck);
   this.optionPickerLeft.addSpacing(layoutSpacing);
   this.optionPickerLeft.add(this.useProcessCheck);

   this.optionPickerRight = new VerticalSizer( this )
   this.optionPickerRight.margin = 0;
   this.optionPickerRight.addSpacing(layoutSpacing);
   this.optionPickerRight.add(this.previewWidthSizer);
   this.optionPickerRight.addSpacing(layoutSpacing);
   this.optionPickerRight.add(this.previewHeightSizer);
   this.optionPickerRight.addSpacing(layoutSpacing);
   this.optionPickerRight.add(this.previewDelaySizer);
   this.optionPickerRight.addSpacing(4 * layoutSpacing);
   this.optionPickerRight.add(this.roaMaxSizer);
   this.optionPickerRight.addSpacing(4 * layoutSpacing);
   this.optionPickerRight.add(this.zoomMaxSizer);

   this.optionPicker = new HorizontalSizer( this );
   this.optionPicker.margin = 32;
   this.optionPicker.add(this.optionPickerLeft);
   this.optionPicker.addSpacing(layoutSpacing);
   this.optionPicker.add(this.optionPickerRight);

   this.lumPicker = new VerticalSizer( this );
   this.lumPicker.margin = 0;
   this.lumPicker.add(this.clipControl);
   this.lumPicker.add(this.lumSourceControl);
   this.lumPicker.add(this.lumSizer);

   this.colourPicker = new VerticalSizer( this )
   this.colourPicker.margin = 0;
   this.colourPicker.add(this.lineColourLabel);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.histHeadControls);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.histColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.rgbHistColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.histTypeControl);
   this.colourPicker.addSpacing(2 * layoutSpacing);
   this.colourPicker.add(this.stretchColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.stretchBlockControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.gridColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.ref1ColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.ref2ColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.ref3ColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.backColControl);
   this.colourPicker.addSpacing(layoutSpacing);
   this.colourPicker.add(this.previewCrossControl);

   this.buttons = new HorizontalSizer( this )
   this.buttons.margin = 0;
   this.buttons.add(this.resetButton);
   this.buttons.addStretch();
   this.buttons.add(this.cancelButton);
   this.buttons.add(this.okButton);

   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.addSpacing(4 * layoutSpacing);
   this.sizer.add(this.colourPicker);
   this.sizer.addSpacing(4 * layoutSpacing);
   this.sizer.add(this.optionPicker);
   this.sizer.addSpacing(4 * layoutSpacing);
   this.sizer.add(this.lumPicker);
   this.sizer.addSpacing(4 * layoutSpacing);
   this.sizer.add(this.buttons)

}
DialogOptions.prototype = new Dialog;
