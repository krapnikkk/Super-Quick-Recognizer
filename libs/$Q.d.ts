declare module $Q {
    class Point {
        X: number;
        Y: number;
        ID: number;
        IntX: number;
        IntY: number;
        constructor(x: number, y: number, id: number);
    }
}
declare module $Q {
    class config {
        static NumPointClouds: number;
        static NumPoints: number;
        static Origin: Point;
        static MaxIntCoord: number;
        static LUTSize: number;
        static LUTScaleFactor: number;
    }
}
declare module $Q {
    class PointCloud {
        Name: string;
        Points: Array<Point>;
        LUT: Array<Array<number>>;
        constructor(name: string, points: Array<Point>);
    }
}
declare module $Q {
    class QDollarRecognizer {
        PointClouds: Array<PointCloud>;
        Recognize(points: Array<Point>): Result;
        AddGesture(name: string, points: Array<Point>): number;
        ClearUserGestures(): void;
    }
}
declare module $Q {
    class Result {
        Name: string;
        Score: number;
        Time: number;
        constructor(name: string, score: number, ms: number);
    }
}
declare module $Q {
    class utlis {
        static CloudMatch(candidate: PointCloud, template: PointCloud, minSoFar: number): number;
        static CloudDistance(pts1: Array<Point>, pts2: Array<Point>, start: number, minSoFar: number): number;
        static ComputeLowerBound(pts1: Array<Point>, pts2: Array<Point>, step: number, LUT: Array<Array<number>>): any[];
        static Resample(points: Array<Point>, n: number): Point[];
        static Scale(points: Array<Point>): any[];
        static TranslateTo(points: Array<Point>, pt: Point): any[];
        static Centroid(points: Array<Point>): Point;
        static PathLength(points: Array<Point>): number;
        static MakeIntCoords(points: Array<Point>): Point[];
        static ComputeLUT(points: Array<Point>): Array<Array<number>>;
        static SqrEuclideanDistance(pt1: Point, pt2: Point): number;
        static EuclideanDistance(pt1: Point, pt2: Point): number;
    }
}
