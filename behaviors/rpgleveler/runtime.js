// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** The behavior ID is specified in edittime.js ***
cr.behaviors.RPGLeveler = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** The behavior ID is specified in edittime.js ***
	var behaviorProto = cr.behaviors.RPGLeveler.prototype;
		
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
		// Properties
		this.initialLevel = this.properties[0];
		this.maxLevel = this.properties[1];
		this.curveType = this.properties[2]; // 0: Poly, 1: Exp, 2: Linear
		this.baseXP = this.properties[3];
		this.growthFactor = this.properties[4];
		this.bonusPointsPerLevel = this.properties[5];
		this.customCurve = this.properties[6];

		// Behavior state
		this.level = this.initialLevel;
		this.xp = 0;
		this.xpForNext = 0;
		this.bonusPoints = 0;
		this.maxLevelReached = false;

		// Initialize XP for first level
		this.xpForNext = this.calculateXPForLevel(this.level);

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
		return {
			"lvl": this.level,
			"xp": this.xp,
			"bp": this.bonusPoints,
			"mlr": this.maxLevelReached,
			"ct": this.curveType,
			"cc": this.customCurve
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		this.level = o["lvl"];
		this.xp = o["xp"];
		this.bonusPoints = o["bp"];
		this.maxLevelReached = o["mlr"];
		this.curveType = o["ct"];
		this.customCurve = o["cc"];

		// Recalculate next level's XP requirement
		this.xpForNext = this.calculateXPForLevel(this.level);
	};

	behinstProto.tick = function ()
	{
		// Level up check
		while (this.level < this.maxLevel && this.xp >= this.xpForNext)
		{
			this.level++;
			this.bonusPoints += this.bonusPointsPerLevel;
			this.runtime.trigger(cr.behaviors.RPGLeveler.prototype.cnds.OnLevelUp, this.inst);
			this.xpForNext = this.calculateXPForLevel(this.level);
		}

		// Max level check
		if (this.level >= this.maxLevel && !this.maxLevelReached) {
			this.xp = this.xpForNext; // Cap XP
			this.maxLevelReached = true;
			this.runtime.trigger(cr.behaviors.RPGLeveler.prototype.cnds.OnMaxLevelReached, this.inst);
		}
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Level", "value": this.level},
				{"name": "Current XP", "value": this.xp},
				{"name": "XP for Next Level", "value": this.xpForNext, "readonly": true},
				{"name": "Bonus Points", "value": this.bonusPoints},
				{"name": "Max Level", "value": this.maxLevel, "readonly": true}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		if (name === "Level")
			this.acts.SetLevel(value);
		if (name === "Current XP")
			this.acts.SetXP(value);
		if (name === "Bonus Points")
			this.bonusPoints = value;
	};
	/**END-PREVIEWONLY**/

	// --- Internal methods ---
	behinstProto.calculateXPForLevel = function(level) {
		if (level >= this.maxLevel) {
			return this.xpForNext; // No more XP needed if already at a high enough level
		}

		var L = level;
		var xp_needed = 0;

		// Custom formula overrides everything
		if (this.customCurve) {
			try {
				// Safely evaluate the custom formula
				xp_needed = (new Function('L', 'return ' + this.customCurve))(L);
			} catch(e) {
				console.error("RPG Leveler: Invalid custom curve formula. " + e);
				xp_needed = Infinity; // Prevent leveling with a bad formula
			}
		} else {
			switch (this.curveType) {
				case 0: // Polynomial
					xp_needed = this.baseXP * Math.pow(L, 2);
					break;
				case 1: // Exponential
					xp_needed = this.baseXP * Math.pow(this.growthFactor, L - 1);
					break;
				case 2: // Linear
					xp_needed = this.baseXP * L;
					break;
			}
		}
		return Math.floor(xp_needed);
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnLevelUp = function () { return true; };
	Cnds.prototype.OnMaxLevelReached = function () { return true; };
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};
	
	Acts.prototype.AddXP = function (amount) {
		if (this.level < this.maxLevel) {
			this.xp += amount;
		}
	};

	Acts.prototype.SetCurveType = function (type) {
		this.curveType = type;
		this.xpForNext = this.calculateXPForLevel(this.level); // Recalculate
	};

	Acts.prototype.ResetLevel = function () {
		this.level = this.initialLevel;
		this.xp = 0;
		this.bonusPoints = 0;
		this.maxLevelReached = false;
		this.xpForNext = this.calculateXPForLevel(this.level);
	};

	Acts.prototype.SetLevel = function (level) {
		this.level = cr.clamp(Math.floor(level), 1, this.maxLevel);
		this.xp = 0; // Reset XP to avoid instant level up
		this.maxLevelReached = (this.level === this.maxLevel);
		this.xpForNext = this.calculateXPForLevel(this.level);
	};

	Acts.prototype.SetXP = function (xp) {
		this.xp = Math.max(0, xp);
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.CurrentLevel = function (ret) { ret.set_int(this.level); };
	Exps.prototype.CurrentXP = function (ret) { ret.set_int(this.xp); };
	Exps.prototype.XPRemaining = function (ret) { ret.set_int(Math.max(0, this.xpForNext - this.xp)); };
	Exps.prototype.XPForNextLevel = function (ret) { ret.set_int(this.xpForNext); };
	Exps.prototype.BonusPointsAvailable = function (ret) { ret.set_int(this.bonusPoints); };
	Exps.prototype.XPPercentageToNextLevel = function (ret) {
		if (this.level >= this.maxLevel) {
			ret.set_float(1);
			return;
		}
		var xpAtLevelStart = this.calculateXPForLevel(this.level - 1);
		var xpInThisLevel = this.xpForNext - xpAtLevelStart;
		var xpProgressInThisLevel = this.xp - xpAtLevelStart;
		ret.set_float(cr.clamp(xpProgressInThisLevel / xpInThisLevel, 0, 1));
	};
	
	behaviorProto.exps = new Exps();
	
}());