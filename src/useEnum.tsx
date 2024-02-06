import { $, type JSX, Observable } from 'woby'

export const useEnumData = <T,>(o: T) => {
    const no = {}
    type D = { key: string, value: string | number }
    const data: D[] = []
    Object.keys(o).filter(k => isNaN(+k)).forEach(k => { no[k] = o[k]; data.push({ key: k, value: o[k] }) })

    const renderer = (r: D) => r?.key
    const valuer = (r: D) => r
    const rows = $(Math.min(data.length, 7))
    return { obj: no as T, data, renderer, valuer, rows }
}

export const useEnum = ({ data, valuer, renderer, rows }: ReturnType<typeof useEnumData>) => ({ data: [data], valuer: [valuer], renderer: [renderer], value: [$()], open: $(false), rows })
