
 /*
 * *****************************************************************************
 *
 * VIEWS OBJECT
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


function GHSViews(view){
   this.__base__ = Object;
   this.__base__();

   /*-----------------------------
   View Index
   0: Target view
   1: Stretched view
   2: Target view with STF (linked)
   3: Stretched view with STF (linked)
   4: Target view with STF (unlinked)
   5: Stretched view with STF (unlinked)
   -------------------------------*/

   this.views = new Array;
   this.views.push(new View);
   this.bitmaps = new Array;
   this.histograms = new Array;
   this.histArrays = new Array;
   this.cumHistArrays = new Array;
   this.lastStretchParametersKey = "";
   this.dialog = undefined;

   this.stretch = new GHSStretch();

   this.histogramsAvailable = function(i)
   {
      if (i == 0)
      {
         if (this.histograms[0] == undefined) {return false;}
         else {return true;}
      }
      if (i == 1)
      {
         if (longStretchKey(this.stretch, this.views[0]) != this.lastStretchParametersKey) {return false;}
         if (this.histograms[i] == undefined) {return false;}
         else {return true;}
      }
      return false;
   }

   this.setView = function(view, histData)
   {
      this.tidyUp();
      this.views = new Array;
      this.bitmaps = new Array;
      this.histograms = new Array;
      this.lastStretchParametersKey = "";
      if (view != undefined)
      {
         this.views[0] = view;
      }
      else
      {
         this.views[0] = new View();
      }
      if (histData != undefined)
      {
         this.histograms[0] = histData[2];
         this.histArrays[0] = histData[3];
         this.cumHistArrays[0] = histData[4];
      }
   }

   this.checkStretchParameters = function()
   {
      if (longStretchKey(this.stretch, this.views[0]) != this.lastStretchParametersKey)
      {
         this.tidyUp([1, 3, 5]);
      }
   }

   this.getView = function(i)
   {
      if (this.views[0] == undefined) {return undefined;}

      this.checkStretchParameters();

      if (this.views[i] == undefined)
      {
         switch (i)
         {
            case 1:
               {
                  Console.show();
                  let cni = this.stretch.stretchParameters.createNewImage;
                  this.stretch.stretchParameters.createNewImage = true;
                  this.stretch.recalcIfNeeded(this.views[0]);
                  this.views[1] = this.stretch.executeOn(this.views[0], false);
                  this.stretch.stretchParameters.createNewImage = cni;
                  this.lastStretchParametersKey = longStretchKey(this.stretch, this.views[0]);
                  Console.hide();
                  break;
               }
            case 2:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(0), true);
                  this.views[2] = this.stretch.applyPixelMath(this.getView(0), expr, "ghsImage", false);
                  Console.hide();
                  break;
               }
            case 3:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(1), true);
                  this.views[3] = this.stretch.applyPixelMath(this.getView(1), expr, "ghsImage", false);
                  Console.hide();
                  break;
               }
            case 4:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(0), false);
                  this.views[4] = this.stretch.applyPixelMath(this.getView(0), expr, "ghsImage", false);
                  Console.hide();
                  break;
               }
            case 5:
               {
                  Console.show();
                  var expr = generatePixelMathAutoSTF(this.getView(1), false);
                  this.views[5] = this.stretch.applyPixelMath(this.getView(1), expr, "ghsImage", false);
                  Console.hide();
                  break;
               }
         }
      }
      return this.views[i];
   }

   this.getBitmap = function(i)
   {
      this.checkStretchParameters();
      if (this.bitmaps[i] == undefined)
      {
         this.bitmaps[i] = this.getView(i).image.render();
         if (this.views[0] != "") {this.views[0].window.applyColorTransformation(this.bitmaps[i]);}
      }
      return this.bitmaps[i];
   }

   this.getHistData = function(i)
   {
      this.checkStretchParameters();
      if (this.histograms[i] == undefined)
      {
         let lumCoeffs = this.stretch.stretchParameters.getLumCoefficients(this.getView(i));
         let histData = calculateHistograms(this.getView(i), lumCoeffs);
         this.histograms[i] = histData[2];
         this.histArrays[i] = histData[3];
         this.cumHistArrays[i] = histData[4];
      }
      return [this.histograms[i], this.histArrays[i], this.cumHistArrays[i]];
   }

   this.tidyUp = function(viewNumbers){
      // close any copy views no longer needed (note view 0 is the targetView)
      if (viewNumbers == undefined)
      {
         for (var i = 1; i < this.views.length; ++i)
         {
            if (this.views[i] != undefined)
            {
               if ((this.views[i].id != "") && (this.views[i].id != this.views[0].id)) {this.views[i].window.forceClose();}
               this.views[i] = undefined;
               this.bitmaps[i] = undefined;
               if (i == 1)
               {
                  this.histograms[i] = undefined;
                  this.histArrays[i] = undefined;
                  this.cumHistArrays[i] = undefined;
               }
            }
         }
      }
      else
      {
         for (var i = 0; i < viewNumbers.length; ++i)
         {
            if (this.views[viewNumbers[i]] != undefined)
            {
               if ((this.views[viewNumbers[i]].id != "") && (this.views[viewNumbers[i]].id != this.views[0].id))
               {
                  this.views[viewNumbers[i]].window.forceClose();
               }
               this.views[viewNumbers[i]] = undefined;
               this.bitmaps[viewNumbers[i]] = undefined;
               if (viewNumbers[i] < 2)
               {
                  this.histograms[viewNumbers[i]] = undefined;
                  this.histArrays[viewNumbers[i]] = undefined;
                  this.cumHistArrays[viewNumbers[i]] = undefined;
               }
            }
         }
      }
   }
}
