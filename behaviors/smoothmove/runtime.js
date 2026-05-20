﻿﻿﻿﻿﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.SmoothMove = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.SmoothMove.prototype;
		
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
		// This is a shared property for all instances of this behavior.
		this.targetUid = -1;
		this.obstacleTypes = [];
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
		this.enabled = (this.properties[0] === 0); // 0=Enabled, 1=Disabled
		this.movementMode = this.properties[1]; // 0=Steering, 1=Direct
		this.maxSpeed = this.properties[2];
		this.minSpeed = this.properties[3];
		this.deceleration = this.properties[4]; // Original index
		this.acceleration = this.properties[5]; // New property at index 5
		this.rotationSpeed = this.properties[6]; // Shifted from 5 to 6
		this.flipMode = this.properties[7]; // Shifted from 6 to 7
		this.effectiveRadius = this.properties[8]; // Shifted from 7 to 8
		this.stopOnSolids = (this.properties[9] === 1); // Shifted from 8 to 9
		this.avoidance = this.properties[10]; // Shifted from 9 to 10
		
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		this.currentSpeed = 0; // Current magnitude of velocity
		this.currentAngleOfMotion = 0; // Current direction of velocity
		this.velocity = { x: 0, y: 0 };
		this.hasPositionTarget = false;
		this.targetX = 0;
		this.targetY = 0;
		this.lastKnownWidth = this.inst.width;
		// Note: obstacleTypes is stored on the behavior type, not the instance.

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
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"enabled": this.enabled,
			"tuid": this.type.targetUid,
			"max": this.maxSpeed,
			"min": this.minSpeed,
			"dec": this.deceleration,
			"acc": this.acceleration, // New property
			"cspeed": this.currentSpeed, // New property
			"rot": this.rotationSpeed,
			"rad": this.effectiveRadius,
			"vel": this.velocity,
			"hpt": this.hasPositionTarget,
			"tx": this.targetX,
			"ty": this.targetY,
			"iat": false, // No longer used, for savegame compatibility
			"sos": this.stopOnSolids,
			"avd": this.avoidance
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		this.enabled = o["enabled"];
		this.type.targetUid = o["tuid"];
		this.maxSpeed = o["max"];
		this.minSpeed = o["min"];
		this.deceleration = o["dec"];
		this.acceleration = o["acc"] || 0; // New property, default to 0 for old saves
		this.currentSpeed = o["cspeed"] || 0; // New property, default to 0 for old saves
		this.rotationSpeed = o["rot"];
		this.effectiveRadius = o["rad"];
		this.velocity = o["vel"];
		this.hasPositionTarget = o["hpt"];
		this.targetX = o["tx"];
		this.targetY = o["ty"];
		this.stopOnSolids = o["sos"];
		this.avoidance = o["avd"] || 0;
		// this.isAtTarget is no longer used
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};

	behinstProto.tick = function ()
	{
		const dt = this.runtime.getDt(this.inst);
		const inst = this.inst;
		const vel = this.velocity; // This is the current velocity vector, its magnitude will be this.currentSpeed
		
		const targetObj = this.runtime.getObjectByUID(this.type.targetUid);
		var hasTarget = targetObj || this.hasPositionTarget;

		// If following an object, update the target coordinates.
		if (targetObj) {
			this.targetX = targetObj.x;
			this.targetY = targetObj.y;
		}
		
		let desiredSpeed = 0; // The speed we *want* to reach this frame
		let desiredAngle = this.currentAngleOfMotion; // The angle we *want* to face this frame

		// Do nothing if behavior is inactive.
		if (!this.enabled)
		{
			// Decelerate to a stop if inactive. If deceleration is 0, stop instantly.
            this.currentSpeed = (this.deceleration > 0) ? Math.max(0, this.currentSpeed - this.deceleration * dt) : 0;
		}
		else if (hasTarget) // Is enabled and has a target to move to
		{
            // --- Rotation ---
            const distance = cr.distanceTo(inst.x, inst.y, this.targetX, this.targetY);

            // If very close to the target, snap to position and stop.
            // This prevents jittering or orbiting the target point.
            if (distance < 0.5) // A threshold of 0.5 pixels is small enough to be unnoticeable.
            {
                this.currentSpeed = 0; // Fix: Explicitly zero speed to stop movement
                inst.x = this.targetX;
                inst.y = this.targetY;
                inst.set_bbox_changed();
            }
			else // Not at target, calculate movement
			{
				const targetAngle = cr.angleTo(inst.x, inst.y, this.targetX, this.targetY);
				let moveAngle = targetAngle;
				
				// --- Avoidance ---
				if (this.avoidance > 0)
				{
					// Check if path ahead is blocked
					if (this.testOverlapAt(inst.x + Math.cos(moveAngle) * this.avoidance, inst.y + Math.sin(moveAngle) * this.avoidance))
					{
						// Path blocked, look for open direction
						// Check angles in alternating directions: 30, -30, 60, -60, 90, -90
						var candidates = [Math.PI/6, -Math.PI/6, Math.PI/3, -Math.PI/3, Math.PI/2, -Math.PI/2];
						
						for (var i = 0; i < candidates.length; i++)
						{
							var testAngle = moveAngle + candidates[i];
							if (!this.testOverlapAt(inst.x + Math.cos(testAngle) * this.avoidance, inst.y + Math.sin(testAngle) * this.avoidance))
							{
								moveAngle = testAngle;
								break;
							}
						}
					}
				}

				// Only rotate the object if in 'Steering' mode.
				if (this.movementMode === 0) // 0 = Steering
				{
					inst.angle = cr.anglelerp(inst.angle, moveAngle, this.rotationSpeed * dt);
				}

				// Calculate desired speed based on distance.
				const speedRatio = Math.min(distance / this.effectiveRadius, 1.0);
				desiredSpeed = cr.lerp(this.minSpeed, this.maxSpeed, speedRatio);
				desiredSpeed = Math.min(desiredSpeed, distance / dt); // Prevent overshooting

				// Apply acceleration/deceleration to currentSpeed
				if (this.acceleration > 0 && this.currentSpeed < desiredSpeed) {
					this.currentSpeed = Math.min(desiredSpeed, this.currentSpeed + this.acceleration * dt);
				} else if (this.deceleration > 0 && this.currentSpeed > desiredSpeed) {
					this.currentSpeed = Math.max(desiredSpeed, this.currentSpeed - this.deceleration * dt);
				} else {
					this.currentSpeed = desiredSpeed; // If no accel/decel, snap to desired speed
				}

				// Smoothly interpolate current angle of motion
				if (this.currentSpeed > 0) {
					this.currentAngleOfMotion = cr.anglelerp(this.currentAngleOfMotion, moveAngle, 3 * dt);
				} else {
					this.currentAngleOfMotion = moveAngle; // If not moving, snap direction
				}
			}
        }
		else // Is enabled but has no target
		{ 
			// Decelerate to a stop if target is lost. If deceleration is 0, stop instantly.
			this.currentSpeed = (this.deceleration > 0) ? Math.max(0, this.currentSpeed - this.deceleration * dt) : 0;
		}

		// Update velocity vector based on currentSpeed and currentAngleOfMotion
		vel.x = Math.cos(this.currentAngleOfMotion) * this.currentSpeed;
		vel.y = Math.sin(this.currentAngleOfMotion) * this.currentSpeed;

		// --- Handle flipping ---
		if (this.flipMode === 1 && this.rotationSpeed === 0) // 1=Horizontal, and only if not rotating
		{
			// Store the object's actual width if it's not currently flipped
			if (inst.width > 0)
			{
				this.lastKnownWidth = inst.width;
			}

			// Flip based on horizontal velocity (with a small threshold to prevent rapid flipping)
			// Hysteresis: only flip if velocity is significantly in the opposite direction
			var threshold = 0.5;
			if (inst.width > 0 && vel.x < -threshold) inst.width = -this.lastKnownWidth;
			else if (inst.width < 0 && vel.x > threshold) inst.width = this.lastKnownWidth;
		}

		// --- Limit Velocity (Safety check) ---
		// Ensure currentSpeed does not exceed maxSpeed (can happen if acceleration is very high)
		if (this.currentSpeed > this.maxSpeed) {
			this.currentSpeed = this.maxSpeed;
			// Re-normalize velocity vector if speed was capped
			vel.x = Math.cos(this.currentAngleOfMotion) * this.currentSpeed;
			vel.y = Math.sin(this.currentAngleOfMotion) * this.currentSpeed;
		}
		// --- Apply Final Velocity to Position ---
		if (vel.x !== 0 || vel.y !== 0)
		{
			var oldx = inst.x;
			var oldy = inst.y;

			// Move X and check for collision
			inst.x += vel.x * dt;
			inst.set_bbox_changed();
			if (this._testOverlapAny()) {
				inst.x = oldx;
				vel.x = 0;
				inst.set_bbox_changed();
			}

			// Move Y and check for collision
			inst.y += vel.y * dt;
			inst.set_bbox_changed();
			if (this._testOverlapAny()) {
				inst.y = oldy;
				vel.y = 0;
				inst.set_bbox_changed();
			}
		}
	};
	
	behinstProto.testOverlapAt = function(x, y)
	{
		var inst = this.inst;
		var oldX = inst.x;
		var oldY = inst.y;
		
		inst.x = x;
		inst.y = y;
		inst.set_bbox_changed();
		
		var overlap = this._testOverlapAny();
		
		inst.x = oldX;
		inst.y = oldY;
		inst.set_bbox_changed();
		
		return overlap;
	};
	
	behinstProto._testOverlapAny = function()
	{
		var test_inst = this.inst;

		// 1. Test against Solids
		if (this.stopOnSolids && this.runtime.testOverlapSolid(test_inst))
			return true;
		
		// 2. Test against custom obstacles
		for (var i = 0; i < this.type.obstacleTypes.length; i++) {
			var type = this.type.obstacleTypes[i];
			var instances = type.instances;
			for (var j = 0; j < instances.length; j++) {
				var obstacle_inst = instances[j];
				
				// Special handling for Tilemap obstacles to get polygon-perfect collision
				if (obstacle_inst.type && obstacle_inst.type.plugin && obstacle_inst.type.plugin.id === "Tilemap")
				{
					if (!this.runtime.testOverlap(test_inst, obstacle_inst))
						continue;
					
					test_inst.update_bbox();
					var poly = test_inst.collision_poly;
					
					if (poly && poly.pts.length > 0)
					{
						for(var k = 0; k < poly.pts.length; k++)
						{
							var ptx = poly.pts[k][0] + test_inst.x;
							var pty = poly.pts[k][1] + test_inst.y;
							
							if (obstacle_inst.testPoint(ptx, pty))
								return true;
						}
					}
					else if (obstacle_inst.testPoint(test_inst.x, test_inst.y))
						return true;
				}
				else if (this.runtime.testOverlap(test_inst, obstacle_inst))
					return true;
			}
		}
		
		return false;
	};

	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		var targetInst = this.runtime.getObjectByUID(this.type.targetUid);
		var targetName = targetInst ? targetInst.type.name + " (UID: " + targetInst.uid + ")" : "None";

		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Enabled", "value": this.enabled, "readonly": true},
				{"name": "Current Speed", "value": Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y).toFixed(2), "readonly": true},
				{"name": "Max speed", "value": this.maxSpeed},
				{"name": "Min speed", "value": this.minSpeed},
				{"name": "Deceleration", "value": this.deceleration},
				{"name": "Acceleration", "value": this.acceleration}, // New debugger value
				{"name": "Rotation speed", "value": this.rotationSpeed},
				{"name": "Effective radius", "value": this.effectiveRadius},
				{"name": "Stop on solids", "value": this.stopOnSolids},
				{"name": "Target", "value": targetName, "readonly": true},
				{"name": "Avoidance", "value": this.avoidance}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		switch (name) {
			case "Max speed": 		 this.maxSpeed = value; break;
			case "Min speed": 		 this.minSpeed = value; break;
			case "Deceleration": 	 this.deceleration = value; break;
			case "Acceleration": 	 this.acceleration = value; break; // New debugger edit
			case "Rotation speed": 	 this.rotationSpeed = value; break;
			case "Effective radius": this.effectiveRadius = value; break;
			case "Stop on solids":	 this.stopOnSolids = value; break;
			case "Avoidance":		 this.avoidance = value; break;
		}
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.IsEnabled = function () { return this.enabled; };

	Cnds.prototype.IsMoving = function () { return this.currentSpeed > 0; }; // Use currentSpeed

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetEnabled = function (e)
	{
		this.enabled = (e === 1);
	};

	Acts.prototype.SetTarget = function (obj)
	{
		if (!obj) return;
		var inst = obj.getFirstPicked(this.inst);
		if (!inst) return;
		this.type.targetUid = inst.uid;
		this.hasPositionTarget = false; // An object target overrides a position target.
	};
	
	Acts.prototype.SetTargetPosition = function (x, y)
	{
		this.targetX = x;
		this.targetY = y;
		this.hasPositionTarget = true;
		this.type.targetUid = -1; // A position target overrides an object target
	};

	Acts.prototype.Stop = function ()
	{
		this.velocity.x = 0;
		this.velocity.y = 0;
		this.hasPositionTarget = false;
		this.type.targetUid = -1;
	};

	Acts.prototype.SetMaxSpeed = function (s) { this.maxSpeed = s; };
	Acts.prototype.SetMinSpeed = function (s) { this.minSpeed = s; };
	Acts.prototype.SetDeceleration = function (d) { this.deceleration = d; };
	Acts.prototype.SetRotationSpeed = function (r) { this.rotationSpeed = r; };
	Acts.prototype.SetAcceleration = function (a) { this.acceleration = a; }; // New action
	Acts.prototype.SetEffectiveRadius = function (r) { this.effectiveRadius = r; };
	Acts.prototype.SetStopOnSolids = function (s) { this.stopOnSolids = (s === 1); };
	Acts.prototype.SetAvoidance = function (a) { this.avoidance = a; };
	
	Acts.prototype.AddObstacle = function (obj)
	{
		if (!obj) return;
		if (this.type.obstacleTypes.indexOf(obj) === -1)
			this.type.obstacleTypes.push(obj);
	};

	Acts.prototype.ClearObstacles = function ()
	{
		this.type.obstacleTypes.length = 0;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	// Use currentSpeed for expression
	Exps.prototype.CurrentSpeed = function (ret)
	{
		ret.set_float(this.currentSpeed);
	};
	
	// Use currentAngleOfMotion for expression
	Exps.prototype.AngleOfMotion = function (ret)
	{
		var angle = cr.to_degrees(this.currentAngleOfMotion);
		ret.set_float(angle);
	};

	Exps.prototype.Acceleration = function (ret) { // New expression
		ret.set_float(this.acceleration);
	};
	
	behaviorProto.exps = new Exps();
	
}());