
 /*
 * *****************************************************************************
 *
 * STRETCH PARAMETER OBJECT
 * This object forms part of the GeneralisedHyperbolicStretch.js
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


function GHSStretchParameters() {
   this.__base__ = Object;
   this.__base__();

   this.version = "";
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
   this.colourClip = "Clip";     // can be "Clip" or "Rescale"
   this.lumCoeffSource = "Default"; // can be "Default", "Image", or "Manual"
   this.lumCoefficients = [1, 1, 1];

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
   this.default_colourClip = "Clip";     // can be "Clip" or "Rescale"
   this.default_lumCoeffSource = "Default"; // can be "Default", "Image", or "Manual"
   this.default_lumCoefficients = [1, 1, 1];


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

   this.channelNames = ["Red",
                        "Green",
                        "Blue",
                        "RGB/K",
                        "Lightness",
                        "Saturation",
                        "Colour"];

   this.getChannelNumber = function()
   {
      for (let i = 0; i < 7; ++i)
      {
         if (this.channelSelector[i]) return i;
      }
      return 3;   //catch all RGB/K
   }

   this.getChannelName = function()
   {
      return this.channelNames[this.getChannelNumber()];
   }

   this.isInvertible = function()
   {
      // Certain transformations are not invertible.
      // This function determines whether the current parameters are invertible.
      let returnValue = true;
      let stn = this.STN();
      // if (this.getChannelNumber() > 3) returnValue = false;
      if (stn == "Image Inversion") returnValue = false;
      if (stn == "Image Blend" && (this.combinePercent == 100)) returnValue = false;
      if (stn == "STF Transformation") returnValue = false;
      // if (stn == "Linear Stretch") returnValue = false;
      return returnValue;
   }

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
      returnValue += ", Channel number:" + this.getChannelNumber().toString();
      returnValue += ", Channel name:" + this.getChannelName();

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

   this.getLumCoefficients = function(view)
   {
      let lR = (1 / 3);
      let lG = (1 / 3);
      let lB = (1 / 3);
      if ((this.lumCoeffSource == "Image") && (view != undefined))
      {
         if (view.id != "")
         {
            let rgbWS = view.window.rgbWorkingSpace;
            lR = rgbWS.Y[0];
            lG = rgbWS.Y[1];
            lB = rgbWS.Y[2];
         }
      }
      if (this.lumCoeffSource == "Manual")
      {
         let lRx = this.lumCoefficients[0];
         let lGx = this.lumCoefficients[1];
         let lBx = this.lumCoefficients[2];
         let total = lRx + lGx + lBx;
         if (total != 0)
         {
            lR = lRx / total;
            lG = lGx / total;
            lB = lBx / total;
         }
      }
      return [lR, lG, lB];
   }

   this.validate = function(view)
   {
      let returnValue = "";

      if ((this.ST < 0) || (!(this.ST < this.stretchNames.length))) returnValue = "invalid parameter ST = " + this.ST.toString();

      if (view != undefined)
      {
         if ((view.image.isGrayscale) && (!(this.channelSelector[3]))) returnValue = "grayscale image can only transform RGB/K channel";
      }

      if ((this.STN() == "Generalised Hyperbolic Stretch") || (this.STN() == "Histogram Transformation") || (this.STN() == "Arcsinh Stretch"))
      {
         if (this.D < 0) returnValue = "invalid parameter D = " + this.D.toString();
         if ((this.SP < 0) || (this.SP > 1)) returnValue = "invalid parameter SP = " + this.SP.toString();
         if ((this.LP < 0) || (this.LP > 1)) returnValue = "invalid parameter LP = " + this.LP.toString();
         if ((this.HP < 0) || (this.HP > 1)) returnValue = "invalid parameter HP = " + this.HP.toString();
         if (this.LP > this.SP) returnValue = "invalid parameters LP > SP";
         if (this.SP > this.HP) returnValue = "invalid parameters SP > HP";
         if (this.Inv && !this.isInvertible()) returnValue = "invalid parameter Inv = true, transformation is not invertible";
         if ((this.colourClip != "Clip") && (this.colourClip != "Rescale")) returnValue = "invalid parameter colourClip must be Clip or Rescale";
         if ((this.lumCoeffSource != "Default") && (this.lumCoeffSource != "Image") && (this.lumCoeffSource != "Manual"))
         {returnValue = "invalid parameter lumCoeffSource must be Default, Image or Manual";}
         if ((this.lumCoefficients[0] < 0) || (this.lumCoefficients[1] < 0) || (this.lumCoefficients[2] < 0))
         {returnValue = "invalid parameter lumcoefficients must not be less than zero";}
         if ((this.lumCoefficients[0] + this.lumCoefficients[1] + this.lumCoefficients[2]) == 0)
         {returnValue = "invalid parameter lumcoefficients at least one coefficient must be greater than zero";}
      }

      if (this.STN() == "Linear Stretch")
      {
         if (!(this.BP < this.WP)) returnValue = "invalid parameters BP >= WP";
      }

      if (this.STN() == "Image Blend")
      {
         if (view != undefined)
         {
            if (this.channelSelector[4] || this.channelSelector[5] || this.channelSelector[6]) returnValue = "image blend only permitted on RGB channels";
            if ((this.combinePercent < 0) || (this.combinePercent > 100)) returnValue = "invalid combine percentage = " + this.combinePercent.toString() + "%";
            let combView = View.viewById(this.combineViewId);
            if (combView.id == "")
            {
               returnValue = "combine view not available: " + this.combineViewId;
            }
            else
            {
               if (!view.window.isMaskCompatible(combView.window)) returnValue = "target view incompatible with combine view: " + this.combineViewId;
            }
         }
      }

      if (this.STN() == "STF Transformation")
      {
         if (this.channelSelector[4] || this.channelSelector[5] || this.channelSelector[6]) returnValue = "STF transformation only permitted on RGB channels";
      }



      return returnValue
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
      this.colourClip = this.default_colourClip;
      this.lumCoeffSource = this.default_lumCoeffSource;
      this.lumCoefficients = new Array(this.default_lumCoefficients[0], this.default_lumCoefficients[1], this.default_lumCoefficients[2]);
   }

   // stores the current parameter values into the script instance
   this.save = function() {
      Parameters.clear();
      Parameters.set("scriptName", "Generalised Hyperbolic Stretch");
      Parameters.set("version", this.version);
      Parameters.set("transformationType", this.STN());
      Parameters.set("channel", this.getChannelName());
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
      Parameters.set("invert",(this.Inv && this.isInvertible()));

      let cx = 3;
      for (let i = 0; i < 7; ++i) {if (this.channelSelector[i]) cx = i;}

      Parameters.set("channelNumber",cx);
      Parameters.set("createNewImage",this.createNewImage);
      Parameters.set("newImageId",this.newImageId);
      Parameters.set("colourClip", this.colourClip);
      Parameters.set("lumCoeffSource", this.lumCoeffSource);
      Parameters.set("lumCoeffR", this.lumCoefficients[0]);
      Parameters.set("lumCoeffG", this.lumCoefficients[1]);
      Parameters.set("lumCoeffB", this.lumCoefficients[2]);
   }

   // loads the script instance parameters
   this.load = function() {
      if (Parameters.has("version")) this.version = Parameters.getString("version");
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
      if (Parameters.has("combinePercent")) this.combinePercent = Parameters.getReal("combinePercent");
      if (Parameters.has("invert")) this.Inv = Parameters.getBoolean("invert");

      let cx = 3;
      if (Parameters.has("channelNumber")) cx = Parameters.getInteger("channelNumber");
      for (let i = 0; i < 7; ++i)
      {
         if (cx == i) this.channelSelector[i] = true;
         else this.channelSelector[i] = false;
      }

      if (Parameters.has("createNewImage")) this.createNewImage = Parameters.getBoolean("createNewImage");
      if (Parameters.has("newImageId")) this.newImageId = Parameters.getString("newImageId");
      if (Parameters.has("colourClip")) this.colourClip = Parameters.getString("colourClip");
      if (Parameters.has("lumCoeffSource")) this.lumCoeffSource = Parameters.getString("lumCoeffSource");
      if (Parameters.has("lumCoeffR")) this.lumCoefficients[0] = Parameters.getReal("lumCoeffR");
      if (Parameters.has("lumCoeffG")) this.lumCoefficients[1] = Parameters.getReal("lumCoeffG");
      if (Parameters.has("lumCoeffB")) this.lumCoefficients[2] = Parameters.getReal("lumCoeffB");
   }
}
GHSStretchParameters.prototype = new Object;
