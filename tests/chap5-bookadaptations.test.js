import * as R from "ramda"
import { Record } from "immutable"

const Book = Record({ title: "", authors: [] })
const Movie = Record({ title: "" })

/** Given the list of all interesting books,
  * return a feed of movie recommendations.
  */
describe('BookAdaptations', () => {
    test('case 1', () => {
        const books = [
            Book({ title: "FP in Scala", authors: ["Chiusano", "Bjarnason"] }),
            Book({ title: "The Hobbit", authors: ["Tolkien"] }),
            Book({ title: "Modern Java in Action", authors: ["Urma", "Fusco", "Mycroft"] })
        ]

        const scalaBooksQty1 = books
            .map(R.prop('title'))
            .filter(R.includes("Scala"))
            .length
        expect(scalaBooksQty1).toEqual(1)

        const scalaBooksQty2 = books
            .map(book => book.title)
            .filter(title => title.includes("Scala"))
            .length
        expect(scalaBooksQty2).toEqual(1)
    })

    test('case 2', () => {
        const books = [
            Book({ title: "FP in Scala", authors: ["Chiusano", "Bjarnason"] }),
            Book({ title: "The Hobbit", authors: ["Tolkien"] })
        ]

        const bookAdaptations = (author) => (author === "Tolkien")
            ? [Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" })]
            : []

        const a1 = books.map(book => book.authors)
        expect(a1).toEqual([["Chiusano", "Bjarnason"], ["Tolkien"]])

        const a2 = books.map(book => book.authors).flat()
        expect(a2).toEqual(["Chiusano", "Bjarnason", "Tolkien"])

        const a3 = books.flatMap(R.prop('authors'))
        expect(a2).toEqual(a3)

        const authors = ["Chiusano", "Bjarnason", "Tolkien"]
        const movieLists = authors.map(bookAdaptations)
        expect(movieLists).toEqual([
            [],
            [],
            [Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" })]
        ])
        const b1 = movieLists.flat()

        const movies = books
            .flatMap(R.prop('authors'))
            .flatMap(bookAdaptations)

        expect(movies).toEqual([Movie({ title: "An Unexpected Journey" }), Movie({ title: "The Desolation of Smaug" })])
        expect(b1).toEqual(movies)

        { // flatMap and changing the size of the list
            expect([1, 2, 3].flatMap(i => [i, i + 10]).length).toEqual(6)
            expect([1, 2, 3].flatMap(i => [i * 2]).length).toEqual(3)
            expect([1, 2, 3].flatMap(i => i % 2 === 0 ? [i] : []).length).toEqual(1)
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
        expect(c1).toEqual([
            "You may like An Unexpected Journey, because you liked Tolkien's The Hobbit",
            "You may like The Desolation of Smaug, because you liked Tolkien's The Hobbit"
        ])

        const recommendationFeed = (books) =>
            books.flatMap(book =>
                book.authors.flatMap(author =>
                    bookAdaptations(author).map(movie =>
                        `You may like ${movie.title}, ` +
                        `because you liked ${author}'s ${book.title}`
                    )
                )
            )
        expect(recommendationFeed(books)).toEqual([
            "You may like An Unexpected Journey, because you liked Tolkien's The Hobbit",
            "You may like The Desolation of Smaug, because you liked Tolkien's The Hobbit"
        ])
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
        const scala =
            [
                Book({ title: "FP in Scala", authors: ["Chiusano", "Bjarnason"] }), 
                Book({ title: "Get Programming with Scala", authors: ["Sfregola"] }),
            ]

        const fiction = [Book({ title: "Harry Potter", authors: ["Rowling"] }), Book({ title: "The Lord of the Rings", authors: ["Tolkien"] })]

        return (friend == "Alice") ? scala
            : (friend == "Bob") ? fiction
                : []
    }

    const friends = ["Alice", "Bob", "Charlie"]
    const friendsBooks = friends.map(recommendedBooks)
    expect(friendsBooks).toEqual([
        [Book({ title: "FP in Scala", authors: ["Chiusano", "Bjarnason"] }), Book({ title: "Get Programming with Scala", authors: ["Sfregola"] })],
        [Book({ title: "Harry Potter", authors: ["Rowling"] }), Book({ title: "The Lord of the Rings", authors: ["Tolkien"] })],
        []
    ])
    const flattenResult = friendsBooks.flat()

    const recommendations = friends.flatMap(recommendedBooks)
    expect(recommendations).toEqual([
        Book({ title: "FP in Scala", authors: ["Chiusano", "Bjarnason"] }),
        Book({ title: "Get Programming with Scala", authors: ["Sfregola"] }),
        Book({ title: "Harry Potter", authors: ["Rowling"] }),
        Book({ title: "The Lord of the Rings", authors: ["Tolkien"] })
    ])
    expect(flattenResult).toEqual(recommendations)

    const authors = recommendations.flatMap(R.prop('authors'))
    expect(authors).toEqual(["Chiusano", "Bjarnason", "Sfregola", "Rowling", "Tolkien"])
    const recommendedAuthors = friends
        .flatMap(recommendedBooks)
        .flatMap(R.prop('authors'))
    expect(recommendedAuthors).toEqual(["Chiusano", "Bjarnason", "Sfregola", "Rowling", "Tolkien"])
})
