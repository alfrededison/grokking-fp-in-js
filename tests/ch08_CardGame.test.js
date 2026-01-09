import { Effect } from "effect";

const castTheDieImpure = () => {
  // eslint-disable-next-line functional/no-throw-statements
  if (Math.random() > 0.5) throw new Error("Die fell off");
  return Math.floor(Math.random() * 6) + 1;
};

const drawAPointCardImpure = () => {
  // eslint-disable-next-line functional/no-throw-statements
  if (Math.random() > 0.5) throw new Error("No cards");
  return Math.floor(Math.random() * 14) + 1;
};

test('Practicing failure recovery in IO values', () => {
  // Cast the die and if it fails to produce a result, return 0.
  const prog1 = Effect.try(castTheDieImpure).pipe(Effect.orElse(() => Effect.succeed(0)));
  expect(Effect.runSync(prog1)).toBeGreaterThanOrEqual(0);

  // Draw a card and, if it fails, cast the die.
  const prog2 = Effect.try(drawAPointCardImpure).pipe(Effect.orElse(() => Effect.try(castTheDieImpure)));
  Effect.runPromise(prog2)
    .then((v) => expect(v).toBeGreaterThanOrEqual(0))
    .catch((e) => expect(e.toJSON()).toHaveProperty('cause.failure.error.message', 'Die fell off'));

  // Cast the die and if it fails—retry once. If it fails again, return 0.
  const prog3 = Effect.try(castTheDieImpure)
    .pipe(Effect.orElse(() => Effect.try(castTheDieImpure)))
    .pipe(Effect.orElse(() => Effect.succeed(0)));
  expect(Effect.runSync(prog3)).toBeGreaterThanOrEqual(0);

  // Cast the die and draw a card, using a fallback of 0 for each of them. Return the sum of both.
  const prog4 = Effect.gen(function* () {
    const die = yield* Effect.try(castTheDieImpure).pipe(Effect.orElse(() => Effect.succeed(0)));
    const card = yield* Effect.try(drawAPointCardImpure).pipe(Effect.orElse(() => Effect.succeed(0)));

    return die + card;
  })
  expect(Effect.runSync(prog4)).toBeGreaterThanOrEqual(0);

  // Draw a card and cast the die twice. Return the sum of all three or 0 if any of them fails.
  const prog5 = Effect.gen(function* () {
    const card = yield* Effect.try(drawAPointCardImpure);
    const die = yield* Effect.try(castTheDieImpure);
    const die2 = yield* Effect.try(castTheDieImpure);
    return die + card + die2;
  }).pipe(Effect.orElse(() => Effect.succeed(0)))
  expect(Effect.runSync(prog5)).toBeGreaterThanOrEqual(0);
});
