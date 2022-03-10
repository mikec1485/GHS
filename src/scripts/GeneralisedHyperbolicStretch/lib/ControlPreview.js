
 /*
 * *****************************************************************************
 *
 * PREVIEW CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
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
   this.baseMask = new Image();
   this.originalImage = new Image();
   this.originalMask = new Image();
   this.previewImage = new Image();
   this.imageSelection = new Rect();
   this.showPreview = true;
   this.invalidPreview = false;
   this.maskEnabled = false;
   this.maskInverted = false;
   this.stretching = false;
   this.crossColour = 0xffffff00;
   this.crossActive = true;

   this.dragging = false;
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
      this.targetView = view;
      this.baseImage = new Image();
      this.baseMask = new Image();
      this.maskEnabled = false;
      this.maskInverted = false;
      if (view.id != "")
      {
         this.baseImage.free();
         this.baseImage = new Image(view.image.width, view.image.height, view.image.numberOfChannels,view.image.colorSpace, 32, 1)
         this.baseImage.assign(view.image);

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

   this.stretchPreview = function()
   {
      //if (this.stretching) return;
      this.stretching = true;

      if (this.invalidPreview) {this.repaint();}
      processEvents();

      let currentKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
      if (currentKey == this.lastStretchKey)
      {
         this.invalidPreview = false;
         this.lastStretchKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
         this.repaint();
         processEvents();
         this.stretching = false;
         return;
      }

      this.previewImage = new Image(this.originalImage);

      if (this.originalImage.isEmpty)
      {
         this.lastStretchKey = "";
         return;
      }

      this.stretch.recalcIfNeeded(this.targetView);
      let orgImg = new Image(this.previewImage);

      let A = new Float32Array( this.previewImage.numberOfPixels );
      let A1 = new Float32Array( this.previewImage.numberOfPixels );
      let A2 = new Float32Array( this.previewImage.numberOfPixels );
      let orgA = new Float32Array( this.previewImage.numberOfPixels );
      let M = new Float32Array( this.originalMask.numberOfPixels );

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
                     combineImage.getSamples( A1, new Rect, c );

                     if (!this.maskEnabled)
                     {
                        for (let i = 0; i < A.length; ++i) A[i] = (1 - p) * A[i] + p * A1[i];
                     }
                     else
                     {
                        if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, c );}
                        else {this.originalMask.getSamples( M, new Rect, 0 );}

                        if (!this.maskInverted) {for (let i = 0; i < A.length; ++i) {A[i] = (1 - p * M[i]) * A[i] + p * M[i] * A1[i];}}
                        else {for (let i = 0; i < A.length; ++i) {A[i] = (1 - p * (1 - M[i])) * A[i] + p * (1 - M[i]) * A1[i];}}
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
                  A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, channel);
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
                     A[i] = M[i] * A[i] + (1 - M[i]) * this.stretch.calculateStretch(A[i], undefined,undefined, false, channel);
                  }
               }
               else
               {
                  for ( let i = 0; i < A.length; ++i )
                  {
                     A[i] = (1 - M[i]) * A[i] + M[i] * this.stretch.calculateStretch(A[i], undefined,undefined, false, channel);
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
                     A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, c);
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
                     for ( let i = 0; i < A.length; ++i ) {A[i] = M[i] * A[i] + (1 - M[i]) * this.stretch.calculateStretch(A[i], undefined,undefined, false, c);}
                  }
                  else
                  {
                     for ( let i = 0; i < A.length; ++i ) {A[i] = (1 - M[i]) * A[i] + M[i] * this.stretch.calculateStretch(A[i], undefined,undefined, false, c);}
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
               A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, 0);
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
               A[i] = this.stretch.calculateStretch(A[i], undefined,undefined, false, 0);
            }
            this.previewImage.setSamples( A, new Rect, 1 );
            this.previewImage.colorSpace = cs;

            this.previewImage.setLightness(lstImg);
            lstImg.free();
         }

         if (this.stretch.stretchParameters.channelSelector[6])                //Luminance (as arcsinh)
         {
            let lumCoefficients = this.dialog.getLumCoefficients();
            let lR = lumCoefficients[0];
            let lG = lumCoefficients[1];
            let lB = lumCoefficients[2];

            this.previewImage.getSamples( A, new Rect, 0 );
            this.previewImage.getSamples( A1, new Rect, 1 );
            this.previewImage.getSamples( A2, new Rect, 2 );

            if (this.dialog.optionParameters.colourClip == "Rescale")
            {
               for ( let i = 0; i < A.length; ++i )
               {
                  let l = lR * A[i] + lG * A1[i] + lB * A2[i];
                  let sl = this.stretch.calculateStretch(l, undefined, undefined, false, 0);

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
                  let sl = this.stretch.calculateStretch(l, undefined, undefined, false, 0);

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

      this.invalidPreview = false;
      this.lastStretchKey = longStretchKey(this.stretch, this.targetView) + this.imageSelection.toString();
      this.repaint();
      processEvents();
      this.stretching = false;

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

      if (this.showPreview)
      {
         let bmp = this.previewImage.render(1, false, false)
         if (this.targetView.id != "") this.targetView.window.applyColorTransformation(bmp);
         g.drawBitmap(this.viewPort().leftTop, bmp);
         bmp.clear();
         if (this.invalidPreview && this.crossActive)
         {
            g.pen = new Pen(getColourCode( this.crossColour ));
            g.drawLine(this.viewPort().leftTop, this.viewPort().rightBottom);
            g.drawLine(this.viewPort().rightTop, this.viewPort().leftBottom);
         }
      }
      else
      {
         let bmp = this.originalImage.render(1, false, false)
         if (this.targetView.id != "") this.targetView.window.applyColorTransformation(bmp);
         g.drawBitmap(this.viewPort().leftTop, bmp);
         bmp.clear();
         if (this.invalidPreview && this.crossActive)
         {
            g.pen = new Pen(getColourCode( this.crossColour ));
            g.drawLine(this.viewPort().leftTop, this.viewPort().rightBottom);
            g.drawLine(this.viewPort().rightTop, this.viewPort().leftBottom);
         }
      }

      if (this.dragging) {g.fillRect(this.dragRect(), new Brush(0x20ffffff));}

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
         this.repaint();
      }
   }

   this.onMouseRelease = function(x, y, button, buttonState, modifiers)
   {
      if (this.dragging)
      {
         if (this.dragRect().area > 1)
         {
            let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
            let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);

            let nisX0 = isL + this.imageSelection.width * (this.dragRect().left - this.viewPort().left) / this.viewPort().width;
            let nisY0 = isT + this.imageSelection.height * (this.dragRect().top - this.viewPort().top) / this.viewPort().height;
            let nisX1 = isL + this.imageSelection.width * (this.dragRect().right - this.viewPort().left) / this.viewPort().width;
            let nisY1 = isT + this.imageSelection.height * (this.dragRect().bottom - this.viewPort().top) / this.viewPort().height;

            this.imageSelection = new Rect(nisX0, nisY0, nisX1, nisY1);

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
            this.stretchPreview();
         }
         this.dragFrom = new Point();
         this.dragTo = new Point();
         this.dragging = false;
         this.repaint();
      }
   }
}
ControlPreview.prototype = new Frame;
