# Raphaël-VEMap
### A little plugin for the [Raphaël](http://raphaeljs.com/) Javascript SVG library integrating with BingMaps VEMap instance.  

Based upon the [Raphaël-ZPD](https://github.com/somnidea/raphael-zpd), "zoom/pan/drag" plugin.  Listens to VEMap events "onendpan" and "onendzoom" and executes required transformations upon the Raphael canvas to synchronize with the VEMap's pan/zoom.
## Usage

Create a Raphaël paper object, then call the VEMap initialization function with your VEMap instance (before performing any drawing operations):

  var paper = Raphael(yourVEMapInstance.GetsvgDiv(), '100%', '100%');
  paper.VEMap(yourVEMapInstance);
      
	paper.VEMap(yourVEMapInstance);

Repeated calls to this function may be used to alter the settings as needed. You may disable the drag functionality on the basis of individual 

## Potential Issues (from Raphaël-ZPD)

The ZPD function works by creating an SVG group element (with id 'viewport') and altering the paper's canvas to point at it, causing all following elements created via the paper to be placed within. This will potentially break any plugins or Raphaël functions that rely on paper.canvas pointing to the root SVG object, though I have yet to encounter such a situation.

## Examples (from Raphaël-ZPD)

[Treeblob](http://www.lemma.org/experiments/treeblob/) is a contrived example of network visualisation using the panning and zooming functionalities.

## Acknowledgements
Forked from [Raphaël-ZPD](https://github.com/somnidea/raphael-zpd), "zoom/pan/drag" plugin.
Based on the [SVGPan](http://code.google.com/p/svgpan/) library created by Andrea Leofreddi.

## License
	Copyright 2010 Chris Scott <christocracy@gmail.com> (Raphaël-ZPD integration with VEMap).  All rights reserved
	Copyright 2010 Daniel Assange <somnidea@lemma.org> (Raphaël integration and extensions). All rights reserved.
	Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com> (original author). All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are
	permitted provided that the following conditions are met:
	
	   1. Redistributions of source code must retain the above copyright notice, this list of
	      conditions and the following disclaimer.
	
	   2. Redistributions in binary form must reproduce the above copyright notice, this list
	      of conditions and the following disclaimer in the documentation and/or other materials
	      provided with the distribution.
	
	THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
	WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
	FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
	CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
	CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
	SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
	ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
	ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	
	The views and conclusions contained in the software and documentation are those of the
	authors and should not be interpreted as representing official policies, either expressed
	or implied, of Andrea Leofreddi.
