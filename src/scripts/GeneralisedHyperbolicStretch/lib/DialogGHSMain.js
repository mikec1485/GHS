
 /*
 * *****************************************************************************
 *
 * MAIN GHS DIALOG
 * This dialog forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.0.1
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

#include <pjsr/Sizer.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/SectionBar.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/ColorSpace.jsh>
#include <pjsr/ImageOp.jsh>
#include <pjsr/TextAlign.jsh>

#include "DialogOptions.js"
#include "DialogLog.js"
#include "DialogInspector.js"

#include "ControlHistData.js"
#include "ControlPreview.js"
#include "ControlStretchGraph.js"
#include "ControlParamInput.js"


function DialogGHSMain() {
   this.__base__ = Dialog;
   this.__base__();

   var ghsStretch = new GHSStretch();
   var stretchParameters = ghsStretch.stretchParameters;
   ghsStretch.dialog = this;

   this.optionParameters = new GHSOptionParameters();
   var optionParameters =this.optionParameters;
   optionParameters.load();

   var ghsLog = new GHSLog();

   var ghsViews = new GHSViews();
   ghsViews.stretch = ghsStretch;
   ghsViews.dialog = this;

   this.targetView = new View();
   this.channels = function()
   {
      if (this.targetView.id == "") return [0];
      if (this.targetView.image.isGrayscale) return [0];

      if (stretchParameters.channelSelector[4]) return [3];
      if (stretchParameters.channelSelector[5]) return [4];
      if (stretchParameters.channelSelector[6]) return [5];
      return [0, 1, 2];
   }

   this.getLumCoefficients = function()
   {
      let lR = (1 / 3);
      let lG = (1 / 3);
      let lB = (1 / 3);
      if (optionParameters.lumCoeffSource == "Image")
      {
         if (this.targetView.id != "")
         {
            let rgbWS = this.targetView.window.rgbWorkingSpace;
            lR = rgbWS.Y[0];
            lG = rgbWS.Y[1];
            lB = rgbWS.Y[2];
         }
         else
         {
            let lR = (1 / 3);
            let lG = (1 / 3);
            let lB = (1 / 3);
         }
      }
      if (optionParameters.lumCoeffSource == "Manual")
      {
         lR = optionParameters.lumCoefficients[0];
         lG = optionParameters.lumCoefficients[1];
         lB = optionParameters.lumCoefficients[2];
         let total = lR + lG + lB;
         lR = lR / total;
         lG = lG / total;
         lB = lB / total;
      }

      return [lR, lG, lB];
   }

   this.showRTP = optionParameters.startupRTP;

   this.suspendUpdating = false;

   /// let the dialog be resizable
   this.userResizable = true;

   var minLabelWidth = this.font.width( "Local stretch intensity (b)" );

   this.windowTitle = TITLE + " - Version: " + VERSION

   this.onToggleSection = function(bar, beginToggle)
   {
      if (beginToggle){}
      else
      {
         //this.dialog.leftPanel.setFixedWidth();
         this.dialog.adjustToContents()
         this.dialog.setVariableSize();
      }
   }

   this.onHide = function()
   {
      this.previewTimer.stop();
      ghsViews.tidyUp();
      optionParameters.save(VERSION);
      if (optionParameters.saveLogCheck)
      {
         let warnMessage = "Do you want to save your log before leaving?";
         let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Question, StdButton_Yes, StdButton_No )).execute();
         if (msgReturn == StdButton_Yes)
         {
            let logViewDialog = new DialogLog(ghsLog);
            logViewDialog.execute();
         }
      }
   };

/*******************************************************************************
 * MAIN DIALOG - Create the graphical display control section
 *******************************************************************************/

   //----------------------------------
   // Create graphical display controls|
   //----------------------------------
   this.stretchGraph = new ControlStretchGraph(this);
   this.stretchGraph.toolTip = "<b>Click</b> to see readout at that point.  <b>Double click</b> to centre zoom at that point"
   this.stretchGraph.setMinSize(400, 250);
   this.stretchGraph.stretch = ghsStretch;
   this.stretchGraph.targetView = this.targetView;
   this.stretchGraph.views = ghsViews;

