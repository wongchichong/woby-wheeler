import { $, $$, render, useEffect, useMemo, type JSX, isObservable, ObservableMaybe, Observable } from 'woby'
import { WheelerProps } from './Wheeler'


export const useRecordWheeler = <T, V>(d: Record<keyof T, ObservableMaybe<V>>, options?: Partial<WheelerProps<T>>) => {
    const keys = Object.keys(d) as (keyof T)[]
    const data = [$(keys.map((key) => ({ text: key, value: key, checked: d[key] })))]
    const checked = keys.map(key => d[key])

    return {
        data, checked, value: [$()],
        renderer: [r => r.text],
        valuer: [r => r.value],
        checkboxer: [r => r.checked],
        checkbox: [$(true)],
        noMask: true,
        hideOnBackdrop: true,
        rows: Math.min(6, keys.length),
        open: $(false),
        ...options ?? {}
    }
}
