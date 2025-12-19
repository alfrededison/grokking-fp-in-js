import { curry, List } from "../src/libs"

describe('WordScoringScala', () => {
  /**
   * @param {string} word 
   */
  const score = (word) => word.replaceAll("a", "").length

  test('case 1', () => { // incorrect result (java has scored 2 and rust has scored 4)
    expect(List.of("rust", "java").sortBy(score)).toEqual(List.of("java", "rust"))
  })

  // see "sortBy" section in ch04_PassingFunctions

  const words = List.of("ada", "haskell", "scala", "java", "rust")

  test('case 2', () => {
    const wordRanking = words.sortBy(score).reverse()
    console.log(wordRanking)
    expect(wordRanking).toEqual(List.of("haskell", "rust", "scala", "java", "ada"))
  })

  test('case 3', () => {
    /**
     * @param {(word: String) => Int} wordScore 
     * @param {List<string>} words 
     */
    const rankedWords = (wordScore, words) => {
      const negativeScore = (word) => -wordScore(word)
      return words.sortBy(negativeScore)
    }

    expect(rankedWords(score, List.of("rust", "java"))).toEqual(List.of("rust", "java"))

    const wordRanking = rankedWords(score, words)
    console.log(wordRanking)
    expect(wordRanking).toEqual(List.of("haskell", "rust", "scala", "java", "ada"))
  })

  test('case 4', () => {
    /**
     * @param {(word: String) => Int} wordScore 
     * @param {List<string>} words 
     */
    const rankedWords = (wordScore, words) => words.sortBy(wordScore).reverse()

    expect(rankedWords(score, List.of("rust", "java"))).toEqual(List.of("rust", "java"))

    {
      const wordRanking = rankedWords(score, words)
      console.log(wordRanking)
      expect(wordRanking).toEqual(List.of("haskell", "rust", "scala", "java", "ada"))
    }

    /**
     * 
     * @param {string} word 
     */
    const scoreWithBonus = (word) => {
      const base = score(word)
      return (word.includes("c")) ? base + 5 : base
    }

    {
      const wordRanking = rankedWords(scoreWithBonus, words)
      console.log(wordRanking)
      expect(wordRanking).toEqual(List.of("scala", "haskell", "rust", "java", "ada"))
    }

    /**
     * 
     * @param {string} word 
     */
    const bonus = (word) => word.includes("c") ? 5 : 0

    {
      const wordRanking = rankedWords(w => score(w) + bonus(w), words)
      console.log(wordRanking)
      expect(wordRanking).toEqual(List.of("scala", "haskell", "rust", "java", "ada"))
    }

    // Coffee break
    /**
     * 
     * @param {string} word 
     */
    const penalty = (word) => word.includes("s") ? 7 : 0

    {
      const wordRanking = rankedWords(w => score(w) + bonus(w) - penalty(w), words)
      console.log(wordRanking)
      expect(wordRanking).toEqual(List.of("java", "scala", "ada", "haskell", "rust"))
    }

    // map
    /**
     * @param {(word: String) => Int} wordScore 
     * @param {List<string>} words 
     */
    const wordScores = (wordScore, words) => {
      return words.map(wordScore)
    }

    expect(wordScores(score, List.of("rust", "java"))).toEqual(List.of(4, 2))

    {
      const scores = wordScores(w => score(w) + bonus(w) - penalty(w), words)
      console.log(scores)
      expect(scores).toEqual(List.of(1, -1, 1, 2, -3))
    }

    // see "Practicing map" in ch04_PassingFunctions

    // filter
    {
      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       */
      const highScoringWords = (wordScore, words) => {
        return words.filter(word => wordScore(word) > 1)
      }

      // note that we don't show what function is passed as wordScore because it doesn't matter
      expect(highScoringWords(w => score(w) + bonus(w) - penalty(w), List.of("rust", "java"))).toEqual(List.of("java"))

      const result = highScoringWords(w => score(w) + bonus(w) - penalty(w), words)
      console.log(result)
      expect(result).toEqual(List.of("java"))
    }

    // see "Practicing filter" in ch04_PassingFunctions

    // RETURNING FUNCTIONS #0: problem
    {
      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       */
      const highScoringWords = (wordScore, words) => {
        return words.filter(word => wordScore(word) > 1)
      }

      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       */
      const highScoringWords0 = (wordScore, words) => {
        return words.filter(word => wordScore(word) > 0)
      }

      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       */
      const highScoringWords5 = (wordScore, words) => {
        return words.filter(word => wordScore(word) > 5)
      }

      const result = highScoringWords(w => score(w) + bonus(w) - penalty(w), words)
      console.log(result)
      expect(result).toEqual(List.of("java"))
      const result2 = highScoringWords0(w => score(w) + bonus(w) - penalty(w), words)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))
      const result3 = highScoringWords5(w => score(w) + bonus(w) - penalty(w), words)
      console.log(result3)
      expect(result3).toEqual(List())
    }

    // RETURNING FUNCTIONS #1: adding a new parameter
    {
      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       * @param {Int} higherThan
       */
      const highScoringWords = (wordScore, words, higherThan) => {
        return words.filter(word => wordScore(word) > higherThan)
      }

      // PROBLEM still there:
      const result = highScoringWords(w => score(w) + bonus(w) - penalty(w), words, 1)
      console.log(result)
      expect(result).toEqual(List.of("java"))
      const result2 = highScoringWords(w => score(w) + bonus(w) - penalty(w), words, 0)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))
      const result3 = highScoringWords(w => score(w) + bonus(w) - penalty(w), words, 5)
      console.log(result3)
      expect(result3).toEqual(List())
    }

    // RETURNING FUNCTIONS #2: function returns a function
    {
      /**
       * @param {(word: String) => Int} wordScore 
       * @param {List<string>} words 
       * @returns {(higherThan: Int) => List<string>}
       */
      const highScoringWords = (wordScore, words) => higherThan =>
        words.filter(word => wordScore(word) > higherThan)

      const wordsWithScoreHigherThan = highScoringWords(w => score(w) + bonus(w) - penalty(w), words)

      const result = wordsWithScoreHigherThan(1)
      console.log(result)
      expect(result).toEqual(List.of("java"))

      const result2 = wordsWithScoreHigherThan(0)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))

      const result3 = wordsWithScoreHigherThan(5)
      console.log(result3)
      expect(result3).toEqual(List())
    }

    // see "Returning functions from functions" in ch04_ReturningFunctions

    // RETURNING FUNCTIONS #3: PROBLEM
    {
      const highScoringWords = (wordScore, words) => higherThan =>
        words.filter(word => wordScore(word) > higherThan)

      const words2 = List.of("football", "f1", "hockey", "basketball")

      const wordsWithScoreHigherThan = highScoringWords(w => score(w) + bonus(w) - penalty(w), words)
      const words2WithScoreHigherThan = highScoringWords(w => score(w) + bonus(w) - penalty(w), words2)

      const result = wordsWithScoreHigherThan(1)
      console.log(result)
      expect(result).toEqual(List.of("java"))

      const result2 = wordsWithScoreHigherThan(0)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))

      const result3 = wordsWithScoreHigherThan(5)
      console.log(result3)
      expect(result3).toEqual(List())

      const result4 = words2WithScoreHigherThan(1)
      console.log(result4)
      expect(result4).toEqual(List.of("football", "f1", "hockey"))

      const result5 = words2WithScoreHigherThan(0)
      console.log(result5)
      expect(result5).toEqual(List.of("football", "f1", "hockey", "basketball"))

      const result6 = words2WithScoreHigherThan(5)
      console.log(result6)
      expect(result6).toEqual(List.of("football", "hockey"))
    }

    // RETURNING FUNCTIONS #4: returning functions from functions that return functions
    {
      /**
       * 
       * @param {string} wordScore 
       * @returns {(higherThan: number) => (words: List<string>) => (List<string>)}
       */
      const highScoringWords = (wordScore) => higherThan => words =>
        words.filter(word => wordScore(word) > higherThan)

      const words2 = List.of("football", "f1", "hockey", "basketball")

      const wordsWithScoreHigherThan = highScoringWords(w => score(w) + bonus(w) - penalty(w)) // just one function!

      const result = wordsWithScoreHigherThan(1)(words) // more readable
      console.log(result)
      expect(result).toEqual(List.of("java"))

      const result2 = wordsWithScoreHigherThan(0)(words)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))

      const result3 = wordsWithScoreHigherThan(5)(words)
      console.log(result3)
      expect(result3).toEqual(List())

      const result4 = wordsWithScoreHigherThan(1)(words2)
      console.log(result4)
      expect(result4).toEqual(List.of("football", "f1", "hockey"))

      const result5 = wordsWithScoreHigherThan(0)(words2)
      console.log(result5)
      expect(result5).toEqual(List.of("football", "f1", "hockey", "basketball"))

      const result6 = wordsWithScoreHigherThan(5)(words2)
      console.log(result6)
      expect(result6).toEqual(List.of("football", "hockey"))
    }

    // RETURNING FUNCTIONS #5: currying
    {
      const highScoringWords = curry((wordScore, higherThan, words) => {
        return words.filter(word => wordScore(word) > higherThan)
      })

      const words2 = List.of("football", "f1", "hockey", "basketball")

      const wordsWithScoreHigherThan = highScoringWords(w => score(w) + bonus(w) - penalty(w)) // just one function!

      const result = wordsWithScoreHigherThan(1)(words) // more readable
      console.log(result)
      expect(result).toEqual(List.of("java"))

      const result2 = wordsWithScoreHigherThan(0)(words)
      console.log(result2)
      expect(result2).toEqual(List.of("ada", "scala", "java"))

      const result3 = wordsWithScoreHigherThan(5)(words)
      console.log(result3)
      expect(result3).toEqual(List())

      const result4 = wordsWithScoreHigherThan(1)(words2)
      console.log(result4)
      expect(result4).toEqual(List.of("football", "f1", "hockey"))

      const result5 = wordsWithScoreHigherThan(0)(words2)
      console.log(result5)
      expect(result5).toEqual(List.of("football", "f1", "hockey", "basketball"))

      const result6 = wordsWithScoreHigherThan(5)(words2)
      console.log(result6)
      expect(result6).toEqual(List.of("football", "hockey"))
    }

    // see "Practicing currying" in ch04_ReturningFunctions

    /**
     * @param {(word: String) => Int} wordScore 
     * @param {List<string>} words 
     */
    const cumulativeScore = (wordScore, words) => {
      return words.reduce((total, word) =>
        total + wordScore(word)
        , 0)
    }

    {
      const result = cumulativeScore(w => score(w) + bonus(w) - penalty(w), List.of("rust", "java"))
      console.log(result)
      expect(result).toEqual(-1)
    }

    {
      const result = cumulativeScore(w => score(w) + bonus(w) - penalty(w), words)
      console.log(result)
      expect(result).toEqual(0)
    }

    {
      /**
       * 
       * @param {string} w 
       */
      const wordScore = w => score(w) + bonus(w) - penalty(w)

      expect(wordScore("ada")).toEqual(1)
      expect(wordScore("haskell")).toEqual(-1)
      expect(wordScore("scala")).toEqual(1)
      expect(wordScore("java")).toEqual(2)
      expect(wordScore("rust")).toEqual(-3)
    }

    // see "Practicing currying" in ch04_PassingFunctions

  })
})