/*******************************************************************************
 * MAIN DIALOG - Create the graph click information controls
 *******************************************************************************/

   // create the graph click information controls
   this.graphInfo1 = new Label( this )
   this.graphInfo1.style = Frame.FrameStyle_Box;
   this.graphInfo1.text = "";
   this.graphInfo1.minWidth = minLabelWidth;
   this.graphInfo1.readOnly = true;
   this.graphInfo1.useRichText = true;
   this.graphInfoButton = new ToolButton( this );
   this.graphInfoButton.icon = this.scaledResource(":/icons/clear.png");
   this.graphInfoButton.setScaledFixedSize(24, 24);
   this.graphInfoButton.toolTip =
            "<p>Reset graph selection point</p>";
   this.graphInfoButton.onClick = function( checked ) {
      this.dialog.stretchGraph.clickLevel = -1.0;
      this.dialog.updateControls();
   }

   this.graphInfoLabels = new VerticalSizer( this )
   this.graphInfoLabels.margin = 0;
   this.graphInfoLabels.spacing = 4;
   this.graphInfoLabels.add(this.graphInfo1);

   this.graphInfoControls = new HorizontalSizer( this )
   this.graphInfoControls.margin = 0;
   this.graphInfoControls.spacing = 4;
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


   // create Lightness (CT type) checkbox
   this.selectLCheck = new RadioButton( this )
   this.selectLCheck.text = "L*";
   this.selectLCheck.checked = stretchParameters.channelSelector[4];
   this.selectLCheck.toolTip =
         "<p><b>Lightness stretch:</b> apply stretch to the lightness channel in CIEL*a*b* colour space.</p>";
   this.selectLCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[4] = checked;
      this.dialog.updateControls();
   }

   // create Sat checkbox
   this.selectSCheck = new RadioButton( this )
   this.selectSCheck.text = "Sat";
   this.selectSCheck.checked = stretchParameters.channelSelector[5];
   this.selectSCheck.toolTip =
         "<p><b>Saturation stretch:</b> apply stretch to saturation channel</p>";
   this.selectSCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[5] = checked;
      this.dialog.updateControls();
   }

   // create Lum (arcsinh type) checkbox
   this.selectLumCheck = new RadioButton( this )
   this.selectLumCheck.text = "Col";
   this.selectLumCheck.checked = stretchParameters.channelSelector[6];
   this.selectLumCheck.toolTip =
         "<p><b>Colour stretch:</b> checking this will apply a colour stretch.  This is achieved by stretching a Luminance channel.  " +
         "The RGB coefficients for deriving the luminance are specified in the preferences dialog. " +
         "Each RGB channel is then stretched by the ratio of the stretched to the unstretched luminance.</p>";
   this.selectLumCheck.onCheck = function( checked )
   {
      stretchParameters.channelSelector[6] = checked;
      this.dialog.updateControls();
   }

   // prepare the histogram update button
   this.histUpdateButton = new ToolButton( this );
   this.histUpdateButton.icon = this.scaledResource( ":/icons/refresh.png" );
   this.histUpdateButton.setScaledFixedSize( 24, 24 );
   this.histUpdateButton.toolTip = "<p>Generate the histogram data for the current stretch parameters. " +
            "The script will attempt to predict the post transformation histogram but this is sometimes not possible; " +
            " for example, where a mask is in place or the transformation type is an image conbination. " +
            "In this case it is necessary to generate the histogram data from the stretched image by pressing this button.</p>";
   this.histUpdateButton.onClick = () => {
      if (this.targetView.id != "")
      {
         ghsViews.getHistData(1);
      }
      else
      {
         var warn2Message = "Cannot generate histogram data without a target image being selected";
         var msgReturn = (new MessageBox( warn2Message, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      this.updateControls();
   }

   // prepare the log histogram toggle button
   this.logHistButton = new ToolButton( this );
   this.logHistButton.icon = this.scaledResource( ":/icons/chart.png" );
   this.logHistButton.setScaledFixedSize( 24, 24 );
   this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing standard histogram.</p>";
   this.logHistButton.onClick = () => {
      this.dialog.stretchGraph.logHistogram = !this.dialog.stretchGraph.logHistogram;
      if (this.dialog.stretchGraph.logHistogram)
      {
         this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing log histogram.</p>";
      }
      else
      {
         this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing standard histogram.</p>";
      }
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
   this.channelSelectorControls.add(this.selectLCheck);
   this.channelSelectorControls.add(this.selectSCheck);
   this.channelSelectorControls.add(this.selectLumCheck);
   this.channelSelectorControls.addStretch();
   this.channelSelectorControls.add(this.logHistButton);
   this.channelSelectorControls.add(this.histUpdateButton);


   this.plotControlsLeft = new VerticalSizer( this )
   this.plotControlsLeft.margin = 0;
   this.plotControlsLeft.spacing = 4;
   this.plotControlsLeft.add(this.stretchGraph);
   this.plotControlsLeft.add(this.channelSelectorControls);
   this.plotControlsLeft.add(this.graphInfoControls);
   //this.plotControlsLeft.add(this.logGraphCheck);

/*******************************************************************************
 * MAIN DIALOG - Create the graph navigation controls
 *******************************************************************************/

   //Add zoom control for the graph
   this.zoomControl = new NumericControl(this);
   this.zoomControl.label.text = "Zoom:";
   this.zoomControl.label.minWidth = minLabelWidth;
   this.zoomControl.setRange(1.0, 200);
   var zoomPrecision = 2;
   this.zoomControl.setPrecision( zoomPrecision );
   this.zoomControl.slider.setRange( 1.0, Math.pow10(zoomPrecision) );
   this.zoomControl.setValue(1.0);
   this.zoomControl.toolTip = "<p>Zooms the graph view centred on the panning point.</p>";
   this.zoomControl.onValueUpdated = function(value) {
      this.dialog.stretchGraph.graphRange = 1.0 / value;
      this.dialog.updateControls();
   }

   // create zoom reset button
   this.resetZoomButton = new ToolButton(this);
   this.resetZoomButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetZoomButton.setScaledFixedSize( 24, 24 );
   this.resetZoomButton.toolTip = "<p>Reset zoom.</p>";
   this.resetZoomButton.onClick = function() {
      this.dialog.stretchGraph.graphRange = 1.0;
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
   this.panControl.label.minWidth = minLabelWidth;
   this.panControl.setRange(0.0, 1.0);
   var panPrecision = 3;
   this.panControl.setPrecision( panPrecision );
   this.panControl.slider.setRange( 0, Math.pow10(panPrecision) );
   this.panControl.setValue(0.0);
   this.panControl.toolTip = "<p>Pans the graph view and specifies the centre point for a zoom." +
            " The pan point may be set by double mouse click on the graph.</p>";
   this.panControl.onValueUpdated = function(value) {
      this.dialog.stretchGraph.graphMidValue = value;
      this.dialog.updateControls();
   }

   // create pan reset button
   this.resetPanButton = new ToolButton(this);
   this.resetPanButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetPanButton.setScaledFixedSize( 24, 24 );
   this.resetPanButton.toolTip = "<p>Reset zoom.</p>";
   this.resetPanButton.onClick = function() {
      this.dialog.stretchGraph.graphMidValue = 0.0;
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


   this.histogramData = new ControlHistData();
   this.histogramData.minWidth = 350;
   this.histogramData.clearTable("Select a target view", "to see histogram data");

/*******************************************************************************
 * MAIN DIALOG - Create the view picker
 *******************************************************************************/

   // add a view picker
   this.viewListLabel = new Label(this);
   this.viewListLabel.minWidth = minLabelWidth;
   this.viewListLabel.text = "Target view:";
   this.viewListLabel.textAlignment = -1;
   this.viewList = new ViewList(this);
   this.viewList.getMainViews();

   this.viewList.onViewSelected = function (view) {
      // If the selected view has an STF applied then offer to remove this

      if ((view.id != "") && (optionParameters.checkSTF))
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

      let currentViewId = this.dialog.targetView.id;
      this.dialog.targetView = view;

      if ((view.id != "") && (!ghsLog.hasItem(view.id))) {ghsLog.add(view.id, "First opened from view list");}
      if (view.id != currentViewId) ghsViews.tidyUp();

      this.dialog.newImageRefresh();
   }

   // prepare the image inspection button
   this.imageInspectorButton = new ToolButton( this );
   this.imageInspectorButton.icon = this.scaledResource( ":/icons/picture.png" );
   this.imageInspectorButton.setScaledFixedSize( 24, 24 );
   this.imageInspectorButton.toolTip = "<p>Open a new dialog to inspect the image.  " +
                  "Here you will be able to preview the target image and query pixels to see values " +
                  "before and after the stretch.  You can also see key statistics from the stretched histogram.</p>";
   this.imageInspectorButton.onClick = () => {
      if (this.targetView.id != "")
      {
         var imgDialog = new DialogInspector(ghsViews);
         imgDialog.execute();
      }
      else
      {
         var warn2Message = "Image inspector cannot be run without a target image being selected";
         var msgReturn = (new MessageBox( warn2Message, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      this.dialog.viewList.reload();
      this.dialog.updateControls();
   }


   // add a mask picker
   this.maskListLabel = new Label(this);
   this.maskListLabel.minWidth = minLabelWidth;
   this.maskListLabel.text = "Mask:";
   this.maskListLabel.textAlignment = -1;

   this.maskList = new ComboBox(this);
   this.maskList.editEnabled = false;

   this.maskList.updateViews = function()
   {
      this.clear();
      this.addItem("<No Mask Selected>");

      if (this.dialog.targetView.id != "")
      {
         var tw = this.dialog.targetView.window;
         var w = ImageWindow.windows;
         for (i = 0; i < w.length; ++i)
         {
            if ((tw.isMaskCompatible(w[i])))
            {
               this.addItem(w[i].mainView.id);
            }
         }
      }
   }
   this.maskList.updateViews();
   this.maskList.onItemSelected = function(index)
   {
      let timerWasRunning = this.dialog.previewTimer.isRunning;
      this.dialog.previewTimer.stop();

      if (index == 0)
      {
         this.dialog.targetView.window.removeMask();
         this.dialog.imagePreview.invalidPreview = true;
         this.dialog.imagePreview.setImage(this.dialog.targetView);
      }
      else
      {
         this.dialog.targetView.window.mask = View.viewById(this.itemText(index)).window;
         this.dialog.targetView.window.maskEnabled = true;
         this.dialog.imagePreview.invalidPreview = true;
         this.dialog.imagePreview.setImage(this.dialog.targetView);
      }

      if (timerWasRunning) this.dialog.previewTimer.start();
      this.dialog.updateControls();
   }


   this.viewPicker = new HorizontalSizer(this);
   this.viewPicker.margin = 0;
   this.viewPicker.spacing = 4;
   this.viewPicker.add(this.viewListLabel);
   this.viewPicker.add(this.viewList);
   this.viewPicker.add(this.imageInspectorButton);
   this.viewPicker.addStretch();

   this.maskPicker = new HorizontalSizer(this);
   this.maskPicker.margin = 0;
   this.maskPicker.spacing = 4;
   this.maskPicker.add(this.maskListLabel);
   this.maskPicker.add(this.maskList);
   this.maskPicker.addStretch();

   // invert mask checkbox
   this.invertMaskLabel = new Label(this);
   this.invertMaskLabel.minWidth = minLabelWidth;
   this.invertMaskLabel.text = "";
   this.invertMaskLabel.textAlignment = -1;
   this.invertMaskCheck = new CheckBox( this )
   this.invertMaskCheck.text = "Invert mask";
   this.invertMaskCheck.checked = false;
   this.invertMaskCheck.toolTip =
         "<p>Use the mask inverted. </p>";
   this.invertMaskCheck.onCheck = function( checked )
   {
      let timerWasRunning = this.dialog.previewTimer.isRunning;
      this.dialog.previewTimer.stop();

      this.dialog.targetView.window.maskInverted = checked;
      this.dialog.imagePreview.maskInverted = checked;
      this.dialog.imagePreview.invalidPreview = true;
      this.dialog.imagePreview.stretchPreview();

      if (timerWasRunning) this.dialog.previewTimer.start();
      this.dialog.updateControls();
   }

   this.invertMaskControl = new HorizontalSizer(this);
   this.invertMaskControl.margin = 0;
   this.invertMaskControl.spacing = 4;
   this.invertMaskControl.add(this.invertMaskLabel);
   this.invertMaskControl.add(this.invertMaskCheck);
   this.invertMaskControl.addStretch();

   // invert mask checkbox
   this.showMaskLabel = new Label(this);
   this.showMaskLabel.minWidth = minLabelWidth;
   this.showMaskLabel.text = "";
   this.showMaskLabel.textAlignment = -1;
   this.showMaskCheck = new CheckBox( this )
   this.showMaskCheck.text = "Show mask";
   this.showMaskCheck.checked = false;
   this.showMaskCheck.toolTip =
         "<p>Show the mask on the target image.  The mask will always be hidden in the preview. </p>";
   this.showMaskCheck.onCheck = function( checked )
   {
      if (this.dialog.targetView.id != "")
      {
         this.dialog.targetView.window.maskVisible = checked;
      }
      this.dialog.updateControls();
   }

   this.showMaskControl = new HorizontalSizer(this);
   this.showMaskControl.margin = 0;
   this.showMaskControl.spacing = 4;
   this.showMaskControl.add(this.showMaskLabel);
   this.showMaskControl.add(this.showMaskCheck);
   this.showMaskControl.addStretch();

   // create new image checkbox
   this.newImageLabel = new Label(this);
   this.newImageLabel.minWidth = minLabelWidth;
   this.newImageLabel.text = "";
   this.newImageLabel.textAlignment = -1;
   this.newImageCheck = new CheckBox( this )
   this.newImageCheck.text = "Create new image on execution";
   this.newImageCheck.checked = stretchParameters.createNewImage;
   this.newImageCheck.toolTip =
         "<p>Create a new image on application of the stretch. When selected, the target " +
         "image will remain unchanged or unstretched.  Instead a new image will be generated.</p>";
   this.newImageCheck.onCheck = function( checked )
   {
      stretchParameters.createNewImage = checked;
      this.dialog.updateControls();
   }

   this.newImageControl = new HorizontalSizer(this);
   this.newImageControl.margin = 0;
   this.newImageControl.spacing = 4;
   this.newImageControl.add(this.newImageLabel);
   this.newImageControl.add(this.newImageCheck);
   this.newImageControl.addStretch();

   // create new image id input
   this.newImageIdLabel = new Label(this);
   this.newImageIdLabel.minWidth = minLabelWidth;
   this.newImageIdLabel.text = "New image id:";
   this.newImageIdLabel.textAlignment = -1;
   this.newImageIdEdit = new Edit(this);
   this.newImageIdEdit.text = "<Auto>"
   this.newImageIdEdit.toolTip = "<p>A valid view id must use only numbers, upper or lower case letters or an underscore. " +
               "It also cannot start with a number.  If no view id is entered or the view id is invalid, the new image " +
               "will be created with the an id of 'ghsImage'.  To avoid duplicate ids a sequential number will be added " +
               "to the view id if necessary.</p>";
   this.newImageIdEdit.onEditCompleted = function(text)
   {
      if (this.text == "")
      {
         this.text = "<Auto>";
      }
      else if (!isValidViewId(this.text) && (this.text != "<Auto>"))
      {
         let warnMessage = "You have not entered a valid view id";
         let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      stretchParameters.newImageId = this.text;
      this.dialog.updateControls();
   }
   this.newImageIdEdit.onGetFocus = function()
   {
      if (this.text == "<Auto>") this.text = "";
   }

   this.newImageIdControl = new HorizontalSizer(this);
   this.newImageIdControl.margin = 0;
   this.newImageIdControl.spacing = 4;
   this.newImageIdControl.add(this.newImageIdLabel);
   this.newImageIdControl.add(this.newImageIdEdit);
   this.newImageIdControl.addStretch();


/*******************************************************************************
 * MAIN DIALOG - Create the main parameter input controls
 *******************************************************************************
/*
   *****************************************************************************
   *********** create the stretch type selector ********************************
*/

   this.transfListLabel = new Label(this);
   this.transfListLabel.minWidth = minLabelWidth;
   this.transfListLabel.text = stretchParameters.name_ST;
   this.transfListLabel.textAlignment = -1;
   this.transfList = new ComboBox ( this );
   this.transfList.minWidth = minLabelWidth;
   for (var i = 0; i < stretchParameters.stretchNames.length; ++i)
   {
      this.transfList.addItem(stretchParameters.stretchNames[i]);
   }
   this.transfList.currentItem = stretchParameters.ST;
   this.transfList.toolTip =
      "<p>Specifies the transformation equations to use for stretching. In most cases " +
      "this will be the Generalised Hyperbolic Stretch equations designed for this script. " +
      "Other options include the standard HT/STF and arcsinh functions to which the script brings " +
      "additional functionality.  Set to 'Linear stretch' to set the black-point or white-point levels and conduct " +
      "a linear stretch to regain contrast.  The linear stretch also allows you to increase dynamic range by setting " +
      "black-point less than zero or white-point above 1.  'Invert Image' inverts the target image which can be useful to " +
      "work on brighter areas, after which the image can be re-inverted.</p>";
   this.transfList.onItemSelected = function( index )
   {
      if ( !(stretchParameters.ST == index) )
      {
         stretchParameters.ST = index;
         if (stretchParameters.STN() == "STF Transformation") ghsStretch.calculateVariables(this.dialog.targetView);
         this.dialog.updateControls();
      }
   }

   // create log graph checkbox
   this.invPositionLabel = new Label(this);
   this.invPositionLabel.minWidth = minLabelWidth;
   this.inverseTransfCheck = new CheckBox( this )
   this.inverseTransfCheck.text = "Invert transformation";
   this.inverseTransfCheck.checked = stretchParameters.Inv;
   this.inverseTransfCheck.toolTip =
         "<p>Check here to use the inverse form of the transformation equations. " +
         "This can be useful to recover a previous state of the image if undo is not" +
         " available - assuming you know the stretch parameters used.  Stretch parameters" +
         " can be saved using the log facility.</p>";
   this.inverseTransfCheck.onCheck = function( checked )
   {
      stretchParameters.Inv = checked;
      this.dialog.updateControls();
   }

   this.transfPicker1 = new HorizontalSizer(this);
   this.transfPicker1.margin = 0;
   this.transfPicker1.spacing = 4;
   this.transfPicker1.add(this.transfListLabel);
   this.transfPicker1.add(this.transfList);
   this.transfPicker1.addStretch();

   this.transfPicker2 = new HorizontalSizer(this);
   this.transfPicker2.margin = 0;
   this.transfPicker2.spacing = 4;
   this.transfPicker2.add(this.invPositionLabel);
   this.transfPicker2.add(this.inverseTransfCheck);
   this.transfPicker2.addStretch();

   this.transfPicker = new VerticalSizer(this);
   this.transfPicker.margin = 0;
   this.transfPicker.spacing = 4;
   this.transfPicker.add(this.transfPicker1);
   this.transfPicker.add(this.transfPicker2);
   this.transfPicker.addStretch();


/*
   ***************************************************************************
   *********** create the D input slider *************************************
*/

   this.DControl = new ControlParamInput(stretchParameters.D, 0, 10, stretchParameters.DPrecision, stretchParameters.name_D, minLabelWidth);
   this.DControl.numControl.toolTip = "<p>Controls the amount of stretch. D is a variable that independently controls the contrast added (the slope of " +
      "the stretch transform) at SP, thus adjusting the amount of stretch applied to the rest of the image.  D does not change the 'form' of " +
      "the stretch, simply the amount.  D should be used in tandem with b to control the distribution of contrast and brightness. When D is set " +
      "to zero, the stretch transform will be the identity (y=x) or 'no stretch' transform.</p>";
   this.DControl.numControl.onValueUpdated = function( value )
   {
      stretchParameters.D = value;
      this.dialog.updateControls();
   }
   this.DControl.resetButton.toolTip = "Reset " + stretchParameters.name_D + " to " +
            stretchParameters.default_D.toFixed(stretchParameters.DPrecision) + ".";
   this.DControl.resetButton.onClick = function()
   {
      stretchParameters.D = stretchParameters.default_D;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the b input slider *************************************
*/

   this.bControl = new ControlParamInput(stretchParameters.b, -10, 10, stretchParameters.bPrecision, stretchParameters.name_b, minLabelWidth);
   this.bControl.numControl.toolTip = "<p>Controls how tightly focused the stretch is around " + stretchParameters.name_SP +
      " by changing the form of the transform iteself. For concentrated stretches (such as initial stretches on linear images)" +
      " a large +ve b factor should be employed to focus" +
      " a stretch within a histogram peak while de-focusing the stretch away from the histogram peak (such as bright stars)." +
      " For adjustment of non-linear images, lower or -ve b (and/or lower D) parameters should be employed to distribute" +
      " contrast and brightness more evenly.  Large positive values of 'b' can be thought of as a histogram widener, ie spreading the histogram wider about the" +
      " focus point, SP.  By contrast, lower and -ve values of b tend to shift the histogram to a brighter (or dimmer) position without affecting its width too greatly." +
      " As a general rule, the level of b employed will decrease as a stretch sequence nears completion, although" +
      " larger +ve b values (with small D) can still be employed for precise placement of additional contrast.</p>";
   this.bControl.numControl.onValueUpdated = function( value )
   {
      stretchParameters.b = value;
      this.dialog.updateControls();
   }
   this.bControl.resetButton.toolTip = "Reset " + stretchParameters.name_b + " to " +
            stretchParameters.default_b.toFixed(stretchParameters.bPrecision) + ".";
   this.bControl.resetButton.onClick = function()
   {
      stretchParameters.b = stretchParameters.default_b;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the SP input slider ************************************
*/

   this.SPControl = new ControlParamInput(stretchParameters.SP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_SP, minLabelWidth);
   this.SPControl.numControl.toolTip = "<p>Sets the focus point around which the stretch is applied - " +
      "contrast will be distributed symmetrically about SP.  While 'b' provides the degree of focus of the stretch," +
      " SP determines where that focus is applied.  SP should generally be placed within a histogram peak so that the stretch " +
      " will widen and lower the peak by adding the most contrast in the stretch at that point.  Pixel values will move away from" +
      " the SP location.  " +
      "This parameter must be greater than or equal to " + stretchParameters.name_LP + " and less than or equal to " + stretchParameters.name_HP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.SPControl.numControl.onValueUpdated = function( value )
   {
      var SP = value;
      var HP = stretchParameters.HP;
      var LP = stretchParameters.LP;
      var q = Math.pow10(-stretchParameters.LPSPHPPrecision);


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
   this.SPControl.resetButton.toolTip = "Reset " + stretchParameters.name_SP + " to " +
            stretchParameters.default_SP.toFixed(stretchParameters.LPSPHPPrecision) + ".";
   this.SPControl.resetButton.onClick = function()
   {
      stretchParameters.SP = stretchParameters.default_SP;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the LP input slider ************************************
*/

   this.LPControl = new ControlParamInput(stretchParameters.LP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_LP, minLabelWidth);
   this.LPControl.numControl.toolTip = "<p>Sets a value below which the stretch is modified to preserve contrast in the shadows/lowlights. " +
      "This is done by performing a linear stretch of the data below the 'LP' level by reserving contrast from the rest of the image." +
      " Moving the LP level towards the current setting of SP changes both the scope (range) and the amount of this contrast reservation, the net effect" +
      " is to push the overal stretch to higher brightness levels while keeping the contrast and definition in the background.  The amount of" +
      " contrast reserved for the lowlights is such that the continuity of the stretch is preserved.  " +
      "This parameter must be greater than or equal to 0 and not greater than " + stretchParameters.name_SP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.LPControl.numControl.onValueUpdated = function( value )
   {
      var SP = stretchParameters.SP;
      var LP = value;
      var q = Math.pow10(-stretchParameters.LPSPHPPrecision);

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
   this.LPControl.resetButton.toolTip = "Reset " + stretchParameters.name_LP + " to " +
            stretchParameters.default_LP.toFixed(stretchParameters.LPSPHPPrecision) + ".";
   this.LPControl.resetButton.onClick = function()
   {
      stretchParameters.LP = stretchParameters.default_LP;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the HP input slider ************************************
*/

   this.HPControl = new ControlParamInput(stretchParameters.HP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_HP, minLabelWidth);
   this.HPControl.numControl.toolTip = "<p>Sets a value above which the stretch is modified to preserve contrast in the highlights/stars. " +
      "This is done by performing a linear stretch of the data above the 'HP' level by reserving contrast from the rest of the image." +
      " Moving the HP level towards the current setting of SP increases both the scope (range) and the amount of this contrast reservation, the net effect" +
      " is to push the overal stretch to lower brightness levels while keeping the contrast and definition in the highlights.  The amount of" +
      " contrast reserved for the highlights is such that the continuity of the stretch is preserved.  " +
      "This parameter must be less than or equal to 1 and not less than " + stretchParameters.name_SP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.HPControl.numControl.onValueUpdated = function( value )
   {
      var SP = stretchParameters.SP;
      var HP = value;
      var q = Math.pow10(-stretchParameters.LPSPHPPrecision);

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
   this.HPControl.resetButton.toolTip = "Reset " + stretchParameters.name_HP + " to " +
            stretchParameters.default_HP.toFixed(stretchParameters.LPSPHPPrecision) + ".";
   this.HPControl.resetButton.onClick = function()
   {
      stretchParameters.HP = stretchParameters.default_HP;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the BP input slider ************************************
*/

   this.BPControl = new ControlParamInput(stretchParameters.BP, -1, 1, stretchParameters.BPWPPrecision, stretchParameters.name_BP, minLabelWidth);
   this.BPControl.numControl.toolTip = "<p>Sets the black point for a linear stretch of the image." +
         "  Note that any pixel with values less than the blackpoint input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be dimmed.  Pixels with values less than the blackpoint will appear black and have 0 value." +
         "  Updating this parameter will automatically update the low clipping proportion</p>";
   this.BPControl.numControl.onValueUpdated = function( value )
   {
      let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
      stretchParameters.BP = Math.min(stretchParameters.WP - q, value);
      if (stretchParameters.Inv) stretchParameters.BP = Math.min(0.0, value);
      this.dialog.updateControls();
   }
   this.BPControl.resetButton.toolTip = "<p>Reset pre-stretch black point to zero.</p>";
   this.BPControl.resetButton.onClick = function()
   {
      stretchParameters.BP = 0.0;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the LCP input slider ************************************
*/

   this.LCPControl = new ControlParamInput(0.0, 0, 1, stretchParameters.BPWPPrecision, "Low Clip (LCP)", minLabelWidth);
   this.LCPControl.numControl.toolTip = "<p>Sets the clipping level for linear stretch of the image." +
         " Updating this parameter will automatically update " + stretchParameters.name_BP +
         " in such a way that LCP is the maximum fraction of pixels clipped in any channel and set to zero in the" +
         " linear stretch." +
         "  Note that any pixel with values less than the black-point input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be dimmed.  Pixels with values less than the blackpoint will appear black and have 0 value.</p>";
   this.LCPControl.numControl.onValueUpdated = function( value )
   {
      if ( !(this.dialog.targetView.id == "") ) {
         stretchParameters.BP = clipLow(value, this.dialog.channels(), ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]);
         if (!(stretchParameters.BP < stretchParameters.WP))
         {
            let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
            stretchParameters.WP = stretchParameters.BP + q;
         }
         this.dialog.updateControls();}
   }
   this.LCPControl.resetButton.toolTip = "<p>Set pre-stretch black point to maximum level for which clipping percentage is zero.</p>";
   this.LCPControl.resetButton.onClick = function()
   {
      if ( !(this.dialog.targetView.id == "") ) {
         let channels = this.dialog.channels();
         if (stretchParameters.channelSelector[0]) channels = [0];
         if (stretchParameters.channelSelector[1]) channels = [1];
         if (stretchParameters.channelSelector[2]) channels = [2];
         stretchParameters.BP = clipLow(0, channels, ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]);
         if (!(stretchParameters.BP < stretchParameters.WP))
         {
            let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
            stretchParameters.WP = stretchParameters.BP + q;
         }
         this.dialog.updateControls();}
   }

/*
   ***************************************************************************
   *********** create the WP input slider ************************************
*/

   this.WPControl = new ControlParamInput(stretchParameters.WP, 0, 2, stretchParameters.BPWPPrecision, stretchParameters.name_WP, minLabelWidth);
   this.WPControl.numControl.toolTip = "<p>Sets the white point for a linear stretch of the image." +
         "  Note that any pixel with value greater than the white-point input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be brightened.  Pixels with values greater than the white-point will appear white and have a value of 1.0." +
         "  Updating this parameter will automatically update the high clipping proportion</p>";
   this.WPControl.numControl.onValueUpdated = function( value )
   {
      let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
      stretchParameters.WP = Math.max(stretchParameters.BP + q, value);
      if (stretchParameters.Inv) stretchParameters.WP = Math.max(1.0, value);
      this.dialog.updateControls();
   }
   this.WPControl.resetButton.toolTip = "<p>Reset white point to 1.0.</p>";
   this.WPControl.resetButton.onClick = function()
   {
      stretchParameters.WP = 1.0;
      this.dialog.updateControls();
   }

/*
   ***************************************************************************
   *********** create the HCP input slider ***********************************
*/

   this.HCPControl = new ControlParamInput(0.0, 0, 1, stretchParameters.BPWPPrecision, "High Clip (HCP)", minLabelWidth);
   this.HCPControl.numControl.toolTip = "<p>Sets the upper clipping level for linear stretch of the image." +
         " Updating this parameter will automatically update " + stretchParameters.name_WP +
         " in such a way that HCP is the maximum fraction of pixels clipped in any channel and set to 1.0 in the" +
         " linear stretch." +
         "  Note that any pixel with value greater than the white-point input will be clipped and the data lost." +
         "  Contrast gained by performing the linear stretch will be evenly distributed over the image, which will" +
         " be brightened.  Pixels with values greater than the white-point will appear white and have a value of 1.0.</p>";
   this.HCPControl.numControl.onValueUpdated = function( value )
   {
      if ( !(this.dialog.targetView.id == "") ) {
         stretchParameters.WP = clipHigh(value, this.dialog.channels(), ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]);
         if (!(stretchParameters.BP < stretchParameters.WP))
         {
            let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
            stretchParameters.BP = stretchParameters.WP - q;
         }
         this.dialog.updateControls();}
   }
   this.HCPControl.resetButton.toolTip = "<p>Set white point to minimum level for which clipping percentage is zero.</p>";
   this.HCPControl.resetButton.onClick = function()
   {
      if ( !(this.dialog.targetView.id == "") ) {
         let channels = this.dialog.channels();
         if (stretchParameters.channelSelector[0]) channels = [0];
         if (stretchParameters.channelSelector[1]) channels = [1];
         if (stretchParameters.channelSelector[2]) channels = [2];
         stretchParameters.WP = clipHigh(0, channels, ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]);
         if (!(stretchParameters.BP < stretchParameters.WP))
         {
            let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
            stretchParameters.BP = stretchParameters.WP - q;
         }
         this.dialog.updateControls();}
   }

/*
   ***************************************************************************
   *********** create the STF linked checkbox ********************************
*/

   this.stfLinkedLabel = new Label(this);
   this.stfLinkedLabel.minWidth = minLabelWidth;
   this.stfLinkedCheck = new CheckBox( this )
   this.stfLinkedCheck.text = "Linked STF";
   this.stfLinkedCheck.checked = stretchParameters.linked;
   this.stfLinkedCheck.toolTip =
         "<p>Check to apply the same stretch to all three channels of a colour image. " +
         "If left unchecked the stretch will be calculated separately for each channel.</p>";
   this.stfLinkedCheck.onCheck = function( checked )
   {
      stretchParameters.linked = checked;
      this.dialog.updateControls();
   }

   this.stfControl = new HorizontalSizer(this);
   this.stfControl.margin = 0;
   this.stfControl.spacing = 4;
   this.stfControl.add(this.stfLinkedLabel);
   this.stfControl.add(this.stfLinkedCheck);
   this.stfControl.addStretch();



/*
   ***************************************************************************
   *********** create the combination image selection  ***********************
*/

   this.combineListLabel = new Label(this);
   this.combineListLabel.minWidth = minLabelWidth;
   this.combineListLabel.text = stretchParameters.name_combineViewId;
   this.combineListLabel.textAlignment = -1;

   this.combineViewList = new ViewList(this);
   this.combineViewList.editEnabled = false;
   this.combineViewList.getMainViews();
   this.combineViewList.onViewSelected = function (view)
   {
      stretchParameters.combineViewId = view.id;
      this.dialog.updateControls();
   }

   this.combineError = new ToolButton();
   this.combineError.icon = this.scaledResource(":/icons/warning.png");
   this.combineError.hide();

   this.combinationViewPicker = new HorizontalSizer(this);
   this.combinationViewPicker.margin = 0;
   this.combinationViewPicker.spacing = 4;
   this.combinationViewPicker.add(this.combineListLabel);
   this.combinationViewPicker.add(this.combineViewList);
   this.combinationViewPicker.add(this.combineError);
   this.combinationViewPicker.addStretch();

/*
   ***************************************************************************
   *********** create the combination percent slider *************************
*/

   this.combinePercentControl = new ControlParamInput(stretchParameters.combinePercent, 0, 100, 2, stretchParameters.name_combinePercent, minLabelWidth);
   this.combinePercentControl.numControl.toolTip = "<p>Controls the amount of stretch. D is a variable that independently controls the contrast added (the slope of " +
      "the stretch transform) at SP, thus adjusting the amount of stretch applied to the rest of the image.  D does not change the 'form' of " +
      "the stretch, simply the amount.  D should be used in tandem with b to control the distribution of contrast and brightness. When D is set " +
      "to zero, the stretch transform will be the identity (y=x) or 'no stretch' transform.</p>";
   this.combinePercentControl.numControl.onValueUpdated = function( value )
   {
      stretchParameters.combinePercent = value;
      this.dialog.updateControls();
   }
   this.combinePercentControl.resetButton.toolTip = "Reset " + stretchParameters.name_combinePercent + " to " +
            stretchParameters.default_combinePercent.toFixed(0) + ".";
   this.combinePercentControl.resetButton.onClick = function()
   {
      stretchParameters.combinePercent = stretchParameters.default_combinePercent;
      this.dialog.updateControls();
   }






/*
   ***************************************************************************
   *********** create the preview control ************************************
*/

   this.imagePreview = new ControlPreview(this);
   this.imagePreview.setFixedSize(optionParameters.previewWidth, optionParameters.previewHeight);
   this.imagePreview.setStretch( ghsStretch );
   this.imagePreview.backgroundColor = 0xffc0c0c0;
   this.imagePreview.crossColour = optionParameters.previewCrossColour;
   this.imagePreview.crossActive = optionParameters.previewCrossActive;
   this.imagePreview.targetView = this.targetView;

   this.optionShowButtons = new GroupBox(this);

   this.optShowPreview = new RadioButton(this.optionShowButtons);
   this.optShowPreview.text = "Show preview";
   this.optShowPreview.checked = this.imagePreview.showPreview;
   this.optShowPreview.toolTip = "<p>Show image with stretch applied - alternatively ctrl-click " +
      "(cmd-click on a Mac) on the image to toggle between preview and target view."
   this.optShowPreview.onCheck = function(checked)
   {
      this.dialog.imagePreview.showPreview = checked;
      this.dialog.imagePreview.invalidPreview = true;
   }

   this.optShowTarget = new RadioButton(this.optionShowButtons);
   this.optShowTarget.text = "Show target view";
   this.optShowTarget.checked = !this.imagePreview.showPreview;
   this.optShowTarget.toolTip = "<p>Show image without stretch applied, ie current target view - " +
      "alternatively ctrl-click (cmd-click on a Mac) on the image to toggle between preview and target view.</p>"
   this.optShowTarget.onCheck = function(checked)
   {
      this.dialog.imagePreview.showPreview = !checked;
      this.dialog.imagePreview.invalidPreview = true;
   }

   this.zoomLabel = new Label(this.optionShowButtons);
   this.zoomLabel.text = "Reset zoom";
   this.zoomLabel.textAlignment = 0x81;

   this.resetZoomButton = new ToolButton(this.optionShowButtons)
   this.resetZoomButton.icon = this.scaledResource( ":/toolbar/view-zoom-fit.png" );
   this.resetZoomButton.setScaledFixedSize( 24, 24 );
   this.resetZoomButton.toolTip = "<p>Click and drag on the image to specify a region of interest to zoom into. " +
            "Clicking on this button will reset to fit the whole image.</p>";
   this.resetZoomButton.onClick = function(checked)
   {
      this.dialog.imagePreview.resetImage();
   }

   this.previewTimer = new Timer();
   this.previewTimer.interval = optionParameters.previewDelay;
   this.previewTimer.periodic = true;
   this.previewTimer.dialog = this;
   this.previewTimer.busy = false;
   this.previewTimer.lastSPKeyCheck = "";
   this.previewTimer.lastSPKeyRefresh = "";

   this.previewTimer.onTimeout = function()
   {
      let currentSPKey = longStretchKey(ghsStretch, this.dialog.targetView) + this.dialog.imagePreview.imageSelection.toString();
      let noParameterChangesSinceLastCheck = (this.lastSPKeyCheck == currentSPKey);
      let parametersChangedSinceLastUpdate = (currentSPKey != this.dialog.imagePreview.lastStretchKey);
      let timeToUpdate = noParameterChangesSinceLastCheck && (parametersChangedSinceLastUpdate || this.dialog.imagePreview.invalidPreview);

      if (this.dialog.showRTP && timeToUpdate)
      {
         if (this.busy) return;

         this.stop();
         this.busy = true;

         this.dialog.imagePreview.invalidPreview = true;
         if (!parametersChangedSinceLastUpdate) this.dialog.imagePreview.invalidPreview = false;
         this.dialog.imagePreview.stretchPreview();

         this.busy = false;
         this.start();
      }

      this.lastSPKeyCheck = currentSPKey
   }

   this.optionShowButtons.title = "Preview controls";
   this.optionShowButtons.sizer = new HorizontalSizer();
   this.optionShowButtons.sizer.margin = 8;
   this.optionShowButtons.sizer.add(this.optShowPreview);
   this.optionShowButtons.sizer.addSpacing(8);
   this.optionShowButtons.sizer.add(this.optShowTarget);
   this.optionShowButtons.sizer.addSpacing(8);
   this.optionShowButtons.sizer.add(this.resetZoomButton);
   this.optionShowButtons.sizer.addSpacing(8);
   this.optionShowButtons.sizer.add(this.zoomLabel);


   this.previewButtons = new HorizontalSizer(this)
   this.previewButtons.addStretch();
   this.previewButtons.add(this.optionShowButtons);
   this.previewButtons.addStretch();


/*******************************************************************************
 * MAIN DIALOG - Prepare the buttons
 *******************************************************************************/

   // prepare the create instance button
   this.newInstanceButton = new ToolButton( this );
   this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
   this.newInstanceButton.setScaledFixedSize( 24, 24 );
   this.newInstanceButton.toolTip = "New Instance";
   this.newInstanceButton.onMousePress = () => {
      this.newImageIdEdit.end();
      this.viewList.hasFocus = true;
      processEvents();
      // store the parameters
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

      this.newImageIdEdit.end();
      this.viewList.hasFocus = true;
      processEvents();

      let timerWasRunning = this.previewTimer.isRunning;
      this.previewTimer.stop();

      // check if a valid target view has been selected
      if (this.targetView && this.targetView.id)
      {

         // check if a blend transformation has been selected that the blend image is valid
         if ((stretchParameters.STN() == "Image Blend") && !this.targetView.window.isMaskCompatible(View.viewById(stretchParameters.combineViewId).window))
         {
            let warnMessage = "Blend image is incompatible with target image";
            let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
         }
         else
         {
            // Let user know what is happening
            Console.show();
            Console.writeln("Applying stretch with the following parameters:");
            Console.writeln("Stretch type:                     ", stretchParameters.ST);
            Console.writeln("Stretch name:                     ", stretchParameters.STN());
            Console.writeln("Stretch factor:                   ", stretchParameters.D);
            Console.writeln("Local stretch intensity:          ", stretchParameters.b);
            Console.writeln("Maximum intensity point (SP):     ", stretchParameters.SP);
            Console.writeln("Shadows protection point (LP):    ", stretchParameters.LP);
            Console.writeln("Highlight protection point (HP):  ", stretchParameters.HP);
            Console.writeln("Pre-stretch blackpoint (BP):      ", stretchParameters.BP);
            Console.writeln("Pre-stretch whitepoint (WP):      ", stretchParameters.WP);
            Console.writeln("Invert transformation:            ", stretchParameters.WP);
            Console.writeln("Linked STF:                       ", stretchParameters.WP);
            Console.writeln("Stretch channel R:                ", stretchParameters.channelSelector[0]);
            Console.writeln("Stretch channel G:                ", stretchParameters.channelSelector[1]);
            Console.writeln("Stretch channel B:                ", stretchParameters.channelSelector[2]);
            Console.writeln("Stretch channel RGB/K:            ", stretchParameters.channelSelector[3]);
            Console.writeln("Stretch channel L*:               ", stretchParameters.channelSelector[4]);
            Console.writeln("Stretch channel Sat:              ", stretchParameters.channelSelector[5]);
            Console.writeln("Stretch channel Lum:              ", stretchParameters.channelSelector[6]);
            Console.writeln("Mask id:                          ", this.targetView.window.mask.mainView.id);
            Console.writeln("Mask enabled:                     ", this.targetView.window.maskEnabled);
            Console.writeln("Mask inverted:                    ", this.targetView.window.maskInverted);

            var newView = ghsStretch.executeOn(this.targetView);

            // log stretch
            ghsLog.add(newView.id, longStretchKey(ghsStretch, this.targetView));

            // select the new image if that is what the user wants
            if (optionParameters.selectNewImage) this.targetView = newView;

            Console.hide();

            this.newImageRefresh();
            this.updateControls();

         }
      }
      else
      {
         let warnMessage = "No target view is specified";
         let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
      }

      if (timerWasRunning) this.previewTimer.start();
   }

   // prepare the cancel button
   this.cancelButton = new ToolButton(this);
   this.cancelButton.icon = this.scaledResource( ":/process-interface/cancel.png" );
   this.cancelButton.setScaledFixedSize( 24, 24 );
   this.cancelButton.toolTip = "<p>Close dialog with no action.</p>";
   this.cancelButton.onClick = () => {
      this.cancel();
   }

   // prepare the real-time preview button
   this.rtpButton = new ToolButton( this );
   if (this.showRTP) {this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time-active.png" );}
   else {this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time.png" );}
   this.rtpButton.setScaledFixedSize( 24, 24 );
   this.rtpButton.toolTip = "Real time preview";
   this.rtpButton.onMousePress = () => {
      if (this.showRTP == true)
      {
         this.showRTP = false;
         this.previewTimer.stop();
         this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time.png" );
      }
      else if (this.showRTP == false)
      {
         this.showRTP = true;
         this.previewTimer.start();
         this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time-active.png" );
      }
      this.previewRefresh();
   }

   // prepare the undo button
   this.undoButton = new ToolButton(this);
   this.undoButton.icon = this.scaledResource( ":/toolbar/image-undo.png" );
   this.undoButton.setScaledFixedSize( 24, 24 );
   this.undoButton.toolTip = "<p>Move one step back in the process history of the target view. " +
      "<b>Beware</b> that if the view has process history that predates running this script, " +
      "repeated application of this button will undo that history as well.</p>";
   this.undoButton.onClick = () => {
      if (this.targetView.canGoBackward) {
         let timerWasRunning = this.previewTimer.isRunning;
         this.previewTimer.stop();
         this.targetView.historyIndex -=1;
         ghsLog.undo(this.targetView.id);
         if (timerWasRunning) this.previewTimer.start();
      }
      this.newImageRefresh();
      this.updateControls();
   }

   // prepare the redo button
   this.redoButton = new ToolButton(this);
   this.redoButton.icon = this.scaledResource( ":/toolbar/image-redo.png" );
   this.redoButton.setScaledFixedSize( 24, 24 );
   this.redoButton.toolTip = "<p>Move one step forward in the process history of the target view.</p>";
   this.redoButton.onClick = () => {
      if (this.targetView.canGoForward) {
         let timerWasRunning = this.previewTimer.isRunning;
         this.previewTimer.stop();
         this.targetView.historyIndex +=1;
         ghsLog.redo(this.targetView.id);
         if (timerWasRunning) this.previewTimer.start();
      }
      this.newImageRefresh();
      this.updateControls();
   }

   this.browseDocumentationButton = new ToolButton(this);
   this.browseDocumentationButton.icon = this.scaledResource(":/process-interface/browse-documentation.png");
   this.browseDocumentationButton.setScaledFixedSize(24, 24);
   this.browseDocumentationButton.toolTip =
            "<p>Opens a browser to view the script's documentation.</p>";
   this.browseDocumentationButton.onClick = function () {
            let timerWasRunning = this.dialog.previewTimer.isRunning;
            this.dialog.previewTimer.stop();
            Dialog.browseScriptDocumentation("GeneralisedHyperbolicStretch");
            if (timerWasRunning) this.dialog.previewTimer.start();
    }

   this.websiteButton = new ToolButton(this);
   this.websiteButton.icon = this.scaledResource(":/icons/internet.png");
   this.websiteButton.setScaledFixedSize(24, 24);
   this.websiteButton.toolTip =
            "<p>Opens a browser to view the script's website which has links to useful resources including video tutorials.</p>";
   this.websiteButton.onClick = function () {
      let timerWasRunning = this.dialog.previewTimer.isRunning;
      this.dialog.previewTimer.stop();

      Dialog.openBrowser("https://www.ghsastro.co.uk/");

      if (timerWasRunning) this.dialog.previewTimer.start();
    }

   // prepare the reset button
   this.resetButton = new ToolButton( this );
   this.resetButton.icon = this.scaledResource( ":/process-interface/reset.png" );
   this.resetButton.setScaledFixedSize( 24, 24 );
   this.resetButton.toolTip = "<p>Reset the stretch parameters to their default initial values.</p>";
   this.resetButton.onClick = () => {
      let timerWasRunning = this.previewTimer.isRunning;
      this.previewTimer.stop();

      stretchParameters.reset();
      this.newImageIdEdit.text = "<Auto>";
      this.updateControls();

      if (timerWasRunning) this.previewTimer.start();
   }

   // prepare the preferences button
   this.preferencesButton = new ToolButton( this );
   this.preferencesButton.icon = this.scaledResource( ":/process-interface/edit-preferences.png" );
   this.preferencesButton.setScaledFixedSize( 24, 24 );
   this.preferencesButton.toolTip = "<p>Set preferences.</p>";
   this.preferencesButton.onClick = () => {
      let timerWasRunning = this.previewTimer.isRunning;
      this.previewTimer.stop();

      let optParams = optionParameters.clone();
      let optDialog = new DialogOptions(optParams);
      let previewChangeSize = false;
      let lumCoeffsChanged = false;
      let colourClipChanged = false;
      if (optDialog.execute())
      {
         if (optParams.previewWidth != optionParameters.previewWidth) previewChangeSize = true;
         if (optParams.previewHeight != optionParameters.previewHeight) previewChangeSize = true;

         let stillDefault = false;
         if ((optParams.lumCoeffSource == "Default") && (optionParameters.lumCoeffSource == "Default")) stillDefault = true;
         let stillImage = false;
         if ((optParams.lumCoeffSource == "Image") && (optionParameters.lumCoeffSource == "Image")) stillImage = true;
         let stillManual = false;
         if ((optParams.lumCoeffSource == "Manual") && (optionParameters.lumCoeffSource == "Manual")) stillManual = true;
         let coeffsUnchanged = false;
         if (optParams.lumCoefficients.toString() == optionParameters.lumCoefficients.toString()) coeffsUnchanged = true;
         if (!(stillDefault || stillImage || (stillManual && coeffsUnchanged))) lumCoeffsChanged = true;

         if (optParams.colourClip != optionParameters.colourClip) colourClipChanged = true;

         optionParameters.copy(optParams);
         this.setOptionParameters(optionParameters);
      }
      if( previewChangeSize ) {this.previewRefresh();}

      if (lumCoeffsChanged && (this.targetView.id != ""))
      {
         let newLumHistData = getLuminanceHistogram(this.targetView, this.getLumCoefficients());
         ghsViews.histograms[0][5] = newLumHistData[0];
         ghsViews.histArrays[0][5] = newLumHistData[1];
         ghsViews.cumHistArrays[0][5] = newLumHistData[2];

         if (ghsViews.histogramsAvailable(1))
         {
            newLumHistData = getLuminanceHistogram(ghsViews.getView(1), this.getLumCoefficients());
            ghsViews.histograms[1][5] = newLumHistData[0];
            ghsViews.histArrays[1][5] = newLumHistData[1];
            ghsViews.cumHistArrays[1][5] = newLumHistData[2];
         }
      }

      if (lumCoeffsChanged || colourClipChanged) this.imagePreview.lastStretchKey = "";

      if (timerWasRunning) this.previewTimer.start();

      this.updateControls();
   }

   // prepare the log view button
   this.logViewButton = new ToolButton( this );
   this.logViewButton.icon = this.scaledResource( ":/icons/book-open.png" );
   this.logViewButton.setScaledFixedSize( 24, 24 );
   this.logViewButton.toolTip = "<p>View stretch log.</p>";
   this.logViewButton.onClick = () => {
      let timerWasRunning = this.previewTimer.isRunning;
      this.previewTimer.stop();
      var logViewDialog = new DialogLog(ghsLog);
      logViewDialog.execute();
      if (timerWasRunning) this.previewTimer.start();
   }


/*******************************************************************************
 * MAIN DIALOG - update the preview control
 *******************************************************************************/

this.previewRefresh = function()
{
   if (this.showRTP)
   {
      this.centrePanel.show();
      this.rightPanel.show();
   }
   else
   {
      this.centrePanel.hide();
      this.rightPanel.hide();
   }
   //this.imagePreview.setFixedSize(optionParameters.previewWidth, optionParameters.previewHeight);
   //this.leftPanel.adjustToContents();
   //this.rightPanel.adjustToContents();
   this.adjustToContents();
   this.setVariableSize();
   this.imagePreview.resetImage();
}

/*******************************************************************************
 * MAIN DIALOG - update following selection of a new image
 *******************************************************************************/

this.newImageRefresh = function()
{
   let timerWasRunning = this.previewTimer.isRunning;
   this.previewTimer.stop();

   gc(); //take the opportunity to do a garbage tidy up.

   stretchParameters.channelSelector = [false, false, false, true, false, false, false];
   let histData = calculateHistograms(this.targetView, this.getLumCoefficients());
   this.maskList.updateViews();

   if (this.targetView.id != "")
   {
      this.targetView.window.currentView = this.targetView;
      this.histogramData.initParams(histData[2], histData[1]);
      ghsViews.setView(this.targetView, histData);
      this.stretchGraph.targetView = this.targetView;
      if (optionParameters.bringToFront) this.targetView.window.bringToFront();
      if (optionParameters.moveTopLeft) this.targetView.window.position = new Point(0,0);
      if (optionParameters.optimalZoom) this.targetView.window.zoomToOptimalFit();
      this.invertMaskCheck.checked = this.targetView.window.maskInverted;
      this.showMaskCheck.checked = this.targetView.window.maskVisible;
      if (this.targetView.window.maskEnabled && (this.targetView.window.mask.mainView.id != ""))
      {
         this.maskList.currentItem = this.maskList.findItem(this.targetView.window.mask.mainView.id);
         this.maskControls.show();
      }
      else
      {
         this.maskControls.hide();
      }
      this.imagePreview.invalidPreview = true;
      this.imagePreview.setImage(this.targetView);
   }
   else
   {
      ghsViews.setView(new View());
      this.imagePreview.setImage(new View());
      this.stretchGraph.targetView = new View();
   }

   this.updateControls();

   if (timerWasRunning) this.previewTimer.start();
}

/*******************************************************************************
 * MAIN DIALOG - update following selection of a new image
 *******************************************************************************/

   this.setOptionParameters = function(ghsOP)
   {
      this.stretchGraph.graphHistActive = ghsOP.graphHistActive;
      this.stretchGraph.graphHistCol = ghsOP.graphHistCol;
      this.stretchGraph.graphHistType = ghsOP.graphHistType;
      this.stretchGraph.graphRGBHistCol = ghsOP.graphRGBHistCol;

      this.stretchGraph.graphLineActive = ghsOP.graphLineActive;
      this.stretchGraph.graphRef1Active = ghsOP.graphRef1Active;
      this.stretchGraph.graphRef2Active = ghsOP.graphRef2Active;
      this.stretchGraph.graphGridActive = ghsOP.graphGridActive;

      this.stretchGraph.graphLineCol = ghsOP.graphLineCol;
      this.stretchGraph.graphRef1Col = ghsOP.graphRef1Col;
      this.stretchGraph.graphRef2Col = ghsOP.graphRef2Col;
      this.stretchGraph.graphGridCol = ghsOP.graphGridCol;
      this.stretchGraph.graphBackCol = ghsOP.graphBackCol;

      this.imagePreview.setFixedSize(ghsOP.previewWidth, ghsOP.previewHeight);
      this.previewTimer.interval = ghsOP.previewDelay;
      this.imagePreview.crossColour = ghsOP.previewCrossColour;
      this.imagePreview.crossActive = ghsOP.previewCrossActive;
   }

/*******************************************************************************
 * MAIN DIALOG - control update function
 *******************************************************************************/

   // Function to update any controls that need updating on change of input parameters
   this.updateControls = function()
   {
      if (!this.suspendUpdating)
      {
         let timerWasRunning = this.previewTimer.isRunning;
         this.previewTimer.stop();

         //Check any modifications to reflect stretch type
         var ST = stretchParameters.ST;
         var STN = stretchParameters.STN();

         // Update stretch parameter controls
         this.transfList.currentItem = stretchParameters.ST;
         this.inverseTransfCheck.checked = stretchParameters.Inv;
         this.DControl.numControl.setValue(stretchParameters.D);
         this.bControl.numControl.setValue(stretchParameters.b);
         this.SPControl.numControl.setValue(stretchParameters.SP);
         this.LPControl.numControl.setValue(stretchParameters.LP);
         this.HPControl.numControl.setValue(stretchParameters.HP);
         this.BPControl.numControl.setValue(stretchParameters.BP);
         this.WPControl.numControl.setValue(stretchParameters.WP);
         this.stfLinkedCheck = stretchParameters.linked;
         this.combinePercentControl.numControl.setValue(stretchParameters.combinePercent);

         if (this.targetView.id != "")
         {
            this.LCPControl.numControl.setValue(normCount(stretchParameters.BP, this.channels(), "max", ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]));
            this.HCPControl.numControl.setValue(1 - normCount(stretchParameters.WP, this.channels(), "max", ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]));
         }
         else
         {
            this.LCPControl.numControl.setValue(0);
            this.HCPControl.numControl.setValue(1);
         }

         // enable or disable stretch parameter controls as appropriate
         if (STN == "Generalised Hyperbolic Stretch") {                         // GHS general form
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.ghsStretchControls.show();
            this.inverseTransfCheck.enabled = true;
            this.bControl.enabled = true;}

         if (STN == "Histogram Transformation") {                         // Traditional histogram transformation
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.ghsStretchControls.show();
            this.inverseTransfCheck.enabled = true;
            this.bControl.enabled = false;}

         if (STN == "Arcsinh Stretch") {                         // Arcsinh stretch
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.ghsStretchControls.show();
            this.inverseTransfCheck.enabled = true;
            this.bControl.enabled = false;}

         if (STN == "Linear Stretch") {                         // Linear prestretch
            this.ghsStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.linearStretchControls.show();
            if ( !(stretchParameters.BP > 0) && !(stretchParameters.WP < 1) ) {
               this.inverseTransfCheck.checked = stretchParameters.Inv;
               this.inverseTransfCheck.enabled = true;}
            else {
               //stretchParameters.Inv = false;
               this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
               this.inverseTransfCheck.enabled = false;}}

         if (STN == "Image Inversion") {                         // Image inversion
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;}

         if (STN == "Image Blend") {                         // Image blend
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.show();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;}

         if (STN == "STF Transformation") {                         // Standard STF transformation
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.combineStretchControls.hide();
            this.stfStretchControls.show();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;}

         if (this.targetView.id == "")
         {
            this.LCPControl.enabled = false;
            this.HCPControl.enabled = false;
            this.imageInspectorButton.enabled = false;
            this.histUpdateButton.enabled = false;
            this.logHistButton.enabled = false;
            this.invertMaskCheck.checked = false;
            this.invertMaskCheck.enabled = false;
            this.maskList.enabled = false;
         }
         else
         {
            if (stretchParameters.Inv) {
               this.LCPControl.enabled = false;
               this.HCPControl.enabled = false;}
            else {
               this.LCPControl.enabled = true;
               this.HCPControl.enabled = true;}
            this.imageInspectorButton.enabled = true;
            this.histUpdateButton.enabled = true;
            this.logHistButton.enabled = true
            this.invertMaskCheck.enabled = true;
            this.maskList.enabled = true;
         }

         this.viewList.reload();
         this.combineViewList.reload();
         // remove images that are being used in the background in ghsViews
         for (let i = 1; i < ghsViews.views.length; ++i)
         {
            if (ghsViews.views[i] != undefined)
            {
               this.viewList.remove(ghsViews.views[i]);
               this.combineViewList.remove(ghsViews.views[i]);
            }
         }
         this.viewList.currentView = this.targetView;
         this.combineViewList.currentView = View.viewById(stretchParameters.combineViewId);

         if ((this.targetView.id != "") && (stretchParameters.combineViewId != "") && !this.targetView.window.isMaskCompatible(View.viewById(stretchParameters.combineViewId).window))
         {
            this.combineError.show();
            this.combineError.toolTip = "Warning: this image is incompatible with currently selected target view";
         }
         else
         {
            this.combineError.hide();
            this.combineError.toolTip = ""
         }

         if (this.targetView.image.isColor)
         {
            this.selectRCheck.enabled = true;
            this.selectGCheck.enabled = true;
            this.selectBCheck.enabled = true;
            if ((STN != "Image Blend") && (STN != "STF Transformation"))
            {
               this.selectLCheck.enabled = true;
               this.selectSCheck.enabled = true;
               this.selectLumCheck.enabled = true;
            }
            else
            {
               this.selectLCheck.enabled = false;
               this.selectSCheck.enabled = false;
               this.selectLumCheck.enabled = false;
               if ((stretchParameters.channelSelector[4]) || (stretchParameters.channelSelector[5]) || (stretchParameters.channelSelector[6]))
               {
                  stretchParameters.channelSelector[3] = true;
                  stretchParameters.channelSelector[4] = false;
                  stretchParameters.channelSelector[5] = false;
                  stretchParameters.channelSelector[6] = false;
               }
            }

         }
         else
         {
            this.selectRCheck.enabled = false;
            this.selectGCheck.enabled = false;
            this.selectBCheck.enabled = false;
            this.selectLCheck.enabled = false;
            this.selectSCheck.enabled = false;
            this.selectLumCheck.enabled = false;
         }

         this.selectRCheck.checked = stretchParameters.channelSelector[0];
         this.selectGCheck.checked = stretchParameters.channelSelector[1];
         this.selectBCheck.checked = stretchParameters.channelSelector[2];
         this.selectRGBKCheck.checked = stretchParameters.channelSelector[3];
         this.selectLCheck.checked = stretchParameters.channelSelector[4];
         this.selectSCheck.checked = stretchParameters.channelSelector[5];
         this.selectLumCheck.checked = stretchParameters.channelSelector[6];

         this.newImageCheck.checked = stretchParameters.createNewImage;
         if (stretchParameters.createNewImage) {this.newImageIdEdit.enabled = true;}
         else {this.newImageIdEdit.enabled = false;}

         // update the histogram table
         var clickX = this.stretchGraph.clickLevel;
         if ( this.targetView.id != "" )
         {
            if (clickX < 0.0) {this.histogramData.updateTable();}
            else {this.histogramData.updateTable([clickX, clickX, clickX]);}
         }
         else {this.histogramData.clearTable("Select a target view", "to see histogram data");}

         // update the graph information
         var info1 = "<b>Readout: </b>";
         var info2 = "";
         if (clickX < 0.0)
         {
            info2 = "[None]";
            this.graphInfoButton.enabled = false;
         }
         else
         {
            var plotY = ghsStretch.calculateStretch(clickX);
            info2 = "x="  + clickX.toFixed(5) + ", y=" + plotY.toFixed(5);

            if ( this.targetView.id != "" )
            {
               var level = Math.floor(clickX * ghsViews.getHistData(0)[0][0].resolution);
               info2 += ", level=" + level.toString();
               let chs = this.channels();
               if (chs.length == 1)
               {
                  var count = ghsViews.getHistData(0)[0][chs[0]].count(level);
                  info2 += ", K=" + count.toString();
               }
               else
               {
                  var h = ["R", "G", "B"];
                  for (var c = 0; c < 3; ++c)
                  {
                     var count = ghsViews.getHistData(0)[0][c].count(level);
                     info2 += ", " + h[c] + "=" + count.toString();
                  }
               }
            }
            this.graphInfoButton.enabled = true;
         }
         this.graphInfo1.text = info1 + info2;

         // Update the graph navigation controls
         this.zoomControl.setValue(1.0 / this.stretchGraph.graphRange);
         this.panControl.setValue(this.stretchGraph.graphMidValue);

         // Update the graph
         this.stretchGraph.repaint();

         // update the undo and redo buttons
         if (this.targetView.canGoBackward) {this.undoButton.enabled = true;}
         else {this.undoButton.enabled = false;}
         if (this.targetView.canGoForward) {this.redoButton.enabled = true;}
         else {this.redoButton.enabled = false;}

         // Update preview
         if ((this.showRTP) && (!this.imagePreview.invalidPreview))
         {
            if (this.imagePreview.lastStretchKey != longStretchKey(ghsStretch, this.targetView) + this.imagePreview.imageSelection.toString())
            {
               this.imagePreview.invalidPreview = true;
               this.imagePreview.repaint();
            }
         }

         if (timerWasRunning) this.previewTimer.start();
      }
   }


/*******************************************************************************
 * DIALOG - Layout
 *******************************************************************************/
   var layoutSpacing = 4

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
   this.graphBar = new SectionBar(this, "Graph");
   this.graphBar.setSection(this.graphControls);
   this.graphBar.onToggleSection = this.onToggleSection;

   // layout graph data controls
   this.dataControls = new Control( this );
   this.dataControls.sizer = new VerticalSizer( this );
   this.dataControls.sizer.margin = 8;
   this.dataControls.sizer.add(this.histogramData);
   this.dataBar = new SectionBar(this, "Histogram");
   this.dataBar.setSection(this.dataControls);
   this.dataBar.onToggleSection = this.onToggleSection;

   // layout view controls
   this.viewControls = new Control( this );
   this.viewControls.sizer = new VerticalSizer( this );
   this.viewControls.sizer.margin = 0;
   this.viewControls.sizer.add(this.viewPicker);
   this.viewControls.sizer.addSpacing(layoutSpacing);
   this.viewControls.sizer.add(this.newImageControl);
   this.viewControls.sizer.addSpacing(layoutSpacing);
   this.viewControls.sizer.add(this.newImageIdControl);
   this.viewBar = new SectionBar(this, "Image");
   this.viewBar.setSection(this.viewControls);
   this.viewBar.onToggleSection = this.onToggleSection;

   // layout mask controls
   this.maskControls = new Control( this );
   this.maskControls.sizer = new VerticalSizer( this );
   this.maskControls.sizer.margin = 0;
   this.maskControls.sizer.add(this.maskPicker);
   this.maskControls.sizer.addSpacing(layoutSpacing);
   this.maskControls.sizer.add(this.invertMaskControl);
   this.maskControls.sizer.addSpacing(layoutSpacing);
   this.maskControls.sizer.add(this.showMaskControl);
   this.maskBar = new SectionBar(this, "Mask");
   this.maskBar.setSection(this.maskControls);
   this.maskBar.onToggleSection = this.onToggleSection;

   // layout GHS parameters
   this.ghsStretchControls = new Control( this );
   this.ghsStretchControls.sizer = new VerticalSizer( this );
   this.ghsStretchControls.sizer.margin = 0;
   this.ghsStretchControls.sizer.add(this.DControl);
   this.ghsStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.ghsStretchControls.sizer.add(this.bControl);
   this.ghsStretchControls.sizer.addSpacing(3 * layoutSpacing);
   this.ghsStretchControls.sizer.add(this.SPControl);
   this.ghsStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.ghsStretchControls.sizer.add(this.LPControl);
   this.ghsStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.ghsStretchControls.sizer.add(this.HPControl);

   // layout linear parameters
   this.linearStretchControls = new Control( this );
   this.linearStretchControls.sizer = new VerticalSizer( this );
   this.linearStretchControls.sizer.margin = 0;
   this.linearStretchControls.sizer.add(this.BPControl);
   this.linearStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.linearStretchControls.sizer.add(this.LCPControl);
   this.linearStretchControls.sizer.addSpacing(3*layoutSpacing);
   this.linearStretchControls.sizer.add(this.WPControl);
   this.linearStretchControls.sizer.addSpacing(0.5*layoutSpacing);
   this.linearStretchControls.sizer.add(this.HCPControl);

   // layout STF parameters
   this.stfStretchControls = new Control( this );
   this.stfStretchControls.sizer = new VerticalSizer( this );
   this.stfStretchControls.sizer.margin = 0;
   this.stfStretchControls.sizer.add(this.stfControl);

   // layout image combination parameters
   this.combineStretchControls = new Control( this );
   this.combineStretchControls.sizer = new VerticalSizer( this );
   this.combineStretchControls.sizer.margin = 0;
   this.combineStretchControls.sizer.add(this.combinationViewPicker);
   this.combineStretchControls.sizer.add(this.combinePercentControl);


   // layout the main stretch controls
   this.mainStretchControls = new Control( this );
   this.mainStretchControls.sizer = new VerticalSizer( this );
   this.mainStretchControls.sizer.margin = 0;
   this.mainStretchControls.sizer.add(this.transfPicker);
   this.mainStretchControls.sizer.addSpacing(3 * layoutSpacing);
   this.mainStretchControls.sizer.add(this.ghsStretchControls);
   this.mainStretchControls.sizer.add(this.linearStretchControls);
   this.mainStretchControls.sizer.add(this.stfStretchControls);
   this.mainStretchControls.sizer.add(this.combineStretchControls);
   this.mainStretchBar = new SectionBar(this, "Transformation");
   this.mainStretchBar.setSection(this.mainStretchControls);
   this.mainStretchBar.onToggleSection = this.onToggleSection;

   //layout the preview controls
   this.previewControls = new Control( this );
   this.previewControls.sizer = new VerticalSizer (this );
   this.previewControls.sizer.margin = 0;
   this.previewControls.sizer.add(this.imagePreview);
   this.previewControls.sizer.addSpacing(layoutSpacing);
   this.previewControls.sizer.add(this.previewButtons);
   this.previewControls.sizer.addStretch();
   this.previewControlsBar = new SectionBar(this, "Preview");
   this.previewControlsBar.setSection(this.previewControls);
   this.previewControlsBar.onToggleSection = this.onToggleSection;

   // layout the buttons
   this.buttonSizer = new HorizontalSizer;
   this.buttonSizer.margin = 0;
   this.buttonSizer.spacing = layoutSpacing;
   this.buttonSizer.add(this.newInstanceButton);
   this.buttonSizer.add(this.execButton);
   this.buttonSizer.add(this.cancelButton);
   this.buttonSizer.add(this.rtpButton);
   this.buttonSizer.addStretch();
   this.buttonSizer.add(this.undoButton);
   this.buttonSizer.add(this.redoButton);
   this.buttonSizer.addStretch();
   this.buttonSizer.add(this.logViewButton);
   this.buttonSizer.add(this.preferencesButton);
   this.buttonSizer.add(this.browseDocumentationButton);
   this.buttonSizer.add(this.websiteButton);
   this.buttonSizer.add(this.resetButton);

   // layout the left hand sizer
   this.sizerL = new VerticalSizer;
   this.sizerL.margin = 4;
   this.sizerL.add(this.graphBar);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.graphControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.dataBar);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.dataControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.viewBar);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.viewControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.maskBar);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.maskControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.mainStretchBar);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.mainStretchControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.addStretch();
   this.sizerL.add(this.buttonSizer);

   // layout the right hand sizer
   this.sizerR = new VerticalSizer;
   this.sizerR.margin = 4;
   this.sizerR.add(this.previewControlsBar);
   this.sizerR.addSpacing(layoutSpacing)
   this.sizerR.add(this.previewControls);
   this.sizerR.addStretch();



/*******************************************************************************
 * DIALOG - Split columns
 *******************************************************************************/


   this.leftPanel = new Control(this);
   this.leftPanel.sizer = this.sizerL;

   this.centrePanel = new Control(this);
   this.centrePanel.setFixedWidth(4);
   this.centrePanel.backgroundColor = 0xffc0c0c0;

   this.rightPanel = new Control(this);
   this.rightPanel.sizer = this.sizerR;

   this.sizer = new HorizontalSizer(this);
   this.sizer.margin = 4;
   this.sizer.add(this.leftPanel);
   this.sizer.add(this.centrePanel);
   this.sizer.add(this.rightPanel);

   this.dataControls.hide();
   this.maskControls.hide();

   this.previewRefresh();
   if (this.showRTP)
   {
      this.previewTimer.start();
   }

   this.setOptionParameters(optionParameters);
   this.updateControls();

   //this.leftPanel.adjustToContents();
   //this.rightPanel.adjustToContents();
   this.adjustToContents();
   this.setVariableSize();


}

DialogGHSMain.prototype = new Dialog;
