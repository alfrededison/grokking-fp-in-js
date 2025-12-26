export * from 'ramda';
export { Record, List } from 'immutable';

export type Some<T> = {
    readonly _tag: 'Some';
    readonly value: T;
    isSome(): boolean;
    isNone(): boolean;
    concat<U>(other: Maybe<U>): Maybe<T | U>;
    map<U>(f: (value: T) => U): Some<U>;
    flat<U>(): U extends Maybe<infer V> ? Maybe<V> : never;
    flatten<U>(): U extends Maybe<infer V> ? Maybe<V> : never;
    flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>;
    extract(): T | null;
    extend<U>(f: (m: Maybe<T>) => U): Some<U>;
    ap<U>(a: Maybe<U>): Maybe<U>;
    biMap<U, V>(f: (value: never) => U, g: (value: T) => V): Some<V>;
    reduce<U>(f: (acc: U, value: T) => U, x: U): U;
    traverse<U, V>(f: (value: T) => U, A: any): any;
    sequence<U>(A: any): any;
    alt(a: Maybe<T>): Maybe<T>;
    caseOf<U>(p: { None: () => U; Some: (value: T) => U }): U;
    toRight<L>(leftValue: L): Either<L, T>;
    toList(): List<T>;
    toIntOption(): Maybe<number>;
    exists(predicate: (value: T) => boolean): boolean;
    forall(predicate: (value: T) => boolean): boolean;
    filter(predicate: (value: T) => boolean): Maybe<T>;
};
export type None = {
    readonly _tag: 'None';
    readonly value: null;
    isSome(): boolean;
    isNone(): boolean;
    concat<U>(other: Maybe<U>): Maybe<U>;
    map<U>(f: (value: never) => U): None;
    flat<U>(): None;
    flatten<U>(): None;
    flatMap<U>(f: (value: never) => Maybe<U>): None;
    extract(): null;
    extend<U>(f: (m: Maybe<never>) => U): None;
    ap<U>(a: Maybe<U>): None;
    biMap<U, V>(f: (value: never) => U, g: (value: never) => V): None;
    reduce<U>(f: (acc: U, value: never) => U, x: U): U;
    traverse<U, V>(f: (value: never) => U, A: any): any;
    sequence<U>(A: any): any;
    alt<U>(a: Maybe<U>): Maybe<U>;
    caseOf<U>(p: { None: () => U; Some: (value: never) => U }): U;
    toRight<L>(leftValue: L): Either<L, any>;
    toList(): List<any>;
    toIntOption(): Maybe<number>;
    exists(predicate: (value: never) => boolean): boolean;
    forall(predicate: (value: never) => boolean): boolean;
    filter(predicate: (value: never) => boolean): None;
};
export type Maybe<T> = Some<T> | None;
export function Some<T>(value: T): Some<T>;
export function None(): None;

export type Right<A> = {
    readonly _tag: 'Right';
    readonly value: A;
    isRight(): this is Right<A>;
    isLeft(): this is never;
    concat<B>(other: Either<B>): Either<A | B>;
    map<B>(f: (value: A) => B): Right<B>;
    flat<B>(): B extends Either<infer C> ? Either<C> : never;
    flatten<B>(): B extends Either<infer C> ? Either<C> : never;
    flatMap<B>(f: (value: A) => Either<B>): Either<B>;
    extract(): A;
    extend<B>(f: (m: Either<A>) => B): Either<B>;
    ap<B>(a: Either<A>): Either<B>;
    mapLeft<B>(f: (value: never) => B): Either<A>;
    biMap<B, C>(f: (value: never) => B, g: (value: A) => C): Either<C>;
    reduce<B>(f: (acc: B, value: A) => B, x: B): B;
    traverse<B, C>(f: (value: A) => B, A: any): any;
    sequence<B>(A: any): any;
    swap(): Left<A>;
    alt(a: Either<A>): Either<A>;
    caseOf<B>(p: { Left: (value: never) => B; Right: (value: A) => B }): B;
    toMaybe(): Maybe<A>;
    toList(): List<A>;
    toIntOption(): Maybe<number>;
    toIntEither<L>(leftValue: L): Either<L, number>;
};
export type Left<A> = {
    readonly _tag: 'Left';
    readonly value: A;
    isRight(): this is never;
    isLeft(): this is Left<A>;
    concat<B>(other: Either<B>): Left<A>;
    map<B>(f: (value: never) => B): Left<A>;
    flat<B>(): Left<A>;
    flatten<B>(): Left<A>;
    flatMap<B>(f: (value: never) => Either<B>): Left<A>;
    extract(): A;
    extend<B>(f: (m: Either<A>) => B): Left<B>;
    ap<B>(a: Either<A>): Left<A>;
    mapLeft<B>(f: (value: A) => B): Either<B>;
    biMap<B, C>(f: (value: A) => B, g: (value: never) => C): Either<B>;
    reduce<B>(f: (acc: B, value: never) => B, x: B): B;
    traverse<B, C>(f: (value: never) => B, A: any): any;
    sequence<B>(A: any): any;
    swap(): Right<A>;
    alt<B>(a: Either<B>): Either<B>;
    caseOf<B>(p: { Left: (value: A) => B; Right: (value: never) => B }): B;
    toMaybe(): Maybe<never>;
    toList(): List<never>;
    toIntOption(): Maybe<number>;
    toIntEither<L>(leftValue: L): Either<L, number>;
}
export type Either<A, B> = Left<A> | Right<B>;
export function Right<A>(value: A): Right<A>;
export function Left<A>(value: A): Left<A>;

declare global {
    interface String {
        toIntOption(): Maybe<number>;
        toIntEither<L>(leftValue: L): Either<L, number>;
    }
}