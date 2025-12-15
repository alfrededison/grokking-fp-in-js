import { Record } from "immutable"
import { Just, Nothing } from "folktale/maybe"
import { lift, liftN } from "ramda"

const EventDetails = Record({ name: '', start: 0, end: 0 })

describe('Events', () => {
  test('using nulls', () => {
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parseAdHoc = (name, start, end) => // named parse in the book
      (name.length > 0 && end < 3000 & start <= end) ? EventDetails({name, start, end}) : null

    expect(parseAdHoc("Apollo Program", 1961, 1972)).toEqual(EventDetails({name: "Apollo Program", start: 1961, end: 1972}))
    expect(parseAdHoc("", 1939, 1945)).toEqual(null)
    expect(parseAdHoc("Event", 1949, 1945)).toEqual(null)
  })

  test('using Option', () => {
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parse = (name, start, end) =>
      (name.length > 0 && end < 3000 & start <= end) ? Just(EventDetails({name, start, end})) : Nothing()

    expect(parse("Apollo Program", 1961, 1972)).toEqual(Just(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parse("", 1939, 1945)).toEqual(Nothing())
    expect(parse("Event", 1949, 1945)).toEqual(Nothing())
  })

  test('parsing as a pipeline', () => {
    /**
     * @param {string} name
     */
    const validateName = (name) => (name.length > 0) ? Just(name) : Nothing()

    /**
     * @param {number} end
     */
    const validateEnd = (end) => (end < 3000) ? Just(end) : Nothing()

    /**
     * @param {number} start
     * @param {number} end
     */
    const validateStart = (start, end) => (start <= end) ? Just(start) : Nothing()

    const eventBuilder = (name, start, end) => EventDetails({name, start, end})
    
    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     */
    const parse = (name, start, end) => lift(eventBuilder)(  // lift Event into the Option context
      validateName(name),
      validateStart(start, end),
      validateEnd(end)
    )

    expect(parse("Apollo Program", 1961, 1972)).toEqual(Just(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parse("", 1939, 1945)).toEqual(Nothing())
    expect(parse("Event", 1949, 1945)).toEqual(Nothing())

    // Coffee break: Parsing with Option
    /**
     * @param {number} start
     * @param {number} end
     * @param {number} minLength
     */
    const validateLength = (start, end, minLength) =>
      (end - start >= minLength) ? Just(end - start) : Nothing()

    /**
     * @param {string} name
     * @param {number} start
     * @param {number} end
     * @param {number} minLength
     */
    const parseLongEvent = (name, start, end, minLength) => liftN(4, eventBuilder)(  // TODO: a bit hacky
      validateName(name),
      validateStart(start, end),
      validateEnd(end),
      validateLength(start, end, minLength)
    )

    expect(parseLongEvent("Apollo Program", 1961, 1972, 10)).toEqual(Just(EventDetails({name: "Apollo Program", start: 1961, end: 1972})))
    expect(parseLongEvent("World War II", 1939, 1945, 10)).toEqual(Nothing())
    expect(parseLongEvent("", 1939, 1945, 10)).toEqual(Nothing())
    expect(parseLongEvent("Apollo Program", 1972, 1961, 10)).toEqual(Nothing())
  })
})
