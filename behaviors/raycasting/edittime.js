function GetBehaviorSettings()
{
	return {
		"name":			"Raycasting",
		"id":			"Raycasting",
		"version":		"0.1",
		"description":	"A minimal test behavior to see if new plugins can load.",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"Test",
		"flags":		0
	};
};

////////////////////////////////////////
// Actions
AddAction(0, af_none, "Log message", "Test", "Log 'Raycasting loaded' to console", "A test action to verify the plugin loads.", "LogMessage");

////////////////////////////////////////
ACESDone();

var property_list = [
	new cr.Property(ept_text, "Test Property", "It works!", "A test property.")
];

function CreateIDEBehaviorType() { return new IDEBehaviorType(); }
function IDEBehaviorType() { assert2(this instanceof arguments.callee, "Constructor called as a function"); }
IDEBehaviorType.prototype.CreateInstance = function(instance, type) { return new IDEInstance(instance, type); }
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	this.instance = instance;
	this.type = type;
	this.properties = {};

	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// The runtime script file to include in the exported project
function GetBehaviorScript() { return "Raycasting_behavior.js"; }
