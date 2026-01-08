import F from 'fluture';

const castTheDieImpure = () => {
  // eslint-disable-next-line functional/no-throw-statements
  if (Math.random() > 0.5) throw new Error("Die fell off");
  return Math.floor(Math.random() * 6) + 1;
};

const drawAPointCardImpure = () => {
  // eslint-disable-next-line functional/no-throw-statements
  if (Math.random() > 0.5) throw new Error("No cards");
  return Math.floor(Math.random() * 14) + 1;;
};

test('Practicing failure recovery in IO values', () => {
  // Cast the die and if it fails to produce a result, return 0.
  F.attempt(castTheDieImpure).pipe(F.alt(F.resolve(0)))
    .pipe(
      F.fork
        (e => expect(e).toBeUndefined())
        (v => expect(v).toBeGreaterThanOrEqual(0))
    );

  // Draw a card and, if it fails, cast the die.
  F.attempt(drawAPointCardImpure).pipe(F.alt(F.attempt(castTheDieImpure)))
    .pipe(
      F.fork
        (e => expect(e).toEqual(
          expect.objectContaining({
            message: 'Die fell off',
          })
        ))
        (v => expect(v).toBeGreaterThanOrEqual(0))
    );

  // Cast the die and if it fails—retry once. If it fails again, return 0.
  F.attempt(castTheDieImpure)
    .pipe(F.alt(F.attempt(castTheDieImpure)))
    .pipe(F.alt(F.resolve(0)))
    .pipe(
      F.fork
        (e => expect(e).toBeUndefined())
        (v => expect(v).toBeGreaterThanOrEqual(0))
    );

  // Cast the die and draw a card, using a fallback of 0 for each of them. Return the sum of both.
  F.go(function* () {
    const die = yield F.attempt(castTheDieImpure).pipe(F.alt(F.resolve(0)));
    const card = yield F.attempt(drawAPointCardImpure).pipe(F.alt(F.resolve(0)));

    return die + card;
  })
    .pipe(
      F.fork
        (e => expect(e).toBeUndefined())
        (v => expect(v).toBeGreaterThanOrEqual(0))
    );

  // Draw a card and cast the die twice. Return the sum of all three or 0 if any of them fails.
  F.go(function* () {
    const card = yield F.attempt(drawAPointCardImpure);
    const die = yield F.attempt(castTheDieImpure);
    const die2 = yield F.attempt(castTheDieImpure);
    return die + card + die2;
  })
    .pipe(F.alt(F.resolve(0)))
    .pipe(
      F.fork
        (e => expect(e).toBeUndefined())
        (v => expect(v).toBeGreaterThanOrEqual(0))
    );
});
