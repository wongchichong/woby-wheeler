import { type JSX } from 'voby'

export const extend = Object.assign
//     || (<T extends {}, S extends {}>(target: T, source: S) => {
//     for (var key in source) {
//         if (source.hasOwnProperty(key))
//             target[key as any] = source[key]
//     }
//     return target
// })
export const prefixed = (prop: string) => {
    let style = document.createElement("div").style
    let vendors = ["Webkit", "Moz", "ms", "O"]
    let name: string

    if (prop in style) return prop

    for (var i = 0, len = vendors.length; i < len; i++) {
        name = vendors[i] + prop.charAt(0).toUpperCase() + prop.substring(1)
        if (name in style) return name
    }

    return null
}
export const getStyle = (el: JSX.Element, prop: string) => {
    prop = prop.replace(/([A-Z])/g, "-$1")
    prop = prop.toLowerCase()
    return window.getComputedStyle(el as any, null).getPropertyValue(prop)
}

export const isArray = Array.isArray || ((obj: Function) => Object.prototype.toString.call(obj) === "[object Array]")