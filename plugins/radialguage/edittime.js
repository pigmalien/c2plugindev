function GetPluginSettings()
{
	return {
		"name":			"Radial Gauge",			// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"RadialGauge",			// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"A customizable radial gauge.",
		"author":		"Author",
		"help url":		"<your website or a manual entry on Scirra.com>",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
					//	| pf_position_aces		// compare/set/get x, y...
					//	| pf_size_aces			// compare/set/get width, height...
					//	| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
					//	| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
					//	| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
					//	| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
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
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				
AddCondition(0, cf_none, "Is animating", "General", "Is animating", "True if the gauge is currently changing its value.", "IsAnimating");
AddCmpParam("Comparison", "Choose the way to compare the current value.");
AddNumberParam("Value", "The value to compare the current value to.");
AddCondition(1, cf_none, "Compare value", "General", "Value {0} {1}", "Compare the current displayed value.", "CompareValue");

AddCmpParam("Comparison", "Comparison.");
AddNumberParam("Percentage", "The percentage to compare (0-1).");
AddCondition(2, cf_none, "Compare Percentage", "Logic", "Percentage {0} {1}", "Compare the current percentage (0-1).", "IsPercentage");

AddCondition(3, cf_trigger, "On Value Reached", "Logic", "On value reached", "Triggered when the animation finishes.", "OnValueReached");

AddNumberParam("Low", "Low value.");
AddNumberParam("High", "High value.");
AddCondition(4, cf_none, "Is In Range", "Logic", "Is in range {0} to {1}", "Check if value is within range.", "IsInRange");

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
AddNumberParam("Value", "The target value to animate towards.");
AddAction(0, af_none, "Set Value", "General", "Set value to {0}", "Set the gauge target value.", "SetValue");

AddNumberParam("Max Value", "The new maximum value.");
AddAction(1, af_none, "Set Max Value", "General", "Set max value to {0}", "Set the maximum value of the gauge.", "SetMaxValue");

AddNumberParam("Speed", "The new lerp speed (0-1).");
AddAction(2, af_none, "Set Lerp Speed", "General", "Set lerp speed to {0}", "Set the interpolation speed.", "SetLerpSpeed");

AddNumberParam("Start Angle", "Start angle in degrees.");
AddNumberParam("Span Angle", "Span angle in degrees.");
AddAction(3, af_none, "Set Range", "Appearance", "Set range to {0}, span {1}", "Set the start and span angles.", "SetRange");

AddNumberParam("Thickness", "Line thickness.");
AddNumberParam("Lerp Speed", "Animation speed (0-1).");
AddAction(4, af_none, "Set Appearance", "Appearance", "Set thickness to {0}, speed {1}", "Set the gauge appearance.", "SetAppearance");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Mode", "Enable or disable segments.");
AddNumberParam("Count", "Number of segments.");
AddAction(5, af_none, "Set Segments", "Appearance", "Set segments {0} (count: {1})", "Configure gauge segments.", "SetSegments");

AddComboParamOption("Automatic");
AddComboParamOption("Fixed");
AddComboParam("Mode", "Color mode.");
AddAction(6, af_none, "Set Color Mode", "Appearance", "Set color mode to {0}", "Set the color mode.", "SetColorMode");

AddNumberParam("R", "Red (0-255).");
AddNumberParam("G", "Green (0-255).");
AddNumberParam("B", "Blue (0-255).");
AddAction(7, af_none, "Set Color", "Appearance", "Set color to ({0}, {1}, {2})", "Set the fixed color.", "SetColor");

AddNumberParam("Value", "The value to snap to.");
AddAction(8, af_none, "Snap Value", "General", "Snap value to {0}", "Set the value instantly without animation.", "SnapValue");

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
AddExpression(0, ef_return_number, "Value", "General", "Value", "Return the current displayed value.");
AddExpression(1, ef_return_number, "Target Value", "General", "TargetValue", "Return the target value.");
AddExpression(2, ef_return_number, "Max Value", "General", "MaxValue", "Return the maximum value.");
AddExpression(3, ef_return_number, "Percentage", "General", "Percentage", "Return the current percentage (0-100).");
AddNumberParam("Value", "Value to calculate angle for.");
AddExpression(4, ef_return_number, "Angle At Value", "General", "AngleAtValue", "Return the angle for a specific value.");
AddExpression(5, ef_return_number, "Thickness", "General", "Thickness", "Return the current thickness.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_float, 	"Start Angle",		-180,	"The starting angle of the gauge in degrees."),
	new cr.Property(ept_float, 	"Span Angle",		180,	"The total span of the gauge in degrees."),
	new cr.Property(ept_float, 	"Thickness",		20,		"The thickness of the gauge bar."),
	new cr.Property(ept_combo, 	"Animation Mode",	"Smooth", "Choose animation mode.", "Linear|Smooth"),
	new cr.Property(ept_float, 	"Lerp Speed",		0.1,	"Linear: Units/sec. Smooth: Tightness (0-1)."),
	new cr.Property(ept_combo, 	"Use Segments",		"No",	"Toggle whether to use segments.", "No|Yes"),
	new cr.Property(ept_float, 	"Max Value",		100,	"The maximum value for the gauge (for color calculation).")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
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
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}