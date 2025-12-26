import { List, Record, UnionType, Show, Eq, Ord, Hash, Some, None, flip, gte, multiply, equals, prop, startsWith } from "../src/libs";

describe('ch07_MusicArtistsSearch', () => {
  // STEP 0: Design using what we know (primitive types)
  test('Version0', () => {
    const Artist = Record({
      name: '',
      genre: '',
      origin: '',
      yearsActiveStart: 0,
      isActive: false,
      yearsActiveEnd: 0
    });

    const artists = List.of(
      Artist({ name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0 }),
      Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980 }),
      Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
    )

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<string>} genres 
     * @param {List<string>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore,
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre)) &&
      (locations.isEmpty() || locations.contains(artist.origin)) &&
      (!searchByActiveYears || (artist.isActive || artist.yearsActiveEnd >= activeAfter) &&
        artist.yearsActiveStart <= activeBefore)
    )

    // coffee break cases:
    expect(searchArtists(artists, List.of("Pop"), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 }))
    )

    expect(searchArtists(artists, List(), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(
        Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980 }),
        Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
      ))

    expect(searchArtists(artists, List(), List(), true, 1981, 2003)).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0 }),
        Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
      ))

    expect(searchArtists(artists, List(), List.of("U.S."), false, 0, 0)).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0 })
      ))

    expect(searchArtists(artists, List(), List(), false, 2019, 2022)).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0 }),
        Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980 }),
        Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
      ))

    // additional cases:
    expect(searchArtists(artists, List(), List.of("U.S."), true, 1950, 1959)).toEqual(List())

    expect(searchArtists(artists, List(), List(), true, 1950, 1979)).toEqual(
      List.of(
        Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980 }),
        Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
      ))

    expect(searchArtists(artists, List(), List(), true, 1950, 1959)).toEqual(
      List.of(
        Artist({ name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 })
      ))

    expect(searchArtists(artists, List.of("Heavy Metal"), List(), true, 2019, 2022)).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0 })
      ))
  });

  // STEP 1: newtypes
  function Location(value) {
    const _value = new String(value);
    _value.name = value;
    return _value;
  }

  function Genre(value) {
    const _value = new String(value);
    _value.name = value;
    return _value;
  }

  function YearsActiveStart(value) {
    const _value = new Number(value);
    _value.value = value;
    return _value;
  }

  function YearsActiveEnd(value) {
    const _value = new Number(value);
    _value.value = value;
    return _value;
  }

  // val us: Location = Location("U.S.")

  test('Version1', () => {
    const Artist = Record({
      name: '',
      genre: Genre(''),
      origin: Location(''),
      yearsActiveStart: YearsActiveStart(0),
      isActive: Boolean,
      yearsActiveEnd: YearsActiveEnd(0)
    });

    const artists = List.of(
      Artist({ name: "Metallica", genre: Genre("Heavy Metal"), origin: Location("U.S."), yearsActiveStart: YearsActiveStart(1981), isActive: true, yearsActiveEnd: YearsActiveEnd(0) }),
      Artist({ name: "Led Zeppelin", genre: Genre("Hard Rock"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1968), isActive: false, yearsActiveEnd: YearsActiveEnd(1980) }),
      Artist({ name: "Bee Gees", genre: Genre("Pop"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1958), isActive: false, yearsActiveEnd: YearsActiveEnd(2003) })
    )

    /**
     * @param {List<Artist>} artists 
     * @param {List<string>} genres 
     * @param {List<string>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore,
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre.name)) &&              // <- using Genre
      (locations.isEmpty() || locations
        .contains(artist.origin.name)) &&                                  // <- using Location
      (!searchByActiveYears ||
        (artist.isActive || artist.yearsActiveEnd.value >= activeAfter) && // <- using YearsActiveEnd
        artist.yearsActiveStart.value <= activeBefore) // <- using YearsActiveStart
    )

    expect(searchArtists(artists, List.of("Pop"), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(Artist({ name: "Bee Gees", genre: Genre("Pop"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1958), isActive: false, yearsActiveEnd: YearsActiveEnd(2003) }))
    );
  });

  // STEP 2a: Option type (reverted all newtypes except of origin, because we'll make them better)
  test('Version2a', () => {
    const Artist = Record({
      name: '',
      genre: '',
      origin: Location(''),
      yearsActiveStart: 0,
      yearsActiveEnd: None(),
    });

    const artists = List.of(
      Artist({ name: "Metallica", genre: "Heavy Metal", origin: Location("U.S."), yearsActiveStart: 1981, yearsActiveEnd: None() }),
      Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: Location("England"), yearsActiveStart: 1968, yearsActiveEnd: Some(1980) }),
      Artist({ name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActiveStart: 1958, yearsActiveEnd: Some(2003) })
    )

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<string>} genres 
     * @param {List<string>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore,
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre)) &&
      (locations.isEmpty() || locations.contains(artist.origin.name)) &&
      (!searchByActiveYears ||
        artist.yearsActiveEnd.forall(flip(gte)(activeAfter)) && // <- using Option.forall. TODO: ramda's gte makes it confusing here
        artist.yearsActiveStart <= activeBefore)
    )

    expect(searchArtists(artists, List.of("Pop"), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(Artist({ name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActiveStart: 1958, yearsActiveEnd: Some(2003) }))
    );
  });

  { // Option higher-order functions (see TvShows as well)
    const year = Some(996)
    const noYear = None()

    // map
    expect(year.map(multiply(2))).toEqual(Some(1992))
    expect(noYear.map(multiply(2))).toEqual(None())

    // flatMap
    expect(year.flatMap(y => Some(y * 2))).toEqual(Some(1992))
    expect(noYear.flatMap(y => Some(y * 2))).toEqual(None())
    expect(year.flatMap(y => None())).toEqual(None())
    expect(noYear.flatMap(y => None())).toEqual(None())

    // filter
    expect(year.filter(x => x < 2020)).toEqual(Some(996))
    expect(noYear.filter(x => x < 2020)).toEqual(None())
    expect(year.filter(x => x > 2020)).toEqual(None())
    expect(noYear.filter(x => x > 2020)).toEqual(None())

    // forall
    expect(year.forall(x => x < 2020)).toEqual(true)
    expect(noYear.forall(x => x < 2020)).toEqual(true)
    expect(year.forall(x => x > 2020)).toEqual(false)
    expect(noYear.forall(x => x > 2020)).toEqual(true)

    // exists
    expect(year.exists(x => x < 2020)).toEqual(true)
    expect(noYear.exists(x => x < 2020)).toEqual(false)
    expect(year.exists(x => x > 2020)).toEqual(false)
    expect(noYear.exists(x => x > 2020)).toEqual(false)
  }

  { // Coffee Break: forall/exists/contains
    const User = Record({
      name: '',
      city: Some(''),
      favoriteArtists: List()
    })

    const users = List.of(
      User({ name: "Alice", city: Some("Melbourne"), favoriteArtists: List.of("Bee Gees") }),
      User({ name: "Bob", city: Some("Lagos"), favoriteArtists: List.of("Bee Gees") }),
      User({ name: "Eve", city: Some("Tokyo"), favoriteArtists: List() }),
      User({ name: "Mallory", city: None(), favoriteArtists: List.of("Metallica", "Bee Gees") }),
      User({ name: "Trent", city: Some("Buenos Aires"), favoriteArtists: List.of("Led Zeppelin") })
    )

    // 1. users that haven't specified their city or live in Melbourne
    /**
     * 
     * @param {List<User>} users 
     */
    const f1 = (users) => users.filter(x => x.city.forall(equals("Melbourne")))

    expect(f1(users).map(prop("name"))).toEqual(List.of("Alice", "Mallory"))

    // 2. users that live in Lagos
    /**
     * 
     * @param {List<User>} users 
     */
    const f2 = (users) => users.filter(x => x.city.contains("Lagos"))

    expect(f2(users).map(prop("name"))).toEqual(List.of("Bob"))

    // 3. users that like Bee Gees
    /**
     * 
     * @param {List<User>} users 
     */
    const f3 = (users) => users.filter(x => x.favoriteArtists.contains("Bee Gees"))

    expect(f3(users).map(prop("name"))).toEqual(List.of("Alice", "Bob", "Mallory"))

    // 4. users that live in cities that start with a letter T
    /**
     * 
     * @param {List<User>} users 
     */
    const f4 = (users) => users.filter(x => x.city.exists(x => x.startsWith("T")))

    expect(f4(users).map(prop("name"))).toEqual(List.of("Eve"))

    // 5. users that only like artists that have a name longer than 8 characters (or no favorite artists at all)
    /**
     * 
     * @param {List<User>} users 
     */
    const f5 = (users) => users.filter(x => x.favoriteArtists.every(x => x.length > 8))

    // 6. users that like some artists whose names start with M
    /**
     * 
     * @param {List<User>} users 
     */
    const f6 = (users) => users.filter(x => x.favoriteArtists.exists(startsWith("M")))

    expect(f6(users).map(prop("name"))).toEqual(List.of("Mallory"))
  }

  // STEP 2b: new product type
  const PeriodInYears = Record({
    start: 0,
    end: None(),
  })

  test('Version2b_Data', () => {
    const Artist = Record({
      name: '',
      genre: '',
      origin: Location(''),
      yearsActive: PeriodInYears()
    })

    const artists = List.of(
      Artist({ name: "Metallica", genre: "Heavy Metal", origin: Location("U.S."), yearsActive: PeriodInYears({ start: 1981, end: None() }) }),
      Artist({ name: "Led Zeppelin", genre: "Hard Rock", origin: Location("England"), yearsActive: PeriodInYears({ start: 1968, end: Some(1980) }) }),
      Artist({ name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActive: PeriodInYears({ start: 1958, end: Some(2003) }) })
    )

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<string>} genres 
     * @param {List<string>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore,
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre)) &&
      (locations.isEmpty() || locations.contains(artist.origin.name)) &&
      (!searchByActiveYears ||
        artist.yearsActive.end.forall(flip(gte)(activeAfter)) && // <- using new product type (end)
        artist.yearsActive.start <= activeBefore) // <- using new product type (start)
    )

    expect(searchArtists(artists, List.of("Pop"), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(Artist({ name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActive: PeriodInYears({ start: 1958, end: Some(2003) }) }))
    );
  });

  // STEP 3: sum type
  const MusicGenre = UnionType('MusicGenre', {
    HeavyMetal: [],
    Pop: [],
    HardRock: [],
  }).deriving(Show, Eq, Ord, Hash);
  const { HeavyMetal, Pop, HardRock } = MusicGenre;

  test('Version3', () => {
    const Artist = Record({
      name: '',
      genre: HeavyMetal(),
      origin: Location(),
      yearsActive: PeriodInYears(),
    })

    const artists = List.of(
      Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: PeriodInYears({ start: 1981, end: None() }) }),
      Artist({ name: "Led Zeppelin", genre: HardRock(), origin: Location("England"), yearsActive: PeriodInYears({ start: 1968, end: Some(1980) }) }),
      Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: PeriodInYears({ start: 1958, end: Some(2003) }) })
    )

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<MusicGenre>} genres 
     * @param {List<string>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore,
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre)) && // no change needed
      (locations.isEmpty() || locations.contains(artist.origin.name)) &&
      (!searchByActiveYears ||
        artist.yearsActive.end.forall(flip(gte)(activeAfter)) &&
        artist.yearsActive.start <= activeBefore)
    )

    expect(searchArtists(artists, List.of(Pop()), List.of(Location("England")), true, 1950, 2022)).toEqual(
      List.of(Artist({
        name: "Bee Gees",
        genre: Pop(),
        origin: Location("England"),
        yearsActive: PeriodInYears({ start: 1958, end: Some(2003) })
      })))
  });

  // STEP 4: Algebraic Data Type (ADT) = product type + sum type
  const YearsActive = UnionType('YearsActive', {
    StillActive: ['since'],
    ActiveBetween: ['start', 'end']
  }).deriving(Show, Eq, Ord, Hash);
  const { StillActive, ActiveBetween } = YearsActive;

  const Artist = Record({
    name: '',
    genre: HeavyMetal(),
    origin: Location(),
    yearsActive: StillActive(),
  });

  const artists = List.of(
    Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981 }) }),
    Artist({ name: "Led Zeppelin", genre: HardRock(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1968, end: 1980 }) }),
    Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
  )

  const wasArtistActive = (artist, yearStart, yearEnd) => artist.yearsActive.caseOf({
    StillActive: ({ since }) => since <= yearEnd,
    ActiveBetween: ({ start, end }) => start <= yearEnd && end >= yearStart
  })

  test('Version4_Data', () => {
    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<MusicGenre>} genres 
     * @param {List<Location>} locations 
     * @param {boolean} searchByActiveYears 
     * @param {number} activeAfter 
     * @param {number} activeBefore 
     */
    const searchArtists = (
      artists,
      genres,
      locations,
      searchByActiveYears,
      activeAfter,
      activeBefore
    ) => artists.filter(artist =>
      (genres.isEmpty() || genres.contains(artist.genre)) &&
      (locations.isEmpty() || locations.contains(artist.origin)) &&
      (!searchByActiveYears || wasArtistActive(artist, activeAfter, activeBefore))
    )

    expect(searchArtists(artists, List.of(Pop()), List.of(Location("England")), true, 1950, 2022)).toEqual(
      List.of(Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) }))
    );

    // Practicing pattern matching
    const activeLength = (artist, currentYear) => artist.yearsActive.caseOf({
      StillActive: ({ since }) => currentYear - since,
      ActiveBetween: ({ start, end }) => end - start
    })

    expect(activeLength(Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981 }) }), 2022)).toEqual(41)
    expect(activeLength(Artist({ name: "Led Zeppelin", genre: HardRock(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1968, end: 1980 }) }), 2022)).toEqual(12)
    expect(activeLength(Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) }), 2022)).toEqual(45)
  });

  test('Case5', () => { // STEP 5: modeling behaviors
    // Modeling conditions as ADTs:
    const SearchCondition = UnionType('SearchCondition', {
      SearchByGenre: ['genres'],
      SearchByOrigin: ['locations'],
      SearchByActiveYears: ['start', 'end']
    }).deriving(Show, Eq, Ord, Hash);
    const { SearchByGenre, SearchByOrigin, SearchByActiveYears } = SearchCondition;

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<SearchCondition>} requiredConditions 
     */
    const searchArtists = (
      artists,
      requiredConditions,
    ) => artists.filter(artist =>
      requiredConditions.every(condition =>
        condition.caseOf({
          SearchByGenre: ({ genres }) => genres.contains(artist.genre),
          SearchByOrigin: ({ locations }) => locations.contains(artist.origin),
          SearchByActiveYears: ({ start, end }) => wasArtistActive(artist, start, end)
        })
      )
    )

    expect(searchArtists(
      artists,
      List.of(
        SearchByGenre({ genres: List.of(Pop()) }),
        SearchByOrigin({ locations: List.of(Location("England")) }),
        SearchByActiveYears({ start: 1950, end: 2022 })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
      )
    )

    expect(searchArtists(
      artists,
      List.of(
        SearchByActiveYears({ start: 1950, end: 2022 })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981 }) }),
        Artist({ name: "Led Zeppelin", genre: HardRock(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1968, end: 1980 }) }),
        Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
      )
    )
    expect(searchArtists(
      artists,
      List.of(
        SearchByGenre({ genres: List.of(Pop()) }),
        SearchByOrigin({ locations: List.of(Location("England")) })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
      )
    )

    expect(searchArtists(artists, List())).toEqual(artists)

    // additional examples:
    expect(searchArtists(
      artists,
      List.of(
        SearchByActiveYears({ start: 1983, end: 2003 })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981 }) }),
        Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
      )
    )

    expect(searchArtists(
      artists,
      List.of(
        SearchByGenre({ genres: List.of(HeavyMetal()) }),
        SearchByActiveYears({ start: 2019, end: 2022 })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981 }) })
      )
    )

    expect(searchArtists(
      artists,
      List.of(
        SearchByActiveYears({ start: 1950, end: 1959 })
      )
    )).toEqual(
      List.of(
        Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveBetween({ start: 1958, end: 2003 }) })
      )
    )

    expect(searchArtists(
      artists,
      List.of(
        SearchByOrigin({ locations: List.of(Location("U.S.")) }),
        SearchByActiveYears({ start: 1950, end: 1959 })
      )
    )).toEqual(List())
  });

  test('NEW REQUIREMENTS', () => {
    const PeriodInYears = Record({ start: 0, end: 0 })

    const YearsActive = UnionType('YearsActive', {
      StillActive: ['since', 'previousPeriods]'],
      ActiveInPast: ['periods]']
    }).deriving(Show, Eq, Ord, Hash)
    const { StillActive, ActiveInPast } = YearsActive;

    const Artist = Record({
      name: '',
      genre: HeavyMetal(),
      origin: Location(),
      yearsActive: StillActive(),
    });

    const SearchCondition = UnionType('SearchCondition', {
      SearchByGenre: ['genres'],
      SearchByOrigin: ['locations'],
      SearchByActiveYears: ['period'],
      SearchByActiveLength: ['howLong', 'until']
    }).deriving(Show, Eq, Ord, Hash);
    const { SearchByGenre, SearchByOrigin, SearchByActiveYears, SearchByActiveLength } = SearchCondition;

    /**
     * 
     * @param {PeriodInYears} checkedPeriod 
     * @param {List<PeriodInYears>} periods 
     */
    const periodOverlapsWithPeriods = (checkedPeriod, periods) =>
      periods.exists(p => p.start <= checkedPeriod.end && p.end >= checkedPeriod.start)

    /**
     * 
     * @param {Artist} artist 
     * @param {PeriodInYears} searchedPeriod 
     */
    const wasArtistActive = (artist, searchedPeriod) => artist.yearsActive.caseOf({
      StillActive: ({ since, previousPeriods }) =>
        since <= searchedPeriod.end || periodOverlapsWithPeriods(searchedPeriod, previousPeriods),
      ActiveInPast: ({ periods }) => periodOverlapsWithPeriods(searchedPeriod, periods)
    })

    /**
     * 
     * @param {Artist} artist 
     * @param {number} currentYear 
     */
    const activeLength = (artist, currentYear) => {
      const periods = artist.yearsActive.caseOf({
        StillActive: ({ since, previousPeriods }) => previousPeriods.push(PeriodInYears({ start: since, end: currentYear })),
        ActiveInPast: ({ periods }) => periods
      })
      return periods.map(p => p.end - p.start).reduce((x, y) => x + y, 0)
    }

    /**
     * 
     * @param {List<Artist>} artists 
     * @param {List<SearchCondition>} requiredConditions 
     */
    const searchArtists = (artists, requiredConditions) => artists.filter(
      artist =>
        requiredConditions.every(condition =>
          condition.caseOf({
            SearchByGenre: ({ genres }) => genres.contains(artist.genre),
            SearchByOrigin: ({ locations }) => locations.contains(artist.origin),
            SearchByActiveYears: ({ period }) => wasArtistActive(artist, period),
            SearchByActiveLength: ({ howLong, until }) => activeLength(artist, until) >= howLong
          })
        )
    )

    const artists = List.of(
      Artist({
        name: "Metallica",
        genre: HeavyMetal(),
        origin: Location("U.S."),
        yearsActive: StillActive({ since: 1981, previousPeriods: List() })
      }),
      Artist({
        name: "Led Zeppelin",
        genre: HardRock(),
        origin: Location("England"),
        yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1968, end: 1980 })) })
      }),
      Artist({
        name: "Bee Gees",
        genre: Pop(),
        origin: Location("England"),
        yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
      })
    );

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByGenre({ genres: List.of(Pop()) }),
          SearchByOrigin({ locations: List.of(Location("England")) }),
          SearchByActiveYears({ period: PeriodInYears({ start: 1950, end: 2022 }) })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByOrigin({ locations: List.of(Location("England")) }),
          SearchByActiveYears({ period: PeriodInYears({ start: 1950, end: 2022 }) })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Led Zeppelin",
          genre: HardRock(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1968, end: 1980 })) })
        }),
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveYears({ period: PeriodInYears({ start: 1950, end: 2022 }) })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Metallica",
          genre: HeavyMetal(),
          origin: Location("U.S."),
          yearsActive: StillActive({ since: 1981, previousPeriods: List() })
        }),
        Artist({
          name: "Led Zeppelin",
          genre: HardRock(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1968, end: 1980 })) })
        }),
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveYears({ period: PeriodInYears({ start: 1983, end: 2003 }) })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Metallica",
          genre: HeavyMetal(),
          origin: Location("U.S."),
          yearsActive: StillActive({ since: 1981, previousPeriods: List() })
        }),
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveYears({ period: PeriodInYears({ start: 2019, end: 2022 }) })
        )
      )
    ).toEqual(
      List.of(
        Artist({ name: "Metallica", genre: HeavyMetal(), origin: Location("U.S."), yearsActive: StillActive({ since: 1981, previousPeriods: List() }) })
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveYears({ period: PeriodInYears({ start: 1950, end: 1959 }) })
        )
      )).toEqual(
        List.of(
          Artist({ name: "Bee Gees", genre: Pop(), origin: Location("England"), yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) }) })
        )
      )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveLength({ howLong: 48, until: 2022 })
        )
      )
    ).toEqual(List.of(
      Artist({
        name: "Bee Gees",
        genre: Pop(),
        origin: Location("England"),
        yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
      })
    ));

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByActiveLength({ howLong: 48, until: 2022 })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    );

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByOrigin({ locations: List.of(Location("U.S.")) }),
          SearchByActiveLength({ length: 48, year: 2022 })
        )
      )
    ).toEqual(List())

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByOrigin({ locations: List.of(Location("U.S.")) }),
          SearchByActiveLength({ howLong: 40, until: 2022 })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Metallica",
          genre: HeavyMetal(),
          origin: Location("U.S."),
          yearsActive: StillActive({ since: 1981, previousPeriods: List() })
        }),
      )
    )

    expect(
      searchArtists(
        artists,
        List.of(
          SearchByOrigin({ locations: List.of(Location("U.S."), Location("England")) }),
          SearchByActiveLength({ howLong: 40, until: 2022 })
        )
      )
    ).toEqual(
      List.of(
        Artist({
          name: "Metallica",
          genre: HeavyMetal(),
          origin: Location("U.S."),
          yearsActive: StillActive({ since: 1981, previousPeriods: List() })
        }),
        Artist({
          name: "Bee Gees",
          genre: Pop(),
          origin: Location("England"),
          yearsActive: ActiveInPast({ periods: List.of(PeriodInYears({ start: 1958, end: 2003 }), PeriodInYears({ start: 2009, end: 2012 })) })
        })
      )
    )
  });
});
