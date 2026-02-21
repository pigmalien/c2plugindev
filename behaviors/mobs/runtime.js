// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvvvv
cr.behaviors.MobsMovement = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvvvv
	var behaviorProto = cr.behaviors.MobsMovement.prototype;
		
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
		// It stores the UID of the target instance.
		this.targetUid = -1; 
		this.targetMode = 0; // 0 = Object, 1 = Position
		this.targetX = 0;
		this.targetY = 0;

		// This will hold the final movement vector for each mover instance.
		this.forces = {}; // Using an object with UIDs as keys
		this.obstacleTypes = [];
		this.solidTypes = [];
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
		// Load properties from edittime.js
		this.isActive = (this.properties[0] === 0); // 0=Active, 1=Inactive
		this.maxSpeed = this.properties[1];
		this.rotationSpeed = this.properties[2]; // 0=none
		this.flipMode = this.properties[3];      // 0=None, 1=Horizontal
		this.repulsionRadius = this.properties[4];
		this.repulsionForce = this.properties[5];
		this.mode = this.properties[6];          // 0=Follow, 1=Wander
		this.wanderRadius = this.properties[7];
		this.wanderRate = this.properties[8];
		
		this.wanderTimer = Math.random() * this.wanderRate;
		this.wanderX = this.inst.x;
		this.wanderY = this.inst.y;
		
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
		// This will be calculated once per tick for this instance
		this.repulsionRadiusSq = this.repulsionRadius * this.repulsionRadius;

		// For restoring width when flipping
		this.lastKnownWidth = this.inst.width;
		this.isMoving = false;
		this.isStuck = false;
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
			"tuid": this.type.targetUid,
			"isActive": this.isActive,
			"tm": this.type.targetMode,
			"tx": this.type.targetX,
			"ty": this.type.targetY
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		this.type.targetUid = o["tuid"];
		this.isActive = o["isActive"];
		this.type.targetMode = o["tm"] || 0;
		this.type.targetX = o["tx"] || 0;
		this.type.targetY = o["ty"] || 0;
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};

	behinstProto.tick = function ()
	{
		// This is the first instance being ticked this frame.
		// We run the force calculation for all instances here, once per tick.
		if (!this.isActive)
			return;
			
		// Update Wander Logic
		if (this.mode === 1) // Wander
		{
			var dt = this.runtime.getDt(this.inst);
			this.wanderTimer -= dt;
			if (this.wanderTimer <= 0) {
				this.wanderTimer = this.wanderRate + (Math.random() * 0.5); // Add slight variance
				var angle = Math.random() * Math.PI * 2;
				var dist = Math.random() * this.wanderRadius;
				this.wanderX = this.inst.x + Math.cos(angle) * dist;
				this.wanderY = this.inst.y + Math.sin(angle) * dist;
			}
		}

		if (this.runtime.tickcount !== this.type.lastTick) {
			this.type.lastTick = this.runtime.tickcount;
			this.calculateAllForces();
		}
	};

	behinstProto.tick2 = function ()
	{
		// Apply the pre-calculated forces.
		// tick2 runs after tick, ensuring all forces are calculated before they are applied.
		if (!this.isActive)
			return;
			
		this.isMoving = false;
		this.isStuck = false;
			
		var dt = this.runtime.getDt(this.inst);
		var uid = this.inst.uid;
		var force = this.type.forces[uid];

		if (!force) return;

		// Normalize the final force vector to ensure consistent speed.
		var forceMagnitude = Math.sqrt(force.x * force.x + force.y * force.y);
		if (forceMagnitude > 0) {
			// Scale speed by force magnitude if less than 1 to prevent jitter when forces are weak
			var currentSpeed = this.maxSpeed * Math.min(forceMagnitude, 1);

			var finalForceX = (force.x / forceMagnitude);
			var finalForceY = (force.y / forceMagnitude);

			// Safety check to prevent NaN/Infinity values from breaking collision
			if (!isFinite(finalForceX) || !isFinite(finalForceY) || !isFinite(currentSpeed))
				return;

			// Apply movement based on the final force, max speed, and delta-time.
			var oldx = this.inst.x;
			var oldy = this.inst.y;
			var moveX = finalForceX * currentSpeed * dt;
			var moveY = finalForceY * currentSpeed * dt;
			var blockedX = false;
			var blockedY = false;

			this.inst.x += moveX;
			this.inst.set_bbox_changed();
			if (this.testObstacleOverlap() || this.testSolidOverlap()) {
				this.inst.x = oldx;
				this.inst.set_bbox_changed();
				blockedX = true;
			}

			this.inst.y += moveY;
			this.inst.set_bbox_changed();
			if (this.testObstacleOverlap() || this.testSolidOverlap()) {
				this.inst.y = oldy;
				this.inst.set_bbox_changed();
				blockedY = true;
			}
			
			// Smart Slide: If blocked on one axis, apply full speed to the other
			if (blockedX && !blockedY && Math.abs(finalForceY) > 0.01)
			{
				var targetMoveY = (finalForceY > 0 ? 1 : -1) * currentSpeed * dt;
				this.inst.y = oldy + targetMoveY;
				this.inst.set_bbox_changed();
				if (this.testObstacleOverlap() || this.testSolidOverlap()) {
					this.inst.y = oldy + moveY; // Revert to partial move if full slide fails
					this.inst.set_bbox_changed();
				}
			}
			else if (blockedY && !blockedX && Math.abs(finalForceX) > 0.01)
			{
				var targetMoveX = (finalForceX > 0 ? 1 : -1) * currentSpeed * dt;
				this.inst.x = oldx + targetMoveX;
				this.inst.set_bbox_changed();
				if (this.testObstacleOverlap() || this.testSolidOverlap()) {
					this.inst.x = oldx + moveX; // Revert to partial move
					this.inst.set_bbox_changed();
				}
			}
			
			if (this.inst.x !== oldx || this.inst.y !== oldy) {
				this.isMoving = true;
			} else if (forceMagnitude > 0.1) {
				this.isStuck = true;
			}

			// Update angle or flip based on properties
			if (this.rotationSpeed > 0)
			{
				// Smoothly rotate the mover to face its direction of travel.
				var targetAngle = Math.atan2(finalForceY, finalForceX);
				this.inst.angle = cr.anglelerp(this.inst.angle, targetAngle, this.rotationSpeed * dt);
			}
			else if (this.flipMode === 1) // 1=Horizontal
			{
				// Store the object's actual width if it's not currently flipped
				if (this.inst.width > 0)
				{
					this.lastKnownWidth = this.inst.width;
				}
				
				// Flip based on horizontal direction (with a small threshold to prevent rapid flipping)
				if (finalForceX < -0.01)
					this.inst.width = -this.lastKnownWidth;
				else if (finalForceX > 0.01)
					this.inst.width = this.lastKnownWidth;
			}

			this.inst.set_bbox_changed();
		}
	};

	behinstProto.calculateAllForces = function()
	{
		var movers = this.type.objtype.instances;
		var forces = this.type.forces;

		// Clear previous forces
		for (var uid in forces) {
			if (forces.hasOwnProperty(uid)) {
				delete forces[uid];
			}
		}

		var globalTargetX, globalTargetY;
		if (this.type.targetMode === 1) {
			globalTargetX = this.type.targetX;
			globalTargetY = this.type.targetY;
		} else {
			var target = this.runtime.getObjectByUID(this.type.targetUid);
			if (target) {
				globalTargetX = target.x;
				globalTargetY = target.y;
			}
		}

		if (movers.length === 0) {
			return;
		}

		for (var i = 0; i < movers.length; i++) {
			var moverA = movers[i];
			
			// Find the correct behavior instance for this mover
			var behA = null;
			for (var b = 0; b < moverA.behavior_insts.length; b++) {
				if (moverA.behavior_insts[b].type === this.type) {
					behA = moverA.behavior_insts[b];
					break;
				}
			}

			if (!behA || !behA.isActive)
				continue;

			// Determine target for this specific instance
			var targetX, targetY;
			if (behA.mode === 1) { // Wander
				targetX = behA.wanderX;
				targetY = behA.wanderY;
			} else {
				// If following global target but it doesn't exist, skip steering
				if (typeof globalTargetX === "undefined") continue;
				targetX = globalTargetX;
				targetY = globalTargetY;
			}

			var totalForceX = 0;
			var totalForceY = 0;

			// A. Steering Force (towards target)
			var dx = targetX - moverA.x;
			var dy = targetY - moverA.y;
			var distToTarget = Math.sqrt(dx * dx + dy * dy);
			
			// Scale steering by distance if close (arrival behavior) to stop jitter at target
			var steerAmount = (distToTarget < 10 ? distToTarget / 10 : 1);
			var angleToTarget = Math.atan2(dy, dx);
			totalForceX += Math.cos(angleToTarget) * steerAmount;
			totalForceY += Math.sin(angleToTarget) * steerAmount;

			// B. Repulsion Force (from other movers)
			for (var j = 0; j < movers.length; j++) {
				if (i === j) continue;

				var moverB = movers[j];
				
				// Find the behavior instance for moverB
				var behB = null;
				for (var b = 0; b < moverB.behavior_insts.length; b++) {
					if (moverB.behavior_insts[b].type === this.type) {
						behB = moverB.behavior_insts[b];
						break;
					}
				}

				// Also skip inactive movers for repulsion checks
				if (!behB || !behB.isActive)
					continue;
					
				var dx = moverB.x - moverA.x;
				// Optimization: Skip if too far on X axis
				if (Math.abs(dx) > behA.repulsionRadius) continue;

				var dy = moverB.y - moverA.y;
				// Optimization: Skip if too far on Y axis
				if (Math.abs(dy) > behA.repulsionRadius) continue;

				var distSq = (dx * dx) + (dy * dy);

				if (distSq > 0 && distSq < behA.repulsionRadiusSq) {
					var dist = Math.sqrt(distSq);
					var forceMagnitude = (behA.repulsionRadius - dist) / behA.repulsionRadius;
					totalForceX -= (dx / dist) * forceMagnitude * behA.repulsionForce;
					totalForceY -= (dy / dist) * forceMagnitude * behA.repulsionForce;
				}
			}

			// C. Obstacle Avoidance
			for (var k = 0; k < this.type.obstacleTypes.length; k++) {
				var obstacleType = this.type.obstacleTypes[k];
				var obstacles = obstacleType.instances;
				for (var m = 0; m < obstacles.length; m++) {
					var obstacle = obstacles[m];
					
					var dx = obstacle.x - moverA.x;
					if (Math.abs(dx) > behA.repulsionRadius) continue;

					var dy = obstacle.y - moverA.y;
					if (Math.abs(dy) > behA.repulsionRadius) continue;

					var distSq = (dx * dx) + (dy * dy);

					if (distSq > 0 && distSq < behA.repulsionRadiusSq) {
						var dist = Math.sqrt(distSq);
						var forceMagnitude = (behA.repulsionRadius - dist) / behA.repulsionRadius;
						totalForceX -= (dx / dist) * forceMagnitude * behA.repulsionForce;
						totalForceY -= (dy / dist) * forceMagnitude * behA.repulsionForce;
					}
				}
			}

			forces[moverA.uid] = { x: totalForceX, y: totalForceY };
		}
	};

	behinstProto.testObstacleOverlap = function()
	{
		for (var k = 0; k < this.type.obstacleTypes.length; k++) {
			var obstacleType = this.type.obstacleTypes[k];
			var obstacles = obstacleType.instances;
			for (var m = 0; m < obstacles.length; m++) {
				if (this.runtime.testOverlap(this.inst, obstacles[m]))
					return true;
			}
		}
		return false;
	};
	
	behinstProto.testSolidOverlap = function()
	{
		for (var k = 0; k < this.type.solidTypes.length; k++) {
			var solidType = this.type.solidTypes[k];
			var solids = solidType.instances;
			for (var m = 0; m < solids.length; m++) {
				if (this.runtime.testOverlap(this.inst, solids[m]))
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
		var targetName = "";
		if (this.type.targetMode === 1) {
			targetName = "(" + this.type.targetX.toFixed(0) + ", " + this.type.targetY.toFixed(0) + ")";
		} else {
			var targetInst = this.runtime.getObjectByUID(this.type.targetUid);
			targetName = targetInst ? targetInst.type.name + " (UID: " + targetInst.uid + ")" : "None";
		}
		
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Active", "value": this.isActive, "readonly": true},
				{"name": "Max speed", "value": this.maxSpeed},
				{"name": "Rotation speed", "value": this.rotationSpeed},
				{"name": "Repulsion radius", "value": this.repulsionRadius},
				{"name": "Repulsion force", "value": this.repulsionForce},
				{"name": "Target", "value": targetName, "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		switch (name) {
			case "Max speed": 		 this.maxSpeed = value; break;
			case "Rotation speed": 	 this.rotationSpeed = value; break;
			case "Repulsion radius": 
				this.repulsionRadius = value; 
				this.repulsionRadiusSq = value * value;
				break;
			case "Repulsion force":  this.repulsionForce = value; break;
		}
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.IsActive = function ()
	{
		return this.isActive;
	};
	
	Cnds.prototype.IsMoving = function ()
	{
		if (!this.isActive) return false;
		return this.isMoving;
	};
	
	Cnds.prototype.IsWandering = function ()
	{
		return (this.mode === 1);
	};
	
	Cnds.prototype.IsStuck = function ()
	{
		if (!this.isActive) return false;
		return this.isStuck;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.SetTarget = function (obj)
	{
		if (!obj) return;
		var inst = obj.getFirstPicked(this.inst);
		if (!inst) return;

		// Store the target's UID. This is shared across all instances of the behavior.
		this.type.targetUid = inst.uid;
		this.type.targetMode = 0;
	};
	
	Acts.prototype.SetActive = function ()
	{
		this.isActive = true;
	};
	
	Acts.prototype.SetInactive = function ()
	{
		this.isActive = false;
	};
	
	Acts.prototype.SetMaxSpeed = function (s)
	{
		this.maxSpeed = s;
	};

	Acts.prototype.SetRotationSpeed = function (s)
	{
		this.rotationSpeed = s;
	};

	Acts.prototype.SetRepulsionRadius = function (r)
	{
		this.repulsionRadius = r;
		this.repulsionRadiusSq = r * r;
	};

	Acts.prototype.SetRepulsionForce = function (f)
	{
		this.repulsionForce = f;
	};
	
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

	Acts.prototype.AddSolid = function (obj)
	{
		if (!obj) return;
		if (this.type.solidTypes.indexOf(obj) === -1)
			this.type.solidTypes.push(obj);
	};

	Acts.prototype.ClearSolids = function ()
	{
		this.type.solidTypes.length = 0;
	};
	
	Acts.prototype.SetTargetXY = function (x, y)
	{
		this.type.targetX = x;
		this.type.targetY = y;
		this.type.targetMode = 1;
	};

	Acts.prototype.SetMode = function (m)
	{
		if (this.mode !== m)
		{
			this.mode = m;
			if (this.mode === 1) // Wander
			{
				this.wanderTimer = 0; // Force immediate new target selection
			}
		}
	};

	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	behaviorProto.exps = new Exps();
	
}());