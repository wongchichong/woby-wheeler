// import { $, $$, render, useEffect, useMemo, type JSX, isObservable, ObservableMaybe, Observable } from 'woby'
// import { WheelerProps } from './Wheeler'

// function areObjectsEqual<T>(obj1: T, obj2: T): boolean {
//     return Object.keys(obj1).every(key => obj1[key] === obj2[key])
// }


// export const useObjectWheeler = <T, V>(obj: ObservableMaybe<Record<keyof T, boolean>>, options?: Partial<WheelerProps<T>>) => {
//     const keys = useMemo(() => Object.keys($$(obj)) as (keyof T)[])
//     const data = [$($$(keys).map((key) => ({ text: key, value: key, checked: $($$(obj)[key]) })))]
//     const checked = useMemo(() => $$(keys).map(key => $($$(obj)[key])))

//     const o = $({ ...$$(obj) })

//     useEffect(() => {
//         const oo = { ...$$(o) }

//         checked.forEach((c, i) => oo[keys[i] as any] = $$(c))

//         if (!areObjectsEqual($$(o), oo))
//             o({ ...oo })
//     })
//     return {
//         obj: o,
//         data, checked, value: [$()],
//         renderer: [r => r.text],
//         valuer: [r => r.value],
//         checkboxer: [r => r.checked],
//         checkbox: [$(true)],
//         noMask: true,
//         hideOnBackdrop: true,
//         rows: Math.min(6, keys.length),
//         open: $(false),
//         ...options ?? {}
//     }
// }
