function GetBehaviorSettings()
{
	return {
		"name":			"MyCam",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"MyCam",			// this is used to identify this behavior and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Behavior version - C2 shows compatibility warnings based on this
		"description":	"A cinematic camera with deadzone, look-ahead, grid-snapping, and advanced features.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net",
		"category":		"General",
		"flags":		bf_onlyone
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
AddCondition(0, cf_none, "Is moving", "Camera", "{my} is moving", "True if the camera is currently moving towards a target.", "IsMoving");
AddCondition(1, cf_none, "Is shaking", "Shake", "{my} is shaking", "True if a screen shake is in progress.", "IsShaking");
AddCondition(2, cf_none, "Is panning", "Pan", "{my} is panning", "True if a cinematic pan is in progress.", "IsPanning");
AddCondition(3, cf_trigger, "On shake finished", "Shake", "On {my} shake finished", "Triggered when a screen shake completes.", "OnShakeFinished");
AddCondition(4, cf_trigger, "On pan finished", "Pan", "On {my} pan finished", "Triggered when a cinematic pan completes.", "OnPanFinished");
AddCondition(5, cf_trigger, "On snap finished", "Grid Snapping", "On {my} room snap finished", "Triggered when a room snap transition completes.", "OnSnapFinished");

////////////////////////////////////////
// Actions
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set whether the behavior is enabled or disabled.");
AddAction(0, af_none, "Set enabled", "General", "Set {my} enabled to <b>{0}</b>", "Enable or disable the camera behavior.", "SetEnabled");

AddObjectParam("Object", "The secondary target object.");
AddAction(1, af_none, "Set secondary target", "Targeting", "Set {my} secondary target to {0}", "Set a second object for the camera to average its position with.", "SetSecondaryTarget");

AddAction(2, af_none, "Clear secondary target", "Targeting", "Clear {my} secondary target", "Stop averaging with a secondary target.", "ClearSecondaryTarget");

AddNumberParam("X", "The X coordinate to pan to.");
AddNumberParam("Y", "The Y coordinate to pan to.");
AddNumberParam("Duration", "The time in seconds for the pan to complete.", "1.0");
AddAction(3, af_none, "Pan to position", "Pan", "Pan {my} to (<i>{0}</i>, <i>{1}</i>) over <i>{2}</i> seconds", "Smoothly pan the camera to a specific layout position.", "PanToPosition");

AddNumberParam("Intensity", "The maximum pixel offset of the shake.", "10");
AddNumberParam("Duration", "The time in seconds for the shake to last.", "0.5");
AddNumberParam("Decay", "The rate at which the shake fades, from 0 (no decay) to 1 (instant).", "0.9");
AddAction(4, af_none, "Shake", "Shake", "Shake {my} with intensity <b>{0}</b> for <b>{1}</b>s (decay: {2})", "Trigger a kinetic screen shake.", "TriggerShake");

AddNumberParam("Min X", "The minimum X coordinate to clamp to.");
AddNumberParam("Min Y", "The minimum Y coordinate to clamp to.");
AddNumberParam("Max X", "The maximum X coordinate to clamp to.");
AddNumberParam("Max Y", "The maximum Y coordinate to clamp to.");
AddAction(5, af_none, "Set custom clamping", "Clamping", "Set {my} custom clamp to (<i>{0}</i>, <i>{1}</i>) to (<i>{2}</i>, <i>{3}</i>)", "Define a custom bounding box to clamp the camera to.", "SetCustomClamping");

AddAction(6, af_none, "Set clamp to layout", "Clamping", "Set {my} clamp to layout", "Clamp the camera to the layout boundaries.", "SetClampToLayout");

AddNumberParam("Smoothness", "The damping factor (0 to 1).", "0.1");
AddAction(7, af_none, "Set smoothness", "Tuning", "Set {my} smoothness to <i>{0}</i>", "Set the camera's damping factor.", "SetSmoothness");

AddNumberParam("Width", "The width of the deadzone in pixels.", "128");
AddNumberParam("Height", "The height of the deadzone in pixels.", "128");
AddAction(8, af_none, "Set deadzone", "Tuning", "Set {my} deadzone to <i>{0}</i>x<i>{1}</i>", "Set the camera's deadzone dimensions.", "SetDeadzone");

AddNumberParam("Distance", "How far the camera leads the target.", "200");
AddAction(9, af_none, "Set look-ahead", "Tuning", "Set {my} look-ahead distance to <i>{0}</i>", "Set how far the camera leads the target.", "SetLookAhead");

AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("Grid Snapping", "Enable or disable Zelda-style room snapping.");
AddAction(10, af_none, "Set grid snapping", "Grid Snapping", "Set {my} grid snapping to <b>{0}</b>", "Enable or disable Zelda-style room snapping.", "SetGridSnapping");

////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "CameraX", "Position", "CameraX", "The camera's current target X coordinate.");
AddExpression(1, ef_return_number, "CameraY", "Position", "CameraY", "The camera's current target Y coordinate.");
AddExpression(2, ef_return_number, "ShakeIntensity", "Shake", "ShakeIntensity", "The current magnitude of the screen shake.");
AddExpression(3, ef_return_number, "CurrentScale", "Zoom", "CurrentScale", "The current scale of the layer.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo,		"Enabled",			"Yes",		"Whether the behavior is active.", "No|Yes"),
	new cr.Property(ept_float,		"Smoothness",		0.05,		"0 (instant) to 1 (very slow). Damping factor for camera movement."),
	new cr.Property(ept_float,		"Deadzone Width",	128,		"Width of the 'no-move' area in the center of the screen, in pixels."),
	new cr.Property(ept_float,		"Deadzone Height",	128,		"Height of the 'no-move' area in the center of the screen, in pixels."),
	new cr.Property(ept_float,		"Look-Ahead",		200,		"How far to offset the camera in the direction of target movement, in pixels."),
	new cr.Property(ept_combo,		"Grid Snapping",	"Disabled",	"Enable to snap the camera between grid-based rooms.", "Disabled|Enabled"),
	new cr.Property(ept_integer,	"Room Width",		1920,		"Width of a single room for grid snapping."),
	new cr.Property(ept_integer,	"Room Height",		1080,		"Height of a single room for grid snapping."),
	new cr.Property(ept_float,		"Snap Duration",	0.4,		"Time in seconds for the room snap transition."),
	new cr.Property(ept_combo,		"Clamp to Layout",	"Yes",		"Prevent the camera from showing anything outside the layout boundaries.", "No|Yes"),
	new cr.Property(ept_combo,		"Auto Zoom",		"Disabled",	"Enable to automatically zoom the camera based on target speed.", "Disabled|Enabled"),
	new cr.Property(ept_float,		"Min Scale",		0.8,		"The minimum layer scale when zooming out at high speed."),
	new cr.Property(ept_float,		"Max Scale",		1.2,		"The maximum layer scale when zooming in at low speed."),
	new cr.Property(ept_float,		"Max Speed for Zoom", 500,		"The target's speed (in pixels/sec) at which the camera is fully zoomed out."),
	new cr.Property(ept_float,		"Zoom Speed",		0.5,		"How quickly the zoom level adapts to speed changes.")
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
