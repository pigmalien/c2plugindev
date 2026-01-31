﻿﻿﻿﻿﻿function GetBehaviorSettings()
{
	return {
		"name":			"Vector Launcher",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"VectorLauncher",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"A State-Driven Input-to-Impulse Controller for launching projectiles.",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"flags":		bf_onlyone						// uncomment lines to enable flags...
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
				
// example				
AddCondition(0, cf_none, "Is dragging", "State", "{my} is dragging", "True if the user is currently dragging the projectile.", "IsDragging");
AddCondition(1, cf_trigger, "On launch", "State", "{my} on launch", "Triggered when the projectile is released and launched.", "OnLaunch");
AddCondition(2, cf_none, "Is ready", "State", "{my} is ready", "True if a projectile is loaded and ready to fire.", "IsReady");
AddCondition(3, cf_none, "Is cooldown", "State", "{my} is in cooldown", "True if the launcher is in cooldown state.", "IsCooldown");
AddCondition(4, cf_trigger, "On cooldown end", "State", "{my} on cooldown end", "Triggered when the cooldown period finishes.", "OnCooldownEnd");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
AddObjectParam("Projectile", "The object to load into the launcher.");
AddAction(0, af_none, "Load projectile", "Launcher", "Load {0} into {my}", "Load a projectile sprite into the launcher.", "LoadProjectile");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(1, af_none, "Set enabled", "Launcher", "Set {my} {0}", "Enable or disable the behavior.", "SetEnabled");

AddNumberParam("X", "The X coordinate of the target destination.");
AddNumberParam("Y", "The Y coordinate of the target destination.");
AddAction(2, af_none, "Set target", "Launcher", "Set target to ({0}, {1})", "Set the fixed target (P2) for Spline mode.", "SetTarget");

AddComboParamOption("Gravity (Physics)");
AddComboParamOption("Spline (Bezier)");
AddComboParam("Mode", "Select the movement path type.");
AddAction(3, af_none, "Set path mode", "Launcher", "Set path mode to {0}", "Set the movement path type.", "SetPathMode");

AddNumberParam("Max Pull", "The maximum distance the projectile can be dragged.");
AddAction(4, af_none, "Set max pull", "Launcher", "Set max pull to {0}", "Set the maximum drag distance.", "SetMaxPull");

AddNumberParam("Max Force", "The maximum impulse force.");
AddAction(5, af_none, "Set max force", "Launcher", "Set max force to {0}", "Set the maximum impulse force.", "SetMaxForce");

AddNumberParam("Gravity", "The gravity value for prediction.");
AddAction(6, af_none, "Set gravity", "Launcher", "Set gravity to {0}", "Set the gravity used for trajectory prediction.", "SetGravity");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
AddExpression(0, ef_return_number, "LaunchAngle", "Launcher", "LaunchAngle", "The calculated launch angle in degrees.");
AddExpression(1, ef_return_number, "LaunchPower", "Launcher", "LaunchPower", "The calculated launch power (impulse magnitude).");

AddNumberParam("Time", "The time in seconds to predict ahead.");
AddExpression(2, ef_return_number, "TrajectoryX", "Launcher", "TrajectoryX", "The predicted X position of the projectile at a given time.");

AddNumberParam("Time", "The time in seconds to predict ahead.");
AddExpression(3, ef_return_number, "TrajectoryY", "Launcher", "TrajectoryY", "The predicted Y position of the projectile at a given time.");

AddExpression(4, ef_return_number, "TargetX", "Launcher", "TargetX", "The X coordinate of the current drag position.");
AddExpression(5, ef_return_number, "TargetY", "Launcher", "TargetY", "The Y coordinate of the current drag position.");
AddExpression(6, ef_return_number, "CalculatedTime", "Launcher", "CalculatedTime", "The calculated time to reach the target distance.");

AddExpression(7, ef_return_number, "ControlX", "Launcher", "ControlX", "The X coordinate of the control point (P1) in Spline mode.");
AddExpression(8, ef_return_number, "ControlY", "Launcher", "ControlY", "The Y coordinate of the control point (P1) in Spline mode.");

AddExpression(9, ef_return_number, "BounceCount", "Launcher", "BounceCount", "The number of bounce points calculated in Raycast mode.");
AddNumberParam("Index", "The index of the bounce point (0-based).");
AddExpression(10, ef_return_number, "BounceX", "Launcher", "BounceX", "The X coordinate of a bounce point.");
AddNumberParam("Index", "The index of the bounce point (0-based).");
AddExpression(11, ef_return_number, "BounceY", "Launcher", "BounceY", "The Y coordinate of a bounce point.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_float, 	"Max Pull",		100,	"The maximum distance the projectile can be dragged from the anchor (pixels)."),
	new cr.Property(ept_float, 	"Max Force",	20,		"The maximum impulse force applied when dragged to the full distance."),
	new cr.Property(ept_float, 	"Gravity",		10,		"The gravity value used for trajectory prediction (visual only)."),
	new cr.Property(ept_float, 	"Cooldown",		0.5,	"Time in seconds before the launcher can be used again."),
	new cr.Property(ept_combo, 	"Path Mode",	"Gravity (Physics)", "Select the movement path type.", "Gravity (Physics)|Spline (Bezier)|Raycast (Ricochet)"),
	new cr.Property(ept_combo, 	"Initial state",	"Enabled",	"Whether to initially enable the behavior.", "Disabled|Enabled"),
	new cr.Property(ept_float, 	"Drag Scale",	1.0,	"Scale multiplier for the drag input distance."),
	new cr.Property(ept_integer, "Max Bounces", 3,		"Maximum number of bounces for Raycast mode.")
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
