import { Some, None, Record, List, range, always } from '../src/libs';
import { Effect } from 'effect';

// PREREQUISITE 1: MeetingTime model
const MeetingTimeModel = Record({
    startHour: 0,
    endHour: 0,
});
const MeetingTime = (startHour, endHour) => MeetingTimeModel({ startHour, endHour });

/** PREREQUISITE 2: Impure, unsafe and side-effectful API calls */
const calendarEntriesApiCall = (name) => {
    if (Math.random() < 0.25) throw new Error("Connection error");
    if (name === "Alice") return List.of(MeetingTime(8, 10), MeetingTime(11, 12));
    if (name === "Bob") return List.of(MeetingTime(9, 10));
    return List.of(MeetingTime(Math.floor(Math.random() * 5 + 8), Math.floor(Math.random() * 4 + 13)));
}
/**
 * 
 * @param {List<string>} names 
 * @param {MeetingTimeModel} meetingTime 
 */
const createMeetingApiCall = (names, meetingTime) => {
    console.log(`SIDE-EFFECT: Created meeting ${meetingTime} for ${names}`);
}

describe('ch08_SchedulingMeetings', () => {
    // STEP 1: Introduce IO
    /**
     * 
     * @param {string} name 
     */
    const calendarEntries = (name) => {
        return Effect.try(() => calendarEntriesApiCall(name));
    }

    /**
     * 
     * @param {List<string>} names 
     * @param {MeetingTimeModel} meeting 
     */
    const createMeeting = (names, meeting) => {
        return Effect.try(() => createMeetingApiCall(names, meeting));
    }

    /**
     * 
     * @param {string} person1 
     * @param {string} person2 
     */
    const scheduledMeetings = (person1, person2) => Effect.gen(function* () {
        const person1Entries = yield* calendarEntries(person1);
        const person2Entries = yield* calendarEntries(person2);
        return person1Entries.concat(person2Entries);
    });

    test('runStep1: scheduledMeetings success', () => {
        const prog = scheduledMeetings("Alice", "Bob");
        Effect.runPromise(prog)
            .then(meetings => expect(meetings).toEqual(List.of(
                MeetingTime(8, 10),
                MeetingTime(11, 12),
                MeetingTime(9, 10)
            )))
            .catch(e => expect(e.toJSON()).toHaveProperty('cause.failure.error.message', 'Connection error'));
    });

    // Coffee Break
    /**
     * 
     * @param {MeetingTimeModel} meeting1 
     * @param {MeetingTimeModel} meeting2 
     */
    const meetingsOverlap = (meeting1, meeting2) => {
        return meeting1.endHour > meeting2.startHour && meeting2.endHour > meeting1.startHour;
    }

    /**
     * 
     * @param {List<MeetingTimeModel>} existingMeetings 
     * @param {number} startHour 
     * @param {number} endHour 
     * @param {number} lengthHours 
     */
    const possibleMeetings = (existingMeetings, startHour, endHour, lengthHours) => {
        const slots = List(range(startHour, endHour - lengthHours + 1)).map(hour => MeetingTime(hour, hour + lengthHours));
        return slots.filter(slot => existingMeetings.every(meeting => !meetingsOverlap(meeting, slot)));
    }

    const Version1 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         */
        schedule: (person1, person2, lengthHours) => Effect.gen(function* () {
            const existingMeetings = yield* scheduledMeetings(person1, person2);
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            return meetings.headOption();
        })
    }

    test('runVersion1', () => {
        const program = Version1.schedule("Alice", "Bob", 1);
        Effect.runPromise(program)
            .then(meeting => expect(meeting).toEqual(Some(MeetingTime(10, 11))))
            .catch(e => expect(e.toJSON()).toHaveProperty('cause.failure.error.message', 'Connection error'));
    });
    // PROBLEM SOLVED: entangled concerns

    // PROBLEMS: no failure handling, signature lies
    // STEP 2: Introduce orElse
    test('introduceOrElse', () => {
        const year = Effect.succeed(996);
        const noYear = Effect.fail("no year");

        const program1 = year.pipe(Effect.orElse(() => Effect.succeed(2020)));
        const program2 = noYear.pipe(Effect.orElse(() => Effect.succeed(2020)));
        const program3 = year.pipe(Effect.orElse(() => Effect.fail("can't recover")));
        const program4 = noYear.pipe(Effect.orElse(() => Effect.fail("can't recover")));

        expect(Effect.runSync(program1)).toEqual(996);
        expect(Effect.runSync(program2)).toEqual(2020);
        expect(Effect.runSync(program3)).toEqual(996);
        expect(() => Effect.runSync(program4)).toThrow("can't recover");
    });

    const Version2 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         */
        schedule: (person1, person2, lengthHours) => Effect.gen(function* () {
            const existingMeetings = yield* scheduledMeetings(person1, person2)
                .pipe(Effect.orElse(() => scheduledMeetings(person1, person2)))
                .pipe(Effect.orElse(() => Effect.succeed(List())));
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            return meetings.headOption();
        })
    }

    test('runVersion2', () => {
        expect(Effect.runSync(Version2.schedule("Alice", "Bob", 1)).forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true)
        expect(Effect.runSync(Version2.schedule("Alice", "Bob", 2)).forall(meeting => meeting.endHour - meeting.startHour == 2)).toBe(true)
        expect(Effect.runSync(Version2.schedule("Alice", "Bob", 3)).forall(meeting => meeting.endHour - meeting.startHour == 3)).toBe(true)
        expect(Effect.runSync(Version2.schedule("Alice", "Bob", 4)).forall(meeting => meeting.endHour - meeting.startHour == 4)).toBe(true)
    });
    // PROBLEM SOLVED: no failure handling

    // PROBLEMS: signature lies
    // STEP 3: using signatures to indicate that function describes IO (+ functional core example)

    // Coffee Break: Using IO to store data
    const Version3 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         * @returns 
         */
        schedule: (person1, person2, lengthHours) => Effect.gen(function* () {
            const existingMeetings = yield* scheduledMeetings(person1, person2)
                .pipe(Effect.orElse(() => scheduledMeetings(person1, person2)))
                .pipe(Effect.orElse(() => Effect.succeed(List())));

            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            const possibleMeeting = meetings.headOption();

            yield* possibleMeeting.caseOf({
                Some: meeting => createMeeting(List.of(person1, person2), meeting),
                None: () => Effect.succeed()
            })

            return possibleMeeting;
        })
    }

    test('runVersion3', () => {
        expect(Effect.runSync(Version3.schedule("Alice", "Bob", 1)).forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true)
        expect(Effect.runSync(Version3.schedule("Alice", "Bob", 2)).forall(meeting => meeting.endHour - meeting.startHour == 2)).toBe(true)
        expect(Effect.runSync(Version3.schedule("Alice", "Bob", 3)).forall(meeting => meeting.endHour - meeting.startHour == 3)).toBe(true)
        expect(Effect.runSync(Version3.schedule("Alice", "Bob", 4)).forall(meeting => meeting.endHour - meeting.startHour == 4)).toBe(true)
    });
    // PROBLEM SOLVED: signature lies

    // STEP 4: Retries
    /**
     * 
     * @param {Future} action 
     * @param {number} maxRetries 
     */
    const retry = (action, maxRetries) => List(range(0, maxRetries))
        .map(always(action))
        .reduce((program, retryAction) => program.pipe(Effect.orElse(() => retryAction)), action);

    test('runRetries', () => {
        const fn = jest.fn(() => {
            throw new Error("failed");
        })
        Effect.runPromise(
            retry(Effect.try(fn), 10)
        ).catch(e => expect(e.toJSON()).toHaveProperty('cause.failure.error.message', 'failed'));
        expect(fn).toHaveBeenCalledTimes(11);
    })

    const Version4 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         */
        schedule: (person1, person2, lengthHours) => Effect.gen(function* () {
            const existingMeetings = yield* retry(scheduledMeetings(person1, person2), 10)
                .pipe(Effect.orElse(() => Effect.succeed(List())));
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            const possibleMeeting = meetings.headOption();

            yield* possibleMeeting.caseOf({
                Some: meeting => retry(createMeeting(List.of(person1, person2), meeting), 10),
                None: () => Effect.succeed()
            });

            return possibleMeeting;
        })
    }

    test('runVersion4', () => {
        expect(Effect.runSync(Version4.schedule("Alice", "Bob", 1))).toEqual(Some(MeetingTime(10, 11)));
        expect(Effect.runSync(Version4.schedule("Alice", "Bob", 2))).toEqual(Some(MeetingTime(12, 14)));
        expect(Effect.runSync(Version4.schedule("Alice", "Bob", 3))).toEqual(Some(MeetingTime(12, 15)));
        expect(Effect.runSync(Version4.schedule("Alice", "Bob", 4))).toEqual(Some(MeetingTime(12, 16)));
    })

    // STEP 5: any number of people attending
    /**
     * NOTE: alternative to List of IO flatten
     * @param {List<string>} attendees 
     */
    const scheduledMeetingsList = (attendees) => Effect.all(
        attendees.map(attendee => retry(calendarEntries(attendee), 10)) // no need toArray
    ).pipe(Effect.map(lists => List(lists).flatten()));

    const Version5 = { // FINAL VERSION: also presented at the beginning of the chapter
        /**
         * 
         * @param {List<string>} attendees 
         * @param {number} lengthHours 
         */
        schedule: (attendees, lengthHours) => Effect.gen(function* () {
            const existingMeetings = yield* scheduledMeetingsList(attendees);
            const possibleMeeting = possibleMeetings(existingMeetings, 8, 16, lengthHours).headOption();

            yield* possibleMeeting.caseOf({
                Some: meeting => createMeeting(attendees, meeting),
                None: () => Effect.succeed()
            })

            return possibleMeeting;
        })
    }

    test('runVersion5', () => {
        // note we can assert on fixed results here because
        // there is only a very very small chance we'll use a fallback
        // (because there is a 10-retry strategy in this version)
        expect(Effect.runSync(Version5.schedule(List.of("Alice", "Bob"), 1))).toEqual(Some(MeetingTime(10, 11)));
        expect(Effect.runSync(Version5.schedule(List.of("Alice", "Bob"), 2))).toEqual(Some(MeetingTime(12, 14)));
        expect(Effect.runSync(Version5.schedule(List.of("Alice", "Bob"), 3))).toEqual(Some(MeetingTime(12, 15)));
        expect(Effect.runSync(Version5.schedule(List.of("Alice", "Bob"), 4))).toEqual(Some(MeetingTime(12, 16)));
        expect(Effect.runSync(Version5.schedule(List.of("Alice", "Bob", "Charlie"), 1)).forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true)
    })

    // BONUS: scheduledMeetings using foldLeft instead of sequence:
    test('bonus1', () => {
        /**
         * 
         * @param {List<string>} attendees 
         */
        const scheduledMeetings = (attendees) => attendees
            .map(attendee => retry(calendarEntries(attendee), 10))
            .reduce((allMeetingsProgram, attendeeMeetingsProgram) => Effect.gen(function* () {
                const allMeetings = yield* allMeetingsProgram;
                const attendeeMeetings = yield* attendeeMeetingsProgram;
                return allMeetings.concat(attendeeMeetings);
            }), Effect.succeed(List()));

        expect(Effect.runSync(scheduledMeetings(List.of("Alice", "Bob")))).toEqual(List.of(
            MeetingTime(8, 10),
            MeetingTime(11, 12),
            MeetingTime(9, 10)
        ));

        expect(Effect.runSync(scheduledMeetings(List.of("Alice", "Bob", "Charlie"))).size).toEqual(4);

        expect(Effect.runSync(scheduledMeetings(List()))).toEqual(List());
    })
});
