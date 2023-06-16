# WheelPicker

仿 iOS UIPickerView 的滚动选择器

## 演示

[DEMO](http://cople.github.io/WheelPicker)

## 安装

### NPM
```sh
npm install wheel-picker --save
```

### CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wheel-picker/dist/wheelpicker.min.css">
```

## 使用

```ts
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

render(<div>
    单列
    <WheelPickerV
        title={<h1>单列选择器 <button onClick={e => stv[0]('香蕉')}>香蕉</button></h1>}
        data={fruits}
        value={sv as any}
        tempValue={stv as any}
        rows={6}
        hideOnBackdrop
    />

    <WheelPickerV
        data={[frutiData, vegetableData]}
        value={mv}
        tempValue={mtv}
    />

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
        formatValue={value => {
            return value.join(" ")
        }}
    />

</div>, document.getElementById('voby'))

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

```

## 选项

| 参数               | 类型       | 默认值                     | 描述                                       |
| ---------------- | -------- | ----------------------- | ---------------------------------------- |
| title            | string   | null                    | 标题                                       |
| el               | element  | null                    | 选择器对应的 input 元素                          |
| hideOnBackdrop   | boolean  | false                   | 点击遮罩层关闭组件（相当于点击取消按钮）                     |
| hidden   | boolean  | false                   | 点击遮罩层关闭组件（相当于点击取消按钮）                     |
| disabled   | boolean  | false                   | 点击遮罩层关闭组件（相当于点击取消按钮）                     |
| data             | array    | []                      | 每列的数据组成的数组                               |
| value            | array    | []                      | 每列的默认值组成的数组                              |
| rows             | number   | 5                       | 可见的行数（奇数）                                |
| rowHeight        | number   | 34                      | 行高                                       |
| onShow           | function | null                    | 显示组件时触发                                  |
| onCancel         | function | null                    | 点击取消时触发                                  |

## 方法
### picker.getValue([index:number])
返回值数组或指定列的值

### picker.setValue(value:array)
### picker.setValue(value:string, index:number)
设置各列的值或指定列的值

### picker.getSelectedItems()
返回选中的条目数组

### picker.getData([index:nubmer])
返回数据数组或指定列的数据

### picker.setData(data:array [, value:array])
### picker.setData(data:array, index:number [, value:string])
设置各列或指定列的数据和值

### picker.show()
显示组件

### picker.hide()
隐藏组件

### picker.enable()
启用组件

### picker.disable()
禁用组件

### picker.destory()
销毁组件

## License

[MIT](http://opensource.org/licenses/MIT)
