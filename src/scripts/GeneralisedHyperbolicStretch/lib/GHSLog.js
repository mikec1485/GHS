
 /*
 * *****************************************************************************
 *
 * LOG OBJECT
 * This object forms part of the GeneralisedHyperbolicStretch.js
 * Version 2.2.7
 *
 * Copyright (C) 2022-2023  Mike Cranfield
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


function GHSLog()
{
   this.__base__ = Object;
   this.__base__();

   this.sessionStart = new Date();
   this.items = new Array;
   this.itemCount = function() {return this.items.length;}

   this.findItem = function(imageId)
   {
      var findItem = -1;
      for (var i = 0; i < this.itemCount(); ++i)
      {
         if (this.items[i].imageId == imageId) findItem = i;
      }
      return findItem;
   }

   this.hasItem = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (itemIndex < 0) {return false;}
      else {return true;}
   }

   this.add = function(imageId, stretch)
   {
      var itemIndex = this.findItem(imageId);
      if (itemIndex < 0)
      {
         itemIndex = this.itemCount();
         var creationDate = new Date;
         var timeStamp = creationDate.toLocaleTimeString() + ": ";
         this.items.push(new GHSLogItem(imageId, timeStamp + stretch));
      }
      else
      {
         this.items[itemIndex].add(stretch);
      }
   }

   this.undo = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (!(itemIndex < 0))
      {
         if (this.items[itemIndex].nextIndex > 1) {this.items[itemIndex].nextIndex -= 1;}
         else {this.items[itemIndex].historyIndex -= 1;}
      }
   }

   this.redo = function(imageId)
   {
      var itemIndex = this.findItem(imageId);
      if (!(itemIndex < 0))
      {
         var loggedStretchesAvailable = (this.items[itemIndex].nextIndex < this.items[itemIndex].stretchCount());
         var backHistoryAvailable = (this.items[itemIndex].historyIndex < Math.min(0, this.items[itemIndex].maxHistoryIndex));

         if  (loggedStretchesAvailable && !backHistoryAvailable) {this.items[itemIndex].nextIndex += 1;}
         else {this.items[itemIndex].historyIndex += 1;}
      }
   }

}
GHSLog.prototype = new Object;

function GHSLogItem(imageId, stretch)
{
   this.stretchData = [stretch];
   this.imageId = imageId;
   this.stretchCount = function() {return this.stretchData.length;}
   this.nextIndex = 1;
   this.historyIndex = 0;
   this.maxHistoryIndex = 999;

   this.stretches = function(i)
   {
      var returnValue = this.stretchData[i]
      if (i == 0)
      {
         var initialImageHistoryIndex = this.historyIndex - this.nextIndex;
         if (this.historyIndex < 0) returnValue += " - rolled back to history index: " + this.historyIndex.toString();
         if (this.historyIndex > 0) returnValue += " - rolled forward to history index: +" + this.historyIndex.toString();
      }
      return returnValue;
   }


   this.add = function(stretch)
   {
      var creationDate = new Date;
      var timeStamp = creationDate.toLocaleTimeString() + ": ";
      this.stretchData[this.nextIndex] = timeStamp + stretch;
      this.nextIndex += 1;
      this.maxHistoryIndex = this.historyIndex;
   }
}
GHSLogItem.prototype = new Object;

