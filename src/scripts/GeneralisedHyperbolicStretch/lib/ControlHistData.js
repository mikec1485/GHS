
 /*
 * *****************************************************************************
 *
 * HISTOGRAM DATA CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.1
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


function ControlHistData()
{
   this.__base__ = Control;
   this.__base__();

   this.resolution = 1 << 16;
   this.histograms = new Array(new Histogram(this.resolution), new Histogram(this.resolution), new Histogram(this.resolution));
   this.channelCount = 1;

   this.initParams = function(histArray, channelCount)
   {
      this.channelCount = channelCount;
      this.histograms = histArray;
   }

   // size the font to fit the labels
   let sizingLabel = new Label( this );
   let labelWidth = 40;
   sizingLabel.width = labelWidth;
   let labelFont = getSizedFont(sizingLabel, "Total Count");
   sizingLabel.hide();

   var rowCount = 7;
   var colCount = 4;

   var histTableArray = new Array(new Array( 28 ), new Array( 28 ), new Array( 28 ));
   for (let channel = 0; channel < 3; ++channel)
   {
      for (let row = 0; row < rowCount; ++row) {
         for (let col = 0; col < colCount; ++col) {
            let cellNumber = colCount * row + col
            histTableArray[channel][cellNumber] = new Label( this );
            histTableArray[channel][cellNumber].width = labelWidth;
            histTableArray[channel][cellNumber].text = "";
            histTableArray[channel][cellNumber].useRichText = true;
            histTableArray[channel][cellNumber].sizingLabel = labelFont;
         }
      }
   }

   var histTableRows = [new Array( 7 ), new Array( 7 ), new Array( 7 )];
   var histDataPages = [new Control( this ), new Control( this ), new Control( this )];

   for (let channel = 0; channel < 3; ++channel)
   {
      histDataPages[channel].sizer = new VerticalSizer( this );
      for (let row = 0; row < rowCount; ++row) {
         histTableRows[channel][row] = new HorizontalSizer( this );
         for (let col = 0; col < colCount; ++col) {
            histTableRows[channel][row].add(histTableArray[channel][colCount * row + col]);
            if ((Math.round(row / 2) * 2) == row) {histTableArray[channel][colCount * row + col].backgroundColor = 0xffb8b8b8;}
            else {histTableArray[channel][colCount * row + col].backgroundColor = 0xffd0d0d0;}
         }
         histDataPages[channel].sizer.add(histTableRows[channel][row]);
      }
   }

   var histogramData = new TabBox( this )
   histogramData.insertPage(0, histDataPages[0], "R/K");
   histogramData.insertPage(1, histDataPages[1], "G");
   histogramData.insertPage(2, histDataPages[2], "B");

   var headingsColour = 0xff000000;
   for (let channel = 0; channel < 3; ++channel)
   {
      setHistTableArray(channel, 0, 0, "<b>Histogram</b>", headingsColour);
      setHistTableArray(channel, 0, 1, "<b>Level</b>", headingsColour);
      setHistTableArray(channel, 0, 2, "<b>Norm level</b>", headingsColour);
      setHistTableArray(channel, 0, 3, "<b>Count</b>", headingsColour);
      setHistTableArray(channel, 1, 0, "<b>Left</b>", headingsColour);
      setHistTableArray(channel, 2, 0, "<b>Peak</b>", headingsColour);
      setHistTableArray(channel, 3, 0, "<b>Right</b>", headingsColour);
      setHistTableArray(channel, 4, 0, "<b>Selected</b>", headingsColour);
      setHistTableArray(channel, 5, 0, "<b>Resolution</b>", headingsColour);
      setHistTableArray(channel, 6, 0, "<b>Total count</b>", headingsColour);
   }

   this.sizer = new VerticalSizer
   this.sizer.add(histogramData);

   function setHistTableArray(channel, row, col, text, colour = 0xff000000) {
      histTableArray[channel][row * colCount + col].textColor = colour;
      histTableArray[channel][row * colCount + col].text = text;
   }

   this.updateTable = function(selected)
   {
      for (let channel = 0; channel < this.channelCount; ++channel)
      {
         let histRes = this.histograms[channel].resolution;
         let totalCount = this.histograms[channel].totalCount;
         let zeroCount = this.histograms[channel].count(0);
         let maxLevel = this.histograms[channel].peakLevel;
         let maxCount = this.histograms[channel].peakCount;
         let maxNormLevel = this.histograms[channel].normalizedPeakLevel;
         let endLevel = histRes - 1;
         let endNormLevel = 1.0 * endLevel / (histRes - 1);
         let endCount = this.histograms[channel].count(endLevel);

         setHistTableArray(channel, 1, 1, "0");
         setHistTableArray(channel, 1, 2, "0.00000");
         setHistTableArray(channel, 1, 3, zeroCount.toString());
         setHistTableArray(channel, 2, 1, maxLevel.toString());
         setHistTableArray(channel, 2, 2, maxNormLevel.toFixed(5));
         setHistTableArray(channel, 2, 3, maxCount.toString());
         setHistTableArray(channel, 3, 1, endLevel.toString());
         setHistTableArray(channel, 3, 2, endNormLevel.toFixed(5));
         setHistTableArray(channel, 3, 3, endCount.toString());
         setHistTableArray(channel, 5, 1, histRes.toString());
         setHistTableArray(channel, 6, 3, totalCount.toString());

         this.setSelected(selected);
      }

      if (this.channelCount == 3)
      {
         histogramData.enablePage(0);
         histogramData.enablePage(1);
         histogramData.enablePage(2);
      }
      else
      {
         histogramData.enablePage(0);
         histogramData.disablePage(1);
         histogramData.disablePage(2);
      }
   }

   this.setSelected = function(selected)
   {
      if (selected == undefined)
      {
         for (let channel = 0; channel < this.channelCount; ++channel)
         {
            setHistTableArray(channel, 4, 1, "");
            setHistTableArray(channel, 4, 2, "");
            setHistTableArray(channel, 4, 3, "");
         }
      }
      else
      {
         for (let channel = 0; channel < this.channelCount; ++channel)
         {
            let level = Math.floor(selected[channel] * this.histograms[channel].resolution);
            let normLevel = selected[channel];
            let count = this.histograms[channel].count(level)
            setHistTableArray(channel, 4, 1, level.toString());
            setHistTableArray(channel, 4, 2, normLevel.toFixed(5));
            setHistTableArray(channel, 4, 3, count.toString());
         }
      }
   }

   this.clearTable = function(message1 = "", message2 = "")
   {
      for (let row = 1; row < rowCount; ++row) {
         for (let col = 1; col < colCount; ++col) {
            for (let channel = 0; channel < 3; ++channel)
            {
               setHistTableArray(channel, row, col, "");
            }
         }
      }
      setHistTableArray(0, 3, 2, message1);
      setHistTableArray(0, 4, 2, message2);
      histogramData.enablePage(0);
      histogramData.disablePage(1);
      histogramData.disablePage(2);
   }
}
ControlHistData.prototype = new Control;
