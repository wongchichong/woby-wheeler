import { $, $$, render, useEffect, useMemo, type JSX, isObservable, ObservableMaybe, Observable } from 'woby'
import { WheelerProps } from './Wheeler'

export const useArrayWheeler = <T,>(data: ObservableMaybe<T[]>, options?: Partial<WheelerProps<T>> & { all?: string }) => {
    const { all } = options ?? {}
    const checked = all ? $$(data).map(f => $(false)) : undefined

    if (all) {
        useEffect(() => {
            if (typeof $$(checked[0]) === 'undefined') return
            if ($$(checked[0]))
                checked.forEach((c, i) => (i === 0) ? null : checked[i](true))
            else
                checked.forEach((c, i) => (i === 0) ? null : checked[i](false))
        })

        useEffect(() => {
            const c = checked.slice(1)
            const at = c.every(f => $$(f))
            const af = c.every(f => !$$(f))
            if (at) checked[0](true)
            if (af) checked[0](false)
            if (!at && !af) checked[0](undefined)
        })
    }
    return {
        data: [data], checked, value: [$()],
        renderer: [r => r] as (((r: any) => any)[]) | undefined,
        valuer: [r => r] as (((r: any) => any)[]) | undefined,
        checkboxer: (all ? [r => checked[$$(data).indexOf(r)]] : null) as (((r: any) => Observable<boolean>)[]) | undefined,
        checkbox: [$(true)] as (Observable<boolean>[]) | undefined,
        noMask: true as boolean | undefined,
        hideOnBackdrop: true as boolean | undefined,
        rows: Math.min(6, data.length) as number | undefined,
        open: $(false),
        ...options ?? {}
    }
}
