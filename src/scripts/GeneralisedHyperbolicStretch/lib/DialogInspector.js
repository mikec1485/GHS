
 /*
 * *****************************************************************************
 *
 * IMAGE INSPECTION DIALOG
 * This dialog forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.0
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

#include "GHSViews.js"


function DialogInspector(ghsViews) {
   this.__base__ = Dialog;
   this.__base__();

   this.windowTitle = "Image Inspector"

   //---------------------
   // Initial housekeeping|
   //---------------------
   // let the dialog be resizable
   this.userResizable = true;

   this.suspendUpdating = false;

   this.width = 1000;
   this.height = 800;

   this.channelCount = 1;
   if (ghsViews.getView(0).image.isColor) this.channelCount = 3;

   this.onResize = function(wNew, hNew, wOld, hOld)
   {
      if (this.dialog.suspendUpdating) return;
      this.dialog.update();
   }

   // define the current image
   this.imageIndex = 0;
   this.stfIndex = [0, 0];
   this.linkedSTF = true;
   this.currentImage = function()
   {
      this.dialog.suspendUpdating = true;
      var returnValue = ghsViews.getBitmap(2 * this.stfIndex[this.imageIndex] + this.imageIndex);
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
      if (modifiers == KeyModifier_Shift) this.linkedSTF = true;
      if (modifiers == KeyModifier_Control) this.linkedSTF = false;
      this.dialog.stfIndex[this.dialog.imageIndex] = 1;
      if ((ghsViews.getView(0).image.isColor) && (!this.linkedSTF)) this.dialog.stfIndex[this.dialog.imageIndex] = 2;
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

   this.histControl = new ControlHistData();
   this.histControl.initParams(ghsViews.getHistData(0)[0], this.channelCount);
   this.histControl.updateTable();
   this.histControl.updateTable((new Histogram()).generate(ghsViews.getView(0).image));
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

      let n = this.dialog.imageIndex;
      this.histControl.initParams(ghsViews.getHistData(n)[0], this.channelCount);

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

         ghsViews.stretch.recalcIfNeeded();
         if (ghsViews.getView(0).image.isColor)
         {
            var rValue = [0, 0];
            var gValue = [0, 0];
            var bValue = [0, 0];

            rValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 0);
            gValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 1);
            bValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 2);
            this.dialog.readoutData[0] = [rValue[0], gValue[0], bValue[0]];

            var rText = "<b>R:    </b>" + rValue[0].toFixed(5);
            var gText = "<b>G:    </b>" + gValue[0].toFixed(5);
            var bText = "<b>B:    </b>" + bValue[0].toFixed(5);

            if (ghsViews.views[1] != undefined)
            {
               rValue[1] = ghsViews.getView(1).image.sample(imageX, imageY, 0);
               gValue[1] = ghsViews.getView(1).image.sample(imageX, imageY, 1);
               bValue[1] = ghsViews.getView(1).image.sample(imageX, imageY, 2);
               this.dialog.readoutData[1] = [rValue[1], gValue[1], bValue[1]];

               rText += "    " + rValue[1].toFixed(5);
               gText += "    " + gValue[1].toFixed(5);
               bText += "    " + bValue[1].toFixed(5);
            }

            roText += rText + "<br>" + gText + "<br>" + bText;
         }
         else
         {
            var kValue = [0, 0];

            kValue[0] = ghsViews.getView(0).image.sample(imageX, imageY, 0);
            this.dialog.readoutData[0] = [kValue[0], 0, 0];

            var kText = "<b>K:    </b>" + kValue[0].toFixed(5);

            if (ghsViews.views[1] != undefined)
            {
               kValue[1] = ghsViews.getView(1).image.sample(imageX, imageY, 0);
               this.dialog.readoutData[1] = [kValue[1], 0, 0];

               kText += "    " + kValue[1].toFixed(5);
            }

            roText += kText;
         }
         this.dialog.readout.text = roText;
         this.histControl.updateTable(this.dialog.readoutData[n]);
      }
      else
      {
         this.histControl.updateTable();
      }

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

DialogInspector.prototype = new Dialog;

