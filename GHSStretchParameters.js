
 /*
 * *****************************************************************************
 *
 * STRETCH PARAMETER OBJECT
 * This object forms part of the GeneralisedHyperbolicStretch.js
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


function GHSStretchParameters() {
   this.__base__ = Object;
   this.__base__();

   this.ST = 0;      // stretch type
   this.D = 0.0;     // stretch amount
   this.b = 0.0;     // stretch intensity
   this.SP = 0.0;    // focus point
   this.HP = 1.0;    // highlight protection
   this.LP = 0.0;    // shadow protection
   this.BP = 0.0;    // black point
   this.WP = 1.0;    // white point
   this.linked = false;// indicates whether an STF stretch should link channels or not
   this.combineViewId = "";   // specifies the view to combine with the target view for Combination stretch type
   this.combinePercent = 0;   // percentage of combineView to combine into target image
   this.Inv  = false;  // indicates whether to use inverse function
   this.channelSelector = new Array(false, false, false, true, false, false, false); // which channels to stretch
   this.createNewImage = false;
   this.newImageId = "<Auto>";

   // define a function (and its inverse) to convert the D parameter to a value for use in calculations
   this.convFacD = 1.0;
   this.convertD = function(D) { return Math.exp(this.convFacD * D) -1.0;};
   this.invConvertD = function(D) { return Math.ln(1.0 + D) / this.convFacD;};

   // define default values for each of the stretch parameters
   this.default_ST = 0;      // stretch type
   this.default_D = 0.0;     // stretch amount
   this.default_b = 0.0;     // stretch intensity
   this.default_SP = 0.0;    // focus point
   this.default_HP = 1.0;    // highlight protection
   this.default_LP = 0.0;    // shadow protection
   this.default_BP = 0.0;    // black point
   this.default_WP = 1.0;    // white point
   this.default_linked = false;
   this.default_combineViewId = "";
   this.default_combinePercent = 0;
   this.default_Inv = false;

   // define user friendly names for each parameter
   this.name_ST = "Transformation type (ST)";
   this.name_D = "Stretch factor (ln(D+1))";
   this.name_b = "Local stretch intensity (b)";
   this.name_SP = "Symmetry point (SP)";
   this.name_HP = "Highlight prot. point (HP)";
   this.name_LP = "Shadow prot. point (LP)";
   this.name_BP = "Black point (BP)";
   this.name_WP = "White point (WP)";
   this.name_linked = "Linked STF";
   this.name_combineViewId = "View to blend";
   this.name_combinePercent = "Blending percent";

   // define a level of precision for each parameter
   this.DPrecision = 2;
   this.bPrecision = 2;
   this.LPSPHPPrecision = 5;
   this.BPWPPrecision = 4;

   this.stretchNames = ["Generalised Hyperbolic Stretch",
                        "Histogram Transformation",
                        "Arcsinh Stretch",
                        "Linear Stretch",
                        "Image Inversion",
                        "Image Blend",
                        "STF Transformation"];

   this.getStretchKey = function(includeCNI = false)
   {
      var returnValue = "STN:" + this.stretchNames[this.ST];
      returnValue += ", ST:" + this.ST.toString();

      let STN = this.STN();

      if (STN == "Generalised Hyperbolic Stretch")
      {
         returnValue += ", D:" + this.D.toFixed(this.DPrecision);
         returnValue += ", b:" + this.b.toFixed(this.bPrecision);
         returnValue += ", SP:" + this.SP.toFixed(this.LPSPHPPrecision);
         returnValue += ", HP:" + this.HP.toFixed(this.LPSPHPPrecision);
         returnValue += ", LP:" + this.LP.toFixed(this.LPSPHPPrecision);
      }

      if ( (STN == "Histogram Transformation") || (STN == "Arcsinh Stretch") )
      {
         returnValue += ", D:" + this.D.toFixed(this.DPrecision);
         returnValue += ", SP:" + this.SP.toFixed(this.LPSPHPPrecision);
         returnValue += ", HP:" + this.HP.toFixed(this.LPSPHPPrecision);
         returnValue += ", LP:" + this.LP.toFixed(this.LPSPHPPrecision);
      }

      if (STN == "Linear Stretch")
      {
         returnValue += ", BP:" + this.BP.toFixed(this.BPWPPrecision);
         returnValue += ", WP:" + this.WP.toFixed(this.BPWPPrecision).toString();
      }

      if (STN == "Image Blend")
      {
         returnValue += ", Blend view:" + this.combineViewId;
         returnValue += ", Blend percent:" + this.combinePercent.toFixed(0);
      }

      if (STN == "STF Transformation")
      {
         returnValue += ", linked:" + this.linked.toString();
      }

      returnValue += ", Inverse:" + this.Inv.toString();
      returnValue += ", Red:" + this.channelSelector[0].toString();
      returnValue += ", Green:" + this.channelSelector[1].toString();
      returnValue += ", Blue:" + this.channelSelector[2].toString();
      returnValue += ", RGB/K:" + this.channelSelector[3].toString();
      returnValue += ", L*:" + this.channelSelector[4].toString();
      returnValue += ", Sat:" + this.channelSelector[5].toString();
      returnValue += ", Col:" + this.channelSelector[6].toString();
      if (includeCNI)
      {
         returnValue += ", CreateNewImage:"+ this.createNewImage.toString();
         returnValue += ", newImageId:"+ this.newImageId.toString();
      }

      return returnValue;
   }

   this.STN = function()
   {
      let returnValue = this.stretchNames[this.ST];
      return returnValue;
   }

   this.getStretchName = function(p)   // p is an integer or a stretchKey string
   {
      let lookupST = this.ST;
      if (p != undefined)
      {
         if ( (typeof p) == "number" ) lookupST = p;
         if ( (typeof p) == "string" ) lookupST = ((p.split(", "))[0].split(":"))[1].toInt();
      }
      return this.stretchNames[lookupST];
   }

   this.reset = function() {
      this.ST = this.default_ST;
      this.D = this.default_D;
      this.b = this.default_b;
      this.SP = this.default_SP;
      this.HP = this.default_HP;
      this.LP = this.default_LP;
      this.BP = this.default_BP;
      this.WP = this.default_WP;
      this.linked = this.default_linked;
      this.combineViewId = this.default_combineViewId;
      this.combinePercent = this.default_combinePercent;
      this.Inv = this.default_Inv;
      this.channelSelector[0] = false;
      this.channelSelector[1] = false;
      this.channelSelector[2] = false;
      this.channelSelector[3] = true;
      this.channelSelector[4] = false;
      this.channelSelector[5] = false;
      this.channelSelector[6] = false;
      this.createNewImage = false;
      this.newImageId = "<Auto>";
   }

   // stores the current parameter values into the script instance
   this.save = function() {
      Parameters.set("ST", this.ST);
      Parameters.set("D", this.D);
      Parameters.set("b", this.b);
      Parameters.set("SP", this.SP);
      Parameters.set("HP", this.HP);
      Parameters.set("LP", this.LP);
      Parameters.set("BP",this.BP);
      Parameters.set("WP",this.WP);
      Parameters.set("linked",this.linked);
      Parameters.set("combineViewId", this.combineViewId);
      Parameters.set("combinePercent", this.combinePercent);
      Parameters.set("Inv",this.Inv);
      Parameters.set("C0",this.channelSelector[0]);
      Parameters.set("C1",this.channelSelector[1]);
      Parameters.set("C2",this.channelSelector[2]);
      Parameters.set("C3",this.channelSelector[3]);
      Parameters.set("C4",this.channelSelector[4]);
      Parameters.set("C5",this.channelSelector[5]);
      Parameters.set("C6",this.channelSelector[6]);
      Parameters.set("createNewImage",this.createNewImage);
      Parameters.set("newImageId",this.newImageId);
   }

   // loads the script instance parameters
   this.load = function() {
      if (Parameters.has("ST")) this.ST = Parameters.getReal("ST");
      if (Parameters.has("D")) this.D = Parameters.getReal("D");
      if (Parameters.has("b")) this.b = Parameters.getReal("b");
      if (Parameters.has("SP")) this.SP = Parameters.getReal("SP");
      if (Parameters.has("HP")) this.HP = Parameters.getReal("HP");
      if (Parameters.has("LP")) this.LP = Parameters.getReal("LP");
      if (Parameters.has("BP")) this.BP = Parameters.getReal("BP");
      if (Parameters.has("WP")) this.WP = Parameters.getReal("WP");
      if (Parameters.has("linked")) this.linked = Parameters.getBoolean("linked");
      if (Parameters.has("combineViewId")) this.combineViewId = Parameters.getString("combineViewId");
      if (Parameters.has("combinePercent")) this.combinePercent = Parameters.getBoolean("combinePercent");
      if (Parameters.has("Inv")) this.Inv = Parameters.getBoolean("Inv");
      if (Parameters.has("C0")) this.channelSelector[0] = Parameters.getBoolean("C0");
      if (Parameters.has("C1")) this.channelSelector[1] = Parameters.getBoolean("C1");
      if (Parameters.has("C2")) this.channelSelector[2] = Parameters.getBoolean("C2");
      if (Parameters.has("C3")) this.channelSelector[3] = Parameters.getBoolean("C3");
      if (Parameters.has("C4")) this.channelSelector[4] = Parameters.getBoolean("C4");
      if (Parameters.has("C5")) this.channelSelector[5] = Parameters.getBoolean("C5");
      if (Parameters.has("C6")) this.channelSelector[6] = Parameters.getBoolean("C6");
      if (Parameters.has("createNewImage")) this.createNewImage = Parameters.getBoolean("createNewImage");
      if (Parameters.has("newImageId")) this.newImageId = Parameters.getString("newImageId");
   }
}
GHSStretchParameters.prototype = new Object;
