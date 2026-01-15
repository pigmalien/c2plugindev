﻿function GetBehaviorSettings()
{
	return {
		"name":			"RPG Leveler",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"RPGLeveler",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Manages experience points and leveling for characters using configurable mathematical curves.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net",
		"category":		"General",
		"flags":		bf_onlyone						// uncomment lines to enable flags...
					//	| bf_onlyone			// can only be added once to an object, e.g. solid
	};
};

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>, and {my} for the current behavior icon & name
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// Conditions
AddCondition(0, cf_trigger, "On level up", "Leveling", "{my} On level up", "Triggered when the object levels up.", "OnLevelUp");
AddCondition(1, cf_trigger, "On max level reached", "Leveling", "{my} On max level reached", "Triggered once when the object reaches the maximum level.", "OnMaxLevelReached");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name
AddNumberParam("Amount", "The amount of experience to add.");
AddAction(0, af_none, "Add experience", "Experience", "Add {0} experience to {my}", "Add experience points to the object.", "AddXP");

AddComboParamOption("Polynomial (Base * L^2)");
AddComboParamOption("Exponential (Base * Factor^(L-1))");
AddComboParamOption("Linear (Base * L)");
AddComboParam("Curve Type", "Select the formula for calculating XP requirements.");
AddAction(1, af_none, "Set curve type", "Configuration", "Set curve type to {0}", "Set the experience curve formula.", "SetCurveType");

AddAction(2, af_none, "Reset level", "Leveling", "Reset level and XP for {my}", "Reset the object's level to 1 and XP to 0.", "ResetLevel");

AddNumberParam("Level", "The level to set the object to.");
AddAction(3, af_none, "Set level", "Debug", "Set level to {0}", "Instantly set the object's level (for debugging).", "SetLevel");

AddNumberParam("Experience", "The total experience to set the object to.");
AddAction(4, af_none, "Set experience", "Debug", "Set total experience to {0}", "Instantly set the object's total experience (for debugging).", "SetXP");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel
AddExpression(0, ef_return_number, "CurrentLevel", "Leveling", "CurrentLevel", "The current level of the object.");
AddExpression(1, ef_return_number, "CurrentXP", "Experience", "CurrentXP", "The total accumulated experience points.");
AddExpression(2, ef_return_number, "XPRemaining", "Experience", "XPRemaining", "The remaining experience points needed to reach the next level.");
AddExpression(3, ef_return_number, "XPForNextLevel", "Experience", "XPForNextLevel", "The total experience points required for the next level up.");
AddExpression(4, ef_return_number, "BonusPointsAvailable", "Stats", "BonusPointsAvailable", "The number of unspent bonus points from leveling up.");
AddExpression(5, ef_return_number, "XPPercentageToNextLevel", "UI", "XPPercentageToNextLevel", "The progress to the next level as a value from 0 to 1.");

AddNumberParam("Level", "The level to calculate for.");
AddNumberParam("Base", "The base value of the stat.");
AddNumberParam("Growth", "The growth rate per level.");
AddNumberParam("Curve", "The power curve exponent (e.g. 1 for linear, 2 for quadratic).");
AddExpression(6, ef_return_number, "CalculateStat", "Stats", "CalculateStat", "Calculate a stat value using the polynomial formula: Base + (Growth * ((Level - 1) ^ Curve))");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_integer, 	"Initial level",		1,		"The starting level of the object."),
	new cr.Property(ept_integer, 	"Max level",			99,		"The maximum level the object can achieve."),
	new cr.Property(ept_combo,		"Curve type",			"Polynomial (Base * L^2)", "The formula used to calculate the XP required for the next level.", "Polynomial (Base * L^2)|Exponential (Base * Factor^(L-1))|Linear (Base * L)"),
	new cr.Property(ept_float,		"Base XP",				100,	"The base value used in the XP curve formula."),
	new cr.Property(ept_float,		"Growth factor",		1.5,	"The growth factor used in the 'Exponential' curve formula."),
	new cr.Property(ept_integer,	"Bonus points per level", 1,	"The number of bonus stat points awarded on each level up."),
	new cr.Property(ept_text,		"Custom curve formula",	"",		"A custom JavaScript expression for XP calculation, e.g. '100 * Math.pow(L, 3)'. Overrides 'Curve type' if set. 'L' is the current level.")
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
