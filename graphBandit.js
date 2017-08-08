var graphBandit = function(element, width = window.innerWidth, height = window.innerHeight, graphs = [], fontSize = 20, fontType = "Verdana", axesColour = "#000F00", X1 = -400, X2 = 400, Y1 = -400, Y2 = 400, interval = 200) {
	var gb = this;
	gb.st = { 
		"el" : document.getElementById(element),
		"ct" : document.getElementById(element).getContext("2d"),
		"wt" : width,		
		"ht" : height,
		"fs" : fontSize,
		"ft" : fontType,
		"ac" : axesColour,
		"ax" : {
				"x1" : X1,
				"x2" : X2,
				"y1" : Y1,
				"y2" : Y2,
				"xt" : (X1 >= 0 ? X1 : -X1) + (X2 >= 0 ? X2 : -X2), /* Total length of X-Axis */
				"yt" : (Y1 >= 0 ? Y1 : -Y1) + (Y2 >= 0 ? Y2 : -Y2), /* Total length of Y-Axis */
				"tx" : Math.round(width / interval), /* Number of values on X-Axis */
				"ty" : Math.round(height / interval), /* Number of values on Y-Axis */
				"ix" : ((X1 >= 0 ? X1 : -X1) + (X2 >= 0 ? X2 : -X2)) / (Math.round(width / interval)),
				"iy" : ((Y1 >= 0 ? Y1 : -Y1) + (Y2 >= 0 ? Y2 : -Y2)) / (Math.round(height / interval)),
				"fx" : width / ((X1 >= 0 ? X1 : -X1) + (X2 >= 0 ? X2 : -X2)),
				"fy" : height / ((Y1 >= 0 ? Y1 : -Y1) + (Y2 >= 0 ? Y2 : -Y2))
		},
		"gr" : (graphs != null || !Array.isArray(graphs) ) ? graphs : []
	};
	gb.init = function () {
		gb.st.el.width = gb.st.wt; /* Set canvas width */
		gb.st.el.height = gb.st.ht; /* Set canvas width */
		gb.draw(); /* Draw graphs */
		// alert(gb.st.el.id + " x: " + gb.st.ax.fx + " y: " + gb.st.ax.fy );
	};
	gb.line = function (b, c, colour) {
		var newGraph = {
			"b" : b,
			"c" : c,
			"cl" : colour		
		};
		gb.st.gr.push(newGraph);	
	};
	gb.parabola = function (a, b, c, colour) {
		var newGraph = {
			"a" : a,
			"b" : b,
			"c" : c,
			"cl" : colour		
		};
		gb.st.gr.push(newGraph);	
	};
	gb.exponential = function (a, e, colour) {
		var newGraph = {
			"a" : a,
			"e" : e,
			"cl" : colour		
		};
		gb.st.gr.push(newGraph);	
	};
	gb.power = function (a, p, colour) {
		var newGraph = {
			"a" : a,
			"p" : p,
			"cl" : colour		
		};
		gb.st.gr.push(newGraph);	
	};
	gb.clear = function () {
		gb.st.ct.clearRect(0, 0, gb.st.wt, gb.st.ht); /* Clear canvas */
	};
	gb.drawAxes = function () {
			var xMiddle = (gb.st.wt / 2) * gb.st.ax.fx;
			var yMiddle = (gb.st.ht / 2) * gb.st.ax.fy;
			var xLength = gb.st.wt * gb.st.ax.fx;
			var yLength = gb.st.ht * gb.st.ax.fy;
	
			/* Set colour of axes and fonts */
			gb.st.ct.strokeStyle = gb.st.ac;
			gb.st.ct.fillStyle = gb.st.ac;
			/* Draw X-axis */
			gb.st.ct.moveTo(0, yMiddle);
			gb.st.ct.lineTo(xLength, yMiddle);
			gb.st.ct.stroke();
			/* Draw Y-axis */
			gb.st.ct.moveTo(xMiddle, 0);
			gb.st.ct.lineTo(xMiddle, yLength);
			gb.st.ct.stroke();
			/* Draw axis feedback information */
			gb.st.ct.font = gb.st.fs + "px " + gb.st.ft;
			gb.st.ct.strokeText("x", (xLength - gb.st.fs), (yMiddle - gb.st.fs));
			gb.st.ct.strokeText("y", (xMiddle + gb.st.fs) , gb.st.fs);
			// for (var xs = 0; xs < gb.st.ax.tx; xs++) {
			// gb.st.ct.strokeText(xs, (gb.st.ax.ix * xs), ((gb.st.ht / 2) + gb.st.fs) );				
			// }
	};
	gb.drawGraphs = function () {
		/* Loop through all graphs */
		for (var gi = 0; gi < gb.st.gr.length; gi++) {		
			var started = false;
			var lastX;
			var lastY;
			var startValue = gb.st.ax.x1;
			var endValue = gb.st.ax.x2 * gb.st.ax.fx;
			var a = (!isNaN(gb.st.gr[gi].a) ? gb.st.gr[gi].a : 0); 
			var b = (!isNaN(gb.st.gr[gi].b) ? gb.st.gr[gi].b : 0);
			var c = (!isNaN(gb.st.gr[gi].c) ? gb.st.gr[gi].c : 0);
			var e = (!isNaN(gb.st.gr[gi].e) ? gb.st.gr[gi].e : 0);
			var p = (!isNaN(gb.st.gr[gi].p) ? gb.st.gr[gi].p : 0);	
            gb.st.ct.strokeStyle = gb.st.gr[gi].cl;
			/* Loop through X-Axis, Calculate corresponding X-Values and draw graph */
            for (var x1 = startValue; x1 < endValue; x1++) {
				var x = x1 * gb.st.ax.fx;
				var y1 = (e == 0 && p == 0 ? (a > 0 ? -( a * Math.pow(x, 2) ) : ( a * Math.pow(x, 2) ) ) : /* Parabola */
							      (p == 0 ? (a > 0 ? -( a * Math.pow(e, x) ) : ( a * Math.pow(e, x) ) ) : /* Exponential */
											(a > 0 ? -( a * Math.pow(x, p) ) : ( a * Math.pow(x, p) ) ) ) /* Power */
						)
					    - (b * x) /* Scaling factor */ 
						- c; /* Shift on y-axis */
				var y = y1 * gb.st.ax.fy;
				gb.st.ct.beginPath();
				if (started == true) {
					gb.st.ct.moveTo(lastX - gb.st.ax.x1, lastY - gb.st.ax.x1);
				}
				else {
					gb.st.ct.moveTo(x - gb.st.ax.x1, y - gb.st.ax.x1);
					started = true;
				}
				gb.st.ct.lineTo(x - gb.st.ax.x1, y - gb.st.ax.x1);
				gb.st.ct.stroke();
				lastX = x;
				lastY = y;
            }			
		}
	};
	gb.draw = function () {
		gb.clear();
		gb.drawAxes();
		gb.drawGraphs();
	};
	gb.init();	
};