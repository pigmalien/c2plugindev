// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.RadialGauge = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.RadialGauge.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		this.startAngle = cr.to_radians(this.properties[0]);
		this.spanAngle = cr.to_radians(this.properties[1]);
		this.thickness = this.properties[2];
		this.animationMode = this.properties[3]; // 0=Linear, 1=Smooth
		this.lerpSpeed = this.properties[4];
		this.useSegments = (this.properties[5] === 1); // 0=No, 1=Yes
		this.maxValue = this.properties[6];

		this.segmentCount = 10;
		this.colorMode = 0; // 0 = Auto, 1 = Fixed
		this.fixedColor = "rgb(255,255,255)";
		this.wasAnimating = false;

		this.currentDisplayValue = 0;
		this.targetValue = 0;
		this.needsRedraw = true;

		this.runtime.tickMe(this);
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};

	instanceProto.tick = function ()
	{
		var isAnimating = this.currentDisplayValue !== this.targetValue;
		
		if (isAnimating)
		{
			var dt = this.runtime.getDt(this);
			
			if (this.animationMode === 0) // Linear
			{
				var step = this.lerpSpeed * dt;
				if (this.currentDisplayValue < this.targetValue) {
					this.currentDisplayValue += step;
					if (this.currentDisplayValue > this.targetValue)
						this.currentDisplayValue = this.targetValue;
				} else {
					this.currentDisplayValue -= step;
					if (this.currentDisplayValue < this.targetValue)
						this.currentDisplayValue = this.targetValue;
				}
			}
			else // Smooth
			{
				var factor = this.lerpSpeed * 60 * dt;
				if (factor > 1) factor = 1;
				this.currentDisplayValue = cr.lerp(this.currentDisplayValue, this.targetValue, factor);
				
				if (Math.abs(this.currentDisplayValue - this.targetValue) < 0.01)
					this.currentDisplayValue = this.targetValue;
			}
			
			if (this.currentDisplayValue === this.targetValue)
				isAnimating = false;
				
			this.needsRedraw = true;
			this.runtime.redraw = true;
		}
		
		if (this.wasAnimating && !isAnimating)
		{
			this.runtime.trigger(cr.plugins_.RadialGauge.prototype.cnds.OnValueReached, this);
		}
		
		this.wasAnimating = isAnimating;
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
		this.drawGauge(ctx, this.width, this.height);
	};

	instanceProto.drawGauge = function(ctx, width, height)
	{
		ctx.clearRect(0, 0, width, height);
		
		var cx = width / 2;
		var cy = height / 2;
		var radius = (Math.min(width, height) / 2) - (this.thickness / 2);
		
		if (radius < 0) radius = 0;

		var ratio = cr.clamp(this.currentDisplayValue / this.maxValue, 0, 1);
		
		if (this.useSegments)
		{
			var count = this.segmentCount || 10;
			var segSpan = this.spanAngle / count;
			var gap = segSpan * 0.1; // 10% gap
			var blockSpan = segSpan - gap;
			
			for (var i = 0; i < count; i++) {
				var angle = this.startAngle + (i * segSpan);
				var blockThreshold = (i + 1) / count;
				
				// Determine if this block is active (lit)
				// Simple logic: if ratio covers the block index
				var isLit = ratio > (i / count);
				
				ctx.beginPath();
				ctx.arc(cx, cy, radius, angle, angle + blockSpan, false);
				
				if (isLit) {
					if (this.colorMode === 0) {
						// Auto: Green to Red
						var r = Math.floor(cr.lerp(0, 255, ratio));
						var g = Math.floor(cr.lerp(255, 0, ratio));
						ctx.strokeStyle = "rgb(" + r + "," + g + ",0)";
					} else {
						ctx.strokeStyle = this.fixedColor;
					}
				} else {
					ctx.strokeStyle = "rgba(0,0,0,0.1)";
				}
				
				ctx.lineWidth = this.thickness;
				ctx.lineCap = "butt"; // Blocky ends
				ctx.stroke();
			}
		}
		else
		{
		// Background track
		ctx.beginPath();
		ctx.arc(cx, cy, radius, this.startAngle, this.startAngle + this.spanAngle, false);
		ctx.lineWidth = this.thickness;
		ctx.strokeStyle = "rgba(0,0,0,0.1)";
		ctx.lineCap = "round";
		ctx.stroke();

		// Value arc
		ctx.beginPath();
		var endAngle = this.startAngle + (this.spanAngle * ratio);
		ctx.arc(cx, cy, radius, this.startAngle, endAngle, false);
		
		// Dynamic color: Green to Red
		if (this.colorMode === 0) {
			var r = Math.floor(cr.lerp(0, 255, ratio));
			var g = Math.floor(cr.lerp(255, 0, ratio));
			ctx.strokeStyle = "rgb(" + r + "," + g + ",0)";
		} else {
			ctx.strokeStyle = this.fixedColor;
		}
		
		ctx.lineWidth = this.thickness;
		ctx.lineCap = "round";
		ctx.stroke();
		}
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
		glw.setOpacity(this.opacity);
		
		var width = this.width;
		var height = this.height;
		
		if (width < 1 || height < 1) return;
		
		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			this.ctx = this.canvas.getContext("2d");
		}
		
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.needsRedraw = true;
		}
		
		if (this.needsRedraw) {
			this.drawGauge(this.ctx, width, height);
			
			if (!this.texture)
				this.texture = glw.createEmptyTexture(width, height, this.runtime.linearSampling, false);
				
			glw.videoToTexture(this.canvas, this.texture);
			this.needsRedraw = false;
		}
		
		if (this.texture) {
			glw.setTexture(this.texture);
			var q = this.bquad;
			glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "Value")
			this.targetValue = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.IsAnimating = function ()
	{
		return this.currentDisplayValue !== this.targetValue;
	};

	Cnds.prototype.CompareValue = function (cmp, val)
	{
		return cr.do_cmp(this.currentDisplayValue, cmp, val);
	};
	
	Cnds.prototype.IsPercentage = function (cmp, val)
	{
		return cr.do_cmp(this.currentDisplayValue / this.maxValue, cmp, val);
	};

	Cnds.prototype.OnValueReached = function ()
	{
		return true;
	};

	Cnds.prototype.IsInRange = function (low, high)
	{
		return (this.currentDisplayValue >= low && this.currentDisplayValue <= high);
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetValue = function (val)
	{
		this.targetValue = val;
		this.runtime.redraw = true;
	};
	
	Acts.prototype.SetMaxValue = function (val)
	{
		this.maxValue = val;
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetLerpSpeed = function (val)
	{
		this.lerpSpeed = val;
	};
	
	Acts.prototype.SnapValue = function (val)
	{
		this.targetValue = val;
		this.currentDisplayValue = val;
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};
	
	Acts.prototype.SetRange = function (start, span)
	{
		this.startAngle = cr.to_radians(start);
		this.spanAngle = cr.to_radians(span);
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetAppearance = function (thickness, speed)
	{
		this.thickness = thickness;
		this.lerpSpeed = speed;
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetSegments = function (mode, count)
	{
		this.useSegments = (mode === 1);
		this.segmentCount = count;
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetColorMode = function (mode)
	{
		this.colorMode = mode;
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};

	Acts.prototype.SetColor = function (r, g, b)
	{
		this.fixedColor = "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
		this.needsRedraw = true;
		this.runtime.redraw = true;
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.Value = function (ret)
	{
		ret.set_float(this.currentDisplayValue);
	};

	Exps.prototype.TargetValue = function (ret)
	{
		ret.set_float(this.targetValue);
	};

	Exps.prototype.MaxValue = function (ret)
	{
		ret.set_float(this.maxValue);
	};
	
	Exps.prototype.Percentage = function (ret)
	{
		ret.set_float((this.currentDisplayValue / this.maxValue) * 100);
	};

	Exps.prototype.AngleAtValue = function (ret, val)
	{
		var r = val / this.maxValue;
		var ang = this.startAngle + (this.spanAngle * r);
		ret.set_float(cr.to_degrees(ang));
	};

	Exps.prototype.Thickness = function (ret)
	{
		ret.set_float(this.thickness);
	};
	
	pluginProto.exps = new Exps();

}());