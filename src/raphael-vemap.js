/**
 * Raphaël-VEMap: A zoom/pan plugin for Raphaël integration with a BingMaps VEMap instance.
 * Based upon Raphael-ZPD by Daniel Assange <somnidea@lemma.org>
 * ==================================================
 *
 * This code is licensed under the following BSD license:
 * 
 * Copyright 2010 Daniel Assange <somnidea@lemma.org> (Raphaël integration and extensions). All rights reserved.
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com> (original author). All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 * 
 * Usage
 * paper.VEMap({map: yourVEMapInstance });
 */

(function() {
	var initialized = false;

	var opts = {},
	    center,
	    zoom,
	    map,
	    viewport,
	    stateTf;

	function init(paper) {
	    map = opts.map;
	    
		var root    = paper.canvas,
		    svgCt   = map.GetsvgDiv();
        
		viewport = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		viewport.id = 'viewport';
		root.appendChild(viewport);
		paper.canvas = viewport;

		//var state = 'none', stateTarget, stateOrigin, stateTf;
        
        // Record the Map's current center and zoom
        center  = map.GetCenter();
        zoom    = map.GetZoomLevel();
        stateTf = viewport.getCTM().inverse();
        
		setupHandlers(map);
        
		initialized = true;

		/**
		 * Handler registration
		 */
		function setupHandlers(map){
		    // Setup events
            //map.AttachEvent('onchangeview', onChangeView);
            map.AttachEvent('onendpan', onEndPan);
            map.AttachEvent('onendzoom', onEndZoom);
            
		    /*
			root.onmousedown = handleMouseDown;
			root.onmousemove = handleMouseMove;
			root.onmouseup = handleMouseUp;
			//root.onmouseout = handleMouseUp; // Decomment this to stop the pan functionality when dragging out of the SVG element

			if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
				window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
			else
				window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
			*/
		}
		/**
		* Converts a VELatLong to pixel object
		* @param {VELatLong} ll
		* @return {Object} eg {x: 10, y: 100}
		*/
		function toPixel(ll) {
		    return map.LatLongToPixel(ll);
		}
        /**
        * onChangeView
        * @param {MapEvent}
        */
        function onChangeView(ev) {
            var p1 = toPixel(center),
                c  = map.GetCenter(),
                p2 = toPixel(c);
            
            console.info('onChangeView', (p1.x - p2.x),  (p1.y - p2.y));
            
            // Store current center;
            center = c;
        }
        /**
        * onEndPan
        * @param {MapEvent}
        stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
        */
        function onEndPan(ev) {
            viewport.getCTM().inverse();
            
            var stateOrigin = getEventPoint(center).matrixTransform(stateTf),
                c           = map.GetCenter(),
                p2          = getEventPoint(c).matrixTransform(stateTf);
            
            
            
            console.info('onEndPan: ', p1, p2);
            
            //console.info('onEndPan', (p1.x - p2.x),  (p1.y - p2.y));
        
			setCTM(viewport, stateTf.inverse().translate(p2.x - p1.x, p2.y - p1.y));
			
			
            // Store current center;
            center = c;
        }
        /**
        * onEndZoom
        * @param {MapEvent}
        */
        function onEndZoom(ev) {
            var p1  = toPixel(center),
                c   = map.GetCenter(),
                p2  = toPixel(c),
                z   = map.GetZoomLevel();
                
            console.info('onEndZoom', ev, center, zoom, c, z);
            
            // Store current center/zoom
            center  = c;
            zoom    = z;
        }
		/**
		 * Instance an SVGPoint object with given event coordinates.
		 */
		function getEventPoint(ll) {
			var p = root.createSVGPoint(),
			    c = toPixel(ll);
            
			p.x = c.x;
			p.y = c.y;

			return p;
		}

		/**
		 * Sets the current transform matrix of an element.
		 */
		function setCTM(element, matrix) {
			var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

			element.setAttribute("transform", s);
		}

		/**
		 * Dumps a matrix to a string (useful for debug).
		 */
		function dumpMatrix(matrix) {
			var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b + ", " + matrix.d + ", " + matrix.f + "\n  0, 0, 1 ]";

			return s;
		}

		/**
		 * Sets attributes of an element.
		 */
		function setAttributes(element, attributes){
			for (i in attributes)
				element.setAttributeNS(null, i, attributes[i]);
		}

		/**
		 * Handle mouse move event.
		 */
		function handleMouseWheel(evt) {
			if (!opts.zoom) return;

			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;

			var delta;

			if(evt.wheelDelta)
				delta = evt.wheelDelta / 3600; // Chrome/Safari
			else
				delta = evt.detail / -90; // Mozilla

			var z = 1 + delta; // Zoom factor: 0.9/1.1

			var g = svgDoc.getElementById("viewport");

			var p = getEventPoint(evt);

			p = p.matrixTransform(g.getCTM().inverse());

			// Compute new scale matrix in current mouse position
			var k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

				setCTM(g, g.getCTM().multiply(k));

			if(typeof(stateTf) == "undefined")
				stateTf = g.getCTM().inverse();

			stateTf = stateTf.multiply(k.inverse());
		}

		/**
		 * Handle mouse move event.
		 */
		function handleMouseMove(evt) {
			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;

			var g = svgDoc.getElementById("viewport");

			if(state == 'pan') {
				// Pan mode
				if (!opts.pan) return;

				var p = getEventPoint(evt).matrixTransform(stateTf);

				setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
			} else if(state == 'move') {
				// Move mode
				if (!opts.drag) return;

				var p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());

				setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));

				stateOrigin = p;
			}
		}

		/**
		 * Handle click event.
		 */
		function handleMouseDown(evt) {
			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;

			var g = svgDoc.getElementById("viewport");

			if(evt.target.tagName == "svg") {
				// Pan mode
				if (!opts.pan) return;

				state = 'pan';

				stateTf = g.getCTM().inverse();

				stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
			} else {
				// Move mode
				if (!opts.drag || evt.target.draggable == false) return;

				state = 'move';

				stateTarget = evt.target;

				stateTf = g.getCTM().inverse();

				stateOrigin = getEventPoint(evt).matrixTransform(stateTf);
			}
		}

		/**
		 * Handle mouse button release event.
		 */
		function handleMouseUp(evt) {
			if(evt.preventDefault)
				evt.preventDefault();

			evt.returnValue = false;

			var svgDoc = evt.target.ownerDocument;

			if((state == 'pan' && opts.pan) || (state == 'move' && opts.drag)) {
				// Quit pan mode
				state = '';
			}
		}
	}
    /**
    * Plugin initializer
    * @param {VEMap} map Your VEMap instance.
    */
	Raphael.fn.VEMap = function(map) {
	    if (!map) {
	        throw new Error('VEMap must be initialized with a VEMap instance as 1st parameter');
	    }
		opts.map = map;
		
		if (!initialized) init(this);
		return this;
	}
})();