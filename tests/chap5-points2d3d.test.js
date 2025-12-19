import { List, Record } from "../src/libs"

/** Given lists of coordinates,
  * create all possible 2D & 3D points.
  */
const Point = Record({ x: 0, y: 0 })
const Point3d = Record({ x: 0, y: 0, z: 0 })

describe('Points2d3d', () => {

    test('Practicing nested flatMaps', () => {
        const points = List.of(1).flatMap(x =>
            List.of(-2, 7).map(y =>
                Point({x, y})
            )
        )
        expect(points).toEqual(List.of(Point({x: 1, y: -2}), Point({x: 1, y: 7})))
        expect(List.of(1).flatMap(x => List.of(-2, 7, 10).map(y => Point({x, y}))).size).toEqual(3)
        expect(List.of(1, 2).flatMap(x => List.of(-2, 7).map(y => Point({x, y}))).size).toEqual(4)
        expect(List.of(1, 2).flatMap(x => List.of(-2, 7, 10).map(y => Point({x, y}))).size).toEqual(6)
        expect(List().flatMap(x => List.of(-2, 7).map(y => Point({x, y}))).size).toEqual(0)
        expect(List.of(1).flatMap(x => List.of().map(y => Point({x, y}))).size).toEqual(0)
    })

    test('flatMaps vs. for comprehensions', () => {
        const xs = List.of(1)
        const ys = List.of(-2, 7)

        expect(xs.flatMap(x =>
            ys.map(y =>
                Point({x, y})
            )
        )).toEqual(List.of(Point({x: 1, y: -2}), Point({x: 1, y: 7})))

        // TODO
        // assert((for {
        //   x <- xs
        //   y <- ys
        // } yield Point(x, y)) == List(Point(1, -2), Point(1, 7)))

        const zs = List.of(3, 4)

        // TODO
        // assert(
        //   (for {
        //     x <- xs
        //     y <- ys
        //     z <- zs
        //   } yield Point3d(x, y, z))
        //     == List(Point3d(1, -2, 3), Point3d(1, -2, 4), Point3d(1, 7, 3), Point3d(1, 7, 4))
        // )

        expect(
            xs.flatMap(x =>
                ys.flatMap(y =>
                    zs.map(z =>
                        Point3d({x, y, z})
                    )
                )
            )
        ).toEqual(List.of(Point3d({x: 1, y: -2, z: 3}), Point3d({x: 1, y: -2, z: 4}), Point3d({x: 1, y: 7, z: 3}), Point3d({x: 1, y: 7, z: 4})))
    })
})

/** Given a list of points and radiuses,
  * calculate which points are inside circles defined by these radiuses.
  */
test('PointsInsideCircles', () => {
  const points   = List.of(Point({x: 5, y: 2}), Point({x: 1, y: 1}))
  const radiuses = List.of(2, 1)

  /**
   * 
   * @param {Point} point 
   * @param {number} radius 
   */
  const isInside = (point, radius) => 
    radius * radius >= point.x * point.x + point.y * point.y

//   assert((for {
//     r     <- radiuses
//     point <- points
//   } yield s"$point is within a radius of $r: " + isInside(point, r).toString) ==
//     List(
//       "Point(5,2) is within a radius of 2: false",
//       "Point(1,1) is within a radius of 2: true",
//       "Point(5,2) is within a radius of 1: false",
//       "Point(1,1) is within a radius of 1: false"
//     ))

  // FILTERING TECHNIQUES

  // using filter
//   assert((for {
//     r     <- radiuses
//     point <- points.filter(p => isInside(p, r))
//   } yield s"$point is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // using a guard expression
//   assert((for {
//     r     <- radiuses
//     point <- points
//     if isInside(point, r)
//   } yield s"$point is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // using flatMap
  /**
   * 
   * @param {Point} point 
   * @param {number} radius 
   */
  const insideFilter = (point, radius) => isInside(point, radius) ? List.of(point) : List()

//   assert((for {
//     r       <- radiuses
//     point   <- points
//     inPoint <- insideFilter(point, r)
//   } yield s"$inPoint is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // Coffee Break: Filtering Techniques
  const riskyRadiuses = List.of(-10, 0, 2)

//   assert((for {
//     r     <- riskyRadiuses
//     point <- points.filter(p => isInside(p, r))
//   } yield s"$point is within a radius of $r") ==
//     List(
//       "Point(5,2) is within a radius of -10",
//       "Point(1,1) is within a radius of -10",
//       "Point(1,1) is within a radius of 2"
//     ))

  // using filter
//   assert((for {
//     r     <- riskyRadiuses.filter(r => r > 0)
//     point <- points.filter(p => isInside(p, r))
//   } yield s"$point is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // using a guard expression
//   assert((for {
//     r     <- riskyRadiuses
//     if r > 0
//     point <- points
//     if isInside(point, r)
//   } yield s"$point is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // using flatMap
  /**
   * 
   * @param {number} radius 
   */
  const validateRadius = (radius) => radius > 0 ? List.of(radius) : List()

//   assert((for {
//     r           <- riskyRadiuses
//     validRadius <- validateRadius(r)
//     point       <- points
//     inPoint     <- insideFilter(point, validRadius)
//   } yield s"$inPoint is within a radius of $r") == List("Point(1,1) is within a radius of 2"))

  // bonus exercise solution using flatMap/map
  expect(riskyRadiuses.flatMap(r =>
    validateRadius(r).flatMap(validRadius =>
      points.flatMap(point =>
        insideFilter(point, validRadius).map(inPoint => `${inPoint} is within a radius of ${r}`)
      )
    )
  )).toEqual(List.of("Record { x: 1, y: 1 } is within a radius of 2"))
})

test('SequencedNestedFlatMaps', () => {
  const s = List.of(1, 2, 3)
    .flatMap(a => List.of(a * 2))
    .flatMap(b => List.of(b, b + 10))
  expect(s).toEqual(List.of(2, 12, 4, 14, 6, 16))

  const n = List.of(1, 2, 3)
    .flatMap(a =>
      List.of(a * 2).flatMap(b => List.of(b, b + 10))
    )
  expect(s).toEqual(n)
})