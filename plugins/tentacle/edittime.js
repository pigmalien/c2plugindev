﻿function GetPluginSettings()
{
	return {
		"name":			"Tentacle",
		"id":			"Tentacle",
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"A physics-based tentacle or rope using Verlet integration and a textured quad-strip.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net",
		"category":		"Drawing",
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	true,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_texture | pf_predraw | pf_position_aces | pf_size_aces | pf_angle_aces | pf_appearance_aces | pf_zorder_aces | pf_effects
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
//				flags,				// (see docs)
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
AddObjectParam("Object", "Choose the object to check for collision with.");
AddCondition(0, cf_none, "Is segment overlapping", "Collisions", "Is segment overlapping {0}", "True if a tentacle segment is overlapping an object.", "IsSegmentOverlapping");

AddCondition(1, cf_none, "Is moving", "Movement", "Is moving", "True if the tentacle is currently in motion.", "IsMoving");

AddNumberParam("X", "The X coordinate to check against.");
AddNumberParam("Y", "The Y coordinate to check against.");
AddNumberParam("Distance", "The distance in pixels.");
AddCondition(2, cf_none, "Is within distance of tip", "Movement", "Is within {2} pixels of tip at ({0}, {1})", "True if the tip of the tentacle is within a certain distance of a point.", "IsWithinDistanceOfTip");

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs)
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

AddNumberParam("Width", "The width in pixels at the base of the tentacle.");
AddAction(0, af_none, "Set start width", "Appearance", "Set start width to {0}", "Set the width at the base of the tentacle.", "SetStartWidth");

AddNumberParam("Width", "The width in pixels at the tip of the tentacle.");
AddAction(1, af_none, "Set end width", "Appearance", "Set end width to {0}", "Set the width at the tip of the tentacle.", "SetEndWidth");

AddNumberParam("X", "The target X coordinate to pin the tip to.");
AddNumberParam("Y", "The target Y coordinate to pin the tip to.");
AddAction(2, af_none, "Set tip position", "Movement", "Set tip position to ({0}, {1})", "Instantly move the tip of the tentacle to a position.", "SetTipPosition");

AddNumberParam("Gravity", "The new gravity force. E.g. 150.");
AddAction(3, af_none, "Set gravity", "Physics", "Set gravity to {0}", "Set the gravity force applied to the segments.", "SetGravity");

AddComboParamOption("Stretch");
AddComboParamOption("Tile");
AddComboParam("UV Mode", "The texture mapping mode.");
AddAction(4, af_none, "Set tiling mode", "Appearance", "Set tiling mode to {0}", "Set the texture mapping mode.", "SetTilingMode");

AddNumberParam("Segment Index", "The 0-based index of the segment to apply the impulse to.");
AddNumberParam("Force", "The strength of the impulse.");
AddNumberParam("Angle", "The angle of the impulse in degrees.");
AddAction(5, af_none, "Apply impulse to segment", "Movement", "Apply impulse of force {1} at angle {2} to segment {0}", "Apply an impulse to a specific segment.", "ApplyImpulseToSegment");

AddObjectParam("Object", "The object to pin the tentacle base to.");
AddComboParamOption("No Z-ordering");
AddComboParamOption("Behind target");
AddComboParamOption("In front of target");
AddComboParam("Z-order", "Set the Z-order relative to the pinned object.", 1);
AddAnyTypeParam("Image Point", "The name or number of the image point to pin to (0 for origin).", "0");
AddAction(6, af_none, "Pin to object", "Movement", "Pin to {0} (Z-order: {1}, Image Point: {2})", "Pin the base of the tentacle to another object.", "PinToObject");

AddAction(7, af_none, "Unpin", "Movement", "Unpin from object", "Unpin the tentacle from any object it is pinned to.", "Unpin");

AddNumberParam("Amount", "The magnitude of the sine wave.");
AddAction(8, af_none, "Set sine wave amount", "Appearance", "Set sine wave amount to {0}", "Set the magnitude of the sine wave animation.", "SetSineWaveAmount");

AddNumberParam("Speed", "The speed of the sine wave.");
AddAction(9, af_none, "Set sine wave speed", "Appearance", "Set sine wave speed to {0}", "Set the speed of the sine wave animation.", "SetSineWaveSpeed");

AddNumberParam("Frequency", "The frequency of the sine wave.");
AddAction(10, af_none, "Set sine wave frequency", "Appearance", "Set sine wave frequency to {0}", "Set the frequency of the sine wave animation.", "SetSineWaveFrequency");

////////////////////////////////////////
// Expressions

AddNumberParam("Index", "The 0-based index of the segment.");
AddExpression(0, ef_return_number, "SegmentX", "Segments", "SegmentX", "Get the X coordinate of a segment.");
AddNumberParam("Index", "The 0-based index of the segment.");
AddExpression(1, ef_return_number, "SegmentY", "Segments", "SegmentY", "Get the Y coordinate of a segment.");
AddExpression(2, ef_return_number, "TotalLength", "Segments", "TotalLength", "Get the total length of the tentacle.");
AddExpression(3, ef_return_number, "SegmentCount", "Segments", "SegmentCount", "Get the number of segments.");

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
	new cr.Property(ept_integer,	"Segments",			20,		"The number of segments in the tentacle."),
	new cr.Property(ept_float,		"Segment Length",	10,		"The distance between each segment node."),
	new cr.Property(ept_float,		"Start Width",		20,		"The width of the tentacle at its base."),
	new cr.Property(ept_float,		"End Width",		5,		"The width of the tentacle at its tip."),
	new cr.Property(ept_float,		"Gravity",			150,	"Downward force applied to the segments."),
	new cr.Property(ept_float,		"Damping",			0.99,	"Damping factor (air resistance/friction). 1.0 = none, 0.9 = high."),
	new cr.Property(ept_integer,	"Constraint Iterations", 5,	"Number of physics iterations per tick. Higher is more rigid but less performant."),
	new cr.Property(ept_combo,		"UV Mode",			"Stretch", "Texture mapping mode.", "Stretch|Tile"),
	new cr.Property(ept_float,		"Sine Wave Amount",	0,		"Magnitude of the sine wave overlay for procedural animation."),
	new cr.Property(ept_float,		"Sine Wave Speed",	1,		"Speed of the sine wave animation."),
	new cr.Property(ept_float,		"Sine Wave Frequency", 0.5,	"Frequency of the sine wave (controls waviness).")
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