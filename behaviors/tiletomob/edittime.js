function GetBehaviorSettings()
{
	return {
		"name":			"Tile to Mob",
		"id":			"TileToMob",
		"version":		"1.0",
		"description":	"Manages child sprites from a Tilemap perspective.",
		"author":		"Gemini",
		"help url":		"",
		"category":		"Movements",
		"flags":		0
	};
};

// Actions
AddObjectParam("Object", "Select the mob sprite to add.");
AddNumberParam("Grid X", "Initial Grid X position.");
AddNumberParam("Grid Y", "Initial Grid Y position.");
AddAction(0, af_none, "Add Mob Instance", "Management", "Add {0} to manager at ({1}, {2})", "Register a sprite to be managed by this tilemap.", "AddInstance");

AddObjectParam("Object", "Select the mob sprite to remove.");
AddAction(1, af_none, "Remove Mob Instance", "Management", "Remove {0} from manager", "Unregister a sprite.", "RemoveInstance");

AddObjectParam("Target", "Select the target object to follow.");
AddAction(3, af_none, "Set Target", "AI", "Set target to {0}", "Set the object that mobs will follow.", "SetTarget");

AddNumberParam("UID", "UID of the sprite to add.");
AddNumberParam("Grid X", "Initial Grid X position.");
AddNumberParam("Grid Y", "Initial Grid Y position.");
AddAction(4, af_none, "Add Mob by UID", "Management", "Add Mob UID {0} to manager at ({1}, {2})", "Register a sprite by UID.", "AddInstanceByUID");

AddObjectParam("Object", "Select the mob sprite to add.");
AddAction(5, af_none, "Add Mob at Position", "Management", "Add {0} at current position", "Register a sprite at its current pixel location.", "AddInstanceAtPosition");

AddNumberParam("UID", "UID of the mob.");
AddComboParamOption("Active");
AddComboParamOption("Inactive");
AddComboParam("State", "State to set.");
AddAction(6, af_none, "Set Mob Active", "Management", "Set mob {0} to <b>{1}</b>", "Set whether a mob is processed.", "SetMobActive");

AddObjectParam("Object", "Select the mob sprite.");
AddComboParamOption("Active");
AddComboParamOption("Inactive");
AddComboParam("State", "State to set.");
AddAction(7, af_none, "Set Object Active", "Management", "Set {0} to <b>{1}</b>", "Set whether a specific sprite instance is processed.", "SetObjectActive");

AddComboParamOption("Follow Target");
AddComboParamOption("Wander");
AddComboParam("Mode", "The movement mode to set.");
AddAction(8, af_none, "Set Mode", "AI", "Set mode to <b>{0}</b>", "Set the movement behavior mode.", "SetMode");

var property_list = [
	new cr.Property(ept_combo, "Tile Collision", "Solid", "Choose whether tiles are treated as obstacles (Solid) or ignored (None).", "Solid|None"),
	new cr.Property(ept_combo, "Mode", "Follow Target", "The movement behavior of the mobs.", "Follow Target|Wander"),
	new cr.Property(ept_integer, "Wander Radius", 5, "When in Wander mode, the maximum distance in tiles a mob will move from its starting point."),
	new cr.Property(ept_float, "Min Wander Idle", 1.0, "When in Wander mode, the minimum time in seconds a mob will wait before moving."),
	new cr.Property(ept_float, "Max Wander Idle", 3.0, "When in Wander mode, the maximum time in seconds a mob will wait before moving."),
	new cr.Property(ept_float, "Speed", 2.0, "The movement speed in tiles per second.")
];

ACESDone();

function CreateIDEBehaviorType() { return new IDEBehaviorType(); }
function CreateIDEBehaviorInstance() { return new IDEBehaviorInstance(); }

function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEBehaviorInstance(instance, this);
}

function IDEBehaviorInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	this.instance = instance;
	this.type = type;
	
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

IDEBehaviorInstance.prototype.OnCreate = function() {}
IDEBehaviorInstance.prototype.OnPropertyChanged = function(property_name) {}