import { curry, prop, List, Record } from "../src/libs";

/**
 * @param {string} word 
 */
const score = (word) => word.replaceAll("a", "").length

/**
 * @param {string} s 
 */
const numberOfS = (s) => s.length - s.replaceAll("s", "").length

/**
 * @param {number} i 
 */
const negative = (i) => -i

/**
 * @param {string} s
 */
const len = (s) => s.length

const ProgrammingLanguage = Record({ name: "", year: 0 })

describe('ch04_PassingFunctions', () => {
    test('functions as values', () => {
        /**
         * 
         * @param {number} x 
         */
        const inc = (x) => x + 1

        console.log(inc(2))

        console.log(score("java"))
        expect(score("java")).toBe(2)

        const words = List.of("rust", "java")

        console.log(words.sortBy(score))
        expect(words.sortBy(score)).toEqual(List.of("java", "rust"))
    });

    test('sortBy', () => {
        const words = List.of("rust", "java")
        const sortedWords = words.sortBy(score)
        expect(sortedWords).toEqual(List.of("java", "rust"))
        expect(List.of("rust", "java").sortBy(score)).toEqual(sortedWords)
    });

    test('Practicing function passing', () => {
        const byLength = List.of("scala", "rust", "ada").sortBy(len)
        console.log(byLength)
        expect(byLength).toEqual(List.of("ada", "rust", "scala"))

        const byNumberOfS = List.of("rust", "ada").sortBy(numberOfS)
        console.log(byNumberOfS)
        expect(byNumberOfS).toEqual(List.of("ada", "rust"))

        const ascending = List.of(5, 1, 2, 4, 3).sortBy(negative)
        console.log(ascending)
        expect(ascending).toEqual(List.of(5, 4, 3, 2, 1))

        const negativeNumberOfS = (s) => -numberOfS(s)
        const byNegativeNumberOfS = List.of("ada", "rust").sortBy(negativeNumberOfS)
        console.log(byNegativeNumberOfS)
        expect(byNegativeNumberOfS).toEqual(List.of("rust", "ada"))
    });

    test('Practicing map', () => {
        const lengths = List.of("scala", "rust", "ada").map(len)
        console.log(lengths)
        expect(lengths).toEqual(List.of(5, 4, 3))

        const numberOfSs = List.of("rust", "ada").map(numberOfS)
        console.log(numberOfSs)
        expect(numberOfSs).toEqual(List.of(1, 0))

        const negatives = List.of(5, 1, 2, 4, 0).map(negative)
        console.log(negatives)
        expect(negatives).toEqual(List.of(-5, -1, -2, -4, 0))

        const double = (i) => 2 * i
        const doubles = List.of(5, 1, 2, 4, 0).map(double)
        console.log(doubles)
        expect(doubles).toEqual(List.of(10, 2, 4, 8, 0))
    });

    test('Practicing filter', () => {
        const longWords = List.of("scala", "rust", "ada").filter(word => len(word) < 5)
        console.log(longWords)
        expect(longWords).toEqual(List.of("rust", "ada"))

        const withLotsS = List.of("rust", "ada").filter(word => numberOfS(word) > 2)
        console.log(withLotsS)
        expect(withLotsS).toEqual(List())

        const odd = (i) => i % 2 == 1
        const odds = List.of(5, 1, 2, 4, 0).filter(odd)
        console.log(odds)
        expect(odds).toEqual(List.of(5, 1))

        const largerThan4 = (i) => i > 4

        const large = List.of(5, 1, 2, 4, 0).filter(largerThan4)
        console.log(large)
        expect(large).toEqual(List.of(5))
    });

    test('Practicing foldLeft(reduce)', () => {
        const sum = List.of(5, 1, 2, 4, 100).reduce((sum, i) => sum + i, 0)
        console.log(sum)
        expect(sum).toEqual(112)

        const totalLength = List.of("scala", "rust", "ada").reduce((total, s) => total + len(s), 0)
        console.log(totalLength)
        expect(totalLength).toEqual(12)

        const totalS = List.of("scala", "haskell", "rust", "ada").reduce((total, str) => total + numberOfS(str), 0)
        console.log(totalS)
        expect(totalS).toEqual(3)

        const max = List.of(5, 1, 2, 4, 15).reduce((max, i) => (i > max) ? i : max, Number.MIN_SAFE_INTEGER)
        console.log(max)
        expect(max).toEqual(15)

        const max2 = List.of(5, 1, 2, 4, 15).reduce((max, i) => Math.max(max, i), Number.MIN_SAFE_INTEGER)
        console.log(max2)
        expect(max2).toEqual(15)
    });
});

