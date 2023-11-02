"use strict"

import '../dist/output.css'

import { Wheel } from './Wheel'
import { $, $$, isObservable, ObservableMaybe, Observable, useEffect, useMemo, batch, useSuspended, type JSX } from 'woby'

import { Wheeler } from "./Wheeler"


export type DateWheelerProps = {
    min?: ObservableMaybe<number>,
    max?: ObservableMaybe<number>,
    hasYear?: ObservableMaybe<boolean>,
    hasMonth?: ObservableMaybe<boolean>,
    hasDay?: ObservableMaybe<boolean>,
    hasHour?: ObservableMaybe<boolean>,
    hasMinute?: ObservableMaybe<boolean>,
    hasSecond?: ObservableMaybe<boolean>,
    headers?: ObservableMaybe<string>[],
    format?: (value: Observable<number | string>[]) => string
    value?: ObservableMaybe<Date | number[]>
    shown?: Observable<boolean>
    title?: JSX.Child
}
export const DateWheeler = (props?: DateWheelerProps) => {
    const { max = 2101, min = 1900, hasYear = $(true), hasMonth = $(true), hasDay = $(true), hasHour, hasMinute, hasSecond,
        format = (value: Observable<number | string>[]) => value.slice(0, 3).map(v => $$(v) + '').join(' ') + ' ' + value.slice(3).map(v => ($$(v) + '').padStart(2, '0')).join(':'),
        headers = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
        shown = $(false),
        title = <div class='font-bold' > {() => format(value as any)}</div >
    } = props ?? {}

    const years = Array.from({ length: $$(max) - $$(min) }, (_, i) => $$(min) + i)
    type MT = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' |
        'July' | 'August' | 'September' | 'October' | 'November' | 'December'
    const Months: MT[] = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    /** month = base 0 */
    function days(year: number, month: number) {
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastDayOfMonth.getDate()
        return Array.from({ length: daysInMonth }, (_, i) => i + 1)
    }

    const date: Observable<Date> = (isObservable(props.value) ? props.value ?? new Date() : $(props.value ?? new Date())) as any

    const dt = useMemo(() => [
        $$(hasYear) ? $(years) : undefined, //state
        $$(hasMonth) ? $(Months) : undefined, //Object.keys(data[defaultProv]), //city
        $$(hasDay) ? $(0) : undefined, //$(days(+$$(dv[0]), months.indexOf(($$(dv[1]) ?? 'January') + '')))//data[defaultProv][Object.keys(data[defaultProv])[0]] //district
        $$(hasHour) || $$(hasMinute) || $$(hasSecond) ? $(Array.from({ length: 24 - 0 }, (_, i) => 0 + i)) : undefined,
        $$(hasMinute) || $$(hasSecond) ? $(Array.from({ length: 60 - 0 }, (_, i) => 0 + i)) : undefined,
        $$(hasSecond) ? $(Array.from({ length: 60 - 0 }, (_, i) => 0 + i)) : undefined,
    ].filter(n => !!n) as [Observable<number[]>, Observable<string[]>, Observable<number[]>, Observable<number[]>?, Observable<number[]>?, Observable<number[]>?]
    )

    const value: Observable<number | string>[] = $$(date) instanceof Date && $$(date) + '' !== 'Invalid Date' ?
        [
            $$(hasYear) ? $($$(date).getFullYear()) : undefined,
            $$(hasMonth) ? $(Months[$$(date).getMonth()]) : undefined,
            $$(hasDay) ? $($$(date).getDate()) : undefined,
            $$(hasHour) || $$(hasMinute) || $$(hasSecond) ? $($$(date).getHours()) : undefined,
            $$(hasMinute) || $$(hasSecond) ? $($$(date).getMinutes()) : undefined,
            $$(hasSecond) ? $($$(date).getSeconds()) : undefined,
        ].filter(n => typeof n !== 'undefined') as any
        : isObservable(props.value) ? props.value : $(props.value)


    useEffect(() => {
        const l1 = $$(value[0])
        const l2 = $$(value[1])

        if ($$(hasDay))
            if ($$(hasMonth) && $$(hasYear)) {
                const ds = days(+l1, Months.indexOf((l2 + '') as any))
                if ($$($$(dt)[2]).length !== ds.length)
                    $$(dt)[2](ds)

                const l3 = $$(value[2])
                // const ds = $$(dt[2])
                if (+l3 > ds.length)
                    value[2](ds[ds.length - 1])
            }
    })

    useEffect(() => {
        const d = new Date(+$$(value[0]), Months.indexOf(($$(value[1]) + '') as any), + $$(value[2]), ($$(value[3]) as any) ?? 0, ($$(value[4]) as any) ?? 0, ($$(value[5]) as any) ?? 0)
        if (d + '' === 'Invalid Date' || !($$(hasYear) && $$(hasMonth) && $$(hasDay)))
            date([...value] as any)
        else
            date(new Date(+$$(value[0]), Months.indexOf(($$(value[1]) + '') as any), + $$(value[2]), ($$(value[3]) as any) ?? 0, ($$(value[4]) as any) ?? 0, ($$(value[5]) as any) ?? 0))
    })
    return <Wheeler
        data={dt as any}
        value={value as any}
        title={title}
        headers={(() => headers.slice(0, $$(dt).length)) as any}
        open={shown}
        toolbar
    />
}
