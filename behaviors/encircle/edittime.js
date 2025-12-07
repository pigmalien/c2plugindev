function GetBehaviorSettings() {
	return {
		"name": "Encircle",
		"id": "Encircle",
		"version": "1.0",
		"description": "Orbit around another object.",
		"author": "Gemini Code Assist",
		"help url": "",
		"category": "Movements",
		"flags": 0
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

AddCondition(0, cf_none, "Is enabled", "General", "Is enabled", "Test if the behavior is currently enabled.", "IsEnabled");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddObjectParam("Target", "Select the object to orbit around.");
AddAction(0, af_none, "Set target", "General", "Set target to {0}", "Set the object to orbit around.", "SetTarget");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether to enable or disable the behavior.");
AddAction(1, af_none, "Set enabled", "General", "Set enabled to {0}", "Set whether the behavior is enabled.", "SetEnabled");

AddNumberParam("Speed", "The speed of rotation in degrees per second.");
AddAction(2, af_none, "Set speed", "General", "Set speed to {0}", "Set the rotation speed.", "SetSpeed");

AddNumberParam("Radius X", "The horizontal radius of the orbit.");
AddAction(3, af_none, "Set radius X", "General", "Set radius X to {0}", "Set the horizontal radius.", "SetRadiusX");

AddNumberParam("Radius Y", "The vertical radius of the orbit.");
AddAction(4, af_none, "Set radius Y", "General", "Set radius Y to {0}", "Set the vertical radius.", "SetRadiusY");

AddNumberParam("Angle", "The current angle in the orbit in degrees.");
AddAction(5, af_none, "Set angle", "General", "Set angle to {0}", "Set the current angle in the orbit.", "SetAngle");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(0, ef_return_number, "Speed", "General", "Speed", "The current rotation speed in degrees per second.");
AddExpression(1, ef_return_number, "RadiusX", "General", "RadiusX", "The current horizontal radius.");
AddExpression(2, ef_return_number, "RadiusY", "General", "RadiusY", "The current vertical radius.");
AddExpression(3, ef_return_number, "Angle", "General", "Angle", "The current angle in the orbit.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)

var property_list = [
	new cr.Property(ept_combo, "Initial state", "Enabled", "Whether to initially enable the behavior or not.", "Disabled|Enabled"),
	new cr.Property(ept_float, "Speed", 90, "Speed of rotation in degrees per second."),
	new cr.Property(ept_float, "Radius X", 100, "Horizontal radius of the orbit."),
	new cr.Property(ept_float, "Radius Y", 100, "Vertical radius of the orbit."),
	new cr.Property(ept_float, "Initial angle", 0, "Initial angle in degrees."),
	new cr.Property(ept_combo, "Set angle", "No", "Choose how to rotate the object.", "No|Face motion|Face target"),
	new cr.Property(ept_combo, "Z-ordering", "No", "Move object behind/in-front of target based on position.", "No|Yes")
];

// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType() {
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType() {
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function (instance) {
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type) {
	assert2(this instanceof arguments.callee, "Constructor called as a function");

	// Save the constructor parameters
	this.instance = instance;
	this.type = type;

	// Set the default property values from the property table
	this.properties = {};

	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function () {
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function (property_name) {
}
