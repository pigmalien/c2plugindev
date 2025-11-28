// Runtime
// Spline Path Mover Behavior
cr.behaviors.SplineMover = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var behaviorProto = cr.behaviors.SplineMover.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var typeProto = behaviorProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;
		this.runtime = type.runtime;
	};
	
	var behaviorInstProto = behaviorProto.Instance.prototype;

	behaviorInstProto.onCreate = function()
	{
		this.speed = this.properties[0]; // Movement speed in pixels/second
        this.pointStack = []; // Array of {x: number, y: number} points
        
        this.isMoving = false;
        this.timeElapsed = 0;

		// These will be calculated when movement starts
		this.pathLength = 0;
		this.totalDuration = 0;

		this.pathLength_bakeQuality = 100; // Number of segments to bake for length calculation
	};	
	
    // --- Core Spline Calculation ---
    
    // Catmull-Rom Spline Interpolation function
    // p0, p1, p2, p3 are points. t is the normalized time (0.0 to 1.0) within the segment.
    behaviorInstProto.catmullRom = function(p0, p1, p2, p3, t) {
        var t2 = t * t;
        var t3 = t * t * t;
        
        // Coefficients for Catmull-Rom
        var c0 = p1;
        var c1 = 0.5 * (p2 - p0);
        var c2 = 0.5 * (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3);
        var c3 = 0.5 * (-p0 + 3.0 * p1 - 3.0 * p2 + p3);
        
        // Final interpolated value
        return c0 + c1 * t + c2 * t2 + c3 * t3;
    };

    // Main position calculation based on overall normalized time (T_total)
    behaviorInstProto.getSplinePosition = function(T_total) {
        var len = this.pointStack.length;
        
        if (len < 2) {
            return {x: this.inst.x, y: this.inst.y};
        }
        
        if (len < 2) { // Should not happen if called from tick2, but good practice
            return {x: this.inst.x, y: this.inst.y};
        } else if (len < 3) { // Linear movement for 2 points
            var index = Math.floor(T_total * (len - 1));
            index = Math.max(0, Math.min(len - 2, index));
            var pStart = this.pointStack[index];
            var pEnd = this.pointStack[index + 1];
            
            // Time (t) within the segment
            var t_segment = (T_total * (len - 1)) - index;
            
            return {
                x: cr.lerp(pStart.x, pEnd.x, t_segment),
                y: cr.lerp(pStart.y, pEnd.y, t_segment)
            };
        }
        
        // --- Cubic Spline Logic (for len >= 4) ---
        
        // The number of curve segments is the number of points minus one.
        var numSegments = len - 1;
        
        // 1. Determine which segment we are currently on
        var segmentT = T_total * numSegments;
        var segmentIndex = Math.floor(segmentT);
        segmentIndex = Math.max(0, Math.min(numSegments - 1, segmentIndex)); 
        
        // 2. Determine the local time 't' (0.0 to 1.0) within that segment
        var t_local = segmentT - segmentIndex;
        
        // 3. Define the 4 points for Catmull-Rom. For endpoints, we "ghost" points
        // by duplicating the start/end points to ensure the curve starts and ends correctly.
        var p0Index = Math.max(0, segmentIndex - 1);
        var p1Index = segmentIndex;
        var p2Index = Math.min(len - 1, segmentIndex + 1);
        var p3Index = Math.min(len - 1, segmentIndex + 2);

        var p0 = this.pointStack[p0Index];
        var p1 = this.pointStack[p1Index];
        var p2 = this.pointStack[p2Index];
        var p3 = this.pointStack[p3Index];
        
        // Calculate the interpolated X and Y positions
        var x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, t_local);
        var y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, t_local);
        
        return {x: x, y: y};
    };

	// Approximates the total length of the spline by sampling points
	behaviorInstProto.calculatePathLength = function()
	{
		if (this.pointStack.length < 2)
			return 0;

		var totalDist = 0;
		var lastPos = this.getSplinePosition(0);
		var curPos;

		// Bake the path into segments to measure length
		var segments = this.pathLength_bakeQuality;
		for (var i = 1; i <= segments; i++)
		{
			curPos = this.getSplinePosition(i / segments);
			totalDist += cr.distanceTo(lastPos.x, lastPos.y, curPos.x, curPos.y);
			lastPos = curPos;
		}
		return totalDist;
	};

    // --- Time-based Movement ---

    // The tick function is called every frame. Even if empty, it must exist.
    behaviorInstProto.tick = function()
    {
        // All movement logic is in tick2 for this behavior.
    };

    behaviorInstProto.tick2 = function()
    {
        if (!this.isMoving || this.pointStack.length < 2 || this.totalDuration <= 0) {
            return;
        }

        var dt = this.runtime.getDt();

        this.timeElapsed += dt;
        
        // Total normalized time T (0.0 to 1.0)
        var T = this.timeElapsed / this.totalDuration;

        if (T >= 1.0) {
            // Path finished: Snap to final point and stop
            T = 1.0;
            this.isMoving = false;
            
            // Snap to the absolute last point defined in the stack
            var lastPoint = this.pointStack[this.pointStack.length - 1];
            this.inst.x = lastPoint.x;
            this.inst.y = lastPoint.y;
            
            this.runtime.trigger(cr.behaviors.SplineMover.prototype.cnds.OnPathFinished, this.inst);

        } else {
            // Calculate and set position based on T
            var newPos = this.getSplinePosition(T);
            this.inst.x = newPos.x;
            this.inst.y = newPos.y;
        }
        
        this.inst.set_bbox_changed();
    };

	
	// --- Actions ---
	
	function Acts() {};	
	// ACT 0: Push Point
	Acts.prototype.PushPoint = function (x, y)
	{
		this.pointStack.push({x: x, y: y});
        // If the path just reached the minimum for a spline segment (4 points), 
        // the movement needs to be able to start.
	};

	// ACT 1: Clear Stack
	Acts.prototype.ClearStack = function ()
	{
		this.pointStack = [];
        this.isMoving = false;
        this.timeElapsed = 0;
	};

    // ACT 2: Start Spline Movement
	Acts.prototype.StartMovement = function (speed)
	{
        if (this.pointStack.length < 2) {
            return; // Need at least 2 points for any movement
        }
        
		this.speed = speed;
		this.pathLength = this.calculatePathLength();
        this.totalDuration = (this.speed > 0) ? (this.pathLength / this.speed) : 0;
        this.timeElapsed = 0;
        this.isMoving = true;
        
        // Start movement from the calculated beginning of the spline, which might not be the first point
        // if there are enough points for a curve.
        var startPos = this.getSplinePosition(0);
        this.inst.x = startPos.x;
        this.inst.y = startPos.y;
	};
    
    // ACT 3: Stop Spline Movement
	Acts.prototype.StopMovement = function ()
	{
		this.isMoving = false;
	};

	// ACT 4: Set Speed
	Acts.prototype.SetSpeed = function (speed)
	{
		this.speed = Math.max(0, speed);
	};

	behaviorProto.acts = new Acts();

	// --- Conditions ---

	function Cnds() {};

	// CND 0: On Path Finished
	Cnds.prototype.OnPathFinished = function ()
	{
		return true;
	};

	// CND 1: Is Moving
	Cnds.prototype.IsMoving = function ()
	{
		return this.isMoving;
	};
    
    // CND 2: Has enough points (needs 4 for a cubic segment)
	Cnds.prototype.HasEnoughPoints = function ()
	{
		return this.pointStack.length >= 4;
	};

	behaviorProto.cnds = new Cnds();

	// --- Expressions ---

	function Exps() {};


    // EXP 0: Current Path Time (0.0 to 1.0)
    Exps.prototype.CurrentTimeT = function (ret)
    {
        var T = (this.totalDuration > 0) ? (this.timeElapsed / this.totalDuration) : 0;
        ret.set_float(Math.min(1.0, Math.max(0.0, T)));
    };

    // EXP 1: Total Points in Path
    Exps.prototype.TotalPoints = function (ret)
    {
        ret.set_int(this.pointStack.length);
    };

	behaviorProto.exps = new Exps();

}());