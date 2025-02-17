"use strict"

import { Data } from './Data'

import { Wheel } from './Wheel'
import React, { $, $$, isObservable, ObservableMaybe, Observable, useEffect, useMemo, batch, type JSX } from 'woby'
import { useViewportSize } from 'use-woby'

export type WheelerProps<A = never, B = never, C = never, D = never, E = never, F = never, G = never, H = never> = {
    title?: ObservableMaybe<JSX.Child>
    rows?: ObservableMaybe<number>
    rowHeight?: ObservableMaybe<number>
    hideOnBlur?: ObservableMaybe<boolean>
    commitOnBlur?: ObservableMaybe<boolean>
    disabled?: ObservableMaybe<boolean>
    onOk?: () => void
    onCancel?: () => void
    resetSelectedOnDataChanged?: ObservableMaybe<boolean>
    open: Observable<boolean>
    ok?: ObservableMaybe<string>
    cancel?: ObservableMaybe<string>
    checkbox?: ObservableMaybe<boolean>[]
    toolbar?: ObservableMaybe<boolean>
    noMask?: ObservableMaybe<boolean>
    commitOnOk?: ObservableMaybe<boolean>
}
// & (Data1<A> |
// Data2<A, B> |
// Data3<A, B, C> |
// Data4<A, B, C, D> |
// Data5<A, B, C, D, E> |
// Data6<A, B, C, D, E, F> |
// Data7<A, B, C, D, E, F, G> |
// Data8<A, B, C, D, E, F, G, H>)


// export function Wheeler<A>(props: WheelerProps & Data1<A>)
// export function Wheeler<A, B>(props: WheelerProps & Data2<A, B>)
// export function Wheeler<A, B, C>(props: WheelerProps & Data3<A, B, C>)
// export function Wheeler<A, B, C, D>(props: WheelerProps & Data4<A, B, C, D>)
// export function Wheeler<A, B, C, D, E>(props: WheelerProps & Data5<A, B, C, D, E>)
// export function Wheeler<A, B, C, D, E, F>(props: WheelerProps & Data6<A, B, C, D, E, F>)
// export function Wheeler<A, B, C, D, E, F, G>(props: WheelerProps & Data7<A, B, C, D, E, F, G>)
// export function Wheeler<A, B, C, D, E, F, G, H>(props: WheelerProps & Data8<A, B, C, D, E, F, G, H>)
// export function Wheeler<A, B, C, D, E, F, G, H>(props: WheelerProps & Data8<A, B, C, D, E, F, G, H>
//     & (Data1<A>
//         | Data2<A, B>
//         | Data3<A, B, C>
//         | Data4<A, B, C, D>
//         | Data5<A, B, C, D, E>
//         | Data6<A, B, C, D, E, F>
//         | Data7<A, B, C, D, E, F, G>
//         | Data8<A, B, C, D, E, F, G, H>)
// )

