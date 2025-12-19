import { List, Record, Maybe, Some, None, Left, Right, map, prop, invoker, multiply, ffor } from "../src/libs"

const TvShow = Record({ title: "", start: 0, end: 0 })

test('TvShows', () => {
    const shows = List.of(TvShow({ title: "Breaking Bad", start: 2008, end: 2013 }), TvShow({ title: "The Wire", start: 2002, end: 2008 }), TvShow({ title: "Mad Men", start: 2007, end: 2015 }))

    /**
     * 
     * @param {List<TvShow>} shows 
     */
    const sortShows = (shows) =>
        shows
            .sortBy(tvShow => tvShow.end - tvShow.start) // sortBy gets a function that returns an Int for a given TvShow
            .reverse()                                   // sortBy sorts in natural order (from the smallest Int to the highest one), so we return a reverse of the List


    expect(sortShows(shows).map(prop("title"))).toEqual(List.of("Mad Men", "The Wire", "Breaking Bad"))

    const rawShows = List.of("Breaking Bad (2008-2013)", "The Wire (2002-2008)", "Mad Men (2007-2015)")

    // TODO
    //   test('case 2', () => {
    //     def parseShows(rawShows: ListList.of(String)): ListList.of(TvShow) = ??? // we need to implement it next

    //     def sortRawShows(rawShows: ListList.of(String)): ListList.of(TvShow) = {
    //       const  tvShows = parseShows(rawShows)
    //       sortShows(tvShows)
    //     }

    //     console.log(sortRawShows)
    //   })

    const invalidRawShows = ["Breaking Bad, 2008-2013", "The Wire (from 2002 until 2008)", "Mad Men (9/10)"]

    // STEP 0: ad-hoc solution (PROBLEM: exceptions)
    {
        /**
         * @param {String} rawShow
         */
        const parseShow = (rawShow) => {
            // first get the indices of the separator characters
            const bracketOpen = rawShow.indexOf('(')
            const bracketClose = rawShow.indexOf(')')
            const dash = rawShow.indexOf('-')

            // then use these separators to extract 3 pieces of information we need
            const name = rawShow.substring(0, bracketOpen).trim()
            const yearStart = Number.parseInt(rawShow.substring(bracketOpen + 1, dash))  // or: .toInt
            const yearEnd = Number.parseInt(rawShow.substring(dash + 1, bracketClose)) // or: .toInt

            return TvShow({ title: name, start: yearStart, end: yearEnd })
        }

        expect(parseShow("Breaking Bad (2008-2013)")).toEqual(TvShow({ title: "Breaking Bad", start: 2008, end: 2013 }))

        /**
         * 
         * @param {List<string>} rawShows 
         */
        const parseShows = (rawShows) => rawShows.map(parseShow)

        expect(parseShows(rawShows)).toEqual(List.of(
            TvShow({ title: "Breaking Bad", start: 2008, end: 2013 }),
            TvShow({ title: "The Wire", start: 2002, end: 2008 }),
            TvShow({ title: "Mad Men", start: 2007, end: 2015 })
        ))

        // TODO
        // INVALID INPUT
        // val invalidRawShow = "Breaking Bad, 2008-2013"
        // parseShow(invalidRawShow)
        // parseShows(invalidRawShows)

        // expect(parseShow("Chernobyl (2019)")).toThrow()

        // see ch06_TvShowsJava for more imperative examples
    }

    // STEP 1a: using Option without implementing it yet
    // let's first see how we would use and test it:
    /**
     * 
     * @param {function(string): Maybe<TvShow>} parseShow 
     */
    const testOptionBasedParseShow = (parseShow) => {
        expect(parseShow("The Wire (2002-2008)")).toEqual(Some(TvShow({ title: "The Wire", start: 2002, end: 2008 })))
        expect(parseShow("The Wire aired from 2002 to 2008")).toEqual(None())
        expect(parseShow("Breaking Bad (2008-2013)")).toEqual(Some(TvShow({ title: "Breaking Bad", start: 2008, end: 2013 })))
        expect(parseShow("Mad Men (2007-2015)")).toEqual(Some(TvShow({ title: "Mad Men", start: 2007, end: 2015 })))
        expect(parseShow("Scrubs (2001-2010)")).toEqual(Some(TvShow({ title: "Scrubs", start: 2001, end: 2010 })))
        // INVALID INPUT
        expect(parseShow("Breaking Bad ()")).toEqual(None())
        expect(parseShow("()")).toEqual(None())
        expect(parseShow(") - (Breaking Bad, 2008-2013")).toEqual(None())
        expect(parseShow("Mad Men (-2015)")).toEqual(None())
        // expect(parseShow("The Wire ( 2002 - 2008 )")).toEqual(None())
        expect(parseShow("Stranger Things (2016-)")).toEqual(None())
    }

    // STEP 1b: using Option, but implementing smaller functions that return Options first
    // the step-by-step implementation before the for-comprehension refactoring
    /**
     * 
     * @param {string} rawShow 
    */
    const extractYearStart = (rawShow) => {
        const bracketOpen = rawShow.indexOf('(')
        const dash = rawShow.indexOf('-')
        const yearStrOpt = (bracketOpen != -1 && dash > bracketOpen + 1) ? Some(rawShow.substring(bracketOpen + 1, dash)) : None()
        return yearStrOpt.map(yearStr => yearStr.toIntOption()).flatten()
    }

    {
        expect(extractYearStart("Breaking Bad (2008-2013)")).toEqual(Some(2008))
        expect(extractYearStart("Mad Men (-2015)")).toEqual(None())
        expect(extractYearStart("(2002- N/A ) The Wire")).toEqual(Some(2002))
    }

    // TODO
    // we will use a for-comprehension version
    //   def extractYearStart(rawShow: String) = {
    //     const  bracketOpen = rawShow.indexOf('(')
    //     const  dash        = rawShow.indexOf('-')
    //     for {
    //       yearStr <- if (bracketOpen != -1 && dash > bracketOpen + 1) Some(rawShow.substring(bracketOpen + 1, dash))
    //                  else None()
    //       year    <- yearStr.toIntOption
    //     } yield year
    //   }

    //   expect(extractYearStart("Breaking Bad (2008-2013)")).toEqual(Some(2008))
    //   expect(extractYearStart("Mad Men (-2015)")).toEqual(None())
    //   expect(extractYearStart("(2002- N/A ) The Wire")).toEqual(Some(2002))

    /** 
     * 
     * @param {string} rawShow 
     */
    const extractName = (rawShow) => {
        const bracketOpen = rawShow.indexOf('(')
        return (bracketOpen > 0) ? Some(rawShow.substring(0, bracketOpen).trim()) : None()
    }

    /**
     * TODO: cannot use for-comprehension here yet
     * @param {string} rawShow
     */
    const extractYearEnd = (rawShow) => {
        const dash = rawShow.indexOf('-')
        const bracketClose = rawShow.indexOf(')')
        const yearStr = (dash != -1 && bracketClose > dash + 1) ? Some(rawShow.substring(dash + 1, bracketClose)) : None()
        return yearStr.toIntOption()
    }

    { // STEP 1c: using Option and composing smaller function into bigger one:
        const parseShow = (rawShow) => ffor((title, start, end) => TvShow({ title, start, end }))(
            extractName(rawShow),
            extractYearStart(rawShow),
            extractYearEnd(rawShow),
        )

        // it passes all tests:
        testOptionBasedParseShow(parseShow)

        // but it doesn't work with some exceptional undocumented cases:
        expect(parseShow("Chernobyl (2019)")).toEqual(None())
    }

    // (alternative) Step 1d: as a reminder, we can also implement it using bare flatMaps/maps (see chapter 5)
    {
        /**
         * 
         * @param {string} rawShow 
         */
        const parseShow = (rawShow) =>
            extractName(rawShow).flatMap(name =>
                extractYearStart(rawShow).flatMap(yearStart =>
                    extractYearEnd(rawShow).map(yearEnd =>
                        TvShow({ title: name, start: yearStart, end: yearEnd })
                    )
                )
            )

        // it passes all tests:
        testOptionBasedParseShow(parseShow)

        // but it doesn't work with some exceptional undocumented cases:
        expect(parseShow("Chernobyl (2019)")).toEqual(None())
    }

    /**
     * 
     * @param {string} rawShow 
     */
    const extractSingleYear = (rawShow) => {
        const dash = rawShow.indexOf('-')
        const bracketOpen = rawShow.indexOf('(')
        const bracketClose = rawShow.indexOf(')')
        const yearStr = (dash == -1 && bracketOpen != -1 && bracketClose > bracketOpen + 1)
            ? Some(rawShow.substring(bracketOpen + 1, bracketClose))
            : None()
        return yearStr.toIntOption()
    }

    // STEP 1d: using Option and alt
    /**
     * @param {string} rawShow
     */
    const parseShow = (rawShow) => ffor((title, start, end) => TvShow({ title, start, end }))(
        extractName(rawShow),
        extractYearStart(rawShow).alt(extractSingleYear(rawShow)),
        extractYearEnd(rawShow).alt(extractSingleYear(rawShow))
    )

    // it passes all tests:
    testOptionBasedParseShow(parseShow)

    // and is able to parse Chernobyl, too:
    expect(parseShow("Chernobyl (2019)")).toEqual(Some(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))

    { // introducing alt
        const seven = Some(7)
        const eight = Some(8)
        const none = None()

        expect(seven.alt(eight)).toEqual(Some(7))
        expect(none.alt(eight)).toEqual(Some(8))
        expect(seven.alt(none)).toEqual(Some(7))
        expect(none.alt(none)).toEqual(None())

        const chernobyl = "Chernobyl (2019)"
        expect(extractYearStart(chernobyl)).toEqual(None())
        expect(extractSingleYear(chernobyl)).toEqual(Some(2019))
        expect(extractYearStart(chernobyl).alt(extractSingleYear(chernobyl))).toEqual(Some(2019))
        expect(extractYearStart(chernobyl).alt(extractSingleYear("not-a-year"))).toEqual(None())
    }

    { // Practicing functional error handling
        const extractSingleYearOrYearEnd = (rawShow) =>
            extractSingleYear(rawShow).alt(extractYearEnd(rawShow))

        const extractAnyYear = (rawShow) =>
            extractYearStart(rawShow).alt(extractYearEnd(rawShow)).alt(extractSingleYear(rawShow))

        const extractSingleYearIfNameExists = (rawShow) =>
            extractName(rawShow).flatMap(name => extractSingleYear(rawShow))

        const extractAnyYearIfNameExists = (rawShow) =>
            extractName(rawShow).flatMap(name => extractAnyYear(rawShow))

        expect(extractSingleYearOrYearEnd("A (1992-)")).toEqual(None())
        expect(extractSingleYearOrYearEnd("B (2002)")).toEqual(Some(2002))
        expect(extractSingleYearOrYearEnd("C (-2012)")).toEqual(Some(2012))
        expect(extractSingleYearOrYearEnd("(2022)")).toEqual(Some(2022))
        expect(extractSingleYearOrYearEnd("E (-)")).toEqual(None())

        expect(extractAnyYear("A (1992-)")).toEqual(Some(1992))
        expect(extractAnyYear("B (2002)")).toEqual(Some(2002))
        expect(extractAnyYear("C (-2012)")).toEqual(Some(2012))
        expect(extractAnyYear("(2022)")).toEqual(Some(2022))
        expect(extractAnyYear("E (-)")).toEqual(None())

        expect(extractSingleYearIfNameExists("A (1992-)")).toEqual(None())
        expect(extractSingleYearIfNameExists("B (2002)")).toEqual(Some(2002))
        expect(extractSingleYearIfNameExists("C (-2012)")).toEqual(None())
        expect(extractSingleYearIfNameExists("(2022)")).toEqual(None())
        expect(extractSingleYearIfNameExists("E (-)")).toEqual(None())

        expect(extractAnyYearIfNameExists("A (1992-)")).toEqual(Some(1992))
        expect(extractAnyYearIfNameExists("B (2002)")).toEqual(Some(2002))
        expect(extractAnyYearIfNameExists("C (-2012)")).toEqual(Some(2012))
        expect(extractAnyYearIfNameExists("(2022)")).toEqual(None())
        expect(extractAnyYearIfNameExists("E (-)")).toEqual(None())
    }

    { // introducing toList
        expect(Some(7).toList()).toEqual(List.of(7))
        expect(None().toList()).toEqual(List())
    }

    const rawShowsWithOneInvalid = List.of("Breaking Bad (2008-2013)", "The Wire 2002 2008", "Mad Men (2007-2015)")

    { // STEP 2a: trying to blindly implement parseShows by following only the compiler ("best-effort" error handling strategy)
        /**
         * 
         * @param {List<string>} rawShows 
         */
        const parseShows = (rawShows) =>
            rawShows          // List[String]
                .map(parseShow) // List[Option[TvShow]]
                .map(e => e.toList())  // List[List[TvShow]]
                .flatten()        // List[TvShow]

        { // example from the introduction to this section
            const rawShows = List.of("The Wire (2002-2008)", "Chernobyl (2019)")
            expect(parseShows(rawShows)).toEqual(List.of(TvShow({ title: "The Wire", start: 2002, end: 2008 }), TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))
        }

        expect(parseShows(rawShowsWithOneInvalid)).toEqual(List.of(
            TvShow({ title: "Breaking Bad", start: 2008, end: 2013 }),
            TvShow({ title: "Mad Men", start: 2007, end: 2015 })
        ))
        expect(parseShows(List.of("Chernobyl [2019]", "Breaking Bad (2008-2013)"))).toEqual(List.of(TvShow({ title: "Breaking Bad", start: 2008, end: 2013 })))
        expect(parseShows(List.of("Chernobyl [2019]", "Breaking Bad"))).toEqual(List())

        {
            const rawShows = List.of("Breaking Bad (2008-2013)", "The Wire 2002 2008", "Mad Men (2007-2015)")
            expect(parseShows(rawShows)).toEqual(List.of(TvShow({ title: "Breaking Bad", start: 2008, end: 2013 }), TvShow({ title: "Mad Men", start: 2007, end: 2015 })))
        }
    }

    // Coffee Break: error handling strategies
    /**
     * 
     * @param {Maybe<List<TvShow>>} parsedShows 
     * @param {Maybe<TvShow>} newParsedShow
     */
    const addOrResign = (parsedShows, newParsedShow) => ffor((shows, parsedShow) => shows.push(parsedShow))(
        parsedShows,
        newParsedShow,
    )

    expect(addOrResign(Some(List()), Some(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))).toEqual(
        Some(List.of(TvShow(
            { title: "Chernobyl", start: 2019, end: 2019 }
        ))))
    expect(addOrResign(Some(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 }))), Some(TvShow({ title: "The Wire", start: 2002, end: 2008 })))).toEqual(
        Some(List.of(
            TvShow({ title: "Chernobyl", start: 2019, end: 2019 }),
            TvShow({ title: "The Wire", start: 2002, end: 2008 })
        )))
    expect(addOrResign(Some(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 }))), None())).toEqual(None())
    expect(addOrResign(None(), Some(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))).toEqual(None())
    expect(addOrResign(None(), None())).toEqual(None())

    // STEP 2b: implementing the "all-or-nothing" error handling strategy
    /** 
     * 
     * @param {List<string>} rawShows 
     */
    const parseShows = (rawShows) => {
        const initialResult = Some(List())
        return rawShows
            .map(parseShow)
            .reduce(addOrResign, initialResult)
    }

    expect(parseShows(rawShows).map(map(prop("title")))).toEqual(Some(List.of("Breaking Bad", "The Wire", "Mad Men")))
    expect(parseShows(rawShowsWithOneInvalid)).toEqual(None())
    expect(parseShows(List.of("Chernobyl (2019)", "Breaking Bad (2008-2013)"))).toEqual(
        Some(List.of(
            TvShow({ title: "Chernobyl", start: 2019, end: 2019 }),
            TvShow({ title: "Breaking Bad", start: 2008, end: 2013 })
        ))
    )
    expect(parseShows(List.of("Chernobyl [2019]", "Breaking Bad (2008-2013)"))).toEqual(None())
    expect(parseShows(List.of("Chernobyl [2019]", "Breaking Bad"))).toEqual(None())
    expect(parseShows(List.of("Chernobyl (2019)", "Breaking Bad"))).toEqual(None())
    expect(parseShows(List.of("Chernobyl (2019)"))).toEqual(Some(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 }))))
    expect(parseShows(List())).toEqual(Some(List()))

    // STEP 3: using Either to return descriptive errors
    {
        // introducing Either
        {
            /**
             * 
             * @param {string} show 
             */
            const extractName = (show) => {
                const bracketOpen = show.indexOf('(')
                return (bracketOpen > 0) ? Right(show.substring(0, bracketOpen).trim()) : Left(`Can't extract name from ${show}`)
            }

            expect(extractName("(2022)")).toEqual(Left("Can't extract name from (2022)"))
        }
        {
            /**
             * 
             * @param {string} show 
             */
            const extractName = (show) => {
                const bracketOpen = show.indexOf('(')
                return (bracketOpen > 0) ? Some(show.substring(0, bracketOpen).trim()) : None()
            }

            expect(extractName("(2022)")).toEqual(None())
        }

        /**
         * 
         * @param {string} rawShow 
         */
        const extractYearStart = (rawShow) => {
            const bracketOpen = rawShow.indexOf('(')
            const dash = rawShow.indexOf('-')
            const yearStrEither =
                (bracketOpen != -1 && dash > bracketOpen + 1) ? Right(rawShow.substring(bracketOpen + 1, dash)) : Left(`Can't extract start year from ${rawShow}`)
            return yearStrEither.map(yearStr => yearStr.toIntOption().toRight(`Can't parse ${yearStr}`)).flatten()
        }

        { // the step-by-step implementation before the for-comprehension refactoring
            expect(extractYearStart("The Wire (2002-2008)")).toEqual(Right(2002))
            expect(extractYearStart("The Wire (-2008)")).toEqual(Left("Can't extract start year from The Wire (-2008)"))
            expect(extractYearStart("The Wire (oops-2008)")).toEqual(Left("Can't parse oops"))
            expect(extractYearStart("The Wire (2002-)")).toEqual(Right(2002))

            // see the for-comprehension version below
        }

        { // Understanding Either.map, flatten, toRight
            expect(Right("1985").map(invoker(0, 'toIntOption'))).toEqual(Right(Some(1985)))
            const yearStrEither = Left("Error")
            expect(yearStrEither.map(invoker(0, 'toIntOption'))).toEqual(Left("Error"))

            {
                const e = Right("1985")
                expect(e.map(invoker(0, 'toIntOption'))).toEqual(Right(Some(1985)))
            }

            {
                const e = Left("Error")
                expect(e.map(invoker(0, 'toIntOption'))).toEqual(Left("Error"))
            }

            expect(Some(1985).toRight("Can't parse it")).toEqual(Right(1985))
            expect(None().toRight("Can't parse it")).toEqual(Left("Can't parse it"))

            expect(List.of(List.of(1985)).flatten()).toEqual(List.of(1985))
            expect(List.of(List()).flatten()).toEqual(List())
            expect(Some(Some(1985)).flatten()).toEqual(Some(1985))
            expect(Some(None()).flatten()).toEqual(None())
            expect(Right(Right(1985)).flatten()).toEqual(Right(1985))
            expect(Right(Left("Error")).flatten()).toEqual(Left("Error"))
        }

        // TODO
        // we will use a for-comprehension version
        // def extractYearStart(rawShow: String): EitherList.of(String, Int) = {
        //   const  bracketOpen = rawShow.indexOf('(')
        //   const  dash        = rawShow.indexOf('-')
        //   for {
        //     yearStr <- if (bracketOpen != -1 && dash > bracketOpen + 1) Right(rawShow.substring(bracketOpen + 1, dash))
        //                else Left(s"Can't extract start year from $rawShow")
        //     year    <- yearStr.toIntOption.toRight(s"Can't parse $yearStr")
        //   } yield year
        // }

        // expect(extractYearStart("The Wire (2002-2008)")).toEqual(Right(2002))
        // expect(extractYearStart("The Wire (-2008)")).toEqual(Left("Can't extract start year from The Wire (-2008)"))
        // expect(extractYearStart("The Wire (oops-2008)")).toEqual(Left("Can't parse oops"))
        // expect(extractYearStart("The Wire (2002-)")).toEqual(Right(2002))

        /**
         * 
         * @param {string} rawShow 
         */
        const extractName = (rawShow) => {
            const bracketOpen = rawShow.indexOf('(')
            return (bracketOpen > 0) ? Right(rawShow.substring(0, bracketOpen).trim()) : Left(`Can't extract name from ${rawShow}`)
        }

        /**
         * TODO: cannot use for-comprehension here yet
         * @param {string} rawShow 
         */
        const extractYearEnd = (rawShow) => {
            const dash = rawShow.indexOf('-')
            const bracketClose = rawShow.indexOf(')')
            const yearStr = (dash != -1 && bracketClose > dash + 1) ? Right(rawShow.substring(dash + 1, bracketClose)) : Left(`Can't extract end year from ${rawShow}`)
            return yearStr.toIntEither(`Can't parse ${yearStr.value}`)
        }

        /**
         * 
         * @param {string} rawShow 
         */
        const extractSingleYear = (rawShow) => {
            const dash = rawShow.indexOf('-')
            const bracketOpen = rawShow.indexOf('(')
            const bracketClose = rawShow.indexOf(')')
            const yearStr = (dash == -1 && bracketOpen != -1 && bracketClose > bracketOpen + 1)
                ? Right(rawShow.substring(bracketOpen + 1, bracketClose))
                : Left(`Can't extract single year from ${rawShow}`)
            return yearStr.toIntEither(`Can't parse ${yearStr.value}`)
        }

        /**
         * 
         * @param {string} rawShow 
         */
        const parseShow = (rawShow) => ffor((title, start, end) => TvShow({ title, start, end }))(
            extractName(rawShow),
            extractYearStart(rawShow).alt(extractSingleYear(rawShow)),
            extractYearEnd(rawShow).alt(extractSingleYear(rawShow)),
        )

        expect(parseShow("Mad Men ()")).toEqual(Left("Can't extract single year from Mad Men ()"))
        expect(parseShow("The Wire (-)")).toEqual(Left("Can't extract single year from The Wire (-)"))
        expect(parseShow("The Wire (oops)")).toEqual(Left("Can't parse oops"))
        expect(parseShow("(2002-2008)")).toEqual(Left("Can't extract name from (2002-2008)"))
        expect(parseShow("The Wire (2002-2008)")).toEqual(Right(TvShow({ title: "The Wire", start: 2002, end: 2008 })))

        { // Practicing functional error handling with Either
            /**
             * 
             * @param {string} rawShow 
             */
            const extractSingleYearOrYearEnd = (rawShow) =>
                extractSingleYear(rawShow).alt(extractYearEnd(rawShow))

            /**
               * 
               * @param {string} rawShow 
               */
            const extractAnyYear = (rawShow) =>
                extractYearStart(rawShow).alt(extractYearEnd(rawShow)).alt(extractSingleYear(rawShow))

            /**
               * 
               * @param {string} rawShow 
               */
            const extractSingleYearIfNameExists = (rawShow) =>
                extractName(rawShow).flatMap(name => extractSingleYear(rawShow))

            /**
               * 
               * @param {string} rawShow 
               */
            const extractAnyYearIfNameExists = (rawShow) =>
                extractName(rawShow).flatMap(name => extractAnyYear(rawShow))

            expect(extractSingleYearOrYearEnd("A (1992-)")).toEqual(Left("Can't extract end year from A (1992-)"))
            expect(extractSingleYearOrYearEnd("B (2002)")).toEqual(Right(2002))
            expect(extractSingleYearOrYearEnd("C (-2012)")).toEqual(Right(2012))
            expect(extractSingleYearOrYearEnd("(2022)")).toEqual(Right(2022))
            expect(extractSingleYearOrYearEnd("E (-)")).toEqual(Left("Can't extract end year from E (-)"))

            expect(extractAnyYear("A (1992-)")).toEqual(Right(1992))
            expect(extractAnyYear("B (2002)")).toEqual(Right(2002))
            expect(extractAnyYear("C (-2012)")).toEqual(Right(2012))
            expect(extractAnyYear("(2022)")).toEqual(Right(2022))
            expect(extractAnyYear("E (-)")).toEqual(Left("Can't extract single year from E (-)"))

            expect(extractSingleYearIfNameExists("A (1992-)")).toEqual(Left("Can't extract single year from A (1992-)"))
            expect(extractSingleYearIfNameExists("B (2002)")).toEqual(Right(2002))
            expect(extractSingleYearIfNameExists("C (-2012)")).toEqual(Left("Can't extract single year from C (-2012)"))
            expect(extractSingleYearIfNameExists("(2022)")).toEqual(Left("Can't extract name from (2022)"))
            expect(extractSingleYearIfNameExists("E (-)")).toEqual(Left("Can't extract single year from E (-)"))

            expect(extractAnyYearIfNameExists("A (1992-)")).toEqual(Right(1992))
            expect(extractAnyYearIfNameExists("B (2002)")).toEqual(Right(2002))
            expect(extractAnyYearIfNameExists("C (-2012)")).toEqual(Right(2012))
            expect(extractAnyYearIfNameExists("(2022)")).toEqual(Left("Can't extract name from (2022)"))
            expect(extractAnyYearIfNameExists("E (-)")).toEqual(Left("Can't extract single year from E (-)"))
        }

        /**
         * 
         */
        const addOrResign = (parsedShows, newParsedShow) => ffor((shows, parsedShow) => shows.push(parsedShow))(
            parsedShows,
            newParsedShow,
        )

        expect(
            addOrResign(Right(List()), Right(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))
        ).toEqual(
            Right(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))
        )
        expect(
            addOrResign(Right(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 }))), Right(TvShow({ title: "The Wire", start: 2002, end: 2008 })))
        ).toEqual(
            Right(List.of(
                TvShow({ title: "Chernobyl", start: 2019, end: 2019 }),
                TvShow({ title: "The Wire", start: 2002, end: 2008 })
            ))
        )
        expect(
            addOrResign(Left("something happened before Chernobyl"), Right(TvShow({ title: "Chernobyl", start: 2019, end: 2019 })))
        ).toEqual(
            Left("something happened before Chernobyl")
        )
        expect(addOrResign(Right(List.of(TvShow({ title: "Chernobyl", start: 2019, end: 2019 }))), Left("inconst id show"))).toEqual(Left("inconst id show"))
        expect(addOrResign(Left("hopeless"), Left("no hope"))).toEqual(Left("hopeless"))

        /** 
         * 
         * @param {List<string>} rawShows 
         */
        const parseShows = (rawShows) => {
            const initialResult = Right(List())
            return rawShows
                .map(parseShow)
                .reduce(addOrResign, initialResult)
        }

        expect(
            parseShows(List.of("Chernobyl (2019)", "Breaking Bad (2008-2013)")).map(map(prop('title')))
        ).toEqual(
            Right(List.of(
                "Chernobyl",
                "Breaking Bad"
            ))
        )
        expect(parseShows(List.of("Chernobyl [2019]", "Breaking Bad"))).toEqual(Left("Can't extract name from Chernobyl [2019]"))

        expect(parseShows(List.of("The Wire (2002-2008)", "[2019]"))).toEqual(Left("Can't extract name from [2019]"))
        expect(parseShows(List.of("The Wire (-)", "Chernobyl (2019)"))).toEqual(Left("Can't extract single year from The Wire (-)"))
        expect(parseShows(List.of("The Wire (2002-2008)", "Chernobyl (2019)"))).toEqual(Right(List.of(
            TvShow({ title: "The Wire", start: 2002, end: 2008 }),
            TvShow({ title: "Chernobyl", start: 2019, end: 2019 })
        )))
    }

    { // Working with Option and Either: Option
        const year = Some(996)
        const noYear = None()

        // map
        expect(year.map(multiply(2))).toEqual(Some(1992))
        expect(noYear.map(multiply(2))).toEqual(None())

        // flatten
        expect(Some(year).flatten()).toEqual(Some(996))
        expect(Some(noYear).flatten()).toEqual(None())

        // flatMap
        expect(year.flatMap(y => Some(y * 2))).toEqual(Some(1992))
        expect(noYear.flatMap(y => Some(y * 2))).toEqual(None())
        expect(year.flatMap(y => None())).toEqual(None())
        expect(noYear.flatMap(y => None())).toEqual(None())

        // alt
        expect(year.alt(Some(2020))).toEqual(Some(996))
        expect(noYear.alt(Some(2020))).toEqual(Some(2020))
        expect(year.alt(None())).toEqual(Some(996))
        expect(noYear.alt(None())).toEqual(None())

        // toRight
        expect(year.toRight("no year given")).toEqual(Right(996))
        expect(noYear.toRight("no year given")).toEqual(Left("no year given"))
    }

    { // Working with Option and Either: Either
        const year = Right(996)
        const noYear = Left("no year")

        // map
        expect(year.map(multiply(2))).toEqual(Right(1992))
        expect(noYear.map(multiply(2))).toEqual(Left("no year"))

        // flatten
        expect(Right(year).flatten()).toEqual(Right(996))
        expect(Right(noYear).flatten()).toEqual(Left("no year"))

        // flatMap
        expect(year.flatMap(y => Right(y * 2))).toEqual(Right(1992))
        expect(noYear.flatMap(y => Right(y * 2))).toEqual(Left("no year"))
        expect(year.flatMap(y => Left("can't progress"))).toEqual(Left("can't progress"))
        expect(noYear.flatMap(y => Left("can't progress"))).toEqual(Left("no year"))

        // alt
        expect(year.alt(Right(2020))).toEqual(Right(996))
        expect(noYear.alt(Right(2020))).toEqual(Right(2020))
        expect(year.alt(Left("can't recover"))).toEqual(Right(996))
        expect(noYear.alt(Left("can't recover"))).toEqual(Left("can't recover"))

        // toOption
        expect(year.toMaybe()).toEqual(Some(996))
        expect(noYear.toMaybe()).toEqual(None())
    }
})
