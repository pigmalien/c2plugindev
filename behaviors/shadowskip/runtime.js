// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvvvv
cr.behaviors.ShadowSkip = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js	
	var behaviorProto = cr.behaviors.ShadowSkip.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.amplitude = this.properties[0];
		this.frequency = this.properties[1];
		this.squashRatio = this.properties[2];
		this.leanAmount = this.properties[3];
		this.isEnabled = (this.properties[4] === 0); // 0=Enabled, 1=Disabled
		this.flipMode = this.properties[6]; // 0=None, 1=Horizontal
		this.puppetImagePoint = this.properties[7] || "";
		
		// Get the child object type from the container property
		// [Inference] Construct 2 requires finding the object type by name since ept_object is C3-only.
		var typeName = this.properties[5];
		this.puppetType = this.runtime.types[typeName.toLowerCase()] || this.runtime.types[typeName];

		this.timer = 0;
		this.bounce = 0;
		this.lastX = this.inst.x;
		this.lastY = this.inst.y;
		this.initialPuppetWidth = -1; // Will be set on first tick when puppet is available
		this.initialPuppetHeight = -1; // Will be set on first tick when puppet is available
		this.isFlipped = false;
		this.flipTimer = 0;
		this.myPuppet = null;
		this.leanRadians = cr.to_radians(this.leanAmount);
		this.wasDisabled = false;
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		return {
			"amp": this.amplitude,
			"freq": this.frequency,
			"sqr": this.squashRatio,
			"lean": this.leanAmount,
			"en": this.isEnabled,
			"timer": this.timer,
			"bounce": this.bounce,
			"lx": this.lastX,
			"ly": this.lastY,
			"iw": this.initialPuppetWidth,
			"ih": this.initialPuppetHeight,
			"flip": this.isFlipped,
			"fm": this.flipMode,
			"pip": this.puppetImagePoint,
			"ft": this.flipTimer,
			"wd": this.wasDisabled
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.amplitude = o["amp"];
		this.frequency = o["freq"];
		this.squashRatio = o["sqr"];
		this.leanAmount = o["lean"];
		this.isEnabled = o["en"];
		this.timer = o["timer"];
		this.bounce = o["bounce"];
		this.lastX = o["lx"];
		this.lastY = o["ly"];
		this.initialPuppetWidth = o["iw"];
		this.initialPuppetHeight = o["ih"];
		this.isFlipped = o["flip"];
		this.flipMode = o["fm"];
		this.puppetImagePoint = o["pip"] || "";
		this.flipTimer = o["ft"] || 0;
		this.wasDisabled = o["wd"] || false;
		
		// Re-get puppetType as it's a reference and not saved directly
		this.puppetType = this.runtime.types[this.properties[5].toLowerCase()] || this.runtime.types[this.properties[5]];
	};

	behinstProto.tick = function ()
	{
		var inst = this.inst; // The Shadow (Movement Object)
		var dt = this.runtime.getDt(inst);
		
		// 1. Cache puppet reference
		if (!this.myPuppet) {
			if (!this.puppetType) return;
			this.myPuppet = this.puppetType.getFirstPicked(inst);
			if (!this.myPuppet) return;
		}
		var puppet = this.myPuppet;

		// If disabled, reset once and exit
		if (!this.isEnabled) {
			if (!this.wasDisabled) {
				puppet.x = inst.x;
				puppet.y = inst.y;
				puppet.angle = 0;
				if (this.initialPuppetWidth !== -1) {
					puppet.width = this.isFlipped ? -this.initialPuppetWidth : this.initialPuppetWidth;
					puppet.height = this.initialPuppetHeight;
				}
				puppet.set_bbox_changed();

				if (this.puppetImagePoint !== "" && typeof puppet.getImagePoint === "function") {
					puppet.x -= (puppet.getImagePoint(this.puppetImagePoint, 1) - inst.x);
					puppet.y -= (puppet.getImagePoint(this.puppetImagePoint, 0) - inst.y);
				}
				puppet.opacity = 1;
				puppet.set_bbox_changed();
				inst.opacity = 1;
				this.wasDisabled = true;
			}
			return;
		}
		this.wasDisabled = false;

		// Initialize base dimensions if not already done
		if (this.initialPuppetWidth === -1 && Math.abs(puppet.width) > 0.01) {
			this.initialPuppetWidth = Math.abs(puppet.width);
			this.initialPuppetHeight = puppet.height;
			this.isFlipped = (puppet.width < 0);
			this.leanRadians = cr.to_radians(this.leanAmount);
		}

		// Do not update puppet until initial dimensions are captured
		if (this.initialPuppetWidth === -1) return;

		// 2. Movement Logic
		var ix = inst.x;
		var iy = inst.y;
		var dx = ix - this.lastX;
		var dy = iy - this.lastY;
		// Squared distance check is faster than multiple Math.abs calls
		var isMoving = (dx * dx + dy * dy) > 0.01;
		
		// 3. Optimized Flip & Timer
		if (this.flipMode === 1) {
			if (this.flipTimer > 0) {
				this.flipTimer -= dt;
			} else {
				if (dx < -0.01) {
					this.isFlipped = true;
					this.flipTimer = 0.05;
				} else if (dx > 0.01) {
					this.isFlipped = false;
					this.flipTimer = 0.05;
				}
			}
		}

		this.lastX = ix;
		this.lastY = iy;

		if (isMoving) {
			this.timer += dt * this.frequency;
			this.bounce = Math.abs(Math.sin(this.timer)) * this.amplitude;
		} else if (this.bounce > 0) {
			this.bounce = cr.lerp(this.bounce, 0, 0.2);
			if (this.bounce < 0.1) {
				this.bounce = 0;
				this.timer = 0;
			}
		}

		// 4. SMART UPDATE: Only touch the puppet if it's animating or moving
		if (isMoving || this.bounce > 0) {
			var targetY = iy - this.bounce;
			var s = (this.amplitude > 0) ? (this.bounce / this.amplitude) : 0;
			var w = Math.max(0.1, this.initialPuppetWidth + (s * (this.initialPuppetWidth * this.squashRatio)));
			var h = Math.max(0.1, this.initialPuppetHeight - (s * (this.initialPuppetHeight * this.squashRatio)));
			
			puppet.x = ix;
			puppet.y = targetY;
			puppet.width = this.isFlipped ? -w : w;
			puppet.height = h;
			puppet.angle = Math.sin(this.timer) * this.leanRadians * (isMoving ? 1 : Math.min(s, 1));
			puppet.set_bbox_changed();

			if (this.puppetImagePoint !== "" && typeof puppet.getImagePoint === "function") {
				puppet.x -= (puppet.getImagePoint(this.puppetImagePoint, 1) - ix);
				puppet.y -= (puppet.getImagePoint(this.puppetImagePoint, 0) - targetY);
				puppet.set_bbox_changed();
			}

			inst.opacity = 1 - (s * 0.5);
		} else {
			puppet.x = ix;
			puppet.y = iy;
			puppet.angle = 0;
			puppet.set_bbox_changed();
			if (this.puppetImagePoint !== "" && typeof puppet.getImagePoint === "function") {
				puppet.x -= (puppet.getImagePoint(this.puppetImagePoint, 1) - ix);
				puppet.y -= (puppet.getImagePoint(this.puppetImagePoint, 0) - iy);
			}
			puppet.set_bbox_changed();
		}
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": this.type.name,
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property				
				{"name": "Enabled", "value": this.isEnabled, "readonly": true},
				{"name": "Amplitude", "value": this.amplitude},
				{"name": "Frequency", "value": this.frequency},
				{"name": "Squash Ratio", "value": this.squashRatio},
				{"name": "Lean Amount", "value": this.leanAmount},
				{"name": "Current Bounce", "value": this.bounce.toFixed(2), "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) {
			case "Amplitude": this.amplitude = value; break;
			case "Frequency": this.frequency = value; break;
			case "Squash Ratio": this.squashRatio = value; break;
			case "Lean Amount": 
				this.leanAmount = value; 
				this.leanRadians = cr.to_radians(value);
				break;
		}
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	Cnds.prototype.IsEnabled = function () { return this.isEnabled; };
	behaviorProto.cnds = new Cnds();
	//////////////////////////////////////
	// Actions
	function Acts() {};
	Acts.prototype.SetEnabled = function (state)
	{
		this.isEnabled = (state === 0); // 0=Enabled, 1=Disabled
	};
	behaviorProto.acts = new Acts();
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	behaviorProto.exps = new Exps();
}());