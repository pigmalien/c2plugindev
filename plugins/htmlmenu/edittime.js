﻿﻿﻿function GetPluginSettings()
{
	return {
		"name":			"HTML Menu",			// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"HTMLMenu",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Displays an interactive HTML/CSS element over the game canvas.",
		"author":		"Gemini Code Assist",
		"help url":		"https://www.construct.net",
		"category":		"User interface",		// Prefer to re-use existing categories, but you can set anything here
		"type":			"world",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_position_aces		// compare/set/get x, y...
					| pf_size_aces			// compare/set/get width, height...
					| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
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

AddCondition(0, cf_trigger, "On button clicked", "Menu", "On button clicked", "Triggered when a menu element with 'data-c2-id' is clicked.", "OnButtonClicked");

AddCondition(1, cf_trigger, "On sound triggered", "Sound", "On sound triggered", "Triggered when an HTML element with a 'data-sfx' attribute is interacted with.", "OnSoundTriggered");

AddCondition(2, cf_trigger, "On focus gained", "Focus", "On focus gained", "Triggered when a menu element gains focus.", "OnFocusGained");

AddCondition(3, cf_trigger, "On focus lost", "Focus", "On focus lost", "Triggered when a menu element loses focus.", "OnFocusLost");

////////////////////////////////////////
// Actions

AddStringParam("Element ID", "The ID of the element to update.");
AddAnyTypeParam("Content", "The new content for the element.");
AddAction(1, af_none, "Update element content", "Content", "Set content of element with ID <b>{0}</b> to <i>{1}</i>", "Update the innerHTML of a specific element by its ID.", "UpdateContent");

AddAction(2, af_none, "Force sync now", "Sync", "Force universal sync", "Manually trigger the universal sync to update all linked HTML elements.", "ForceSyncNow");

AddStringParam("Dictionary JSON", "The JSON data from a Dictionary object (e.g., Dictionary.AsJSON).");
AddAction(3, af_none, "Sync from Dictionary", "Sync", "Sync from Dictionary JSON <i>{0}</i>", "Load data from a Dictionary's JSON to be used by the universal sync.", "SyncFromDictionary");

AddStringParam("Element ID", "The ID of the element to focus.");
AddAction(4, af_none, "Focus element by ID", "Focus", "Set focus to element with ID <b>{0}</b>", "Manually set focus to a specific HTML element.", "FocusElementByID");

AddComboParamOption("Full Block");
AddComboParamOption("Buttons Only");
AddComboParamOption("None");
AddComboParam("Mode", "Choose how the menu interacts with mouse/touch input.", 1);
AddAction(5, af_none, "Set interaction mode", "Interaction", "Set interaction mode to <b>{0}</b>", "Control how the menu blocks input to the game canvas.", "SetInteractionMode");

AddAction(6, af_none, "Focus next element", "Focus", "Focus next element", "Move focus to the next focusable element in the menu.", "FocusNext");

AddAction(7, af_none, "Focus previous element", "Focus", "Focus previous element", "Move focus to the previous focusable element in the menu.", "FocusPrevious");

AddAction(8, af_none, "Release focus", "Focus", "Release focus", "Manually blur the currently focused HTML element.", "ReleaseFocus");

////////////////////////////////////////
// Expressions

AddExpression(0, ef_return_string, "ClickedID", "Menu", "ClickedID", "Get the 'data-c2-id' value from the last clicked button.");

AddExpression(1, ef_return_string, "LastSFX", "Sound", "LastSFX", "Get the name of the sound effect triggered from the HTML.");

AddExpression(2, ef_return_string, "FocusedID", "Focus", "FocusedID", "Get the ID of the element that last gained focus.");

AddExpression(3, ef_return_number, "IsInputActive", "Focus", "IsInputActive", "Returns 1 if an input element is currently active, 0 otherwise.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin

var property_list = [
	new cr.Property(ept_text,		"HTML file",		"menu.html",	"Filename of the HTML content to load (must be in project files)."),
	new cr.Property(ept_text,		"CSS file",			"style.css",	"Filename of the CSS stylesheet to load (must be in project files)."),
	new cr.Property(ept_combo,		"Initially visible", "Yes",			"Whether the menu is visible at the start of the layout.", "No|Yes"),
	new cr.Property(ept_combo,		"Auto-Sync", 		"Yes",			"Automatically sync data from C2 variables to HTML elements each tick.", "No|Yes"),
	new cr.Property(ept_combo,		"Two-Way Binding",	"No",			"Enable syncing changes from HTML input elements back to C2 global variables.", "No|Yes")
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