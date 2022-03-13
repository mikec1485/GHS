
 /*
 * *****************************************************************************
 *
 * LOG DIALOG
 * This dialog forms part of the GeneralisedHyperbolicStretch.js
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

#include "GHSLog.js"

function DialogLog(ghsStretchLog) {
   this.__base__ = Dialog;
   this.__base__();

   // let the dialog be resizable
   this.userResizable = true;
   this.minWidth = 700;

   this.windowTitle = "Log Viewer"
   this.startDate = new Date;

   var logStrings = new Array
   this.displayString = "";

   this.refresh = function(ghsStretchLog)
   {
      // Build string array containing the log information
      logStrings = new Array

      logStrings.push("<b>");
      logStrings.push("GHS Log");
      logStrings.push("</b>");
      logStrings.push("<br>");

      logStrings.push("Session start time: " + ghsStretchLog.sessionStart.toLocaleDateString() + ": " + ghsStretchLog.sessionStart.toLocaleTimeString());
      logStrings.push("<br>");

      var creationDate = new Date;
      logStrings.push("Log creation time:  " + creationDate.toLocaleDateString() + ": " + creationDate.toLocaleTimeString());
      logStrings.push("<br>");


      for (var imgIndex = 0; imgIndex < ghsStretchLog.itemCount(); ++imgIndex)
      {
         //Heading for a new image
         logStrings.push("<br>");
         logStrings.push("<b>");
         logStrings.push(ghsStretchLog.items[imgIndex].imageId);
         logStrings.push("</b>");
         logStrings.push("<br>");

         for (var strIndex = 0; strIndex < Math.max(1, ghsStretchLog.items[imgIndex].nextIndex); ++strIndex)
         {
            if (strIndex == 0)
            {
               logStrings.push("Initial state: ");
               //logStrings.push(stretchName);
               logStrings.push("<br>");
            }
            else
            {
               logStrings.push("Stretch " + strIndex.toString() + ": ");
               //logStrings.push(stretchName);
               logStrings.push("<br>");
            }
            logStrings.push(ghsStretchLog.items[imgIndex].stretches(strIndex));
            logStrings.push("<br>");
         }
      }


      // Concatenate log information strings into a single string for display
      this.displayString = ""
      for (var i = 0; i < logStrings.length; ++i) {this.displayString += logStrings[i];}
      this.logView.text = this.displayString;
   }



   // Define log viewer text box
   this.logView = new TextBox(this);
   this.logView.readOnly = true;
   this.refresh(ghsStretchLog);


   //Define file save button
   this.fileSaveButton = new PushButton( this );
   this.fileSaveButton.text = "Save"
   this.fileSaveButton.toolTip = "Reset all parameters to default values";
   this.fileSaveButton.onClick = function(){
      let sfd = new SaveFileDialog;
      sfd.overwritePrompt = true;
      sfd.caption = "Save log";

      if ( sfd.execute() )
      {
         var saveFileName = sfd.fileName;
         var saveFile = new File();
         saveFile.createForWriting(saveFileName);

         for (var i = 0; i < logStrings.length; ++i)
         {
            var s = logStrings[i]
            if ((s == "<b>") || (s == "</b>")) {}  // do nothing
            else if (s == "<br>") {saveFile.outTextLn("");}
            else {saveFile.outText(s);}
         }

         saveFile.close();
      }
   }

   // Define a close dialog button
   this.closeButton = new PushButton( this )
   this.closeButton.text = "Close"
   this.closeButton.onClick = function(){
      this.dialog.ok();}



   // Layout dialog
   this.buttons = new HorizontalSizer( this );
   this.buttons.add(this.fileSaveButton);
   this.buttons.addStretch();
   this.buttons.add(this.closeButton);

   this.sizer = new VerticalSizer();
   this.sizer.add(this.logView);
   this.sizer.addSpacing(16);
   this.sizer.add(this.buttons);
   this.sizer.addSpacing(16);
}
DialogLog.prototype = new Dialog;
