function GetBehaviorSettings()
{
	return {
		"name":			"Multipath",
		"id":			"Multipath",
		"version":		"0.1",
		"description":	"Stores and navigates multiple reusable lists of X/Y coordinates (paths).",
		"author":		"Gemini Code Assist",
		"help url":		"",
		"category":		"Data & Utility",
		"flags":		0
	};
};

////////////////////////////////////////
// Actions
AddStringParam("Path", "The unique name of the path list to add the point to (e.g., 'PatrolA', 'Loop2').", "\"Default\"");
AddNumberParam("X Coordinate", "The X coordinate to push onto the list.", "0");
AddNumberParam("Y Coordinate", "The Y coordinate to push onto the list.", "0");
AddAction(0, af_none, "Push point (X, Y)", "Path Management", "Push point ({1}, {2}) to path '{0}'", "Adds a coordinate pair to the end of the specified path list.", "PushPoint");

AddStringParam("Path", "The name of the path whose index should be advanced.", "\"Default\"");
AddAction(1, af_none, "Advance index", "Index Control", "Advance index on path '{0}'", "Increments the index pointer to target the next point on the specified path.", "AdvanceIndex");

AddStringParam("Path", "The name of the path whose index should be reset.", "\"Default\"");
AddAction(2, af_none, "Reset index", "Index Control", "Reset index on path '{0}' to 0", "Resets the current target index of the specified path back to the first point (0).", "ResetIndex");

AddStringParam("Path", "The name of the path whose index should be backtracked.", "\"Default\"");
AddAction(3, af_none, "Backtrack index", "Index Control", "Backtrack index on path '{0}'", "Decrements the index pointer to target the previous point on the specified path.", "BacktrackIndex");

AddStringParam("Path", "The name of the path to clear.", "\"Default\"");
AddAction(4, af_none, "Clear path", "Path Management", "Clear path '{0}'", "Removes all points from the specified path.", "ClearPath");

AddStringParam("Path", "The name of the path whose index should be set.", "\"Default\"");
AddNumberParam("Index", "The 0-based index to set the current target to.", "0");
AddAction(5, af_none, "Set index", "Index Control", "Set index on path '{0}' to {1}", "Sets the current target index of the specified path to a specific point.", "SetIndex");

AddStringParam("Path", "The name of the path to insert the point into.", "\"Default\"");
AddNumberParam("X Coordinate", "The X coordinate to insert.", "0");
AddNumberParam("Y Coordinate", "The Y coordinate to insert.", "0");
AddNumberParam("Index", "The 0-based index to insert the point before.", "0");
AddAction(6, af_none, "Insert point at index", "Path Management", "Insert point ({1}, {2}) into path '{0}' at index {3}", "Inserts a coordinate pair into the specified path list at a specific index.", "InsertPoint");

AddStringParam("Path", "The name of the path collection to delete.", "\"Default\"");
AddAction(7, af_none, "Delete path", "Path Management", "Delete path collection '{0}'", "Removes the named path list entirely.", "DeletePath");

////////////////////////////////////////
// Expressions
AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddExpression(0, ef_return_number, "Points in path", "Path Status", "PointsInPath", "Returns the total number of points in the specified path list.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddNumberParam("Index", "The 0-based index of the point to get.", "0");
AddExpression(1, ef_return_number, "X coordinate at index", "Points", "PointX", "Returns the X coordinate of a point at a specific index on a path.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddNumberParam("Index", "The 0-based index of the point to get.", "0");
AddExpression(2, ef_return_number, "Y coordinate at index", "Points", "PointY", "Returns the Y coordinate of a point at a specific index on a path.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddExpression(3, ef_return_number, "Current X", "Current Point", "CurrentPointX", "Returns the X coordinate of the current point on a path.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddExpression(4, ef_return_number, "Current Y", "Current Point", "CurrentPointY", "Returns the Y coordinate of the current point on a path.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddExpression(5, ef_return_number, "Current index", "Index Control", "CurrentIndex", "Returns the 0-based index of the current point on a path.");

AddStringParam("Path", "The name of the path list to query.", "\"Default\"");
AddExpression(6, ef_return_number, "Last index", "Path Status", "LastIndex", "Returns the index of the last point on a path (PointsInPath - 1).");


////////////////////////////////////////
// Conditions
AddStringParam("Path", "The name of the path to check.", "\"Default\"");
AddCondition(0, cf_none, "Is at end of path", "Index Control", "Path '{0}' is at the end", "Test if the index for the specified path is at the last point.", "IsAtEnd");

AddStringParam("Path", "The name of the path to check.", "\"Default\"");
AddCondition(1, cf_none, "Is at start of path", "Index Control", "Path '{0}' is at the start", "Test if the index for the specified path is at the first point (0).", "IsAtStart");

AddStringParam("Path", "The name of the path to check.", "\"Default\"");
AddCondition(2, cf_none, "Is path empty", "Path Status", "Path '{0}' is empty", "Test if the specified path contains no points.", "IsPathEmpty");


////////////////////////////////////////
ACESDone();

var property_list = [
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
function GetBehaviorScript() { return "Multipath_behavior.js"; }