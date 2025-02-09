/**
 *  Raphaël-ZPD: A zoom/pan/drag plugin for Raphaël.
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
 */

(function() {
	var initialized = false;

	var opts = { zoom: true, pan: true, drag: true }

	function init(paper) {
		var root = paper.canvas;

		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.id = 'viewport';
		root.appendChild(g);
		paper.canvas = g;

		var state = 'none', stateTarget, stateOrigin, stateTf;

		setupHandlers(root);

		initialized = true;

		/**
		 * Handler registration
		 */
		function setupHandlers(root){
			root.onmousedown = handleMouseDown;
			root.onmousemove = handleMouseMove;
			root.onmouseup = handleMouseUp;
			//root.onmouseout = handleMouseUp; // Decomment this to stop the pan functionality when dragging out of the SVG element

			if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
				window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
			else
				window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
		}

		/**
		 * Instance an SVGPoint object with given event coordinates.
		 */
		function getEventPoint(evt) {
			var p = root.createSVGPoint();

			p.x = evt.clientX;
			p.y = evt.clientY;

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
				delta = evt.wheelDelta / (opts.chomeZoomDelta || 3600); // Chrome/Safari
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

	Raphael.fn.ZPD = function(o) {
		if (o) {
			for (var key in o) {
				if (opts[key] !== undefined) {
					opts[key] = o[key];
				}
			}
		}

		if (!initialized) init(this);
		return this;
	}
})();
