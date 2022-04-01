
 /*
 * *****************************************************************************
 *
 * PARAMETER INPUT CONTROL
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


function ControlParamInput(value, min, max, precision, text, minWidth)
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

   // create D reset button
   this.resetButton = new ToolButton(this);
   this.resetButton.icon = this.scaledResource( ":/icons/clear.png" );
   this.resetButton.setScaledFixedSize( 24, 24 );

   // layout D controls
   this.sizer = new HorizontalSizer( this )
   this.sizer.spacing = 4;
   this.sizer.add(this.numControl);
   this.sizer.add(this.resetButton);

}
ControlParamInput.prototype = new Control;
