
 /*
 * *****************************************************************************
 *
 * MAIN GHS DIALOG
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

#include "DialogOptions.js"
#include "DialogLog.js"
#include "DialogInspector.js"
#include "DialogModuleNotice.js"

#include "ControlHistData.js"
#include "ControlPreview.js"
#include "ControlReadout.js"
#include "ControlStretchGraph.js"
#include "ControlParamInput.js"


function DialogGHSMain() {
   this.__base__ = Dialog;
   this.__base__();

   var ghsStretch = new GHSStretch();
   var stretchParameters = ghsStretch.stretchParameters;
   stretchParameters.version = VERSION;
   ghsStretch.dialog = this;

   this.optionParameters = new GHSOptionParameters();
   var optionParameters =this.optionParameters;
   optionParameters.load();

   this.ghsLog = new GHSLog();
   var ghsLog = this.ghsLog;

   this.ghsViews = new GHSViews();
   var ghsViews = this.ghsViews;
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

   this.showRTP = optionParameters.startupRTP;

   this.suspendUpdating = false;
   this.isBusy = false;

   /// let the dialog be resizable
   this.userResizable = true;

   var minLabelWidth = this.font.width( "Local stretch intensity (b)" );

   this.windowTitle = TITLE + " - Version: " + VERSION

   //------------------------
   // Deal with toggle events|
   //------------------------
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

   //-----------------------------------
   // Ensure smooth exit from the dialog|
   //-----------------------------------
   this.onHide = function()
   {
      this.previewTimer.stop();
   }

   //-----------------------------------
   // Ensure smooth exit from the dialog|
   //-----------------------------------
   this.onGetFocus = function()
   {
      if (!optionParameters.supressModuleNotice)
      {
         let dialog = new DialogModuleNotice(optionParameters);
         let dialogReturn = dialog.execute();
      }
   }

/*******************************************************************************
 * MAIN DIALOG - Create the graphical display control section
 *******************************************************************************/

   //----------------------------------
   // Create graphical display controls|
   //----------------------------------
   this.stretchGraphHeight = 250
   this.stretchGraph = new ControlStretchGraph(this);
   this.stretchGraph.toolTip = "<p><b>Click</b> to see readout at that point.  <b>Double click</b> to centre zoom at that point.</p>"
   this.stretchGraph.graphBlockActive = optionParameters.graphBlockActive;
   let sgh = this.stretchGraphHeight;
   if (this.stretchGraph.graphBlockActive) sgh = Math.floor(sgh / .9)
   this.stretchGraph.setMinSize(400, sgh);
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

   this.graphInfo2 = new Label( this )
   this.graphInfo2.style = Frame.FrameStyle_Box;
   this.graphInfo2.text = "";
   this.graphInfo2.minWidth = minLabelWidth;
   this.graphInfo2.readOnly = true;
   this.graphInfo2.useRichText = true;

   this.graphInfoButton = new ToolButton( this );
   this.graphInfoButton.icon = this.scaledResource(":/icons/clear.png");
   this.graphInfoButton.setScaledFixedSize(24, 24);
   this.graphInfoButton.toolTip =
            "<p>Reset graph selection point</p>";
   this.graphInfoButton.onClick = function( checked ) {
      this.dialog.stretchGraph.clickLevel = -1.0;
      let resetButton = this.dialog.stretchGraph.clickResetButton;
      if (resetButton != undefined) {resetButton.updateParamValue();}
      this.dialog.updateControls();
   }

   this.graphInfoSendButton = new PushButton( this );
   this.graphInfoSendButton.text = "Send value to SP";
   this.graphInfoSendButton.toolTip = "<p>Send histogram selection readout to parameters. If Transformation type is " +
         "Generalised Hyperbolic Stretch, Histogram Transformation or Arcsinh, " +
         "the value will be sent to SP.  If transformation type is Linear Stretch " +
         "the value will be sent to BP.</p>"
   this.graphInfoSendButton.onClick = function( checked ) {
      if (this.dialog.stretchGraph.clickLevel == -1.0) return;
      if ((stretchParameters.STN() == "Generalised Hyperbolic Stretch") ||
         (stretchParameters.STN() == "Histogram Transformation") ||
         (stretchParameters.STN() == "Arcsinh Stretch"))
      {
         //stretchParameters.SP = Math.min(stretchParameters.HP, Math.max(stretchParameters.LP, this.dialog.stretchGraph.clickLevel));
         stretchParameters.SP = this.dialog.stretchGraph.clickLevel;
      }
      if (stretchParameters.STN() == "Linear Stretch")
      {
         let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
         stretchParameters.BP = Math.min(stretchParameters.WP - q, this.dialog.stretchGraph.clickLevel);
      }
      this.dialog.updateControls();
   }

   this.graphInfoLabels = new VerticalSizer( this )
   this.graphInfoLabels.margin = 0;
   this.graphInfoLabels.spacing = 4;
   this.graphInfoLabels.add(this.graphInfo1);
   this.graphInfoLabels.add(this.graphInfo2);

   this.graphInfoControls = new HorizontalSizer( this )
   this.graphInfoControls.margin = 0;
   this.graphInfoControls.spacing = 4;
   this.graphInfoControls.add(this.graphInfoLabels);
   this.graphInfoControls.addStretch();
   this.graphInfoControls.add(this.graphInfoButton);
   this.graphInfoControls.add(this.graphInfoSendButton);

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
         "<p><b>Saturation stretch:</b> apply stretch to the HSV saturation channel; " +
         "pixel values are then adjusted to ensure Lightness is the same as in the original image. " +
         "Note that when this option is selected the chart will show a histogram of saturation values within the image, " +
         "not intensity values as graphed for all other options.</p>";
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
         "<p><b>Colour stretch:</b> checking this will apply a colour stretch.  This is achieved by stretching a 'pseudo' Luminance channel. " +
         "The RGB coefficients for deriving this Luminance channel are specified in the preferences dialog (no gamma adjustment is applied). " +
         "Each RGB channel is then stretched by the ratio of the stretched to the unstretched Luminance.</p>";
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
   //this.logHistButton = new ToolButton( this );
   //this.logHistButton.icon = this.scaledResource( ":/icons/chart.png" );
   //this.logHistButton.setScaledFixedSize( 24, 24 );
   this.logHistButton = new PushButton( this );
   this.logHistButton.text = "Log view";
   this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing standard histogram.</p>";
   this.logHistButton.onClick = () => {
      this.dialog.stretchGraph.logHistogram = !this.dialog.stretchGraph.logHistogram;
      if (this.dialog.stretchGraph.logHistogram)
      {
         this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing log histogram.</p>";
         this.logHistButton.text = "Std view";
      }
      else
      {
         this.logHistButton.toolTip = "<p>Toggle between displaying standard histogram and log histogram. " +
            "Currently showing standard histogram.</p>";
            this.logHistButton.text = "Log view";
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
   //this.plotControlsLeft.spacing = 4;
   this.plotControlsLeft.add(this.stretchGraph);
   this.plotControlsLeft.add(this.channelSelectorControls);
   this.plotControlsLeft.add(this.graphInfoControls);

/*******************************************************************************
 * MAIN DIALOG - Create the graph navigation controls
 *******************************************************************************/

   // create zoom controls
   this.zoomLabel = new Label( this )
   this.zoomLabel.minWidth = 0.75 * minLabelWidth;
   this.zoomLabel.text = "Zoom:";
   this.zoomLabel.textAlignment = TextAlign_Right | TextAlign_VertCenter;

   // define zoom in button
   this.zoomInButton = new ToolButton(this);
   this.zoomInButton.icon = this.scaledResource( ":/icons/move-right-limit.png" );
   this.zoomInButton.setScaledFixedSize( 24, 24 );
   this.zoomInButton.toolTip = "<p>Zoom in</p>";
   this.zoomInButton.onClick = function( checked ) {
      this.dialog.zoomSlider.normalizedValue = 1.0;
      this.dialog.stretchGraph.graphRange = 1.0 / this.dialog.zoomSlider.value;
      this.dialog.updateControls();
   }

   // define zoom out button
   this.zoomOutButton = new ToolButton(this);
   this.zoomOutButton.icon = this.scaledResource( ":/icons/move-left-limit.png" );
   this.zoomOutButton.setScaledFixedSize( 24, 24 );
   this.zoomOutButton.toolTip = "<p>Zoom out</p>";
   this.zoomOutButton.onClick = function( checked ) {
      this.dialog.zoomSlider.normalizedValue = 0.0;
      this.dialog.stretchGraph.graphRange = 1.0 / this.dialog.zoomSlider.value;
      this.dialog.updateControls();
   }

   // define zoom slider
   this.zoomSlider = new Slider( this );
   this.zoomSlider.minWidth = 150;
   this.zoomSlider.setRange(1.0, optionParameters.zoomMax);
   this.zoomSlider.normalisedValue = 0.0;
   this.zoomSlider.toolTip = "<p>Zooms the graph view centred on the panning point.</p>";
   this.zoomSlider.onValueUpdated = function( value ){
      this.dialog.stretchGraph.graphRange = 1.0 / value;
      this.dialog.updateControls();
   }

   // define zoom edit
   this.zoomEdit = new NumericEdit( this );
   //this.zoomEdit.minWidth = 150;
   this.zoomEdit.setRange(1.0, optionParameters.zoomMax);
   this.zoomEdit.setValue(this.dialog.zoomSlider.value);
   this.zoomEdit.setPrecision(0);
   this.zoomEdit.onValueUpdated = function( value )
   {
      this.dialog.stretchGraph.graphRange = 1.0 / value;
      this.dialog.updateControls();
   }

   // layout zoom controls
   this.zoomControls = new HorizontalSizer( this )
   this.zoomControls.margin = 0;
   this.zoomControls.spacing = 4;
   this.zoomControls.add(this.zoomLabel);
   this.zoomControls.add(this.zoomEdit);
   this.zoomControls.add(this.zoomOutButton);
   this.zoomControls.add(this.zoomSlider);
   this.zoomControls.add(this.zoomInButton);
   this.zoomControls.addStretch();

   //Add pan controls for the graph
   this.panLabel = new Label( this )
   this.panLabel.minWidth = 0.75 * minLabelWidth;
   this.panLabel.text = "Pan:";
   this.panLabel.textAlignment = TextAlign_Right | TextAlign_VertCenter;

   // define pan right button
   this.panRightButton = new ToolButton(this);
   this.panRightButton.icon = this.scaledResource( ":/icons/move-right-limit.png" );
   this.panRightButton.setScaledFixedSize( 24, 24 );
   this.panRightButton.toolTip = "<p>Pan right</p>";
   this.panRightButton.onClick = function( checked ) {
      this.dialog.panSlider.value = 1.0;
      this.dialog.stretchGraph.graphMidValue = 1.0;
      this.dialog.updateControls();
   }

   // define pan left button
   this.panLeftButton = new ToolButton(this);
   this.panLeftButton.icon = this.scaledResource( ":/icons/move-left-limit.png" );
   this.panLeftButton.setScaledFixedSize( 24, 24 );
   this.panLeftButton.toolTip = "<p>Pan left</p>";
   this.panLeftButton.onClick = function( checked ) {
      this.dialog.panSlider.value = 0.0;
      this.dialog.stretchGraph.graphMidValue = 0.0;
      this.dialog.updateControls();
   }

   // define pan slider
   this.panSlider = new Slider( this );
   this.panSlider.minWidth = 150;
   this.panSlider.setRange(0, 100);
   this.panSlider.normalisedValue = 0.0;
   this.panSlider.toolTip = "<p>Pans the graph view and specifies the centre point for a zoom." +
            " The pan point may be set by double mouse click on the graph.</p>";
   this.panSlider.onValueUpdated = function( value ){
      this.dialog.stretchGraph.graphMidValue = value / 100;
      this.dialog.updateControls();
   }

   // define pan edit
   this.panEdit = new NumericEdit( this );
   this.panEdit.setRange(0, 1.0);
   this.panEdit.setValue(this.dialog.panSlider.value);
   this.panEdit.setPrecision(2);
   this.panEdit.onValueUpdated = function( value )
   {
      this.dialog.stretchGraph.graphMidValue = value;
      this.dialog.updateControls();
   }

   this.panEdit.setValue(9.999);
   let minPanZoomEditWidth = this.panEdit.width;
   this.panEdit.setValue(this.dialog.panSlider.value);
   this.zoomEdit.setFixedWidth(minPanZoomEditWidth);
   this.panEdit.setFixedWidth(minPanZoomEditWidth);

   // layout pan controls
   this.panControls = new HorizontalSizer( this )
   this.panControls.margin = 0;
   this.panControls.spacing = 4;
   this.panControls.add(this.panLabel);
   this.panControls.add(this.panEdit);
   this.panControls.add(this.panLeftButton);
   this.panControls.add(this.panSlider);
   this.panControls.add(this.panRightButton);
   this.panControls.addStretch();
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
   this.viewList.maxWidth = 350;
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
   this.imageInspectorButton = new PushButton( this );
   this.imageInspectorButton.text = "Image Inspector";
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
   this.maskList.toolTip = "<p>Specifies a mask that will modify the extent to which the transformation is applied to the image. " +
         "Note that if a mask is applied it is not practical to generate a predicted histogram in real time. " +
         "To see the transformed histogram you will need to generate it using the refresh button below he histogram.</p>"
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
   //this.viewPicker.add(this.imageInspectorButton);
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
         this.dialog.stretchGraph.clickResetButton = undefined;
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
         "<p>Check here to use the inverse form of the transformation equations." +
         " <b>Warning:</b> Some transformations can involve clipping and are not truly invertible." +
         " Eg, this may apply for L*, Sat and Col options and for Linear Stretch types.</p>";
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

   this.bControl = new ControlParamInput(stretchParameters.b, -5, 15, stretchParameters.bPrecision, stretchParameters.name_b, minLabelWidth);
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

   // first set up an array that will hold all reset buttons that are linked to the hsitogram graph
   this.linkableInputs = new Array();

   this.SPControl = new ControlParamInput(stretchParameters.SP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_SP, minLabelWidth, this.stretchGraph);
   this.SPControl.numControl.toolTip = "<p>Sets the focus point around which the stretch is applied - " +
      "contrast will be distributed symmetrically about SP.  While 'b' provides the degree of focus of the stretch," +
      " SP determines where that focus is applied.  SP should generally be placed within a histogram peak so that the stretch " +
      " will widen and lower the peak by adding the most contrast in the stretch at that point.  Pixel values will move away from" +
      " the SP location.  " +
      "This parameter must be greater than or equal to " + stretchParameters.name_LP + " and less than or equal to " + stretchParameters.name_HP +
      ". Note this parameter is specified by reference to the target image pixel values.</p>";
   this.SPControl.numControl.onValueUpdated = function( value )
   {
      stretchParameters.SP = value;
      //stretchParameters.LP = Math.min(stretchParameters.LP, stretchParameters.SP);
      //stretchParameters.HP = Math.max(stretchParameters.HP, stretchParameters.SP);
      //stretchParameters.SP = Math.max(stretchParameters.LP, stretchParameters.SP);
      //stretchParameters.SP = Math.min(stretchParameters.HP, stretchParameters.SP);
      this.dialog.updateControls();
   }
   this.SPControl.resetButton.toolTip = "<p>Reset " + stretchParameters.name_SP + " to " + stretchParameters.default_SP +
         ". Note if LP is not zero, it will also be set to zero to ensure LP is not greater than SP.";

   this.SPControl.resetButton.onClick = function( checked )
   {
      //if ((this.dialog.stretchGraph.clickLevel < 0) || (optionParameters.paramHistLink)) {stretchParameters.SP = stretchParameters.default_SP;}
      //else {stretchParameters.SP = this.dialog.stretchGraph.clickLevel;}
      stretchParameters.SP = stretchParameters.default_SP;

      //stretchParameters.LP = Math.min(stretchParameters.LP, stretchParameters.SP);
      //stretchParameters.HP = Math.max(stretchParameters.HP, stretchParameters.SP);

      //stretchParameters.SP = Math.max(stretchParameters.LP, stretchParameters.SP);
      ///stretchParameters.SP = Math.min(stretchParameters.HP, stretchParameters.SP);

      this.dialog.updateControls();
   }

   this.SPControl.histLinkButton.updateParamValue = function()
   {
      if (this.dialog.stretchGraph.clickLevel < 0.0) {stretchParameters.SP = stretchParameters.default_SP;}
      else {stretchParameters.SP = this.dialog.stretchGraph.clickLevel;}

      //stretchParameters.LP = Math.min(stretchParameters.LP, stretchParameters.SP);
      //stretchParameters.HP = Math.max(stretchParameters.HP, stretchParameters.SP);

      //stretchParameters.SP = Math.max(stretchParameters.LP, stretchParameters.SP);
      //stretchParameters.SP = Math.min(stretchParameters.HP, stretchParameters.SP);
   }
   this.linkableInputs.push(this.SPControl);

/*
   ***************************************************************************
   *********** create the LP input slider ************************************
*/

   this.LPControl = new ControlParamInput(stretchParameters.LP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_LP, minLabelWidth, this.stretchGraph);
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
   this.LPControl.resetButton.toolTip = "<p>Reset " + stretchParameters.name_LP + " to " + stretchParameters.default_LP;

   this.LPControl.resetButton.onClick = function( checked )
   {
      //if ((this.dialog.stretchGraph.clickLevel < 0) || (optionParameters.paramHistLink)) {stretchParameters.LP = stretchParameters.default_LP;}
      //else {stretchParameters.LP = this.dialog.stretchGraph.clickLevel;}
      stretchParameters.LP = stretchParameters.default_LP;

      this.dialog.updateControls();
   }

   this.LPControl.histLinkButton.updateParamValue = function()
   {
      if (this.dialog.stretchGraph.clickLevel < 0.0)
      {
         stretchParameters.LP = stretchParameters.default_LP;
      }
      else
      {
         stretchParameters.LP = Math.min(stretchParameters.SP, this.dialog.stretchGraph.clickLevel);
      }
   }
   this.linkableInputs.push(this.LPControl);

/*
   ***************************************************************************
   *********** create the HP input slider ************************************
*/

   this.HPControl = new ControlParamInput(stretchParameters.HP, 0, 1, stretchParameters.LPSPHPPrecision, stretchParameters.name_HP, minLabelWidth, this.stretchGraph);
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
   this.HPControl.resetButton.toolTip = "<p>Reset " + stretchParameters.name_HP + " to " + stretchParameters.default_HP;

   this.HPControl.resetButton.onClick = function( checked )
   {
      //if ((this.dialog.stretchGraph.clickLevel < 0) || (optionParameters.paramHistLink)) {stretchParameters.HP = stretchParameters.default_HP;}
      //else {stretchParameters.HP = this.dialog.stretchGraph.clickLevel;}
      stretchParameters.HP = stretchParameters.default_HP;

      this.dialog.updateControls();
   }

   this.HPControl.histLinkButton.updateParamValue = function()
   {
      if (this.dialog.stretchGraph.clickLevel < 0.0)
      {
         stretchParameters.HP = stretchParameters.default_HP;
      }
      else
      {
         stretchParameters.HP = Math.max(stretchParameters.SP, this.dialog.stretchGraph.clickLevel);
      }
   }
   this.linkableInputs.push(this.HPControl);

/*
   ***************************************************************************
   *********** create the BP input slider ************************************
*/

   this.BPControl = new ControlParamInput(stretchParameters.BP, -1, 1, stretchParameters.BPWPPrecision, stretchParameters.name_BP, minLabelWidth, this.stretchGraph);
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
   this.BPControl.resetButton.toolTip = "<p>Reset black point to zero.</p>"
          + this.BPControl.resetButton.toolTip;

   this.BPControl.resetButton.onClick = function( checked )
   {
      //if ((this.dialog.stretchGraph.clickLevel < 0) || (optionParameters.paramHistLink)) {stretchParameters.BP = stretchParameters.default_BP;}
      //else {stretchParameters.BP = this.dialog.stretchGraph.clickLevel;}
      stretchParameters.BP = stretchParameters.default_BP;

      this.dialog.updateControls();
   }

   this.BPControl.histLinkButton.updateParamValue = function()
   {
      if (this.dialog.stretchGraph.clickLevel < 0.0)
      {
         stretchParameters.BP = stretchParameters.default_BP;
      }
      else
      {
         let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
         stretchParameters.BP = Math.min(stretchParameters.WP - q, this.dialog.stretchGraph.clickLevel);
      }
   }
   this.linkableInputs.push(this.BPControl);

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

   this.WPControl = new ControlParamInput(stretchParameters.WP, 0, 2, stretchParameters.BPWPPrecision, stretchParameters.name_WP, minLabelWidth, this.stretchGraph);
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
   this.WPControl.resetButton.toolTip = "<p>Reset white point to 1.0.</p>"
          + this.WPControl.resetButton.toolTip;

   this.WPControl.resetButton.onClick = function( checked )
   {
      //if ((this.dialog.stretchGraph.clickLevel < 0) || (optionParameters.paramHistLink)) {stretchParameters.WP = stretchParameters.default_WP;}
      //else {stretchParameters.WP = this.dialog.stretchGraph.clickLevel;}
      stretchParameters.WP = stretchParameters.default_WP;

      this.dialog.updateControls();
   }

   this.WPControl.histLinkButton.updateParamValue = function()
   {
      if (this.dialog.stretchGraph.clickLevel < 0.0)
      {
         stretchParameters.WP = stretchParameters.default_WP;
      }
      else
      {
         let q = 1 / Math.pow10(stretchParameters.BPWPPrecision);
         stretchParameters.WP = Math.max(stretchParameters.BP + q, this.dialog.stretchGraph.clickLevel);
      }
   }
   this.linkableInputs.push(this.WPControl);

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
   this.combinePercentControl.numControl.toolTip = "<p>Controls the blending percentage. A value of x will take x% of the target image " +
      "plus (100-x)% of the blend image.</p>";
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

   this.imageReadout = new ControlReadout( this );
   this.imageReadout.previewControl = this.imagePreview;
   this.imageReadout.stretchGraph = this.stretchGraph;
   this.imageReadout.stretchParameters = stretchParameters;

   this.imagePreview.readoutControl = this.imageReadout;
   this.stretchGraph.readoutControl = this.imageReadout;

   this.readoutControls = new GroupBox( this );
   this.readoutControls.title = "Readout controls";
   this.readoutControls.sizer = new HorizontalSizer();
   this.readoutControls.sizer.add(this.imageReadout);

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
   this.zoomLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;

   this.resetZoomButton = new ToolButton(this.optionShowButtons)
   this.resetZoomButton.icon = this.scaledResource( ":/toolbar/view-zoom-fit.png" );
   this.resetZoomButton.setScaledFixedSize( 24, 24 );
   this.resetZoomButton.toolTip = "<p>Click and drag on the image to specify a region of interest to zoom into. " +
            "Clicking on this button will reset to fit the whole image.</p>";
   this.resetZoomButton.onClick = function(checked)
   {
      this.dialog.imagePreview.lastStretchKey = "";
      this.dialog.imagePreview.resetImage();
   }



   this.previewTimer = new Timer();
   this.previewTimer.interval = optionParameters.previewDelay;
   this.previewTimer.periodic = true;
   this.previewTimer.dialog = this;
   this.previewTimer.busy = false;
   this.previewTimer.lastSPKeyCheck = "";
   this.previewTimer.lastSPKeyRefresh = "";
   this.previewTimer.updateCount = 0;

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

   this.resetZoomSizer = new HorizontalSizer( this.optionShowButtons )
   this.resetZoomSizer.add(this.resetZoomButton);
   this.resetZoomSizer.addSpacing(8);
   this.resetZoomSizer.add(this.zoomLabel);

   this.optionShowButtons.title = "Preview controls";
   this.optionShowButtons.sizer = new VerticalSizer();
   this.optionShowButtons.sizer.margin = 8;
   this.optionShowButtons.sizer.add(this.optShowPreview);
   this.optionShowButtons.sizer.addSpacing(4);
   this.optionShowButtons.sizer.add(this.optShowTarget);
   this.optionShowButtons.sizer.addSpacing(4);
   this.optionShowButtons.sizer.add(this.resetZoomSizer);
   this.optionShowButtons.sizer.addSpacing(4);
   this.optionShowButtons.sizer.add(this.imageInspectorButton);

   this.previewButtons = new HorizontalSizer(this)
   this.previewButtons.add(this.optionShowButtons);
   this.previewButtons.addStretch();
   this.previewButtons.add(this.readoutControls);


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
      stretchParameters.save(VERSION);
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
      this.enabled = false;
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
            // temporarily adjust inversion parameter if transformation is not invertible
            let storeInv = stretchParameters.Inv
            if (!stretchParameters.isInvertible()) stretchParameters.Inv = false;

            // Let user know what is happening
            Console.show();
            Console.writeln();
            Console.writeln("<b>Applying stretch with the following parameters:</b>");
            Console.writeln("Stretch type:                     ", stretchParameters.ST);
            Console.writeln("Stretch name:                     ", stretchParameters.STN());
            Console.writeln("Stretch factor:                   ", stretchParameters.D);
            Console.writeln("Local stretch intensity:          ", stretchParameters.b);
            Console.writeln("Maximum intensity point (SP):     ", stretchParameters.SP);
            Console.writeln("Shadows protection point (LP):    ", stretchParameters.LP);
            Console.writeln("Highlight protection point (HP):  ", stretchParameters.HP);
            Console.writeln("Pre-stretch blackpoint (BP):      ", stretchParameters.BP);
            Console.writeln("Pre-stretch whitepoint (WP):      ", stretchParameters.WP);
            Console.writeln("Invert transformation:            ", stretchParameters.Inv);
            Console.writeln("Linked STF:                       ", stretchParameters.linked);
            Console.writeln("Stretch channel                   ", stretchParameters.getChannelName());
            Console.writeln("Mask id:                          ", this.targetView.window.mask.mainView.id);
            Console.writeln("Mask enabled:                     ", this.targetView.window.maskEnabled);
            Console.writeln("Mask inverted:                    ", this.targetView.window.maskInverted);
            Console.writeln("Blend image:                      ", stretchParameters.combineViewId);
            Console.writeln("Blend percentage:                 ", stretchParameters.combinePercent);
            Console.writeln("Create new image:                 ", stretchParameters.createNewImage);
            Console.writeln("New image id:                     ", stretchParameters.newImageId);

            var newView = ghsStretch.executeOn(this.targetView);

            // log stretch
            ghsLog.add(newView.id, longStretchKey(ghsStretch, this.targetView));

            // restore inversion parameter
            stretchParameters.Inv = storeInv;

            // select the new image if that is what the user wants
            if (optionParameters.selectNewImage) this.targetView = newView;

            Console.hide();

            if (this.visible)    //catch impatient user who has closed the dialog without waiting for this to finish!
            {
               this.imagePreview.lastStretchKey = "";
               this.newImageRefresh();
               this.updateControls();
            }
            else
            {
               return;
            }
         }
      }
      else
      {
         let warnMessage = "No target view is specified";
         let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
      }

      if (timerWasRunning) this.previewTimer.start();
      this.enabled = true;
   }

   // prepare the cancel button
   this.cancelButton = new ToolButton(this);
   this.cancelButton.icon = this.scaledResource( ":/process-interface/cancel.png" );
   this.cancelButton.setScaledFixedSize( 24, 24 );
   this.cancelButton.toolTip = "<p>Close dialog with no action.</p>";
   this.cancelButton.onClick = () => {
      this.ok();
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
      this.imagePreview.lastStretchKey = "";
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
         this.imagePreview.lastStretchKey = "";
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
         this.imagePreview.lastStretchKey = "";
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
      this.stretchGraph.clickResetButton = undefined;
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

      if (lumCoeffsChanged && (this.targetView.id != ""))
      {
         let newLumHistData = getLuminanceHistogram(this.targetView, stretchParameters.getLumCoefficients(this.targetView));
         ghsViews.histograms[0][5] = newLumHistData[0];
         ghsViews.histArrays[0][5] = newLumHistData[1];
         ghsViews.cumHistArrays[0][5] = newLumHistData[2];

         if (ghsViews.histogramsAvailable(1))
         {
            newLumHistData = getLuminanceHistogram(ghsViews.getView(1), stretchParameters.getLumCoefficients(ghsViews.getView(1)));
            ghsViews.histograms[1][5] = newLumHistData[0];
            ghsViews.histArrays[1][5] = newLumHistData[1];
            ghsViews.cumHistArrays[1][5] = newLumHistData[2];
         }

         this.imagePreview.setImage(this.targetView);
      }

      if( previewChangeSize && !((lumCoeffsChanged && (this.targetView.id != ""))) ) {this.previewRefresh();}

      this.imagePreview.lastStretchKey = "";
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
   this.enabled = false;

   Console.show();
   Console.writeln();
   Console.writeln("<b>Target view refresh: </b>");

   this.maskList.updateViews();

   if (this.targetView.id != "")
   {
      if (this.targetView.image.isGrayscale)
      {
         stretchParameters.channelSelector = [false, false, false, true, false, false, false];
         this.imageReadout.dataChannel.currentItem = 0;
         this.imageReadout.dataChannel.enabled = false;
      }
      else {this.imageReadout.dataChannel.enabled = true;}
      Console.writeln("Loading target view: ", this.targetView.id);
      this.targetView.window.currentView = this.targetView;
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

      Console.writeln("Calculating histogram data");
      let histData = calculateHistograms(this.targetView, stretchParameters.getLumCoefficients(this.targetView));
      this.histogramData.initParams(histData[2], histData[1]);
      ghsViews.setView(this.targetView, histData);
      ghsStretch.setSTF(this.targetView)
      this.stretchGraph.targetView = this.targetView;

      Console.writeln("Initialising preview");
      this.imagePreview.invalidPreview = true;
      this.imagePreview.setImage(this.targetView);

   }
   else
   {
      Console.writeln("Clearing target view");
      ghsViews.setView(new View());
      ghsStretch.setSTF();
      Console.writeln("Clearing preview");
      this.imagePreview.setImage(new View());
      this.stretchGraph.targetView = new View();
   }

   this.imageReadout.showRO = false;
   this.imageReadout.update();

   Console.writeln("Refreshing");
   this.updateControls();

   Console.hide();
   this.enabled = true;
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
      this.stretchGraph.graphBlockActive = ghsOP.graphBlockActive;

      let sgh = this.stretchGraphHeight;
      if (this.stretchGraph.graphBlockActive) sgh = Math.floor(sgh / .9)
      this.stretchGraph.setMinSize(400, sgh);

      this.stretchGraph.graphRef1Active = ghsOP.graphRef1Active;
      this.stretchGraph.graphRef2Active = ghsOP.graphRef2Active;
      this.stretchGraph.graphRef3Active = ghsOP.graphRef3Active;
      this.stretchGraph.graphGridActive = ghsOP.graphGridActive;

      this.stretchGraph.graphLineCol = ghsOP.graphLineCol;
      this.stretchGraph.graphBlockCol = ghsOP.graphBlockCol;
      this.stretchGraph.graphRef1Col = ghsOP.graphRef1Col;
      this.stretchGraph.graphRef2Col = ghsOP.graphRef2Col;
      this.stretchGraph.graphRef3Col = ghsOP.graphRef3Col;
      this.stretchGraph.graphGridCol = ghsOP.graphGridCol;
      this.stretchGraph.graphBackCol = ghsOP.graphBackCol;

      this.imagePreview.setFixedSize(ghsOP.previewWidth, ghsOP.previewHeight);
      this.previewTimer.interval = ghsOP.previewDelay;
      this.imagePreview.crossColour = ghsOP.previewCrossColour;
      this.imagePreview.crossActive = ghsOP.previewCrossActive;

      stretchParameters.colourClip = ghsOP.colourClip;
      stretchParameters.lumCoeffSource = ghsOP.lumCoeffSource;
      stretchParameters.lumCoefficients = new Array(ghsOP.lumCoefficients[0], ghsOP.lumCoefficients[1], ghsOP.lumCoefficients[2])

      stretchParameters.default_colourClip = ghsOP.colourClip;
      stretchParameters.default_lumCoeffSource = ghsOP.lumCoeffSource;
      stretchParameters.default_lumCoefficients = new Array(ghsOP.lumCoefficients[0], ghsOP.lumCoefficients[1], ghsOP.lumCoefficients[2])

      let v = this.zoomSlider.value;
      this.zoomSlider.value = Math.min(v, ghsOP.zoomMax);
      this.zoomEdit.setValue(this.zoomSlider.value);
      this.stretchGraph.graphRange = 1.0 / this.zoomSlider.value;
      this.zoomSlider.setRange(1.0, ghsOP.zoomMax);
      this.zoomEdit.setRange(1.0, ghsOP.zoomMax);

      let roa = this.imageReadout.areaSize;
      this.imageReadout.areaSize = Math.min(roa, ghsOP.readoutAreaMax);
      this.imageReadout.areaSizeNum.setValue(this.imageReadout.areaSize);
      this.imageReadout.areaSizeNum.setRange(0.0, ghsOP.readoutAreaMax);
      this.imagePreview.setReadout(this.imageReadout.areaSize);

      if (ghsOP.paramHistLink)
      {
         for (let i = 0; i < this.linkableInputs.length; ++i) {this.linkableInputs[i].histLinkButton.show();}
      }
      else
      {
         this.stretchGraph.clickResetButton = undefined;
         for (let i = 0; i < this.linkableInputs.length; ++i) {this.linkableInputs[i].histLinkButton.hide();}
      }

      ghsStretch.useProcess = ghsOP.useProcess;
   }

