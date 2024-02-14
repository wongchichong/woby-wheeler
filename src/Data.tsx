"use strict"

//import './WheelPicker.scss'
// import '../dist/output.css'

// import { Wheel } from './Wheel'
import { $, $$, isObservable, ObservableMaybe, Observable, type JSX } from 'woby'

// type ObservableMaybe<T> = JSX.ObservableMaybe<T>

type Primitive = string | number | boolean | null | undefined | symbol | bigint

export type Data<A> =
    {
        data?: ObservableMaybe<A[]>[]
        headers?: ObservableMaybe<A>[]
        value: Observable<(A | Primitive)>[]
        renderer?: ((row: A) => JSX.Child)[]
        valuer?: ((row: A) => any)[]
        checkboxer?: ((row: A) => Observable<boolean>)[]
        disabler?: ((row: A) => Observable<boolean>)[]
        format?: ((value: A) => string)[]
    }

export type Data1<A> =
    {
        data?: [ObservableMaybe<A[]>]
        headers?: [ObservableMaybe<A>]
        value: [Observable<(A | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child]
        valuer?: [(row: A) => any]
        checkboxer?: [(row: A) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>]
        format?: [(value: A) => string]
    }

export type Data2<A, B> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string]
    }

export type Data3<A, B, C,> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any, (row: C) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string, (value: C) => string]
    }

export type Data4<A, B, C, D> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string]
    }

export type Data5<A, B, C, D, E,> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string]
    }

export type Data6<A, B, C, D, E, F> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>, ObservableMaybe<F[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>, ObservableMaybe<F>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>, Observable<(F | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child, (row: F) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any, (row: F) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string, (value: F) => string]
    }

export type Data7<A, B, C, D, E, F, G> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>, ObservableMaybe<F[]>, ObservableMaybe<G[]>]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>, ObservableMaybe<F>, ObservableMaybe<G>]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>, Observable<(F | Primitive)[]>, Observable<(G | Primitive)[]>]
        renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child, (row: F) => JSX.Child, (row: G) => JSX.Child]
        valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any, (row: F) => any, (row: G) => any]
        checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>, (row: G) => Observable<boolean>]
        disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>, (row: G) => Observable<boolean>]
        format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string, (value: F) => string, (value: G) => string]
    }

export type Data8<A, B, C, D, E, F, G, H> =
    {
        data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>?, ObservableMaybe<C[]>?, ObservableMaybe<D[]>?, ObservableMaybe<E[]>?, ObservableMaybe<F[]>?, ObservableMaybe<G[]>?, ObservableMaybe<H[]>?]
        headers?: [ObservableMaybe<A>, ObservableMaybe<B>?, ObservableMaybe<C>?, ObservableMaybe<D>?, ObservableMaybe<E>?, ObservableMaybe<F>?, ObservableMaybe<G>?, ObservableMaybe<H>?]
        value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>?, Observable<(C | Primitive)[]>?, Observable<(D | Primitive)[]>?, Observable<(E | Primitive)[]>?, Observable<(F | Primitive)[]>?, Observable<(G | Primitive)[]>?, Observable<(H | Primitive)[]>?]
        renderer?: [(row: A) => JSX.Child, ((row: B) => JSX.Child)?, ((row: C) => JSX.Child)?, ((row: D) => JSX.Child)?, ((row: E) => JSX.Child)?, ((row: F) => JSX.Child)?, ((row: G) => JSX.Child)?, ((row: H) => JSX.Child)?]
        valuer?: [(row: A) => any, ((row: B) => any)?, ((row: C) => any)?, ((row: D) => any)?, ((row: E) => any)?, ((row: F) => any)?, ((row: G) => any)?, ((row: H) => any)?]
        checkboxer?: [(row: A) => Observable<boolean>, ((row: B) => Observable<boolean>)?, ((row: C) => Observable<boolean>)?, ((row: D) => Observable<boolean>)?, ((row: E) => Observable<boolean>)?, ((row: F) => Observable<boolean>)?, ((row: G) => Observable<boolean>)?, ((row: H) => Observable<boolean>)?]
        disabler?: [(row: A) => Observable<boolean>, ((row: B) => Observable<boolean>)?, ((row: C) => Observable<boolean>)?, ((row: D) => Observable<boolean>)?, ((row: E) => Observable<boolean>)?, ((row: F) => Observable<boolean>)?, ((row: G) => Observable<boolean>)?, ((row: H) => Observable<boolean>)?]
        format?: [(value: A) => string, ((value: B) => string)?, ((value: C) => string)?, ((value: D) => string)?, ((value: E) => string)?, ((value: F) => string)?, ((value: G) => string)?, ((value: H) => string)?]
    }

