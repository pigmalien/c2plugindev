// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// The behavior ID is "RpgPoints"
cr.behaviors.RpgPoints = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// The behavior ID is "RpgPoints"
	var behaviorProto = cr.behaviors.RpgPoints.prototype;
		
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
		// This object will store all resource pools, e.g. this.resources["HP"] = {current: 100, max: 100, regen: 0}
		this.resources = {};
		
		// Initialize default HP and MP from properties
		var maxHP = this.properties[0];
		var maxMP = this.properties[1];
		var regenHP = this.properties[2];
		var regenMP = this.properties[3];

		// Use the "Add Custom Resource" action's logic to keep initialization consistent
		this.addResource("HP", maxHP, maxHP, regenHP);
		this.addResource("MP", maxMP, maxMP, regenMP);

		// Enable the tick function if any resource has regeneration
		this.runtime.tickMe(this);
	};

	// A helper function to add/update a resource and clamp its values
	behinstProto.addResource = function(key, max, current, regen) {
		if (max < 0) max = 0;
		if (current > max) current = max;
		if (current < 0) current = 0;

		this.resources[key.toUpperCase()] = {
			"current": current,
			"max": max,
			"regen": regen
		};
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
			"res": this.resources
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.resources = o["res"];
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		if (dt === 0) return;

		for (var key in this.resources) {
			if (this.resources.hasOwnProperty(key)) {
				var res = this.resources[key];
				if (res.regen !== 0) {
					res.current += res.regen * dt;
					// Clamp the value between 0 and max
					res.current = cr.clamp(res.current, 0, res.max);
				}
			}
		}
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		var debugger_props = [];
		for (var key in this.resources)
		{
			if (this.resources.hasOwnProperty(key))
			{
				var res = this.resources[key];
				debugger_props.push({"name": key, "value": res.current.toFixed(2) + " / " + res.max + " (" + res.regen + "/s)", "readonly": true});
			}
		}

		propsections.push({
			"title": this.type.name,
			"properties": debugger_props
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Not used, as all debugger values are read-only.
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnHealthDepleted = function ()
	{
		return true; // Triggered by an action
	};

	Cnds.prototype.IsResourceMaxed = function (key)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		if (!res) return false;
		return res.current >= res.max;
	};

	Cnds.prototype.IsResourceAvailable = function (key, required)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		if (!res) return false;
		return res.current >= required;
	};
	
	Cnds.prototype.OnManaDepleted = function ()
	{
		return true; // Triggered by an action
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.TakeDamage = function (amount)
	{
		behaviorProto.acts.ModifyResource.call(this, "HP", -amount);
	};

	Acts.prototype.Heal = function (amount)
	{
		behaviorProto.acts.ModifyResource.call(this, "HP", amount);
	};

	Acts.prototype.ModifyResource = function (key, amount)
	{
		// Ensure key is a string to prevent .toUpperCase() on a non-string.
		if (typeof key !== "string")
			return;

		key = key.toUpperCase();
		var res = this.resources[key];
		if (!res) return;

		var oldValue = res.current;
		res.current += amount;
		res.current = cr.clamp(res.current, 0, res.max);

		// If HP was modified and dropped to 0, trigger the condition
		if (oldValue > 0 && res.current <= 0)
		{
			if (key === "HP") {
				this.runtime.trigger(cr.behaviors.RpgPoints.prototype.cnds.OnHealthDepleted, this.inst);
			}
			else if (key === "MP") {
				this.runtime.trigger(cr.behaviors.RpgPoints.prototype.cnds.OnManaDepleted, this.inst);
			}
		}
	};

	Acts.prototype.SetMaxResource = function (key, newMax)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		if (!res) return;

		res.max = (newMax < 0) ? 0 : newMax;
		// Clamp current value to new max
		res.current = cr.clamp(res.current, 0, res.max);
	};

	Acts.prototype.AddCustomResource = function (key, max, current, regen)
	{
		this.addResource(key, max, current, regen);
	};

	Acts.prototype.SpendMana = function (amount)
	{
		behaviorProto.acts.ModifyResource.call(this, "MP", -amount);
	};

	Acts.prototype.RestoreMana = function (amount)
	{
		behaviorProto.acts.ModifyResource.call(this, "MP", amount);
	};

	Acts.prototype.SetStats = function (maxHP, maxMP, regenHP, regenMP)
	{
		var resHP = this.resources["HP"];
		if (resHP) {
			resHP.max = (maxHP < 0) ? 0 : maxHP;
			resHP.regen = regenHP;
			resHP.current = cr.clamp(resHP.current, 0, resHP.max);
		}

		var resMP = this.resources["MP"];
		if (resMP) {
			resMP.max = (maxMP < 0) ? 0 : maxMP;
			resMP.regen = regenMP;
			resMP.current = cr.clamp(resMP.current, 0, resMP.max);
		}
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.CurrentResource = function (ret, key)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		ret.set_float(res ? res.current : 0);
	};

	Exps.prototype.MaxResource = function (ret, key)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		ret.set_float(res ? res.max : 0);
	};

	Exps.prototype.ResourcePercent = function (ret, key)
	{
		key = key.toUpperCase();
		var res = this.resources[key];
		if (res && res.max > 0) {
			ret.set_float((res.current / res.max) * 100.0);
		} else {
			ret.set_float(0);
		}
	};

	// HP Expressions
	Exps.prototype.HP = function (ret)
	{
		behaviorProto.exps.CurrentResource.call(this, ret, "HP");
	};
	Exps.prototype.MaxHP = function (ret)
	{
		behaviorProto.exps.MaxResource.call(this, ret, "HP");
	};
	Exps.prototype.HPPercent = function (ret)
	{
		behaviorProto.exps.ResourcePercent.call(this, ret, "HP");
	};

	// MP Expressions
	Exps.prototype.MP = function (ret)
	{
		behaviorProto.exps.CurrentResource.call(this, ret, "MP");
	};
	Exps.prototype.MaxMP = function (ret)
	{
		behaviorProto.exps.MaxResource.call(this, ret, "MP");
	};
	Exps.prototype.MPPercent = function (ret)
	{
		behaviorProto.exps.ResourcePercent.call(this, ret, "MP");
	};

	Exps.prototype.BaseMaxHP = function (ret)
	{
		ret.set_float(this.properties[0]);
	};

	Exps.prototype.BaseMaxMP = function (ret)
	{
		ret.set_float(this.properties[1]);
	};

	Exps.prototype.BaseRegenHP = function (ret)
	{
		ret.set_float(this.properties[2]);
	};

	Exps.prototype.BaseRegenMP = function (ret)
	{
		ret.set_float(this.properties[3]);
	};

	Exps.prototype.RegenHP = function (ret)
	{
		var res = this.resources["HP"];
		ret.set_float(res ? res.regen : 0);
	};

	Exps.prototype.RegenMP = function (ret)
	{
		var res = this.resources["MP"];
		ret.set_float(res ? res.regen : 0);
	};

	behaviorProto.exps = new Exps();
	
}());