export function Wheeler<A>(props: WheelerProps & Data<A>) {
    const { data, rows = 5, rowHeight = 34,
        onCancel, onOk, disabled, open = $(true),
        value: oValue, title, hideOnBlur, commitOnBlur, resetSelectedOnDataChanged,
        ok = "OK"/* "取消" */, cancel = "Cancel",//"确定"
        headers, toolbar, noMask, valuer, renderer, checkboxer, checkbox, commitOnOk = $(false),
        //@ts-ignore
        disabler
    } = props

    const value = !$$(commitOnOk) ? oValue : oValue.map(v => $($$(v)))
    const closed = $<boolean>(true)

    const container = $<HTMLDivElement>()
    const restore = $<boolean>()
    const cancelled = $<boolean>()
    const oriValue = value.map(v => $$(v))
    const pdata = isObservable(data) ? data : $(data)

    //only for data change
    useEffect(() => {
        if (!Array.isArray($$(value)))
            console.error('value must be array.')

        const d = $$(data)
        // if (!Array.isArray(value) || d.length !== value.length)
        //     throw new Error('value & data not in same dimension')

        // if (!Array.isArray($$(value)) || d.length !== $$(value).length)
        //     throw new Error('value & data not in same dimension')

        if ($$(pdata) === d) return
        d.forEach((dd, i) => {
            // if (!value[i]) value[i] = $(d[i]()[0])
            // if (!value[i]()) value[i](d[i]()[0])
            // tempValue[i](value[i]())

            if (!value[i]) value[i] = $($$(d[i])[0] as any)
            if (!$$(value[i])) value[i]($$(d[i])[0] as any)
            // tempValue[i](value[i]())

        })
    });

    (() => {
        const d = $$(data)
        d.forEach((dd, i) => {
            // if (!value[i]) value[i] = $(d[i]()[0])
            // if (!value[i]()) value[i](d[i]()[0])
            // tempValue[i](value[i]())

            if (!value[i]) value[i] = $($$(d[i])[0] as any)
            if (!$$(value[i])) value[i]($$(d[i])?.[0] as any)
            // tempValue[i](value[i]())
        })


    })()
    $$(data).forEach((_, i) => {
        oriValue[i] = $$(value[i])
    })

    const _backdropTransEnd = () => {
        if (!$$(open)) {
            container().style.display = "none"
            closed(true)
        }
    }

    const _set = (silent?: boolean) => {
        cancelled(false)
        if (silent === true) return

        batch(() => {
            for (let i = 0; i < value.length; i++)
                // oriValue[i] = value[i]($$(tempValue[i]))
                oriValue[i] = $$(value[i] as any)

            if ($$(commitOnOk))
                for (let i = 0; i < value.length; i++)
                    oValue[i]($$(value[i]))

            // value.forEach((v, i) => oriValue[i] = v($$(tempValue[i])))
        })

        onOk?.()
        open(false)
    }

    useEffect(() => {
        if (restore())
            batch(() => {
                value.forEach((v, i) => v(oriValue[i] as any))
                // value.forEach((v, i) => v(oriValue[i]))
            })
    })

    const _cancel = () => {
        cancelled(restore(true))

        // batch(() => tempValue.forEach((v, i) => v(value[i]())))

        onCancel?.()
        open(false)
    }

    useEffect(() => {
        if ($$(open)) {
            if ($$(disabled) || !closed() || !$$(container)) return

            let cont = $$(container)

            closed(restore(false))

            cont.style.display = "block"
        }
    })

    const width = useMemo(() => (100 / $$(data).filter(f => !!$$(f as any)).length) + '%')
    const ws = useMemo(() => $$(data).map((v, i) => <Wheel
        rows={rows}
        rowHeight={rowHeight}
        width={width}
        data={v as any}
        resetSelectedOnDataChanged={resetSelectedOnDataChanged}
        value={value[i] as any}
        valuer={valuer?.[i] as any}
        renderer={(renderer?.[i] ?? (r => r)) as any}
        checkboxer={(checkboxer?.[i] ?? (r => null) as any)}
        checkbox={checkbox?.[i]}
        disabler={disabler?.[i] ?? (r => null) as any}
    />))

    const height = $$(rowHeight) * Math.floor($$(rows) / 2) - 1 + "px"
    const { width: w, height: h, offsetTop, offsetLeft } = useViewportSize()

    const s = useMemo(() => {
        return {
            height: $$(h),
            width: $$(w),
            top: $$(offsetTop),
            left: $$(offsetLeft)
        }
    })

    return () => !$$(open) ? null : <div ref={container} class="wheelpicker fixed w-full h-full z-[77] left-0 top-0" style={s} onDblClick={() => _set()}>
        <div class={['wheelpicker-backdrop duration-[0.4s] h-full bg-[rgba(0,0,0,0.5)] opacity-0 [transform:translateZ(0)]', () => $$(open) ? 'opacity-100' : '']} onTransitionEnd={_backdropTransEnd} onClick={() => $$(hideOnBlur) ? ($$(commitOnBlur) ? _set() : _cancel()) : null}></div>
        <div class={['wheelpicker-panel duration-[0.4s] absolute w-full bg-[#F7F7F7] text-base text-black select-none left-0 bottom-0 ',
            () => $$(open) ? '[transform:none]' : '[transform:translateY(100%)]',
            'absolute w-full z-[1000] p-2.5 bottom-0'
        ]}
        >
            {() => $$(toolbar) ?
                <div class='wheelpicker-actions overflow-hidden border-b-[#C6C6C6] border-b border-solid'>
                    <button type='button' class='btn-cancel text-sm h-11 px-[1em] py-0 [border:none] [background:none] float-left font-bold' onClick={_cancel}>{cancel}</button>
                    <button type='button' class='btn-set text-sm h-11 px-[1em] py-0 [border:none] [background:none] float-right text-[#1078FC] font-bold' onClick={() => _set()}>{ok}</button>
                    <h4 class='wheelpicker-title text-center text-[1em] m-0'>{title}</h4>
                </div> : null}

            {() => !$$(headers) ? null : $$(headers).map(h => <div class='inline-block text-center font-bold' style={{ width }} >{h as any}</div>)}
            <div class='wheelpicker-main relative bg-white'>
                <div class='wheelpicker-wheels flex justify-center'>
                    {ws}
                </div>

                {() => $$(noMask) ? null : <>
                    <div class='wheelpicker-mask absolute w-full pointer-events-none left-0 [transform:translateZ(0)] wheelpicker-mask-top h-3/6 top-0 [background:linear-gradient(to_bottom,#FFF,rgba(255,255,255,0.5)75%)]' style={{ height }}></div>
                    <div class='wheelpicker-mask absolute w-full pointer-events-none left-0 [transform:translateZ(0)] wheelpicker-mask-current h-[34px] mt-[-18px] border-y-[#C6C6C6] border-t border-solid border-b top-2/4'></div>
                    <div class='wheelpicker-mask absolute w-full pointer-events-none left-0 [transform:translateZ(0)] wheelpicker-mask-btm h-3/6 bottom-0 [background:linear-gradient(to_top,#FFF,rgba(255,255,255,0.5)75%)]' style={{ height }} ></div>
                </>}
            </div>
        </div>
    </div>
}




