﻿﻿﻿// ECMAScript 5 strict mode
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
		this.maxBounces = this.properties[7];
		this.viewMode = this.properties[8]; // 0=Side, 1=Top-Down
		this.elevation = this.properties[9];
		this.zScale = this.properties[10];
		this.trajectoryScaling = this.properties[11];
		this.visualSpeed = this.properties[12];
		this.setAngle = (this.properties[13] !== 0);
		this.visualType = null;
		
		// State Machine: 0=IDLE, 1=READY, 2=DRAGGING, 3=COOLDOWN, 4=MOVING
		this.state = 0;
		this.projectileUid = -1;
		this.cooldownTimer = 0;

		// Drag & Launch variables
		this.dragX = this.inst.x;
		this.dragY = this.inst.y;
		this.launchVx = 0;
		this.launchVy = 0;
		this.launchVz = 0;
		this.timeScale = 1.0;

		// Movement variables
		this.flightTime = 0;
		this.totalDuration = 0;
		this.startX = 0;
		this.startY = 0;
		this.targetX = 0;
		this.targetY = 0;
		this.controlX = this.inst.x;
		this.controlY = this.inst.y;
		this.launchStartX = 0;
		this.launchStartY = 0;
		
		this.rayPoints = [];

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
			"lvz": this.launchVz,
			"en": this.enabled,
			"dsc": this.dragScale,
			"mb": this.maxBounces,
			"zsc": this.zScale,
			"tsc": this.trajectoryScaling,
			"lsx": this.launchStartX,
			"lsy": this.launchStartY,
			"vs": this.visualSpeed,
			"sa": this.setAngle
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
		this.launchVz = o["lvz"] || 0;
		this.enabled = (typeof o["en"] !== "undefined" ? o["en"] : true);
		this.dragScale = (typeof o["dsc"] !== "undefined" ? o["dsc"] : 1.0);
		this.maxBounces = (typeof o["mb"] !== "undefined" ? o["mb"] : 3);
		this.zScale = (typeof o["zsc"] !== "undefined" ? o["zsc"] : 1.0);
		this.trajectoryScaling = (typeof o["tsc"] !== "undefined" ? o["tsc"] : 0.0);
		this.launchStartX = o["lsx"] || 0;
		this.launchStartY = o["lsy"] || 0;
		this.visualSpeed = o["vs"] || 0;
		this.setAngle = (typeof o["sa"] !== "undefined" ? o["sa"] : true);
	};

	behinstProto.tick = function ()
	{
		if (!this.enabled) return;

		this.updateVisuals();

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
		
		// Handle Movement (State 4)
		if (this.state === 4)
		{
			var proj = this.runtime.getObjectByUID(this.projectileUid);
			if (!proj)
			{
				this.state = 3; // COOLDOWN
				this.cooldownTimer = this.cooldownTime;
			}
			else
			{
				this.flightTime += dt * this.timeScale;
				var t = this.flightTime;
				var done = false;
				var newX = 0, newY = 0, newZ = 0;
				var moveAngle = 0;
				var hasAngle = false;
				
				if (this.pathMode === 0) // Gravity
				{
					if (this.totalDuration > 0 && t >= this.totalDuration) {
						t = this.totalDuration;
						done = true;
					}
					
					newX = this.launchStartX + this.launchVx * t;
					
					if (this.viewMode === 1) // Top-Down
					{
						var groundY = this.launchStartY + this.launchVy * t;
						var height = (this.launchVz * t) - (0.5 * this.gravity * t * t);
						newY = groundY - (height * this.zScale);
						newZ = height;
						
						if (this.setAngle) {
							moveAngle = Math.atan2(this.launchVy, this.launchVx);
							hasAngle = true;
						}
					}
					else // Side
					{
						newY = this.launchStartY + this.launchVy * t + 0.5 * this.gravity * t * t;
						newZ = 0;
						
						if (this.setAngle) {
							moveAngle = Math.atan2(this.launchVy + this.gravity * t, this.launchVx);
							hasAngle = true;
						}
					}
				}
				else if (this.pathMode === 1) // Spline
				{
					var dur = (this.totalDuration > 0) ? this.totalDuration : 1.0;
					var normT = t / dur;
					if (normT >= 1.0) { normT = 1.0; done = true; }
					
					var mt = 1 - normT;
					newX = (mt * mt * this.launchStartX) + (2 * mt * normT * this.controlX) + (normT * normT * this.targetX);
					newY = (mt * mt * this.launchStartY) + (2 * mt * normT * this.controlY) + (normT * normT * this.targetY);
					
					if (this.setAngle) {
						var d1x = this.controlX - this.launchStartX;
						var d1y = this.controlY - this.launchStartY;
						var d2x = this.targetX - this.controlX;
						var d2y = this.targetY - this.controlY;
						var dx = 2 * mt * d1x + 2 * normT * d2x;
						var dy = 2 * mt * d1y + 2 * normT * d2y;
						moveAngle = Math.atan2(dy, dx);
						hasAngle = true;
					}
				}
				else if (this.pathMode === 2) // Raycast
				{
					var dist = t * this.maxForce; // Speed = maxForce
					var currentDist = 0;
					var found = false;
					
					if (this.rayPoints.length > 0)
					{
						for (var i = 0; i < this.rayPoints.length - 1; i++)
						{
							var p0 = this.rayPoints[i];
							var p1 = this.rayPoints[i+1];
							var dx = p1.x - p0.x;
							var dy = p1.y - p0.y;
							var segLen = Math.sqrt(dx*dx + dy*dy);
							
							if (dist >= currentDist && dist <= currentDist + segLen)
							{
								var segT = (dist - currentDist) / segLen;
								newX = p0.x + dx * segT;
								newY = p0.y + dy * segT;
								if (this.setAngle) {
									moveAngle = Math.atan2(dy, dx);
									hasAngle = true;
								}
								found = true;
								break;
							}
							currentDist += segLen;
						}
						
						if (!found)
						{
							var last = this.rayPoints[this.rayPoints.length-1];
							newX = last.x;
							newY = last.y;
							done = true;
						}
					}
					else
					{
						newX = this.launchStartX;
						newY = this.launchStartY;
						done = true;
					}
				}
				
				if (this.setAngle && hasAngle)
					proj.angle = moveAngle;
				
				proj.x = newX;
				proj.y = newY;
				proj.set_bbox_changed();
				
				// Apply Z-Scale
				if (this.trajectoryScaling !== 0)
				{
					if (typeof proj._vl_origW === "undefined") {
						proj._vl_origW = proj.width;
						proj._vl_origH = proj.height;
					}
					
					var s = 1.0 + (newZ * this.trajectoryScaling);
					if (s < 0) s = 0;
					
					var newW = proj._vl_origW * s;
					var newH = proj._vl_origH * s;
					
					if (proj.width !== newW || proj.height !== newH) {
						proj.width = newW;
						proj.height = newH;
						proj.set_bbox_changed();
					}
				}
				
				if (done)
				{
					this.state = 3; // COOLDOWN
					this.cooldownTimer = this.cooldownTime;
				}
			}
		}
	};
	
	behinstProto.getTrajectoryPoint = function(t)
	{
		var x = 0, y = 0, z = 0;
		
		if (this.pathMode === 1) // Spline
		{
			// Quadratic Bezier: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
			var mt = 1 - t;
			x = (mt * mt * this.inst.x) + (2 * mt * t * this.controlX) + (t * t * this.targetX);
			y = (mt * mt * this.inst.y) + (2 * mt * t * this.controlY) + (t * t * this.targetY);
			z = 0;
		}
		else if (this.pathMode === 2) // Raycast
		{
			if (this.rayPoints.length > 0)
			{
				// Calculate total length
				var totalLen = 0;
				var lens = [];
				for (var i = 0; i < this.rayPoints.length - 1; i++)
				{
					var dx = this.rayPoints[i+1].x - this.rayPoints[i].x;
					var dy = this.rayPoints[i+1].y - this.rayPoints[i].y;
					var d = Math.sqrt(dx*dx + dy*dy);
					lens.push(d);
					totalLen += d;
				}
				
				if (totalLen > 0)
				{
					var targetDist = t * totalLen;
					var currentDist = 0;
					
					// Default to last point
					x = this.rayPoints[this.rayPoints.length-1].x;
					y = this.rayPoints[this.rayPoints.length-1].y;
					
					for (var i = 0; i < lens.length; i++)
					{
						if (currentDist + lens[i] >= targetDist)
						{
							var segT = (targetDist - currentDist) / lens[i];
							var p0 = this.rayPoints[i];
							var p1 = this.rayPoints[i+1];
							x = p0.x + (p1.x - p0.x) * segT;
							y = p0.y + (p1.y - p0.y) * segT;
							break;
						}
						currentDist += lens[i];
					}
				}
				else
				{
					x = this.rayPoints[0].x;
					y = this.rayPoints[0].y;
				}
			}
			else
			{
				x = this.inst.x;
				y = this.inst.y;
			}
		}
		else // Gravity (Physics)
		{
			var real_t = t * this.totalDuration;
			
			x = this.inst.x + this.launchVx * real_t;
			
			if (this.viewMode === 1) // Top-Down
			{
				// Visual Y = GroundY - Height (Z)
				// Height = Vz*t - 0.5*g*t^2
				var groundY = this.inst.y + this.launchVy * real_t;
				var height = (this.launchVz * real_t) - (0.5 * this.gravity * real_t * real_t);
				y = groundY - (height * this.zScale);
				z = height;
			}
			else // Side View
			{
				y = this.inst.y + this.launchVy * real_t + 0.5 * this.gravity * real_t * real_t;
				z = 0;
			}
		}
		return {x: x, y: y, z: z};
	};

	behinstProto.updateVisuals = function()
	{
		if (!this.visualType) return;
		var instances = this.visualType.instances;
		var count = instances.length;
		if (count === 0) return;
		
		var show = (this.state === 2); // DRAGGING
		
		for (var i = 0; i < count; i++) {
			var inst = instances[i];
			
			if (!show) {
				if (inst.visible) inst.visible = false;
				continue;
			}
			
			if (!inst.visible) inst.visible = true;
			
			var t = (count > 1) ? i / (count - 1) : 0;
			var pos = this.getTrajectoryPoint(t);
			
			if (inst.x !== pos.x || inst.y !== pos.y) {
				inst.x = pos.x;
				inst.y = pos.y;
				inst.set_bbox_changed();
			}

			// Scaling logic based on Z height
			if (this.trajectoryScaling !== 0)
			{
				if (typeof inst._vl_origW === "undefined") {
					inst._vl_origW = inst.width;
					inst._vl_origH = inst.height;
				}
				
				var s = 1.0 + (pos.z * this.trajectoryScaling);
				if (s < 0) s = 0;
				
				var newW = inst._vl_origW * s;
				var newH = inst._vl_origH * s;
				
				if (inst.width !== newW || inst.height !== newH) {
					inst.width = newW;
					inst.height = newH;
					inst.set_bbox_changed();
				}
			}
			else if (typeof inst._vl_origW !== "undefined")
			{
				// Restore original size if scaling is disabled
				if (inst.width !== inst._vl_origW || inst.height !== inst._vl_origH) {
					inst.width = inst._vl_origW;
					inst.height = inst._vl_origH;
					inst.set_bbox_changed();
				}
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
		var dx = (m.x - this.inst.x);
		var dy = (m.y - this.inst.y);
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
		var dx = (m.x - this.inst.x);
		var dy = (m.y - this.inst.y);
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

		this.recalcLaunch();
	};

	behinstProto.recalcLaunch = function ()
	{
		var dx = this.dragX - this.inst.x;
		var dy = this.dragY - this.inst.y;
		var dist = Math.sqrt(dx*dx + dy*dy);

		if (this.pathMode === 1) // Spline Mode
		{
			// P1 (Control Point) is reflection of mouse pos across anchor (P0)
			// Vector P0->Mouse is (dx, dy)
			// Vector P0->P1 is (-dx, -dy)
			
			this.controlX = this.inst.x + (-dx * this.dragScale);
			this.controlY = this.inst.y + (-dy * this.dragScale);
			
			this.launchVx = 0;
			this.launchVy = 0;
			
			// Calculate duration based on speed (maxForce)
			var d1x = this.controlX - this.inst.x;
			var d1y = this.controlY - this.inst.y;
			var d2x = this.targetX - this.controlX;
			var d2y = this.targetY - this.controlY;
			var len = Math.sqrt(d1x*d1x + d1y*d1y) + Math.sqrt(d2x*d2x + d2y*d2y);
			this.totalDuration = (this.maxForce > 0) ? (len / this.maxForce) : 1.0;
		}
		else if (this.pathMode === 2) // Raycast Mode
		{
			// For Raycast, we just need the direction. Force and Scale are irrelevant.
			this.launchVx = -dx;
			this.launchVy = -dy;
			this.calculateRaycast();
		}
		else // Gravity (Physics)
		{
			// Calculate force based on scale
			var powerRatio = (dist * this.dragScale) / this.maxPull;
			var totalForce = powerRatio * this.maxForce;

			var launchDirX = 0;
			var launchDirY = 0;
			if (dist > 0) {
				launchDirX = -dx / dist;
				launchDirY = -dy / dist;
			}

			if (this.viewMode === 1) // Top-Down
			{
				var rad = cr.to_radians(this.elevation);
				var vGround = totalForce * Math.cos(rad);
				this.launchVz = totalForce * Math.sin(rad);
				this.launchVx = launchDirX * vGround;
				this.launchVy = launchDirY * vGround;
				
				if (this.gravity !== 0)
					this.totalDuration = (2 * this.launchVz) / this.gravity;
				else
					this.totalDuration = 0;
			}
			else // Side View
			{
				this.launchVx = launchDirX * totalForce;
				this.launchVy = launchDirY * totalForce;
				this.launchVz = 0;
				
				if (this.gravity !== 0)
					this.totalDuration = (-2 * this.launchVy) / this.gravity;
				else
					this.totalDuration = 0;
			}
			
			if (this.totalDuration <= 0)
				this.totalDuration = (this.maxForce !== 0) ? (this.maxPull / this.maxForce) : 0;
		}
	};
	
	behinstProto.calculateRaycast = function()
	{
		this.rayPoints = [];
		var startX = this.inst.x;
		var startY = this.inst.y;
		
		// Save state
		var originalX = this.inst.x;
		var originalY = this.inst.y;
		
		this.rayPoints.push({x: startX, y: startY});
		
		var vx = this.launchVx;
		var vy = this.launchVy;
		
		var mag = Math.sqrt(vx*vx + vy*vy);
		if (mag === 0) return;
		
		var dirX = vx / mag;
		var dirY = vy / mag;
		
		var currentX = startX;
		var currentY = startY;
		
		var stepSize = 5;
		var maxDist = 2000;
		var distTraveled = 0;
		var bounces = 0;
		
		while (bounces < this.maxBounces && distTraveled < maxDist) {
			var hit = false;
			
			while (distTraveled < maxDist) {
				currentX += dirX * stepSize;
				currentY += dirY * stepSize;
				distTraveled += stepSize;
				
				this.inst.x = currentX;
				this.inst.y = currentY;
				this.inst.set_bbox_changed();
				
				if (this.runtime.testOverlapSolid(this.inst)) {
					hit = true;
					break;
				}
			}
			
			if (hit) {
				// Backtrack
				var safeX = currentX - dirX * stepSize;
				var safeY = currentY - dirY * stepSize;
				
				// Determine Normal
				this.inst.x = currentX; this.inst.y = safeY; this.inst.set_bbox_changed();
				var hitX = this.runtime.testOverlapSolid(this.inst);
				
				this.inst.x = safeX; this.inst.y = currentY; this.inst.set_bbox_changed();
				var hitY = this.runtime.testOverlapSolid(this.inst);
				
				if (hitX) dirX *= -1;
				if (hitY) dirY *= -1;
				if (!hitX && !hitY) { dirX *= -1; dirY *= -1; }
				
				this.rayPoints.push({x: safeX, y: safeY});
				currentX = safeX + dirX * stepSize;
				currentY = safeY + dirY * stepSize;
				bounces++;
			} else {
				this.rayPoints.push({x: currentX, y: currentY});
				break;
			}
		}
		
		this.inst.x = originalX;
		this.inst.y = originalY;
		this.inst.set_bbox_changed();
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
		
		// Start Movement
		this.state = 4; // MOVING
		this.flightTime = 0;
		this.launchStartX = this.inst.x;
		this.launchStartY = this.inst.y;
		this.timeScale = 1.0;
		
		// Calculate Time Scale for Gravity Mode if Visual Speed is set
		if (this.pathMode === 0 && this.visualSpeed > 0 && this.totalDuration > 0)
		{
			// Estimate path length
			var steps = 10;
			var totalLen = 0;
			var lastP = this.getTrajectoryPoint(0);
			
			for (var i = 1; i <= steps; i++)
			{
				var t = i / steps;
				var p = this.getTrajectoryPoint(t);
				totalLen += Math.sqrt(Math.pow(p.x - lastP.x, 2) + Math.pow(p.y - lastP.y, 2)); // 2D length on screen
				lastP = p;
			}
			
			var visualDuration = totalLen / this.visualSpeed;
			if (visualDuration > 0) this.timeScale = this.totalDuration / visualDuration;
		}
		
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
				,{"name": "Max Bounces", "value": this.maxBounces}
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
		if (name === "Max Bounces") this.maxBounces = value;
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
	Cnds.prototype.IsPathMode = function (m) { return this.pathMode === m; };
	
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
	
	Acts.prototype.SetTarget = function (x, y)
	{
		this.targetX = x;
		this.targetY = y;
	};
	
	Acts.prototype.SetPathMode = function (m)
	{
		this.pathMode = m;
	};
	
	Acts.prototype.SetMaxPull = function (v)
	{
		this.maxPull = v;
		if (this.state === 2) this.recalcLaunch();
	};

	Acts.prototype.SetMaxForce = function (v)
	{
		this.maxForce = v;
		if (this.state === 2) this.recalcLaunch();
	};

	Acts.prototype.SetGravity = function (v)
	{
		this.gravity = v;
		if (this.state === 2) this.recalcLaunch();
	};

	Acts.prototype.SetMaxBounces = function (b)
	{
		this.maxBounces = b;
		if (this.state === 2) this.recalcLaunch();
	};
	
	Acts.prototype.SetDragScale = function (s)
	{
		this.dragScale = s;
		if (this.state === 2) this.recalcLaunch();
	};
	
	Acts.prototype.SetZScale = function (s)
	{
		this.zScale = s;
	};
	
	Acts.prototype.SetElevation = function (e)
	{
		this.elevation = e;
		if (this.state === 2) this.recalcLaunch();
	};
	
	Acts.prototype.SetVisualTrajectory = function (obj)
	{
		this.visualType = obj;
	};
	
	Acts.prototype.SetTrajectoryScaling = function (s)
	{
		this.trajectoryScaling = s;
	};
	
	Acts.prototype.SetVisualSpeed = function (s)
	{
		this.visualSpeed = s;
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
	
	Exps.prototype.LaunchVelocityZ = function (ret)
	{
		ret.set_float(this.launchVz);
	};
	
	Exps.prototype.TrajectoryZ = function (ret, t)
	{
		var p = this.getTrajectoryPoint(t);
		ret.set_float(p.z);
	};
	
	Exps.prototype.SolveElevation = function (ret, dist, speed)
	{
		// Range R = (v^2 * sin(2*theta)) / g
		// sin(2*theta) = (R * g) / v^2
		// theta = 0.5 * asin( (R * g) / v^2 )
		
		if (speed <= 0 || this.gravity <= 0) {
			ret.set_float(0);
			return;
		}
		
		var val = (dist * this.gravity) / (speed * speed);
		if (val > 1) val = 1; // Clamp to max range
		
		var angleRad = 0.5 * Math.asin(val);
		ret.set_float(cr.to_degrees(angleRad));
	};
	
	Exps.prototype.TrajectoryX = function (ret, t)
	{
		var p = this.getTrajectoryPoint(t);
		ret.set_float(p.x);
	};
	
	Exps.prototype.TrajectoryY = function (ret, t)
	{
		var p = this.getTrajectoryPoint(t);
		ret.set_float(p.y);
	};
	
	Exps.prototype.TargetX = function (ret)
	{
		if (this.pathMode === 1)
		{
			ret.set_float(this.targetX);
		}
		else if (this.pathMode === 2)
		{
			if (this.rayPoints.length > 0)
				ret.set_float(this.rayPoints[this.rayPoints.length-1].x);
			else
				ret.set_float(this.inst.x);
		}
		else
		{
			var p = this.getTrajectoryPoint(1.0);
			ret.set_float(p.x);
		}
	};
	
	Exps.prototype.TargetY = function (ret)
	{
		if (this.pathMode === 1)
		{
			ret.set_float(this.targetY);
		}
		else if (this.pathMode === 2)
		{
			if (this.rayPoints.length > 0)
				ret.set_float(this.rayPoints[this.rayPoints.length-1].y);
			else
				ret.set_float(this.inst.y);
		}
		else
		{
			var p = this.getTrajectoryPoint(1.0);
			ret.set_float(p.y);
		}
	};
	
	Exps.prototype.CalculatedTime = function (ret)
	{
		ret.set_float(1.0);
	};
	
	Exps.prototype.ControlX = function (ret)
	{
		ret.set_float(this.controlX);
	};
	
	Exps.prototype.ControlY = function (ret)
	{
		ret.set_float(this.controlY);
	};
	
	Exps.prototype.BounceCount = function (ret)
	{
		ret.set_int(this.rayPoints.length);
	};
	
	Exps.prototype.BounceX = function (ret, i)
	{
		i = Math.floor(i);
		if (i >= 0 && i < this.rayPoints.length) ret.set_float(this.rayPoints[i].x);
		else ret.set_float(0);
	};
	
	Exps.prototype.BounceY = function (ret, i)
	{
		i = Math.floor(i);
		if (i >= 0 && i < this.rayPoints.length) ret.set_float(this.rayPoints[i].y);
		else ret.set_float(0);
	};
	
	behaviorProto.exps = new Exps();
	
}());