"use strict";
var $Q;
(function ($Q) {
    var Point = /** @class */ (function () {
        function Point(x, y, id) {
            this.IntX = 0;
            this.IntY = 0;
            this.X = x;
            this.Y = y;
            this.ID = id;
        }
        return Point;
    }());
    $Q.Point = Point;
})($Q || ($Q = {}));
///<reference path="./Point.ts" />
var $Q;
///<reference path="./Point.ts" />
(function ($Q) {
    var config = /** @class */ (function () {
        function config() {
        }
        config.NumPointClouds = 16;
        config.NumPoints = 32;
        config.Origin = new $Q.Point(0, 0, 0);
        config.MaxIntCoord = 1024; // (IntX, IntY) range from [0, MaxIntCoord - 1]
        config.LUTSize = 64; // default size of the lookup table is 64 x 64
        config.LUTScaleFactor = config.MaxIntCoord / config.LUTSize;
        return config;
    }());
    $Q.config = config;
})($Q || ($Q = {}));
var $Q;
(function ($Q) {
    var PointCloud = /** @class */ (function () {
        function PointCloud(name, points) {
            this.LUT = [];
            this.Name = name;
            this.Points = $Q.utlis.Resample(points, $Q.config.NumPoints);
            this.Points = $Q.utlis.Scale(this.Points);
            this.Points = $Q.utlis.TranslateTo(this.Points, $Q.config.Origin);
            this.Points = $Q.utlis.MakeIntCoords(this.Points); // fills in (IntX, IntY) values
            this.LUT = $Q.utlis.ComputeLUT(this.Points);
        }
        return PointCloud;
    }());
    $Q.PointCloud = PointCloud;
})($Q || ($Q = {}));
var $Q;
(function ($Q) {
    var QDollarRecognizer = /** @class */ (function () {
        function QDollarRecognizer() {
            this.PointClouds = [];
        }
        QDollarRecognizer.prototype.Recognize = function (points) {
            var t0 = Date.now();
            var candidate = new $Q.PointCloud("", points);
            var u = -1;
            var b = +Infinity;
            for (var i = 0; i < this.PointClouds.length; i++) {
                var d = $Q.utlis.CloudMatch(candidate, this.PointClouds[i], b);
                if (d < b) {
                    b = d; // best (least) distance
                    u = i; // point-cloud index
                }
            }
            var t1 = Date.now();
            return (u == -1) ? new $Q.Result("No match.", 0.0, t1 - t0) : new $Q.Result(this.PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1 - t0);
        };
        QDollarRecognizer.prototype.AddGesture = function (name, points) {
            this.PointClouds[this.PointClouds.length] = new $Q.PointCloud(name, points);
            var num = 0;
            for (var i = 0; i < this.PointClouds.length; i++) {
                if (this.PointClouds[i].Name == name)
                    num++;
            }
            return num;
        };
        QDollarRecognizer.prototype.ClearUserGestures = function () {
            this.PointClouds.length = 0; // clears any beyond the original set
        };
        return QDollarRecognizer;
    }());
    $Q.QDollarRecognizer = QDollarRecognizer;
})($Q || ($Q = {}));
var $Q;
(function ($Q) {
    var Result = /** @class */ (function () {
        function Result(name, score, ms) {
            this.Name = "";
            this.Score = 0;
            this.Time = 0;
            this.Name = name;
            this.Score = score;
            this.Time = ms;
        }
        return Result;
    }());
    $Q.Result = Result;
})($Q || ($Q = {}));
var $Q;
(function ($Q) {
    var utlis = /** @class */ (function () {
        function utlis() {
        }
        utlis.CloudMatch = function (candidate, template, minSoFar) {
            var n = candidate.Points.length;
            var step = Math.floor(Math.pow(n, 0.5));
            var LB1 = utlis.ComputeLowerBound(candidate.Points, template.Points, step, template.LUT);
            var LB2 = utlis.ComputeLowerBound(template.Points, candidate.Points, step, candidate.LUT);
            for (var i = 0, j = 0; i < n; i += step, j++) {
                if (LB1[j] < minSoFar)
                    minSoFar = Math.min(minSoFar, utlis.CloudDistance(candidate.Points, template.Points, i, minSoFar));
                if (LB2[j] < minSoFar)
                    minSoFar = Math.min(minSoFar, utlis.CloudDistance(template.Points, candidate.Points, i, minSoFar));
            }
            return minSoFar;
        };
        utlis.CloudDistance = function (pts1, pts2, start, minSoFar) {
            var n = pts1.length;
            var unmatched = new Array(); // indices for pts2 that are not matched
            for (var j = 0; j < n; j++)
                unmatched[j] = j;
            var i = start; // start matching with point 'start' from pts1
            var weight = n; // weights decrease from n to 1
            var sum = 0.0; // sum distance between the two clouds
            do {
                var u = -1;
                var b = +Infinity;
                for (var j = 0; j < unmatched.length; j++) {
                    var d = utlis.SqrEuclideanDistance(pts1[i], pts2[unmatched[j]]);
                    if (d < b) {
                        b = d;
                        u = j;
                    }
                }
                unmatched.splice(u, 1); // remove item at index 'u'
                sum += weight * b;
                if (sum >= minSoFar)
                    return sum; // early abandoning
                weight--;
                i = (i + 1) % n;
            } while (i != start);
            return sum;
        };
        utlis.ComputeLowerBound = function (pts1, pts2, step, LUT) {
            var n = pts1.length;
            var LB = new Array(Math.floor(n / step) + 1);
            var SAT = new Array(n);
            LB[0] = 0.0;
            for (var i = 0; i < n; i++) {
                var x = Math.round(pts1[i].IntX / $Q.config.LUTScaleFactor);
                var y = Math.round(pts1[i].IntY / $Q.config.LUTScaleFactor);
                var index = LUT[x][y];
                var d = utlis.SqrEuclideanDistance(pts1[i], pts2[index]);
                SAT[i] = (i == 0) ? d : SAT[i - 1] + d;
                LB[0] += (n - i) * d;
            }
            for (var i = step, j = 1; i < n; i += step, j++)
                LB[j] = LB[0] + i * SAT[n - 1] - n * SAT[i - 1];
            return LB;
        };
        utlis.Resample = function (points, n) {
            var I = utlis.PathLength(points) / (n - 1); // interval length
            var D = 0.0;
            var newpoints = new Array(points[0]);
            for (var i = 1; i < points.length; i++) {
                if (points[i].ID == points[i - 1].ID) {
                    var d = utlis.EuclideanDistance(points[i - 1], points[i]);
                    if ((D + d) >= I) {
                        var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
                        var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
                        var q = new $Q.Point(qx, qy, points[i].ID);
                        newpoints[newpoints.length] = q; // append new point 'q'
                        points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
                        D = 0.0;
                    }
                    else
                        D += d;
                }
            }
            if (newpoints.length == n - 1)
                newpoints[newpoints.length] = new $Q.Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].ID);
            return newpoints;
        };
        utlis.Scale = function (points) {
            var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
            for (var i = 0; i < points.length; i++) {
                minX = Math.min(minX, points[i].X);
                minY = Math.min(minY, points[i].Y);
                maxX = Math.max(maxX, points[i].X);
                maxY = Math.max(maxY, points[i].Y);
            }
            var size = Math.max(maxX - minX, maxY - minY);
            var newpoints = new Array();
            for (var i = 0; i < points.length; i++) {
                var qx = (points[i].X - minX) / size;
                var qy = (points[i].Y - minY) / size;
                newpoints[newpoints.length] = new $Q.Point(qx, qy, points[i].ID);
            }
            return newpoints;
        };
        utlis.TranslateTo = function (points, pt) {
            var c = utlis.Centroid(points);
            var newpoints = new Array();
            for (var i = 0; i < points.length; i++) {
                var qx = points[i].X + pt.X - c.X;
                var qy = points[i].Y + pt.Y - c.Y;
                newpoints[newpoints.length] = new $Q.Point(qx, qy, points[i].ID);
            }
            return newpoints;
        };
        utlis.Centroid = function (points) {
            var x = 0.0, y = 0.0;
            for (var i = 0; i < points.length; i++) {
                x += points[i].X;
                y += points[i].Y;
            }
            x /= points.length;
            y /= points.length;
            return new $Q.Point(x, y, 0);
        };
        utlis.PathLength = function (points) {
            var d = 0.0;
            for (var i = 1; i < points.length; i++) {
                if (points[i].ID == points[i - 1].ID)
                    d += utlis.EuclideanDistance(points[i - 1], points[i]);
            }
            return d;
        };
        utlis.MakeIntCoords = function (points) {
            for (var i = 0; i < points.length; i++) {
                points[i].IntX = Math.round((points[i].X + 1.0) / 2.0 * ($Q.config.MaxIntCoord - 1));
                points[i].IntY = Math.round((points[i].Y + 1.0) / 2.0 * ($Q.config.MaxIntCoord - 1));
            }
            return points;
        };
        utlis.ComputeLUT = function (points) {
            var LUT = new Array();
            for (var i = 0; i < $Q.config.LUTSize; i++)
                LUT[i] = new Array();
            for (var x = 0; x < $Q.config.LUTSize; x++) {
                for (var y = 0; y < $Q.config.LUTSize; y++) {
                    var u = -1;
                    var b = +Infinity;
                    for (var i = 0; i < points.length; i++) {
                        var row = Math.round(points[i].IntX / $Q.config.LUTScaleFactor);
                        var col = Math.round(points[i].IntY / $Q.config.LUTScaleFactor);
                        var d = ((row - x) * (row - x)) + ((col - y) * (col - y));
                        if (d < b) {
                            b = d;
                            u = i;
                        }
                    }
                    LUT[x][y] = u;
                }
            }
            return LUT;
        };
        utlis.SqrEuclideanDistance = function (pt1, pt2) {
            var dx = pt2.X - pt1.X;
            var dy = pt2.Y - pt1.Y;
            return (dx * dx + dy * dy);
        };
        utlis.EuclideanDistance = function (pt1, pt2) {
            var s = utlis.SqrEuclideanDistance(pt1, pt2);
            return Math.sqrt(s);
        };
        return utlis;
    }());
    $Q.utlis = utlis;
})($Q || ($Q = {}));
