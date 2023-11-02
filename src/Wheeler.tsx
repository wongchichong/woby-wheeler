"use strict"

//import './WheelPicker.scss'
import '../dist/output.css'
import { Data } from './Data'

import { Wheel } from './Wheel'
import { $, $$, isObservable, ObservableMaybe, Observable, useEffect, useMemo, batch, useSuspended, type JSX } from 'woby'



export type WheelerProps<A = never, B = never, C = never, D = never, E = never, F = never, G = never, H = never> = {
    title?: ObservableMaybe<JSX.Child>
    rows?: ObservableMaybe<number>
    rowHeight?: ObservableMaybe<number>
    hideOnBackdrop?: ObservableMaybe<boolean>
    disabled?: ObservableMaybe<boolean>
    onCancel?: () => void
    resetSelectedOnDataChanged?: ObservableMaybe<boolean>
    open: Observable<boolean>
    ok?: ObservableMaybe<string>
    cancel?: ObservableMaybe<string>
    checkbox?: ObservableMaybe<boolean>[]
    toolbar?: ObservableMaybe<boolean>
    noMask?: ObservableMaybe<boolean>
} & Data<A, B, C, D, E, F, G, H>


export const Wheeler = <A = never, B = never, C = never, D = never, E = never, F = never, G = never, H = never>(props: WheelerProps<A, B, C, D, E, F, G, H>) => {
    const { data, rows = 5, rowHeight = 34,
        onCancel, disabled, open = $(true),
        value, title, hideOnBackdrop, resetSelectedOnDataChanged,
        ok = "OK"/* "取消" */, cancel = "Cancel",//"确定"
        headers, toolbar, noMask, valuer, renderer, checkboxer, checkbox, disabler
    } = props

    const closed = $<boolean>(true)

    const container = $<HTMLDivElement>()
    const restore = $<boolean>()
    const cancelled = $<boolean>()
    const oriValue = value.map(v => v())
    const pdata = isObservable(data) ? data : $(data)

    // useEffect(() => console.log(props, value))

    //only for data change
    useEffect(() => {
        // if (!Array.isArray(value))
        //     console.error('value must be array.')

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
            if (!value[i]()) value[i]($$(d[i])[0] as any)
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
            if (!value[i]()) value[i]($$(d[i])[0] as any)
            // tempValue[i](value[i]())
        })


    })()
    $$(data).forEach((_, i) => {
        oriValue[i] = value[i]()
    })

    const _backdropTransEnd = () => {
        if (!$$(open)) {
            container().style.display = "none"
            closed(true)
        }
    }

    // useEffect(() => console.log($$(tempValue[1])))
    const _set = (silent?: boolean) => {
        cancelled(false)
        if (silent === true) return

        batch(() => {
            for (let i = 0; i < value.length; i++)
                // oriValue[i] = value[i]($$(tempValue[i]))
                oriValue[i] = $$(value[i] as any)

            // value.forEach((v, i) => oriValue[i] = v($$(tempValue[i])))
        })

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
            if ($$(disabled) || !closed()) return

            let cont = container()

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

    return <div ref={container} className="wheelpicker fixed w-full h-full hidden z-[77] left-0 top-0" /* class={[{ 'shown': shown }]} */ /* style={{ display: () => shown() ? 'block' : 'none' }} */>
        <div class={['wheelpicker-backdrop duration-[0.4s] h-full bg-[rgba(0,0,0,0.5)] opacity-0 [transform:translateZ(0)]', () => $$(open) ? 'opacity-100' : '']} onTransitionEnd={_backdropTransEnd} onClick={() => $$(hideOnBackdrop) ? _cancel() : null}></div>
        <div class={['wheelpicker-panel duration-[0.4s] absolute w-full bg-[#F7F7F7] text-base text-black select-none left-0 bottom-0 ',
            () => $$(open) ? '[transform:none]' : '[transform:translateY(100%)]'
        ]}
            style={{
                // transform: () => $$(shown) ? 'transform:none' : 'translate3d(0,100%,0)'
            }}
        >
            {() => $$(toolbar) ?
                <div class='wheelpicker-actions overflow-hidden border-b-[#C6C6C6] border-b border-solid'>
                    <button type='button' class='btn-cancel text-sm h-11 px-[1em] py-0 [border:none] [background:none] float-left font-bold' onClick={_cancel}>{cancel}</button>
                    <button type='button' class='btn-set text-sm h-11 px-[1em] py-0 [border:none] [background:none] float-right text-[#1078FC] font-bold' onClick={() => _set()}>{ok}</button>
                    <h4 class='wheelpicker-title text-center text-[1em] leading-[44px] m-0'>{title}</h4>
                </div> : null}

            {() => !$$(headers) ? null : $$(headers).map(h => <div class='inline-block text-center font-bold' style={{ width }} >{h}</div>)}
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
    </div >
}




