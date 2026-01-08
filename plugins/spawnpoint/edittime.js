function GetPluginSettings()
{
	return {
		"name":			"Spawn Point",
		"id":			"SpawnPoint",
		"version":		"1.1", // Incremented version
		"description":	"A global plugin to manage spawn points either randomly inside or outside an area.",
		"author":		"Gemini",
		"help url":		"",
		"category":		"General",
		"type":			"object",
		"flags":		pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions
AddCondition(0, cf_none, "Is spawning outside area", "Mode", "Is spawning outside area", "True if the spawn point is set to spawn randomly outside an area.", "IsSpawningOutside");
AddCondition(1, cf_none, "Is spawning inside area", "Mode", "Is spawning inside area", "True if the spawn point is set to spawn randomly inside an area.", "IsSpawningInside");
AddCondition(2, cf_trigger, "On point set", "Spawning", "On point set", "Triggered after the 'Set point' action.", "OnSetPoint");


////////////////////////////////////////
// Actions
AddComboParamOption("Spawn outside area");
AddComboParamOption("Spawn inside area");
AddComboParam("Mode", "Set the spawn point mode.");
AddAction(0, af_none, "Set mode", "Mode", "Set mode to {0}", "Set the spawn point mode.", "SetMode");

AddNumberParam("X", "The X coordinate of the area's top-left corner.");
AddNumberParam("Y", "The Y coordinate of the area's top-left corner.");
AddNumberParam("Width", "The width of the area.");
AddNumberParam("Height", "The height of the area.");
AddAction(1, af_none, "Set area", "Area", "Set area to ({0}, {1}, {2}, {3})", "Set the area for random spawning.", "SetArea");

AddNumberParam("Padding", "The padding for the 'spawn outside' mode.");
AddAction(2, af_none, "Set padding", "Area", "Set padding to {0}", "Set the padding for the 'spawn outside' mode.", "SetPadding");

AddAction(3, af_none, "Set point", "Spawning", "Set point", "Generate a point and trigger 'On point set'.", "SetPoint");

AddStringParam("Seed", "The seed for the random number generator. Leave empty for a random seed.");
AddAction(4, af_none, "Set seed", "Area", "Set seed to {0}", "Set the seed for the random number generator.", "SetSeed");

////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "PointX", "Point", "PointX", "The X coordinate of the last generated point.");
AddExpression(1, ef_return_number, "PointY", "Point", "PointY", "The Y coordinate of the last generated point.");
////////////////////////////////////////
ACESDone();

var property_list = [
    new cr.Property(ept_text, "Seed", "", "The seed for the random number generator. Leave empty for a random seed.")
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
	
	this.instance = instance;
	this.type = type;
	
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

IDEInstance.prototype.OnDoubleClicked = function()
{
}

IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}