describe('ProgrammingLanguages', () => {
    test('Creating and using ProgrammingLanguage records', () => {
        const javalang = ProgrammingLanguage({ name: "Java", year: 1995 })
        const scalalang = ProgrammingLanguage({ name: "Scala", year: 2004 })

        expect(javalang.name).toEqual("Java")
        console.log(javalang.name)

        console.log(scalalang.name.length)
        expect(scalalang.name.length).toEqual(5)

        console.log((scalalang.year + javalang.year) / 2)
        expect((scalalang.year + javalang.year) / 2).toEqual(1999.5)

        const languages = List.of(javalang, scalalang)

        console.log(languages)
        expect(languages).toEqual(List.of(ProgrammingLanguage({ name: "Java", year: 1995 }), ProgrammingLanguage({ name: "Scala", year: 2004 })))

        const names = languages.map(lang => lang.name)
        console.log(names)
        expect(names).toEqual(List.of("Java", "Scala"))

        const young = languages.filter(lang => lang.year > 2000)
        console.log(young)
        expect(young).toEqual(List.of(scalalang))

        expect(languages.map(prop("name"))).toEqual(List.of("Java", "Scala"))

        expect(languages.filter(e => e.year > 2000)).toEqual(List.of(scalalang))
    })
});

describe('ReturningFunctions', () => {
    test('Returning functions from functions', () => {
        /**
         * @param {number} n
         * @returns {(i: number) => boolean}
         */
        const largerThan = (n) => (i) => i > n

        const large = List.of(5, 1, 2, 4, 0).filter(largerThan(4))
        console.log(large)
        expect(large).toEqual(List.of(5))
        expect(List.of(5, 1, 2, 4, 0).filter(largerThan(1))).toEqual(List.of(5, 2, 4))

        /**
         * @param {number} n 
         * @returns {(i: number) => boolean}
         */
        const divisibleBy = (n) => (i) => i % n == 0

        const odds = List.of(5, 1, 2, 4, 15).filter(divisibleBy(5))
        console.log(odds)
        expect(odds).toEqual(List.of(5, 15))
        expect(List.of(5, 1, 2, 4, 15).filter(divisibleBy(2))).toEqual(List.of(2, 4))

        /**
         * @param {number} n
         * @returns {(s: string) => boolean}
         */
        const shorterThan = (n) => (s) => s.length < n

        const longWords = List.of("scala", "ada").filter(shorterThan(4))
        console.log(longWords)
        expect(longWords).toEqual(List.of("ada"))
        expect(List.of("scala", "ada").filter(shorterThan(7))).toEqual(List.of("scala", "ada"))

        /**
         * @param {string} s 
         * @returns {number}
         */
        const numberOfS = (s) => s.length - s.replaceAll("s", "").length

        /**
         * @param {number} moreThan
         * @returns {(s: string) => boolean}
         */
        const containsS = (moreThan) => (s) => numberOfS(s) > moreThan

        const withLotsS = List.of("rust", "ada").filter(containsS(2))
        console.log(withLotsS)
        expect(withLotsS).toEqual(List())
        expect(List.of("rust", "ada").filter(containsS(0))).toEqual(List.of("rust"))
    });

    test('Practicing currying', () => {
        const largerThan = curry((n, i) => i > n)

        const large = List.of(5, 1, 2, 4, 0).filter(largerThan(4))
        console.log(large)
        expect(large).toEqual(List.of(5))
        expect(List.of(5, 1, 2, 4, 0).filter(largerThan(1))).toEqual(List.of(5, 2, 4))

        const divisibleBy = curry((n, i) => i % n == 0)

        const odds = List.of(5, 1, 2, 4, 15).filter(divisibleBy(5))
        console.log(odds)
        expect(odds).toEqual(List.of(5, 15))
        expect(List.of(5, 1, 2, 4, 15).filter(divisibleBy(2))).toEqual(List.of(2, 4))

        const shorterThan = curry((n, s) => s.length < n)

        const shortWords = List.of("scala", "ada").filter(shorterThan(4))
        console.log(shortWords)
        expect(shortWords).toEqual(List.of("ada"))
        expect(List.of("scala", "ada").filter(shorterThan(7))).toEqual(List.of("scala", "ada"))

        const numberOfS = (s) => s.length - s.replaceAll("s", "").length

        const containsS = curry((moreThan, s) => numberOfS(s) > moreThan)

        const withLotsS = List.of("rust", "ada").filter(containsS(2))
        console.log(withLotsS)
        expect(withLotsS).toEqual(List())
        expect(List.of("rust", "ada").filter(containsS(0))).toEqual(List.of("rust"))
    });
});