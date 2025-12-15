import { Record } from "immutable"

/**
 * @param {string} word 
 */
export const score = (word) => word.replaceAll("a", "").length

/**
 * @param {string} s 
 */
export const numberOfS = (s) => s.length - s.replaceAll("s", "").length

/**
 * @param {number} i 
 */
export const negative = (i) => -i

export const len = (s) => s.length

export const ProgrammingLanguage = Record({ name: "", year: 0 })
