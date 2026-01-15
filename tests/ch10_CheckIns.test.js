import { Effect, Stream, Schedule, Console, Ref, Fiber } from "effect";
import { Map, List, Record, StreamToList, add, equals, prop, isNotEmpty } from "../src/libs";

/**
 * 
 * @param {List<Record>} list 
 */
const LogList = (list) => Effect.all(list.map(x => Console.log(`${x.city.name}: ${x.checkIns}`)))

describe("ch10_CheckIns", () => {

  /** PREREQUISITE: model
    */
  function City(value) {
    const _value = new String(value);
    _value.name = value;
    return _value;
  }

  const CityStatsModel = Record({ city: City(), checkIns: 0 });
  const CityStats = (city, checkIns) => CityStatsModel({ city, checkIns });

  /** PREREQUISITE: a stream of user check-ins
    */
  const checkIns = Stream.make(City("Sydney"), City("Dublin"), City("Cape Town"), City("Lima"), City("Singapore")).pipe(
    Stream.repeat(Schedule.recurs(100_000 - 1)),
    Stream.concat(Stream.range(1, 100_000).pipe(Stream.map(i => City(`City ${i}`)))),
    Stream.concat(Stream.make(City("Sydney"), City("Sydney"), City("Lima")))
  )

  test('showCheckIns', () => {
    const allCheckIns = checkIns.pipe(Stream.map(prop("name")), StreamToList, Effect.runSync)
    expect(allCheckIns.size).toBe(600_003)
    expect(allCheckIns.filter(equals("Sydney")).size).toBe(100_002)
    expect(allCheckIns.filter(equals("Lima")).size).toBe(100_001)
    expect(allCheckIns.filter(equals("Cape Town")).size).toBe(100_000)
    expect(allCheckIns.filter(equals("City 27")).size).toBe(1)
  })

  /** STEP 1: sequential & few ranking updates
    * (or more ranking updates, but slow)
    */
  /**
   * 
   * @param {Map<City, number>} cityCheckIns 
   */
  const topCities = (cityCheckIns) =>
    List(cityCheckIns)
      .map(([city, checkIns]) => CityStats(city, checkIns))
      .sortBy(prop("checkIns"))
      .reverse()
      .take(3)

  /** Helper function that runs the given IO[A], times its execution, prints it, and returns it
    */
  /** @type {<A>(io: Effect.Effect<A>) => A} */
  const unsafeRunTimedIO = (io) => {
    const start = Date.now()
    const result = io.pipe(Effect.runSync)
    const end = Date.now()
    console.log(`${result} (took ${end - start}ms)`)
    return result
  }

  test('step1', () => {
    const checkInsSmall = Stream.make(
      City("Sydney"),
      City("Sydney"),
      City("Cape Town"),
      City("Singapore"),
      City("Cape Town"),
      City("Sydney")
    )

    /**
     * 
     * @param {Stream.Stream<City>} checkIns 
     * @returns 
     */
    const processCheckInsRaw = (checkIns) =>
      checkIns.pipe(
        Stream.scan(Map(), (cityCheckIns, city) => {
          const newCheckIns = cityCheckIns.getOption(city).caseOf({
            None: () => 1,
            Some: (checkIns) => checkIns + 1
          })
          return cityCheckIns.set(city, newCheckIns)
        }),
        Stream.map(topCities),
        Stream.tap(LogList),
        Stream.drain,
        Stream.runCollect,
      )

    unsafeRunTimedIO(processCheckInsRaw(checkInsSmall))

    /** 
     * 
     * @param {Stream.Stream<City>} checkIns 
     */
    const processCheckIns = (checkIns) =>
      checkIns.pipe(
        Stream.scan(Map(), (cityCheckIns, city) =>
          cityCheckIns.update(city, 0, add(1))
        ),
        Stream.map(topCities),
        Stream.tap(LogList),
        Stream.drain,
        Stream.runCollect,
      )

    unsafeRunTimedIO(processCheckIns(checkInsSmall))
    // unsafeRunTimedIO(processCheckIns(checkIns)) // a long, long time...
  })

  const Version1 = {
    processCheckIns(checkIns) {
      return checkIns.pipe(
        Stream.scan(Map(), (cityCheckIns, city) =>
          cityCheckIns.update(city, 0, add(1))
        ),
        Stream.grouped(100_000), // smaller chunks = longer processing time
        Stream.map(chunk => List(chunk).last()),
        Stream.filter(isNotEmpty), // unNone
        Stream.map(topCities),
        Stream.tap(LogList),
        Stream.drain,
        Stream.runCollect,
      )
    }
  }

  test('runVersion1', () => {
    unsafeRunTimedIO(Version1.processCheckIns(checkIns))
  })

  // PROBLEMS: the current version is updated only every 100k elements (if you make it lower, it takes a lot longer)

  /** STEP 2: concurrent & up-to-date (real time, no batching)
    */
  test('step2', () => { // Ref intro
    { // update intro
      // we don't know how to create and use Refs
      // so let's use unsafeRunSync, but note it's not a proper usage, just for demonstration purpose
      const ref = Ref.make(0).pipe(Effect.runSync)

      // run concurrently
      Ref.update(ref, add(1)).pipe(Effect.runPromise) // again, we use Future to run it concurrently
      Ref.update(ref, add(2)).pipe(Effect.runPromise) // because we don't know fibers yet
      // Thread.sleep(100)

      expect(Ref.get(ref).pipe(Effect.runSync)).toBe(3)
    }

    const example = Effect.gen(function* () {
      const counter = yield* Ref.make(0)
      yield* Ref.update(counter, add(3))
      const result = yield* Ref.get(counter)
      return result
    })

    expect(example.pipe(Effect.runSync)).toBe(3)
  })

  /**
   * 
   * @param {List<Effect.Effect<T>>} ios 
   * @returns {Effect.Effect<List<T>>}
   */
  const sequence = (ios) => Effect.all(ios).pipe(Effect.map(List))

  /**
   * 
   * @param {List<Effect.Effect<T>>} ios 
   * @returns {Effect.Effect<List<T>>}
   */
  const parSequence = (ios) => Effect.all(ios, { concurrency: "unbounded" }).pipe(Effect.map(List))

  test('parSequenceIntro', () => {
    const exampleSequential = Effect.gen(function* () {
      const counter = yield* Ref.make(0)
      yield* sequence(List.of(Ref.update(counter, add(2)), Ref.update(counter, add(3)), Ref.update(counter, add(4))))
      const result = yield* Ref.get(counter)
      return result
    })

    expect(exampleSequential.pipe(Effect.runSync)).toBe(9)

    const exampleConcurrent = Effect.gen(function* () {
      const counter = yield* Ref.make(0)
      yield* parSequence(List.of(Ref.update(counter, add(2)), Ref.update(counter, add(3)), Ref.update(counter, add(4))))
      const result = yield* Ref.get(counter)
      return result
    })
    expect(exampleConcurrent.pipe(Effect.runSync)).toBe(9)
  })

  test('parSequenceWithSleepingIntro', async () => { // parSequence with sleeping intro
    const exampleSequential = Effect.gen(function* () {
      const counter = yield* Ref.make(0)
      const program1 = Ref.update(counter, add(2))
      const program2 = Effect.sleep('1 second').pipe(Effect.flatMap(_ => Ref.update(counter, add(3)))) // introduce IO.sleep
      const program3 = Effect.sleep('1 second').pipe(Effect.flatMap(_ => Ref.update(counter, add(4))))
      yield* sequence(List.of(program1, program2, program3))
      const result = yield* Ref.get(counter)
      return result
    })

    console.log("The following will run for around 2 seconds")
    expect(await exampleSequential.pipe(Effect.runPromise)).toBe(9)

    const exampleConcurrent = Effect.gen(function* () {
      const counter = yield* Ref.make(0)
      const program1 = Ref.update(counter, add(2))
      const program2 = Effect.sleep('1 second').pipe(Effect.flatMap(_ => Ref.update(counter, add(3))))
      const program3 = Effect.sleep('1 second').pipe(Effect.flatMap(_ => Ref.update(counter, add(4))))
      yield* parSequence(List.of(program1, program2, program3))
      const result = yield* Ref.get(counter)
      return result
    })

    console.log("The following will run for around 1 second")
    expect(await exampleConcurrent.pipe(Effect.runPromise)).toBe(9)
  })

  /** See [[ch10_CastingDieConcurrently]] for parSequence exercises
    */
  // final version
  /** 
   * 
   * @param {Ref.Ref<Map<City, number>>} storedCheckIns 
   */
  const storeCheckIn = (storedCheckIns) => (city) =>
    Ref.update(storedCheckIns, m => m.update(city, 0, add(1)))

  // final version
  /** 
   * 
   * @param {Ref.Ref<Map<City, number>>} storedCheckIns 
   * @param {Ref.Ref<List<CityStats>>} storedRanking 
   */
  const updateRanking = (storedCheckIns, storedRanking) =>
    Ref.get(storedCheckIns).pipe(
      Effect.map(topCities),
      Effect.flatMap(results => Ref.set(storedRanking, results)),
      Effect.forever
    )

  const Version2 = {
    // Coffee Break: Concurrent programs
    /**
     * 
     * @param {Stream.Stream<City>} checkIns 
     */
    processCheckIns(checkIns) {
      return Effect.gen(function* () {
        const storedCheckIns = yield* Ref.make(Map())
        const storedRanking = yield* Ref.make(List())
        const rankingProgram = updateRanking(storedCheckIns, storedRanking)
        const checkInsProgram = checkIns.pipe(Stream.mapEffect(storeCheckIn(storedCheckIns)), Stream.runDrain)
        const outputProgram = Effect.sleep('1 second').pipe(
          Effect.flatMap(_ => Ref.get(storedRanking)),
          Effect.flatMap(LogList),
          Effect.forever
        )
        yield* parSequence(List.of(rankingProgram, checkInsProgram, outputProgram))
      })
    }
  }

  test('runVersion2', async () => {
    console.log("The following should print ranking every 1 second")
    // Version2.processCheckIns(checkIns).unsafeRunSync()) // won't finish because it's an infinite program
    await Version2.processCheckIns(checkIns).pipe(Effect.timeoutOption('3 seconds'), Effect.runPromise) // run for max 3 seconds
  })

  // PROBLEM: our program doesn't return so we need to decide the way we want to consume rankings (here, println every 1 second)

  /** STEP 3: concurrent & up-to-date, return immediately and pass the controls to the caller
    */
  const ProcessingCheckInsModel = Record({
    currentRanking: Effect.succeed(),
    stop: Effect.succeed()
  })
  const ProcessingCheckIns = (currentRanking, stop) => ProcessingCheckInsModel({ currentRanking, stop })

  const Version3 = {
    processCheckIns(checkIns) {
      return Effect.gen(function* () {
        const storedCheckIns = yield* Ref.make(Map())
        const storedRanking = yield* Ref.make(List())
        const rankingProgram = updateRanking(storedCheckIns, storedRanking)
        const checkInsProgram = checkIns.pipe(Stream.mapEffect(storeCheckIn(storedCheckIns)), Stream.runDrain)
        const fiber = yield* parSequence(List.of(rankingProgram, checkInsProgram)).pipe(Effect.fork)
        return ProcessingCheckIns(Ref.get(storedRanking), Fiber.interruptFork(fiber))
      })
    }
  }

  test('runVersion3', async () => {
    console.log("The following should print two rankings")
    const program = Effect.gen(function* () {
      const processing = yield* Version3.processCheckIns(checkIns)
      const ranking = yield* processing.currentRanking
      yield* LogList(ranking)
      yield* Effect.sleep('1 second')
      const newRanking = yield* processing.currentRanking
      yield* LogList(newRanking)
      yield* processing.stop
      return newRanking
    })
    expect((await program.pipe(Effect.runPromise)).size).toBe(3)
  })

  // Quick quiz: fibers
  // What will this program do? How long will it run?
  test('quiz', async () => {
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.sleep('300 millis').pipe(
        Effect.flatMap(_ => Console.log("hello")),
        Effect.forever,
        Effect.fork
      )
      yield* Effect.sleep('1 second')
      yield* Fiber.interruptFork(fiber)
      yield* Effect.sleep('1 second')
    })
    await program.pipe(Effect.runPromise)
  })
})
