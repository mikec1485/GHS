 /*
 ****************************************************************************
 * GeneralisedHyperbolicStretch Utility
 *
 * GeneralisedHyperbolicStretch.js
 * Copyright (C) 2021, Mike Cranfield
 *
 * This script provides an environment within which to define, appraise and apply
 * a variety of different stretches to an image.  The stretches include a family
 * of stretches known as Generalised Hyperbolic stretches. The script has evolved
 * from a collaborative project between Mike Cranfield and Dave Payne.
 *
 * Script coding by Mike Cranfield.
 * Equations and documentation by Dave Payne.
 *
 * If you wish to contact either of us please do so
 * via the Pixinsight Forums (https://pixinsight.com/forum/).
 *
 * This product is based on software from the PixInsight project, developed
 * by Pleiades Astrophoto and its contributors (https://pixinsight.com/).
 *
 * Version history
 * 1.0   2021-12-09 first release
 * 2.0   yyyy-mm-dd
 *
 *
 ****************************************************************************
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


#feature-id    GeneralisedHyperbolicStretch : Utilities > GeneralisedHyperbolicStretch

#feature-info  This script provides an environment within which to define, appraise and apply \
a variety of different stretches to an image.  The stretches include a family of stretches \
known as Generalised Hyperbolic stretches.<br/>\
Copyright &copy; 2021, 2022 Mike Cranfield.

#define TITLE "GeneralisedHyperbolicStretch"
#define VERSION "2.0.0"

#include "lib/DialogGHSMain.js"
#include "lib/GHSUtilities.js"
#include "lib/GHSStretch.js"



/*******************************************************************************
 * *****************************************************************************
 *
 * FUNCTION MAIN
 *
 * Script entry point
 *
 * *****************************************************************************
 *******************************************************************************/

function main() {

   // hide the console
   Console.hide();

/*******************************************************************************
 * View context
 *******************************************************************************/
   if (Parameters.isViewTarget) {
      // load parameters
      let ghsStretch = new GHSStretch();
      ghsStretch.stretchParameters.load();
      ghsStretch.recalcIfNeeded();

      Console.show();
      ghsStretch.executeOn(Parameters.targetView);
      Console.hide();

      return;
   }

/*******************************************************************************
 * Global context
 *******************************************************************************/
   if (Parameters.isGlobalTarget) {
      let warnMessage = "Script cannot execute in global context";
      let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok )).execute();
      return;
   }

/*******************************************************************************
 * Direct context
 *******************************************************************************/
   let dialog = new DialogGHSMain();
   let dialogReturn = dialog.execute();
}

main();
