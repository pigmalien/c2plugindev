function GetBehaviorSettings() {
	return {
		"name": "Pro Weapon Controller",
		"id": "ProWeaponController",
		"version": "1.0",
		"description": "Highly optimized weapon targeting, scheduler, and predictive aiming controller.",
		"author": "Antigravity",
		"help url": "",
		"category": "General",
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

// OnFire
AddCondition(0, cf_trigger, "On fire", "Weapon Firing", "On {my} fire", "Triggered when the weapon fires a shot.", "OnFire");

// OnReloadStart
AddCondition(1, cf_trigger, "On reload start", "Weapon Firing", "On {my} reload start", "Triggered when the weapon starts reloading.", "OnReloadStart");

// OnReloadComplete
AddCondition(2, cf_trigger, "On reload complete", "Weapon Firing", "On {my} reload complete", "Triggered when the weapon finishes reloading.", "OnReloadComplete");

// HasTarget
AddCondition(3, cf_none, "Has target", "Targeting", "{my} has target", "True if the weapon has a valid active target.", "HasTarget");

// IsEnabled
AddCondition(4, cf_none, "Is enabled", "General", "{my} is enabled", "True if the weapon controller is enabled.", "IsEnabled");

// IsReloading
AddCondition(5, cf_none, "Is reloading", "Weapon Firing", "{my} is reloading", "True if the weapon is currently reloading.", "IsReloading");

////////////////////////////////////////
// Actions

// SetEnabled
AddComboParamOption("Disabled");
AddComboParamOption("Enabled");
AddComboParam("State", "Set the enabled state of this behavior.", 1);
AddAction(0, af_none, "Set enabled", "General", "Set {my} enabled to <b>{0}</b>", "Enable or disable the weapon controller.", "SetEnabled");

// AddTargetType
AddObjectParam("Target", "Select the object type or family to add as a target candidate.");
AddAction(1, af_none, "Add target object", "Targeting", "Add <b>{0}</b> to target list", "Add an object type or family to target.", "AddTargetType");

// ClearTargetTypes
AddAction(2, af_none, "Clear target list", "Targeting", "Clear targeting list", "Clear all targeted object types.", "ClearTargetTypes");

// ManualReload
AddAction(3, af_none, "Manual reload", "Weapon Firing", "Force reload", "Force the weapon to reload if ammo is not full and it is not already reloading.", "ManualReload");

// SetRange
AddNumberParam("Range", "The targeting range in pixels.", "300");
AddAction(4, af_none, "Set range", "Targeting", "Set range to <b>{0}</b>", "Set the targeting range of the weapon.", "SetRange");

// SetProjectileSpeed
AddNumberParam("Projectile Speed", "The projectile speed in pixels per second.", "500");
AddAction(5, af_none, "Set projectile speed", "Targeting", "Set projectile speed to <b>{0}</b>", "Set the projectile speed for predictive aiming.", "SetProjectileSpeed");

// ClearCurrentTarget
AddAction(6, af_none, "Clear current target", "Targeting", "Clear current target", "Force the weapon to drop its current target.", "ClearCurrentTarget");

////////////////////////////////////////
// Expressions

// PredictFiringAngle
AddExpression(0, ef_return_number, "Predict firing angle", "Predictive Aiming", "PredictFiringAngle", "Get the calculated angle in degrees to lead the target.");

// RawAngleToTarget
AddExpression(1, ef_return_number, "Raw angle to target", "Targeting", "RawAngleToTarget", "Get the direct angle in degrees to the target without leading.");

// CurrentAmmo
AddExpression(2, ef_return_number, "Current ammo", "Weapon Firing", "CurrentAmmo", "Get the current ammo count.");

// TargetUID
AddExpression(3, ef_return_number, "Target UID", "Targeting", "TargetUID", "Get the UID of the current target, or -1 if no target.");

// PredictX
AddExpression(4, ef_return_number, "Predicted interception X", "Predictive Aiming", "PredictX", "Get the predicted interception X coordinate.");

// PredictY
AddExpression(5, ef_return_number, "Predicted interception Y", "Predictive Aiming", "PredictY", "Get the predicted interception Y coordinate.");

// TargetX
AddExpression(6, ef_return_number, "Target X", "Targeting", "TargetX", "Get the target's current X coordinate.");

// TargetY
AddExpression(7, ef_return_number, "Target Y", "Targeting", "TargetY", "Get the target's current Y coordinate.");

// Range
AddExpression(8, ef_return_number, "Range", "Targeting", "Range", "Get the current targeting range.");

// ProjectileSpeed
AddExpression(9, ef_return_number, "Projectile speed", "Predictive Aiming", "ProjectileSpeed", "Get the current projectile speed.");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo, "Initial state", "Enabled", "Whether the behavior is initially enabled.", "Disabled|Enabled"),
	new cr.Property(ept_integer, "Max Ammo", 10, "Maximum ammo capacity. Set to 0 or negative for infinite ammo."),
	new cr.Property(ept_float, "Reload Duration", 2.0, "Time in seconds to reload when ammo is empty."),
	new cr.Property(ept_integer, "Burst Count", 1, "Number of shots in a single burst. Set to 1 for standard fire."),
	new cr.Property(ept_float, "Time Between Shots (Burst)", 0.1, "Time in seconds between shots within a burst."),
	new cr.Property(ept_float, "Time Between Bursts/Regular Fire", 0.5, "Time in seconds between bursts (or standard shots if burst count is 1)."),
	new cr.Property(ept_combo, "Target Sorting", "Nearest", "How to sort target candidates inside range.", "Nearest|First in Range"),
	new cr.Property(ept_float, "Range", 300, "Maximum targeting range in pixels."),
	new cr.Property(ept_float, "Projectile Speed", 500, "Speed of the bullet/projectile in pixels per second.")
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
