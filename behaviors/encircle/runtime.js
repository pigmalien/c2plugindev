// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.Encircle = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Encircle.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function () {
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		// Load properties
		this.enabled = (this.properties[0] !== 0);
		this.speed = this.properties[1];
		this.rx = this.properties[2];
		this.ry = this.properties[3];
		this.angle = cr.to_radians(this.properties[4]);
		this.setAngleMode = this.properties[5]; // 0=No, 1=Face motion, 2=Face target
		this.zOrderMode = this.properties[6];   // 0=No, 1=Yes

		this.targetUid = -1;
	};

	behinstProto.saveToJSON = function () {
		return {
			"en": this.enabled,
			"s": this.speed,
			"rx": this.rx,
			"ry": this.ry,
			"a": this.angle,
			"sam": this.setAngleMode,
			"zom": this.zOrderMode,
			"uid": this.targetUid
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["en"];
		this.speed = o["s"];
		this.rx = o["rx"];
		this.ry = o["ry"];
		this.angle = o["a"];
		this.setAngleMode = o["sam"];
		this.zOrderMode = o["zom"];
		this.targetUid = o["uid"];
	};

	behinstProto.tick = function () {
		if (!this.enabled) return;

		var dt = this.runtime.getDt(this.inst);

		// Find target
		var target = null;
		if (this.targetUid !== -1) {
			target = this.runtime.getObjectByUID(this.targetUid);
		}

		if (!target) return; // Target lost or not set

		// Update angle
		this.angle += cr.to_radians(this.speed) * dt;

		// Wrap angle
		this.angle = cr.clamp_angle(this.angle);

		// Update position
		var newX = target.x + Math.cos(this.angle) * this.rx;
		var newY = target.y + Math.sin(this.angle) * this.ry;

		if (newX !== this.inst.x || newY !== this.inst.y) {
			this.inst.x = newX;
			this.inst.y = newY;
			this.inst.set_bbox_changed();
		}

		// Rotation
		if (this.setAngleMode === 1) // Face motion
		{
			// Tangent angle: Angle of velocity vector.
			// dx/dt = -rx * sin(a)
			// dy/dt = ry * cos(a)
			// If speed is negative, it moves opposite.
			// But 'speed' property is in degrees/sec.

			var dx = -this.rx * Math.sin(this.angle);
			var dy = this.ry * Math.cos(this.angle);

			// Adjust for direction of speed
			if (this.speed < 0) {
				dx = -dx;
				dy = -dy;
			}

			this.inst.angle = Math.atan2(dy, dx);
			this.inst.set_bbox_changed();
		}
		else if (this.setAngleMode === 2) // Face target
		{
			// Angle from object to target.
			// dx = target.x - inst.x
			// dy = target.y - inst.y
			this.inst.angle = cr.angleTo(this.inst.x, this.inst.y, target.x, target.y);
			this.inst.set_bbox_changed();
		}

		// Z-Ordering
		if (this.zOrderMode === 1) {
			// If sin(angle) > 0, we are "below" the target (graphically), so in front?
			// Standard 2D: Y points down.
			// If relative Y > 0, object is below target on screen.
			// Often simulates "front" in top-down/isometric.
			// So if relative Y > 0, move to front (of target).
			// If relative Y < 0, move to back (of target).

			// Check standard layer function
			if (this.inst.layer && target.layer && this.inst.layer === target.layer && this.inst.layer.moveInstanceAdjacent) {
				var relY = Math.sin(this.angle) * this.ry; // This is the component relative to target center

				// If relY > 0: In front -> After target
				// If relY < 0: Behind -> Before target

				var isAfter = (relY > 0);
				this.inst.layer.moveInstanceAdjacent(this.inst, target, isAfter);
			}
		}
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections) {
		propsections.push({
			"title": this.type.name,
			"properties": [
				{ "name": "Enabled", "value": this.enabled },
				{ "name": "Speed", "value": this.speed },
				{ "name": "Radius X", "value": this.rx },
				{ "name": "Radius Y", "value": this.ry },
				{ "name": "Angle", "value": cr.to_degrees(this.angle) },
				{ "name": "Target UID", "value": this.targetUid }
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value) {
		if (name === "Enabled") this.enabled = value;
		if (name === "Speed") this.speed = value;
		if (name === "Radius X") this.rx = value;
		if (name === "Radius Y") this.ry = value;
		if (name === "Angle") this.angle = cr.to_radians(value);
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() { };

	Cnds.prototype.IsEnabled = function () {
		return this.enabled;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() { };

	Acts.prototype.SetTarget = function (obj) {
		if (!obj) return;
		var inst = obj.getFirstPicked();
		if (inst) {
			this.targetUid = inst.uid;
		}
	};

	Acts.prototype.SetEnabled = function (s) {
		this.enabled = (s === 1);
	};

	Acts.prototype.SetSpeed = function (s) {
		this.speed = s;
	};

	Acts.prototype.SetRadiusX = function (r) {
		this.rx = r;
	};

	Acts.prototype.SetRadiusY = function (r) {
		this.ry = r;
	};

	Acts.prototype.SetAngle = function (a) {
		this.angle = cr.to_radians(a);
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() { };

	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.speed);
	};

	Exps.prototype.RadiusX = function (ret) {
		ret.set_float(this.rx);
	};

	Exps.prototype.RadiusY = function (ret) {
		ret.set_float(this.ry);
	};

	Exps.prototype.Angle = function (ret) {
		ret.set_float(cr.to_degrees(this.angle));
	};

	behaviorProto.exps = new Exps();

}());