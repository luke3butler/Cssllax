
// ------------------------------------------
// Cssllax.js - v1.0.0
// CSS property parallax library
// Copyright (c) 2017 Luke Butler
// MIT license
// 
// Thanks to Moe Amaya and his Rellax.js library for inspiration
// ------------------------------------------

(function (root, lib) {
  if (typeof define === 'function' && define.amd) {
    define([], lib); // Register as an anonymous module.
  } else if (typeof module === 'object' && module.exports) {
    // Only works with CommonJS-like environments that support module.exports, like Node
    module.exports = lib();
  } else {
    root.Cssllax = lib(); // Register as browser global
  }
}(this, function () {
  var Cssllax = function () {
    'use strict';
    var posY = 0;
    var csslaxxItems = [];

    // check what requestAnimationFrame to use, and if
    // it's not supported, use setTimeout
    var loop = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      function (callback) { setTimeout(callback, 1000 / 60); };

    // Returns the element's percentage down viewport
    var percentageDownViewport = function (el) {
      // Get bounding box
      var rect = el.getBoundingClientRect();

      if (rect.top >= window.innerHeight) {
        // the element is below the viewport
        return 100;
      } else if (rect.bottom <= 0) {
        // the element is above the viewport
        return 0;
      }

      var distanceFromBottom = window.innerHeight - rect.top;
      // Preceding with "100 -" to flip the percentage output
      return 100 - (distanceFromBottom / ((window.innerHeight + rect.height) / 100));
    }

    // Add a cssllax item
    var add = function (selector, options) {
      // Set defaults
      var min = 0;
      var mid = 50;
      var max = 100;
      var unit = '%';
      var afterHook = false;

      options = options === undefined ? {} : options;

      if (typeof options === 'string') {
        // If options is a string, treat it as a css property
        var property = options;
      } else if (typeof options === 'object') {
        // Set values
        min = options.min === undefined ? min : options.min;
        max = options.max === undefined ? max : options.max;
        unit = options.unit === undefined ? unit : options.unit;
        // Calculate middle if one is not provided
        mid = options.mid === undefined ? ((max - min) / 2) + min : options.mid;
        // If property isn't set, leave the value undefined
        var property = options.property === undefined ? undefined : options.property;
        // Set the after hook if one was provided
        if (options.after && typeof options.after === 'function') {
          afterHook = options.after;
        }
      }

      // If no css property is set, there's nothing to do
      if (property === undefined) return false;

      // Define ranges for the css property value (top and bottom half of page)
      var range = [mid - min, max - mid];

      var getTargetSize = function (position) {
        if (position < 50) {
          // Top half of page
          return (range[0] * (position / 50)) + min;
        } else {
          // Bottom half of page
          return (range[1] * ((position - 50) / 50)) + mid;
        }
      }

      // get all items that match the selector
      var elems = document.querySelectorAll(selector);

      var item = function (el) {
        var animate = function () {
          // Element position in viewport
          var position = percentageDownViewport(el);
          // Set the css property
          el.style[property] = getTargetSize(position) + unit;
          // Execute after hook if one was provided
          if (afterHook !== false) afterHook(el, position);
        }
        // Return animate function
        return { animate: animate }
      }

      // Add each document item's update function to the array    
      for (var i = 0; i < elems.length; i++) {
        csslaxxItems.push(item(elems[i]));
      }

      // Trigger the first run manually
      animate();
    }

    // Set the scrollTop position (for detecting scroll updates)
    var setYPosition = function () {
      var oldY = posY;

      posY = window.pageYOffset !== undefined
        ? window.pageYOffset
        : (document.documentElement || document.body.parentNode || document.body).scrollTop;

      // Has scroll changed?
      return oldY != posY ? true : false;
    }

    // Animate all elements    
    var animate = function () {
      if (csslaxxItems.length) {
        for (var i = 0; i < csslaxxItems.length; i++) {
          // Call the animate function on each item
          csslaxxItems[i].animate();
        }
      }
    }

    var update = function () {
      // Only trigger animate when there are scroll updates
      if (setYPosition()) animate();
      // Keep the update loop going
      loop(update);
    }

    var init = function () {
      // Start the loop
      update();

      // Return function that allows for adding elements
      return add;
    }

    // add an accessible update function    
    add.update = animate;
    
    return init();
  }
  return Cssllax();
}));