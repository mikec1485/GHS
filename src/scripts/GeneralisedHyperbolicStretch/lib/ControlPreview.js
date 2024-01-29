
 /*
 * *****************************************************************************
 *
 * PREVIEW CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
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


function ControlPreview()
{
   this.__base__ = Frame;
   this.__base__();

   this.stretch = new GHSStretch();
   this.lastStretchKey = "";

   this.targetView = new View();

   this.setStretch = function(stretch)
   {
      this.stretch = stretch;
      this.lastStretchKey = "";
      this.stretchPreview();
   }

   this.baseImage = new Image();
   this.baseImageLightness = new Image();
   this.baseImageHSV = new Image();
   this.baseImageColLum = new Image();
   this.baseMask = new Image();
   this.originalImage = new Image();
   this.originalMask = new Image();
   this.previewImage = new Image();
   this.imageSelection = new Rect();

   this.readoutControl = undefined;

   this.readoutPoint = new Point();
   this.readoutData = [[0, 0, 0], [0, 0, 0]];
   this.showReadout = false;

   this.readoutArea = new Rect();
   this.readoutSize = 64;
   this.readoutAreaData = [0, 0, 0 ,0] // mean, median, maximum, minimum

   this.showPreview = true;
   this.invalidPreview = false;
   this.maskEnabled = false;
   this.maskInverted = false;
   this.isBusy = false;
   this.crossColour = 0xffffff00;
   this.crossActive = true;

   this.dragging = false;
   this.zooming = false;
   this.dragFrom = new Point();
   this.dragTo = new Point();

   this.dragRect = function()
   {
      let dX0 = Math.min(this.dragFrom.x, this.dragTo.x);
      let dY0 = Math.min(this.dragFrom.y, this.dragTo.y);
      let dX1 = Math.max(this.dragFrom.x, this.dragTo.x);
      let dY1 = Math.max(this.dragFrom.y, this.dragTo.y);

      let x0 = Math.max(this.viewPort().left, Math.min(this.viewPort().right, dX0));
      let y0 = Math.max(this.viewPort().top, Math.min(this.viewPort().bottom, dY0));
      let x1 = Math.max(this.viewPort().left, Math.min(this.viewPort().right, dX1));
      let y1 = Math.max(this.viewPort().top, Math.min(this.viewPort().bottom, dY1));

      return new Rect(x0, y0, x1, y1);
   }


   this.setImage = function(view)
   {
      let viewChanged = true;
      if (view === this.targetView) viewChanged = false;

      this.targetView = view;
      this.baseImage = new Image();
      this.baseImageLightness = new Image();
      this.baseImageSaturation = new Image();
      this.baseMask = new Image();
      this.maskEnabled = false;
      this.maskInverted = false;
      if (view.id != "")
      {
         this.baseImage.free();
         this.baseImage = new Image(view.image.width, view.image.height, view.image.numberOfChannels,view.image.colorSpace, 32, 1)
         this.baseImage.assign(view.image);

         this.baseImageLightness.free();
         view.image.getLightness(this.baseImageLightness);

         this.baseImageHSV.free();
         this.baseImageColLum.free();

         if (this.baseImage.isColor)
         {
            this.baseImageHSV = new Image(view.image.width, view.image.height, view.image.numberOfChannels,ColorSpace_HSV, 32, 1)
            this.baseImageHSV.assign(view.image);
            this.baseImageHSV.colorSpace = ColorSpace_HSV;

            view.beginProcess(UndoFlag_NoSwapFile);

            let rgbws = view.window.rgbWorkingSpace;
            let g = rgbws.gamma;
            let sRgbG = rgbws.srgbGamma;
            let Y = rgbws.Y;
            let x = rgbws.x;
            let y = rgbws.y;

            let newG = 1;
            let newSrgbG = false;
            let newY = this.stretch.stretchParameters.getLumCoefficients();

            let newRgbws = new RGBColorSystem(newG, newSrgbG, newY, x, y);
            view.window.rgbWorkingSpace = newRgbws;
            view.image.getLuminance(this.baseImageColLum);
            view.window.rgbWorkingSpace = rgbws;

            view.endProcess();
         }

         if ((view.window.maskEnabled) && (view.window.mask.mainView.id != ""))
         {
            this.baseMask.free();
            let mskImg = view.window.mask.mainView.image;
            this.baseMask = new Image(mskImg.width, mskImg.height, mskImg.numberOfChannels, mskImg.colorSpace, 32, 1)
            this.baseMask.assign(mskImg);
            this.maskEnabled = view.window.maskEnabled;
            this.maskInverted = view.window.maskInverted;
         }
         else
         {
            this.maskEnabled = false;
            this.maskInverted = false;
         }
      }

      if (viewChanged)
      {
         this.readoutPoint = new Point();
         this.readoutData = [[0, 0, 0], [0, 0, 0]];
         this.showReadout = false;
      }

      this.resetImage();
   }

   this.resetImage = function()
   {
      this.originalImage = new Image(this.baseImage);
      this.imageSelection = new Rect(0, 0, this.baseImage.width, this.baseImage.height);
      let zoomFac = this.zoomFactor();
      this.originalImage.resample(zoomFac);
      if (this.maskEnabled)
      {
         this.originalMask = new Image(this.baseMask);
         this.originalMask.resample(zoomFac);
      }
      this.previewImage = new Image(this.originalImage);

      this.stretchPreview();
   }

   this.stretchPreview = function(showRO)
   {
      //if (this.isBusy) return;
      this.isBusy = true;

      if (this.invalidPreview) {this.repaint();}
      processEvents();

      let currentKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
      if ((currentKey == this.lastStretchKey) || this.originalImage.isEmpty)
      {
         this.invalidPreview = false;
         this.lastStretchKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
         this.repaint();
         processEvents();
         this.isBusy = false;
         return;
      }

      this.previewImage = new Image(this.originalImage);

      this.stretch.recalcIfNeeded(this.targetView);
      let orgImg = new Image(this.previewImage);

      let A = new Float32Array( this.previewImage.numberOfPixels );
      let A1 = new Float32Array( this.previewImage.numberOfPixels );
      let A2 = new Float32Array( this.previewImage.numberOfPixels );
      let orgA = new Float32Array( this.previewImage.numberOfPixels );
      let M = new Float32Array( this.originalMask.numberOfPixels );

      let isInvertible = this.stretch.stretchParameters.isInvertible();

      if (this.stretch.stretchParameters.STN() == "Image Blend")        // Image blend
      {
         let combineViewId = this.stretch.stretchParameters.combineViewId;

         if (combineViewId != "")
         {
            let combineView = View.viewById(combineViewId);
            if (this.targetView.window.isMaskCompatible(combineView.window))
            {
               let cvImg = combineView.image;
               let combineImage = new Image(cvImg.width, cvImg.height, cvImg.numberOfChannels, cvImg.colorSpace, 32, 1)
               combineImage.assign(cvImg);
               combineImage.cropTo(this.imageSelection);
               let zoomFac = this.zoomFactor();
               combineImage.resample(zoomFac);
               let p = this.stretch.stretchParameters.combinePercent / 100;

               let channelCount = 1;
               if (this.previewImage.isColor) channelCount = 3;

               for (let c = 0; c < channelCount; ++c)
               {
                  if (this.stretch.stretchParameters.channelSelector[c] || this.stretch.stretchParameters.channelSelector[3])
                  {
                     this.previewImage.getSamples( A, new Rect, c );
                     if (combineImage.isColor) {combineImage.getSamples( A1, new Rect, c );}
                     else {combineImage.getSamples( A1, new Rect, 0 );}

                     if (!this.maskEnabled)
                     {
                        if (isInvertible && this.stretch.stretchParameters.Inv)
                        {
                           for (let i = 0; i < A.length; ++i) A[i] = (A[i] - p * A1[i]) / (1 - p);
                        }
                        else
                        {
                           for (let i = 0; i < A.length; ++i) A[i] = (1 - p) * A[i] + p * A1[i];
                        }
                     }
                     else
                     {
                        if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, c );}
                        else {this.originalMask.getSamples( M, new Rect, 0 );}

                        if (isInvertible && this.stretch.stretchParameters.Inv)
                        {
                           if (!this.maskInverted) {for (let i = 0; i < A.length; ++i) {A[i] = (A[i] - p * M[i] * A1[i]) / (1  - p * M[i]);}}
                           else {for (let i = 0; i < A.length; ++i) {A[i] = (A[i] - (p * (1 - M[i])) * A1[i]) / (1 - p * (1 - M[i]));}}
                        }
                        else
                        {
                           if (!this.maskInverted) {for (let i = 0; i < A.length; ++i) {A[i] = (1 - p * M[i]) * A[i] + p * M[i] * A1[i];}}
                           else {for (let i = 0; i < A.length; ++i) {A[i] = (1 - p * (1 - M[i])) * A[i] + p * (1 - M[i]) * A1[i];}}
                        }
                     }
                     this.previewImage.setSamples( A, new Rect, c );
                  }
               }
               combineImage.free();
            }
         }
      }
      else
      {
         var channel = -1;
         if (this.stretch.stretchParameters.channelSelector[0]) channel = 0;
         if (this.stretch.stretchParameters.channelSelector[1]) channel = 1;
         if (this.stretch.stretchParameters.channelSelector[2]) channel = 2;

         if (channel > -1)                                                    // Red, Green or Blue single channel
         {
            this.previewImage.getSamples( A, new Rect, channel );

            if (!this.maskEnabled)
            {
               for ( let i = 0; i < A.length; ++i )
               {
                  A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, channel, isInvertible);
               }
            }
            else
            {
               if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, channel );}
               else {this.originalMask.getSamples( M, new Rect, 0 );}

               if (this.maskInverted)
               {
                  for ( let i = 0; i < A.length; ++i )
                  {
                     A[i] = M[i] * A[i] + (1 - M[i]) * this.stretch.calculateStretch(A[i], undefined,undefined, false, channel, isInvertible);
                  }
               }
               else
               {
                  for ( let i = 0; i < A.length; ++i )
                  {
                     A[i] = (1 - M[i]) * A[i] + M[i] * this.stretch.calculateStretch(A[i], undefined,undefined, false, channel, isInvertible);
                  }
               }
            }

            this.previewImage.setSamples( A, new Rect, channel );
         }

         if (this.stretch.stretchParameters.channelSelector[3])                // RGB/K
         {
            if (!this.maskEnabled)
            {
               let channelCount = 1;
               if (this.previewImage.isColor) channelCount = 3;

               for (let c = 0; c < channelCount; ++c)
               {
                  this.previewImage.getSamples( A, new Rect, c );

                  for ( let i = 0; i < A.length; ++i )
                  {
                     A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, c, isInvertible);
                  }

                  this.previewImage.setSamples( A, new Rect, c );
               }
            }
            if (this.maskEnabled)
            {
               let channelCount = 1;
               if (this.previewImage.isColor) channelCount = 3;

               for (let c = 0; c < channelCount; ++c)
               {
                  this.previewImage.getSamples( A, new Rect, c );
                  if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, c );}
                  else {this.originalMask.getSamples( M, new Rect, 0 );}

                  if (this.maskInverted)
                  {
                     for ( let i = 0; i < A.length; ++i ) {A[i] = M[i] * A[i] + (1 - M[i]) * this.stretch.calculateStretch(A[i], undefined,undefined, false, c, isInvertible);}
                  }
                  else
                  {
                     for ( let i = 0; i < A.length; ++i ) {A[i] = (1 - M[i]) * A[i] + M[i] * this.stretch.calculateStretch(A[i], undefined,undefined, false, c, isInvertible);}
                  }

                  this.previewImage.setSamples( A, new Rect, c );
               }
            }
         }

         if (this.stretch.stretchParameters.channelSelector[4]) channel = 4;
         if (this.stretch.stretchParameters.channelSelector[5]) channel = 5;
         if (this.stretch.stretchParameters.channelSelector[6]) channel = 6;

         if (this.stretch.stretchParameters.channelSelector[4])                //Lightness (as CT)
         {
            let lstImg = new Image();
            this.previewImage.getLightness(lstImg);


            lstImg.getSamples( A, new Rect, 0 );
            for ( let i = 0; i < A.length; ++i )
            {
               A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, 0, isInvertible);
            }
            lstImg.setSamples( A, new Rect, 0 );
            this.previewImage.setLightness(lstImg);

            lstImg.free();
         }

         if (this.stretch.stretchParameters.channelSelector[5])                //Saturation
         {
            let lstImg = new Image();
            this.previewImage.getLightness(lstImg);

            let cs = this.previewImage.colorSpace
            this.previewImage.colorSpace = ColorSpace_HSV;
            this.previewImage.getSamples( A, new Rect, 1 );
            for ( let i = 0; i < A.length; ++i )
            {
               A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, 0, isInvertible);
            }
            this.previewImage.setSamples( A, new Rect, 1 );
            this.previewImage.colorSpace = cs;

            this.previewImage.setLightness(lstImg);
            lstImg.free();
         }

         if (this.stretch.stretchParameters.channelSelector[6])                //Luminance (as arcsinh)
         {
            let lumCoefficients = this.stretch.stretchParameters.getLumCoefficients(this.targetView);
            let lR = lumCoefficients[0];
            let lG = lumCoefficients[1];
            let lB = lumCoefficients[2];

            this.previewImage.getSamples( A, new Rect, 0 );
            this.previewImage.getSamples( A1, new Rect, 1 );
            this.previewImage.getSamples( A2, new Rect, 2 );

            if (this.stretch.stretchParameters.colourClip == "Rescale")
            {
               for ( let i = 0; i < A.length; ++i )
               {
                  let l = lR * A[i] + lG * A1[i] + lB * A2[i];
                  let sl = this.stretch.calculateStretch(l, undefined, undefined, false, 0, isInvertible);

                  if (l == 0)
                  {
                     A[i] = 0;
                     A1[i] = 0;
                     A2[i] = 0;
                  }
                  else
                  {
                     A[i] = (sl / l) * A[i];
                     A1[i] = (sl / l) * A1[i];
                     A2[i] = (sl / l) * A2[i];
                     let max = Math.max(A[i], A1[i], A2[i]);
                     if (max > 1)
                     {
                        A[i] = A[i] / max;
                        A1[i] = A1[i] / max;
                        A2[i] = A2[i] / max;
                     }
                  }
               }
            }
            else
            {
               for ( let i = 0; i < A.length; ++i )
               {
                  let l = lR * A[i] + lG * A1[i] + lB * A2[i];
                  let sl = this.stretch.calculateStretch(l, undefined, undefined, false, 0, isInvertible);

                  if (l == 0)
                  {
                     A[i] = 0;
                     A1[i] = 0;
                     A2[i] = 0;
                  }
                  else
                  {
                     A[i] = Math.min(1, (sl / l) * A[i]);
                     A1[i] = Math.min(1, (sl / l) * A1[i]);
                     A2[i] = Math.min(1, (sl / l) * A2[i]);
                  }
               }
            }
            this.previewImage.setSamples( A, new Rect, 0 );
            this.previewImage.setSamples( A1, new Rect, 1 );
            this.previewImage.setSamples( A2, new Rect, 2 );
         }

         if ((channel > 3) && (this.maskEnabled))                              // take care of any masking for Light, Lum and Sat stretches
         {
            let channelCount = 1;
            if (this.previewImage.isColor) channelCount = 3;

            for (let c = 0; c < channelCount; ++c)
            {
               this.previewImage.getSamples( A, new Rect, c );
               if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, c );}
               else {this.originalMask.getSamples( M, new Rect, 0 );}
               orgImg.getSamples( orgA, new Rect, c );
               for (let i = 0; i < M.length; ++i)
               {
                  if (this.maskInverted) {A[i] = M[i] * orgA[i] + (1 - M[i]) * A[i];}
                  else {A[i] = (1 - M[i]) * orgA[i] + M[i] * A[i];}
               }
               this.previewImage.setSamples( A, new Rect, c );
            }
         }
      }

      orgImg.free();

      if (showRO == undefined) {this.calculateReadout(this.showReadout);}
      else {this.calculateReadout(showRO);}

      this.invalidPreview = false;
      this.lastStretchKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
      this.repaint();
      processEvents();
      this.isBusy = false;
   }

   this.calculateReadout = function(showRO)
   {
      let minChannel = 0;
      let maxChannel = 0;

      let img = this.baseImage;

      if (this.stretch.stretchParameters.channelSelector[4])
      {
         img = this.baseImageLightness;
      }

      else if (this.stretch.stretchParameters.channelSelector[5])
      {
         img = this.baseImageHSV;
         minChannel = 1;
         maxChannel = 1;
      }

      else if (this.stretch.stretchParameters.channelSelector[6])
      {
         img = this.baseImageColLum;
      }

      else if (this.baseImage.isColor)
      {
         switch (this.readoutControl.roDataChannel)
         {
            case 0:
               maxChannel = 2;
               break;
            case 2:
               minChannel = 1;
               maxChannel = 1;
               break;
            case 3:
               minChannel = 2;
               maxChannel = 2;
               break;
         }
      }

      if (true)   //(!this.stretch.stretchParameters.channelSelector[6])
      {
         this.readoutAreaData[0] = img.mean(this.readoutArea, minChannel, maxChannel);
         this.readoutAreaData[1] = img.median(this.readoutArea, minChannel, maxChannel);
         this.readoutAreaData[2] = img.maximum(this.readoutArea, minChannel, maxChannel);
         this.readoutAreaData[3] = img.minimum(this.readoutArea, minChannel, maxChannel);
      }
      else  // colour stretch
      {
         let lc = this.stretch.stretchParameters.getLumCoefficients();
         let means = new Array;
         for (let c = 0; c < 3; ++c) means.push(this.baseImage.mean(this.readoutArea, c, c));
         for (let i = 0; i < 4; ++i) this.readoutAreaData[i] = 0;
         for (let c = 0; c < 3; ++c) this.readoutAreaData[0] += lc[c] * means[c];
         this.readoutAreaData[0] /= 3;
      }

      if (showRO != undefined) {this.showReadout = showRO;}

      if (this.readoutControl != undefined)
      {
         this.readoutControl.showRO = this.showReadout;
         this.readoutControl.setReadAreaData(this.readoutArea, this.readoutAreaData);
         this.readoutControl.update();
      }
   }

   this.viewPort = function()
   {
      let imgWidth = this.imageSelection.width;
      let imgHeight = this.imageSelection.height;
      let frmWidth = this.width;
      let frmHeight = this.height;

      let tlx = Math.max(0, 0.5 * (frmWidth - this.zoomFactor() * imgWidth));
      let tly = Math.max(0, 0.5 * (frmHeight - this.zoomFactor() * imgHeight));
      let brx = tlx + this.zoomFactor() * imgWidth;
      let bry = tly + this.zoomFactor() * imgHeight;

      return new Rect(tlx, tly, brx, bry);
   }

   this.zoomFactor = function()
   {
      let imgWidth = this.imageSelection.width;
      let imgHeight = this.imageSelection.height;
      let frmWidth = this.width;
      let frmHeight = this.height;
      return Math.min(frmWidth / imgWidth, frmHeight / imgHeight, 1);
   }

   this.onPaint = function(x0, y0, x1, y1)
   {
      let g = new Graphics(this);
      let vP = this.viewPort();

      if (this.showPreview)
      {
         let bmp = this.previewImage.render(1, false, false)
         if (this.targetView.id != "") this.targetView.window.applyColorTransformation(bmp);
         g.drawBitmap(vP.leftTop, bmp);
         bmp.clear();
         if (this.invalidPreview && this.crossActive)
         {
            g.pen = new Pen(getColourCode( this.crossColour ));
            g.drawLine(vP.leftTop, vP.rightBottom);
            g.drawLine(vP.rightTop, vP.leftBottom);
         }
      }
      else
      {
         let bmp = this.originalImage.render(1, false, false)
         if (this.targetView.id != "") this.targetView.window.applyColorTransformation(bmp);
         g.drawBitmap(vP.leftTop, bmp);
         bmp.clear();
         if (this.invalidPreview && this.crossActive)
         {
            g.pen = new Pen(getColourCode( this.crossColour ));
            g.drawLine(vP.leftTop, vP.rightBottom);
            g.drawLine(vP.rightTop, vP.leftBottom);
         }
      }

      if (this.dragging && this.zooming) {g.fillRect(this.dragRect(), new Brush(0x20ffffff));}

      if ((this.readoutControl != undefined) && this.showReadout)
      {
         if (this.readoutControl.showReticle)
         {
            let zoom = this.zoomFactor();
            let cursorSize = 24;
            let cpX = vP.x0 + zoom * (this.readoutPoint.x - this.imageSelection.x0);
            let cpY = vP.y0 + zoom * (this.readoutPoint.y - this.imageSelection.y0);
            let rpX = zoom * (this.readoutPoint.x - this.imageSelection.x0);
            let rpY = zoom * (this.readoutPoint.y - this.imageSelection.y0);

            let cursorPoint = new Point(cpX, cpY);
            let cursorRect = new Rect(rpX - cursorSize / 2, rpY - cursorSize / 2, rpX + cursorSize / 2, rpY + cursorSize / 2);

            let roaX0 = Math.round(cpX - zoom * this.readoutSize / 2);
            let roaY0 = Math.round(cpY - zoom * this.readoutSize / 2);
            let roaX1 = Math.round(cpX + zoom * this.readoutSize / 2);
            let roaY1 = Math.round(cpY + zoom * this.readoutSize / 2);

            let roArea = new Rect(roaX0, roaY0, roaX1, roaY1);

            let meanValue = 0;
            if (this.showPreview && this.previewImage.isGrayscale) meanValue = this.previewImage.mean(cursorRect, 0, 0);
            if (this.showPreview && this.previewImage.isColor) meanValue = this.previewImage.mean(cursorRect, 0, 2);
            if (!this.showPreview && this.originalImage.isGrayscale) meanValue = this.originalImage.mean(cursorRect, 0, 0);
            if (!this.showPreview && this.originalImage.isColor) meanValue = this.originalImage.mean(cursorRect, 0, 2);
            if (meanValue > 0.7) g.pen = new Pen(0xff000000);
            else g.pen = new Pen(0xffffffff);

            let P0 = new Point(cpX - cursorSize / 2, cpY);
            let P1 = new Point(cpX + cursorSize / 2, cpY);
            g.drawLine(P0, P1);

            let P2 = new Point(cpX, cpY - cursorSize / 2);
            let P3 = new Point(cpX, cpY + cursorSize / 2);
            g.drawLine(P2, P3);

            g.drawLine(roArea.leftTop, roArea.rightTop);
            g.drawLine(roArea.rightTop, roArea.rightBottom);
            g.drawLine(roArea.rightBottom, roArea.leftBottom);
            g.drawLine(roArea.leftBottom, roArea.leftTop);
         }
      }

      g.end()
   }

   this.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      if (modifiers == KeyModifier_Control)
      {
         let showPreview = !this.dialog.optShowPreview.checked;
         this.dialog.optShowPreview.checked = showPreview;
         this.dialog.optShowTarget.checked = !showPreview;
      }
      else
      {
         let viewROP = this.imgToViewPoint(this.readoutPoint);
         let clickDistance = viewROP.distanceTo(new Point(x, y));

         if (this.showReadout && (clickDistance < 8))
         {
            this.zooming = false;
            this.cursor = new Cursor(28);
         }
         else
         {
            this.zooming = true;
         }

         this.dragging = true;
         this.dragFrom = new Point(x, y);
         this.dragTo = new Point(x, y);
      }
   }

   this.onMouseMove = function(x, y, buttonState, modifiers)
   {
      if (this.dragging)
      {
         this.dragTo = new Point(x, y);

         if (this.zooming)
         {
            this.repaint();
         }
         else
         {
            this.readoutPoint = this.viewToImgPoint(this.dragTo);
            this.setReadout();
         }
      }
   }

   this.onMouseRelease = function(x, y, button, buttonState, modifiers)
   {
      if (this.dragging)
      {
         if (this.viewPort().area == 0)
         {
            this.dragFrom = new Point();
            this.dragTo = new Point();
            this.dragging = false;
            this.cursor = new Cursor(1);
            this.repaint();
            return;
         }

         if (this.zooming && (this.dragRect().area > 0))
         {
            this.imageSelection = this.viewToImgRect(this.dragRect());

            this.originalImage = new Image(this.baseImage);
            this.originalImage.cropTo(this.imageSelection);
            let zoomFac = this.zoomFactor();
            this.originalImage.resample(zoomFac);
            if (this.maskEnabled)
            {
               this.originalMask = new Image(this.baseMask);
               this.originalMask.cropTo(this.imageSelection);
               this.originalMask.resample(zoomFac);
            }
            this.dragging = false;
            this.stretchPreview();
         }
         else
         {
            this.readoutPoint = this.viewToImgPoint(this.dragTo);
            this.showReadout = true;
            this.setReadout();
         }

         this.dragFrom = new Point();
         this.dragTo = new Point();
         this.dragging = false;
         this.zooming = false;
         this.cursor = new Cursor(1);
      }
   }

   this.setReadout = function(size, roPoint)
   {
      if (size != undefined) this.readoutSize = size;
      if (roPoint != undefined) this.readoutPoint = roPoint;
      let semiSide = Math.floor(this.readoutSize / 2);
      let roaX0 = Math.max(0, this.readoutPoint.x - semiSide);
      let roaY0 = Math.max(0, this.readoutPoint.y - semiSide);
      let roaX1 = Math.min(this.baseImage.width, this.readoutPoint.x + semiSide + 1);
      let roaY1 = Math.min(this.baseImage.height, this.readoutPoint.y + semiSide + 1);
      this.readoutArea = new Rect(roaX0, roaY0, roaX1, roaY1);
      this.calculateReadout();
      this.repaint();
   }

   this.viewToImgRect = function(vRect)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let nisX0 = isL + this.imageSelection.width * (vRect.left - this.viewPort().left) / this.viewPort().width;
      let nisY0 = isT + this.imageSelection.height * (vRect.top - this.viewPort().top) / this.viewPort().height;
      let nisX1 = isL + this.imageSelection.width * (vRect.right - this.viewPort().left) / this.viewPort().width;
      let nisY1 = isT + this.imageSelection.height * (vRect.bottom - this.viewPort().top) / this.viewPort().height;
      return new Rect(nisX0, nisY0, nisX1, nisY1);
   }

   this.viewToImgPoint = function(vPoint)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let imgX0 = isL + this.imageSelection.width * (vPoint.x - this.viewPort().left) / this.viewPort().width;
      let imgY0 = isT + this.imageSelection.height * (vPoint.y - this.viewPort().top) / this.viewPort().height;
      return new Point(imgX0, imgY0);
   }

   this.imgToViewPoint = function(imgPoint)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let viewX0 = this.viewPort().width * (imgPoint.x - isL) / this.imageSelection.width + this.viewPort().left;
      let viewY0 = this.viewPort().height * (imgPoint.y - isT) / this.imageSelection.height + this.viewPort().top;
      return new Point(viewX0, viewY0);
   }
}
ControlPreview.prototype = new Frame;
