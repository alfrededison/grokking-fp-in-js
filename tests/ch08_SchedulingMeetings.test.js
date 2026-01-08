import { Some, None, Record, List, range, always } from '../src/libs';
import F from 'fluture';

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

const expectError = (e) => {
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('Connection error');
}

const expectNothing = (e) => {
    expect(e).toBeUndefined();
}

describe('ch08_SchedulingMeetings', () => {
    // STEP 1: Introduce IO
    /**
     * 
     * @param {string} name 
     */
    const calendarEntries = (name) => {
        return F.attempt(() => calendarEntriesApiCall(name));
    }

    /**
     * 
     * @param {List<string>} names 
     * @param {MeetingTimeModel} meeting 
     */
    const createMeeting = (names, meeting) => {
        return F.attempt(() => createMeetingApiCall(names, meeting));
    }

    /**
     * 
     * @param {string} person1 
     * @param {string} person2 
     */
    const scheduledMeetings = (person1, person2) => F.go(function* () {
        const person1Entries = yield calendarEntries(person1);
        const person2Entries = yield calendarEntries(person2);
        return person1Entries.concat(person2Entries);
    });

    test('runStep1: scheduledMeetings success', () => {
        scheduledMeetings("Alice", "Bob").pipe(F.fork
            (expectError)
            (meetings => {
                expect(meetings).toEqual(List.of(
                    MeetingTime(8, 10),
                    MeetingTime(11, 12),
                    MeetingTime(9, 10)
                ));
            })
        );
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
        schedule: (person1, person2, lengthHours) => F.go(function* () {
            const existingMeetings = yield scheduledMeetings(person1, person2);
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            return meetings.headOption();
        })
    }

    test('runVersion1', () => {
        const program = Version1.schedule("Alice", "Bob", 1);
        program.pipe(F.fork
            (expectError)
            (opt => expect(opt).toEqual(Some(MeetingTime(10, 11))))
        );
    });
    // PROBLEM SOLVED: entangled concerns

    // PROBLEMS: no failure handling, signature lies
    // STEP 2: Introduce orElse
    test('introduceOrElse', () => {
        const year = F.resolve(996);
        const noYear = F.reject("no year");

        const program1 = year.orElse(F.resolve(2020));
        const program2 = noYear.orElse(F.resolve(2020));
        const program3 = year.orElse(F.reject("can't recover"));
        const program4 = noYear.orElse(F.reject("can't recover"));

        program1.pipe(F.fork
            (expectNothing)
            (v => expect(v).toEqual(996))
        );
        program2.pipe(F.fork
            (expectNothing)
            (v => expect(v).toEqual(2020))
        );
        program3.pipe(F.fork
            (expectNothing)
            (v => expect(v).toEqual(996))
        );
        program4.pipe(F.fork
            ((e) => expect(e).toBe("can't recover"))
            (expectNothing)
        );
    });

    const Version2 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         * @returns 
         */
        schedule: (person1, person2, lengthHours) => F.go(function* () {
            const existingMeetings = yield scheduledMeetings(person1, person2)
                .orElse(scheduledMeetings(person1, person2))
                .orElse(F.resolve(List()));
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            return meetings.headOption();
        })
    }

    test('runVersion2', () => {
        Version2.schedule("Alice", "Bob", 1).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true))
        );
        Version2.schedule("Alice", "Bob", 2).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 2)).toBe(true))
        );
        Version2.schedule("Alice", "Bob", 3).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 3)).toBe(true))
        );
        Version2.schedule("Alice", "Bob", 4).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 4)).toBe(true))
        );
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
        schedule: (person1, person2, lengthHours) => F.go(function* () {
            const existingMeetings = yield scheduledMeetings(person1, person2)
                .orElse(scheduledMeetings(person1, person2))
                .orElse(F.resolve(List()));

            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            const possibleMeeting = meetings.headOption();

            yield possibleMeeting.caseOf({
                Some: meeting => createMeeting(List.of(person1, person2), meeting),
                None: () => F.resolve()
            })

            return possibleMeeting;
        })
    }

    test('runVersion3', () => {
        Version3.schedule("Alice", "Bob", 1).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true))
        );
        Version3.schedule("Alice", "Bob", 2).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 2)).toBe(true))
        );
        Version3.schedule("Alice", "Bob", 3).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 3)).toBe(true))
        );
        Version3.schedule("Alice", "Bob", 4).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 4)).toBe(true))
        );
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
        .reduce((program, retryAction) => program.orElse(retryAction), action);

    test('runRetries', () => {
        const fn = jest.fn(() => {
            throw new Error("failed");
        })
        retry(
            F.attempt(fn),
            10
        ).pipe(F.fork
            (e => expect(e.message).toBe("failed"))
            (expectNothing)
        );
        expect(fn).toHaveBeenCalledTimes(11);
    })

    const Version4 = {
        /**
         * 
         * @param {string} person1 
         * @param {string} person2 
         * @param {number} lengthHours 
         */
        schedule: (person1, person2, lengthHours) => F.go(function* () {
            const existingMeetings = yield retry(scheduledMeetings(person1, person2), 10)
                .orElse(F.resolve(List()));
            const meetings = possibleMeetings(existingMeetings, 8, 16, lengthHours);
            const possibleMeeting = meetings.headOption();

            yield possibleMeeting.caseOf({
                Some: meeting => retry(createMeeting(List.of(person1, person2), meeting), 10),
                None: () => F.resolve()
            });

            return possibleMeeting;
        })
    }

    test('runVersion4', () => {
        Version4.schedule("Alice", "Bob", 1).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(10, 11))))
        );
        Version4.schedule("Alice", "Bob", 2).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 14))))
        );
        Version4.schedule("Alice", "Bob", 3).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 15))))
        );
        Version4.schedule("Alice", "Bob", 4).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 16))))
        );
    })

    // STEP 5: any number of people attending
    /**
     * NOTE: alternative to List of IO flatten
     * @param {List<string>} attendees 
     */
    const scheduledMeetingsList = (attendees) => F.parallel(3)(
        attendees.map(attendee => retry(calendarEntries(attendee), 10)).toArray()
    ).pipe(F.map(lists => List(lists).flatten()))

    const Version5 = { // FINAL VERSION: also presented at the beginning of the chapter
        /**
         * 
         * @param {List<string>} attendees 
         * @param {number} lengthHours 
         */
        schedule: (attendees, lengthHours) => F.go(function* () {
            const existingMeetings = yield scheduledMeetingsList(attendees);
            const possibleMeeting = possibleMeetings(existingMeetings, 8, 16, lengthHours).headOption();

            yield possibleMeeting.caseOf({
                Some: meeting => createMeeting(attendees, meeting),
                None: () => F.resolve()
            })

            return possibleMeeting;
        })
    }

    test('runVersion5', () => {
        // note we can assert on fixed results here because
        // there is only a very very small chance we'll use a fallback
        // (because there is a 10-retry strategy in this version)
        Version5.schedule(List.of("Alice", "Bob"), 1).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(10, 11))))
        );
        Version5.schedule(List.of("Alice", "Bob"), 2).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 14))))
        );
        Version5.schedule(List.of("Alice", "Bob"), 3).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 15))))
        );
        Version5.schedule(List.of("Alice", "Bob"), 4).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting).toEqual(Some(MeetingTime(12, 16))))
        );
        Version5.schedule(List.of("Alice", "Bob", "Charlie"), 1).pipe(F.fork
            (expectNothing)
            (meeting => expect(meeting.forall(meeting => meeting.endHour - meeting.startHour == 1)).toBe(true))
        );
    })

    // BONUS: scheduledMeetings using foldLeft instead of sequence:
    test('bonus1', () => {
        /**
         * 
         * @param {List<string>} attendees 
         */
        const scheduledMeetings = (attendees) => attendees
            .map(attendee => retry(calendarEntries(attendee), 10))
            .reduce((allMeetingsProgram, attendeeMeetingsProgram) => F.go(function* () {
                const allMeetings = yield allMeetingsProgram;
                const attendeeMeetings = yield attendeeMeetingsProgram;
                return allMeetings.concat(attendeeMeetings);
            }), F.resolve(List()));

        scheduledMeetings(List.of("Alice", "Bob")).pipe(F.fork
            (expectNothing)
            (meetings => expect(meetings).toEqual(List.of(
                MeetingTime(8, 10),
                MeetingTime(11, 12),
                MeetingTime(9, 10)
            )))
        )

        scheduledMeetings(List.of("Alice", "Bob", "Charlie")).pipe(F.fork
            (expectNothing)
            (meetings => expect(meetings.size).toEqual(4))
        )

        scheduledMeetings(List()).pipe(F.fork
            (expectNothing)
            (meetings => expect(meetings).toEqual(List()))
        )
    })
});
