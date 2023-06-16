import { WheelPicker as WheelPickerV } from "./src/WheelPicker"
import { $, render, useEffect } from 'voby'
import data from './data.json'
import { Data } from "src/Wheel"

const fruits = [$("西瓜,柠檬,草莓,荔枝,橘子,菠萝,香蕉,柚子,苹果,龙眼".split(","))]
const frutisEn = "watermelon,lemon,strawberry,litchi,orange,pineapple,banana,grapefruit,apple,longan".split(",")
const frutiData = $(fruits[0]().map((name, idx) => ({
    text: name,
    value: frutisEn[idx]
})))

const vegetables = "香菜,青菜,芦笋,萝卜,水芹,黄瓜,冬瓜,番茄,茄子,土豆".split(",")
const vegetablesEn = "parsley,celery,asparagus,carrot,celery,cucumber,melon,tomato,eggplant,potato".split(",")
const vegetableData = $(vegetables.map((name, idx) => ({
    text: name,
    value: vegetablesEn[idx]
})))

const mv = [$("lemon") as any, $("carrot")]
const mtv = [$() as any, $()]


let defaultProv = Object.keys(data)[0]
const keys = Object.keys(data)

Object.keys(data).forEach(k => {
    keys[k] = Object.keys(data[k])
    Object.keys(data[k]).forEach(kk => {
        keys[k][kk] = data[k][kk]
    })
})

const sv = [$('草莓')]
const stv = [$()]
useEffect(() => console.log('Single changed', sv[0]()))
useEffect(() => console.log('Multiple changed', mv[0](), mv[1]()))

const dt = [
    $(Object.keys(data)), //state
    $(keys[defaultProv]), //Object.keys(data[defaultProv]), //city
    $(keys[defaultProv][keys[defaultProv][0]])//data[defaultProv][Object.keys(data[defaultProv])[0]] //district
] as const
const dv = [$<string | Data>(), $<string | Data>(), $<string | Data>()]
const tempValue = [$<string | Data>(), $<string | Data>(), $<string | Data>()]

const empty = []

useEffect(() => { console.log('tempValue', tempValue[0](), tempValue[1](), tempValue[2]()) })
useEffect(() => { console.log('dv', dv[0](), dv[1](), dv[2]()) })

const sshown = $(false)
const mshown = $(false)
const cshown = $(false)

render(<div>
    <h1>WheelPicker</h1>
    <p>仿 iOS UIPickerView 的滚动选择器</p>
    <h3>单列</h3>

    <input value={() => sv.map(v => v().value ?? v())} onClick={() => sshown(true)} ></input>
    <input value={() => stv.map(v => v()?.value ?? v())} onClick={() => sshown(true)} ></input>
    <WheelPickerV
        title={< h1 > 单列选择器 < button onClick={e => stv[0]('香蕉')} > 香蕉</button ></h1 >}
        data={fruits}
        value={sv as any}
        tempValue={stv as any}
        rows={6}
        hideOnBackdrop
        shown={sshown}
    />

    <h3><label for="demo2">两列带默认值</label></h3>
    <input value={() => mv.map(v => v().value ?? v())} onClick={() => mshown(true)} ></input>
    <input value={() => mtv.map(v => v()?.value ?? v())} onClick={() => mshown(true)} ></input>
    <WheelPickerV
        data={[frutiData, vegetableData]}
        value={mv}
        tempValue={mtv}
        shown={mshown}
    />

    <h3><label for="demo3">城市联动</label></h3>
    <input value={() => dv.map(v => v()?.value ?? v())} onClick={() => cshown(true)} ></input>
    <input value={() => tempValue.map(v => v()?.value ?? v())} onClick={() => cshown(true)} ></input>
    <WheelPickerV hideOnBackdrop
        data={dt as any}
        value={dv}
        tempValue={tempValue}
        resetSelectedOnDataChanged

        onShow={() => {
            console.log("onShow")
        }}
        onCancel={() => {
            console.log("onCancel")
        }}
        shown={cshown}
    />

</div >, document.getElementById('voby'))

useEffect(() => {
    let l1 = keys[(tempValue[0]() as Data)?.value ?? tempValue[0]() as string] ?? empty
    if (!((tempValue[1]() as Data)?.value ?? tempValue[1]() as string))
        tempValue[1](l1[0])

    let l2 = l1[(tempValue[1]() as Data)?.value ?? tempValue[1]() as string] ?? empty
    const d = dt
    if (d[1]() !== l1 || d[2]() !== l2)
        if (d[1]() !== l1 || d[2]() !== l2) {
            d[1](l1)
            if (d[2] !== l2)
                d[2](l2)

            const i1 = d[1]().indexOf((tempValue[1]() as Data)?.value ?? tempValue[1]() as string) === -1
            const i2 = d[2]().indexOf((tempValue[2]() as Data)?.value ?? tempValue[2]() as string) === -1

            if (i1 || i2) {
                dv[0](tempValue[0]())
                if (i1)
                    dv[1](tempValue[1](d[1]()[0]))

                if (i2)
                    dv[2](tempValue[2](d[2]()[0]))
            }
        }
})


