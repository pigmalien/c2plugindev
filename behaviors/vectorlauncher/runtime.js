﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvvvvvv
cr.behaviors.VectorLauncher = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvvvvvv
	var behaviorProto = cr.behaviors.VectorLauncher.prototype;
		
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
		this.maxPull = this.properties[0];
		this.maxForce = this.properties[1];
		this.gravity = this.properties[2];
		this.cooldownTime = this.properties[3];
		this.pathMode = this.properties[4]; // 0=Gravity, 1=Spline
		this.enabled = (this.properties[5] !== 0);
		this.dragScale = this.properties[6];
		
		// State Machine: 0=IDLE, 1=READY, 2=DRAGGING, 3=COOLDOWN, 4=MOVING
		this.state = 0;
		this.projectileUid = -1;
		this.cooldownTimer = 0;

		// Drag & Launch variables
		this.dragX = this.inst.x;
		this.dragY = this.inst.y;
		this.launchVx = 0;
		this.launchVy = 0;

		// Movement variables
		this.flightTime = 0;
		this.totalDuration = 0;
		this.startX = 0;
		this.startY = 0;
		this.targetX = 0;
		this.targetY = 0;
		this.controlX = 0;
		this.controlY = 0;

		// Input handling
		var self = this;
		this.onMouseDownBound = function(info) { self.onMouseDown(info); };
		this.onMouseMoveBound = function(info) { self.onMouseMove(info); };
		this.onMouseUpBound = function(info) { self.onMouseUp(info); };
		
		jQuery(document).on("mousedown touchstart", this.onMouseDownBound);
		jQuery(document).on("mousemove touchmove", this.onMouseMoveBound);
		jQuery(document).on("mouseup touchend", this.onMouseUpBound);

		this.runtime.tickMe(this);
	};
	
	behinstProto.onDestroy = function ()
	{
		jQuery(document).off("mousedown touchstart", this.onMouseDownBound);
		jQuery(document).off("mousemove touchmove", this.onMouseMoveBound);
		jQuery(document).off("mouseup touchend", this.onMouseUpBound);
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"state": this.state,
			"puid": this.projectileUid,
			"cd": this.cooldownTimer,
			"ft": this.flightTime,
			"td": this.totalDuration,
			"sx": this.startX,
			"sy": this.startY,
			"tx": this.targetX,
			"ty": this.targetY,
			"cx": this.controlX,
			"cy": this.controlY,
			"lvx": this.launchVx,
			"lvy": this.launchVy,
			"en": this.enabled,
			"dsc": this.dragScale
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		this.state = o["state"];
		this.projectileUid = o["puid"];
		this.cooldownTimer = o["cd"];
		this.flightTime = o["ft"] || 0;
		this.totalDuration = o["td"] || 0;
		this.startX = o["sx"] || 0;
		this.startY = o["sy"] || 0;
		this.targetX = o["tx"] || 0;
		this.targetY = o["ty"] || 0;
		this.controlX = o["cx"] || 0;
		this.controlY = o["cy"] || 0;
		this.launchVx = o["lvx"] || 0;
		this.launchVy = o["lvy"] || 0;
		this.enabled = (typeof o["en"] !== "undefined" ? o["en"] : true);
		this.dragScale = (typeof o["dsc"] !== "undefined" ? o["dsc"] : 1.0);
	};

	behinstProto.tick = function ()
	{
		if (!this.enabled) return;

		var dt = this.runtime.getDt(this.inst);
		
		// Handle Cooldown
		if (this.state === 3) // COOLDOWN
		{
			this.cooldownTimer -= dt;
			if (this.cooldownTimer <= 0)
			{
				this.state = 0; // IDLE
				this.runtime.trigger(cr.behaviors.VectorLauncher.prototype.cnds.OnCooldownEnd, this.inst);
			}
		}
		
		// Sync Projectile Position
		if (this.state === 1 || this.state === 2) // READY or DRAGGING
		{
			var proj = this.runtime.getObjectByUID(this.projectileUid);
			if (proj)
			{
				if (this.state === 1) // READY: Lock to anchor
				{
					proj.x = this.inst.x;
					proj.y = this.inst.y;
					proj.set_bbox_changed();
				}
				else if (this.state === 2) // DRAGGING: Lock to drag position
				{
					proj.x = this.dragX;
					proj.y = this.dragY;
					proj.set_bbox_changed();
				}
			}
			else
			{
				// Projectile lost/destroyed
				this.state = 0;
			}
		}
	};
	
	behinstProto.getMousePos = function (info)
	{
		var offset = jQuery(this.runtime.canvas).offset();
		var pageX = info.pageX;
		var pageY = info.pageY;
		
		if (info.originalEvent && info.originalEvent.touches && info.originalEvent.touches.length > 0) {
			pageX = info.originalEvent.touches[0].pageX;
			pageY = info.originalEvent.touches[0].pageY;
		} else if (info.changedTouches && info.changedTouches.length > 0) {
			pageX = info.changedTouches[0].pageX;
			pageY = info.changedTouches[0].pageY;
		}

		var mx = pageX - offset.left;
		var my = pageY - offset.top;
		
		// Adjust for CSS scaling (High DPI / Fullscreen scaling)
		var canvas = this.runtime.canvas;
		var cssWidth = jQuery(canvas).width();
		var cssHeight = jQuery(canvas).height();
		if (cssWidth > 0 && cssHeight > 0) {
			mx *= (canvas.width / cssWidth);
			my *= (canvas.height / cssHeight);
		}
		
		// Try using the layer's method first
		if (this.inst.layer && typeof this.inst.layer.canvasToLayout === "function")
		{
			return {
				x: this.inst.layer.canvasToLayout(mx, my),
				y: this.inst.layer.canvasToLayout(mx, my, true)
			};
		}
		
		// Fallback: Manual calculation
		var layer = this.inst.layer;
		if (!layer && this.runtime.running_layout && this.runtime.running_layout.layers.length > 0)
			layer = this.runtime.running_layout.layers[0];
			
		if (layer)
		{
			var scale = (layer.getScale ? layer.getScale() : (layer.scale || 1));
			
			// Calculate viewLeft/Top manually if missing (e.g. older C2 versions or specific contexts)
			var vLeft = layer.viewLeft;
			var vTop = layer.viewTop;
			
			if (typeof vLeft === "undefined" || typeof vTop === "undefined") {
				var layout = this.runtime.running_layout;
				var parallaxX = (typeof layer.parallaxX !== "undefined") ? layer.parallaxX : 1;
				var parallaxY = (typeof layer.parallaxY !== "undefined") ? layer.parallaxY : 1;
				var scrollX = layout.scrollX * parallaxX;
				var scrollY = layout.scrollY * parallaxY;
				
				vLeft = scrollX - (canvas.width / 2) / scale;
				vTop = scrollY - (canvas.height / 2) / scale;
			}

			return {
				x: (mx / scale) + vLeft,
				y: (my / scale) + vTop
			};
		}

		return { x: mx, y: my };
	};

	behinstProto.onMouseDown = function (info)
	{
		if (!this.enabled) return;
		if (this.state !== 1) return; // Must be READY

		var m = this.getMousePos(info);
		var dx = (m.x - this.inst.x) * this.dragScale;
		var dy = (m.y - this.inst.y) * this.dragScale;
		var dist = Math.sqrt(dx*dx + dy*dy);

		if (dist <= this.maxPull)
		{
			this.state = 2; // DRAGGING
			this.onMouseMove(info);
		}
	};

	behinstProto.onMouseMove = function (info)
	{
		if (!this.enabled) return;
		if (this.state !== 2) return;

		var m = this.getMousePos(info);
		var dx = m.x - this.inst.x;
		var dy = m.y - this.inst.y;
		var dist = Math.sqrt(dx*dx + dy*dy);
		
		// Clamp visual drag to maxPull
		if (dist > this.maxPull)
		{
			var ratio = this.maxPull / dist;
			dx *= ratio;
			dy *= ratio;
			dist = this.maxPull;
		}

		this.dragX = this.inst.x + dx;
		this.dragY = this.inst.y + dy;

		// Calculate force based on scale
		var effectiveDist = dist * this.dragScale;

		var powerRatio = effectiveDist / this.maxPull;
		var totalForce = powerRatio * this.maxForce;

		var launchDirX = 0;
		var launchDirY = 0;
		if (dist > 0) {
			launchDirX = -dx / dist;
			launchDirY = -dy / dist;
		}

		this.launchVx = launchDirX * totalForce;
		this.launchVy = launchDirY * totalForce;
	};

	behinstProto.onMouseUp = function (info)
	{
		if (!this.enabled) return;
		if (this.state !== 2) return;

		var proj = this.runtime.getObjectByUID(this.projectileUid);
		if (proj)
		{
			var physics = null;
			for (var i = 0; i < proj.behavior_insts.length; i++)
			{
				var b = proj.behavior_insts[i];
				if (b.behavior.id === "Physics" || (b.ApplyImpulse && b.SetEnabled))
				{
					physics = b;
					break;
				}
			}

			if (physics)
			{
				// Enable physics and apply impulse
				if (physics.SetEnabled) physics.SetEnabled(true);
				if (physics.ApplyImpulse) physics.ApplyImpulse(this.launchVx, this.launchVy);
			}
		}
		
		this.state = 3; // COOLDOWN
		this.cooldownTimer = this.cooldownTime;
		
		this.runtime.trigger(cr.behaviors.VectorLauncher.prototype.cnds.OnLaunch, this.inst);
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
				{"name": "State", "value": this.state, "readonly": true},
				{"name": "Max Pull", "value": this.maxPull},
				{"name": "Enabled", "value": this.enabled},
				{"name": "Drag Scale", "value": this.dragScale},
				{"name": "Max Force", "value": this.maxForce},
				{"name": "Cooldown", "value": this.cooldownTime}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "Max Pull") this.maxPull = value;
		if (name === "Enabled") this.enabled = value;
		if (name === "Drag Scale") this.dragScale = value;
		if (name === "Max Force") this.maxForce = value;
		if (name === "Cooldown") this.cooldownTime = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.IsDragging = function () { return this.state === 2; };
	Cnds.prototype.OnLaunch = function () { return true; };
	Cnds.prototype.IsReady = function () { return this.state === 1; };
	Cnds.prototype.IsCooldown = function () { return this.state === 3; };
	Cnds.prototype.OnCooldownEnd = function () { return true; };
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.LoadProjectile = function (obj)
	{
		if (!obj) return;
		var inst = obj.getFirstPicked(this.inst);
		if (!inst) return;

		this.projectileUid = inst.uid;
		this.state = 1; // READY

		// Disable physics initially if present
		for (var i = 0; i < inst.behavior_insts.length; i++)
		{
			var b = inst.behavior_insts[i];
			if (b.behavior.id === "Physics" || (b.SetEnabled))
			{
				if (b.SetEnabled) b.SetEnabled(false);
			}
		}
		
		// Snap to anchor
		inst.x = this.inst.x;
		inst.y = this.inst.y;
		inst.set_bbox_changed();
	};
	
	Acts.prototype.SetCooldown = function (t)
	{
		this.cooldownTime = t;
	};
	
	Acts.prototype.SetEnabled = function (s)
	{
		this.enabled = (s === 1);
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	Exps.prototype.LaunchAngle = function (ret)
	{
		ret.set_float(cr.to_degrees(Math.atan2(this.launchVy, this.launchVx)));
	};
	
	Exps.prototype.LaunchPower = function (ret)
	{
		ret.set_float(Math.sqrt(this.launchVx*this.launchVx + this.launchVy*this.launchVy));
	};
	
	Exps.prototype.TrajectoryX = function (ret, t)
	{
		ret.set_float(this.inst.x + this.launchVx * t);
	};
	
	Exps.prototype.TrajectoryY = function (ret, t)
	{
		// y = y0 + vy*t + 0.5*g*t^2
		ret.set_float(this.inst.y + this.launchVy * t + 0.5 * this.gravity * t * t);
	};
	
	Exps.prototype.TargetX = function (ret)
	{
		var val = this.inst.x;
		if (this.maxForce !== 0)
			val += (this.launchVx / this.maxForce) * this.maxPull;
		ret.set_float(val);
	};
	
	Exps.prototype.TargetY = function (ret)
	{
		var t = (this.maxForce !== 0) ? (this.maxPull / this.maxForce) : 0;
		var val = this.inst.y;
		if (this.maxForce !== 0)
			val += (this.launchVy / this.maxForce) * this.maxPull;
		ret.set_float(val + 0.5 * this.gravity * t * t);
	};
	
	Exps.prototype.CalculatedTime = function (ret)
	{
		var t = (this.maxForce !== 0) ? (this.maxPull / this.maxForce) : 0;
		ret.set_float(t);
	};
	
	behaviorProto.exps = new Exps();
	
}());