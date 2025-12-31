import { List, Set, Map, Record, UnionType, Show, Eq, Ord } from "../src/libs";

test('chA_ScalaCheatSheet', () => {
  // defining a value
  const x    = 2022
  const y = "YYY"
  const z         = true

  // defining a function
  const f = (a) => a + 1
  
  /**
   * 
   * @param {number} a 
   * @param {string} b 
   */
  const g = (a, b) => a == b.length && z

  // calling a function
  expect(f(x)).toEqual(2023)
  expect(g(x, y)).toEqual(false)

  // creating immutable collections (e.g. Lists)
  const list  = List.of(1, 2, 3)
  const set = Set.of("Hello", "World")

  // passing function by name
  expect(list.map(f)).toEqual(List.of(2, 3, 4))

  // passing an anonymous function
  expect(list.filter(i => i > 1)).toEqual(List.of(2, 3)) // double-arrow syntax for anonymous functions

  // passing an anonymous 2-parameter function
  // higher-order functions (ch4): e.g. foldLeft
  // - anonymous function with two parameters ch4
  expect(list.reduce((sum, i) => sum + i, 2020)).toEqual(2026)

  // multiple parameter lists (currying) ch4
  /**
   * 
   * @param {number} a 
   * @returns {(b: List<number>) => boolean}
   */
  const h = (a) => (b) => b.contains(a)

  const foo = h(2020)

  // Math:
  // - Int.MinValue ch4
  // - Math.max ch4
  expect(Math.max(Number.MIN_VALUE, 2022)).toEqual(2022)

  // case class (product type) ch4
  const Book = Record({ title: '', numberOfChapters: 0 });
  const grokkingFp = Book({ title: "Grokking Functional Programming", numberOfChapters: 12 })

  // the dot syntax ch4
  const books = List.of(grokkingFp, Book({ title: "Ferdydurke", numberOfChapters: 14 }))
  expect(books.filter(book => book.numberOfChapters > 13)).toEqual(List.of(Book({ title: "Ferdydurke", numberOfChapters: 14 })))
  // the underscore syntax ch4
  expect(books.filter(_ => _.numberOfChapters > 13)).toEqual(List.of(Book({title: "Ferdydurke", numberOfChapters: 14})))

  // missing implementation: ??? ch5
  // def isThisBookAnyGood(book: Book) = ???

  // string interpolation ch5
  expect(`Reading ${grokkingFp.title} now!`).toEqual("Reading Grokking Functional Programming now!")

  // passing multi-line functions as arguments ch5
  expect(
    books.map(book =>
       (book.numberOfChapters > 12) ? `${book.title} is a long book`
      : `${book.title} is a short book`
    )
  ).toEqual(
    List.of("Grokking Functional Programming is a short book", "Ferdydurke is a long book")
  )

  // type inference and empty list of ints ch5
  // const emptyList1            = List[Int] // or:
  // const emptyList2: List[Int] = List

  // type inference and helping the compiler set the type of List ch5
  // const listOfDoubles1               = List[Double](1, 2, 3)
  // const listOfDoubles2: List[Double] = List.of(1, 2, 3)

  // for comprehension ch5
  // assert((for {
  //   i    <- List.of(1, 2)
  //   book <- books
  // } yield s"Person #$i read ${book.title}") == List.of(
  //   "Person #1 read Grokking Functional Programming",
  //   "Person #1 read Ferdydurke",
  //   "Person #2 read Grokking Functional Programming",
  //   "Person #2 read Ferdydurke"
  // ))

  // objects as modules, objects as "bags" for types and functions, importing
  // object things {
  //   case class Thing(value: Int, description: String)
  //   def inflate(thing: Thing): Thing = thing.copy(value = thing.value + 2030)
  // }
  // expect(things.inflate(things.Thing(3, "Just a thing"))).toEqual(things.Thing(2033, "Just a thing"))

  // opaque type (newtype)
  // object model {
  //   opaque type BookRating = Int

  //   object BookRating {
  //     // creating new value
  //     def apply(rawRating: Int): BookRating    = Math.max(0, Math.min(5, rawRating))
  //     // extension functions
  //     extension (a: BookRating) def value: Int = a
  //   }
  // }
  function BookRating(rawRating) {
    const value = Math.max(0, Math.min(5, rawRating));
    return {
      value
    }
  }

  // importing everything from an object, import wildcard
  // import model._

  // creating and using a value of an opaque type
  const rating = BookRating(5)
  // rating / 2
  // Error: rating / 2 value / is not a member of model.BookRating
  const i             = rating.value / 2
  expect(i).toEqual(2.5)

  // sum with case objects (singletons), with product types (ADTs)
  const BookProgress = UnionType("BookProgress", {
     'ToRead': [],
     'Reading': ['currentChapter'],
     'Finished': ['rating'],
  }).deriving(Show, Eq, Ord);
  const { ToRead, Reading, Finished } = BookProgress;

  // pattern matching
  /**
   * 
   * @param {Book} book 
   * @param {BookProgress} bookProgress 
   */
  const bookProgressUpdate = (book, bookProgress) =>
    bookProgress.caseOf({
      ToRead:     ()             => `I want to read ${book.title}`,
      Finished: (rating)        => `I just finished ${book.title}! It's ${rating}/5!`,
      Reading: (currentChapter) =>
        (currentChapter <= book.numberOfChapters / 2) ? `I have started reading ${book.title}`
        : `I am finishing reading ${book.title}`
    })
  

  const b = Book({title: "Grokking Functional Programming", numberOfChapters: 12})
  expect(bookProgressUpdate(
    b,
    Reading({currentChapter: 13})
  )).toEqual("I am finishing reading Grokking Functional Programming")

  // trait, bag of functions
  // trait BagOfFunctions {
  //   def f(x: Int): Boolean
  //   def g(y: Book): Int
  // }

  // // creating instance of a trait
  // const bagOfFunctions = new BagOfFunctions {
  //   def f(x: Int): Boolean = x == 1
  //   def g(y: Book): Int    = y.numberOfChapters * 2
  // }
  // expect(bagOfFunctions.f(2020)).toEqual(false)

  // turn Unit value in Scala (if a function returns Unit it means it does some impure things inside)
  // const unit: Unit = ()

  //  Map type intro p313
  const book1                                    = Book({title: "Grokking Functional Programming", numberOfChapters: 12})
  const book2                                    = Book({title: "Ferdydurke", numberOfChapters: 14})
  const progressPerBook = Map({
    book1: Reading({currentChapter: 13}),
    book2: ToRead(),
  })

  // writing function that pattern match. we decided to use basic syntax in the book, but here are other ways you ca implement that in Scala
  expect(progressPerBook.toList().filter(bookProgress =>
    bookProgress.caseOf({
      ToRead:     ()             => false,
      Reading: ({currentChapter})  => false,
      Finished: ({rating})        => true,
    })
  )).toEqual(List())

  // expect(progressPerBook.values.filter(_ match {
  //   case ToRead      => false
  //   case Reading(_)  => false
  //   case Finished(_) => true
  // }) == List)

  // assert(progressPerBook.values.filter {
  //   case ToRead      => false
  //   case Reading(_)  => false
  //   case Finished(_) => true
  // } == List)

  // _ inside for comprehension
  //  _ as an unnamed value in for comprehension, Unit
  // assert((for {
  //   _    <- List.of(1, 2, 3)
  //   book <- List.of(Book("A", 7), Book("B", 13))
  // } yield book.numberOfChapters) == List.of(7, 13, 7, 13, 7, 13))

  // - scala finiteduration 1.second 2.seconds mention
  // const duration: FiniteDuration        = 1.second
  // const durations: List[FiniteDuration] =
    // List.of(100.millis, 2.seconds, 5.minutes, 500_000.hours) //  big numbers in scala 400_000 p365

  // multi-line strings
  // """
  //   |Thanks
  //   |for
  //   |making
  //   |it
  //   |this
  //   |far!
  //   |""".stripMargin
});
