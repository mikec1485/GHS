
 /*
 * *****************************************************************************
 *
 * READOUT CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.2
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


function ControlReadout()
{
   this.__base__ = Control;
   this.__base__();

   this.previewControl = undefined;
   this.stretchGraph = undefined;
   this.stretchParameters = undefined;

   this.showRO = false;
   this.showReticle = true;

   this.roPoint = undefined;
   this.roArea = undefined;
   this.roPointData = undefined;
   this.roAreaData = undefined;
   this.roDataIndex = 0;
   this.roDataChannel = 0;

   this.areaSize = 64;
   this.histogramLink = true
   this.lastUpdateChannel = -1;

   let labelWidth = 48;
   let spacing = 4;

   //-------------------
   // Readout area panel|
   //-------------------

   this.roAreaLabel = new Label( this );
   this.roAreaLabel.minHeight = 24;
   this.roAreaLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;
   this.roAreaLabel.useRichText = true;
   this.roAreaLabel.text = "<b>Readout:</b> [None]";
   this.roAreaLabel.toolTip = "<p>Click on the preview to place readout reticle. Click close to the readout " +
         "reticle and drag lets you drag it to a new location.</p>"

   this.reticleCheck = new CheckBox( this );
   this.reticleCheck.text = "Show reticle"
   this.reticleCheck.minHeight = 24;
   this.reticleCheck.checked = this.showReticle;
   this.reticleCheck.toolTip = "<p>Show or hide the reticle indicating readout placement on the preview image.</p>";
   this.reticleCheck.onCheck = function( checked ) {
      this.parent.showReticle = checked;
      this.parent.update();
   }

   this.resetButton = new ToolButton( this );
   this.resetButton.icon = this.scaledResource(":/icons/clear.png");
   this.resetButton.setScaledFixedSize(24, 24);
   this.resetButton.toolTip =
            "<p>Clear readout</p>";
   this.resetButton.onClick = function( checked ) {
      this.parent.showRO = checked;
      this.parent.update();
   }

   this.line1Sizer = new HorizontalSizer( this );
   this.line1Sizer.addSpacing(2 * spacing);
   this.line1Sizer.spacing = spacing;
   this.line1Sizer.add(this.roAreaLabel);
   this.line1Sizer.addStretch();
   this.line1Sizer.add(this.resetButton);
   this.line1Sizer.add(this.reticleCheck);
   this.line1Sizer.addSpacing(2 * spacing);

   this.dataType = new ComboBox( this );
   this.dataType.toolTip = "<p>Select the readout statistic to calculate over the specified read area.</p>"
   this.dataType.addItem("Mean");
   this.dataType.addItem("Median");
   this.dataType.addItem("Maximum");
   this.dataType.addItem("Minimum");
   this.dataType.onItemSelected = function(index)
   {
      this.parent.roDataIndex = index;
      this.parent.update();
   }

   this.dataChannel = new ComboBox( this );
   this.dataChannel.toolTip = "<p>Select the channel for which the readout statistic is calculated.  " +
         "Set to RGB/K to calculate over all three channels of a colour image.</p>"
   this.dataChannel.addItem("RGB/K");
   this.dataChannel.addItem("Red");
   this.dataChannel.addItem("Green");
   this.dataChannel.addItem("Blue");
   this.dataChannel.onItemSelected = function(index)
   {
      this.parent.roDataChannel = index;
      if (this.parent.previewControl != undefined) this.parent.previewControl.calculateReadout();
   }

   this.dataValue = new Label( this );
   this.dataValue.textAlignment = TextAlign_HorzCenter | TextAlign_VertCenter;
   this.dataValue.backgroundColor = Color.WHITE;
   this.dataValue.text = "";

   this.dataValueCheck = new CheckBox( this );
   this.dataValueCheck.text = "Show on histogram";
   this.dataValueCheck.checked = this.histogramLink;
   this.dataValueCheck.enabled = false;
   this.dataValueCheck.toolTip = "<p>Show readout statistic on the histogram graph.</p>"
   this.dataValueCheck.onCheck = function(checked)
   {
      this.parent.histogramLink = checked;
      this.parent.update();
   }

   this.dataValueSend = new PushButton( this );
   this.dataValueSend.text = "Send value to SP";
   this.dataValueSend.enabled = false;
   this.dataValueSend.toolTip = "<p>Send value to parameters. If Transformation type is " +
         "Generalised Hyperbolic Stretch, Histogram Transformation or Arcsinh, " +
         "the value will be sent to SP.  If transformation type is Linear Stretch " +
         "the value will be sent to BP.</p>"
   this.dataValueSend.onClick = function( checked )
   {
      if (this.parent.stretchParameters == undefined) return;
      if (this.parent.roAreaData == undefined) return;

      if ((this.parent.stretchParameters.STN() == "Generalised Hyperbolic Stretch") ||
         (this.parent.stretchParameters.STN() == "Histogram Transformation") ||
         (this.parent.stretchParameters.STN() == "Arcsinh Stretch"))
      {
         let HP = this.parent.stretchParameters.HP;
         let LP = this.parent.stretchParameters.LP;
         let index = this.parent.roDataIndex;
         //this.parent.stretchParameters.SP = Math.min(HP, Math.max(LP, this.parent.roAreaData[index]));
         this.parent.stretchParameters.SP = this.parent.roAreaData[index];
         this.parent.dialog.updateControls();
      }
      if (this.parent.stretchParameters.STN() == "Linear Stretch")
      {
         let WP = this.parent.stretchParameters.WP;
         let index = this.parent.roDataIndex;
         let q = 1 / Math.pow10(this.parent.stretchParameters.BPWPPrecision);
         this.parent.stretchParameters.BP = Math.min(WP - q, this.parent.roAreaData[index]);
         this.parent.dialog.updateControls();
      }
   }

   let mw = Math.max(this.dataType.width, this.dataValue.width, this.dataValueCheck.width, this.dataValueSend.width);
   this.dataType.minWidth = mw;
   this.dataValue.minWidth = mw;

   this.line21Sizer = new VerticalSizer( this );
   this.line21Sizer.spacing = spacing;
   this.line21Sizer.add(this.dataChannel);
   this.line21Sizer.add(this.dataType);

   this.line22Sizer = new VerticalSizer( this );
   this.line22Sizer.spacing = spacing;
   this.line22Sizer.add(this.dataValueCheck);
   this.line22Sizer.add(this.dataValueSend);

   this.line2Sizer = new HorizontalSizer( this );
   this.line2Sizer.addSpacing(2 * spacing);
   this.line2Sizer.spacing = spacing;
   this.line2Sizer.add(this.line21Sizer);
   this.line2Sizer.add(this.dataValue);
   this.line2Sizer.add(this.line22Sizer);
   this.line2Sizer.addSpacing(2 * spacing);

   this.areaSizeNum =  new NumericControl( this );
   this.areaSizeNum.label.text = "Readout size";
   this.areaSizeNum.setRange(0, 256);
   this.areaSizeNum.setPrecision( 2 );
   this.areaSizeNum.slider.setRange( 0, 100 );
   this.areaSizeNum.setValue(this.areaSize);
   this.areaSizeNum.toolTip = "<p>This controls the size of the area around the readout point " +
         "over which the relevant readout statistic is calculated.  The area is indicated by the " +
         "square in the readout reticle. Set this parameter to zero to see readout at a point.</p>"
   this.areaSizeNum.onValueUpdated = function(value)
   {
      let v = Math.floor(value);
      this.setValue(v);
      this.parent.areaSize = v;
      if (this.parent.previewControl != undefined) this.parent.previewControl.setReadout(v);
   }

   this.line3Sizer = new HorizontalSizer( this );
   this.line3Sizer.addSpacing(2 * spacing);
   this.line3Sizer.spacing = spacing;
   this.line3Sizer.add(this.areaSizeNum);
   this.line3Sizer.addSpacing(2 * spacing);

   this.sizer = new VerticalSizer();
   this.sizer.add(this.line1Sizer);
   this.sizer.add(this.line2Sizer);
   this.sizer.addSpacing(4);
   this.sizer.add(this.line3Sizer);
   this.sizer.addSpacing(4);

   this.setReadPointData = function(point, data)
   {
      this.roPoint = point;
      this.roPointData = data;
   }

   this.setReadAreaData = function(area, data)
   {
      this.roArea = area;
      this.roAreaData = data;
   }

   this.setReadData = function(point, pointData, area, areaData)
   {
      this.setReadPointData(point, pointData);
      this.setReadAreaData(area, areaData);
   }

   this.update = function()
   {
      if (!this.showRO) {this.reset(); return;}

      this.roAreaLabel.clear();
      if (this.roArea != undefined)
      {
         this.roAreaLabel.text = "<b>Readout:</b> (";
         this.roAreaLabel.text += this.roArea.x0.toFixed(0) + ", ";
         this.roAreaLabel.text += this.roArea.y0.toFixed(0) + ")"
         if (this.areaSizeNum.value > 1)
         {
            this.roAreaLabel.text += " - (";
            this.roAreaLabel.text += (this.roArea.x1 - 1).toFixed(0) + ", ";
            this.roAreaLabel.text += (this.roArea.y1 - 1).toFixed(0) + ")";
         }
      }
      else
      {
         this.roAreaLabel.text = "<b>Readout:</b> [None]";
      }

      let dvsSet = false;
      if (this.stretchParameters != undefined)
      {
         let stn = this.stretchParameters.STN();
         let LP = this.stretchParameters.LP;
         let HP = this.stretchParameters.HP;
         let WP = this.stretchParameters.WP;
         if ((stn == "Generalised Hyperbolic Stretch") ||
            (stn == "Histogram Transformation")||
            (stn == "Arcsinh Stretch"))
         {
            //let roAD = this.roAreaData[this.roDataIndex];
            //if ((roAD < LP) || (roAD > HP)) {this.dataValueSend.enabled = false; dvsSet = true;}
         }
         if (stn == "Linear Stretch")
         {
            let roAD = this.roAreaData[this.roDataIndex];
            if (!(roAD < WP)) {this.dataValueSend.enabled = false; dvsSet = true;}
         }
         if ((stn == "Image Inversion") ||
            (stn == "Image Blend")||
            (stn == "STF Transformation"))
         {
            this.dataValueSend.enabled = false;
            dvsSet = true;
         }
      }

      let chNumber = this.stretchParameters.getChannelNumber();
      if (chNumber != this.lastUpdateChannel) this.refreshCombos();
      this.lastUpdateChannel = this.stretchParameters.getChannelNumber();


      this.dataValue.clear();
      if (this.roAreaData != undefined)
      {
         this.dataValue.text = this.roAreaData[this.roDataIndex].toFixed(5);
         this.dataValueCheck.enabled = true;
         if (!dvsSet) this.dataValueSend.enabled = true;
      }
      else
      {
         this.dataValue.text = "";
         this.dataValueCheck.enabled = false;
         if (!dvsSet) this.dataValueSend.enabled = false;
      }

      if (this.stretchGraph != undefined) this.stretchGraph.repaint();
      if (this.previewControl != undefined) this.previewControl.repaint();
   }

   this.refreshCombos = function()
   {
      this.dataChannel.clear();
      let chNumber = this.stretchParameters.getChannelNumber();
      switch (chNumber)
      {
         case 4:
            this.dataChannel.addItem("Lightness");
            this.dataChannel.enabled = false;
            break;
         case 5:
            this.dataChannel.addItem("Saturation");
            this.dataChannel.enabled = false;
            break;
         case 6:
            this.dataChannel.addItem("Luminance");
            this.dataChannel.enabled = false;
            break
         default:
            this.dataChannel.addItem("RGB/K");
            this.dataChannel.addItem("Red");
            this.dataChannel.addItem("Green");
            this.dataChannel.addItem("Blue");
            if (chNumber < 3) this.dataChannel.currentItem = chNumber + 1;
            else this.dataChannel.currentItem = 0;
            this.dataChannel.enabled = true;
      }
   }

   this.reset = function()
   {
      if (this.previewControl != undefined)
      {
         this.previewControl.showReadout = false;
         this.previewControl.repaint();
      }

      this.showRO = false;

      this.roAreaLabel.clear();
      this.roAreaLabel.text = "<b>Readout:</b> [None]";

      this.dataValue.clear();
      this.dataValue.text = "";

      let chNumber = this.stretchParameters.getChannelNumber();
      if (chNumber != this.lastUpdateChannel) this.refreshCombos();
      this.lastUpdateChannel = -1;

      //this.dataValueCheck.checked = false;
      this.dataValueCheck.enabled = false;
      this.dataValueSend.enabled = false;

      if (this.stretchGraph != undefined) this.stretchGraph.repaint();
   }

}
ControlReadout.prototype = new Control;
