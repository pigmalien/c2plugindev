function GetBehaviorSettings()
{
	return {
		"name":			"Spline Path Mover",
		"id":			"SplineMover",
		"version":		"1.0",
		"description":	"Moves an object smoothly along a Catmull-Rom spline path.",
		"author":		"Gemini Code Assist (Spline)",
		"help url":		"",
		"category":		"Movement",
		"flags":		0
	};
};

////////////////////////////////////////
// Actions

// ACT 0: Push Point to Stack (Add a waypoint)
AddNumberParam("X Coordinate", "The X coordinate to push onto the path stack.", "0");
AddNumberParam("Y Coordinate", "The Y coordinate to push onto the path stack.", "0");
AddAction(0, af_none, "Push point (X, Y)", "Path Management", "Push point ({0}, {1}) onto the path stack", "Adds a coordinate pair to define the spline curve.", "PushPoint");

// ACT 1: Clear Stack
AddAction(1, af_none, "Clear entire path stack", "Path Management", "Clear all points from the path", "Removes all stored coordinates.", "ClearStack");

// ACT 2: Start Spline Movement
AddNumberParam("Speed", "The speed of movement in pixels per second.", "100");
AddAction(2, af_none, "Start moving along spline", "Control", "Start movement at {0} pixels/second", "Begins the movement along the defined spline path.", "StartMovement");

// ACT 3: Stop Spline Movement
AddAction(3, af_none, "Stop movement", "Control", "Stop movement", "Immediately halts spline movement.", "StopMovement");

// ACT 4: Set Speed
AddNumberParam("Speed", "The speed of movement in pixels per second.", "100");
AddAction(4, af_none, "Set speed", "Control", "Set speed to {0} pixels/second", "Sets the speed for subsequent movements.", "SetSpeed");


////////////////////////////////////////
// Conditions

// CND 0: On Path Finished
AddCondition(0, cf_trigger, "On path finished", "Movement", "On path finished", "Triggers when the object reaches the final point on the spline.", "OnPathFinished");

// CND 1: Is Moving
AddCondition(1, cf_none, "Is moving", "Movement", "Is moving", "Tests if the object is currently traveling along the spline.", "IsMoving");

// CND 2: Has enough points (needs 4 for a cubic segment)
AddCondition(2, cf_none, "Has enough points", "Path Management", "Has enough points (>=4)", "Tests if there are enough points (at least 4) to define a cubic spline curve.", "HasEnoughPoints");


////////////////////////////////////////
// Expressions

// EXP 0: Current Path Time (0.0 to 1.0)
AddExpression(0, ef_return_number, "Current path time (T)", "Control", "CurrentTimeT", "Returns the normalized time (0.0 to 1.0) along the entire spline path.");

// EXP 1: Total Points in Path
AddExpression(1, ef_return_number, "Total points in path", "Path Management", "TotalPoints", "Returns the number of points currently in the stack.");


ACESDone();

var property_list = [
    new cr.Property(ept_float, "Speed", 100.0, "The default speed of movement in pixels per second."),
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
	// No IDE logic needed
}