// export type Data<A = never, B = never, C = never, D = never, E = never, F = never, G = never, H = never> =
//     {
//         data?: [ObservableMaybe<A[]>]
//         headers?: [ObservableMaybe<A>]
//         value: [Observable<(A | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child]
//         valuer?: [(row: A) => any]
//         checkboxer?: [(row: A) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>]
//         format?: [(value: A) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any, (row: C) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string, (value: C) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>, ObservableMaybe<F[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>, ObservableMaybe<F>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>, Observable<(F | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child, (row: F) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any, (row: F) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string, (value: F) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>, ObservableMaybe<C[]>, ObservableMaybe<D[]>, ObservableMaybe<E[]>, ObservableMaybe<F[]>, ObservableMaybe<G[]>]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>, ObservableMaybe<C>, ObservableMaybe<D>, ObservableMaybe<E>, ObservableMaybe<F>, ObservableMaybe<G>]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>, Observable<(C | Primitive)[]>, Observable<(D | Primitive)[]>, Observable<(E | Primitive)[]>, Observable<(F | Primitive)[]>, Observable<(G | Primitive)[]>]
//         renderer?: [(row: A) => JSX.Child, (row: B) => JSX.Child, (row: C) => JSX.Child, (row: D) => JSX.Child, (row: E) => JSX.Child, (row: F) => JSX.Child, (row: G) => JSX.Child]
//         valuer?: [(row: A) => any, (row: B) => any, (row: C) => any, (row: D) => any, (row: E) => any, (row: F) => any, (row: G) => any]
//         checkboxer?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>, (row: G) => Observable<boolean>]
//         disabler?: [(row: A) => Observable<boolean>, (row: B) => Observable<boolean>, (row: C) => Observable<boolean>, (row: D) => Observable<boolean>, (row: E) => Observable<boolean>, (row: F) => Observable<boolean>, (row: G) => Observable<boolean>]
//         format?: [(value: A) => string, (value: B) => string, (value: C) => string, (value: D) => string, (value: E) => string, (value: F) => string, (value: G) => string]
//     } |
//     {
//         data?: [ObservableMaybe<A[]>, ObservableMaybe<B[]>?, ObservableMaybe<C[]>?, ObservableMaybe<D[]>?, ObservableMaybe<E[]>?, ObservableMaybe<F[]>?, ObservableMaybe<G[]>?, ObservableMaybe<H[]>?]
//         headers?: [ObservableMaybe<A>, ObservableMaybe<B>?, ObservableMaybe<C>?, ObservableMaybe<D>?, ObservableMaybe<E>?, ObservableMaybe<F>?, ObservableMaybe<G>?, ObservableMaybe<H>?]
//         value: [Observable<(A | Primitive)[]>, Observable<(B | Primitive)[]>?, Observable<(C | Primitive)[]>?, Observable<(D | Primitive)[]>?, Observable<(E | Primitive)[]>?, Observable<(F | Primitive)[]>?, Observable<(G | Primitive)[]>?, Observable<(H | Primitive)[]>?]
//         renderer?: [(row: A) => JSX.Child, ((row: B) => JSX.Child)?, ((row: C) => JSX.Child)?, ((row: D) => JSX.Child)?, ((row: E) => JSX.Child)?, ((row: F) => JSX.Child)?, ((row: G) => JSX.Child)?, ((row: H) => JSX.Child)?]
//         valuer?: [(row: A) => any, ((row: B) => any)?, ((row: C) => any)?, ((row: D) => any)?, ((row: E) => any)?, ((row: F) => any)?, ((row: G) => any)?, ((row: H) => any)?]
//         checkboxer?: [(row: A) => Observable<boolean>, ((row: B) => Observable<boolean>)?, ((row: C) => Observable<boolean>)?, ((row: D) => Observable<boolean>)?, ((row: E) => Observable<boolean>)?, ((row: F) => Observable<boolean>)?, ((row: G) => Observable<boolean>)?, ((row: H) => Observable<boolean>)?]
//         disabler?: [(row: A) => Observable<boolean>, ((row: B) => Observable<boolean>)?, ((row: C) => Observable<boolean>)?, ((row: D) => Observable<boolean>)?, ((row: E) => Observable<boolean>)?, ((row: F) => Observable<boolean>)?, ((row: G) => Observable<boolean>)?, ((row: H) => Observable<boolean>)?]
//         format?: [(value: A) => string, ((value: B) => string)?, ((value: C) => string)?, ((value: D) => string)?, ((value: E) => string)?, ((value: F) => string)?, ((value: G) => string)?, ((value: H) => string)?]
//     }