
/*
 ****************************************************************************
 * GeneralisedHyperbolicStretch Utility
 *
 * GeneralisedHyperbolicStretch.js
 * Copyright (C) 2021, 2022, Mike Cranfield
 *
 * This script provides an environment within which to define, appraise and apply
 * a variety of different stretches to an image.  The stretches include a family
 * of stretches known as Generalised Hyperbolic stretches. The script has evolved
 * from a collaborative project between Mike Cranfield and Dave Payne.
 *
 * Script coding by Mike Cranfield.
 * Equations and documentation by Dave Payne.
 *
 * If you wish to contact us you can do so by email at contact@ghsastro.co.uk.
 *
 * This product is based on software from the PixInsight project, developed
 * by Pleiades Astrophoto and its contributors (https://pixinsight.com/).
 *
 * Version history
 * 1.0     2021-12-09 first release v1
 * 2.0.0   2022-03-06 first release v2 with preview
 * 2.1.0   2022-04-02 miscellaneous updates
 * 2.2.0   2022-05-19 image enquiry added to preview
 * 2.2.1   2022-07-10 workaround for colour space change bug
 * 2.2.2   2022-08-10 corrected LCP and HCP calculations for single colour channel stretches
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
a variety of different stretches to an image.  The stretches include a family of equations \
known as Generalised Hyperbolic stretches.<br/>\
Copyright &copy; 2021, 2022 Mike Cranfield.

#define TITLE "GeneralisedHyperbolicStretch"
#define VERSION "2.2.2"

#include <pjsr/Sizer.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/SectionBar.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/Color.jsh>
#include <pjsr/ColorSpace.jsh>
#include <pjsr/ImageOp.jsh>
#include <pjsr/TextAlign.jsh>

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
   jsAutoGC = true;  // let PJSR handle automatic garbage collection - small performance hit is worth it as there could be lots of garbage produced by this script!
   let dialog = new DialogGHSMain();
   let dialogReturn = dialog.execute();

   dialog.previewTimer.stop();   //belt and braces - should be stopped in the dialog onHide event handler but no harm to catch here as well

   dialog.ghsViews.tidyUp();

   dialog.optionParameters.save(VERSION);
   if (dialog.optionParameters.saveLogCheck)
   {
      let warnMessage = "Do you want to save your log before leaving?";
      let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Question, StdButton_Yes, StdButton_No )).execute();
      if (msgReturn == StdButton_Yes)
      {
         let logViewDialog = new DialogLog(dialog.ghsLog);
         logViewDialog.execute();
      }
   }

   Console.writeln("Goodbye from GHS");
   Console.hide();
}

main();
