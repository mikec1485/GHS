
 /*
 * *****************************************************************************
 *
 * MODULE NOTICE DIALOG
 * This dialog forms part of the GeneralisedHyperbolicStretch.js
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

function DialogModuleNotice(optionParameters) {
   this.__base__ = Dialog;
   this.__base__();

   // let the dialog be resizable
   this.userResizable = true;
   this.minWidth = 500;
   this.windowTitle = "Notice"


   //-------------------------------------
   // check for presence of the GHS module|
   //-------------------------------------

   let moduleStatus = checkForModule();

   //----------------------------
   // define the readout text box|
   //----------------------------

   this.moduleNotice = new TextBox( this );
   this.moduleNotice.readOnly = true;
   this.moduleNotice.minWidth = 50;

   let versionId = CoreApplication.versionMajor*1e11
   + CoreApplication.versionMinor*1e8
   + CoreApplication.versionRelease*1e5
   + CoreApplication.versionRevision*1e2;

   let noticeText = "<b>GHS is now available as a process module</b><br><br>";

   if ( !(versionId < 100800900100) )
   {
      switch (moduleStatus)
      {
         case -1:
            noticeText += "Unable to detect status of the module on your system as your operating system is not recognised."
            break;
         case 0:
            noticeText += "To install the new module add: https://www.ghsastro.co.uk/updates, ";
            noticeText += "to the repository information in Resources>Updates>Manage Repositories. ";
            noticeText += "You will then be invited to download the module when you next start up PixInsight. ";
            noticeText += "Once it has downloaded you will need to restart PixInsight to install it.";
            break;
         case 1:
            noticeText += "The GHS module is already present in your PixInsight installation. ";
            noticeText += "Go to Process>IntensityTransformations>GeneralizedHyperbolicStretch to use it. ";
            break;
         case 2:
            noticeText += "The GHS module is present in your PixInsight installation but does not appear to be installed. ";
            noticeText += "To install it go to Process>Modules>Install Modules...";
            break;
         default:
            noticeText += "To install the new module add: https://www.ghsastro.co.uk/updates, ";
            noticeText += "to the repository information in Resources>Updates>Manage Repositories. ";
            noticeText += "You will then be invited to download the module when you next start up PixInsight. ";
            noticeText += "Once it has downloaded you will need to restart PixInsight to install it.";
      }
   }
   else
   {
      noticeText += "You will need to be running PixInsight 1.8.9-1 or later to use the GHS process module.";
   }

   noticeText += "<br><br>GHS will also continue to be available as a script as before.<\p>";

   this.moduleNotice.text = noticeText;

   //-----------------------------------
   // create "don't show again" checkbox|
   //-----------------------------------

   this.supressModuleNoticeCheck = new CheckBox( this );
   this.supressModuleNoticeCheck.text = "Do not show agan";
   this.supressModuleNoticeCheck.checked = optionParameters.supressModuleNotice;
   this.supressModuleNoticeCheck.toolTip =
         "<p>This notice can be turned back on in the preferences dialog.</p>";
   this.supressModuleNoticeCheck.onCheck = function( checked )
   {
      optionParameters.supressModuleNotice = checked;
   }

   //-----------------------------
   // Define a close dialog button|
   //-----------------------------

   this.closeButton = new PushButton( this )
   this.closeButton.text = "Close"
   this.closeButton.onClick = function(){
      this.dialog.ok();}

   //--------------
   // Layout dialog|
   //--------------

   this.sizer = new VerticalSizer();
   this.sizer.margin = 16;
   this.sizer.add(this.moduleNotice);
   this.sizer.addSpacing(16);
   this.sizer.add(this.supressModuleNoticeCheck);
   this.sizer.addSpacing(16);
   this.sizer.add(this.closeButton);

}
DialogModuleNotice.prototype = new Dialog;
