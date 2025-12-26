import { List, Record, Some, None, flip, gte, multiply, equals, prop, any, startsWith, pipe } from "../src/libs";

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
      List.of(Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003 }))
    )

    expect(searchArtists(artists, List(), List.of("England"), true, 1950, 2022)).toEqual(
      List.of(
        Artist({name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980}),
        Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003})
      ))

    expect(searchArtists(artists, List(), List(), true, 1981, 2003)).toEqual(
      List.of(
        Artist({name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0}),
        Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003})
      ))

    expect(searchArtists(artists, List(), List.of("U.S."), false, 0, 0)).toEqual(
      List.of(
        Artist({name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0})
      ))

    expect(searchArtists(artists, List(), List(), false, 2019, 2022)).toEqual(
      List.of(
        Artist({name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0}),
        Artist({name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980}),
        Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003})
      ))

    // additional cases:
    expect(searchArtists(artists, List(), List.of("U.S."), true, 1950, 1959)).toEqual( List())

    expect(searchArtists(artists, List(), List(), true, 1950, 1979)).toEqual(
      List.of(
        Artist({name: "Led Zeppelin", genre: "Hard Rock", origin: "England", yearsActiveStart: 1968, isActive: false, yearsActiveEnd: 1980}),
        Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003})
      ))

    expect(searchArtists(artists, List(), List(), true, 1950, 1959)).toEqual(
      List.of(
        Artist({name: "Bee Gees", genre: "Pop", origin: "England", yearsActiveStart: 1958, isActive: false, yearsActiveEnd: 2003})
      ))

    expect(searchArtists(artists, List.of("Heavy Metal"), List(), true, 2019, 2022)).toEqual(
      List.of(
        Artist({name: "Metallica", genre: "Heavy Metal", origin: "U.S.", yearsActiveStart: 1981, isActive: true, yearsActiveEnd: 0})
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
      Artist({name: "Metallica", genre: Genre("Heavy Metal"), origin: Location("U.S."), yearsActiveStart: YearsActiveStart(1981), isActive: true, yearsActiveEnd: YearsActiveEnd(0)}),
      Artist({name: "Led Zeppelin", genre: Genre("Hard Rock"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1968), isActive: false, yearsActiveEnd: YearsActiveEnd(1980)}),
      Artist({name: "Bee Gees", genre: Genre("Pop"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1958), isActive: false, yearsActiveEnd: YearsActiveEnd(2003)})
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
      List.of(Artist({name: "Bee Gees", genre: Genre("Pop"), origin: Location("England"), yearsActiveStart: YearsActiveStart(1958), isActive: false, yearsActiveEnd: YearsActiveEnd(2003)}))
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
      Artist({name: "Metallica", genre: "Heavy Metal", origin: Location("U.S."), yearsActiveStart: 1981, yearsActiveEnd: None()}),
      Artist({name: "Led Zeppelin", genre: "Hard Rock", origin: Location("England"), yearsActiveStart: 1968, yearsActiveEnd: Some(1980)}),
      Artist({name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActiveStart: 1958, yearsActiveEnd: Some(2003)})
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
      List.of(Artist({name: "Bee Gees", genre: "Pop", origin: Location("England"), yearsActiveStart: 1958, yearsActiveEnd: Some(2003)}))
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
      User({name: "Alice", city: Some("Melbourne"), favoriteArtists: List.of("Bee Gees")}),
      User({name: "Bob", city: Some("Lagos"), favoriteArtists: List.of("Bee Gees")}),
      User({name: "Eve", city: Some("Tokyo"), favoriteArtists: List()}),
      User({name: "Mallory", city: None(), favoriteArtists: List.of("Metallica", "Bee Gees")}),
      User({name: "Trent", city: Some("Buenos Aires"), favoriteArtists: List.of("Led Zeppelin")})
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
    const f6 = (users) => users.filter(pipe(prop("favoriteArtists"), x => x.toArray(), any(startsWith("M")))) // TODO: find a better way without toArray()

    expect(f6(users).map(prop("name"))).toEqual(List.of("Mallory"))
  }


  // // STEP 2b: new product type
  // object Version2b_Data {
  //   case class PeriodInYears(start: Int, end: Option[Int])

  //   case class Artist(
  //       name: String,
  //       genre: String,
  //       origin: Location,
  //       yearsActive: PeriodInYears
  //   )

  //   val artists = List.of(
  //     Artist("Metallica", "Heavy Metal", Location("U.S."), PeriodInYears(1981, None)),
  //     Artist("Led Zeppelin", "Hard Rock", Location("England"), PeriodInYears(1968, Some(1980))),
  //     Artist("Bee Gees", "Pop", Location("England"), PeriodInYears(1958, Some(2003)))
  //   )
  // }

  // object Version2b_Behavior {
  //   import Version2b_Data._

  //   def searchArtists(
  //       artists: List[Artist],
  //       genres: List[String],
  //       locations: List[String],
  //       searchByActiveYears: Boolean,
  //       activeAfter: Int,
  //       activeBefore: Int
  //   ): List[Artist] = artists.filter(artist =>
  //     (genres.isEmpty || genres.contains(artist.genre)) &&
  //       (locations.isEmpty || locations.contains(artist.origin.name)) &&
  //       (!searchByActiveYears ||
  //         artist.yearsActive.end.forall(_ >= activeAfter) && // <- using new product type (end)
  //         artist.yearsActive.start <= activeBefore) // <- using new product type (start)
  //   )
  // }

  // {
  //   import Version2b_Data._
  //   import Version2b_Behavior._

  //   assert(searchArtists(artists, List.of("Pop"), List.of("England"), true, 1950, 2022) ==
  //     List.of(Artist("Bee Gees", "Pop", Location("England"), PeriodInYears(1958, Some(2003)))))
  // }

  // // STEP 3: sum type
  // enum MusicGenre {
  //   case HeavyMetal
  //   case Pop
  //   case HardRock
  // }

  // import MusicGenre._

  // object Version3 {
  //   import Version2b_Data.PeriodInYears

  //   case class Artist(
  //       name: String,
  //       genre: MusicGenre,
  //       origin: Location,
  //       yearsActive: PeriodInYears
  //   )

  //   val artists = List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), PeriodInYears(1981, None)),
  //     Artist("Led Zeppelin", HardRock, Location("England"), PeriodInYears(1968, Some(1980))),
  //     Artist("Bee Gees", Pop, Location("England"), PeriodInYears(1958, Some(2003)))
  //   )

  //   def searchArtists(
  //       artists: List[Artist],
  //       genres: List[MusicGenre], // <- now we need to make sure only valid genres are searched for
  //       locations: List[String],
  //       searchByActiveYears: Boolean,
  //       activeAfter: Int,
  //       activeBefore: Int
  //   ): List[Artist] = artists.filter(artist =>
  //     (genres.isEmpty || genres.contains(artist.genre)) && // no change needed
  //       (locations.isEmpty || locations.contains(artist.origin.name)) &&
  //       (!searchByActiveYears ||
  //         artist.yearsActive.end.forall(_ >= activeAfter) &&
  //         artist.yearsActive.start <= activeBefore)
  //   )
  // }

  // {
  //   import Version2b_Data.PeriodInYears
  //   import Version3._

  //   assert(searchArtists(artists, List.of(Pop), List.of("England"), true, 1950, 2022) == List.of(Artist(
  //     "Bee Gees",
  //     Pop,
  //     Location("England"),
  //     PeriodInYears(1958, Some(2003))
  //   )))
  // }

  // // STEP 4: Algebraic Data Type (ADT) = product type + sum type
  // enum YearsActive {
  //   case StillActive(since: Int)
  //   case ActiveBetween(start: Int, end: Int)
  // }

  // import YearsActive._

  // object Version4_Data {
  //   case class Artist(name: String, genre: MusicGenre, origin: Location, yearsActive: YearsActive)

  //   val artists = List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(since = 1981)),
  //     Artist("Led Zeppelin", HardRock, Location("England"), ActiveBetween(1968, 1980)),
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   )
  // }

  // object Version4_Behavior {
  //   import Version4_Data._

  //   def wasArtistActive(artist: Artist, yearStart: Int, yearEnd: Int): Boolean = artist.yearsActive match {
  //     case StillActive(since)        => since <= yearEnd
  //     case ActiveBetween(start, end) => start <= yearEnd && end >= yearStart
  //   }

  //   def searchArtists(
  //       artists: List[Artist],
  //       genres: List[MusicGenre],
  //       locations: List[Location],
  //       searchByActiveYears: Boolean,
  //       activeAfter: Int,
  //       activeBefore: Int
  //   ): List[Artist] = artists.filter(artist =>
  //     (genres.isEmpty || genres.contains(artist.genre)) &&
  //       (locations.isEmpty || locations.contains(artist.origin)) &&
  //       (!searchByActiveYears || wasArtistActive(artist, activeAfter, activeBefore))
  //   )
  // }

  // {
  //   import Version4_Data._
  //   import Version4_Behavior._

  //   assert(searchArtists(artists, List.of(Pop), List.of(Location("England")), true, 1950, 2022) == List.of(
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))
  // }

  // { // Practicing pattern matching
  //   import Version4_Data._

  //   def activeLength(artist: Artist, currentYear: Int): Int = artist.yearsActive match {
  //     case StillActive(since)        => currentYear - since
  //     case ActiveBetween(start, end) => end - start
  //   }

  //   expect(activeLength(Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981)), 2022)).toEqual(41)
  //   expect(activeLength(Artist("Led Zeppelin", HardRock, Location("England"), ActiveBetween(1968, 1980)), 2022)).toEqual(12)
  //   expect(activeLength(Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003)), 2022)).toEqual(45)
  // }

  // { // STEP 5: modeling behaviors
  //   import Version4_Data._
  //   import Version4_Behavior.wasArtistActive

  //   // Modeling conditions as ADTs:
  //   enum SearchCondition {
  //     case SearchByGenre(genres: List[MusicGenre])
  //     case SearchByOrigin(locations: List[Location])
  //     case SearchByActiveYears(start: Int, end: Int)
  //   }

  //   import SearchCondition._

  //   def searchArtists(
  //       artists: List[Artist],
  //       requiredConditions: List[SearchCondition]
  //   ): List[Artist] = artists.filter(artist =>
  //     requiredConditions.forall(condition =>
  //       condition match {
  //         case SearchByGenre(genres)           => genres.contains(artist.genre)
  //         case SearchByOrigin(locations)       => locations.contains(artist.origin)
  //         case SearchByActiveYears(start, end) => wasArtistActive(artist, start, end)
  //       }
  //     )
  //   )

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByGenre(List.of(Pop)),
  //       SearchByOrigin(List.of(Location("England"))),
  //       SearchByActiveYears(1950, 2022)
  //     )
  //   ) == List.of(
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByActiveYears(1950, 2022)
  //     )
  //   ) == List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(since = 1981)),
  //     Artist("Led Zeppelin", HardRock, Location("England"), ActiveBetween(1968, 1980)),
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByGenre(List.of(Pop)),
  //       SearchByOrigin(List.of(Location("England")))
  //     )
  //   ) == List.of(
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))

  //   expect(searchArtists(artists, List())).toEqual(artists)

  //   // additional examples:
  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByActiveYears(1983, 2003)
  //     )
  //   ) == List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(since = 1981)),
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByGenre(List.of(HeavyMetal)),
  //       SearchByActiveYears(2019, 2022)
  //     )
  //   ) == List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(since = 1981))
  //   ))

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByActiveYears(1950, 1959)
  //     )
  //   ) == List.of(
  //     Artist("Bee Gees", Pop, Location("England"), ActiveBetween(1958, 2003))
  //   ))

  //   assert(searchArtists(
  //     artists,
  //     List.of(
  //       SearchByOrigin(List.of(Location("U.S."))),
  //       SearchByActiveYears(1950, 1959)
  //     )
  //   ) == List())
  // }

  // // NEW REQUIREMENTS:
  // {
  //   case class PeriodInYears(start: Int, end: Int)

  //   enum YearsActive {
  //     case StillActive(since: Int, previousPeriods: List[PeriodInYears])
  //     case ActiveInPast(periods: List[PeriodInYears])
  //   }

  //   case class Artist(name: String, genre: MusicGenre, origin: Location, yearsActive: YearsActive)

  //   enum SearchCondition {
  //     case SearchByGenre(genres: List[MusicGenre])
  //     case SearchByOrigin(locations: List[Location])
  //     case SearchByActiveYears(period: PeriodInYears)
  //     case SearchByActiveLength(howLong: Int, until: Int)
  //   }

  //   import SearchCondition._, YearsActive._

  //   def periodOverlapsWithPeriods(checkedPeriod: PeriodInYears, periods: List[PeriodInYears]): Boolean =
  //     periods.exists(p => p.start <= checkedPeriod.end && p.end >= checkedPeriod.start)

  //   def wasArtistActive(artist: Artist, searchedPeriod: PeriodInYears): Boolean = artist.yearsActive match {
  //     case StillActive(since, previousPeriods) =>
  //       since <= searchedPeriod.end || periodOverlapsWithPeriods(searchedPeriod, previousPeriods)
  //     case ActiveInPast(periods)               => periodOverlapsWithPeriods(searchedPeriod, periods)
  //   }

  //   def activeLength(artist: Artist, currentYear: Int): Int = {
  //     val periods = artist.yearsActive match {
  //       case StillActive(since, previousPeriods) => previousPeriods.appended(PeriodInYears(since, currentYear))
  //       case ActiveInPast(periods)               => periods
  //     }
  //     periods.map(p => p.end - p.start).foldLeft(0)((x, y) => x + y)
  //   }

  //   def searchArtists(artists: List[Artist], requiredConditions: List[SearchCondition]): List[Artist] = artists.filter(
  //     artist =>
  //       requiredConditions.forall(condition =>
  //         condition match {
  //           case SearchByGenre(genres)                => genres.contains(artist.genre)
  //           case SearchByOrigin(locations)            => locations.contains(artist.origin)
  //           case SearchByActiveYears(period)          => wasArtistActive(artist, period)
  //           case SearchByActiveLength(howLong, until) => activeLength(artist, until) >= howLong
  //         }
  //       )
  //   )

  //   val artists = List.of(
  //     Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List())),
  //     Artist("Led Zeppelin", HardRock, Location("England"), ActiveInPast(List.of(PeriodInYears(1968, 1980)))),
  //     Artist(
  //       "Bee Gees",
  //       Pop,
  //       Location("England"),
  //       ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByGenre(List.of(Pop)),
  //         SearchByOrigin(List.of(Location("England"))),
  //         SearchByActiveYears(PeriodInYears(1950, 2022))
  //       )
  //     ) == List.of(
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByOrigin(List.of(Location("England"))),
  //         SearchByActiveYears(PeriodInYears(1950, 2022))
  //       )
  //     ) == List.of(
  //       Artist("Led Zeppelin", HardRock, Location("England"), ActiveInPast(List.of(PeriodInYears(1968, 1980)))),
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveYears(PeriodInYears(1950, 2022))
  //       )
  //     ) == List.of(
  //       Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List())),
  //       Artist("Led Zeppelin", HardRock, Location("England"), ActiveInPast(List.of(PeriodInYears(1968, 1980)))),
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveYears(PeriodInYears(1983, 2003))
  //       )
  //     ) == List.of(
  //       Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List())),
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveYears(PeriodInYears(2019, 2022))
  //       )
  //     ) == List.of(
  //       Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List()))
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveYears(PeriodInYears(1950, 1959))
  //       )
  //     ) == List.of(
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveLength(48, 2022)
  //       )
  //     ) == List.of(
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByActiveLength(48, 2022)
  //       )
  //     ) == List.of(
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByOrigin(List.of(Location("U.S."))),
  //         SearchByActiveLength(48, 2022)
  //       )
  //     ) == List()
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByOrigin(List.of(Location("U.S."))),
  //         SearchByActiveLength(40, 2022)
  //       )
  //     ) == List.of(Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List())))
  //   )

  //   assert(
  //     searchArtists(
  //       artists,
  //       List.of(
  //         SearchByOrigin(List.of(Location("U.S."), Location("England"))),
  //         SearchByActiveLength(40, 2022)
  //       )
  //     ) == List.of(
  //       Artist("Metallica", HeavyMetal, Location("U.S."), StillActive(1981, List())),
  //       Artist(
  //         "Bee Gees",
  //         Pop,
  //         Location("England"),
  //         ActiveInPast(List.of(PeriodInYears(1958, 2003), PeriodInYears(2009, 2012)))
  //       )
  //     )
  //   )
  // }
});
