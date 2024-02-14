import { Wheeler } from "./src/Wheeler"
import { $, $$, Observable, render, useMemo, useEffect, ObservableMaybe, isObservable, Portal, type JSX } from 'woby'
import '../dist/output.css'

import data from './data.json'
import { Data } from "./src/Data"
import './dist/output.css'
import { DateWheeler } from "./src/DateWheeler"
import { useArrayWheeler } from "./src/useArrayWheeler"
import { useEnumData, useEnum } from "./src/useEnum"

export enum VH {
    Horizontal = 0,
    Vertical = 1
}

export const AnySelect = <T,>(props: Partial<ReturnType<typeof useArrayWheeler<T>>>) => {
    const { data, checked, renderer, open, valuer, value } = props
    useEffect(() => console.log($$(value[0])))
    return <>
        <h3><label for="demo2">Checked</label></h3>
        <div class='w-full border h-[30px]' onClick={() => open(true)}>
            {() => checked ? $$(data[0]).map((f, i) => $$(checked[i]) ? <span className={[`bg-[#0096fb] inline-flex items-center text-[13px] leading-[19px] text-white whitespace-nowrap mr-[5px] px-2.5 py-1 rounded-[11px]`,]}>
                {() => renderer[0]($$(f)) as any}
                {() => //!$$((f).readonly) ?
                    <CloseCircle
                        className="icon_cancel closeIcon h-[13px] w-[13px] float-right cursor-pointer ml-[5px] fill-[white]"
                        onClick={e => { e.preventDefault(); checked[i](false) }}
                    /> //: null
                }
            </span> : null) :
                renderer[0] ? renderer[0]($$(value[0])) : $$(value[0])
            }
        </div>
        <Portal mount={document.body}>
            {/** @ts-ignore  */}
            <Wheeler {...props} open={open} hideOnBlur commitOnBlur /* open={open} checkboxer={checkboxer} checkbox={[!!all] } */ />
        </Portal>
    </>
}


