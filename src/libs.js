// Re-export base libs
export * from 'ramda';

// Consolidate Types and FP utils
import { liftN, any } from 'ramda';
import { Record, List, Set, Map } from 'immutable';
import * as Futils from 'futils';

const { Maybe, Either } = Futils.data;
const { Some, None } = Maybe;
const { Left, Right } = Either;
const { UnionType } = Futils.adt;
const { Show, Eq, Ord } = Futils.generics;

/* eslint-disable */
Maybe.fn.toRight = function toRight(leftValue) {
    return this.isSome() ? Right(this.value) : Left(leftValue);
}

Either.fn.toMaybe = function toMaybe() {
    return this.isRight() ? Some(this.value) : None();
}

Maybe.fn.toList = function toList() {
    return this.isSome() ? List.of(this.value) : List();
}

Either.fn.toList = function toList() {
    return this.isRight() ? List.of(this.value) : List();
}

String.prototype.toIntOption = function toIntOption() {
    const num = parseInt(this, 10);
    return Number.isNaN(num) ? None() : Some(num);
}

Maybe.fn.toIntOption = function toIntOption() {
    return this.isSome() ? this.value.toIntOption() : this;
}

Either.fn.toIntOption = function toIntOption() {
    return this.isRight() ? this.value.toIntOption() : None();
}

Either.fn.toIntEither = function toIntEither(leftValue) {
    return this.isRight() ? this.value.toIntOption().toRight(leftValue) : this;
}

Maybe.fn.forall = function forall(predicate) {
    return this.isSome() ? predicate(this.value) : true;
}

Maybe.fn.filter = function filter(predicate) {
    return this.isSome() && predicate(this.value) ? this : None();
}

Maybe.fn.exists = function exists(predicate) {
    return this.isSome() ? predicate(this.value) : false;
}

Maybe.fn.contains = function contains(value) {
    return this.isSome() ? this.value === value : false;
}

Maybe.fn.flatten = Maybe.fn.flat
Either.fn.flatten = Either.fn.flat

class Hash {
    static derive(ctor) {
        if (ctor && ctor.prototype && !ctor.prototype.hashCode) {
            ctor.prototype.hashCode = function () {
                return JSON.stringify(this)
            };
            return ctor;
        }
        throw `Cannot derive Hashable for ${ctor}`;
    }
}

List.prototype.exists = function exists(predicate) {
    return any(predicate, this.toArray());
}

List.prototype.headOption = function headOption() {
    return this.isEmpty() ? None() : Some(this.first());
}

const ffor = (fn) => (...args) => liftN(args.length, fn)(...args);

/* eslint-enable */

export {
    Record,
    List,
    Set,
    Map,
    UnionType,
    Show,
    Eq,
    Ord,
    Hash,
    Some,
    None,
    Left,
    Right,
    Maybe,
    Either,
    ffor,
}
