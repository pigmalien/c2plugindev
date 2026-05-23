function GetBehaviorSettings()
{
	return {
		"name":			"Pro Line of Sight",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"ProLineOfSight",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"Advanced line of sight behavior with performance optimizations and cone of vision.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net", // [Inference] Placeholder URL for help documentation.
		"category":		"Movements",				// Prefer to re-use existing categories, but you can set anything here
		"flags":		0						// uncomment lines to enable flags...
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
				
AddCondition(0, cf_trigger, "On line of sight", "Line of Sight", "On line of sight to target", "Triggered when line of sight is established to the tracked target.", "OnLineOfSight");
AddCondition(1, cf_none, "Has line of sight", "Line of Sight", "Has line of sight to target", "True if there is currently line of sight to the tracked target.", "HasLineOfSight");
AddCondition(2, cf_trigger, "On lost line of sight", "Line of Sight", "On lost line of sight to target", "Triggered when line of sight to the tracked target is lost.", "OnLostLineOfSight");


////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddObjectParam("Target", "The object to track for line of sight.");
AddAction(0, af_none, "Set target", "Target", "Set target to {0}", "Set the object to track for line of sight.", "SetTarget");

AddAction(1, af_none, "Clear target", "Target", "Clear target", "Stop tracking the current target.", "ClearTarget");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(2, af_none, "Set enabled", "State", "Set {my} {0}", "Enable or disable the Pro Line of Sight behavior.", "SetEnabled");

AddNumberParam("Angle", "The total angle of the cone of vision in degrees (0-360).");
AddAction(3, af_none, "Set cone angle", "Parameters", "Set cone angle to {0}", "Set the total angle of the cone of vision.", "SetConeAngle");

AddNumberParam("Range", "The maximum distance for line of sight in pixels.");
AddAction(4, af_none, "Set range", "Parameters", "Set range to {0}", "Set the maximum line of sight range.", "SetRange");

AddObjectParam("Obstacle", "The object type to consider as an obstacle.");
AddAction(5, af_none, "Add obstacle", "Obstacles", "Add obstacle {0}", "Add an object type that blocks line of sight.", "AddObstacle");

AddAction(6, af_none, "Clear obstacles", "Obstacles", "Remove all added obstacle types.", "ClearObstacles");

AddObjectParam("Solid", "The object type with the Solid behavior to consider as an obstacle.");
AddAction(7, af_none, "Add solid obstacle", "Obstacles", "Add solid obstacle {0}", "Add an object type with the Solid behavior that blocks line of sight.", "AddSolidObstacle");

AddAction(8, af_none, "Clear solid obstacles", "Obstacles", "Remove all added solid obstacle types.", "ClearSolidObstacles");

AddObjectParam("Target", "The object instance(s) to add to the tracking list.");
AddAction(9, af_none, "Add target", "Target", "Add {0} to targets", "Add instance(s) of an object type to the tracking list.", "AddTarget");

AddObjectParam("Target", "The object instance(s) to remove from the tracking list.");
AddAction(10, af_none, "Remove target", "Target", "Remove {0} from targets", "Remove instance(s) of an object type from the tracking list.", "RemoveTarget");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_number, "TargetX", "Target", "TargetX", "The X coordinate of the last tracked target.");
AddExpression(1, ef_return_number, "TargetY", "Target", "TargetY", "The Y coordinate of the last tracked target.");
AddExpression(2, ef_return_number, "DistanceToTarget", "Target", "DistanceToTarget", "The distance to the last tracked target.");
AddExpression(3, ef_return_number, "AngleToTarget", "Target", "AngleToTarget", "The angle to the last tracked target in degrees.");
AddExpression(4, ef_return_number, "TargetUID", "Target", "TargetUID", "The UID of the object currently being tracked.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_integer, 	"Check Interval",	1,		"How often to check line of sight (1 = every frame, 5 = every 5 frames)."),
	new cr.Property(ept_float, 		"Cone Angle",		360,	"The total angle of the cone of vision in degrees (0-360)."),
	new cr.Property(ept_float, 		"Range",			500,	"The maximum distance for line of sight in pixels."),
	new cr.Property(ept_combo, 		"Initially Enabled", "Enabled", "Whether the behavior is initially enabled.", "Enabled|Disabled")
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
