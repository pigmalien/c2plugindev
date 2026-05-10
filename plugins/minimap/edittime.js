﻿function GetPluginSettings()
{
	return {
		"name":			"MiniMap Pro",			
		"id":			"MiniMapPro",			
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"High-performance WebGL Mini-map with FBO batching.",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"User interface",		
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					
		"flags":		pf_position_aces | pf_size_aces | pf_appearance_aces | pf_predraw | pf_zorder_aces
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

AddObjectParam("Object", "The object instance to check.");
AddCondition(0, cf_trigger, "On Object Entered Map", "Events", "On {0} entered map", "Triggered when a tracked object first appears within the map bounds.", "OnObjectEntered");

AddObjectParam("Object", "The object instance to check.");
AddCondition(1, cf_trigger, "On Object Reached", "Events", "On {0} reached", "Triggered when an object reaches a destination or target on the map.", "OnObjectReached");

////////////////////////////////////////
// Actions
AddObjectParam("Object", "The object type or Family to track.");
AddNumberParam("Size", "Size of blips in map pixels.", "4");
AddNumberParam("R", "Color Red (0-255)", "255");
AddNumberParam("G", "Color Green (0-255)", "255");
AddNumberParam("B", "Color Blue (0-255)", "255");
AddAction(0, af_none, "Add Tracking", "Setup", "Track <b>{0}</b> (Size: {1}, Color: {2},{3},{4})", "Add an object type or family to the tracker.", "AddTracking");

AddNumberParam("UID", "The UID of the specific instance to modify.");
AddNumberParam("R", "New Red.");
AddNumberParam("G", "New Green.");
AddNumberParam("B", "New Blue.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Blinking", "Should the icon blink?");
AddAction(1, af_none, "Update Icon", "Icons", "Set icon UID {0} (Color: {1},{2},{3}, Blink: {4})", "Change attributes of a specific icon by UID.", "UpdateIcon");

AddNumberParam("UID", "The UID of the specific instance to remove.");
AddAction(2, af_none, "Remove Icon", "Icons", "Remove icon UID {0} from map", "Stop tracking a specific UID manually.", "RemoveIcon");

AddComboParamOption("System Scroll");
AddComboParamOption("Object");
AddComboParam("Mode", "What to scroll to.");
AddObjectParam("Object", "Object to follow (if mode is Object).");
AddAction(3, af_none, "Scroll Map", "View", "Scroll map to {0} {1}", "Change the center point of the mini-map view.", "ScrollTo");

AddComboParamOption("Rectangle");
AddComboParamOption("Circle");
AddComboParam("Shape", "Set the display shape.");
AddAction(4, af_none, "Set Display Shape", "Settings", "Set display shape to {0}", "Change the clipping shape of the mini-map.", "SetDisplayShape");

////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "MapScale", "Settings", "MapScale", "Current ratio of world to map.");

////////////////////////////////////////
ACESDone();

var property_list = [
	new cr.Property(ept_float, 	"Map Scale",		0.1,	"Ratio of world pixels to map pixels."),
	new cr.Property(ept_combo, 	"Display Shape",	"Rectangle", "The shape of the mini-map clipping boundary.", "Rectangle|Circle")
];

function CreateIDEObjectType() { return new IDEObjectType(); }
function IDEObjectType() { assert2(this instanceof arguments.callee, "Constructor called as a function"); }
IDEObjectType.prototype.CreateInstance = function(instance) { return new IDEInstance(instance); }
function IDEInstance(instance, type) {
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	this.instance = instance;
	this.type = type;
	this.properties = {};
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}
IDEInstance.prototype.OnInserted = function() {}
IDEInstance.prototype.OnDoubleClicked = function() {}
IDEInstance.prototype.OnPropertyChanged = function(property_name) {}
IDEInstance.prototype.OnRendererInit = function(renderer) {}
IDEInstance.prototype.Draw = function(renderer)
{
	var q = this.instance.GetBoundingQuad();
	// [Inference] Use a neutral gray in the editor so the object remains visible to the developer.
	renderer.Fill(q, cr.RGB(50, 50, 50));
}
IDEInstance.prototype.OnRendererReleased = function(renderer) {}