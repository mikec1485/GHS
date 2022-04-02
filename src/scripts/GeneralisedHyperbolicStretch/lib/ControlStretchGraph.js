
 /*
 * *****************************************************************************
 *
 * STRETCH GRAPH CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.1.0
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


function ControlStretchGraph()
{
   this.__base__ = Frame;
   this.__base__();

   this.stretch = new GHSStretch();
   this.targetView = new View();
   this.views = new GHSViews();

   this.histArrays = undefined;
   this.cumHistArrays = undefined;
   this.resolution = undefined;
   this.channelCount = undefined;

   this.suspendGraphUpdating = false;
   this.isBusy = false;

   this.graphHGridCount = 4;
   this.graphVGridCount = 4;
   this.graphLineWidth = 2;
   this.refLineWidth = 1;

   this.graphRange = 1.0;
   this.graphMidValue = 0.0;
   this.graphZoomCentre = 0.0;
   this.clickLevel = -1;
   this.logHistogram = false;

   this.graphHistActive = new Array(true, true);
   this.graphHistCol = new Array("Light grey", "Mid grey");
   this.graphHistType = new Array("Draw", "Fill");
   this.graphRGBHistCol = new Array("Light","Mid");
   this.graphLineCol = "Red";
   this.graphRef1Col = "Mid grey";
   this.graphRef2Col = "Cyan";
   this.graphGridCol = "Mid grey";
   this.graphBackCol = "Dark grey";
   this.graphLineActive = true;
   this.graphRef1Active = true;
   this.graphRef2Active = true;
   this.graphGridActive = true;
   this.graphBlockActive = true;
   this.blockHeight = .1;


   this.getColour = function( ofWhat )
   {
      var c = "None"
      switch (ofWhat)
      {
         case "Histogram": c = this.graphHistCol[0]; break;
         case "Stretched Histogram": c = this.graphHistCol[1]; break;
         case "Stretch": c = this.graphLineCol; break;
         case "Reference1": c = this.graphRef1Col; break;
         case "Reference2": c = this.graphRef2Col; break;
         case "Grid": c = this.graphGridCol; break;
         case "Background": c = this.graphBackCol; break;
      }
      return this.getColourCode(c);
   }

   this.getColourCode = function( colour )
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


   //-----------------------
   // graph onPaint function|
   //-----------------------

   this.onPaint = function( x0, y0, x1, y1 )
   {
      if (this.suspendGraphUpdating) return;
      this.isBusy = true;

      this.stretch.recalcIfNeeded(this.targetView);
      let stretchParameters = this.stretch.stretchParameters;
      let isInvertible = stretchParameters.isInvertible();
      let channels = this.dialog.channels();
      if (this.graphBlockActive) {this.blockHeight = 0.1;}
      else {this.blockHeight = 0.0;}

      // Graph geometry
      let vDim = this.height;
      let hDim = this.width;
      let gMid = this.graphMidValue;
      let gRange = this.graphRange;
      let gRes = hDim;

      // Set background colour for the graph
      var g = new VectorGraphics(this);
      g.fillRect(0, 0, hDim, vDim, new Brush(this.getColour("Background")));
      g.end();

      // Graph horizontal axis variables
      let startX = gMid - 0.5 * gRange;
      let endX = startX + gRange;
      if (startX < 0.0)
      {
         startX = 0.0;
         endX = gRange;
      }
      if (endX > 1.0)
      {
         startX = 1.0 - gRange;
         endX = 1.0
      }
      let stepX = (endX - startX) / gRes;
      let stepCount = Math.floor(1 / stepX);
      let startY = Math.floor(startX / stepX);
      let endY = Math.floor(endX / stepX);

      // Plot histogram and stretched histogram
      if ( !(this.targetView.id == "") )
      {

         // get initial histogram information
         let histArrays = this.histArrays;
         let cumHistArrays = this.cumHistArrays;
         let channelCount = this.channelCount;
         let histRes = this.views.getHistData(0)[0][0].resolution;

         let normFac = [0, 0, 0];
         let normStretchFac = [0, 0, 0];

         let histColour = new Array;
         histColour.push(this.getColour("Histogram"));
         histColour.push(this.getColour("Stretched Histogram"));

         let histType = this.graphHistType;
         let rgbCol = this.graphRGBHistCol;
         let histActive = this.graphHistActive;

         // intialise histogram plot arrays histPlot[n] holds three channels of: (n = 0: unstretched), or (n = 1: stretched), histogram
         let histPlot = new Array([new Array, new Array, new Array], [new Array, new Array, new Array]);

         for (let c = 0; c < channels.length; ++c)
         {
            let histArrayc = this.views.getHistData(0)[1][channels[c]];
            let cumHistArrayc = this.views.getHistData(0)[2][channels[c]];

            // create plot array and calculate maximum count for normalisation
            if ( histActive[0] ) {
               let x = 0;
               let intH = Math.floor(x * (histRes - 1));
               let fracH = Math.frac(x * (histRes - 1));
               let cumH0 = cumHistArrayc[intH]
               if (intH < histRes - 1)
               {
                  if (histArrayc[intH + 1] == undefined)
                  {
                     Console.writeln("histArrayc[intH + 1] == undefined");
                     Console.writeln("histArrayc.length: ", histArrayc.length);
                     Console.writeln("intH: ", intH);
                     Console.writeln("this.views.getHistData(0)[0][0].resolution: ", this.views.getHistData(0)[0][0].resolution);
                     Console.writeln("[channels[c]]: ", [channels[c]]);
                  }
                  cumH0 += fracH * histArrayc[intH + 1];
               }
               let cumH1 = 0;
               for (let i = 0; i < stepCount + 1; ++i)
               {
                  x = (i + 1) * stepX;
                  intH = Math.floor(x * (histRes - 1));
                  fracH = Math.frac(x * (histRes - 1));
                  if (intH < histRes - 1) cumH1 = cumHistArrayc[intH] + fracH * histArrayc[intH + 1];
                  else cumH1 = cumHistArrayc[intH];
                  histPlot[0][c][i] = cumH1 - cumH0;
                  cumH0 = cumH1;
               }
               normFac[c] =  Math.maxElem(histPlot[0][c].slice(1, histPlot[0][c].length - 2));}

            //create stretch plot array and calculate maximum count for normalisation
            if ( histActive[1] )
            {
               var maskActive = ((this.targetView.window.mask.mainView.id != "") &&  this.targetView.window.maskEnabled);
               var histAvailable = this.views.histogramsAvailable(1);

               if (histAvailable)
               {
                  histArrayc = this.views.getHistData(1)[1][channels[c]];
                  cumHistArrayc = this.views.getHistData(1)[2][channels[c]];

                  let x = 0;
                  let intH = Math.floor(x * (histRes - 1));
                  let fracH = Math.frac(x * (histRes - 1));
                  let cumH0 = cumHistArrayc[intH]
                  if (intH < histRes - 1) cumH0 += fracH * histArrayc[intH + 1];
                  let cumH1 = 0;
                  for (let i = 0; i < stepCount + 1; ++i)
                  {
                     x = (i + 1) * stepX;
                     intH = Math.floor(x * (histRes - 1));
                     fracH = Math.frac(x * (histRes - 1));
                     if (intH < histRes - 1) cumH1 = cumHistArrayc[intH] + fracH * histArrayc[intH + 1];
                     else cumH1 = cumHistArrayc[intH];
                     histPlot[1][c][i] = cumH1 - cumH0;
                     cumH0 = cumH1;
                  }
                  normStretchFac[c] = Math.maxElem(histPlot[1][c].slice(1, histPlot[1][c].length - 2));
               }
               else if ((!maskActive) && (stretchParameters.STN() != "Image Blend"))
               {
                  let chNum = stretchParameters.getChannelNumber();
                  if (((chNum < 3) && (c == chNum)) || (chNum >2))   //ie if this is a channel we need to stretch
                  {
                     //calculate an array holding required reversed unstretched values
                     let unstretched = this.stretch.calculateStretch(0, stepX, stepCount + 1, true, channels[c], isInvertible);
                     unstretched.push(unstretched[stepCount - 1]);

                     if ((stretchParameters.STN() == "STF Transformation") && (!stretchParameters.linked))
                     {
                        unstretched = this.stretch.calculateStretch(0, stepX, stepCount + 1, true, channels[c], isInvertible);
                        unstretched.push(unstretched[stepCount - 1]);
                     }

                     let cumH0 = 0;
                     let cumH1 = 0;
                     let x = unstretched[0];
                     if (x < 0)
                     {
                        cumH0 = 0;
                     }
                     if (!(x < 0) && !(x > 1))
                     {
                        let intH = Math.floor(x * (histRes - 1));
                        let fracH = Math.frac(x * (histRes - 1));
                        cumH0 = cumHistArrayc[intH];
                        if (intH < histRes - 1) cumH0 += fracH * histArrayc[intH + 1];
                     }
                     if (x > 1)
                     {
                        cumH0 = cumHistArrayc[histRes - 1];
                     }
                     for (let i = 0; i < stepCount + 1; ++i)
                     {
                        x = unstretched[i + 1];
                        if (x < 0)
                        {
                           cumH1 = 0;
                        }
                        if (!(x < 0) && !(x > 1))
                        {
                           let intH = Math.floor(x * (histRes - 1));
                           let fracH = Math.frac(x * (histRes - 1));
                           if (intH < histRes - 1) cumH1 = cumHistArrayc[intH] + fracH * histArrayc[intH + 1];
                           else cumH1 = cumHistArrayc[intH];
                        }
                        if (x > 1)
                        {
                           cumH1 = cumHistArrayc[histRes - 1];
                        }
                        histPlot[1][c][i] = Math.abs(cumH1 - cumH0);
                        cumH0 = cumH1;
                     }
                     normStretchFac[c] = Math.maxElem(histPlot[1][c].slice(1, histPlot[1][c].length - 2));
                  }
                  else     // ie if this is a channel that does not need stretching
                  {
                     for (let i = 0; i < stepCount + 1; ++i)
                     {
                        histPlot[1][c][i] = histPlot[0][c][i];
                     }
                     normStretchFac[c] = normFac[c];
                  }
               }
            }
         }

         let maxNormFac =  new Array;
         maxNormFac.push(Math.maxElem(normFac));
         maxNormFac.push(Math.maxElem(normStretchFac));

         // modify plot arays if user wants a logarithmic plot otherwise just normalise data
         for (let c = 0; c < channels.length; ++c)
         {
            for (let h = 0; h < 2; ++h)
            {
               let lnMaxNormFac = Math.ln(1 + maxNormFac[h]);
               for (let i = 0; i < histPlot[h][c].length; ++i)
               {
                  if (this.logHistogram) {histPlot[h][c][i] = Math.ln(1.0 + (histPlot[h][c][i])) / lnMaxNormFac;}
                  else {histPlot[h][c][i] = histPlot[h][c][i] / maxNormFac[h];}
               }
            }
         }

         // plot any filled histograms first
         for (let H = 0; H < 2; ++H)                                                   // iterate between unstretched and stretched histograms
         {
            if ( (histType[H] == "Fill") && (maxNormFac[H] > 0) && (histActive[H]) )   // type is "fill", there's something to plot and we have been asked to plot it
            {
               if (channels.length == 1)                                               // greyscale image or luminance or saturation channel
               {
                  //if ( (H == 0) || (stretchParameters.channelSelector[3]) )          // it is either the unstretched histogram or it is stretched and the user has selected this channel
                  //{
                     let g = new VectorGraphics(this);
                     g.antialiasing = true;
                     g.pen = new Pen(histColour[H], 1);

                     let barHeight = 0;
                     for (let i = 0; i < hDim; ++i)
                     {
                        barHeight = vDim * histPlot[H][0][startY + i];
                        g.drawLine(i, (1  - this.blockHeight) * vDim, i, (1  - this.blockHeight) * (vDim - barHeight));
                     }
                     g.end();
                  //}
               }
               else                                                                    // rgb image
               {
                  let pens = new Array;
                  if (rgbCol[H] == "Light")
                  {
                     pens.push(new Pen(this.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(this.getColourCode("Light red"), 1)); //Index 1: colour red
                     pens.push(new Pen(this.getColourCode("Light green"), 1)); //Index 2: colour green
                     pens.push(new Pen(this.getColourCode("Light yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(this.getColourCode("Light blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(this.getColourCode("Light magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(this.getColourCode("Light cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(this.getColourCode("Light grey"), 1)); //Index 7: colour red, green and blue = grey
                  }
                  else if (rgbCol[H] == "Mid")
                  {
                     pens.push(new Pen(this.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(this.getColourCode("Mid red"), 1)); //Index 1: colour red
                     pens.push(new Pen(this.getColourCode("Mid green"), 1)); //Index 2: colour green
                     pens.push(new Pen(this.getColourCode("Mid yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(this.getColourCode("Mid blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(this.getColourCode("Mid magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(this.getColourCode("Mid cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(this.getColourCode("Mid grey"), 1)); //Index 7: colour red, green and blue = grey
                  }
                  else
                  {
                     pens.push(new Pen(this.getColourCode("None"), 1)); //Index 0: colour black
                     pens.push(new Pen(this.getColourCode("Red"), 1)); //Index 1: colour red
                     pens.push(new Pen(this.getColourCode("Green"), 1)); //Index 2: colour green
                     pens.push(new Pen(this.getColourCode("Yellow"), 1)); //Index 3: colour red and green = yellow
                     pens.push(new Pen(this.getColourCode("Blue"), 1)); //Index 4: colour blue
                     pens.push(new Pen(this.getColourCode("Magenta"), 1)); //Index 5: colour red and blue = magenta
                     pens.push(new Pen(this.getColourCode("Cyan"), 1)); //Index 6: colour green and blue = cyan
                     pens.push(new Pen(this.getColourCode("Mid grey"), 1)); //Index 7: colour red, green and blue = grey
                  }

                  let barHeight = new Array(0, 0, 0)
                  for (let i = 0; i < hDim; ++i)
                  {
                     for (let channel = 0; channel < 3; ++channel)
                     {
                        barHeight[channel] = vDim * histPlot[H][channel][startY + i];
                     }
                     //let includeChannel = new Array;
                     //includeChannel.push((H == 0) || (stretchParameters.channelSelector[0]) || (stretchParameters.channelSelector[3]))
                     //includeChannel.push((H == 0) || (stretchParameters.channelSelector[1]) || (stretchParameters.channelSelector[3]))
                     //includeChannel.push((H == 0) || (stretchParameters.channelSelector[2]) || (stretchParameters.channelSelector[3]))

                     let g = new VectorGraphics(this);
                     g.antialiasing = true;
                     for (let j = 0; j < vDim; ++j)
                     {
                        let plotColour = 0;
                        plotColour += (barHeight[0] >= j) //  * includeChannel[0];
                        plotColour += (barHeight[1] >= j) * 2 //  * includeChannel[1];
                        plotColour += (barHeight[2] >= j) * 4 //  * includeChannel[2];
                        switch (stretchParameters.getChannelNumber())
                        {
                           case 0: if (barHeight[0] >= j) plotColour = 1; break;
                           case 1: if (barHeight[1] >= j) plotColour = 2; break;
                           case 2: if (barHeight[2] >= j) plotColour = 4; break;
                           default:
                        }

                        //if (stretchParameters.channelSelector[0] && (barHeight[0] >= j)) plotColour = 1;
                        //else if (stretchParameters.channelSelector[1] && (barHeight[1] >= j)) plotColour = 2;
                        //else if (stretchParameters.channelSelector[2] && (barHeight[2] >= j)) plotColour = 4;

                        g.pen = pens[plotColour];
                        g.drawPoint(i, (1  - this.blockHeight) * (vDim - j));
                     }
                     g.end();
                  }
               }//end rgb image
            }//end fill type histogram
         }//end histogram iteration

         // now plot any outline histograms
         for (let H = 0; H < 2; ++H) // iterate between unstretched and stretched histograms
         {
            if ( (histType[H] == "Draw") && (maxNormFac[H] > 0) && (histActive[H]) )   // the type is "draw", there is something to plot and we have been asked to plot it
            {
               if (channels.length == 1)                                               // greyscale image or luminance or saturation channel
               {
                  //if ( (H == 0) || (stretchParameters.channelSelector[3]) )          // it is either the unstretched histogram or it is stretched and the user has selected this channel
                  //{
                     let g = new VectorGraphics(this);
                     g.antialiasing = true;
                     g.pen = new Pen(histColour[H], 1);

                     let plotPoint = new Point;
                     let lastPlotPoint = new Point;
                     for (let i = 0; i < hDim; ++i)
                     {
                        plotPoint = new Point(i, Math.round((1 - this.blockHeight) * (vDim * (1.0 - histPlot[H][0][startY + i]))));
                        if (i > 0) g.drawLine(lastPlotPoint, plotPoint);
                        lastPlotPoint = plotPoint;
                     }
                     g.end();
                  //}
               }//end greyscale image
               else                                                                    // it is an rgb colour image
               {
                  for (let c = 0; c < channels.length; ++c)                         // iterate channels
                  {
                     if ( (H == 0) || stretchParameters.channelSelector[c] || stretchParameters.channelSelector[3])
                                                                                       // it is either the unstretched histogram or it is stretched and the user has selected this channel
                     {
                        let plotColour;
                        if (rgbCol[H] == "Light")
                        {
                           switch (c)
                           {
                              case 0: plotColour = this.getColourCode("Light red"); break;
                              case 1: plotColour = this.getColourCode("Light green"); break;
                              case 2: plotColour = this.getColourCode("Light blue"); break;
                              plotColour = this.getColour("Stretched Histogram");
                           }
                        }
                        else if (rgbCol[H] == "Mid")
                        {
                           switch (c)
                           {
                              case 0: plotColour = this.getColourCode("Mid red"); break;
                              case 1: plotColour = this.getColourCode("Mid green"); break;
                              case 2: plotColour = this.getColourCode("Mid blue"); break;
                              plotColour = this.getColour("Stretched Histogram");
                           }
                        }
                        else
                        {
                           switch (c)
                           {
                              case 0: plotColour = this.getColourCode("Red"); break;
                              case 1: plotColour = this.getColourCode("Green"); break;
                              case 2: plotColour = this.getColourCode("Blue"); break;
                              plotColour = this.getColour("Stretched Histogram");
                           }
                        }

                        let g = new VectorGraphics(this);
                        g.antialiasing = true;
                        g.pen = new Pen(plotColour, 1);

                        let plotPoint = new Point;
                        let lastPlotPoint = new Point;
                        for (let i = 0; i < hDim; ++i)
                        {
                           plotPoint = new Point(i, Math.round((1 - this.blockHeight) * (vDim * (1.0 - histPlot[H][c][startY + i]))));
                           if (i > 0) g.drawLine(lastPlotPoint, plotPoint);
                           lastPlotPoint = plotPoint;
                        }
                        g.end();
                     }
                  }//end channel
               }//end rgb image
            }//end draw type histogram
         }//end histogram iteration
      }//end histogram block


      // Draw the grid
      if (this.graphGridActive)
      {
         let g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(this.getColour("Grid"));
         let hGridStep = hDim / this.graphHGridCount;
         let vGridStep = vDim / this.graphVGridCount;
         for (let i = 0; i < this.graphHGridCount; ++i)
         {
            let s = i * hGridStep;
            g.drawLine(s, (1  - this.blockHeight) * vDim, s, 0);
         }
         for (let i = 0; i < this.graphVGridCount + 1; ++i)
         {
            let s = i * (1  - this.blockHeight) * vGridStep;
            g.drawLine(0, s, hDim, s);
         }
         g.end();
      }


      // Plot reference line indicating a neutral or identity stretch
      if (this.graphRef1Active)
      {
         let g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(this.getColour("Reference1"), this.refLineWidth);
         g.drawLine(0, (1.0 - startX) * vDim * (1 - this.blockHeight), hDim, (1.0 - endX) * vDim * (1 - this.blockHeight));
         g.end();
      }

      // Plot a reference line showing where the graph was last clicked
      if ( (this.graphRef2Active) && !(this.clickLevel < 0.0) )
      {
         let g = new VectorGraphics(this);
         g.antialiasing = true;
         g.pen = new Pen(this.getColour("Reference2"), this.refLineWidth);
         let clickX = this.clickLevel;
         if ( !(clickX < startX) && !(clickX > endX) )
         {
            g.drawLine(hDim * (clickX - startX) / (endX - startX), (1 - this.blockHeight) * vDim, hDim * (clickX - startX) / (endX - startX), 0);
         }
         g.end();
      }

      // Plot the stretch transformation graph
      let stretchValues = new Array();
      if (this.graphLineActive && !(stretchParameters.STN() == "Image Blend"))
      {
         let g = new VectorGraphics(this);
         g.antialiasing = true;

         if ((stretchParameters.STN() == "STF Transformation") && (!stretchParameters.linked) && (this.targetView.image.isColor))
         {
            let colourArray = [0xffff0000, 0xff00ff00, 0xff0000ff];

            for(let c = 0; c < 3; ++c)
            {
               if (stretchParameters.channelSelector[c] || stretchParameters.channelSelector[3])
               {
                  stretchValues = this.stretch.calculateStretch(startX, stepX, hDim + 1, false, c, isInvertible);
                  g.pen = new Pen(colourArray[c], this.graphLineWidth);
                  let xOld = startX;
                  let yOld = (1 - stretchValues[0]) * vDim * (1 - this.blockHeight);
                  for (let i = 0; i < hDim; ++i)
                  {
                     let x = startX + stepX * (i + 1.0);
                     let xNew = (i + 1);
                     let y = stretchValues[i + 1];
                     let yNew = (1.0 - y) * vDim * (1 - this.blockHeight);
                     g.drawLine(xOld, yOld, xNew, yNew);
                     xOld = xNew;
                     yOld = yNew;
                  }
               }
            }
         }
         else
         {
            stretchValues = this.stretch.calculateStretch(startX, stepX, hDim + 1, false, 0, isInvertible);
            g.pen = new Pen(this.getColour("Stretch"), this.graphLineWidth);
            let xOld = startX;
            let yOld = (1 - stretchValues[0]) * vDim * (1 - this.blockHeight);
            for (let i = 0; i < hDim; ++i)
            {
               let x = startX + stepX * (i + 1.0);
               let xNew = (i + 1);
               let y = stretchValues[i + 1];
               let yNew = (1.0 - y) * vDim * (1 - this.blockHeight);
               g.drawLine(xOld, yOld, xNew, yNew);
               xOld = xNew;
               yOld = yNew;
            }
         }
         g.end();
      }

      //Draw the stretch block
      if (this.graphBlockActive && !(stretchParameters.STN() == "Image Blend") &&
         !((stretchParameters.STN() == "STF Transformation") && (!stretchParameters.linked) && (this.targetView.image.isColor)))
      {
         let g = new VectorGraphics(this);
         g.antialiasing = true;

         for (let i = 0; i < hDim; ++i)
         {
            let unstretchGrey = Math.floor(255 * (startX + (i + 1) * stepX));
            let stretchGrey = Math.floor(255 * stretchValues[i + 1]);
            let unstretchCol = Color.rgbaColor(unstretchGrey, unstretchGrey, unstretchGrey, 255);
            let stretchCol = Color.rgbaColor(stretchGrey, stretchGrey, stretchGrey, 255);
            let x = (i + 1);
            let y0 = (1.0 - this.blockHeight) * vDim;
            let y1 = (1.0 - 0.5 * this.blockHeight) * vDim;
            let y2 = vDim;
            g.pen = new Pen(stretchCol, 1);
            g.drawLine(x, y0, x, y1);
            g.pen = new Pen(unstretchCol, 1);
            g.drawLine(x, y1, x, y2);
         }

         g.end();
      }

      //Draw a message
      if ((!histAvailable) && (maskActive || (stretchParameters.STN() == "Image Blend")))
      {
         let textStrings = new Array();
         textStrings.push("Unable to show predicted histogram");
         if (maskActive) textStrings.push("when a mask is enabled.");
         if (stretchParameters.STN() == "Image Blend") textStrings.push("when Image Blend transformation selected.");
         textStrings.push("Press refresh button to generate and display");
         textStrings.push("transformed histogram data.");

         let g = new VectorGraphics(this);
         g.textAntialiasing = true;
         g.pen = new Pen(0xffffff00,1);

         let textRects = new Array();
         let textHeight = 0;
         for (let i = 0; i < textStrings.length; ++i)
         {
            let nextRect = g.font.tightBoundingRect(textStrings[i]);
            textHeight += nextRect.height;
            textRects.push(nextRect);
         }

         let nextY = (this.height * (1 - this.blockHeight) - textHeight) / 2;
         for (let i = 0; i < textStrings.length; ++i)
         {
            let x0 = 0
            let y0 = nextY;
            let x1 = this.width
            let y1 = y0 + textRects[i].height;
            g.drawTextRect(x0, y0, x1, y1, textStrings[i], 0x84);
            nextY = y1;
         }

         g.end();
      }

      this.isBusy = false;
   }

   //----------------------------
   // graph mouse click  function|
   //----------------------------

   this.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      var p  = x / this.width;
      var currentMidValue = this.graphMidValue;
      var currentRange = this.graphRange;
      var currentMinValue = currentMidValue - 0.5 * currentRange;
      var currentMaxValue = currentMidValue + 0.5 * currentRange;
      if (currentMinValue < 0.0) currentMinValue = 0.0;
      if (currentMaxValue > 1.0) currentMinValue = 1.0 - currentRange;
      this.clickLevel = currentMinValue + p  * currentRange;
      this.dialog.updateControls();
   }

   //----------------------------------
   // graph mouse double click function|
   //----------------------------------

   this.onMouseDoubleClick = function(x, y, button, buttonState, modifiers)
   {   // Centre the pan control at the click point
      var p  = x / this.width;
      var currentMidValue = this.graphMidValue;
      var currentRange = this.graphRange;
      var currentMinValue = currentMidValue - 0.5 * currentRange;
      var currentMaxValue = currentMidValue + 0.5 * currentRange;
      if (currentMinValue < 0.0) currentMinValue = 0.0;
      if (currentMaxValue > 1.0) currentMinValue = 1.0 - currentRange;
      var newMidValue = currentMinValue + p  * currentRange;
      this.dialog.panControl.setValue(newMidValue);
      this.graphMidValue = newMidValue;
      this.dialog.updateControls();
   }
}
ControlStretchGraph.prototype = new Frame;
