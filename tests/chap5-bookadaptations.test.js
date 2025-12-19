import { List, Record, prop, includes } from "../src/libs"

const Book = Record({ title: "", authors: List() })
const Movie = Record({ title: "" })

/** Given the list of all interesting books,
  * return a feed of movie recommendations.
  */
describe('BookAdaptations', () => {
    test('case 1', () => {
        const books = List.of(
            Book({ title: "FP in Scala", authors: List.of("Chiusano", "Bjarnason") }),
            Book({ title: "The Hobbit", authors: List.of("Tolkien") }),
            Book({ title: "Modern Java in Action", authors: List.of("Urma", "Fusco", "Mycroft") })
        )

        const scalaBooksQty1 = books
            .map(prop('title'))
            .filter(includes("Scala"))
            .size
        expect(scalaBooksQty1).toEqual(1)

        const scalaBooksQty2 = books
            .map(book => book.title)
            .filter(title => title.includes("Scala"))
            .size
        expect(scalaBooksQty2).toEqual(1)
    })

    test('case 2', () => {
        const books = List.of(
            Book({ title: "FP in Scala", authors: List.of("Chiusano", "Bjarnason") }),
            Book({ title: "The Hobbit", authors: List.of("Tolkien") })
        )

        /**
         * 
         * @param {string} author 
         */
        const bookAdaptations = (author) => (author === "Tolkien")
            ? List.of(Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" }))
            : List()

        const a1 = books.map(book => book.authors)
        expect(a1).toEqual(List.of(List.of("Chiusano", "Bjarnason"), List.of("Tolkien")))

        const a2 = books.map(book => book.authors).flatten()
        expect(a2).toEqual(List.of("Chiusano", "Bjarnason", "Tolkien"))

        const a3 = books.flatMap(prop('authors'))
        expect(a2).toEqual(a3)

        const authors = List.of("Chiusano", "Bjarnason", "Tolkien")
        const movieLists = authors.map(bookAdaptations)
        expect(movieLists).toEqual(List.of(
            List(),
            List(),
            List.of(Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" }))
        ))
        const b1 = movieLists.flatten()

        const movies = books
            .flatMap(prop('authors'))
            .flatMap(bookAdaptations)

        expect(movies).toEqual(List.of(Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" })))
        expect(b1).toEqual(movies)

        { // flatMap and changing the size of the list
            expect(List.of(1, 2, 3).flatMap(i => List.of(i, i + 10)).size).toEqual(6)
            expect(List.of(1, 2, 3).flatMap(i => List.of(i * 2)).size).toEqual(3)
            expect(List.of(1, 2, 3).flatMap(i => i % 2 === 0 ? List.of(i) : List()).size).toEqual(1)
        }

        // see ch05_BookFriendRecommendations
        // see ch05_SequencedNestedFlatMaps

        const c1 = books
            .flatMap(book =>
                book.authors.flatMap(author =>
                    bookAdaptations(author).map(movie =>
                        `You may like ${movie.title}, ` +
                        `because you liked ${author}'s ${book.title}`
                    )
                )
            )
        expect(c1).toEqual(List.of(
            "You may like An Unexpected Journey, because you liked Tolkien's The Hobbit",
            "You may like The Desolation of Smaug, because you liked Tolkien's The Hobbit"
        ))

        const recommendationFeed = (books) =>
            books.flatMap(book =>
                book.authors.flatMap(author =>
                    bookAdaptations(author).map(movie =>
                        `You may like ${movie.title}, ` +
                        `because you liked ${author}'s ${book.title}`
                    )
                )
            )
        expect(recommendationFeed(books)).toEqual(List.of(
            "You may like An Unexpected Journey, because you liked Tolkien's The Hobbit",
            "You may like The Desolation of Smaug, because you liked Tolkien's The Hobbit"
        ))
        // see "Practicing nested flatMaps" in ch05_Points2d3d

        // TODO: rewrite the `for comprehension` in JS
        //   const c2 = for {
        //     book   <- books
        //     author <- book.authors
        //     movie  <- bookAdaptations(author)
        //   } yield `You may like ${movie.title}, ` + `because you liked ${author}'s ${book.title}`

        //   expect(c1).toEqual(c2)

        // see "flatMaps vs. for comprehensions" in ch05_Points2d3d
    })
})

test('BookFriendRecommendations', () => {

    /**
     * @param {string} friend
     */
    const recommendedBooks = (friend) => {
        const scala = List.of(
            Book({ title: "FP in Scala", authors: List.of("Chiusano", "Bjarnason") }),
            Book({ title: "Get Programming with Scala", authors: List.of("Sfregola") }),
        )

        const fiction = List.of(
            Book({ title: "Harry Potter", authors: List.of("Rowling") }),
            Book({ title: "The Lord of the Rings", authors: List.of("Tolkien") }),
        )

        return (friend == "Alice") ? scala
            : (friend == "Bob") ? fiction
                : List()
    }

    const friends = List.of("Alice", "Bob", "Charlie")
    const friendsBooks = friends.map(recommendedBooks)
    expect(friendsBooks).toEqual(List.of(
        List.of(Book({ title: "FP in Scala", authors: List.of("Chiusano", "Bjarnason") }), Book({ title: "Get Programming with Scala", authors: List.of("Sfregola") })),
        List.of(Book({ title: "Harry Potter", authors: List.of("Rowling") }), Book({ title: "The Lord of the Rings", authors: List.of("Tolkien") })),
        List()
    ))
    const flattenResult = friendsBooks.flatten()

    const recommendations = friends.flatMap(recommendedBooks)
    expect(recommendations).toEqual(List.of(
        Book({ title: "FP in Scala", authors: List.of("Chiusano", "Bjarnason") }),
        Book({ title: "Get Programming with Scala", authors: List.of("Sfregola") }),
        Book({ title: "Harry Potter", authors: List.of("Rowling") }),
        Book({ title: "The Lord of the Rings", authors: List.of("Tolkien") })
    ))
    expect(flattenResult).toEqual(recommendations)

    const authors = recommendations.flatMap(prop('authors'))
    expect(authors).toEqual(List.of("Chiusano", "Bjarnason", "Sfregola", "Rowling", "Tolkien"))
    const recommendedAuthors = friends
        .flatMap(recommendedBooks)
        .flatMap(prop('authors'))
    expect(recommendedAuthors).toEqual(List.of("Chiusano", "Bjarnason", "Sfregola", "Rowling", "Tolkien"))
})
