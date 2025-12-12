function GetBehaviorSettings()
{
	return {
		"name":			"RPG Stats",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"rpgstats",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Manages all core numerical attributes for a game unit, providing final calculated stat values based on leveling, allocation, and temporary modifiers.",
		"author":		"Gemini Code Assist",
		"help url":		"<your website or a manual entry on Scirra.com>",
		"category":		"Attributes",				// Prefer to re-use existing categories, but you can set anything here
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

AddCondition(0, cf_none, "Has unspent points", "Allocation", "{my} has unspent allocation points", "Returns true if there are points available to be allocated.", "HasUnspentPoints");

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddCmpParam("Comparison", "How to compare the final stat value.");
AddNumberParam("Value", "The value to compare against.");
AddCondition(1, cf_none, "Final stat meets", "Stats", "{my} final stat <b>{0}</b> {1} <b>{2}</b>", "Compare the final calculated value of a stat.", "FinalStatMeets");

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddCondition(2, cf_none, "Has modifiers", "Modifiers", "{my} stat <b>{0}</b> has modifiers", "Returns true if the specified stat has any temporary modifiers.", "StatHasModifiers");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddNumberParam("Base value", "The new permanent base value for the stat.");
AddAction(0, af_none, "Set base stat", "Stats", "Set {my} base stat <b>{0}</b> to <b>{1}</b>", "Sets a permanent, unallocated starting value for a stat.", "SetBaseStat");

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddNumberParam("Amount", "The number of points to allocate to the stat's bonus pool.");
AddAction(1, af_none, "Allocate points", "Allocation", "Allocate <b>{1}</b> points to {my} stat <b>{0}</b>", "Moves points from the unspent pool into a specific stat's bonus pool.", "AllocatePoints");

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddNumberParam("Amount", "The temporary bonus or penalty to add. Can be negative.");
AddAction(2, af_none, "Add temporary modifier", "Modifiers", "Add temporary modifier of <b>{1}</b> to {my} stat <b>{0}</b>", "Adds a temporary bonus/penalty (e.g., from an item or spell).", "AddTemporaryModifier");

AddStringParam("Stat key", "The unique name of the statistic. Leave empty to clear modifiers from all stats.", "\"\"");
AddAction(3, af_none, "Clear modifiers", "Modifiers", "Clear temporary modifiers for {my} stat <b>{0}</b>", "Removes all temporary bonuses for a specific stat, or all stats if the key is empty.", "ClearModifiers");

AddNumberParam("Amount", "The total number of unspent points to set.");
AddAction(4, af_none, "Set unspent points", "Allocation", "Set {my} unspent allocation points to <b>{0}</b>", "Sets the total number of points available to be allocated.", "SetUnspentPoints");

AddStringParam("Stat key", "The unique name of the statistic (e.g., 'STR', 'INT').");
AddNumberParam("Bonus value", "The new bonus value for the stat from allocated points.");
AddAction(5, af_none, "Set bonus stat", "Stats", "Set {my} bonus stat <b>{0}</b> to <b>{1}</b>", "Sets the bonus value for a stat, which comes from allocated points.", "SetBonusStat");



////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddStringParam("StatKey", "The name of the stat to retrieve (e.g. \"STR\").");
AddExpression(0, ef_return_number, "FinalStat", "Stats", "FinalStat", "Returns the final calculated value of a stat (Base + Bonus + Modifiers).");

AddStringParam("StatKey", "The name of the stat to retrieve (e.g. \"STR\").");
AddExpression(1, ef_return_number, "BaseStat", "Stats", "BaseStat", "Returns the initial, raw stat value before any bonuses.");

AddStringParam("StatKey", "The name of the stat to retrieve (e.g. \"STR\").");
AddExpression(2, ef_return_number, "BonusStat", "Stats", "BonusStat", "Returns the total points allocated to this stat by the user.");

AddStringParam("StatKey", "The name of the stat to retrieve (e.g. \"STR\").");
AddExpression(3, ef_return_number, "ModifierTotal", "Stats", "ModifierTotal", "Returns the combined value of all active temporary buffs/debuffs for a stat.");

AddExpression(4, ef_return_number, "UnspentPoints", "Allocation", "UnspentPoints", "Returns the number of points available for the player to allocate.");

AddStringParam("StatKey", "The name of the stat to retrieve (e.g. \"STR\").");
AddExpression(5, ef_return_number, "Allocated", "Stats", "Allocated", "(Deprecated) Returns the total points allocated to this stat. Use BonusStat instead.");


////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_text, 		"Initial stats",	"STR:10,INT:10,MaxHP:100,Defense:5", "A comma-separated list of initial stats in 'Key:Value' format. E.g. 'STR:10,INT:8'."),
	new cr.Property(ept_integer, 	"Points to allocate",		0,		"The number of unspent allocation points the unit starts with.")
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
