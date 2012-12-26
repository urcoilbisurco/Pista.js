Pista.js
=======

Lightweight time chart library for jquery/zepto.js.

The goal is to have a 5-6kb library, easy to download also on mobile and that works well both with jquery and zepto.
I need it for a new version of [trackthisfor.me](http://trackthisfor.me "trackthisfor.me").

Therea are a lot of stuff that are missing (like the legend, and a non-time xaxis), but i don't want to add a lot of bloat. If you want to have a really customized library, use [flot](http://flotcharts.org/ "Flot homepage").


The usage is really easy (and borrowed from flot for some things).

## Basic usage ##

Create a div that will be the container of the chart:

```html
<div id="chart" style="width:600px;height:300px"></div>
```

Remember to set the width and the height of this div (inline or in css code doesn't matter).

You can also do it with an external stylesheet. Make sure that the
placeholder isn't within something with a display:none CSS property -
in that case, Flot has trouble measuring label dimensions which
results in garbled looks and might have trouble measuring the
placeholder dimensions which is fatal (it'll throw an exception).

Then you only need to run this js code:

```js
$(function(){
	$("#chart").pista(data, options, tooltipCallback);
})
```

The 'data' is an array of data series in this format:

```js
	[	{ name:"first",
		data:[
			{value:25, date:"12/14/2012"},
			{value:32, date:"12/15/2012"},
			{value:45, date:"12/17/2012"}]
		},
		{ name:"second",
		data:[
			{value:23, date:"12/13/2012"},
			{value:26.6, date:"12/18/2012"}]
		}
	]
```

the 'options' is an object with all the options. These are the default options:

```js
pista.defaults = {
    height: 100,
    width: 100,
  	x:{margin:15, min: null, max:null}, 
  	y:{margin:0.2, min:null, max:null},  
  	goal: {show:true, value:23, color: "#3BAFD7"}, 
  	tooltip: {show:true, maxRadius: 3}, 
  	lines: {show: true, fill: true, curve:true, strokeColor: ["#3BAFD7", "#E1523D"], strokeWidth: 4, fillOpacity: 0.7, fillColor:["#3BAFD7", "#E1523D"]},
  	points:{show:true, strokeWidth:3.5, strokeColor:["#3BAFD7", "#E1523D"]},
  	labels:{
		lineWidth: 0.3,
	  	fontSize: 11,
	  	x:{number: 7, show:true, color:"#858585", grid:false },
	  	y:{number:4, show:true, color:"#858585", grid:true}
	}
  };


```

- y.margin is a float number.
- x.min, x.max are in the MM/dd/yyyy format.
- the goal is a simple horizontal line that will be drawn on the goal.value
- tooltip.maxRadius is the max distance of the mouse from the point to call the tooltipCallback.
- every **Color object (strokeColor, fillColor...) is an array whose length is the number of data series.
- lines.curve draws the lines in a smoother way with the canvas quadraticCurveTo function.



the 'tooltipCallback' is a callback called everytime the mouse moves over the chart. An example of tooltipCallback can be this:


```js
	function(tooltip){
		if(tooltip.found){
			tool=$("<div id='tooltip'>");
			tool.appendTo("body");
			tool.html(tooltip.point.value);
			tool.css({top:tooltip.mouse.pageY-40, left: tooltip.mouse.pageX})
		}else{
			$("#tooltip").remove();
		}
	}
```

the t object is composed by:

```js
	t = {
		found: false
		point: { x: canvas_x, y: canvas_y, date: 'date in millis', value: 'the value of the point'}
		mouse: { pageX: 'x of the mouse (in the document)', pageY: 'y of the mouse (in the document)'}
	}
```	
