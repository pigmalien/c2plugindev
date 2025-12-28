// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.SysTime = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.SysTime.prototype;
		
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
		this.timers = {};
		
		// Properties
		this.timescaleMode = this.properties[0]; // 0 = Normal, 1 = dt-independent
		this.precision = this.properties[1];     // 0 = Seconds, 1 = Milliseconds
		
		this.lastRealTime = Date.now();
		this.triggerTimerName = "";
		
		this.runtime.tickMe(this);
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
		this.timers = {};
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			"timers": this.timers,
			"lastRealTime": this.lastRealTime
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
		
		if (o["timers"]) this.timers = o["timers"];
		if (o["lastRealTime"]) this.lastRealTime = o["lastRealTime"];
		
		// Reset real time to now to avoid huge jump after load
		this.lastRealTime = Date.now();
	};
	
	instanceProto.tick = function()
	{
		var now = Date.now();
		if (!this.lastRealTime) this.lastRealTime = now;
		var realDt = (now - this.lastRealTime) / 1000.0;
		this.lastRealTime = now;
		
		var dt = (this.timescaleMode === 0) ? this.runtime.getDt() : realDt;
		if (typeof dt !== "number" || isNaN(dt)) dt = 0;
		
		for (var name in this.timers)
		{
			if (this.timers.hasOwnProperty(name))
			{
				var timer = this.timers[name];
				if (timer.active)
				{
					timer.elapsed += dt;
					
					if (timer.elapsed >= timer.duration)
					{
						this.triggerTimerName = name;
						this.runtime.trigger(cr.plugins_.SysTime.prototype.cnds.OnTimer, this);
						
						if (timer.loopCount > 1) {
							timer.loopCount--;
							timer.elapsed = 0;
						} else {
							timer.active = false;
						}
					}
				}
			}
		}
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
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
		// propsections.push({
		// 	"title": "My debugger section",
		// 	"properties": [
		// 	]
		// });
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnTimerStart = function (name)
	{
		return cr.equals_nocase(name, this.triggerTimerName);
	};
	
	Cnds.prototype.OnTimer = function (name)
	{
		return cr.equals_nocase(name, this.triggerTimerName);
	};
	
	Cnds.prototype.IsTimerRunning = function (name)
	{
		if (this.timers.hasOwnProperty(name))
			return this.timers[name].active;
		return false;
	};
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.StartTimer = function (name, duration, loopCount)
	{
		duration = parseFloat(duration);
		loopCount = parseInt(loopCount, 10);

		if (isNaN(duration)) duration = 0;
		if (isNaN(loopCount)) loopCount = 1;

		// Convert duration to seconds if precision is Milliseconds
		var dur = (this.precision === 1) ? (duration / 1000.0) : duration;
		
		this.timers[name] = {
			duration: dur,
			elapsed: 0,
			loopCount: loopCount,
			active: true
		};

		this.triggerTimerName = name;
		this.runtime.trigger(cr.plugins_.SysTime.prototype.cnds.OnTimerStart, this);
	};
	
	Acts.prototype.SyncToValue = function (name, val)
	{
		val = parseFloat(val);
		if (isNaN(val)) val = 0;

		if (this.timers.hasOwnProperty(name))
		{
			// Convert input value to seconds if needed
			var v = (this.precision === 1) ? (val / 1000.0) : val;
			this.timers[name].elapsed = v;
		}
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.TimeRemaining = function (ret, name)
	{
		var val = 0;
		if (this.timers.hasOwnProperty(name)) {
			var t = this.timers[name];
			val = t.duration - t.elapsed;
			if (val < 0) val = 0;
		}
		if (this.precision === 1) val *= 1000;
		ret.set_float(val);
	};
	
	Exps.prototype.TimeElapsed = function (ret, name)
	{
		var val = 0;
		if (this.timers.hasOwnProperty(name)) {
			val = this.timers[name].elapsed;
		}
		if (this.precision === 1) val *= 1000;
		ret.set_float(val);
	};
	
	Exps.prototype.TimeElapsedNormalised = function (ret, name)
	{
		var val = 0;
		if (this.timers.hasOwnProperty(name)) {
			var t = this.timers[name];
			if (t.duration > 0)
				val = t.elapsed / t.duration;
			else
				val = 1;
		}

		// Clamp 0-1
		if (val < 0) val = 0;
		if (val > 1) val = 1;
		ret.set_float(val);
	};
	
	pluginProto.exps = new Exps();

}());