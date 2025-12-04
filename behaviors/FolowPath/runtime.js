// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** The behavior ID must match the "id" property in edittime.js ***
cr.behaviors.FollowPath = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** The behavior ID must match the "id" property in edittime.js ***
	var behaviorProto = cr.behaviors.FollowPath.prototype;
		
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
		this.speed = this.properties[0];
		this.accel = this.properties[1];
		this.decel = this.properties[2];

		// Behavior state
		this.active = false;
		this.path = [];
		this.currentNode = 0;
		this.currentSpeed = 0;
		this.targetSpeed = 0;
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
			"s": this.speed,
			"a": this.accel,
			"d": this.decel,
			"act": this.active,
			"path": this.path,
			"cn": this.currentNode,
			"cs": this.currentSpeed,
			"ts": this.targetSpeed
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		this.speed = o["s"];
		this.accel = o["a"];
		this.decel = o["d"];
		this.active = o["act"];
		this.path = o["path"];
		this.currentNode = o["cn"];
		this.currentSpeed = o["cs"];
		this.targetSpeed = o["ts"];
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		if (dt === 0)
			return;

		// Apply acceleration/deceleration
		if (this.active)
		{
			if (this.currentSpeed < this.targetSpeed) // Need to accelerate
				this.currentSpeed = Math.min(this.currentSpeed + this.accel * dt, this.targetSpeed);
			else if (this.currentSpeed > this.targetSpeed) // Need to decelerate
				this.currentSpeed = Math.max(this.currentSpeed - this.decel * dt, this.targetSpeed);
			// else (this.currentSpeed === this.targetSpeed), do nothing
		}

		// If approaching the final node and deceleration is enabled,
		// calculate the speed required to stop at the destination.
		if (this.active && this.decel > 0 && this.currentNode === this.path.length - 1)
		{
			var finalNode = this.path[this.currentNode];
			var dx = finalNode.x - this.inst.x;
			var dy = finalNode.y - this.inst.y;
			var distToEnd = Math.sqrt(dx * dx + dy * dy);
			
			// v = sqrt(2ad)
			var requiredSpeed = Math.sqrt(2 * this.decel * distToEnd);
			this.currentSpeed = Math.min(this.currentSpeed, requiredSpeed);
		}

		if (!this.active || this.currentSpeed === 0)
			return;

		var inst = this.inst;
		var moveDist = this.currentSpeed * dt;

		// Loop while there is distance to move and we are active on a path
		while (moveDist > 0 && this.active) {
			if (this.currentNode >= this.path.length) {
				this.active = false;
				this.currentSpeed = 0;
				this.targetSpeed = 0;
				this.runtime.trigger(cr.behaviors.FollowPath.prototype.cnds.OnPathFinished, this.inst);
				break;
			}

			var targetNode = this.path[this.currentNode];
			var dx = targetNode.x - inst.x;
			var dy = targetNode.y - inst.y;
			var distToTarget = Math.sqrt(dx * dx + dy * dy);

			// If we are at or past the node, advance to the next one
			if (distToTarget < moveDist) {
				moveDist -= distToTarget;
				inst.x = targetNode.x;
				inst.y = targetNode.y;
				this.currentNode++;
				continue; // Restart loop for the next node
			}

			// --- Movement Logic ---
			var final_mag = distToTarget; // Using distToTarget as magnitude
			var final_dx = 0;
			var final_dy = 0;
			if (final_mag > 0) {
				final_dx = (dx / final_mag) * moveDist;
				final_dy = (dy / final_mag) * moveDist;
				inst.x += final_dx;
				inst.y += final_dy;
			}

			moveDist = 0; // All distance for this tick has been used
		}
		inst.set_bbox_changed();
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
				{"name": "Is active", "value": this.active, "readonly": true},
				{"name": "Speed", "value": this.speed},
				{"name": "Current Speed", "value": this.currentSpeed, "readonly": true},
				{"name": "Acceleration", "value": this.accel},
				{"name": "Deceleration", "value": this.decel},
				{"name": "Path nodes", "value": this.path.length, "readonly": true},
				{"name": "Current node", "value": this.currentNode, "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.		
		if (name === "Speed")
			this.speed = value;
		else if (name === "Acceleration")
			this.accel = value;
		else if (name === "Deceleration")
			this.decel = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnPathFinished = function () { return true; };
	Cnds.prototype.IsMoving = function () { return this.active; };
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.AddNode = function (x, y)
	{
		this.path.push({ "x": x, "y": y });
	};

	Acts.prototype.ClearPath = function ()
	{
		this.path.length = 0;
		this.active = false; // Stop movement if path is cleared
		this.currentNode = 0;
		this.currentSpeed = 0;
		this.targetSpeed = 0;
	};

	Acts.prototype.StartPath = function (speed)
	{
		if (this.path.length < 1)
			return;
			
		this.active = true;
		this.currentNode = 0;
		this.targetSpeed = speed;

		// If no acceleration, start at full speed immediately
		if (this.accel === 0)
			this.currentSpeed = speed;
	};

	Acts.prototype.Stop = function ()
	{
		this.active = false;
		this.currentSpeed = 0;
		this.targetSpeed = 0;
	};

	Acts.prototype.SetSpeed = function (s)
	{
		this.speed = s;
		if (this.active)
			this.targetSpeed = s; // Only update target speed if actively moving
	};

	Acts.prototype.SetAcceleration = function (a)
	{
		this.accel = a;
	};

	Acts.prototype.SetDeceleration = function (d)
	{
		this.decel = d;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.CurrentSpeed = function (ret)
	{
		ret.set_float(this.currentSpeed);
	};
	
	Exps.prototype.PathNodeCount = function (ret)
	{
		ret.set_int(this.path.length);
	};
	
	Exps.prototype.CurrentNode = function (ret)
	{
		ret.set_int(this.currentNode);
	};
	
	behaviorProto.exps = new Exps();
	
}());