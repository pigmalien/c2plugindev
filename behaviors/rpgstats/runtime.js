// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// The behavior ID must match the "id" property in edittime.js
cr.behaviors.rpgstats = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// The behavior ID must match the "id" property in edittime.js
	var behaviorProto = cr.behaviors.rpgstats.prototype;
		
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

	// A helper function to get or create a stat object.
	// This prevents errors when trying to access a stat that hasn't been explicitly created yet.
	behinstProto._getStat = function (key)
	{
		if (!this.stats.hasOwnProperty(key))
		{
			this.stats[key] = {
				"base": 0,
				"bonus": 0,
				"mods": [] // Temporary modifiers
			};
		}
		return this.stats[key];
	};

	behinstProto.onCreate = function()
	{
		// --- Property values ---
		var initialStatsStr = this.properties[0];
		this.unspentPoints = this.properties[1];

		// --- Internal state ---
		this.stats = {}; // Main object to hold all stat data

		// --- Parse initial stats from the property string ---
		// Format: "STR:10,INT:8,MaxHP:100"
		if (initialStatsStr)
		{
			var statPairs = initialStatsStr.split(",");
			for (var i = 0; i < statPairs.length; i++)
			{
				var parts = statPairs[i].split(":");
				if (parts.length === 2) {
					var key = parts[0].trim();
					this._getStat(key)["base"] = parseFloat(parts[1]);
				}
			}
		}
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
		
		// Clear all stat data
		this.stats = {};
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// Modifiers are temporary and are NOT saved. They should be reapplied by game events on load.
		var statsToSave = {};
		for (var p in this.stats)
		{
			if (this.stats.hasOwnProperty(p))
			{
				statsToSave[p] = {
					"base": this.stats[p]["base"],
					"bonus": this.stats[p]["bonus"]
				};
			}
		}

		return {
			"s": statsToSave,
			"up": this.unspentPoints
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		var loadedStats = o["s"];
		this.stats = {};
		for(var p in loadedStats) {
			if(loadedStats.hasOwnProperty(p)) {
				this._getStat(p)["base"] = loadedStats[p]["base"];
				this._getStat(p)["bonus"] = loadedStats[p]["bonus"];
			}
		}
		this.unspentPoints = o["up"];
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		// called every tick for you to update this.inst as necessary
		// dt is the amount of time passed since the last tick, in case it's a movement
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
			"title": "RPG Stats",
			"properties": [
				{"name": "Unspent Points", "value": this.unspentPoints, "readonly": true}
			]
		});

		var stat_section_props = [];
		for (var p in this.stats)
		{
			if (this.stats.hasOwnProperty(p))
			{
				var finalValue = this.exps.FinalStat.call(this, cr.heap_new_string(), p);
				stat_section_props.push({"name": p, "value": finalValue, "readonly": true});
			}
		}

		propsections.push({
			"title": "Calculated Stats",
			"properties": stat_section_props
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.HasUnspentPoints = function ()
	{
		return this.unspentPoints > 0;
	};

	Cnds.prototype.FinalStatMeets = function (key, cmp, value)
	{
		var finalStat = this.exps.FinalStat.call(this, cr.heap_new_string(), key);
		return cr.do_cmp(finalStat, cmp, value);
	};

	Cnds.prototype.StatHasModifiers = function (key)
	{
		var stat = this._getStat(key);
		return stat["mods"].length > 0;
	};
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.SetBaseStat = function (key, value)
	{
		this._getStat(key)["base"] = value;
	};

	Acts.prototype.AllocatePoints = function (key, amount)
	{
		if (amount <= 0) return; // Can't allocate zero or negative points
		var actualAmount = Math.min(amount, this.unspentPoints); // Can't spend more points than available
		
		if (actualAmount > 0)
		{
			this.unspentPoints -= actualAmount;
			this._getStat(key)["bonus"] += actualAmount;
		}
	};

	Acts.prototype.AddTemporaryModifier = function (key, amount)
	{
		this._getStat(key)["mods"].push(amount);
	};

	Acts.prototype.ClearModifiers = function (key)
	{
		if (key === "") // If key is empty, clear all modifiers from all stats
		{
			for (var p in this.stats)
			{
				if (this.stats.hasOwnProperty(p))
				{
					this.stats[p]["mods"] = [];
				}
			}
		}
		else // Otherwise, clear for the specific stat
		{
			this._getStat(key)["mods"] = [];
		}
	};

	Acts.prototype.SetUnspentPoints = function (amount)
	{
		this.unspentPoints = Math.max(0, amount); // Ensure it doesn't go below zero
	};

	Acts.prototype.SetBonusStat = function (key, value)
	{
		this._getStat(key)["bonus"] = value;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.FinalStat = function (ret, key)
	{
		var stat = this._getStat(key);
		var modifierTotal = 0;
		for(var i = 0; i < stat["mods"].length; i++)
		{
			modifierTotal += stat["mods"][i];
		}
		ret.set_float(stat["base"] + stat["bonus"] + modifierTotal);
	};

	Exps.prototype.BaseStat = function (ret, key)
	{
		ret.set_float(this._getStat(key)["base"]);
	};

	Exps.prototype.BonusStat = function (ret, key)
	{
		ret.set_float(this._getStat(key)["bonus"]);
	};

	Exps.prototype.ModifierTotal = function (ret, key)
	{
		var stat = this._getStat(key);
		var modifierTotal = 0;
		for(var i = 0; i < stat["mods"].length; i++)
		{
			modifierTotal += stat["mods"][i];
		}
		ret.set_float(modifierTotal);
	};

	Exps.prototype.UnspentPoints = function (ret)
	{
		ret.set_int(this.unspentPoints);
	};

	// Deprecated, maps to BonusStat
	Exps.prototype.Allocated = function (ret, key)
	{
		ret.set_float(this._getStat(key)["bonus"]);
	};
	
	behaviorProto.exps = new Exps();
	
}());