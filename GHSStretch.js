
 /*
 * *****************************************************************************
 *
 * STRETCH OBJECT
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


#include "GHSStretchParameters.js"

function GHSStretch()
{
   this.__base__ = Object;
   this.__base__();

   //--------------------------------------------------------------
   // STRETCHES: TABLE OF CONTENTS
   //
   // Special cases
   // 0. ST = 6: STF
   // 1. ST = 5: Image blend
   // 2. ST = 4: Image inversion
   // 3. ST = 3: Linear prestretch
   // 4. D = 0: No stretch
   //
   // Stretch types
   // 5. ST = 0: Generalised Hyperbolic
   // 5a. ST = 0, b = -1: Logarithmic
   // 5b. ST = 0, b < 0: Integral
   // 5c. ST = 0, b = 0: Exponential
   // 5d. ST = 0, b > 1: Hyperbolic, Harmonic, Super-hyperbolic
   // 6. ST = 1: Traditional histogram transformation
   // 7. ST = 2: Arcsinh stretch

   this.stretchParameters = new GHSStretchParameters();

   var messageSent = false;

   var a1, b1, a2, b2, c2, d2, e2, a3, b3, c3, d3, e3, a4, b4;

   var stfArray = new Array;
   var stfIsColour = false;

   this.dialog = undefined;

   var lastStretchKey = "";

   this.needsRecalc = function()
   {
      return ((lastStretchKey != this.stretchParameters.getStretchKey()) || (this.stretchParameters.STN() == "STF Transformation"));
   }

   this.recalcIfNeeded = function(view)
   {
      if (this.needsRecalc()) this.calculateVariables(view);
   }

   this.setStretchParameters = function( stretchParameters )
   {
      this.stretchParameters = stretchParameters;
      if (this.needsRecalc()) {this.calcVars();}
   }

   this.calculateStretch = function(x, stepx, stepCount, invert = false, channel = 0)
   {
      let runMode = "array";
      if (stepx == undefined)
      {
         runMode = "value";
         stepCount = 1;
         stepx = 1;  // this will be multipled by zero so any number will do!
      }

      let spInv = this.stretchParameters.Inv;
      if (invert != undefined)
      {
         if (invert) {spInv = !spInv;}
      }

      let ST = this.stretchParameters.ST;
      let STN = this.stretchParameters.STN();
      let linked = this.stretchParameters.linked;

      //------------------------------
      //0. If stretch is STF  (ST = 6)|
      //------------------------------

      if (STN == "STF Transformation")
      {
         let c = channel;
         if ( (linked) || (!stfIsColour) ) c = 3;

         if (!spInv)
         {
            var c0 = stfArray[c][0];
            var m = stfArray[c][1];
            var c1 = stfArray[c][2];
            var d = (1.0 / (c1 - c0));

            let returnValues = new Array();
            for (let i = 0; i < stepCount; ++i)
            {
               let z = x + i * stepx;
               returnValues.push(Math.mtf(m, (z - c0) / (c1 - c0)));
            }

            if (runMode == "value") return returnValues[0];
            else return returnValues;
         }
         else
         {
            //NOTE this is not a true inversion as the function is not invertible
            //this section of code is included as it is used in the graphical dispaly
            //where appropriate adjustments/allowances are made.
            let returnValues = new Array();
            var c0 = stfArray[c][0];
            var m = stfArray[c][1];
            var c1 = stfArray[c][2];
            var d = (1.0 / (c1 - c0));

            for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  returnValues.push(c0 + (c1 - c0) * Math.mtf(1 - m, z));
               }
            if (runMode == "value") return returnValues[0];
            else return returnValues;
         }
      }

      //--------------------------------------
      //1. If stretch is image blend  (ST = 5)|
      //--------------------------------------

      if (STN == "Image Blend")      // this is just a placeholder identity routine
      {
         if (runMode == "value")
         {
            return x;
         }
         if (runMode == "array")
         {
            let returnValues = new Array();
            for (let i = 0; i < stepCount; ++i)
            {
               let z = x + i * stepx;
               returnValues.push(z);
            }
            return returnValues;
         }
      }

      //------------------------------------------
      // 2. If stretch is image inversion (ST = 4)|
      //------------------------------------------
      if (STN == "Image Inversion")
      {
         let returnValues = new Array();
         for (let i = 0; i < stepCount; ++i)
         {
            let z = x + i * stepx;
            returnValues.push(1 - z);
         }
         if (runMode == "value") return returnValues[0];
         else return returnValues;
      }

      //-------------------------------------------------------------------------
      // 3. If stretch is a linear stretch to new black and white points (ST = 3)|
      //-------------------------------------------------------------------------
      let BP = this.stretchParameters.BP;
      let WP = this.stretchParameters.WP;
      if (STN == "Linear Stretch")
      {
         if (!spInv)
         {
            let returnValues = new Array();
            if (BP == WP)
            {
               for (let i = 0; i < stepCount; ++i)
               {
                  returnValues.push(0.0);
               }
            }
            else
            {
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  returnValues.push(Math.max(0, (Math.min(z, WP) - BP)) / (WP - BP));
               }
            }
            if (runMode == "value") return returnValues[0];
            else return returnValues;
         }
         else
         {
            //NOTE this is not a true inversion as the function is not invertible
            //this section of code is included as it is used in the graphical dispaly
            //where appropriate adjustments/allowances are made.  It is also used
            //where BP <= 0 and WP >= 1, if these conditions are met the function is
            //invertible.
            let returnValues = new Array();
            for (let i = 0; i < stepCount; ++i)
            {
               let z = x + i * stepx;
               let r = z * (WP - BP) + BP
               returnValues.push(Math.range(r, 0, 1));
            }
            if (runMode == "value") return returnValues[0];
            else return returnValues;
         }
      }

      //------------------------------------------------------------------------------------------------------------
      // 4. NO STRETCH: If there is no stretch amount then just return the input value, pre-stretched if appropriate|
      //------------------------------------------------------------------------------------------------------------
      let orgD = this.stretchParameters.D;
      let D = this.stretchParameters.convertD(orgD);
      if (D == 0.0)
      {
         if (runMode == "value")
         {
            return x;
         }
         if (runMode == "array")
         {
            let returnValues = new Array();
            for (let i = 0; i < stepCount; ++i)
            {
               let z = x + i * stepx;
               returnValues.push(z);
            }
            return returnValues;
         }
      }

      //--------------------------------
      //From here on we deal with D != 0|
      //--------------------------------
      let B = this.stretchParameters.b;
      if (D != 0.0)
      {
         //-------------------------------------
         // 5. Generalised Hyperbolic - (ST = 0)|
         //-------------------------------------
         if (STN == "Generalised Hyperbolic Stretch")
         {
            if ( B == -1 ){       // Logarithmic
            if (!spInv)
            {
               let LPT = this.stretchParameters.LP;
               let SPT = this.stretchParameters.SP;
               let HPT = this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = a1 + b1 * z;}
                  else if  (z < SPT)   {y = a2 + b2 * Math.ln(c2 + d2 * z);}
                  else if  (z < HPT)   {y = a3 + b3 * Math.ln(c3 + d3 * z);}
                  else                 {y = a4 + b4 * z;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
            else  // Inverse logarithmic equations
            {
               let LPT = a1 + b1 * this.stretchParameters.LP;
               let SPT = a2 + b2 * Math.ln(c2 + d2 * this.stretchParameters.SP);
               let HPT = a4 + b4 * this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = (z - a1) / b1;}
                  else if  (z < SPT)   {y = (Math.exp((z - a2) / b2) - c2) / d2;}
                  else if  (z < HPT)   {y = (Math.exp((z - a3) / b3) - c3) / d3;}
                  else                 {y = (z - a4) / b4;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }}

            if ( B == 0 ){       // Exponential
            if (!spInv)
            {
               let LPT = this.stretchParameters.LP;
               let SPT = this.stretchParameters.SP;
               let HPT = this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = a1 + b1 * z;}
                  else if  (z < SPT)   {y = a2 + b2 * Math.exp(c2 + d2 * z);}
                  else if  (z < HPT)   {y = a3 + b3 * Math.exp(c3 + d3 * z);}
                  else                 {y = a4 + b4 * z;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
            else  // Inverse exponential equations
            {
               let LPT = a1 + b1 * this.stretchParameters.LP;
               let SPT = a2 + b2 * Math.exp(c2 + d2 * this.stretchParameters.SP);
               let HPT = a4 + b4 * this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = (z - a1) / b1;}
                  else if  (z < SPT)   {y = (Math.ln((z - a2) / b2) - c2) / d2;}
                  else if  (z < HPT)   {y = (Math.ln((z - a3) / b3) - c3) / d3;}
                  else                 {y = (z - a4) / b4;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }}

            if ( (B != -1) && (B != 0) ){    // All other varieties of GHS
            if (!spInv)
            {
               let LPT = this.stretchParameters.LP;
               let SPT = this.stretchParameters.SP;
               let HPT = this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = a1 + b1 * z;}
                  else if  (z < SPT)   {y = a2 + b2 * Math.pow((c2 + d2 * z), e2);}
                  else if  (z < HPT)   {y = a3 + b3 * Math.pow((c3 + d3 * z), e3);}
                  else                 {y = a4 + b4 * z;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
            else  // Inverse GHS
            {
               let LPT = a1 + b1 * this.stretchParameters.LP;
               let SPT = a2 + b2 * Math.pow((c2 + d2 * this.stretchParameters.SP), e2);
               let HPT = a4 + b4 * this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = (z - a1) / b1;}
                  else if  (z < SPT)   {y = (Math.pow((z - a2) / b2, 1 / e2) - c2) / d2;}
                  else if  (z < HPT)   {y = (Math.pow((z - a3) / b3, 1 / e3) - c3) / d3;}
                  else                 {y = (z - a4) / b4;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }}
         }

         //-------------------------------------------------
         // 6. Traditional Histogram Transformation (ST = 1)|
         //-------------------------------------------------
         if ( STN == "Histogram Transformation" )
         {
            if (!spInv)
            {
               let LPT = this.stretchParameters.LP;
               let SPT = this.stretchParameters.SP;
               let HPT = this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = a1 + b1 * z;}
                  else if  (z < SPT)   {y = a2 + (b2 * z + c2) / (d2 * z + e2);}
                  else if  (z < HPT)   {y = a3 + (b3 * z + c3) / (d3 * z + e3);}
                  else                 {y = a4 + b4 * z;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
            else  // Inverse Histogram Transformation
            {
               let LPT = a1 + b1 * this.stretchParameters.LP;
               let SP = this.stretchParameters.SP
               let SPT = a2 + (b2 * SP + c2) / (d2 * SP + e2);
               let HPT = a4 + b4 * this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = (z - a1) / b1;}
                  else if  (z < SPT)   {y = (c2 - e2 * (z - a2)) / (d2 * (z - a2) - b2);}
                  else if  (z < HPT)   {y = (c3 - e3 * (z - a3)) / (d3 * (z - a3) - b3);}
                  else                 {y = (z - a4) / b4;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
         }

         //-----------------------------------
         // 7. Arcsinh Transformation (ST = 2)|
         //-----------------------------------
         if (STN == "Arcsinh Stretch")
         {
            if (!spInv)
            {
               let LPT = this.stretchParameters.LP;
               let SPT = this.stretchParameters.SP;
               let HPT = this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = a1 + b1 * z;}
                  else if  (z < SPT)   {y = a2 + b2 * Math.ln(c2 * (z - e2) + Math.sqrt(d2 * (z - e2) * (z - e2) + 1));}
                  else if  (z < HPT)   {y = a3 + b3 * Math.ln(c3 * (z - e3) + Math.sqrt(d3 * (z - e3) * (z - e3) + 1));}
                  else                 {y = a4 + b4 * z;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
            else  // Inverse Arcsinh Transformation
            {
               let LPT = a1 + b1 * this.stretchParameters.LP;
               let SP = this.stretchParameters.SP
               let SPT = a2 + b2 * Math.ln(c2 * (SP - e2) + Math.sqrt(d2 * (SP - e2) * (SP - e2) + 1));
               let HPT = a4 + b4 * this.stretchParameters.HP;

               let returnValues = new Array();
               for (let i = 0; i < stepCount; ++i)
               {
                  let z = x + i * stepx;
                  let y = 0.0;
                  if       (z < LPT)   {y = (z - a1) / b1;}
                  else if  (z < SPT)   {let exp = Math.exp((a2 - z) / b2); y = e2 - (exp - (1 / exp)) / (2 * c2);}
                  else if  (z < HPT)   {let exp = Math.exp((a3 - z) / b3); y = e3 - (exp - (1 / exp)) / (2 * c3);}
                  else                 {y = (z - a4) / b4;}
                  returnValues.push(y);
               }
               if (runMode == "value") return returnValues[0];
               else return returnValues;
            }
         }
      }
      return 0.0;    // Catch all!
   }

   this.getPMExpression = function(channel = 0, view = new View())
   {
      let ST = this.stretchParameters.ST;
      let STN = this.stretchParameters.STN();
      let Inv = this.stretchParameters.Inv;
      let orgD = this.stretchParameters.D;
      let D = this.stretchParameters.convertD(orgD);
      let B = this.stretchParameters.b;
      let SP = this.stretchParameters.SP;
      let LP = this.stretchParameters.LP;
      let HP = this.stretchParameters.HP;
      let BP = this.stretchParameters.BP;
      let WP = this.stretchParameters.WP;
      let linked = this.stretchParameters.linked;
      let LPT = LP;
      let SPT = SP;
      let HPT = HP;

      let exp1 = "";  // Will hold PixelMath expression if x < LP
      let exp2 = "";  // Will hold PixelMath expression if x < SP
      let exp3 = "";  // Will hold PixelMath expression if SP <= x <= HP
      let exp4 = "";  // Will hold PixelMath expression if x > HP


      //-------------------------------
      // 0. If stretch is STF  (ST = 6)|
      //-------------------------------

      if (STN == "STF Transformation")
      {

         var expr = new Array

         let c = channel
         if ( (linked) || (!stfIsColour) ) {c = 3;}
         var c0 = stfArray[c][0];
         var m = stfArray[c][1];
         var c1 = stfArray[c][2];
         var d = (1.0 / (c1 - c0));
         expr.push("mtf(" + m.toString() + ",(x-" + c0.toString() + ")*" + d.toString() + ")");

         expr.push("x");

         return expr;
      }

      //---------------------------------------
      // 1. If stretch is image blend  (ST = 5)|
      //---------------------------------------

      if (STN == "Image Blend")
      {
         let combineView = View.viewById(this.stretchParameters.combineViewId);

         let expr = ["x", "x"]
         if (combineView.id != "")
         {
            if (view.window.isMaskCompatible(combineView.window))
            {
               let p = (this.stretchParameters.combinePercent / 100).toString();
               expr[0] = "(1 - " + p + ") * " + view.id + " + " + p + " * " + combineView.id;
            }
         }
         return expr;
      }

      //------------------------------------------
      // 2. If stretch is image inversion (ST = 4)|
      //------------------------------------------

      if (STN == "Image Inversion")
      {
         return ["1 - x", "x"];
      }

      //-------------------------------------------------------------------------
      // 3. If stretch is a linear stretch to new black and white points (ST = 3)|
      //-------------------------------------------------------------------------

      if (STN == "Linear Stretch")
      {
         if (!Inv)
         {
            if (BP == WP)
            {
               return ["0.0", ""];
            }
            else
            {
               xStr = "max(0,(min(x,WP)-BP))/(WP-BP)";
               vStr = "x";
               vStr += ", BP = " + BP.toString();
               vStr += ", WP = " + WP.toString();
               return [xStr, vStr];
            }
         }
         else
         {
            //NOTE this is not a true inversion as the function is not invertable
            //this section of code is included as it is used
            //where BP <= 0 and WP >= 1, if these conditions are met the function is
            //invertable.
            xStr = "BP+x*(WP-BP)";
            vStr = "x";
            vStr += ", BP = " + BP.toString();
            vStr += ", WP = " + WP.toString();
            return [xStr, vStr];
         }
      }

      //------------------------------------------------------------------------------------------------------------
      // 4. NO STRETCH: If there is no stretch amount then just return the input value, pre-stretched if appropriate|
      //------------------------------------------------------------------------------------------------------------
      if (D == 0.0)
      {
         return ["x", "x"];
      }

      //---------------------------------------------------------------------
      //Set up the strings that will hold all variables used in the equations|
      //---------------------------------------------------------------------
      let vStr = "x";

      let vStr1 = ", a1 = " + a1.toString();
      vStr1 +=    ", b1 = " + b1.toString();

      let vStr2 = ", a2 = " + a2.toString();
      vStr2 +=    ", b2 = " + b2.toString();
      vStr2 +=    ", c2 = " + c2.toString();
      vStr2 +=    ", d2 = " + d2.toString();
      vStr2 +=    ", e2 = " + e2.toString();

      let vStr3 = ", a3 = " + a3.toString();
      vStr3 +=    ", b3 = " + b3.toString();
      vStr3 +=    ", c3 = " + c3.toString();
      vStr3 +=    ", d3 = " + d3.toString();
      vStr3 +=    ", e3 = " + e3.toString();

      let vStr4 = ", a4 = " + a4.toString();
      vStr4 +=    ", b4 = " + b4.toString();

      //--------------------------------
      //From here on we deal with D != 0|
      //--------------------------------
      if (D != 0.0)
      {
         //-------------------------------------
         // 5. Generalised Hyperbolic - (ST = 0)|
         //-------------------------------------
         if (STN == "Generalised Hyperbolic Stretch")
         {
            if (B == -1) { // GHS Logarithmic
            if (!Inv)
            {
               exp1 = "a1 + b1 * x";
               exp2 = "a2 + b2 *ln(c2 + d2 * x)";
               exp3 = "a3 + b3 *ln(c3 + d3 * x)";
               exp4 = "a4 + b4 * x";
            }
            else //Inverse GHS Logarithmic
            {
               LPT = a1 + b1 * LP;
               SPT = a2 + b2 * Math.ln(c2 + d2 * SP);
               HPT = a4 + b4 * HP;
               exp1 = "(x - a1) / b1";
               exp2 = "(exp((x - a2) / b2) - c2) / d2";
               exp3 = "(exp((x - a3) / b3) - c3) / d3";
               exp4 = "(x - a4) / b4";
            }}

            if (B == 0) { // GHS Exponential
            if (!Inv)
            {
               exp1 = "a1 + b1 * x";
               exp2 = "a2 + b2 *exp(c2 + d2 * x)";
               exp3 = "a3 + b3 *exp(c3 + d3 * x)";
               exp4 = "a4 + b4 * x";
            }
            else //Inverse GHS Logarithmic
            {
               LPT = a1 + b1 * LP;
               SPT = a2 + b2 * Math.exp(c2 + d2 * SP);
               HPT = a4 + b4 * HP;
               exp1 = "(x - a1) / b1";
               exp2 = "(ln((x - a2) / b2) - c2) / d2";
               exp3 = "(ln((x - a3) / b3) - c3) / d3";
               exp4 = "(x - a4) / b4";
            }}


            if ( (B != -1) && (B != 0) ){       // All other varieties of GHS
            if (!Inv)
            {
               exp1 = "a1 + b1 * x";
               exp2 = "a2 + b2 * (c2 + d2 * x) ^ e2";
               exp3 = "a3 + b3 * (c3 + d3 * x) ^ e3";
               exp4 = "a4 + b4 * x";
            }
            else //Inverse GHS Logarithmic
            {
               LPT = a1 + b1 * LP;
               SPT = a2 + b2 * Math.pow((c2 + d2 * SP), e2);
               HPT = a4 + b4 * HP;
               exp1 = "(x - a1) / b1";
               exp2 = "(((x - a2) / b2) ^ (1 / e2) - c2) / d2";
               exp3 = "(((x - a3) / b3) ^ (1 / e3) - c3) / d3";
               exp4 = "(x - a4) / b4";
            }}
         }

         //-------------------------------------------------
         // 6. Traditional Histogram Transformation (ST = 1)|
         //-------------------------------------------------

         if ( STN == "Histogram Transformation" )
         {
            if (!Inv)
            {
               exp1 = "a1 + b1 * x";
               exp2 = "a2 + (b2 * x + c2)/(d2 * x + e2)";
               exp3 = "a3 + (b3 * x + c3)/(d3 * x + e3)";
               exp4 = "a4 + b4 * x";
            }
            else //Inverse Histogram Transformation
            {
               LPT = a1 + b1 * LP;
               SPT = a2 + (b2 * SP + c2)/(d2 * SP + e2);
               HPT = a4 + b4 * HP;
               exp1 = "(x - a1) / b1";
               exp2 = "(c2 - e2 * (x - a2)) / (d2 * (x - a2) - b2)";
               exp3 = "(c3 - e3 * (x - a3)) / (d3 * (x - a3) - b3)";
               exp4 = "(x - a4) / b4";
            }
         }

         //-----------------------------------
         // 7. Arcsinh Transformation (ST = 2)|
         //-----------------------------------

         if (STN == "Arcsinh Stretch")
         {
            if (!Inv)
            {
               exp1 = "b1 * x";
               exp2 = "a2 + b2 * ln(c2 * (x - e2) + (d2 * (x - e2) * (x - e2) + 1) ^ 0.5)";
               exp3 = "a3 + b3 * ln(c3 * (x - e3) + (d3 * (x - e3) * (x - e3) + 1) ^ 0.5)";
               exp4 = "a4 + b4 * x";
            }
            else //Inverse Arcsinh
            {
               LPT = a1 + b1 * LP;
               SPT = a2 + b2 * Math.ln(c2 * (SP - e2) + Math.sqrt(d2 * (SP - e2) * (SP - e2) + 1));
               HPT = a4 + b4 * HP;
               exp1 = "(x - a1) / b1";
               exp2 = "e2 - (exp((a2 - x) / b2) - (1 / exp((a2 - x) / b2))) / (2 * c2)";
               exp3 = "e3 - (exp((a3 - x) / b3) - (1 / exp((a3 - x) / b3))) / (2 * c3)";
               exp4 = "(x - a4) / b4";
            }
         }
      }

      let logic1 = "iif(x < " + LPT.toString() + ", ";
      let logic2 = "iif(x < " + SPT.toString() + ", ";
      let logic3 = "iif(x < " + HPT.toString() + ", ";

      let xStr = "";
      if (HPT < 1.0)
      {
         xStr += exp4;
         vStr += vStr4;
      }
      if (SPT < HPT)
      {
         if (xStr != "") {xStr = logic3 + exp3 + "," + xStr + ")";}
         else {xStr = exp3;}
         vStr += vStr3;
      }
      if (LPT < SPT)
      {
         if (xStr != "") {xStr = logic2 + exp2 + "," + xStr + ")";}
         else {xStr = exp2;}
         vStr += vStr2
      }
      if (LPT > 0.0)
      {
         if (xStr != "") {xStr = logic1 + exp1 + "," + xStr + ")";}
         else {xStr = exp1;}
         vStr += vStr1
      }
      return [xStr, vStr];
   }

   this.calculateVariables = function(view)
   {
      let ST = this.stretchParameters.ST;
      let STN = this.stretchParameters.STN();
      let orgD = this.stretchParameters.D;
      let D = this.stretchParameters.convertD(orgD);
      let B = this.stretchParameters.b;
      let SP = this.stretchParameters.SP;
      let LP = this.stretchParameters.LP;
      var HP = this.stretchParameters.HP;
      var BP = this.stretchParameters.BP;

      let q0 = 0.0;
      let qwp = 0.0;
      let qlp = 0.0;
      let q1 = 0.0;
      let q = 0.0;
      let m = 0.0;

      //----------------------------------------------
      // 0. If stretch is  STF transformation (ST = 6)|
      //----------------------------------------------
      if (STN == "STF Transformation")
      {
         stfArray = new Array;
         stfArray.push([0.0, 0.5, 1.0, 0.0, 1.0]);
         stfArray.push([0.0, 0.5, 1.0, 0.0, 1.0]);
         stfArray.push([0.0, 0.5, 1.0, 0.0, 1.0]);
         stfArray.push([0.0, 0.5, 1.0, 0.0, 1.0]);
         stfArray.push([0.0, 0.5, 1.0, 0.0, 1.0]);
         stfIsColour = false;

         if (view != undefined && view.id != "")
         {
            stfArray = getAutoSTFH(view, this.stretchParameters.linked);
            stfIsColour = view.image.isColor;
         }
      }

      //-------------------------------------
      // 5. Generalised Hyperbolic - (ST = 0)|
      //-------------------------------------
      if (STN == "Generalised Hyperbolic Stretch")
      {
         //-------------------------------
         // 5a. GHS Logarithmic - (b = -1)|
         //-------------------------------
         if (B == -1.0)
         {
            qlp = -1.0 * Math.log(1.0 + D * (SP - LP)) ;
            q0 = qlp - D * LP / (1.0 + D * (SP - LP));
            qwp = Math.log(1.0 + D * (HP - SP)) ;
            q1 = qwp + D * (1.0 - HP) / (1.0 + D * (HP - SP));
            q = 1.0 / (q1 - q0);

            // derive coefficients for x < LP
            a1 = 0.0;
            b1 = D / (1.0 + D * (SP - LP)) * q;

            // derive coefficients for x < SP
            a2 = (-q0) * q;
            b2 = -q ;
            c2 = 1.0 + D * SP
            d2 = -D;
            e2 = 0.0;

            // derive coefficients for SP <= x <= HP
            a3 = (-q0) * q;
            b3 = q ;
            c3 = 1.0 - D * SP;
            d3 = D;
            e3 = 0.0;

            // derive coefficients for x > HP
            a4 = (qwp - q0 - D * HP / (1.0 + D * (HP - SP))) * q;
            b4 = q * D / (1.0 + D * (HP - SP));
         }

         //---------------------------
         // 5b. GHS Integral - (b < 0)|
         //---------------------------
         if ( (B != -1.0) && (B < 0.0) )
         {
            B = -B;
            qlp = (1.0 - Math.pow((1.0 + D * B * (SP - LP)), (B - 1.0) / B)) / (B - 1);
            q0 = qlp - D * LP * (Math.pow((1.0 + D * B * (SP - LP)), - 1.0 / B));
            qwp = (Math.pow((1.0 + D * B * (HP - SP)), (B - 1.0) / B) - 1.0) / (B - 1);
            q1 = qwp + D * (1.0 - HP) * (Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B));
            q = 1.0 / (q1 - q0);

            // derive coefficients for x < LP
            a1 = 0.0;
            b1 = D * Math.pow(1.0 + D * B * (SP - LP), -1.0 / B) * q;

            // derive coefficients for LP <= x < SP
            a2 = (1/(B-1)-q0) * q;
            b2 = -q/(B-1);
            c2 = 1.0 + D * B * SP;
            d2 = -D * B;
            e2 = (B - 1.0) / B;

            // derive coefficients for SP <= x <= HP
            a3 = (-1/(B - 1) - q0) * q;
            b3 = q/(B-1) ;
            c3 = 1.0 - D * B * SP
            d3 = D * B;
            e3 = (B - 1.0) / B;

            // derive coefficients for x > HP
            a4 = (qwp - q0 - D * HP * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B)) * q;
            b4 = D * Math.pow((1.0 + D * B * (HP - SP)), -1.0 / B) * q;
            B = -B
         }

         //------------------------------
         // 5c. GHS Exponential - (b = 0)|
         //------------------------------
         if (B == 0.0)
         {
            qlp = Math.exp(-D * (SP - LP));
            q0 = qlp - D * LP * Math.exp(-D*(SP - LP));
            qwp = 2.0 - Math.exp(-D * (HP - SP));
            q1 = qwp + D * (1.0 - HP) * Math.exp(-D * (HP - SP));
            q = 1.0 / (q1 - q0);

            // derive coefficients for x < LP
            a1 = 0.0;
            b1 = D * Math.exp(-D * (SP - LP)) * q;

            // derive coefficients for LP <= x < SP
            a2 = -q0 * q;
            b2 = q;
            c2 = -D * SP;
            d2 = D;
            e2 = 0.0;

            // derive coefficients for SP <= x <= HP
            a3 = (2.0 - q0) * q;
            b3 = -q;
            c3 = D * SP;
            d3 = -D;
            e3 = 0.0;

            // derive coefficients for x > HP
            a4 = (qwp - q0 - D * HP * Math.exp(-D * (HP - SP))) * q;
            b4 = D * Math.exp(-D * (HP - SP)) * q;
         }

         //--------------------------------------
         // 5d. GHS Hyperbolic/Harmonic - (b > 0)|
         //--------------------------------------
         if (B > 0.0)
         {
            qlp = Math.pow((1 + D * B * (SP - LP)), -1.0 / B);
            q0 = qlp - D * LP * Math.pow((1 + D * B * (SP - LP)), -(1.0 + B) / B);
            qwp = 2.0 - Math.pow(1.0 + D * B * (HP - SP), -1.0 / B);
            q1 = qwp + D * (1.0 - HP) * Math.pow((1.0 + D * B * (HP - SP)), -(1.0 + B) / B);
            q = 1.0 / (q1 - q0);

            // derive coefficients for x < LP
            a1 = 0.0;
            b1 = D * Math.pow((1 + D * B * (SP - LP)), -(1.0 + B) / B) * q;

            // derive coefficients for LP <= x < SP
            a2 = -q0 * q;
            b2 = q;
            c2 = 1.0 + D * B * SP;
            d2 = -D * B;
            e2 = -1.0 / B;

            // derive coefficients for SP <= x <= HP
            a3 = (2.0 - q0) * q;
            b3 = -q;
            c3 = 1.0 - D * B * SP;
            d3 = D * B;
            e3 = -1.0 / B;

            // derive coefficients for x > HP
            a4 = (qwp - q0 - D * HP * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B)) * q;
            b4 = (D * Math.pow((1.0 + D * B * (HP - SP)), -(B + 1.0) / B)) * q;
         }
      }

      //---------------------------------------------------------------
      // 6. If stretch is traditional histogram transformation (ST = 1)|
      //---------------------------------------------------------------
      if ( STN == "Histogram Transformation" ) // Classic Histogram / STF Stretch - b is not used
      {
         m = 1 / (2 * (D + 1));
         qlp = (m - 1) * (LP - SP) / ((1 - 2 * m)*(LP - SP) - m);
         q0 =  qlp + LP * (m - 1) * m * Math.pow((1 - 2 * m)*(LP - SP) - m, -2);
         qwp = (m - 1) * (HP - SP) / ((2 * m - 1) * (HP - SP) - m);
         q1 =  qwp + (HP - 1) * (m - 1) * m * Math.pow((2 * m - 1)*(HP - SP) - m, -2);
         q = 1.0 / (q1 - q0);

         // derive coefficients for x < LP
         a1 = 0.0;
         b1 = m * (1 - m) * Math.pow((1 - 2 * m)*(LP - SP) - m, -2) * q;

         // derive coefficients for LP <= x <= SP
         a2 = -q0 * q;
         b2 = (m-1) * q;
         c2 = b2 * (-SP);
         d2 = (1 - 2 * m);
         e2 = -d2 * SP - m;

         // derive coefficients for LP <= x <= SP
         a3 = -q0 * q;
         b3 = (m - 1) * q;
         c3 = b3 * (-SP);
         d3 = (2 * m - 1);
         e3 = -d3 * SP - m;

         // derive coefficients for x > HP
         a4 = (qwp - HP * (1 - m) * m * Math.pow((2 * m - 1)*(HP - SP) - m, -2) - q0) * q;
         b4 = -m * (m - 1) * Math.pow((2 * m - 1)*(HP - SP) - m, -2) * q;
      }

      //--------------------------------------------------
      // 7. If stretch is  arcsinh transformation (ST = 2)|
      //--------------------------------------------------
      if (STN == "Arcsinh Stretch")
      {
         qlp = - Math.ln(D * (SP - LP) + Math.pow((D * D * (SP - LP) * (SP - LP) + 1),0.5));
         q0 = qlp - LP * D * Math.pow((D * D * (SP - LP) * (SP - LP) + 1),-0.5);
         qwp = Math.ln(D * (HP - SP) + Math.pow((D * D * (HP - SP)*(HP - SP) + 1),0.5));
         q1 = qwp + (1.0 - HP) * D * Math.pow((D * D * (HP - SP) * (HP - SP) + 1),-0.5);
         q = 1.0 / (q1 - q0);

         // derive coefficients for x < LP
         a1 = 0.0;
         b1 = D * Math.pow((D * D * (SP - LP) * (SP - LP) + 1),-0.5) * q;

         // derive coefficients for LP <= x < SP
         a2 = -q0 * q;
         b2 = -q;
         c2 = -D;
         d2 = D * D;
         e2 = SP;

         // derive coefficients for SP <= x <= HP
         a3 = -q0 * q;
         b3 = q;
         c3 = D;
         d3 = D * D;
         e3 = SP;

         // derive coefficients for x > HP
         a4 = (qwp - HP * D * Math.pow((D * D * (HP - SP)* (HP - SP) + 1), -0.5) - q0) * q;
         b4 = D *  Math.pow((D * D * (HP - SP) * (HP - SP) + 1), -0.5) * q;
      }

      this.lastStretchKey = this.stretchParameters.getStretchKey();
   }

   this.executeOn = function(view, showNewImage = true)
   {
      this.calculateVariables(view);

      let wkgView = new View();
      let wkgViewId = getNewName("_ghs_temp");

      if (this.stretchParameters.channelSelector[0] || this.stretchParameters.channelSelector[1] || this.stretchParameters.channelSelector[2]){
      // build stretch expression
         let expr = ["$T", "$T", "$T", "", ""]
         let c = 0;
         if (this.stretchParameters.channelSelector[1]) {c = 1;}
         if (this.stretchParameters.channelSelector[2]) {c = 2;}
         let stretch = this.getPMExpression(c, view);
         expr[c] = "x = $T;" + stretch[0];
         expr[4] = stretch[1];
         wkgView = this.applyPixelMath(view, expr, wkgViewId, false);}

      if (this.stretchParameters.channelSelector[3]){
         // build stretch expression
         let stretch = this.getPMExpression(0, view);
         let expr = ["", "", "", "", ""];
         if ((this.stretchParameters.STN() == "STF Transformation") && !(this.stretchParameters.linked))
         {
            expr[0] = "x = $T;" + this.getPMExpression(0, view)[0];
            expr[1] = "x = $T;" + this.getPMExpression(1, view)[0];
            expr[2] = "x = $T;" + this.getPMExpression(2, view)[0];
         }
         else {expr[3] = "x = $T;" + stretch[0];}
         expr[4] = stretch[1];
         wkgView = this.applyPixelMath(view, expr, wkgViewId, false);}

      if (this.stretchParameters.channelSelector[4]){   //Lightness stretch (like CT)
         // stretch the luminance channel
         let stretch = this.getPMExpression();
         let expr = ["", "", "", "", ""];
         expr[3] = "x = CIEL($T);" + stretch[0];
         expr[4] = stretch[1];
         let lumViewId = getNewName("_ghs_lum_temp")
         let lumView = this.applyPixelMath(view, expr, lumViewId, false, PixelMath.prototype.Gray);

         // recombine
         let CCLab = new ChannelCombination;
         CCLab.colorSpace = ChannelCombination.prototype.CIELab;
         CCLab.channels = [[true, lumViewId], [false, ""], [false, ""]];
         wkgView = this.applyPixelMath(view, ["", "", "", "$T", ""], wkgViewId, false);
         CCLab.executeOn(wkgView);
         // close temporary views
         lumView.window.forceClose();}

      if (this.stretchParameters.channelSelector[5]){   //Saturation stretch

         let lumViewId = getNewName("_ghs_lum_temp");
         let expr = ["", "", "", "CIEL($T)", ""];
         let lumView = this.applyPixelMath(view, expr, lumViewId, false, PixelMath.prototype.Gray);

         let stretch = this.getPMExpression();

         let expr3 = "max = maxsample($T)";
         expr3 += "; min = minsample($T)";
         expr3 += "; x = iif(max > 0, (max - min) / max, 0)";
         expr3 += "; s = " + stretch[0];
         expr3 += "; iif(max == min, $T, max * (1 - s * (max - $T) / (max - min)));";

         let symb = "max, min, s, " + stretch[1];

         wkgView = this.applyPixelMath(view, ["", "", "", expr3, symb], wkgViewId, false);

         let ChComb = new ChannelCombination;
         ChComb.colorSpace = ChannelCombination.prototype.CIELab;
         ChComb.channels = [[true, lumViewId], [false, ""], [false, ""]];
         ChComb.executeOn(wkgView);

         // close temporary views
         lumView.window.forceClose();
      }

      if (this.stretchParameters.channelSelector[6]) {        //Luminance stretch (like arcsinh)

         let stretch = this.getPMExpression();

         let lumCoefficients = [1/3, 1/3, 1/3];
         if (this.dialog != undefined) lumCoefficients = this.dialog.getLumCoefficients();
         let lR = lumCoefficients[0].toString();
         let lG = lumCoefficients[1].toString();
         let lB = lumCoefficients[2].toString();

         let expr3 = "";
         let symb = "";
         if (this.dialog.optionParameters.colourClip == "Rescale")
         {
            expr3 = "x = " + lR + " * $T[0] + " + lG + " * $T[1] + " + lB + " * $T[2]";
            expr3 += "; y = " + stretch[0];
            expr3 += "; max = maxsample($T)";
            expr3 += "; adj = max(1, (y * max) / x)"
            expr3 += "; iif(x == 0, 0, (y / x) * $T / adj)";
            symb = "y, max, adj, " + stretch[1];
         }
         else
         {
            expr3 = "x = " + lR + " * $T[0] + " + lG + " * $T[1] + " + lB + " * $T[2]";
            expr3 += "; y = " + stretch[0];
            expr3 += "; iif(x == 0, 0, min(1, (y / x) * $T))";
            symb = "y, " + stretch[1];
         }

         wkgView = this.applyPixelMath(view, ["", "", "", expr3, symb], wkgViewId, false);
      }

      //check if masking is required
      let maskingRequired = false;
      if (view.window.maskEnabled && (view.window.mask.mainView.id != "")) maskingRequired = true;

      //generate new view id if required
      if (this.stretchParameters.createNewImage)
      {
         var newImageId = "";
         if (this.stretchParameters.newImageId != "<Auto>")
         {
            let tryNewImageId = this.stretchParameters.newImageId;
            if (isValidViewId(tryNewImageId)) newImageId = getNewName(tryNewImageId);
         }
         if (newImageId == "")
         {
            newImageId = getNewName("ghsImage");
         }
      }

      //generate the appropriate masking pixelmath if required
      if (maskingRequired)
      {
         let maskId = view.window.mask.mainView.id;
         var maskExpr = ["", "", "", "", ""];
         maskExpr[3] = maskId + "*" + wkgViewId + "+(1-" + maskId + ")*" + view.id;
         if (view.window.maskInverted) maskExpr[3] = maskId + "*" + view.id + "+(1-" + maskId + ")*" + wkgViewId;
      }

      //generate the return view
      if (maskingRequired && this.stretchParameters.createNewImage)
      {
         var returnView = this.applyPixelMath(wkgView, maskExpr, newImageId, false, PixelMath.prototype.SameAsTarget);
      }

      if (maskingRequired && !this.stretchParameters.createNewImage)
      {
         var returnView = this.applyPixelMath(view, maskExpr, "", true, PixelMath.prototype.SameAsTarget);
      }

      if (!maskingRequired && this.stretchParameters.createNewImage)
      {
         var returnView = this.applyPixelMath(wkgView, ["", "", "", "$T", ""], newImageId, false, PixelMath.prototype.SameAsTarget);
      }

      if (!maskingRequired && !this.stretchParameters.createNewImage)
      {
         var returnView = this.applyPixelMath(view, ["", "", "", wkgViewId, ""], "", true, PixelMath.prototype.SameAsTarget);
      }

      if (showNewImage) returnView.window.show();

      wkgView.window.forceClose();
      return returnView;
   }

   this.applyPixelMath = function(view, stretchExpression, newImageId = "", showNewImage = true, newImageColorSpace = PixelMath.prototype.SameAsTarget)
   {
      let P = new PixelMath;

      if (stretchExpression[3] != "")
      {
         P.expression = stretchExpression[3];
         P.expression1 = "";
         P.expression2 = "";
         P.useSingleExpression = true;
      }
      else
      {
         P.expression = stretchExpression[0];
         P.expression1 = stretchExpression[1];
         P.expression2 = stretchExpression[2];
         P.useSingleExpression = false;
      }

      P.symbols = "";
      if (stretchExpression[4] != undefined)
      {
         P.symbols = stretchExpression[4];
      }

      if (newImageId == "")
      {
         P.createNewImage = false;
         P.newImageId = "";
      }
      else
      {
         P.createNewImage = true;
         P.newImageId = getNewName(newImageId) //make sure to have a unique name
      }

      P.expression3 = "";
      P.clearImageCacheAndExit = false;
      P.cacheGeneratedImages = false;
      P.generateOutput = true;
      P.singleThreaded = false;
      P.optimization = true;
      P.use64BitWorkingImage = false;
      P.rescale = false;
      P.rescaleLower = 0;
      P.rescaleUpper = 1;
      P.truncate = true;
      P.truncateLower = 0;
      P.truncateUpper = 1;
      P.newImageWidth = 0;
      P.newImageHeight = 0;
      P.newImageAlpha = false;
      P.newImageColorSpace = newImageColorSpace;
      P.newImageSampleFormat = PixelMath.prototype.SameAsTarget;
      P.showNewImage = showNewImage;

      if (P.executeOn(view))
      {
         if (P.createNewImage) {return View.viewById(P.newImageId);}
         else
         {
            return view;
         }
      }
      else
      {
         Console.warningln("PixelMath error");
         return null;
      }
   }

}
GHSStretch.prototype = new Object;

