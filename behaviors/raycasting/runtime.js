﻿"use strict";
assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");
(function ()
{
    cr.behaviors.Raycasting = function(runtime) {
        this.runtime = runtime;
    };

    var behaviorProto = cr.behaviors.Raycasting.prototype;

    behaviorProto.Type = function(behavior, objtype) {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };

    var behtypeProto = behaviorProto.Type.prototype;

    behtypeProto.onCreate = function() {};

    behaviorProto.Instance = function(type, inst) {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;
        this.runtime = type.runtime;
    };

    var behinstProto = behaviorProto.Instance.prototype;

    behinstProto.onCreate = function() {

        // State for the last ray cast
        this.didHit = false;
        this.hitX = 0;
        this.hitY = 0;
        this.hitDist = 0;
        this.hitUID = -1;
    };

    behinstProto.saveToJSON = function() {
        return {
            "didHit": this.didHit,
            "hitX": this.hitX,
            "hitY": this.hitY,
            "hitDist": this.hitDist,
            "hitUID": this.hitUID
        };
    };

    behinstProto.loadFromJSON = function(o) {
        this.didHit = o["didHit"];
        this.hitX = o["hitX"];
        this.hitY = o["hitY"];
        this.hitDist = o["hitDist"];
        this.hitUID = o["hitUID"];
    };

    behinstProto.tick = function() {};

    function Cnds() {};
    Cnds.prototype.OnRayHit = function() { return true; };
    Cnds.prototype.DidHit = function() { return this.didHit; };
    behaviorProto.cnds = new Cnds();

    // Helper function for squared distance, as cr.distanceSqTo is not in the C2 SDK
    function distanceSqTo(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    // Helper function to find the intersection point of two line segments
    // Returns null if they don't intersect, or {x, y} if they do.
    function line_segment_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) {
            return null; // Lines are parallel or collinear
        }

        var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }

        return null;
    }

    // Helper function to check for the closest intersection between a ray and a bounding box
    function ray_box_intersection(ray_x1, ray_y1, ray_x2, ray_y2, bbox) {
        var sides = [
            [bbox.left, bbox.top, bbox.right, bbox.top],       // Top
            [bbox.right, bbox.top, bbox.right, bbox.bottom],  // Right
            [bbox.right, bbox.bottom, bbox.left, bbox.bottom], // Bottom
            [bbox.left, bbox.bottom, bbox.left, bbox.top]      // Left
        ];

        var closest_hit = null;
        var closest_dist_sq = Infinity;

        for (var i = 0; i < 4; i++) {
            var hit = line_segment_intersection(ray_x1, ray_y1, ray_x2, ray_y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
            if (hit) {
                var dist_sq = distanceSqTo(ray_x1, ray_y1, hit.x, hit.y);
                if (dist_sq < closest_dist_sq) {
                    closest_dist_sq = dist_sq;
                    closest_hit = hit;
                }
            }
        }
        return closest_hit;
    }

    function Acts() {};
    Acts.prototype.CastRay = function(angle, distance, obj) {
        if (!obj) return;

        var startX = this.inst.x;
        var startY = this.inst.y;
        var rad = cr.to_radians(angle);
        var endX = startX + Math.cos(rad) * distance;
        var endY = startY + Math.sin(rad) * distance;

        var candidates = obj.getCurrentSol().getObjects();
        var closestHit = null;
        var closestDistSq = Number.MAX_VALUE;

        // Reset state before casting
        this.didHit = false;
        this.hitUID = -1;

        for (var i = 0; i < candidates.length; i++) {
            var inst = candidates[i];
            if (inst === this.inst) continue; // Don't hit self

            inst.update_bbox();
            var result = ray_box_intersection(startX, startY, endX, endY, inst.bbox);

            if (result) {
                var distSq = distanceSqTo(startX, startY, result.x, result.y);
                if (distSq < closestDistSq) {
                    closestDistSq = distSq;
                    closestHit = {
                        x: result.x,
                        y: result.y,
                        inst: inst
                    };
                }
            }
        }

        if (closestHit) {
            this.didHit = true;
            this.hitX = closestHit.x;
            this.hitY = closestHit.y;
            this.hitDist = Math.sqrt(closestDistSq);
            this.hitUID = closestHit.inst.uid;

            // Pick the specific instance that was hit
            var sol = obj.getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;
            sol.instances[0] = closestHit.inst;

            this.runtime.trigger(cr.behaviors.Raycasting.prototype.cnds.OnRayHit, this.inst);
        }
    };
    behaviorProto.acts = new Acts();

    function Exps() {};
    Exps.prototype.RayHitX = function(ret) {
        ret.set_float(this.hitX);
    };
    Exps.prototype.RayHitY = function(ret) {
        ret.set_float(this.hitY);
    };
    Exps.prototype.RayHitDistance = function(ret) {
        ret.set_float(this.hitDist);
    };
    Exps.prototype.RayHitUID = function(ret) {
        ret.set_int(this.hitUID);
    };
    behaviorProto.exps = new Exps();

}());