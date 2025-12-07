"use strict";
assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// The behavior constructor
cr.behaviors.Multipath = function (runtime) {
	this.runtime = runtime;
};

(function () {
	var behaviorProto = cr.behaviors.Multipath.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function () {
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function () {
		this.pathCollections = {};
		this.loopStack = [];
	};

	behinstProto.saveToJSON = function () {
		return { "paths": this.pathCollections };
	};

	behinstProto.loadFromJSON = function (o) {
		this.pathCollections = o["paths"] || {};
	};

	behinstProto.tick = function () {
	};

	//////////////////////////////////////
	// Actions
	function Acts() { };

	Acts.prototype.PushPoint = function (pathName, x, y) {
		if (!this.pathCollections.hasOwnProperty(pathName)) {
			this.pathCollections[pathName] = { list: [], currentIndex: 0 };
		}
		this.pathCollections[pathName].list.push({ x: x, y: y });
	};

	Acts.prototype.AdvanceIndex = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			if (pathData.list.length > 0)
				pathData.currentIndex = Math.min(pathData.list.length - 1, pathData.currentIndex + 1);
		}
	};

	Acts.prototype.ResetIndex = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			this.pathCollections[pathName].currentIndex = 0;
		}
	};

	Acts.prototype.BacktrackIndex = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			pathData.currentIndex = Math.max(0, pathData.currentIndex - 1);
		}
	};

	Acts.prototype.ClearPath = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			pathData.list.length = 0; // Clear the array
			pathData.currentIndex = 0; // Reset the index
		}
	};

	Acts.prototype.SetIndex = function (pathName, index) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			index = Math.floor(index);
			if (pathData.list.length > 0)
				pathData.currentIndex = Math.max(0, Math.min(index, pathData.list.length - 1));
			else
				pathData.currentIndex = 0;
		}
	};

	Acts.prototype.InsertPoint = function (pathName, x, y, index) {
		if (!this.pathCollections.hasOwnProperty(pathName)) {
			this.pathCollections[pathName] = { list: [], currentIndex: 0 };
		}

		var pathData = this.pathCollections[pathName];
		index = Math.floor(index);

		var clampedIndex = Math.max(0, Math.min(index, pathData.list.length));

		pathData.list.splice(clampedIndex, 0, { x: x, y: y });
	};

	Acts.prototype.DeletePath = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName))
			delete this.pathCollections[pathName];
	};

	Acts.prototype.DeletePoint = function (pathName, index) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			index = Math.floor(index);

			if (index >= 0 && index < pathData.list.length) {
				pathData.list.splice(index, 1);

				if (pathData.currentIndex > index) {
					pathData.currentIndex--;
				}
				else if (pathData.currentIndex >= pathData.list.length) {
					pathData.currentIndex = Math.max(0, pathData.list.length - 1);
				}
			}
		}
	};

	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Conditions
	function Cnds() { };

	Cnds.prototype.IsAtEnd = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			if (pathData.list.length === 0)
				return false; // An empty path is not at its end

			return pathData.currentIndex === (pathData.list.length - 1);
		}
		return false; // Path doesn't exist
	};

	Cnds.prototype.IsAtStart = function (pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			return this.pathCollections[pathName].currentIndex === 0;
		}
		return true; // A non-existent path could be considered at the start (index 0)
	};

	Cnds.prototype.IsPathEmpty = function (pathName) {
		return !this.pathCollections.hasOwnProperty(pathName) || this.pathCollections[pathName].list.length === 0;
	};

	Cnds.prototype.ForEachNode = function (pathName) {
		if (!this.pathCollections.hasOwnProperty(pathName))
			return false;

		var pathList = this.pathCollections[pathName].list;
		var current_event = this.runtime.getCurrentEventStack().current_event;

		// SOL handling
		var sol = this.type.objtype.getCurrentSol();
		var solModifierAfterCnds = !sol.select_all;

		// Push loop state
		var loopState = { pathName: pathName, index: 0, list: pathList };
		this.loopStack.push(loopState);

		// Loop through all points
		for (var i = 0; i < pathList.length; i++) {
			if (solModifierAfterCnds)
				this.runtime.pushCopySol(sol);

			loopState.index = i;
			current_event.retrigger();

			if (solModifierAfterCnds)
				this.runtime.popSol(sol);
		}

		// Pop loop state
		this.loopStack.pop();

		return false;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Expressions
	function Exps() { };

	Exps.prototype.PathNodeCount = function (ret, pathName) {
		if (this.pathCollections.hasOwnProperty(pathName))
			ret.set_int(this.pathCollections[pathName].list.length);
		else
			ret.set_int(0);
	};

	Exps.prototype.PathNodeXAt = function (ret, pathName, index) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var path = this.pathCollections[pathName].list;
			index = Math.floor(index);
			if (index >= 0 && index < path.length) {
				ret.set_float(path[index].x);
				return;
			}
		}
		ret.set_float(0); // Return 0 if path or index is invalid
	};

	Exps.prototype.PathNodeYAt = function (ret, pathName, index) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var path = this.pathCollections[pathName].list;
			index = Math.floor(index);
			if (index >= 0 && index < path.length) {
				ret.set_float(path[index].y);
				return;
			}
		}
		ret.set_float(0); // Return 0 if path or index is invalid
	};

	Exps.prototype.CurrentPointX = function (ret, pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			var path = pathData.list;
			var index = pathData.currentIndex;
			if (index >= 0 && index < path.length) {
				ret.set_float(path[index].x);
				return;
			}
		}
		ret.set_float(0); // Return 0 if path is invalid or empty
	};

	Exps.prototype.CurrentPointY = function (ret, pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var pathData = this.pathCollections[pathName];
			var path = pathData.list;
			var index = pathData.currentIndex;
			if (index >= 0 && index < path.length) {
				ret.set_float(path[index].y);
				return;
			}
		}
		ret.set_float(0); // Return 0 if path is invalid or empty
	};

	Exps.prototype.CurrentIndex = function (ret, pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			ret.set_int(this.pathCollections[pathName].currentIndex);
		}
		else
			ret.set_int(-1); // Return -1 if path does not exist
	};

	Exps.prototype.LastIndex = function (ret, pathName) {
		if (this.pathCollections.hasOwnProperty(pathName)) {
			var len = this.pathCollections[pathName].list.length;
			ret.set_int(len > 0 ? len - 1 : -1);
		}
		else
			ret.set_int(-1); // Return -1 if path does not exist
	};

	Exps.prototype.CurrentNodeIndex = function (ret) {
		if (this.loopStack.length > 0)
			ret.set_int(this.loopStack[this.loopStack.length - 1].index);
		else
			ret.set_int(-1);
	};

	behaviorProto.exps = new Exps();

}());