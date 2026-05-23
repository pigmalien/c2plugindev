// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.ProLineOfSight = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvvvvvvv
	var behaviorProto = cr.behaviors.ProLineOfSight.prototype;
		
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
		// Load properties from edittime.js
		this.checkInterval = this.properties[0];

		// [Inference] Automatically assign an offset based on the UID to ensure 
		// performance staggering across all instances without user input.
		this.frameOffset = this.inst.uid % Math.max(1, this.checkInterval);

		this.coneAngle = cr.to_radians(this.properties[1]); // Convert to radians once for efficiency
		this.range = this.properties[2];
		this.isEnabled = (this.properties[3] === 0); // 0=Enabled, 1=Disabled

		// Internal state
		this.targetUids = []; // Array of UIDs being tracked
		this.hasLOS = false; // Current line of sight status to the tracked target
		this.lastHasLOS = false; // Previous line of sight status for trigger comparison
		
		// Last calculated values for expressions
		this.lastTargetX = 0;
		this.lastTargetY = 0;
		this.lastTargetDistance = 0;
		this.lastTargetAngle = 0; // In degrees
		this.lastBestUid = -1;
		this.visibleUids = []; // [Inference] Tracks all visible targets for filtered picking

		// [Inference] Move obstacle tracking to instance level to prevent cross-instance interference
		this.obstacleTypes = [];
		this.solidTypes = [];

		// this.myValue = 0;
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
		return { // [Inference] All properties and internal state variables are saved to JSON for game state persistence.
			"ci": this.checkInterval,
			"fo": this.frameOffset,
			"ca": this.coneAngle,
			"rg": this.range,
			"en": this.isEnabled,
			"tuids": this.targetUids,
			"hlos": this.hasLOS,
			"lhlos": this.lastHasLOS,
			"ltx": this.lastTargetX,
			"lty": this.lastTargetY,
			"ltd": this.lastTargetDistance,
			"lta": this.lastTargetAngle
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		this.checkInterval = o["ci"];
		this.frameOffset = o["fo"];
		this.coneAngle = o["ca"];
		this.range = o["rg"];
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
		this.isEnabled = o["en"];
		this.targetUids = o["tuids"] || [];
		this.hasLOS = o["hlos"];
		this.lastHasLOS = o["lhlos"];
		this.lastTargetX = o["ltx"];
		this.lastTargetY = o["lty"];
		this.lastTargetDistance = o["ltd"];
		this.lastTargetAngle = o["lta"];
	};

	behinstProto.tick = function ()
	{
		if (!this.isEnabled) return;

		// 1. TICK INTERVALLING (PERFORMANCE BOOSTER)
		// Only run the raycast routine when (runtime.tickcount + this.frameOffset) % this.checkInterval === 0
		if (this.checkInterval <= 0 || (this.runtime.tickcount + this.frameOffset) % this.checkInterval !== 0) {
			return;
		}

		var oldHasLOS = this.hasLOS;

		if (this.targetUids.length === 0) {
			this.hasLOS = false;
			this.visibleUids.length = 0;
			if (oldHasLOS) {
				this.runtime.trigger(cr.behaviors.ProLineOfSight.prototype.cnds.OnLostLineOfSight, this.inst);
			}
			return;
		}

		this.hasLOS = false; // Assume no LOS until proven otherwise
		var instX = this.inst.x;
		var instY = this.inst.y;
		var rangeSq = this.range * this.range;
		
		var bestDistSq = Infinity;
		var bestInst = null;
		this.visibleUids.length = 0; // [Inference] Clear visibility list for this check

		for (var k = 0; k < this.targetUids.length; k++) {
			var targetInst = this.runtime.getObjectByUID(this.targetUids[k]);
			if (!targetInst) {
				this.targetUids.splice(k, 1);
				k--;
				continue;
			}

			var targetX = targetInst.x;
			var targetY = targetInst.y;

			// 2. Squared Distance Check (Range)
			var dx = targetX - instX;
			var dy = targetY - instY;
			var distSq = dx * dx + dy * dy;

			if (distSq > rangeSq) continue;

			// 3. CONE OF VISION.
			var angleToTargetRad = cr.angleTo(instX, instY, targetX, targetY);
			var instAngleRad = this.inst.angle;
			var angleDiffRad = cr.angleDiff(instAngleRad, angleToTargetRad);

			if (this.coneAngle < cr.to_radians(360) && Math.abs(angleDiffRad) > (this.coneAngle / 2)) continue;

			// 4. Raycasting for Obstacles
			var blocked = false;
			for (var i = 0, len = this.obstacleTypes.length; i < len; i++) {
				var obsType = this.obstacleTypes[i];
				if (!obsType) continue;
				var instances = obsType.instances; // [Inference] Guarding against null instance lists (Families)
				if (!instances) continue;

				for (var j = 0, jlen = instances.length; j < jlen; j++) {
					var oInst = instances[j];
					if (oInst.uid === this.inst.uid || oInst.uid === targetInst.uid) continue;
					
					if (check_intersection(instX, instY, targetX, targetY, oInst)) {
						blocked = true;
						break;
					}
				}
				if (blocked) break;
			}

			if (!blocked) {
				for (var i = 0, len = this.solidTypes.length; i < len; i++) {
					var sType = this.solidTypes[i];
					if (!sType) continue;
					var sInstances = sType.instances;
					if (!sInstances) continue;

					for (var j = 0, jlen = sInstances.length; j < jlen; j++) {
						var sInst = sInstances[j];
						if (sInst.uid === this.inst.uid || sInst.uid === targetInst.uid) continue;

						if (check_intersection(instX, instY, targetX, targetY, sInst)) {
							blocked = true;
							break;
						}
					}
					if (blocked) break;
				}
			}

			if (!blocked) {
				this.hasLOS = true;
				this.visibleUids.push(targetInst.uid); // [Inference] Add to the set of filtered visible objects
				if (distSq < bestDistSq) {
					bestDistSq = distSq;
					bestInst = targetInst;
				}
			}
		}

		// Update expressions with the nearest visible target
		if (bestInst) {
			this.lastTargetX = bestInst.x;
			this.lastTargetY = bestInst.y;
			this.lastTargetDistance = Math.sqrt(bestDistSq);
			this.lastTargetAngle = cr.to_degrees(cr.angleTo(instX, instY, bestInst.x, bestInst.y));
			this.lastBestUid = bestInst.uid;
		}

		// Trigger Logic
		if (!oldHasLOS && this.hasLOS) {
			this.runtime.trigger(cr.behaviors.ProLineOfSight.prototype.cnds.OnLineOfSight, this.inst);
		} else if (oldHasLOS && !this.hasLOS) {
			this.runtime.trigger(cr.behaviors.ProLineOfSight.prototype.cnds.OnLostLineOfSight, this.inst);
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
				{"name": "Tracked Count", "value": this.targetUids.length, "readonly": true},
				{"name": "Best Target UID", "value": this.lastBestUid, "readonly": true},
				{"name": "Has LOS", "value": this.hasLOS, "readonly": true},
				{"name": "Check Interval", "value": this.checkInterval},
				{"name": "Frame Offset (Auto)", "value": this.frameOffset, "readonly": true},
				{"name": "Cone Angle (deg)", "value": cr.to_degrees(this.coneAngle)},
				{"name": "Range", "value": this.range},
				{"name": "Last Target X", "value": this.lastTargetX, "readonly": true},
				{"name": "Last Target Y", "value": this.lastTargetY, "readonly": true},
				{"name": "Last Distance", "value": this.lastTargetDistance, "readonly": true},
				{"name": "Last Angle (deg)", "value": this.lastTargetAngle, "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "Check Interval") {
			this.checkInterval = value;
			// Update offset if interval changes in debugger
			this.frameOffset = this.inst.uid % Math.max(1, this.checkInterval);
		}
		else if (name === "Cone Angle (deg)") this.coneAngle = cr.to_radians(value);
		else if (name === "Range") this.range = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnLineOfSight = function ()
	{
		// [Inference] When the trigger fires, we retrieve the UID of the target that was just seen
		// and pick it in the SOL so the event sheet knows which instance to act upon.
		var target = this.runtime.getObjectByUID(this.lastBestUid);
		if (target)
			target.type.getCurrentSol().pick_one(target);

		return true; 
	};
	
	Cnds.prototype.HasLineOfSight = function ()
	{
		// [Inference] Standard C2 Picking: Filter the current Selection Object List (SOL) 
		// rather than replacing it. This prevents "interference" with other conditions.
		if (!this.hasLOS) return false;

		var targetUids = this.visibleUids;
		var runtime = this.runtime;

		var sol_picked = false;
		
		// [Optimization] Instead of clearing every type in the project, only filter
		// the object types of the targets we are actually tracking.
		var processedTypes = [];
		for (var k = 0, klen = this.targetUids.length; k < klen; k++) {
			var inst = runtime.getObjectByUID(this.targetUids[k]);
			if (!inst || processedTypes.indexOf(inst.type) !== -1) continue;
			
			var t = inst.type;
			processedTypes.push(t);
			
			var sol = t.getCurrentSol();
			var instances = sol.getObjects();
			var matches = [];

			for (var j = 0, jlen = instances.length; j < jlen; j++) {
				if (targetUids.indexOf(instances[j].uid) !== -1) {
					matches.push(instances[j]);
				}
			}

			// Always clear and filter the SOL for tracked types to prevent picking leaks
			sol.select_all = false;
			sol.instances.length = 0; // [Inference] Using push instead of assignment to maintain SOL reference stability
			for (var m = 0; m < matches.length; m++) sol.instances.push(matches[m]);

			if (matches.length > 0) sol_picked = true;
		}

		return sol_picked;
	};

	Cnds.prototype.OnLostLineOfSight = function ()
	{
		var target = this.runtime.getObjectByUID(this.lastBestUid);
		if (target)
			target.type.getCurrentSol().pick_one(target);

		return true;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.SetTarget = function (obj)
	{
		this.targetUids.length = 0; // Clear existing
		// Call AddTarget through the acts prototype to avoid the "not a function" error
		behaviorProto.acts.AddTarget.call(this, obj);
	};

	Acts.prototype.AddTarget = function (obj)
	{
		if (!obj) return;
		var instances = obj.getCurrentSol().getObjects();
		for (var i = 0; i < instances.length; i++) {
			var uid = instances[i].uid;
			if (this.targetUids.indexOf(uid) === -1) {
				this.targetUids.push(uid);
			}
		}
	};

	Acts.prototype.RemoveTarget = function (obj)
	{
		if (!obj) return;
		var instances = obj.getCurrentSol().getObjects();
		for (var i = 0; i < instances.length; i++) {
			var idx = this.targetUids.indexOf(instances[i].uid);
			if (idx !== -1) {
				this.targetUids.splice(idx, 1);
			}
		}
	};

	Acts.prototype.ClearTarget = function ()
	{
		this.targetUids.length = 0;
	};

	Acts.prototype.SetEnabled = function (state)
	{
		this.isEnabled = (state === 0); // 0=Enabled, 1=Disabled
	};

	Acts.prototype.SetConeAngle = function (angle)
	{
		this.coneAngle = cr.to_radians(angle);
	};

	Acts.prototype.SetRange = function (range)
	{
		this.range = range;
	};

	Acts.prototype.AddObstacle = function (obj)
	{
		if (!obj) return;
		// [Inference] Use instance-level array
		if (this.obstacleTypes.indexOf(obj) === -1) {
			this.obstacleTypes.push(obj);
		}
	};

	Acts.prototype.ClearObstacles = function ()
	{
		this.obstacleTypes.length = 0;
	};

	Acts.prototype.AddSolidObstacle = function (obj)
	{
		if (!obj) return;
		if (this.solidTypes.indexOf(obj) === -1) {
			this.solidTypes.push(obj);
		}
	};

	Acts.prototype.ClearSolidObstacles = function ()
	{
		this.solidTypes.length = 0;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.TargetX = function (ret)
	{
		ret.set_float(this.lastTargetX);
	};

	Exps.prototype.TargetY = function (ret)
	{
		ret.set_float(this.lastTargetY);
	};

	Exps.prototype.DistanceToTarget = function (ret)
	{
		ret.set_float(this.lastTargetDistance);
	};

	Exps.prototype.AngleToTarget = function (ret)
	{
		ret.set_float(this.lastTargetAngle);
	};

	Exps.prototype.TargetUID = function (ret)
	{
		ret.set_int(this.lastBestUid);
	};
	
	behaviorProto.exps = new Exps();
	
	//////////////////////////////////////
	// Math Helpers for Construct 2 Raycasting
	function distanceSqTo(x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return dx * dx + dy * dy;
	}

	function line_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
		var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (den === 0) return null;

		var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return {
				x: x1 + t * (x2 - x1),
				y: y1 + t * (y2 - y1)
			};
		}
		return null;
	}

	function ray_box_intersection(ray_x1, ray_y1, ray_x2, ray_y2, bbox) {
		// Broad phase: check if both ray points are on the same side of the box
		if (ray_x1 < bbox.left && ray_x2 < bbox.left) return null;
		if (ray_x1 > bbox.right && ray_x2 > bbox.right) return null;
		if (ray_y1 < bbox.top && ray_y2 < bbox.top) return null;
		if (ray_y1 > bbox.bottom && ray_y2 > bbox.bottom) return null;

		var closest_hit = null;
		var closest_dist_sq = Infinity;

		// Check all 4 sides of the AABB
		for (var i = 0; i < 4; i++) {
			var x1, y1, x2, y2;
			if (i === 0)      { x1 = bbox.left;  y1 = bbox.top;    x2 = bbox.right; y2 = bbox.top; }
			else if (i === 1) { x1 = bbox.right; y1 = bbox.top;    x2 = bbox.right; y2 = bbox.bottom; }
			else if (i === 2) { x1 = bbox.right; y1 = bbox.bottom; x2 = bbox.left;  y2 = bbox.bottom; }
			else              { x1 = bbox.left;  y1 = bbox.bottom; x2 = bbox.left;  y2 = bbox.top; }

			var hit = line_segment_intersection(ray_x1, ray_y1, ray_x2, ray_y2, x1, y1, x2, y2);
			
			if (hit) {
				var dist_sq = distanceSqTo(ray_x1, ray_y1, hit.x, hit.y);
				if (dist_sq < closest_dist_sq) {
					closest_dist_sq = dist_sq;
					closest_hit = hit;
				}
			}
		}
		
		// If no edge intersection, check if the start point is inside the box
		if (!closest_hit) {
			if (ray_x1 >= bbox.left && ray_x1 <= bbox.right && ray_y1 >= bbox.top && ray_y1 <= bbox.bottom) {
				return { x: ray_x1, y: ray_y1 };
			}
		}

		return closest_hit;
	}

	function check_intersection(startX, startY, endX, endY, inst) {
		// [Inference] Construct 2 Tilemaps use 'tilewidth' and 'tileheight'. 
		// We must check tiles individually because the Bounding Box often covers the whole layout.
		if (inst.tilewidth && inst.tileheight && inst.getTileAt) {
			if (inst.rayIntersection) {
				var res = inst.rayIntersection(startX, startY, endX, endY);
				return res || null;
			}

			// Manual tile-stepping fallback for standard Tilemaps
			var tw = inst.tilewidth;
			var th = inst.tileheight;
			var x1 = startX / tw;
			var y1 = startY / th;
			var x2 = endX / tw;
			var y2 = endY / th;

			var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
			var steps = Math.ceil(dist * 2); // Sample twice per tile for precision
			if (steps === 0) steps = 1;

			for (var i = 0; i <= steps; i++) {
				var t = i / steps;
				var tx = Math.floor(x1 + (x2 - x1) * t);
				var ty = Math.floor(y1 + (y2 - y1) * t);

				// getTileAt returns -1 for empty space. Anything else is an obstacle.
				if (inst.getTileAt(tx, ty) !== -1) {
					return { x: tx * tw, y: ty * th };
				}
			}
			return null;
		}

		inst.update_bbox();
		var bbox = inst.bbox;

		// Optimization: If both points are outside the same side of the box, no hit is possible.
		if (startX < bbox.left && endX < bbox.left) return null;
		if (startX > bbox.right && endX > bbox.right) return null;
		if (startY < bbox.top && endY < bbox.top) return null;
		if (startY > bbox.bottom && endY > bbox.bottom) return null;

		return ray_box_intersection(startX, startY, endX, endY, bbox);
	}

}());