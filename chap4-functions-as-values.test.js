import { len, score, numberOfS, negative, ProgrammingLanguage } from './chap4-functions-as-values';
import * as R from 'ramda';

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

        const words = ["rust", "java"]

        console.log(R.sortBy(score, words))
        expect(R.sortBy(score, words)).toEqual(["java", "rust"])
    });

    test('sortBy', () => {
        const words = ["rust", "java"]
        const sortedWords = R.sortBy(score, words)
        expect(sortedWords).toEqual(["java", "rust"])
        expect(R.sortBy(score, ["rust", "java"])).toEqual(sortedWords)
    });

    test('Practicing function passing', () => {
        const byLength = R.sortBy(len, ["scala", "rust", "ada"])
        console.log(byLength)
        expect(byLength).toEqual(["ada", "rust", "scala"])

        const byNumberOfS = R.sortBy(numberOfS, ["rust", "ada"])
        console.log(byNumberOfS)
        expect(byNumberOfS).toEqual(["ada", "rust"])

        const ascending = R.sortBy(negative, [5, 1, 2, 4, 3])
        console.log(ascending)
        expect(ascending).toEqual([5, 4, 3, 2, 1])

        const negativeNumberOfS = (s) => -numberOfS(s)
        const byNegativeNumberOfS = R.sortBy(negativeNumberOfS, ["ada", "rust"])
        console.log(byNegativeNumberOfS)
        expect(byNegativeNumberOfS).toEqual(["rust", "ada"])
    });

    test('Practicing map', () => {
        const lengths = ["scala", "rust", "ada"].map(len)
        console.log(lengths)
        expect(lengths).toEqual([5, 4, 3])

        const numberOfSs = ["rust", "ada"].map(numberOfS)
        console.log(numberOfSs)
        expect(numberOfSs).toEqual([1, 0])

        const negatives = [5, 1, 2, 4, 0].map(negative)
        console.log(negatives)
        expect(negatives).toEqual([-5, -1, -2, -4, -0])

        const double = (i) => 2 * i
        const doubles = [5, 1, 2, 4, 0].map(double)
        console.log(doubles)
        expect(doubles).toEqual([10, 2, 4, 8, 0])
    });

    test('Practicing filter', () => {
        const longWords = ["scala", "rust", "ada"].filter(word => len(word) < 5)
        console.log(longWords)
        expect(longWords).toEqual(["rust", "ada"])

        const withLotsS = ["rust", "ada"].filter(word => numberOfS(word) > 2)
        console.log(withLotsS)
        expect(withLotsS).toEqual([])

        const odd = (i) => i % 2 == 1
        const odds = [5, 1, 2, 4, 0].filter(odd)
        console.log(odds)
        expect(odds).toEqual([5, 1])

        const largerThan4 = (i) => i > 4

        const large = [5, 1, 2, 4, 0].filter(largerThan4)
        console.log(large)
        expect(large).toEqual([5])
    });

    test('Practicing foldLeft(reduce)', () => {
        const sum = R.reduce((sum, i) => sum + i, 0, [5, 1, 2, 4, 100])
        console.log(sum)
        expect(sum).toEqual(112)

        const totalLength = R.reduce((total, s) => total + len(s), 0, ["scala", "rust", "ada"])
        console.log(totalLength)
        expect(totalLength).toEqual(12)

        const totalS = R.reduce((total, str) => total + numberOfS(str), 0, ["scala", "haskell", "rust", "ada"])
        console.log(totalS)
        expect(totalS).toEqual(3)

        const max = R.reduce((max, i) => (i > max) ? i : max, Number.MIN_SAFE_INTEGER, [5, 1, 2, 4, 15])
        console.log(max)
        expect(max).toEqual(15)

        const max2 = R.reduce((max, i) => Math.max(max, i), Number.MIN_SAFE_INTEGER, [5, 1, 2, 4, 15])
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

        const languages = [javalang, scalalang]

        console.log(languages)
        expect(languages).toEqual([ProgrammingLanguage({ name: "Java", year: 1995 }), ProgrammingLanguage({ name: "Scala", year: 2004 })])

        const names = languages.map(lang => lang.name)
        console.log(names)
        expect(names).toEqual(["Java", "Scala"])
        const young = languages.filter(lang => lang.year > 2000)
        console.log(young)
        expect(young).toEqual([scalalang])

        expect(languages.map(R.prop("name"))).toEqual(["Java", "Scala"])

        expect(languages.filter(e => e.year > 2000)).toEqual([scalalang])
    })
});

describe('ReturningFunctions', () => {
    test('Returning functions from functions', () => {
        /**
         * @param {number} n
         * @returns {(i: number) => boolean}
         */
        const largerThan = (n) => (i) => i > n

        const large = [5, 1, 2, 4, 0].filter(largerThan(4))
        console.log(large)
        expect(large).toEqual([5])
        expect([5, 1, 2, 4, 0].filter(largerThan(1))).toEqual([5, 2, 4])

        /**
         * @param {number} n 
         * @returns {(i: number) => boolean}
         */
        const divisibleBy = (n) => (i) => i % n == 0

        const odds = [5, 1, 2, 4, 15].filter(divisibleBy(5))
        console.log(odds)
        expect(odds).toEqual([5, 15])
        expect([5, 1, 2, 4, 15].filter(divisibleBy(2))).toEqual([2, 4])

        /**
         * @param {number} n
         * @returns {(s: string) => boolean}
         */
        const shorterThan = (n) => (s) => s.length < n

        const longWords = ["scala", "ada"].filter(shorterThan(4))
        console.log(longWords)
        expect(longWords).toEqual(["ada"])
        expect(["scala", "ada"].filter(shorterThan(7))).toEqual(["scala", "ada"])

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

        const withLotsS = ["rust", "ada"].filter(containsS(2))
        console.log(withLotsS)
        expect(withLotsS).toEqual([])
        expect(["rust", "ada"].filter(containsS(0))).toEqual(["rust"])
    });

    test('Practicing currying', () => {
        const largerThan = R.curry((n, i) => i > n)

        const large = [5, 1, 2, 4, 0].filter(largerThan(4))
        console.log(large)
        expect(large).toEqual([5])
        expect([5, 1, 2, 4, 0].filter(largerThan(1))).toEqual([5, 2, 4])

        const divisibleBy = R.curry((n, i) => i % n == 0)

        const odds = [5, 1, 2, 4, 15].filter(divisibleBy(5))
        console.log(odds)
        expect(odds).toEqual([5, 15])
        expect([5, 1, 2, 4, 15].filter(divisibleBy(2))).toEqual([2, 4])

        const shorterThan = R.curry((n, s) => s.length < n)

        const shortWords = ["scala", "ada"].filter(shorterThan(4))
        console.log(shortWords)
        expect(shortWords).toEqual(["ada"])
        expect(["scala", "ada"].filter(shorterThan(7))).toEqual(["scala", "ada"])

        const numberOfS = (s) => s.length - s.replaceAll("s", "").length

        const containsS = R.curry((moreThan, s) => numberOfS(s) > moreThan)

        const withLotsS = ["rust", "ada"].filter(containsS(2))
        console.log(withLotsS)
        expect(withLotsS).toEqual([])
        expect(["rust", "ada"].filter(containsS(0))).toEqual(["rust"])
    });
});