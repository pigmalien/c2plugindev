function GetPluginSettings()
{
	return {
		"name":			"Global Timer",			// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"SysTime",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"A global timer system for managing named timers.",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"General",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":		pf_singleglobal			// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
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
AddStringParam("Name", "The name of the timer.");
AddCondition(0, cf_trigger, "On timer start", "Timer", "On timer {0} start", "Triggered when a named timer starts.", "OnTimerStart");

AddStringParam("Name", "The name of the timer.");
AddCondition(1, cf_trigger, "On timer", "Timer", "On timer {0}", "Triggered when a named timer finishes.", "OnTimer");

AddStringParam("Name", "The name of the timer.");
AddCondition(2, cf_none, "Is timer running", "Timer", "Is timer {0} running", "True if the named timer is currently active.", "IsTimerRunning");

AddStringParam("Name", "The name of the chain.");
AddCondition(3, cf_trigger, "On chain step", "Chain Timer", "On chain {0} step", "Triggered when a chain moves to the next step.", "OnChainStep");

AddStringParam("Name", "The name of the chain.");
AddCondition(4, cf_trigger, "On chain finished", "Chain Timer", "On chain {0} finished", "Triggered when a chain finishes.", "OnChainFinished");

AddStringParam("Name", "The name of the chain.");
AddCondition(5, cf_none, "Is chain running", "Chain Timer", "Is chain {0} running", "True if the chain is currently active.", "IsChainRunning");

AddStringParam("Name", "The name of the chain.");
AddCmpParam("Comparison", "Comparison to the current index.");
AddNumberParam("Index", "The index to compare to.");
AddCondition(6, cf_none, "Compare chain index", "Chain Timer", "Chain {0} index {1} {2}", "Compare the current index of a chain.", "CompareChainIndex");

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
AddStringParam("Name", "The name of the timer.");
AddNumberParam("Duration", "The duration of the timer.");
AddNumberParam("Loop Count", "Number of times to repeat (1 for once).", "1");
AddAction(0, af_none, "Start Timer", "Timer", "Start timer {0} for {1} ({2} loops)", "Start a named timer.", "StartTimer");

AddStringParam("Name", "The name of the timer.");
AddNumberParam("Current Value", "The new current value for the timer.");
AddAction(1, af_none, "Sync To Value", "Timer", "Sync timer {0} to {1}", "Manually set the elapsed time of a named timer.", "SyncToValue");

AddStringParam("Name", "The name of the chain.");
AddAction(2, af_none, "Create Chain", "Chain Timer", "Create chain {0}", "Initialize a new chain.", "CreateChain");

AddStringParam("Name", "The name of the chain.");
AddNumberParam("Duration", "The duration of the link.");
AddAction(3, af_none, "Add Link", "Chain Timer", "Add link {1}s to chain {0}", "Add a duration link to a chain.", "AddChainLink");

AddStringParam("Name", "The name of the chain.");
AddAction(4, af_none, "Start Chain", "Chain Timer", "Start chain {0}", "Start a chain.", "StartChain");

AddStringParam("Name", "The name of the chain.");
AddAction(5, af_none, "Stop Chain", "Chain Timer", "Stop chain {0}", "Stop and reset a chain.", "StopChain");

AddStringParam("Name", "The name of the chain.");
AddComboParamOption("No Loop");
AddComboParamOption("Loop");
AddComboParam("Mode", "Set loop mode.");
AddAction(6, af_none, "Set Chain Loop", "Chain Timer", "Set chain {0} loop to {1}", "Set whether the chain loops.", "SetChainLoop");

AddStringParam("Name", "The name of the chain.");
AddNumberParam("Index", "The index to jump to.");
AddAction(7, af_none, "Set Chain Index", "Chain Timer", "Set chain {0} index to {1}", "Jump to a specific index in the chain.", "SetChainIndex");

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
AddStringParam("Name", "The name of the timer.");
AddExpression(0, ef_return_number, "TimeRemaining", "Timer", "TimeRemaining", "Get the time remaining for a named timer.");

AddStringParam("Name", "The name of the timer.");
AddExpression(1, ef_return_number, "TimeElapsed", "Timer", "TimeElapsed", "Get the time elapsed for a named timer.");

AddStringParam("Name", "The name of the timer.");
AddExpression(2, ef_return_number, "TimeElapsedNormalised", "Timer", "TimeElapsedNormalised", "Get the normalised progress (0 to 1) of a named timer.");

AddStringParam("Name", "The name of the chain.");
AddExpression(3, ef_return_number, "ChainProgress", "Chain Timer", "ChainProgress", "Get the progress (0-1) of the current link.");

AddStringParam("Name", "The name of the chain.");
AddExpression(4, ef_return_number, "TotalChainProgress", "Chain Timer", "TotalChainProgress", "Get the progress (0-1) of the entire chain.");

AddStringParam("Name", "The name of the chain.");
AddExpression(5, ef_return_number, "ChainIndex", "Chain Timer", "ChainIndex", "Get the current index of the chain.");

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
	new cr.Property(ept_combo, 	"Timescale Mode",		"Normal",		"Choose whether to use game time (Normal) or real time (dt-independent).", "Normal|dt-independent"),
	new cr.Property(ept_combo, 	"Precision",		"Seconds",		"Choose the unit of time.", "Seconds|Milliseconds")
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