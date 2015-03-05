// Pista jQuery/zepto plugin version 0.2
// (c) 2012-2015 Francesco Marassi
// This work is licensed under the MIT License.


(function($, document) {
  var pista = $.fn.pista = function(data, options, hoverCb) {
    if (document.createElement("canvas").getContext) {
      this.each(function() {
          opts=$.extend(true, {}, pista.defaults, options)
          pista.graphers.call(this, data, opts, hoverCb)
      });
    }

    return this;
  };
  
  var u={
	  getTime:function(string_date){
		return new Date(string_date).getTime();
	  },
	  tooltipEvent:function(){
		  //TODO: check if the client is touch, then return 'touchend'
		  return 'mousemove';
	  },
	  createCanvas:function(width,height){
	    var canvas = document.createElement("canvas");
	  	canvas.setAttribute("width", width * devicePixelRatio)
	  	canvas.setAttribute("height", height * devicePixelRatio)
	  	if (devicePixelRatio != 1) {
	  		var style = "width:" + width + "px;height:" + height + "px"
	  		canvas.setAttribute("style", style)
	  	}
	  	return canvas
	  },
	  getYValues:function(elements, _y, goal){
		var y={}
		for(var i=0;i<elements.length;i++){
			
			var data=elements[i].data;
			
			for(var j=0;j<data.length;j++){
	  		  e=data[j].value;
	  		  if(i==0 & j==0){
	  			  y.min=y.max=e
	  		  }else{
	  			  y.min=Math.min(y.min, e)
	  			  y.max=Math.max(y.max, e)
	  		  }
			}
		}
		  
		if(_y.max){y.max= _y.max;}
		if(_y.min){y.min= _y.min;}
		
		if(goal.show){
		  	y.max=Math.max(y.max, goal.value);
			y.min=Math.min(y.min, goal.value);
		}
		  
		y.marginMin=y.min-y.min*_y.margin;
		y.marginMax=y.max+y.max*_y.margin;
		y.margin= (y.marginMax-y.marginMin)*_y.margin
		return y;
		},
		
	  getXValues:function(elements, _x){
		  var x={}
  		  for(var i=0;i<elements.length;i++){
			  var data=elements[i].data
			  if(i==0){
	 			 x.max=u.getTime(data[data.length-1].date);
	 			 x.min=u.getTime(data[0].date);
			  }else{
			 	 x.max=Math.max(x.max, u.getTime(data[data.length-1].date));
			 	x.min=Math.min(x.min, u.getTime(data[0].date));
		 	  }
  		  }
		  if(_x.max){x.max=u.getTime(_x.max)}
		  if(_x.min){x.min=u.getTime(_x.min)}
		  x.margin= _x.margin;
		  return x;
	  },
	  line:function(context, start,end, curve){
		if(curve){
			var mid={
				x: (start.x+end.x)/2, 
				y: (start.y+end.y)/2
			};
			// Draw line connecting the two points:
			context.quadraticCurveTo((start.x + mid.x) / 2, start.y, mid.x, mid.y);
			context.quadraticCurveTo((mid.x + end.x) / 2, end.y, end.x, end.y);
		}else{
			context.lineTo(end.x,end.y);
		}
	  },
	  fDate:function(d){
  		return d.getMonth()+1 + "/"+d.getDate();
	  },
	  deltaDays: function(min, max){
		  var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		  return Math.round(Math.abs((min - max)/(oneDay)));
	  }
  }
  
  mainColor="#3BAFD7";
  secondaryColor="#E1523D"
  pista.defaults = {
      height: 100,
      width: 100,
	  x:{margin:15, min: null, max:null},
	  y:{margin:0.2, min:null, max:null},
	  goal: {show:false, value:23, color: mainColor},
	  tooltip: {show:true, maxRadius: 3},
	  lines: {show: true, fill: false, curve:false, strokeColor: [mainColor, secondaryColor], strokeWidth: 4, fillOpacity: 0.4, fillColor:[mainColor, secondaryColor]},
	  points:{show: true, strokeWidth:3.5, strokeColor:[mainColor, secondaryColor]},
	  labels:{
		  lineWidth: 0.3,
		  fontSize: 11,
		  x:{number: 7, show:true, color:"#858585", grid:false },
		  y:{number:4, show:true, color:"#858585", grid:true}}
    };

  var devicePixelRatio = window.devicePixelRatio || 1

  function log(tag, what){
	  console.log(tag+":");
	  console.log(what);
	  console.log("---");
  }
  
 
  pista.graphers=
    function(elements, opts, cb) {
		//the data will be in the format
		// [
		// 	{value:0, date: MM/dd/yyyy}, 
		// 	{value:0, date: 12/07/2012}, 
		// 	{value:0, date: 12/07/2012},
		// ]
		
		///////////////////////// GENERATE LABELS ////////////////////////////////////////////
		
		var canvas = u.createCanvas(opts.width, opts.height)
    	var context = canvas.getContext("2d");
    	var width = canvas.width;
    	var height = canvas.height;
		var marginBottom=20;
		if(opts.labels.x.show){
			
		}
		var y=u.getYValues(elements, opts.y, opts.goal);
		var x=u.getXValues(elements, opts.x);
		
		x.marginLeft=0;
		var canvasHeight=height-marginBottom;
		if(opts.labels.y.show){
			number=opts.labels.y.number;
			var labelHeight=canvasHeight/number;
			range=y.marginMax-y.marginMin;
			add=range/number;
			y.labels=[]
			context.fillStyle=opts.labels.y.color;
			context.lineStyle=opts.labels.y.color;
			context.strokeStyle="#D2D2D2";
			context.font=opts.labels.fontSize+"px" + $(this).css("font-family");
			
			var yMaxLength=0;
			for(var i=0; i<number; i++){
				v={y: canvasHeight-labelHeight*i, value: (y.marginMin+(add*i)).toFixed(2)}
				y.labels.push(v)
				context.fillText(v.value,1,v.y+3);
				//get the most long length to calculate the x.marginLeft
				if(i==0){yMaxLength=v.value.length}else{yMaxLength=Math.max(v.value.length, yMaxLength)}
			}
			
			x.marginLeft=x.margin + yMaxLength*(opts.labels.fontSize/2);
			if(opts.labels.y.grid){
				for(var i=0; i<y.labels.length;i++){
					v=y.labels[i].y;
					context.beginPath();
					context.lineWidth=opts.labels.lineWidth;
					context.moveTo(x.marginLeft, v);
					context.lineTo(width, v);
					context.closePath();
					context.stroke();
				}
			}	
		}
		if(opts.labels.x.show){
			number=elements.length;
			e=opts.labels.x.number;
			days=u.deltaDays(x.min, x.max)
			if(days<=e){
				skip=1;
			}else{
				skip=((days/e)).toFixed();
			}
			var labelWidth=(width-x.marginLeft-x.margin)/days;
			range=x.max-x.min;
			add=range/days;
			x.labels=[]
			context.fillStyle=opts.labels.y.color;
			context.lineStyle=opts.labels.y.color;
			context.strokeStyle="#D2D2D2";
			context.font=opts.labels.fontSize+"px" + $(this).css("font-family");
			
			for(var i=0;i<days;i++){
				if(i%skip==0){
					v={x:labelWidth*i, value: parseInt((x.min + (add*i)))}
					x.labels.push(v)
					context.textAlign='center';
					//log("date "+i, v.value);
					context.fillText(u.fDate(new Date(v.value)),x.marginLeft+v.x,height-4);
				
					if(opts.labels.x.grid){
						context.beginPath();
						context.lineWidth=opts.labels.lineWidth;
						context.moveTo(x.marginLeft+v.x, canvasHeight+5);
						context.lineTo(x.marginLeft+v.x, marginBottom);
						context.closePath();
						context.stroke();
					}	
				}
			}
			
		}
		
    	x.quotient = (width-(x.margin+ x.marginLeft)) / (x.max- x.min);
    	y.quotient = (canvasHeight) / (y.marginMax - y.marginMin);
    	var g_coords = [];
    	var i;
		
		///////////////////////// CREATE THE COORDS OBJECTS ////////////////////////////////////////////

		for (i = 0; i < elements.length; i++) {
			var data=elements[i].data;
			g_coords[i]=[]
			for(j=0;j<data.length;j++){
				var e=data[j]
				var time=u.getTime(e.date);
				var cx = ((time-x.min) * x.quotient)+x.marginLeft;
				var cy =canvasHeight - (y.quotient * (e.value - y.marginMin));
				g_coords[i].push({ x: cx, y: cy, date: time, value: e.value });
				
			}
		}
		
		
		///////////////////////// BEGIN DRAWING THE BACKGROUND ////////////////////////////////////////////
    	
		for(c=g_coords.length-1;c>=0;c--){
			coords=g_coords[c];
			if(coords.length>0){
				if(opts.lines.fill){
					context.beginPath();
					context.moveTo(coords[0].x, canvasHeight)
					context.lineTo(coords[0].x, coords[0].y)
					context.globalAlpha = opts.lines.fillOpacity;
					for (i = 0; i < coords.length - 1; i ++){
						
						u.line(context,coords[i], coords[i+1], opts.lines.curve)
					}
			
					context.fillStyle = opts.lines.fillColor[c];
					context.lineTo(coords[coords.length-1].x, canvasHeight);
					context.closePath();
					context.fill();
				}
				context.globalAlpha=1;
				
		
				///////////////////////// DRAW LINES ////////////////////////////////////////////
			
			
				if(opts.lines.show){
					context.beginPath();
					context.moveTo(coords[0].x, coords[0].y);
					for (i = 0; i < coords.length-1; i++) {
						u.line(context, coords[i], coords[i+1], opts.lines.curve)
					}
					context.lineWidth = opts.lines.strokeWidth * devicePixelRatio;
					context.strokeStyle = opts.lines.strokeColor[c];
					context.stroke();
				}
			
				///////////////////////// DRAW CIRCLES ////////////////////////////////////////////
				if(opts.points.show){
				
					for (i = 0; i < coords.length; i++) {
						var start=coords[i];
						// Draw line connecting the two points:
						context.beginPath();
						context.arc(start.x, start.y, opts.points.strokeWidth, 0, 2 * Math.PI);
						context.fillStyle=opts.points.strokeColor[c] || opts.lines.strokeColor[c];
						context.fill();
						context.strokeStyle=opts.points.strokeColor[c] || opts.lines.strokeColor[c];
						context.stroke();
					}
				
				}
			}
		}
		
			
			///////////////////////// DRAW GOAL ////////////////////////////////////////////
			
			
			if(opts.goal.show){
				var cy =canvasHeight- (y.quotient * (opts.goal.value - y.marginMin));
				context.beginPath();
				context.moveTo(x.marginLeft, cy);
				context.lineTo(width, cy);
				context.fillStyle=opts.points.strokeColor || opts.lines.strokeColor;
				context.lineWidth=2;
				context.fill();
				context.strokeStyle=opts.goal.color || opts.lines.strokeColor[0];
				context.stroke();
			}
						
						
						
			///////////////////////// EVENT FOR TOOLTIP ////////////////////////////////////////////
			
			
			if(opts.tooltip.show){
				canvas.addEventListener(u.tooltipEvent(), function(e) {
					var mouse={};
					
					if (e.pageX || e.pageY) { 
					  mouse.x = e.pageX;mouse.y = e.pageY;
					}
					else { 
					  mouse.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
					  mouse.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
					} 
					mouse.x -= canvas.offsetLeft;
					mouse.y -= canvas.offsetTop;
					var notFound=true;
					for(c=0;c<g_coords.length;c++){
						for (i = 0; i < g_coords[c].length; i++) {
							point=g_coords[c][i];
							if((Math.abs(point.x-mouse.x)<opts.points.strokeWidth*opts.tooltip.maxRadius) & (Math.abs(point.y-mouse.y)<opts.points.strokeWidth*opts.tooltip.maxRadius)){
								notFound=false;
								if(cb){cb({found:true, point: point, mouse: e})};
							}
						}
					}
					
					if(notFound && cb){cb({found:false})}
					
				}, false);
			}
		
		$(this).append(canvas);	
    }
	
})($, document);
