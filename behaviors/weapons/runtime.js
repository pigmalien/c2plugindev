// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
cr.behaviors.ProWeaponController = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.ProWeaponController.prototype;

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

	// ==========================================
	// HELPER FUNCTIONS (ES5 COMPLIANT)
	// ==========================================

	// Extracts target's 2D velocity vector (vx, vy) in pixels/sec using common C2 behaviors or frame delta fallback
	function getTargetVelocity(inst, dt) {
		var vx = 0;
		var vy = 0;
		var found = false;

		if (inst.behavior_insts) {
			for (var i = 0; i < inst.behavior_insts.length; i++) {
				var b = inst.behavior_insts[i];

				// Platform behavior
				if (typeof b.vectorX === "number" && typeof b.vectorY === "number") {
					vx = b.vectorX;
					vy = b.vectorY;
					found = true;
					break;
				}
				// Bullet behavior
				if (typeof b.speed === "number" && typeof b.angle === "number") {
					vx = b.speed * Math.cos(b.angle);
					vy = b.speed * Math.sin(b.angle);
					found = true;
					break;
				}
				if (typeof b.dx === "number" && typeof b.dy === "number" && b.behavior && b.behavior.id === "Bullet") {
					vx = b.dx;
					vy = b.dy;
					found = true;
					break;
				}
				// 8-Direction behavior
				if (typeof b.dx === "number" && typeof b.dy === "number" && b.behavior && b.behavior.id === "EightDir") {
					vx = b.dx;
					vy = b.dy;
					found = true;
					break;
				}
				// Physics behavior (Box2D)
				if (b.body && typeof b.body.GetLinearVelocity === "function") {
					var vel = b.body.GetLinearVelocity();
					var scale = b.scale || 32; // Box2D uses meters, standard scale factor is 32 pixels/meter
					vx = vel.x * scale;
					vy = vel.y * scale;
					found = true;
					break;
				}
			}
		}

		// Custom instance variables check (vx, vy, dx, dy, velocity_x, velocity_y)
		if (!found) {
			var all_instvars = inst.type.all_instvars;
			if (all_instvars && inst.instance_vars) {
				var found_vx = false;
				var found_vy = false;
				for (var i = 0; i < all_instvars.length; i++) {
					var name = all_instvars[i].name.toLowerCase();
					if (name === "vx" || name === "velocity_x" || name === "dx") {
						vx = inst.instance_vars[i];
						found_vx = true;
					} else if (name === "vy" || name === "velocity_y" || name === "dy") {
						vy = inst.instance_vars[i];
						found_vy = true;
					}
				}
				if (found_vx && found_vy) {
					found = true;
				}
			}
		}

		// Fallback: frame-to-frame position delta tracking
		if (!found && dt > 0) {
			if (typeof inst.pro_prev_x === "number" && typeof inst.pro_prev_y === "number") {
				vx = (inst.x - inst.pro_prev_x) / dt;
				vy = (inst.y - inst.pro_prev_y) / dt;
			}
			inst.pro_prev_x = inst.x;
			inst.pro_prev_y = inst.y;
		}

		return { vx: vx, vy: vy };
	}

	// Quadratic solver for A*t^2 + B*t + C = 0.
	// Returns travel time 't' or -1 if no interception possible.
	function solveInterception(dx, dy, vx, vy, s) {
		var a = vx * vx + vy * vy - s * s;
		var b = 2 * (dx * vx + dy * vy);
		var c = dx * dx + dy * dy;

		// Handle edge case of negligible A coefficient
		if (Math.abs(a) < 1e-6) {
			if (Math.abs(b) < 1e-6) return -1;
			var t = -c / b;
			return t > 0 ? t : -1;
		}

		var disc = b * b - 4 * a * c;
		if (disc < 0) return -1; // Negative discriminant means no real intersection path exists

		var sqrt_disc = Math.sqrt(disc);
		var t1 = (-b - sqrt_disc) / (2 * a);
		var t2 = (-b + sqrt_disc) / (2 * a);

		var t = -1;
		if (t1 > 0 && t2 > 0) {
			t = Math.min(t1, t2); // Pick earliest positive interception point
		} else if (t1 > 0) {
			t = t1;
		} else if (t2 > 0) {
			t = t2;
		}
		return t;
	}

	// Get current game time in seconds (accounting for timescale)
	function getGameTime(runtime) {
		if (runtime.kahanTime) {
			return runtime.kahanTime.sum;
		}
		// Fallback for minified exports where kahanTime might be obfuscated
		if (typeof runtime.kqp === "number") {
			return runtime.kqp;
		}
		// Fallback to tickcount * typical dt (60fps) if nothing else
		return runtime.tickcount * 0.01666666;
	}

	// ==========================================
	// CORE BEHAVIOR INSTANCE METHODS
	// ==========================================

	behinstProto.onCreate = function () {
		// Load properties from the Construct 2 editor property list
		this.enabledState = this.properties[0]; // 0 = Disabled, 1 = Enabled
		this.enabled = (this.enabledState === 1);

		this.maxAmmo = this.properties[1];
		this.reloadDuration = this.properties[2];
		this.burstCount = this.properties[3];
		this.timeBetweenShotsBurst = this.properties[4];
		this.timeBetweenBursts = this.properties[5];
		this.targetSorting = this.properties[6]; // 0 = Nearest, 1 = First in Range
		this.range = this.properties[7];
		this.projectileSpeed = this.properties[8];

		// Setup runtime scheduler states
		this.currentAmmo = this.maxAmmo;
		this.isReloading = false;
		this.burstShotsFired = 0;
		this.nextActionTime = getGameTime(this.runtime) - 1; // Fully ready on initialization

		// Registry for targeting candidates
		this.targetTypes = [];
		this.target = null;

		// Math outputs for expressions
		this.predictedX = this.inst.x;
		this.predictedY = this.inst.y;
		this.predictedAngle = 0;
		this.rawAngle = 0;
	};

	behinstProto.onDestroy = function () {
		this.target = null;
		this.targetTypes.length = 0;
	};

	behinstProto.saveToJSON = function () {
		return {
			"enabled": this.enabled,
			"currentAmmo": this.currentAmmo,
			"isReloading": this.isReloading,
			"burstShotsFired": this.burstShotsFired,
			"nextActionTime": this.nextActionTime - getGameTime(this.runtime), // Relative offset
			"range": this.range,
			"projectileSpeed": this.projectileSpeed,
			"targetUID": this.target ? this.target.uid : -1
		};
	};

	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["enabled"];
		this.currentAmmo = o["currentAmmo"];
		this.isReloading = o["isReloading"];
		this.burstShotsFired = o["burstShotsFired"];
		this.nextActionTime = getGameTime(this.runtime) + o["nextActionTime"];
		this.range = o["range"];
		this.projectileSpeed = o["projectileSpeed"];

		var uid = o["targetUID"];
		if (uid !== -1) {
			this.target = this.runtime.getObjectByUID(uid);
		} else {
			this.target = null;
		}
	};

	// Spatial partitioning logic: gathers & sorts targets using C2 native cells
	behinstProto.scanForTarget = function () {
		if (this.targetTypes.length === 0)
			return null;

		var candidates = [];
		var rangeSq = this.range * this.range;

		// 1. Gather overlapping instances using the native spatial grid (collision cells)
		var bbox = new cr.rect(
			this.inst.x - this.range,
			this.inst.y - this.range,
			this.inst.x + this.range,
			this.inst.y + this.range
		);
		for (var i = 0; i < this.targetTypes.length; i++) {
			var type = this.targetTypes[i];
			this.runtime.getCollisionCandidates(this.inst.layer, type, bbox, candidates);
		}

		// 2. Validate distance using the squared-distance trick (bypasses Math.sqrt)
		var validCandidates = [];
		for (var i = 0; i < candidates.length; i++) {
			var c = candidates[i];
			if (c === this.inst) continue; // Skip itself

			var dx = c.x - this.inst.x;
			var dy = c.y - this.inst.y;
			var distSq = dx * dx + dy * dy;

			if (distSq <= rangeSq) {
				validCandidates.push({
					inst: c,
					distSq: distSq
				});
			}
		}

		if (validCandidates.length === 0)
			return null;

		var sortingType = this.targetSorting;

		// 3. First in Range sticky target logic
		if (sortingType === 1) {
			if (this.target) {
				for (var i = 0; i < validCandidates.length; i++) {
					if (validCandidates[i].inst === this.target) {
						return this.target; // Sticky locks onto existing target in range
					}
				}
			}
		}

		// 4. Perform selection based on distance (Nearest)
		validCandidates.sort(function (a, b) {
			return a.distSq - b.distSq;
		});

		return validCandidates[0].inst;
	};

	behinstProto.tick = function () {
		// 1. Performance optimization: Instant return if behavior is disabled
		if (!this.enabled) {
			return;
		}

		var now = getGameTime(this.runtime);
		var dt = this.runtime.getDt(this.inst);

		// 2. Timeline-Scheduler: Reload timer complete transition
		if (this.isReloading && now >= this.nextActionTime) {
			this.currentAmmo = this.maxAmmo;
			this.isReloading = false;
			this.runtime.trigger(cr.behaviors.ProWeaponController.prototype.cnds.OnReloadComplete, this.inst);
		}

		// 3. Current active target validation
		var targetValid = false;
		if (this.target) {
			if (this.target.dying || !this.target.type) {
				this.target = null;
			} else {
				// Check if still within range (using squared-distance trick)
				var dx = this.target.x - this.inst.x;
				var dy = this.target.y - this.inst.y;
				var distSq = dx * dx + dy * dy;
				var rangeSq = this.range * this.range;

				if (distSq > rangeSq) {
					this.target = null;
				} else {
					targetValid = true;
				}
			}
		}

		// 4. Target Acquisition: Re-evaluate and sort
		// Skip re-evaluating target if sticky targeting ("First in Range") is active & target is still valid.
		if (this.targetSorting !== 1 || !targetValid) {
			this.target = this.scanForTarget();
			targetValid = (this.target !== null);
		}

		// 5. Predictive Aiming calculations
		if (targetValid) {
			var targetVel = getTargetVelocity(this.target, dt);
			var dx = this.target.x - this.inst.x;
			var dy = this.target.y - this.inst.y;

			this.rawAngle = Math.atan2(dy, dx);

			// Calculate exact target position offset by future frame bullet spawn time
			var dt_spawn = Math.max(0, this.nextActionTime - now);
			var spawnX = this.target.x + targetVel.vx * dt_spawn;
			var spawnY = this.target.y + targetVel.vy * dt_spawn;

			var dx_spawn = spawnX - this.inst.x;
			var dy_spawn = spawnY - this.inst.y;

			// Solve linear relative motion equation using quadratic equation solver
			var t = solveInterception(dx_spawn, dy_spawn, targetVel.vx, targetVel.vy, this.projectileSpeed);

			if (t >= 0) {
				this.predictedX = spawnX + targetVel.vx * t;
				this.predictedY = spawnY + targetVel.vy * t;
				this.predictedAngle = Math.atan2(this.predictedY - this.inst.y, this.predictedX - this.inst.x);
			} else {
				// Fallback to direct current position if interception is impossible
				this.predictedX = this.target.x;
				this.predictedY = this.target.y;
				this.predictedAngle = this.rawAngle;
			}
		} else {
			// Clear outputs if there's no active target
			this.predictedX = this.inst.x;
			this.predictedY = this.inst.y;
			this.predictedAngle = this.inst.angle;
			this.rawAngle = this.inst.angle;
		}

		// 6. Firing timeline scheduler
		if (targetValid && !this.isReloading && now >= this.nextActionTime) {
			var infiniteAmmo = (this.maxAmmo <= 0);

			// Trigger OnFire event
			this.runtime.trigger(cr.behaviors.ProWeaponController.prototype.cnds.OnFire, this.inst);

			if (!infiniteAmmo) {
				this.currentAmmo--;
			}

			// Apply cooldown / reloading timelines
			if (!infiniteAmmo && this.currentAmmo <= 0) {
				this.isReloading = true;
				this.burstShotsFired = 0;
				this.nextActionTime = now + this.reloadDuration;
				this.runtime.trigger(cr.behaviors.ProWeaponController.prototype.cnds.OnReloadStart, this.inst);
			} else {
				this.burstShotsFired++;
				if (this.burstShotsFired >= this.burstCount) {
					this.nextActionTime = now + this.timeBetweenBursts;
					this.burstShotsFired = 0;
				} else {
					this.nextActionTime = now + this.timeBetweenShotsBurst;
				}
			}
		}
	};

	// The comments around these functions ensure they are removed when exporting
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections) {
		propsections.push({
			"title": this.type.name,
			"properties": [
				{ "name": "Enabled", "value": this.enabled, "readonly": true },
				{ "name": "Current Ammo", "value": this.currentAmmo, "readonly": true },
				{ "name": "Is Reloading", "value": this.isReloading, "readonly": true },
				{ "name": "Target locked UID", "value": this.target ? this.target.uid : -1, "readonly": true },
				{ "name": "Raw Angle", "value": cr.to_degrees(this.rawAngle), "readonly": true },
				{ "name": "Predicted Angle", "value": cr.to_degrees(this.predictedAngle), "readonly": true }
			]
		});
	};

	behinstProto.onDebugValueEdited = function (header, name, value) {
	};
	/**END-PREVIEWONLY**/

	// ==========================================
	// CONDITIONS
	// ==========================================
	function Cnds() { };

	Cnds.prototype.OnFire = function () {
		return true;
	};

	Cnds.prototype.OnReloadStart = function () {
		return true;
	};

	Cnds.prototype.OnReloadComplete = function () {
		return true;
	};

	Cnds.prototype.HasTarget = function () {
		return this.target !== null;
	};

	Cnds.prototype.IsEnabled = function () {
		return this.enabled;
	};

	Cnds.prototype.IsReloading = function () {
		return this.isReloading;
	};

	behaviorProto.cnds = new Cnds();

	// ==========================================
	// ACTIONS
	// ==========================================
	function Acts() { };

	Acts.prototype.SetEnabled = function (state) {
		var oldEnabled = this.enabled;
		this.enabled = (state === 1);

		if (oldEnabled && !this.enabled) {
			this.target = null;
		}
	};

	Acts.prototype.AddTargetType = function (obj) {
		if (!obj) return;
		if (this.targetTypes.indexOf(obj) === -1) {
			this.targetTypes.push(obj);
		}
	};

	Acts.prototype.ClearTargetTypes = function () {
		this.targetTypes.length = 0;
		this.target = null;
	};

	Acts.prototype.ManualReload = function () {
		if (!this.isReloading && this.maxAmmo > 0 && this.currentAmmo < this.maxAmmo) {
			this.isReloading = true;
			this.burstShotsFired = 0;
			this.nextActionTime = getGameTime(this.runtime) + this.reloadDuration;
			this.runtime.trigger(cr.behaviors.ProWeaponController.prototype.cnds.OnReloadStart, this.inst);
		}
	};

	Acts.prototype.SetRange = function (range) {
		this.range = range;
	};

	Acts.prototype.SetProjectileSpeed = function (speed) {
		this.projectileSpeed = speed;
	};

	Acts.prototype.ClearCurrentTarget = function () {
		this.target = null;
	};

	behaviorProto.acts = new Acts();

	// ==========================================
	// EXPRESSIONS
	// ==========================================
	function Exps() { };

	Exps.prototype.PredictFiringAngle = function (ret) {
		ret.set_float(cr.to_degrees(this.predictedAngle));
	};

	Exps.prototype.RawAngleToTarget = function (ret) {
		ret.set_float(cr.to_degrees(this.rawAngle));
	};

	Exps.prototype.CurrentAmmo = function (ret) {
		ret.set_int(this.currentAmmo);
	};

	Exps.prototype.TargetUID = function (ret) {
		ret.set_int(this.target ? this.target.uid : -1);
	};

	Exps.prototype.PredictX = function (ret) {
		ret.set_float(this.predictedX);
	};

	Exps.prototype.PredictY = function (ret) {
		ret.set_float(this.predictedY);
	};

	Exps.prototype.TargetX = function (ret) {
		ret.set_float(this.target ? this.target.x : 0);
	};

	Exps.prototype.TargetY = function (ret) {
		ret.set_float(this.target ? this.target.y : 0);
	};

	Exps.prototype.Range = function (ret) {
		ret.set_float(this.range);
	};

	Exps.prototype.ProjectileSpeed = function (ret) {
		ret.set_float(this.projectileSpeed);
	};

	behaviorProto.exps = new Exps();

}());