const v1 = () => {
    const stv = [$('草莓')]
    useEffect(() => console.log('Single changed', stv[0]()))

    const fruits = ["西瓜,柠檬,草莓,荔枝,橘子,菠萝,香蕉,柚子,苹果,龙眼".split(",")]
    const sshown = $(false)
    return <>
        <input class='border m-5' value={() => stv.map(v => v() + '')} onClick={() => sshown(true)} ></input>
        <Wheeler
            title={< h1 > 单列选择器 < button onClick={e => stv[0]('香蕉')} > 香蕉</button ></h1 >}
            data={fruits}
            value={stv as any}
            rows={6}
            hideOnBlur
            open={sshown}
            toolbar
        />
    </>
}
const v2 = () => {

    const fruits = "西瓜,柠檬,草莓,荔枝,橘子,菠萝,香蕉,柚子,苹果,龙眼".split(",")
    const frutisEn = "watermelon,lemon,strawberry,litchi,orange,pineapple,banana,grapefruit,apple,longan".split(",")
    const frutiData = $(fruits.map((name, idx) => ({
        text: name,
        value: frutisEn[idx]
    })))
    const mshown = $(false)

    const vegetables = "香菜,青菜,芦笋,萝卜,水芹,黄瓜,冬瓜,番茄,茄子,土豆".split(",")
    const vegetablesEn = "parsley,celery,asparagus,carrot,celery,cucumber,melon,tomato,eggplant,potato".split(",")
    const vegetableData = $(vegetables.map((name, idx) => ({
        text: name,
        value: vegetablesEn[idx]
    })))

    const mtv = [$('lemon'), $('carrot')]

    useEffect(() => console.log('Multiple changed', mtv[0](), mtv[1]()))

    const valuer = [r => r.value, r => r.value]

    return <>
        <h3><label for="demo2">两列带默认值</label></h3>
        <input class='border m-5' value={() => mtv.map((v, i) => $$(v))} onClick={() => mshown(true)} ></input>
        <Wheeler
            data={[frutiData, vegetableData]}
            value={mtv as any}
            renderer={[r => r.text, r => r.text]}
            valuer={[r => r.value, r => r.value]}
            open={mshown}
            toolbar
        /></>
}
const v3 = () => {
    let defaultProv = Object.keys(data)[0]

    const keys = Object.keys(data)
    const cshown = $(false)

    Object.keys(data).forEach(k => {
        keys[k] = Object.keys(data[k])
        Object.keys(data[k]).forEach(kk => {
            keys[k][kk] = data[k][kk]
        })
    })

    const dt = [
        $(Object.keys(data)), //state
        $(keys[defaultProv]), //Object.keys(data[defaultProv]), //city
        $(keys[defaultProv][keys[defaultProv][0]])//data[defaultProv][Object.keys(data[defaultProv])[0]] //district
    ] as const

    const value = [$<string /* | Data */>(), $<string /* | Data */>(), $<string /* | Data */>()]

    const empty = []

    // useEffect(() => { console.log('dv', dv[0](), dv[1](), dv[2]()) })


    useEffect(() => {
        let l1 = keys[value[0]() + ''] ?? empty
        if (!(value[1]()?.valueOf()))
            value[1](l1[0])

        let l2 = l1[value[1]() + ''] ?? empty
        const d = dt
        if (d[1]() !== l1 || d[2]() !== l2)
            if (d[1]() !== l1 || d[2]() !== l2) {
                d[1](l1)
                if (d[2] !== l2)
                    d[2](l2)

                const i1 = d[1]().indexOf(value[1]() + '') === -1
                const i2 = d[2]().indexOf(value[2]() + '') === -1

                if (i1 || i2) {
                    // dv[0](tempValue[0]())
                    if (i1)
                        /* dv[1]( */value[1](d[1]()[0]) //)

                    if (i2)
                        /* dv[2]( */value[2](d[2]()[0]) //)
                }
            }
    })


    return <>
        <h3><label for="demo3">城市联动</label></h3>
        <input class='border m-5' value={() => value.map(v => v() + '')} onClick={() => cshown(true)} ></input>
        <Wheeler
            data={dt as any}
            value={value as any}
            resetSelectedOnDataChanged
            hideOnBlur
            onShow={() => {
                console.log("onShow")
            }}
            onCancel={() => {
                console.log("onCancel")
            }}
            open={cshown}
            toolbar
        /></>
}

