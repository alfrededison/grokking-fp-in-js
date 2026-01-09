import { Data, Effect, Stream } from "effect"
import { List, Map, None, Some, StreamToList } from '../src/libs'

describe('ch09_CurrencyExchange', () => {

  /** PREREQUISITE: model
    */
  function Currency(value) {
    const _value = new String(value);
    _value.name = value;
    return _value;
  }

  /** PREREQUISITE: Impure, unsafe and side-effectful API call
    */
  /* eslint-disable */
  /**
   * 
   * @param {string} currency 
   */
  function exchangeRatesTableApiCall(currency) {
    const nextGaussian = () => {
      let u = 0, v = 0;
      while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };
    const setScaleFloor = (value) => {
      return Math.floor(value * 100) / 100;
    };

    if (Math.random() < 0.25) throw new Error("Connection error");
    var result = {};
    if (currency === "USD") {
      result["EUR"] = setScaleFloor(0.81 + (nextGaussian() / 100));
      result["JPY"] = setScaleFloor(103.25 + (nextGaussian()));
      return result;
    }
    throw new Error("Rate not available");
  }
  /* eslint-enable */

  /** STEP 0: Using immutable Maps
    */
  test('runStep0', () => {
    // create
    const noRates = Map();
    const usdRates = Map({
      [Currency("EUR")]: 0.82
    })
    const eurRates = Map({
      [Currency("USD")]: 1.22,
      [Currency("JPY")]: 126.34
    })
    console.log(noRates)
    console.log(usdRates)
    console.log(eurRates)

    // updated
    const updatedUsdRates = usdRates.set(Currency("JPY"), 103.91)
    expect(updatedUsdRates).toEqual(Map({
      [Currency("EUR")]: 0.82,
      [Currency("JPY")]: 103.91
    }))
    console.log(usdRates)
    console.log(updatedUsdRates)

    // practicing immutable maps
    // a map which contains a single pair: "key" -> "value":
    const m1 = Map({
      "key": "value"
    })
    expect(m1).toEqual(Map({
      "key": "value"
    }))

    // a map which updates m1 and stores "value2" under "key2"
    const m2 = m1.set("key2", "value2")
    expect(m2).toEqual(Map({
      "key": "value",
      "key2": "value2"
    }))

    // a map which updates m2 and stores "another2" under "key2"
    const m3 = m2.set("key2", "another2")
    expect(m3).toEqual(Map({
      "key": "value",
      "key2": "another2"
    }))

    // a map which updates m2 and removes the "key"
    const m4 = m3.remove("key")
    expect(m4).toEqual(Map({
      "key2": "another2"
    }))

    // a String value stored under "key" in m3
    const valueFromM3 = m3.getOption("key")
    expect(valueFromM3).toEqual(Some("value"))

    // a String value stored under "key" in m4
    const valueFromM4 = m4.getOption("key")
    expect(valueFromM4).toEqual(None())

    // working with currency maps
    expect(usdRates.set(Currency("EUR"), 0.83)).toEqual(Map({
      [Currency("EUR")]: 0.83
    }))

    // removed
    expect(usdRates.remove(Currency("EUR"))).toEqual(Map())
    expect(usdRates.remove(Currency("JPY"))).toEqual(usdRates)

    // get
    expect(usdRates.getOption(Currency("EUR"))).toEqual(Some(0.82))
    expect(usdRates.getOption(Currency("JPY"))).toEqual(None())
  })

  // Tuples, zip, & drop:
  test('tuplesZipDrop', () => {
    const rates = List.of(0.81, 0.82, 0.83)
    const ratePairs = List.of(
      Data.tuple(0.81, 0.82),
      Data.tuple(0.82, 0.83)
    )

    // { // analogical to a case class
    //   case class RatePair(previousRate: BigDecimal, rate: BigDecimal)
    //   val tuple: (BigDecimal, BigDecimal) = (BigDecimal(2), BigDecimal(1))
    //   val caseClass: RatePair             = RatePair(BigDecimal(2), BigDecimal(1))

    //   println(tuple)
    //   println(caseClass)
    // }

    const ints = List.of(1, 2, 3)
    const strings = List.of("a", "b", "c")
    expect(ints.zip(strings)).toEqual(List.of(Data.tuple(1, "a"), Data.tuple(2, "b"), Data.tuple(3, "c")))

    expect(rates.zip(rates)).toEqual(
      List.of(
        Data.tuple(0.81, 0.81),
        Data.tuple(0.82, 0.82),
        Data.tuple(0.83, 0.83)
      ))

    expect(rates.remove(0)).toEqual(List.of(0.82, 0.83))

    expect(rates.zip(rates.remove(0))).toEqual(ratePairs)
  })

  // zip + tuples + tuple pattern matching intro. NOTE: no pattern matching here because List.every use array
  /**
   * 
   * @param {List<number>} rates 
   */
  const trending = (rates) =>
    rates.size > 1 &&
    rates
      .zip(rates.remove(0))
      .every(([previousRate, rate]) => rate > previousRate)

  test('runTrending', () => {
    expect(trending(List())).toEqual(false)
    expect(trending(List.of(1, 2, 3, 8))).toEqual(true)
    expect(trending(List.of(1, 4, 3, 8))).toEqual(false)
    expect(trending(List.of(1, 2, 9, 8))).toEqual(false)
  })

  /**
   * 
   * @param {Currency} currencyToExtract 
   * @returns {(table: Map<Currency, number>) => Maybe<number>} 
   */
  const extractSingleCurrencyRate = (currencyToExtract) => (table) =>
    table
      .filter((rate, currency) => currency == currencyToExtract.name)
      .toList()
      .headOption()

  test('runExtractSingleCurrencyRate', () => {
    const usdExchangeTables = List.of(
      Map({ [Currency("EUR")]: 0.88 }),
      Map({ [Currency("EUR")]: 0.89, [Currency("JPY")]: 114.62 }),
      Map({ [Currency("JPY")]: 114 })
    )
    expect(usdExchangeTables.map(extractSingleCurrencyRate(Currency("EUR")))).toEqual(List.of(
      Some(0.88),
      Some(0.89),
      None(),
    ))
    expect(usdExchangeTables.map(extractSingleCurrencyRate(Currency("JPY")))).toEqual(List.of(
      None(),
      Some(114.62),
      Some(114)
    ))
    expect(usdExchangeTables.map(extractSingleCurrencyRate(Currency("BTC")))).toEqual(List.of(None(), None(), None()))
    expect(List().map(extractSingleCurrencyRate(Currency("EUR")))).toEqual(List())

    // alternative implementation
    const extractSingleCurrencyRate2 = (currencyToExtract) => (table) =>
      table.getOption(currencyToExtract)

    expect(usdExchangeTables.map(extractSingleCurrencyRate2(Currency("EUR")))).toEqual(List.of(
      Some(0.88),
      Some(0.89),
      None()
    ))
    expect(usdExchangeTables.map(extractSingleCurrencyRate2(Currency("JPY")))).toEqual(List.of(
      None(),
      Some(114.62),
      Some(114)
    ))
    expect(usdExchangeTables.map(extractSingleCurrencyRate2(Currency("BTC")))).toEqual(List.of(None(), None(), None()))
    expect(List().map(extractSingleCurrencyRate2(Currency("EUR")))).toEqual(List())
  })

  /** STEP 1: Using IO
    */
  const exchangeTable = (from) => Effect.try(() => exchangeRatesTableApiCall(from.name))
    .pipe(Effect.map(table =>
      Map(table).mapEntries(
        ([currencyName, rate]) => [Currency(currencyName), rate]
      )
    ))

  const Version1 = {
    /**
     * 
     * @param {Currency} from 
     * @param {Currency} to 
     */
    lastRates(from, to) {
      return Effect.gen(function* () {
        const table1 = yield* exchangeTable(from).pipe(Effect.retry({ times: 10 }))
        const table2 = yield* exchangeTable(from).pipe(Effect.retry({ times: 10 }))
        const table3 = yield* exchangeTable(from).pipe(Effect.retry({ times: 10 }))
        const lastTables = List.of(table1, table2, table3)
        return lastTables.map(extractSingleCurrencyRate(to))
          .filter(rate => rate.isSome())
          .map(rate => rate.extract())
      })
    },

    /**
     * 
     * @param {number} amount 
     * @param {Currency} from 
     * @param {Currency} to 
     */
    exchangeIfTrending(amount, from, to) {
      return this.lastRates(from, to)
        .pipe(Effect.map(rates => (trending(rates)) ? Some(amount * rates.last()) : None()))
    },
  }

  test('runVersion1', () => {
    Version1.exchangeIfTrending(1000, Currency("USD"), Currency("EUR")).pipe(Effect.runPromise)
      .then(result => {
        console.log(result)
        result.caseOf({
          Some: (value) => expect(value).not.toBeNaN(),
          None: () => expect(true).toBe(true)
        })
      })
      .catch(error => {
        expect(error.toJSON()).toHaveProperty('cause.failure.error.message')
        console.log(error.toJSON().cause.failure.error.message)
      })
  })

  // PROBLEMS: just one decision, we'd like to repeat until successful + hardcoded 3 currencyTable fetches
  /** STEP 2: Using IO + recursion
    */
  test('runStep2', () => { // recursion
    const lastRates = Version1.lastRates

    /**
     * 
     * @param {number} amount 
     * @param {Currency} from 
     * @param {Currency} to 
     */
    const exchangeIfTrendingForComp = (amount, from, to) =>
      Effect.gen(function* () {
        const rates = yield* lastRates(from, to)
        return trending(rates) ? Some(amount * rates.last()) : None()
      })

    exchangeIfTrendingForComp(1000, Currency("USD"), Currency("EUR")).pipe(Effect.runPromise)
      .then(result => {
        console.log(result)
        result.caseOf({
          Some: (value) => expect(value).not.toBeNaN(),
          None: () => expect(true).toBe(true)
        })
      })
      .catch(error => {
        expect(error.toJSON()).toHaveProperty('cause.failure.error.message')
        console.log(error.toJSON().cause.failure.error.message)
      })

    /**
     * 
     * @param {number} amount 
     * @param {Currency} from 
     * @param {Currency} to 
     * @returns 
     */
    const exchangeIfTrending = (amount, from, to) =>
      Effect.gen(function* () {
        const rates = yield* lastRates(from, to)
        const result = yield* (trending(rates) ? Effect.succeed(Some(amount * rates.last())) : exchangeIfTrending(amount, from, to))
        return result
      })

    expect(exchangeIfTrending(1000, Currency("USD"), Currency("EUR")).pipe(Effect.runSync).exists(x => x > 750)).toEqual(true)
  })

  test('gettingRidOfOption', () => {
    const lastRates = Version1.lastRates

    /**
     * 
     * @param {number} amount 
     * @param {Currency} from 
     * @param {Currency} to 
     */
    const exchangeIfTrending = (amount, from, to) =>
      Effect.gen(function* () {
        const rates = yield* lastRates(from, to)
        const result = yield* (trending(rates) ? Effect.succeed(amount * rates.last()) : exchangeIfTrending(amount, from, to))
        return result
      })

    expect(exchangeIfTrending(1000, Currency("USD"), Currency("EUR")).pipe(Effect.runSync)).toBeGreaterThan(750)
  })

  /**
   * 
   * @param {Currency} from 
   * @param {Currency} to 
   * @returns 
   */
  const currencyRate = (from, to) =>
    Effect.gen(function* () {
      const table = yield* exchangeTable(from).pipe(Effect.retry({ times: 10 }))
      const rate = yield* extractSingleCurrencyRate(to)(table).caseOf({
        Some: (value) => Effect.succeed(value),
        None: () => currencyRate(from, to)
      })
      return rate
    })

  const lastRatesCh8 = (from, to, n) => Effect.all(
    List.repeat(currencyRate(from, to), n)
  ).pipe(Effect.map(List))

  test('runLastRatesCh8', () => {
    expect(lastRatesCh8(Currency("USD"), Currency("EUR"), 0).pipe(Effect.runSync).size).toEqual(0)
    expect(lastRatesCh8(Currency("USD"), Currency("EUR"), 10).pipe(Effect.runSync).size).toEqual(10)
  })

  const Version2 = {
    /**
     * 
     * @param {Currency} from 
     * @param {Currency} to 
     * @param {number} n 
     */
    lastRates(from, to, n) {
      if (n < 1) {
        return Effect.succeed(List())
      } else {
        return Effect.gen(function* () {
          const _currencyRate = yield* currencyRate(from, to)
          const remainingRates = yield* (n == 1 ? Effect.succeed(List()) : Version2.lastRates(from, to, n - 1))
          return remainingRates.unshift(_currencyRate)
        })
      }
    },

    /**
     * 
     * @param {number} amount 
     * @param {Currency} from 
     * @param {Currency} to 
     */
    exchangeIfTrending(amount, from, to) {
      return Effect.gen(function* () {
        const rates = yield* Version2.lastRates(from, to, 3)
        const result = yield* (trending(rates) ? Effect.succeed(amount * rates.last()) : Version2.exchangeIfTrending(amount, from, to))
        return result
      })
    }
  }

  test('runVersion2', () => {
    expect(Version2.lastRates(Currency("USD"), Currency("EUR"), 0).pipe(Effect.runSync).size).toEqual(0)
    expect(Version2.lastRates(Currency("USD"), Currency("EUR"), 10).pipe(Effect.runSync).size).toEqual(10)

    expect(Version2.exchangeIfTrending(1000, Currency("USD"), Currency("EUR")).pipe(Effect.runSync)).toBeGreaterThan(750)
  })

  // PROBLEMS: we analyse three elements and discard them, we don't use a sliding window, each computation is isolated, no time between calls
  test('introduceOrElse', () => {
    const year = Stream.fromEffect(Effect.succeed(996))
    const noYear = Stream.fail("no year")

    const stream1 = year.pipe(Stream.orElse(() => Stream.fromEffect(Effect.succeed(2020))))
    const stream2 = noYear.pipe(Stream.orElse(() => Stream.fromEffect(Effect.succeed(2020))))
    const stream3 = year.pipe(Stream.orElse(() => Stream.fail("can't recover")))
    const stream4 = noYear.pipe(Stream.orElse(() => Stream.fail("can't recover")))

    expect(stream1.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(996))
    expect(stream2.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(2020))
    expect(stream3.pipe(StreamToList).pipe(Effect.runSync)).toEqual(List.of(996))

    expect(() => stream4.pipe(StreamToList).pipe(Effect.runSync)).toThrow("can't recover")
  })
})
