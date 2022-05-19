
 /*
 * *****************************************************************************
 *
 * PARAMETER INPUT CONTROL
 * This control forms part of the GeneralisedHyperbolicStretch.js
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


function ControlParamInput(value, min, max, precision, text, minWidth, stretchGraphLink)
{
   this.__base__ = Control;
   this.__base__();

   this.numControl = new NumericControl(this);
   this.numControl.label.text = text;
   this.numControl.label.minWidth = minWidth;
   this.numControl.setRange(min, max);
   this.numControl.setPrecision( precision );
   this.numControl.slider.setRange( 0, Math.pow10(precision) );
   this.numControl.setValue(value);

   // create reset button
   this.resetButton = new ToolButton(this);
   this.resetButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetButton.setScaledFixedSize( 24, 24 );

   // layout controls
   this.sizer = new HorizontalSizer( this )
   this.sizer.spacing = 4;
   this.sizer.add(this.numControl);

   // set up logic to link with the histogram
   if (stretchGraphLink != undefined)
   {
      // create histogram link button
      this.histLinkButton = new ToolButton(this);
      this.histLinkButton.icon = this.scaledResource( ":/icons/clear-inverted.png" );
      this.histLinkButton.setScaledFixedSize( 24, 24 );
      this.sizer.add(this.histLinkButton);

      this.histLinkButton.stretchGraph = stretchGraphLink;
      this.histLinkButton.toolTip = "<p><b>Histogram link</b> Clicking this button will transfer the histogram readout value " +
            "to this parameter. Shift-click will link the histogram readout value to this parameter, until released " +
            "by clicking this button. Changing transformation type will also release the link.</p>";
      this.histLinkButton.onMousePress = function(x, y, button, buttonState, modifiers)
      {
         if (this === this.stretchGraph.clickResetButton)
         {
            if (modifiers != KeyModifier_Shift)
            {
               this.stretchGraph.clickResetButton = undefined;
            }
         }
         else
         {
            if (modifiers == KeyModifier_Shift)
            {
               this.stretchGraph.clickResetButton = this;
            }
            else
            {
               this.stretchGraph.clickResetButton = undefined;
               this.updateParamValue();
            }
         }
         this.dialog.updateControls();
      }
   }

   this.sizer.add(this.resetButton);

}
ControlParamInput.prototype = new Control;