const CloseCircle = (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" {...props}>
    <path d="M48 0a48 48 0 1 0 48 48A48.051 48.051 0 0 0 48 0Zm0 84a36 36 0 1 1 36-36 36.04 36.04 0 0 1-36 36Z" class="st0" />
    <path d="M64.242 31.758a5.998 5.998 0 0 0-8.484 0L48 39.516l-7.758-7.758a6 6 0 0 0-8.484 8.484L39.516 48l-7.758 7.758a6 6 0 1 0 8.484 8.484L48 56.484l7.758 7.758a6 6 0 0 0 8.484-8.484L56.484 48l7.758-7.758a5.998 5.998 0 0 0 0-8.484Z" class="st0" />
</svg>

const CheckChip = () => {

    const selectAll = $(false)
    const fruits = [$([
        // { text: '*', value: '西瓜', checked: selectAll, readonly: $(false), valueOf: () => '*', toString: () => '*' },
        { text: '西瓜...', value: '西瓜', checked: $(false), readonly: $(true) },
        { text: '柠檬', value: '柠檬', checked: $(false), readonly: $(true) },
        { text: '...草莓', value: '草莓', checked: $(false), readonly: $(false) },
        { text: '荔枝', value: '荔枝', checked: $(false), readonly: $(false) },
        { text: '橘子..', value: '橘子', checked: $(false), readonly: $(false) },
        { text: '菠萝', value: '菠萝', checked: $(false), readonly: $(false) },
        { text: '....香蕉', value: '香蕉', checked: $(false), readonly: $(false) },
        { text: '柚子', value: '柚子', checked: $(false), readonly: $(false) },
        { text: '苹果', value: '苹果', checked: $(false), readonly: $(false) },
        { text: '龙眼....', value: '龙眼', checked: $(false), readonly: $(false) }
    ])]

    const stv = [$(fruits[0][2])]

    let suspense = false
    useEffect(() => {
        if (!suspense)
            $$(fruits[0]).forEach((r/* : Data */) => r.checked($$(selectAll)))
    })
    useEffect(() => {
        if ($$(fruits[0]).some((r/* : Data */) => !$$(r.checked) || r.text === '*')) {
            suspense = true
            selectAll(false)
        }

    })
    const sshown = $(false)

    return <>
        <h3><label for="demo2">Checked</label></h3>
        <div class='w-full border h-[30px]' onClick={() => sshown(true)}>
            {() => $$(fruits[0]).map(f => $$(f.checked) ? <span className={[`bg-[#0096fb] inline-flex items-center text-[13px] leading-[19px] text-white whitespace-nowrap mr-[5px] px-2.5 py-1 rounded-[11px]`,]}>{f.text}
                {() => !$$(f.readonly) ? <CloseCircle
                    className="icon_cancel closeIcon h-[13px] w-[13px] float-right cursor-pointer ml-[5px] fill-[white]"
                    onClick={e => { e.cancelBubble = true; f.checked(false) }}
                /> : null}
            </span> : null)}
        </div>
        <Wheeler
            data={fruits}
            value={stv as any}
            renderer={[r => r.text]}
            valuer={[r => r.value]}
            checkboxer={[r => r.checked]}
            rows={6}
            hideOnBlur
            open={sshown}
            checkbox={[$(true)]}
            noMask
        />
    </>
}

const SimpleCheckAllChip = () => {
    const fruits = "*,西瓜,柠檬,草莓,荔枝,橘子,菠萝,香蕉,柚子,苹果,龙眼".split(",")
    const sshown = $(false)

    const options = useArrayWheeler(fruits, { all: '*' })
    const { data, checked } = options
    return <>
        <h3><label for="demo2">Simple Checked with All *</label></h3>
        <div class='w-full border h-[30px]' onClick={() => sshown(true)}>
            {() => $$(data[0]).map((f, i) => i === 0 ? null : $$(checked[i]) ? <span className={[`bg-[#0096fb] inline-flex items-center text-[13px] leading-[19px] text-white whitespace-nowrap mr-[5px] px-2.5 py-1 rounded-[11px]`,]}>{f}
                {() => /* !$$(f.readonly) ? */ <CloseCircle
                    className="icon_cancel closeIcon h-[13px] w-[13px] float-right cursor-pointer ml-[5px] fill-[white]"
                    onClick={e => { e.cancelBubble = true; checked[i](false) }}
                /> /* : null */}
            </span> : null)}
        </div>
        <Wheeler {...options}
            // data={fruits}
            // value={stv as any}
            // // renderer={[r => r.text]}
            // // valuer={[r => r.value]}
            // checkboxer={[r => chk[0][fruits[0].indexOf(r)]]}
            // rows={6}
            // hideOnBackdrop
            open={sshown}
        // checkbox={[true]}
        // noMask
        />
    </>
}

const cshown = $(false)
const date = $(new Date())
const format = (value: Observable<any>[]) => value.slice(0, 3).map(v => $$(v) + '').join(' ') + ' ' + value.slice(3).map(v => ($$(v) + '').padStart(2, '0')).join(':')

const cshownDateOnly = $(false)

const yearOnly = $(new Date())
const cshownYear = $(false)

const monthOnly = $(new Date())
const cshownMonth = $(false)

const yearMonth = $(new Date())
const cshownYearMonth = $(false)

const timeOnly = $(new Date()) //$([$(0), $(1), $(1)])
const cshownTime = $(false)

const hasSecond = $(true)

const TimeIcon = (props: JSX.SVGAttributes<SVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" {...props}>
    <path d="m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z" />
</svg>

const 横竖 = $(VH.Horizontal)


export const CLS = {
    Horizontal: { name: 'Horizontal', value: 1 },
    Vertical: { name: 'Vertical', value: 2 }
}

const clsd = Object.values(CLS) //useEnumData(CLS).data
const cv = $(clsd[0])
render(<div class='m-5'>
    <h1>WheelPicker</h1>
    <p>仿 iOS UIPickerView 的滚动选择器</p>
    <h3>单列</h3>

    <AnySelect value={[横竖 as any]} {...useEnum(useEnumData(VH))} />
    {/* <AnySelect value={[cv as any]} data={[clsd]} open={$(false)} valuer={[r => r]} renderer={[r => r?.name]} />

    {v1}
    {v2}
    {v3}
    {CheckChip}
    {SimpleCheckAllChip}

    <h3><label for="demo4">Date</label></h3>
    <div class='border m-5 w-[250px]' onClick={() => cshown(true)} >{() => $$(date).toString()} </div>
    <DateWheeler
        title={<div class='m-5 inline-block'>{() => $$(date).toDateString() + ' ' + $$(date).getHours() + ':' + $$(date).getMinutes() + ':' + $$(date).getSeconds()}
            <div class='inline-block ml-10 px-2 border rounded-[10px] border-solid border-[lightgray] hover:bg-[#76a1aa]' onClick={() => hasSecond(!$$(hasSecond))}><input type='checkbox' checked={hasSecond} /><span class='px-2'>With Time</span>
                <TimeIcon class='inline-block ml-1' /></div>
        </div>}
        value={date}
        format={format}
        shown={cshown}
        hasSecond={hasSecond}
    />

    <h4>Date only</h4>
    <div class='border m-5 w-[250px]' onClick={() => cshownDateOnly(true)} >{() => $$(date).toString()} </div>
    <DateWheeler
        // hasSecond
        value={date}
        format={format}
        shown={cshownDateOnly}
    />

    <h4>Year Only</h4>
    <div class='border m-5 w-[250px]' onClick={() => cshownYear(true)} >{() => Array.isArray($$(yearOnly)) ? ($$(yearOnly) as any as Observable<string>[]).map(r => $$(r) + '').join(' ') : $$(yearOnly).toString()} </div>
    <DateWheeler
        value={yearOnly}
        format={format}
        shown={cshownYear}
        hasMonth={false}
        hasDay={false}
    />

    <h4>Month Only</h4>
    <div class='border m-5 w-[250px]' onClick={() => cshownMonth(true)} >{() => Array.isArray($$(monthOnly)) ? ($$(monthOnly) as any as Observable<string>[]).map(r => $$(r) + '').join(' ') : $$(monthOnly).toString()} </div>
    <DateWheeler
        value={monthOnly}
        format={format}
        shown={cshownMonth}
        hasYear={false}
        hasDay={false}
    />

    <h4>Year & Month</h4>
    <div class='border m-5 w-[250px]' onClick={() => cshownYearMonth(true)} >{() => Array.isArray($$(yearMonth)) ? ($$(yearMonth) as any as Observable<string>[]).map(r => $$(r) + '').join(' ') : $$(yearMonth).toString()} </div>
    <DateWheeler
        value={yearMonth}
        format={format}
        shown={cshownYearMonth}
        // hasYear={false}
        hasDay={false}
    />

    <h4>Time Only</h4>
    <div class='border m-5 w-[250px]' onClick={() => cshownTime(true)} >{() => Array.isArray($$(timeOnly)) ? ($$(timeOnly) as any as Observable<string>[]).map(r => $$(r) + '').join(' ') : $$(timeOnly).toString()} </div>
    <DateWheeler
        value={timeOnly}
        format={format}
        shown={cshownTime}
        hasYear={false}
        hasMonth={false}
        hasDay={false}
        hasSecond
        headers={['Hour', 'Minute', 'Second']}
    />

    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br /> */}


</div>, document.getElementById('woby'))

