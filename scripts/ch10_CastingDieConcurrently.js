import { Duration, Effect, Ref } from "effect"
import { add, append, List, sum } from '../src/libs.js'

const castTheDieImpure = () => {
  // eslint-disable-next-line functional/no-throw-statements
  if (Math.random() > 0.5) throw new Error("Die fell off");
  return Math.floor(Math.random() * 6) + 1;
}

const castTheDie = () => Effect.try(castTheDieImpure)

/** Helper function that runs the given IO[A], times its execution, prints it, and returns it.
    * We also allow to specify the IORuntime environment. See the bonus code below for a different runtime.
    * This is how we separate the definition from the execution environment.
    * 
    * @param {Effect.Effect} io 
    */
const unsafeRunTimedIO = async (io) => {
  const start = Date.now()
  const result = await io.pipe(Effect.runPromise).catch(reason => reason.message)
  const end = Date.now()
  console.log(`${result} (took ${end - start}ms)`)
  return result
}

/**
 * 
 * @param {List<Effect.Effect<T>>} ios 
 * @returns {Effect.Effect<List<T>>}
 */
const parSequence = (ios) => Effect.all(ios, { concurrency: "unbounded" }).pipe(Effect.map(List))

const main = async () => {

  // Practicing refs and concurrent IOs:
  // 1. wait 1 second, then cast two dies concurrently, wait for both of them and return their sum
  await unsafeRunTimedIO(Effect.gen(function* () {
    yield* Effect.sleep(Duration.seconds(1)) // introduce 1.second
    const result = yield* parSequence(List.of(castTheDie(), castTheDie()))
    return sum(result)
  }))

  // 2. cast two dies concurrently, store each result in an atomic reference that holds a List, and return the final list as a result
  await unsafeRunTimedIO(Effect.gen(function* () {
    const storedCasts = yield* Ref.make(List())
    const singleCast = castTheDie().pipe(Effect.flatMap(result => Ref.update(storedCasts, append(result))))
    yield* parSequence(List.of(singleCast, singleCast))
    const casts = yield* Ref.get(storedCasts)
    return casts
  }))

  // 3. cast three dies concurrently, store each result in an atomic reference that holds a List, and return its value as a result
  await unsafeRunTimedIO(Effect.gen(function* () {
    const storedCasts = yield* Ref.make(List())
    const singleCast = castTheDie().pipe(Effect.flatMap(result => Ref.update(storedCasts, append(result))))
    yield* parSequence(List.repeat(singleCast, 3)) // introduce List.fill
    const casts = yield* Ref.get(storedCasts)
    return casts
  }))

  // 4. cast one hundred dies concurrently, store the total number of sixes in an atomic ref, and return its value as a result
  await unsafeRunTimedIO(Effect.gen(function* () {
    const storedCasts = yield* Ref.make(0)
    const singleCast = castTheDie().pipe(Effect.flatMap(result => (result == 6) ? Ref.update(storedCasts, add(1)) : Effect.succeed()))
    yield* parSequence(List.repeat(singleCast, 100))
    const casts = yield* Ref.get(storedCasts)
    return casts
  }))

  // 5. cast one hundred dies concurrently, wait 1 second before each of them, and return their sum (without using an atomic ref)
  await unsafeRunTimedIO(
    parSequence(List.repeat(
      Effect.sleep(Duration.seconds(1)).pipe(Effect.flatMap(castTheDie)),
      100
    )).pipe(Effect.map(sum))
  )
}

main()
