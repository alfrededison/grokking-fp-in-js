import { Effect, Stream } from "effect"
import { List, StreamToList } from "../src/libs"

describe('ch09_CastingDieStream', () => {
  test('creating values', () => {
    const numbers = Stream.make(1, 2, 3)
    const oddNumbers = numbers.pipe(Stream.filter(x => x % 2 != 0))

    expect(oddNumbers.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 3))
    expect(numbers.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3))
    expect(oddNumbers.pipe(Stream.map(x => x + 17)).pipe(Stream.take(1)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(18))
  })

  test('append & take', () => {
    const stream1 = Stream.make(1, 2, 3)
    const stream2 = Stream.make(4, 5, 6)

    const stream3 = stream1.pipe(Stream.concat(stream2))
    expect(stream3.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3, 4, 5, 6))

    const stream4 = stream1.pipe(Stream.concat(stream1))
    expect(stream4.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3, 1, 2, 3))

    const stream5 = stream4.pipe(Stream.take(4))
    expect(stream5.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3, 1))
  })

  test('infinite streams', () => {
    const numbers = () => Stream.make(1, 2, 3).pipe(Stream.concat(Stream.suspend(numbers)))

    const infinite123s = numbers()
    expect(infinite123s.pipe(Stream.take(8)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3, 1, 2, 3, 1, 2))
  })

  test('infinite streams using .repeat', () => {
    const numbers = Stream.make(1, 2, 3).pipe(Stream.forever)

    expect(numbers.pipe(Stream.take(8)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 2, 3, 1, 2, 3, 1, 2))
  })

  test('quick exercise: what do these expression return', () => {
    expect(Stream.make(1).pipe(Stream.forever).pipe(Stream.take(3)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 1, 1))
    expect(Stream.make(1).pipe(Stream.concat(Stream.make(0, 1).pipe(Stream.forever))).pipe(Stream.take(4)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(1, 0, 1, 0))
    expect(Stream.make(2).pipe(Stream.map(x => x * 13)).pipe(Stream.forever).pipe(Stream.take(1)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(26))
    expect(Stream.make(13).pipe(Stream.filter(x => x % 2 != 0)).pipe(Stream.forever).pipe(Stream.take(2)).pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(13, 13))
  })

  test('streams of IO values', () => {
    const castTheDieImpure = () => {
      console.log("The die is cast");
      return Math.floor(Math.random() * 6) + 1;
    }

    const castTheDie = () => Effect.sync(castTheDieImpure)

    const dieCast = Stream.fromEffect(castTheDie())
    expect(dieCast.pipe(StreamToList).pipe(Effect.runSync).size).toEqual(1)

    const infiniteDieCasts = Stream.fromEffect(castTheDie()).pipe(Stream.forever)
    // const infiniteDieCastsProgram = infiniteDieCasts.pipe(StreamToList)
    // println(infiniteDieCastsProgram.unsafeRunSync()) // will never finish

    // const infiniteDieCastsProgramDrain = infiniteDieCasts.pipe(Stream.drain)
    // println(infiniteDieCastsProgramDrain.unsafeRunSync()) // will never finish

    const firstThreeCasts = infiniteDieCasts.pipe(Stream.take(3))
    expect(firstThreeCasts.pipe(StreamToList).pipe(Effect.runSync).size).toEqual(3)

    const six = infiniteDieCasts.pipe(Stream.filter(x => x == 6)).pipe(Stream.take(1))
    expect(six.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(6))

    // Practicing stream operations:
    // 1. filter odd numbers only and return the first three such casts
    expect(infiniteDieCasts.pipe(Stream.filter(x => x % 2 != 0)).pipe(Stream.take(3)).pipe(StreamToList).pipe(Effect.runSync).size).toEqual(3)

    // 2. return first five die casts, but make sure all sixes values are doubled (so 1, 2, 3, 6, 4 becomes 1, 2, 3, 12, 4)
    const result1 = infiniteDieCasts.pipe(Stream.take(5)).pipe(Stream.map(x => (x == 6) ? 12 : x)).pipe(StreamToList).pipe(Effect.runSync)
    expect(result1).not.toContain(6)
    expect(result1.size).toEqual(5)

    // 3. return the sum of the first three casts
    const result2 = infiniteDieCasts.pipe(Stream.take(3)).pipe(Stream.runSum).pipe(Effect.runSync)
    expect(result2 >= 3 && result2 <= 18).toBe(true)

    // 4. cast the die until there is a five and then cast it two more times, returning three last results back
    const result3 = infiniteDieCasts.pipe(Stream.filter(x => x == 5)).pipe(Stream.take(1)).pipe(Stream.concat(infiniteDieCasts.pipe(Stream.take(2)))).pipe(StreamToList).pipe(Effect.runSync)
    expect(result3.size == 3 && result3.first() == 5).toBe(true)

    // 5. make sure the die is cast one hundred times and values are discarded
    expect(infiniteDieCasts.pipe(Stream.take(100)).pipe(Stream.runDrain).pipe(Effect.runSync)).toBeUndefined()

    // 6. return first three casts unchanged and next three casts tripled (six in total)
    const result6 = infiniteDieCasts.pipe(Stream.take(3)).pipe(Stream.concat(infiniteDieCasts.pipe(Stream.take(3)).pipe(Stream.map(x => x * 3)))).pipe(StreamToList).pipe(Effect.runSync)
    expect(result6.size).toEqual(6)
    expect(result6.slice(0, 3).every(x => x <= 6)).toEqual(true)
    expect(result6.slice(3, 6).every(x => x >= 3)).toEqual(true)

    // 7. cast the die until there are two sixes in a row
    const result7 = infiniteDieCasts
      .pipe(Stream.scan(0, (sixesInRow, current) => (current == 6) ? sixesInRow + 1 : 0))
      .pipe(Stream.filter(x => x == 2))
      .pipe(Stream.take(1))
      .pipe(StreamToList).pipe(Effect.runSync)
    expect(result7).toEqual(List.of(2))
  })
})
