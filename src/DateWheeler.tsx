"use strict"

// import '../dist/output.css'

// import { Wheel } from './Wheel'
import { $, $$, isObservable, ObservableMaybe, Observable, useEffect, useMemo, batch, useSuspended, type JSX } from 'woby'

import { Wheeler } from "./Wheeler"

const currentYear = new Date(Date.now()).getFullYear()

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
    title?: (d: Observable<Date>) => JSX.Child
    commitOnOk?: ObservableMaybe<boolean>
}

const get = (d: Date) => {
    const year = d.getFullYear()
    const month = d.getMonth()
    const day = d.getDate()
    const hour = d.getHours()
    const minute = d.getMinutes()
    const second = d.getSeconds()

    return { year, month, day, hour, minute, second }
}
export const DateWheeler = (props?: DateWheelerProps) => {
    const { max = 2101, min = 1900, hasYear = $(true), hasMonth = $(true), hasDay = $(true), hasHour, hasMinute, hasSecond,
        // format = (value: Observable<number | string>[]) => value.slice(0, 3).map(v => $$(v) + '').join(' ') + ' ' + value.slice(3).map(v => ($$(v) + '').padStart(2, '0')).join(':'),
        headers = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
        shown = $(false),
        title = (value: Observable<Date>) => <div class='font-bold' > {() => $$(value).toLocaleDateString()}</div>,
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

    const oDate: Observable<Date> = (isObservable(props.value) ? props.value : $(props.value ?? new Date())) as any
    const date: Observable<Date> = $($$(oDate))

    useEffect(() => { date($$(oDate)) })

    useEffect(() => console.log($$(date), $$(oDate), $$(value[0]), $$(value[1]), $$(value[2])))

    useEffect(() => { (!$$(date) || isNaN(+$$(date))) && date(new Date()) })
        ; (!$$(date) || isNaN(+$$(date))) && date(new Date())

    const dt = useMemo(() => [
        $$(hasYear) ? $(years) : undefined, //state
        $$(hasMonth) ? $(Months) : undefined, //Object.keys(data[defaultProv]), //city
        $$(hasDay) ? $(days($$(date).getFullYear(), $$(date).getMonth())) : undefined, //$(days(+$$(dv[0]), months.indexOf(($$(dv[1]) ?? 'January') + '')))//data[defaultProv][Object.keys(data[defaultProv])[0]] //district
        $$(hasHour) || $$(hasMinute) || $$(hasSecond) ? $(Array.from({ length: 24 - 0 }, (_, i) => 0 + i)) : undefined,
        $$(hasMinute) || $$(hasSecond) ? $(Array.from({ length: 60 - 0 }, (_, i) => 0 + i)) : undefined,
        $$(hasSecond) ? $(Array.from({ length: 60 - 0 }, (_, i) => 0 + i)) : undefined,
    ].filter(n => !!n) as [Observable<number[]>?, Observable<string[]>?, Observable<number[]>?, Observable<number[]>?, Observable<number[]>?, Observable<number[]>?]
    )

    const value: [Observable<number>?, Observable<string>?, Observable<number>?, Observable<number>?, Observable<number>?, Observable<number>?] = ((() => {
        const { year, month, day, hour, minute, second } = get($$(date))
        const [hY, hM, hD, hH, hm, hS] = [$$(hasYear), $$(hasMonth), $$(hasDay), $$(hasHour), $$(hasMinute), $$(hasSecond)]

        return [
            $(hY ? year : undefined),
            $<string>(hM ? Months[month] : undefined),
            $(hD ? day : undefined),
            $(hH || hm || hS ? hour : undefined),
            $(hm || hS ? minute : undefined),
            $(hS ? second : undefined),
        ] //.filter(n => !!n) 
    }))()

    useEffect(() => {
        const { year, month, day, hour, minute, second } = get($$(oDate))
        const [hY, hM, hD, hH, hm, hS] = [$$(hasYear), $$(hasMonth), $$(hasDay), $$(hasHour), $$(hasMinute), $$(hasSecond)]

        let i = 0
        /* hY && */ value[0](year)
        /* hM && */ value[1](Months[month])
        /* hD && */ value[2](day)
        /* (hH || hm || hS) && */ value[3](hour)
        /* (hm || hS) && */ value[4](minute)
        /* hS &&  */value[5](second)
    })


    //change date
    const d = useMemo(() => {
        // const { year, month, day, hour, minute, second } = get($$(date))
        const year = $$(value[0])
        const month = $$(value[1])
        const day = $$(value[2])
        const hour = $$(value[3])
        const minute = $$(value[4])
        const second = $$(value[5])

        if ($$(hasDay))
            if ($$(hasMonth) && $$(hasYear)) {
                const ds = days(+year, Months.indexOf((month + '') as any))
                if ($$($$(dt)[2]).length !== ds.length)
                    $$(dt)[2](ds)

                const l3 = day
                // const ds = $$(dt[2])
                if (+l3 > ds.length)
                    value[2](ds[ds.length - 1])
            }

        let y: number, M: string, d: number, h: number, m: number, s: number

        const [hY, hM, hD, hH, hm, hS] = [$$(hasYear), $$(hasMonth), $$(hasDay), $$(hasHour), $$(hasMinute), $$(hasSecond)]

        let i = 0

        //value late
        if (hY) y = year //value[i++]() as any as number
        if (hM) M = month  //value[i++]() as any as string
        if (hD) d = day //value[i++]() as number
        if (hH || hm || hS) h = hour // value[i++]() as number
        if (hm || hS) m = minute //value[i++]() as number
        if (hS) s = second //value[i++]() as number

        //if (!(hY && year === y) || !(hM && Months[month] === (M ?? Months[0])) || !(hD && day === (d ?? 1)) || !(hH && hour === (h ?? 0)) || !(hm && minute === (m ?? 0)) || !(hS && second === (s ?? 0)))
        return new Date(y ?? currentYear, M ? Months.indexOf(($$(value[1]) + '') as any) : 0, d ?? 1, h ?? 0, m ?? 0, s ?? 0)
        // else
        //     return $$(date)
    })

    //value to date
    useEffect(() => {
        // console.log('value to data', $$(date).toString(), $$(d).toString())
        if (+$$(date) !== +$$(d))
            date($$(d))
        // if (d + '' === 'Invalid Date' || !($$(hasYear) && $$(hasMonth) && $$(hasDay)))
        //     date([...value] as any)
        // else
        //     date(new Date(+$$(value[0]), Months.indexOf(($$(value[1]) + '') as any), + $$(value[2]), ($$(value[3]) as any) ?? 0, ($$(value[4]) as any) ?? 0, ($$(value[5]) as any) ?? 0))
    })

    const hd = useMemo(() => {
        const [hY, hM, hD, hH, hm, hS] = [$$(hasYear), $$(hasMonth), $$(hasDay), $$(hasHour), $$(hasMinute), $$(hasSecond)]

        // if (headers.length === 6)
        return [hY ? (headers[0]) : undefined, hM ? (headers[1]) : undefined, hD ? (headers[2]) : undefined, hH || hm || hS ? (headers[3]) : undefined, hm || hS ? (headers[4]) : undefined, hS ? (headers[5]) : undefined].filter(n => !!n)
        // return headers
    })

    return () => $$(shown) ? <Wheeler
        data={dt as any}
        value={value as any}
        title={title(d)}
        headers={hd}
        open={shown}
        toolbar onOk={() => oDate($$(date))}
    /> : null
}
