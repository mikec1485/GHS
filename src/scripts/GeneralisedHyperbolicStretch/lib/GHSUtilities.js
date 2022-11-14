
 /*
 * *****************************************************************************
 *
 * UTILITY FUNCTIONS
 * These functions form part of the GeneralisedHyperbolicStretch.js
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


function checkForModule()
{
   //return values are:
   // -1: operating system not recognised
   //  0: no GHS module file found
   //  1: GHS module file found and installed
   //  2: GHS module file found but not installed

   let moduleFileName = CoreApplication.binDirPath;
   if (!moduleFileName.endsWith("/")) moduleFileName += "/";

   switch (CoreApplication.platform)
   {
      case "MacOSX":
         moduleFileName += "GeneralizedHyperbolicStretch-pxm.dylib";
         break;
      case "MSWindows":
         moduleFileName += "GeneralizedHyperbolicStretch-pxm.dll";
         break;
      case "Linux":
         moduleFileName += "GeneralizedHyperbolicStretch-pxm.so";
         break;
      default:
         return -1;
   }

   let moduleFileInfo = new FileInfo( moduleFileName );

   if (!moduleFileInfo.exists) return 0;

   let returnValue = 1;
   try
   {
      let tryGHS = new GeneralizedHyperbolicStretch();
   }
   catch(err)
   {
      returnValue = 2;
   }

   return returnValue;
}


function normCount(normLevel, channels, minOrMax, histograms, cumHistArrays)
{
   let clipCounts = new Array();
   for (let i = 0; i < channels.length; ++i)
   {
      let c = channels[i];
      if (!(normLevel < 1)) return 1;
      if (!(normLevel > 0)) return 0;
      let resolution = histograms[c].resolution;
      let totalCount = cumHistArrays[c][resolution - 1];
      let level = normLevel * resolution;
      let column = Math.floor(level);
      let frac = Math.frac(level);
      let cumHa0 = 0;
      if (column > 0) {cumHa0 = cumHistArrays[c][column - 1];}
      let count = cumHa0 + frac * (cumHistArrays[c][column] - cumHa0);
      clipCounts.push(count / totalCount);
   }
   if (minOrMax == "min") {return Math.minElem(clipCounts);}
   else {return Math.maxElem(clipCounts);}
}

function clipLow(normCount, channels, histograms, cumHistArrays)
{
   let clipLevels = new Array();
   for (let i = 0; i < channels.length; ++i)
   {
      let c = channels[i];
      if (normCount == 1) return 1;
      let resolution = histograms[c].resolution;
      let totalCount = cumHistArrays[c][resolution - 1];
      let count = normCount * totalCount;
      let x1 = histograms[c].clipLow(count);
      let level = x1;
      if (x1 == 0) {
         if (cumHistArrays[c][0] != 0) {level += count / cumHistArrays[c][0];}}
      if (x1 > 0) {
         if ((cumHistArrays[c][x1] - cumHistArrays[c][x1 - 1]) != 0) {
            level += (count -  cumHistArrays[c][x1 - 1]) / (cumHistArrays[c][x1] - cumHistArrays[c][x1 - 1]);}}
      clipLevels.push(level / resolution);
   }
   return Math.minElem(clipLevels);
}

function clipHigh(normCount, channels, histograms, cumHistArrays)
{
   let clipLevels = new Array();
   for (let i = 0; i < channels.length; ++i)
   {
      let c = channels[i];
      let resolution = histograms[c].resolution;
      let totalCount = cumHistArrays[c][resolution - 1];
      let clipCount = normCount * totalCount;
      let count = (1 - normCount) * totalCount;
      let x1 = histograms[c].clipHigh(clipCount);
      let level = x1;
      if (x1 == 0) {
         if (cumHistArrays[c][0] != 0) {level += count / cumHistArrays[c][0];}}
      if (x1 > 0) {
         if ((cumHistArrays[c][x1] - cumHistArrays[c][x1 - 1]) != 0) {
            level += (count -  cumHistArrays[c][x1 - 1]) / (cumHistArrays[c][x1] - cumHistArrays[c][x1 - 1]);}}
      clipLevels.push(level / resolution);
   }
   return Math.maxElem(clipLevels);
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


//---------------------------------
// size font to fit a given control|
//---------------------------------
function getSizedFont(control, string, lines = 1)
{
   var currentFont = control.font;
   var textSize = currentFont.boundingRect(string);
   var hRatio =  control.width / textSize.width;
   var vRatio = control.height / (lines * textSize.height);

   if ((hRatio < 1.0) || (vRatio < 1.0)) {
      var minRatio = Math.min(hRatio, vRatio);
      currentFont.pixelSize = Math.floor(minRatio * currentFont.pixelSize);}

   return currentFont;
}

//----------------------------------------------------------------------------------
// Pixinsight standard STF approach - calculation of histogram transformation matrix|
//----------------------------------------------------------------------------------

function getAutoSTFH(view, linked)
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
   var histTransforms = [new Array(), new Array()];

   var medians = new Vector(3);
   var mads = new Vector(3);
   for (let c = 0; c < channelCount; ++c)
   {
      medians.at(c, view.image.median(new Rect(), c, c));
      mads.at(c, view.image.MAD(medians.at(c), new Rect(), c, c));
   }

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

   // generate unlinked histogram transformation
   if (allInverted)
   {
      for (var row = 0; row < 5; ++row)
      {
         if (row < channelCount) {histTransforms[0].push([invC0[row], invM[row], invC1[row], 0.0, 1.0]);}
         else{histTransforms[0].push([0.0, 0.5, 1.0, 0.0, 1.0]);}
      }
   }
   else
   {
      for (var row = 0; row < 5; ++row)
      {
         if (row < channelCount) {histTransforms[0].push([c0[row], m[row], c1[row], 0.0, 1.0]);}
         else{histTransforms[0].push([0.0, 0.5, 1.0, 0.0, 1.0]);}
      }
   }

   // generate linked histogram transformation
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([lnkC0, lnkM, lnkC1, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);

   if (linked == undefined) {return histTransforms;}
   if (linked || (channelCount == 1)) {return histTransforms[1];}
   else {return histTransforms[0];}
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
      expr.push("mtf(" + m.toString() + ",($T-" + c0.toString() + ")*" + d.toString() + ")");
   }
   else
   {
      for (var i = 0; i < 3; ++i)
      {
         var c0 = H[i][0];
         var m = H[i][1];
         var c1 = H[i][2];
         var d = (1.0 / (c1 - c0));
         expr.push("mtf(" + m.toString() + ",($T-" + c0.toString() + ")*" + d.toString() + ")");
      }
      expr.push("");
   }
   return expr;
}

function calculateHistograms(view, lumCoefficients)
{
   let resolution = 1 << 16;
   let channelCount = 1;
   let histograms = [new Histogram(resolution), new Histogram(resolution), new Histogram(resolution), new Histogram(resolution), new Histogram(resolution), new Histogram(resolution)];
   let histArrays = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array()];
   let cumHistArrays = [new Array(), new Array(), new Array(), new Array(), new Array(), new Array()];

   if (view.id != "")
   {
      if (view.image.isColor)
      {
         channelCount = 5;
      }

      for (let c = 0; c < channelCount; ++c)
      {
         view.beginProcess(UndoFlag_NoSwapFile);
         let tempImg = new Image(view.image);

         if (c == 4) {  //Saturation
            tempImg.colorSpace = ColorSpace_HSV;
            tempImg.selectedChannel = 1;
            }
         if (c == 3) {  //Lightness
            tempImg.colorSpace = ColorSpace_CIELab;
            tempImg.selectedChannel = 0;
            }
         if (c < 3) {
            tempImg.selectedChannel = c;}
         histograms[c].generate( tempImg );

         tempImg.free();
         view.endProcess();

         histArrays[c] = histograms[c].toArray();

         cumHistArrays[c].push(histArrays[c][0]);
         for (let i = 1; i < resolution; ++i)
         {
            cumHistArrays[c].push(cumHistArrays[c][i - 1] + histArrays[c][i]);
         }
      }

      if (view.image.isColor)
      {
         let channel5Data = getLuminanceHistogram(view, lumCoefficients);
         histograms[5] = channel5Data[0];
         histArrays[5] = channel5Data[1];
         cumHistArrays[5] = channel5Data[2];
      }
   }

   let returnArray = new Array();

   returnArray.push(resolution);
   returnArray.push(Math.min(3, channelCount));
   returnArray.push(histograms);
   returnArray.push(histArrays);
   returnArray.push(cumHistArrays);

   return returnArray;
}

function getLuminanceHistogram(view, lumCoefficients)
{
   view.beginProcess(UndoFlag_NoSwapFile);

   let rgbws = view.window.rgbWorkingSpace;
   let g = rgbws.gamma;
   let sRgbG = rgbws.srgbGamma;
   let Y = rgbws.Y;
   let x = rgbws.x;
   let y = rgbws.y;

   let newG = 1;
   let newSrgbG = false;
   let newY = lumCoefficients;

   let newRgbws = new RGBColorSystem(newG, newSrgbG, newY, x, y);
   view.window.rgbWorkingSpace = newRgbws;

   let cs = view.image.colorSpace
   view.image.colorSpace = ColorSpace_CIEXYZ;
   view.image.selectedChannel = 1;

   let resolution = 1 << 16;
   let histogram = new Histogram(resolution);
   histogram.generate(view.image);

   view.image.colorSpace = cs;
   view.image.resetChannelSelection();
   view.window.rgbWorkingSpace = rgbws;

   view.endProcess();

   let histArray = histogram.toArray();

   let cumHistArray = new Array();
   cumHistArray.push(histArray[0]);
   for (let i = 1; i < resolution; ++i)
   {
      cumHistArray.push(cumHistArray[i - 1] + histArray[i]);
   }

   let returnArray = new Array();
   returnArray.push(histogram);
   returnArray.push(histArray);
   returnArray.push(cumHistArray);

   return returnArray;
}

function longStretchKey(stretch, view, part)
{
   let returnValue1 = stretch.stretchParameters.getStretchKey();
   let returnValue2 = "";
   if (view == undefined)
   {
      returnValue2 += ", Target view:undefined, Mask:undefined, Mask enabled:undefined, Mask inverted:undefined"
   }
   else
   {
      returnValue2 = ", Target view:" + view.id;
      returnValue2 += ", Mask:" + view.window.mask.mainView.id;
      returnValue2 += ", Mask enabled:" + view.window.maskEnabled;
      returnValue2 += ", Mask inverted:" + view.window.maskInverted;
   }

   if (part == 1) return returnValue1;
   if (part == 2) return returnValue2;

   return returnValue1 + returnValue2;
}

function getColourCode( colour )
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
}

function isValidViewId(idString)
{
   for (let i = 0; i < idString.length; ++i)
   {
      let charOK = false;
      let strChar = idString.charCodeAt(i);
      if ((strChar > 47) && (strChar < 58) && (i > 0)) charOK = true;
      if ((strChar > 64) && (strChar < 91)) charOK = true;
      if ((strChar > 96) && (strChar < 123)) charOK = true;
      if (strChar == 95) charOK = true;
      if (!charOK) return false;
   }
   return true;
}