/*******************************************************************************
 * MAIN DIALOG - control update function
 *******************************************************************************/

   // Function to update any controls that need updating on change of input parameters
   this.updateControls = function()
   {
      if (!this.suspendUpdating)
      {
         this.isBusy = true;
         let timerWasRunning = this.previewTimer.isRunning;
         this.previewTimer.stop();

         //Check any modifications to reflect stretch type
         var ST = stretchParameters.ST;
         var STN = stretchParameters.STN();

         // Modify LP or HP if SP requires it
         stretchParameters.LP = Math.min(stretchParameters.LP, stretchParameters.SP);
         stretchParameters.HP = Math.max(stretchParameters.HP, stretchParameters.SP);

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
            let channels = this.channels();
            if (stretchParameters.channelSelector[0]) channels = [0];
            if (stretchParameters.channelSelector[1]) channels = [1];
            if (stretchParameters.channelSelector[2]) channels = [2];
            this.LCPControl.numControl.setValue(normCount(stretchParameters.BP, channels, "max", ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]));
            this.HCPControl.numControl.setValue(1 - normCount(stretchParameters.WP, channels, "max", ghsViews.getHistData(0)[0], ghsViews.getHistData(0)[2]));
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

            //if (stretchParameters.LP > 0) {this.SPControl.resetButton.enabled = false;}
            //else {this.SPControl.resetButton.enabled = true;}
            if (this.imageReadout.roAreaData != undefined)
            {
               //if ((this.imageReadout.roAreaData[this.imageReadout.roDataIndex] < stretchParameters.LP) ||
               //   (this.imageReadout.roAreaData[this.imageReadout.roDataIndex] > stretchParameters.HP) ||
               //   (!this.imageReadout.showRO))
               if (!this.imageReadout.showRO)
               {
                  this.imageReadout.dataValueSend.enabled = false;
               }
               else
               {
                  this.imageReadout.dataValueSend.enabled = true;
               }
            }

            this.bControl.enabled = true;
            this.imageReadout.dataValueSend.text = "Send value to SP";
            this.graphInfoSendButton.text = "Send value to SP";}

         if (STN == "Histogram Transformation") {                         // Traditional histogram transformation
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.ghsStretchControls.show();
            this.inverseTransfCheck.enabled = true;

            //if (stretchParameters.LP > 0) {this.SPControl.resetButton.enabled = false;}
            //else {this.SPControl.resetButton.enabled = true;}
            if (this.imageReadout.roAreaData != undefined)
            {
               //if ((this.imageReadout.roAreaData[this.imageReadout.roDataIndex] < stretchParameters.LP) ||
               //   (this.imageReadout.roAreaData[this.imageReadout.roDataIndex] > stretchParameters.HP) ||
               //   (!this.imageReadout.showRO))
               if (!this.imageReadout.showRO)
               {
                  this.imageReadout.dataValueSend.enabled = false;
               }
               else
               {
                  this.imageReadout.dataValueSend.enabled = true;
               }
            }

            this.bControl.enabled = false;
            this.imageReadout.dataValueSend.text = "Send value to SP";
            this.graphInfoSendButton.text = "Send value to SP";}

         if (STN == "Arcsinh Stretch") {                         // Arcsinh stretch
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            this.ghsStretchControls.show();
            this.inverseTransfCheck.enabled = true;

            //if (stretchParameters.LP > 0) {this.SPControl.resetButton.enabled = false;}
            //else {this.SPControl.resetButton.enabled = true;}
            if (this.imageReadout.roAreaData != undefined)
            {
               //if ((this.imageReadout.roAreaData[this.imageReadout.roDataIndex] < stretchParameters.LP) ||
               //   (this.imageReadout.roAreaData[this.imageReadout.roDataIndex] > stretchParameters.HP) ||
               //   (!this.imageReadout.showRO))
               if (!this.imageReadout.showRO)
               {
                  this.imageReadout.dataValueSend.enabled = false;
               }
               else
               {
                  this.imageReadout.dataValueSend.enabled = true;
               }
            }

            this.bControl.enabled = false;
            this.imageReadout.dataValueSend.text = "Send value to SP";
            this.graphInfoSendButton.text = "Send value to SP";}

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
               this.inverseTransfCheck.enabled = false;}
            if (this.imageReadout.roAreaData != undefined)
            {
               if ((this.imageReadout.roAreaData[this.imageReadout.roDataIndex] > stretchParameters.WP) ||
                  (!this.imageReadout.showRO))
               {
                  this.imageReadout.dataValueSend.enabled = false;
               }
               else
               {
                  this.imageReadout.dataValueSend.enabled = true;
               }
            }
            this.imageReadout.dataValueSend.text = "Send value to BP";
            this.graphInfoSendButton.text = "Send value to BP";
            }


         if (STN == "Image Inversion") {                         // Image inversion
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.hide();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;
            this.imageReadout.dataValueSend.enabled = false;
            this.graphInfoSendButton.enabled = false;
            this.imageReadout.dataValueSend.text = "Send unavailable";
            this.graphInfoSendButton.text = "Send unavailable";}

         if (STN == "Image Blend") {                         // Image blend
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.stfStretchControls.hide();
            this.combineStretchControls.show();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;
            this.imageReadout.dataValueSend.enabled = false;
            this.graphInfoSendButton.enabled = false;
            this.imageReadout.dataValueSend.text = "Send unavailable";
            this.graphInfoSendButton.text = "Send unavailable";}

         if (STN == "STF Transformation") {                         // Standard STF transformation
            this.ghsStretchControls.hide();
            this.linearStretchControls.hide();
            this.combineStretchControls.hide();
            this.stfStretchControls.show();
            //stretchParameters.Inv = false;
            this.inverseTransfCheck.checked = false;//stretchParameters.Inv;
            this.inverseTransfCheck.enabled = false;
            this.imageReadout.dataValueSend.enabled = false;
            this.graphInfoSendButton.enabled = false;
            this.imageReadout.dataValueSend.text = "Send unavailable";
            this.graphInfoSendButton.text = "Send unavailable";}

         if (this.targetView.id == "")
         {
            this.LCPControl.enabled = false;
            this.HCPControl.enabled = false;
            this.imageInspectorButton.enabled = false;
            this.histUpdateButton.enabled = false;
            this.logHistButton.enabled = false;
            this.invertMaskCheck.checked = false;
            this.invertMaskCheck.enabled = false;
            this.showMaskCheck.enabled = false;
            this.maskList.enabled = false;
            this.optShowPreview.enabled = false;
            this.optShowTarget.enabled = false;
            this.resetZoomButton.enabled = false;
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
            this.logHistButton.enabled = true;
            this.invertMaskCheck.enabled = true;
            this.showMaskCheck.enabled = true;
            this.maskList.enabled = true;
            this.optShowPreview.enabled = true;
            this.optShowTarget.enabled = true;
            this.resetZoomButton.enabled = true;
         }

         for (let i = 0; i < this.linkableInputs.length; ++i)
         {
            if (this.stretchGraph.clickResetButton === this.linkableInputs[i].histLinkButton)
            {
               this.linkableInputs[i].histLinkButton.icon = this.scaledResource( ":/icons/link.png" );
               this.stretchGraph.clickLevel = this.linkableInputs[i].numControl.value;
            }
            else
            {
               this.linkableInputs[i].histLinkButton.icon = this.scaledResource( ":/icons/clear-inverted.png" );
               if (this.stretchGraph.clickResetButton != undefined) {this.linkableInputs[i].histLinkButton.enabled = false;}
               else {this.linkableInputs[i].histLinkButton.enabled = true;}
            }
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

         if (this.targetView.image.isColor || (this.targetView.id == ""))
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

         if (!stretchParameters.isInvertible())
         {
            this.inverseTransfCheck.checked = false;
            this.inverseTransfCheck.enabled = false;
         }
         else
         {
            this.inverseTransfCheck.checked = stretchParameters.Inv;
            this.inverseTransfCheck.enabled = true;
         }

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
            this.graphInfoSendButton.enabled = false;
         }
         else
         {
            var plotY = ghsStretch.calculateStretch(clickX);
            info1 += "x="  + clickX.toFixed(5) + ", y=" + plotY.toFixed(5);

            if ( this.targetView.id != "" )
            {
               var level = Math.floor(clickX * ghsViews.getHistData(0)[0][0].resolution);
               info2 += "Level=" + level.toString();
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
            //if (((ST < 3) && (!(clickX < stretchParameters.LP) && !(clickX > stretchParameters.HP))) || ((STN = "Linear Stretch") && (!(clickX < stretchParameters.WP))))
            if ((ST < 3) || ((STN == "Linear Stretch") && (!(clickX > stretchParameters.WP))))
            {
               this.graphInfoSendButton.enabled = true;
            }
            else {this.graphInfoSendButton.enabled = false;}
         }
         //this.graphInfo1.text = info1 + info2;
         this.graphInfo1.text = info1;
         this.graphInfo2.text = info2;

         // Update the graph navigation controls
         this.zoomSlider.value = 1.0 / this.stretchGraph.graphRange;
         this.zoomEdit.setValue(1.0 / this.stretchGraph.graphRange);
         this.panSlider.value = 100 * this.stretchGraph.graphMidValue;
         this.panEdit.setValue(this.stretchGraph.graphMidValue);

         // update the graph
         this.stretchGraph.repaint();

         // update the undo and redo buttons
         if (this.targetView.canGoBackward) {this.undoButton.enabled = true;}
         else {this.undoButton.enabled = false;}
         if (this.targetView.canGoForward) {this.redoButton.enabled = true;}
         else {this.redoButton.enabled = false;}

         // update preview
         if ((this.showRTP) && (!this.imagePreview.invalidPreview))
         {
            if (this.imagePreview.lastStretchKey != longStretchKey(ghsStretch, this.targetView) + this.imagePreview.imageSelection.toString())
            {
               this.imagePreview.invalidPreview = true;
               this.imagePreview.repaint();
            }
         }

         // update readout
         this.imageReadout.update();

         if (timerWasRunning) this.previewTimer.start();
         this.isBusy = false;
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
   //this.graphControls.sizer.addSpacing(layoutSpacing);
   //this.graphControls.sizer.add(this.channelSelectorControls);
   //this.graphControls.sizer.addSpacing(layoutSpacing);
   this.graphControls.sizer.add(this.zoomControls);
   //this.graphControls.sizer.addSpacing(layoutSpacing);
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
   this.previewControls.sizer.add(this.previewButtons);
   this.previewControls.sizer.addSpacing(layoutSpacing);
   this.previewControls.sizer.add(this.imagePreview);
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

   this.adjustToContents();
   this.setVariableSize();

   this.defaultButton = new PushButton( this );
   this.defaultButton.defaultButton = true;
   this.defaultButton.hide();

}

DialogGHSMain.prototype = new Dialog;
