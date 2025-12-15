import { len, score, numberOfS, negative } from './chap4-functions-as-values';
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
