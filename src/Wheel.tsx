import * as utils from './utils'
import { $, $$, Observable, ObservableReadonly, isObservable, store, useEffect, useMemo } from 'voby'

export type OptionType = {
    rows: ObservableMaybe<number>
    rowHeight: ObservableMaybe<number>
    width: string | number | ObservableReadonly<string | number>
    value: Observable<string | Data>
    adjustTime?: ObservableMaybe<number>
    momentumThresholdTime?: ObservableMaybe<number>
    bounceTime?: ObservableMaybe<number>
    momentumThresholdDistance?: ObservableMaybe<number>
    resetSelectedOnDataChanged?: ObservableMaybe<boolean>

    data: Observable<Data[]> | Observable<string[]>
    isTransition?: boolean
    isTouching?: boolean
    easings?: {
        scroll: number | string // easeOutQuint
        scrollBounce: number | string // easeOutQuard
        bounce: number | string // easeOutQuart
    }
}

export type Data = {
    value: number | string,
    disabled?: boolean,
    text: string
}

export type ItemType = { classList: any }

const isTouch = (e: TouchEvent | MouseEvent): e is TouchEvent =>
    !!(e as TouchEvent).touches

export const Wheel = (props: OptionType) => {
    const {
        data, rowHeight = 34, adjustTime = 400, bounceTime = 600, momentumThresholdTime = 300, momentumThresholdDistance = 10,
        value, resetSelectedOnDataChanged = false, width
    } = props
    let { rows = 5 } = props

    const _items = $<Data[]>([])
    const list = $<(() => HTMLLinkElement)[]>([])
    const y = $(0)
    const selectedIndex = $(0)
    const isTransition = $(false)
    const isTouching = $(false)
    const easings = $<{
        scroll: number | string // easeOutQuint
        scrollBounce: number | string // easeOutQuard
        bounce: number | string // easeOutQuart
    }>({
        scroll: "cubic-bezier(0.23, 1, 0.32, 1)", // easeOutQuint
        scrollBounce: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // easeOutQuard
        bounce: "cubic-bezier(0.165, 0.84, 0.44, 1)" // easeOutQuart
    })

    const transformName = $(utils.prefixed("transform"))
    const transitionName = $(utils.prefixed("transition"))

    const wheel = $<HTMLDivElement>()
    const scroller = $<HTMLUListElement>()
    const wheelHeight = useMemo(() => wheel()?.offsetHeight)
    const maxScrollY = $<number>()
    const startY = $<number>()
    const lastY = $<any>()
    const startTime = $<number>()

    useEffect(() => {
        data() // deps 
        if ($$(resetSelectedOnDataChanged))
            selectedIndex(0)
    })
    useEffect(() => {
        if ($$(rows) % 2 === 0) isObservable(rows) ? rows(r => ++r) : (rows as number)++
    })

    const _momentum = (current: number, start: number, time: number, lowerMargin: number, wheelSize: number, deceleration: number, rowHeight: number) => {
        let distance = current - start
        let speed = Math.abs(distance) / time
        let destination
        let duration

        deceleration = deceleration === undefined ? 0.0006 : deceleration

        destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1)
        duration = speed / deceleration

        destination = Math.round(destination / rowHeight) * rowHeight

        if (destination < lowerMargin) {
            destination = wheelSize ? lowerMargin - (wheelSize / 2.5 * (speed / 8)) : lowerMargin
            distance = Math.abs(destination - current)
            duration = distance / speed
        } else if (destination > 0) {
            destination = wheelSize ? wheelSize / 2.5 * (speed / 8) : 0
            distance = Math.abs(current) + destination
            duration = distance / speed
        }

        return {
            destination: Math.round(destination),
            duration: duration
        }
    }

    const _resetPosition = (duration: number) => {
        let yy = y()

        duration = duration || 0

        if (yy > 0) yy = 0
        if (yy < maxScrollY()) yy = maxScrollY()

        if (yy === y()) return false

        _scrollTo(yy, duration, easings().bounce)

        return true
    }

    const _getClosestSelectablePosition = (y: number) => {
        let index = Math.abs(Math.round(y / $$(rowHeight)))

        const items = _items()
        if (!items[index]?.disabled) return y

        let max = Math.max(index, items.length - index)
        for (let i = 1; i <= max; i++) {
            if (!items[index + i].disabled) {
                index += i
                break
            }
            if (!items[index - i].disabled) {
                index -= i
                break
            }
        }
        return index * -$$(rowHeight)
    }

    const _scrollTo = (yy: number, duration: number, easing: number | string) => {
        if (y() === yy) {
            _scrollFinish()
            return false
        }

        y(_getClosestSelectablePosition(yy))

        if (duration && duration > 0) {
            isTransition(true)
            scroller().style[transitionName()] = duration + "ms " + easing
        } else {
            _scrollFinish()
        }
    }

    const _scrollFinish = () => {
        let newIndex = Math.abs(y() / $$(rowHeight))
        if (selectedIndex() != newIndex) {
            selectedIndex(newIndex)

            const v = _items()[selectedIndex()]
            value(v)
        }
    }

    useEffect(() => {
        const v = (value() as Data)?.value ?? value() as string
        const i = data().findIndex((vv, i) => (vv as Data).value === v || vv === v)
        selectedIndex(i)
    })

    const _getCurrentY = () => {
        const matrixValues = utils.getStyle(scroller(), transformName()).match(/-?\d+(\.\d+)?/g) as string[]
        return parseInt(matrixValues[matrixValues.length - 1])
    }

    const _start = (event: TouchEvent | MouseEvent) => {
        event.preventDefault()

        const items = _items()

        if (!items.length) return

        if (isTransition()) {
            isTransition(false)
            y(_getCurrentY())
            scroller().style[transitionName()] = ""
        }

        startY(y())
        lastY(isTouch(event) ? event.touches[0].pageY : event.pageY)
        startTime(Date.now())

        isTouching(true)
    }

    const _move = (event: TouchEvent | MouseEvent) => {
        if (!isTouching()) return false

        let yy = isTouch(event) ? event.changedTouches[0].pageY : event.pageY
        let deltaY = yy - lastY()
        let targetY = y() + deltaY
        let now = Date.now()

        lastY(yy)

        if (targetY > 0 || targetY < maxScrollY()) {
            targetY = y() + deltaY / 3
        }

        y(Math.round(targetY))

        if (now - startTime() > $$(momentumThresholdTime)) {
            startTime(now)
            startY(y())
        }

        return false
    }

    const _end = (event: MouseEvent | TouchEvent) => {
        if (!isTouching()) return false

        const deltaTime = Date.now() - startTime()
        let duration = $$(adjustTime)
        let easing = easings().scroll
        const distanceY = Math.abs(y() - startY())
        let momentumVals
        let yy

        isTouching(false)

        if (deltaTime < $$(momentumThresholdTime) && distanceY <= 10 && (event.target as HTMLDivElement)?.classList.contains("wheelpicker-item")) {
            const aid = +(event.target as HTMLLinkElement)?.getAttribute('_wsidx')

            console.log(aid, -$$(rowHeight), duration, easing)
            _scrollTo(aid * -$$(rowHeight), duration, easing)
            return false
        }

        if (_resetPosition($$(bounceTime))) return

        if (deltaTime < $$(momentumThresholdTime) && distanceY > $$(momentumThresholdDistance)) {
            momentumVals = _momentum(y(), startY(), deltaTime, maxScrollY(), wheelHeight(), 0.0007, $$(rowHeight))
            yy = momentumVals.destination
            duration = momentumVals.duration
        } else {
            yy = Math.round(y() / $$(rowHeight)) * $$(rowHeight)
        }

        if (yy > 0 || yy < maxScrollY()) {
            easing = easings().scrollBounce
        }

        _scrollTo(yy, duration, easing)
    }

    const _transitionEnd = () => {
        isTransition(false)
        scroller().style[transitionName()] = ""

        if (!_resetPosition($$(bounceTime))) _scrollFinish()
    }

    useEffect(() => {

        const dt = data()
        const lis = []
        const items = []

        console.log('build data', dt)

        items.push(...dt.map((item, idx) => {
            item = typeof item === "object" ? item : {
                text: item,
                value: item
            }

            let li = () => <li class={['wheelpicker-item', {
                //@ts-ignore
                "wheelpicker-item-disabled": item.disabled,
                "wheelpicker-item-selected": () => idx === selectedIndex()
            }]}
                //@ts-ignore
                _wsidx={idx}>
                {(item as Data).text ?? item}
            </li>


            lis.push(li)
            return item
        }))

        list(lis)
        _items(items)


        y(selectedIndex() * -$$(rowHeight))

        maxScrollY(-$$(rowHeight) * (dt.length - 1))

        value(items[selectedIndex()])
    })


    const _wheel = () => {
        let pid: number
        let pwid: number
        wheel().onwheel = event => {
            let duration = $$(adjustTime)
            let easing = easings().scroll

            if (!event.target)
                return

            const aid = +(event.target as HTMLLinkElement)?.getAttribute('_wsidx')

            _scrollTo((pid = ((aid === pwid ? pid : aid) + Math.sign(event.deltaY))) * -$$(rowHeight), duration, easing)

            pwid = aid
        }
    }

    return <div ref={wheel} class='wheelpicker-wheel' style={{ height: $$(rowHeight) * $$(rows) + "px", width }}
        onTouchStart={_start} onTouchMove={_move} onTouchEnd={_end} onTouchCancel={_end}
        onMouseDown={_start} onMouseMove={_move} onMouseUp={_end} onMouseLeave={_end}
        onWheel={_wheel}
    >
        <ul ref={scroller} class='wheelpicker-wheel-scroller' style={{ transform: () => "translate3d(0," + y() + "px,0)", marginTop: $$(rowHeight) * Math.floor($$(rows) / 2) + "px" }} onTransitionEnd={_transitionEnd}>
            {list}
        </ul>
    </div>
}
