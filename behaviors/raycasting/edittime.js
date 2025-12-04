function GetBehaviorSettings()
{
	return {
		"name":			"Raycasting",			// as appears in 'add behavior' dialog, can be changed as long as "id" stays the same
		"id":			"Raycasting",
		"version":		"1.0",
		"description":	"Fires a ray from the object's origin and checks for collision with specific objects.",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"General",
		"flags":		0
	};
};

////////////////////////////////////////
// Actions
AddNumberParam("Angle", "The angle in degrees to cast the ray.", "0");
AddNumberParam("Distance", "The maximum distance in pixels for the ray.", "1000");
AddObjectParam("Objects", "The object type to check for collision.");
AddAction(0, af_none, "Cast ray", "Raycasting", "Cast ray at angle {0} for distance {1} against {2}", "Fires a ray and checks for the first collision with a target object.", "CastRay");

////////////////////////////////////////
// Conditions
AddCondition(0, cf_trigger, "On ray hit", "Raycasting", "On ray hit", "Triggered when a ray cast hits an object.", "OnRayHit");
AddCondition(1, cf_none, "Ray did hit", "Raycasting", "Ray did hit", "True if the last ray cast resulted in a hit.", "DidHit");

////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_number, "RayHitX", "Raycasting", "RayHitX", "The X coordinate of the ray's collision point.");
AddExpression(1, ef_return_number, "RayHitY", "Raycasting", "RayHitY", "The Y coordinate of the ray's collision point.");
AddExpression(2, ef_return_number, "RayHitDistance", "Raycasting", "RayHitDistance", "The distance from the origin to the ray's collision point.");
AddExpression(3, ef_return_number, "RayHitUID", "Raycasting", "RayHitUID", "The UID of the object instance the ray collided with.");

////////////////////////////////////////
ACESDone();

var property_list = [
	// No properties needed for this behavior
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
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// The runtime script file to include in the exported project
function GetBehaviorScript() { return "runtime.js"; }
