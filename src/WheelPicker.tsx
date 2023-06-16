"use strict"

import './WheelPicker.scss'

import { Wheel, Data } from './Wheel'
import { $, $$, isObservable, Observable, useEffect, useMemo, batch } from 'voby'


export type OptionType = {
    title?: ObservableMaybe<Child>
    rows?: ObservableMaybe<number>
    rowHeight?: ObservableMaybe<number>
    data?: (Observable<string[]> | Observable<Data[]>)[]
    hideOnBackdrop?: ObservableMaybe<boolean>
    disabled?: ObservableMaybe<boolean>
    onShow?: () => void
    onCancel?: () => void
    value: Observable<string | Data>[]
    tempValue: Observable<string | Data>[]
    resetSelectedOnDataChanged?: ObservableMaybe<boolean>
    displayElement?: ObservableMaybe<HTMLInputElement>
    invokeElement?: ObservableMaybe<HTMLInputElement>
    shown: Observable<boolean>
}

export const WheelPicker = (props: OptionType) => {
    const { data, rows = 5, rowHeight = 34,
        onCancel, onShow, disabled, shown,
        value, tempValue, title, hideOnBackdrop, resetSelectedOnDataChanged,
        displayElement, invokeElement
    } = props

    const closed = $<boolean>(true)

    const container = $<HTMLDivElement>()
    const restore = $<boolean>()
    const cancelled = $<boolean>()
    const oriValue = value.map(v => v())

    useEffect(() => {
        if (!Array.isArray(value))
            console.error('value must be array.')

        if (!Array.isArray(tempValue))
            console.error('tempValue must be array.')

        const d = data
        if (!Array.isArray(value) || d.length !== value.length)
            throw new Error('value & data not in same dimension')

        if (!Array.isArray(tempValue) || d.length !== tempValue.length)
            throw new Error('tempValue & data not in same dimension')

        d.forEach((dd, i) => {
            if (!value[i]) value[i] = $(d[i]()[0])
            if (!value[i]()) value[i](d[i]()[0])
            tempValue[i](value[i]())
        })
    })

    data.forEach((_, i) => {
        oriValue[i] = value[i]()
    })

    const _backdropTransEnd = () => {
        if (!shown()) {
            container().style.display = "none"
            closed(true)
        }
    }

    const _set = (silent?: boolean) => {
        cancelled(false)
        if (silent === true) return

        batch(() => value.forEach((v, i) => oriValue[i] = v(tempValue[i]())))

        shown(false)
    }

    useEffect(() => {
        if (restore())
            batch(() => {
                tempValue.forEach((v, i) => v(oriValue[i]))
                value.forEach((v, i) => v(oriValue[i]))
            })
    })

    const _cancel = () => {
        cancelled(restore(true))

        batch(() => tempValue.forEach((v, i) => v(value[i]())))

        onCancel?.()
        shown(false)
    }

    useEffect(() => {
        if (shown()) {
            if ($$(disabled) || !closed()) return

            let cont = container()

            closed(restore(false))

            cont.style.display = "block"

            onShow?.()
        }
    })

    const width = useMemo(() => (100 / data.filter(f => !!f()).length) + '%')
    const ws = useMemo(() => data.map((v, i) => <Wheel
        rows={rows}
        rowHeight={rowHeight}
        width={width}
        data={v}
        resetSelectedOnDataChanged={resetSelectedOnDataChanged}
        value={tempValue[i]}
    />))

    const height = $$(rowHeight) * Math.floor($$(rows) / 2) - 1 + "px"

    return <div ref={container} className="wheelpicker" class={[{ 'shown': shown }]} /* style={{ display: () => shown() ? 'block' : 'none' }} */>
        <div class='wheelpicker-backdrop' onTransitionEnd={_backdropTransEnd} onClick={$$(hideOnBackdrop) ? _cancel : null}></div>
        <div class='wheelpicker-panel'>
            <div class='wheelpicker-actions'>
                <button type='button' class='btn-cancel' onClick={_cancel}>取消</button>
                <button type='button' class='btn-set' onClick={() => _set()}>确定</button>
                <h4 class='wheelpicker-title'>{$$(title)}</h4>
            </div>
            <div class='wheelpicker-main'>
                <div class='wheelpicker-wheels'>
                    {ws}
                </div>
                <div class='wheelpicker-mask wheelpicker-mask-top' style={{ height }}></div>
                <div class='wheelpicker-mask wheelpicker-mask-current'></div>
                <div class='wheelpicker-mask wheelpicker-mask-btm' style={{ height }} ></div>
            </div>
        </div>
    </div>
}

