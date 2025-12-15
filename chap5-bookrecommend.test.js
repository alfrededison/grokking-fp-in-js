import { Book } from "./chap5-bookadaptations"
import * as R from "ramda"

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
