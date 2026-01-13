// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.GameMaster = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.GameMaster.prototype;
		
	/////////////////////////////////////
	// GameManager class
	function GameManager()
	{
		this.monsters = [];
	}

	GameManager.prototype.loadDatabase = function (jsonString)
	{
		var data;
		try {
			data = JSON.parse(jsonString);
		} catch (e) {
			console.error("GameManager: Invalid JSON string provided.");
			return;
		}

		this.monsters = [];

		for (var i = 0; i < data.length; i++) {
			var m = data[i];
			this.monsters.push({
				name: m["name"],
				element: m["element"],
				hp_base: m["hp"],
				exp_base: m["exp"],
				atk_base: m["atk"],
				common_drop: m["common"],
				rare_drop: m["rare"],
				nothing_weight: m["none"]
			});
		}
	};

	GameManager.prototype.spawnMonster = function (index, level, difficulty)
	{
		if (index < 0 || index >= this.monsters.length)
			return null;

		var m = this.monsters[index];
		var multiplier = 1.15; // Normal

		if (difficulty === "Easy") multiplier = 1.12;
		else if (difficulty === "Hard") multiplier = 1.22;

		return {
			name: m.name,
			element: m.element,
			hp: Math.ceil(m.hp_base * Math.pow(multiplier, level)),
			atk: Math.ceil(m.atk_base * Math.pow(multiplier, level))
		};
	};

	GameManager.prototype.rollLoot = function (index)
	{
		if (index < 0 || index >= this.monsters.length)
			return "";

		var m = this.monsters[index];
		
		// 1. Monster specific loot
		var monsterLoot = "";
		var common = m.common_drop;
		var rare = m.rare_drop;
		var none = m.nothing_weight;
		
		var totalWeight = common[1] + rare[1] + none;
		var roll = Math.random() * totalWeight;
		
		roll -= none;
		if (roll < 0) {
			monsterLoot = "";
		} else {
			roll -= common[1];
			if (roll < 0) {
				monsterLoot = common[0];
			} else {
				monsterLoot = rare[0];
			}
		}
		
		// 2. Global Generic Loot
		var globalLoot = "";
		var globalTable = [
			{ name: "Coal", weight: 20 },
			{ name: "Potion", weight: 15 },
			{ name: "Antidote", weight: 5 },
			{ name: "", weight: 60 }
		];
		
		var gTotal = 0;
		for (var i = 0; i < globalTable.length; i++)
			gTotal += globalTable[i].weight;
			
		var gRoll = Math.random() * gTotal;
		for (var i = 0; i < globalTable.length; i++) {
			gRoll -= globalTable[i].weight;
			if (gRoll < 0) {
				globalLoot = globalTable[i].name;
				break;
			}
		}
		
		// Combine results
		var results = [];
		if (monsterLoot !== "") results.push(monsterLoot);
		if (globalLoot !== "") results.push(globalLoot);
		
		return results.join(",");
	};

	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;
		this.gameManager = new GameManager();
		this.generatedMonster = null;
		this.lastLoot = "";
	};
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.LoadDatabase = function (jsonString)
	{
		this.gameManager.loadDatabase(jsonString);
	};

	Acts.prototype.GenerateMonster = function (index, level, difficulty)
	{
		var diffStr = "Normal";
		if (difficulty === 0) diffStr = "Easy";
		else if (difficulty === 2) diffStr = "Hard";

		this.generatedMonster = this.gameManager.spawnMonster(index, level, diffStr);
	};

	Acts.prototype.RollLoot = function (index)
	{
		this.lastLoot = this.gameManager.rollLoot(index);
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.MonsterName = function (ret)
	{
		ret.set_string(this.generatedMonster ? this.generatedMonster.name : "");
	};

	Exps.prototype.MonsterElement = function (ret)
	{
		ret.set_string(this.generatedMonster ? this.generatedMonster.element : "");
	};

	Exps.prototype.MonsterHP = function (ret)
	{
		ret.set_float(this.generatedMonster ? this.generatedMonster.hp : 0);
	};

	Exps.prototype.MonsterAtk = function (ret)
	{
		ret.set_float(this.generatedMonster ? this.generatedMonster.atk : 0);
	};

	Exps.prototype.LastLoot = function (ret)
	{
		ret.set_string(this.lastLoot);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());