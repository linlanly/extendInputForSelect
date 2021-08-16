class EnteredSelect {
    option = {
        inputState: 'extend',   // 输入框的状态：extend-支持输入下拉框以外的内容，filter-支持筛选下拉框数据，disable-禁止输入
        isSelect: true,         // 是否有下拉框
        multiple: false,        // 是否可以有多个值
        minimum: null,          // 可以有多个值时，最少有多少个
        maximum: null,          // 可以有多个值时，最多有多少个
        labelAttr: 'label',     // 显示对应的属性
        valueAttr: 'value',     // 选中值返回对应的属性
        placeholder: '请选择',   // 提示
    }
    // 处理设置内容
    constructor(dom, data, option) {
        this.docPanel = document.getElementById(dom)
        this.dataList = JSON.parse(JSON.stringify(data))
        if (option) {
            if (option.multiple !== undefined && option.multiple !== null) {
                if (typeof option.multiple === 'boolean') {
                    this.option.multiple = option.multiple
                } else {
                    console.error('multiple须设置为boolean类型')
                }
            }
            if (option.multiple && option.minimum) {
                if (!/\D/.test(option.minimum) && typeof option.minimum === 'number' && option.minimum > 0) {
                    this.option.minimum = option.minimum
                } else {
                    console.error('minimum须设置为大于0的整数')
                }
            }
            if (option.multiple && option.maximum) {
                if (!/\D/.test(option.maximum) && typeof option.maximum === 'number' && option.maximum > 0) {
                    this.option.maximum = option.maximum
                    if (this.option.minimum === null) {
                        this.option.minimum = 1
                    } else if (this.option.minimum > this.option.maximum) {
                        let temp = this.option.minimum
                        this.option.minimum = this.option.maximum
                        this.option.maximum = temp
                    }
                } else {
                    console.error('maximum须设置为大于0的整数')
                }
            }
            if (option.labelAttr) {
                for (let i = 0; i < this.dataList.length; i++) {
                    if (!this.isBaseValue(this.dataList[i]) && this.dataList[i][option.labelAttr]) {
                        console.error('labelAttr存在在数组中读取不到值的情况')
                        break
                    }
                }
                this.option.labelAttr = option.labelAttr
            }
            if (option.valueAttr) {
                for (let i = 0; i < this.dataList.length; i++) {
                    if (!this.isBaseValue(this.dataList[i]) && this.dataList[i][option.labelAttr]) {
                        console.error('valueAttr存在在数组中读取不到值的情况')
                        break
                    }
                }
                this.option.valueAttr = option.valueAttr
            }
            if (option.placeholder) {
                this.option.placeholder = option.placeholder
            }
            if (option.isSelect !== undefined && option.isSelect !== null) {
                if (typeof option.isSelect === 'boolean') {
                    this.option.isSelect = option.isSelect
                } else {
                    console.error('isSelect须设置为boolean类型')
                }
            }
            if (option.inputState) {
                if (option.inputState === 'extend' || option.inputState === 'disable' || option.inputState === 'filter') {
                    this.option.inputState = option.inputState
                } else {
                    console.error('inputState的值只能设置为"extend"或"filter"或"disable"')
                }
            }
        }
        this.initElement()
    }
    // 初始化组件
    initElement() {
        if (this.docPanel) {
            this.docPanel.innerHTML = ''
            let div = `
                <div class="entered-select-box" style="padding-right: ${this.option.isSelect ? '25px' : '4px'};">`
            if (this.option.inputState === 'extend' || this.option.inputState === 'filter') {
                div += '<div class="entered-select-value" contenteditable="true" placeholder="请输入文字"></div>'
            } else {
                div += '<div class="entered-select-value"></div>'
            }
            if (this.option.isSelect) {
                div += '<i class="entered-select-icon"></i>'
                if (this.dataList.length > 0) {
                    let ul = '<ul class="entered-select-list">'

                    ul += this.getUlInnerHTML(this) + '</ul>'
                    div += ul
                }
            }
            div += '</div>'
            this.docPanel.innerHTML = div
            this.addClickEvent()
        }
    }
    // 返回下拉框内容的innerHTML
    getUlInnerHTML(obj, filterContent) {
        let dealList, str = ''
        if (filterContent === undefined || !/\S/g.test(filterContent)) {
            dealList = obj.dataList
        } else {
            dealList = obj.dataList.filter(item => {
                if (item[obj.option.labelAttr].indexOf(filterContent) !== -1) {
                    return item
                }
            })
        }
        if (dealList.length < 1) {
            str = '<div class="filter-empty">无匹配数据</div>'
        } else {
            dealList.forEach(item => {
                let value, label
                if (obj.isBaseValue(item)) {
                    label = item
                    value = item
                } else if (item && item[obj.option.valueAttr] && obj.isBaseValue(item[obj.option.valueAttr]) && item[obj.option.labelAttr] && obj.isBaseValue(item[obj.option.labelAttr])) {
                    label = item[obj.option.labelAttr]
                    value = item[obj.option.valueAttr]
                }
                if (value && label) {
                    if (obj.option.multiple) {
                        if (obj.docPanel.value && obj.docPanel.value.indexOf(value) !== -1) {
                            str += `<li data-value="${value}" data-type="${typeof value}">${label}<i style="display: block;"></i></li>`
                        } else {
                            str += `<li data-value="${value}" data-type="${typeof value}">${label}<i></i></li>`
                        }
                    } else {
                        str += `<li data-value="${value}" data-type="${typeof value}">${label}</li>`
                    }
                }
            })
        }
        return str
    }
    // 为组件的内容添加事件
    addClickEvent() {
        this.docInput = this.docPanel.getElementsByClassName('entered-select-value')[0]
        this.docIcon = this.docPanel.getElementsByClassName('entered-select-icon')[0]
        this.docList = this.docPanel.getElementsByClassName('entered-select-list')[0]
        this.docBox = this.docPanel.getElementsByClassName('entered-select-box')[0]
        let that = this
        if (this.docBox) {
            this.boxWidth = this.isSelect ? this.docBox.clientWidth - 40 : this.docBox.clientWidth
            this.addEvent(this.docBox, 'click', function (event) {
                let nodeName = event.target.nodeName
                if (nodeName === 'I' && event.target.parentNode !== this) {
                    // 判断最大值最小值是否相等，设置允许移除元素的条件
                    if ((that.option.minimum !== that.option.maximum && that.docPanel.value && that.docPanel.value.length < that.option.minimum + 1)
                        || (that.option.minimum === that.option.maximum && that.docPanel.value && that.docPanel.value.length < that.option.minimum)) {
                        that.warningHandle()
                        return
                    }

                    that.docBox.removeChild(event.target.parentNode)
                    let temp = that.docPanel.value
                    let value = event.target.parentNode.getAttribute('data-value')
                    let index = temp.indexOf(value)
                    temp.splice(index, 1)
                    that.docPanel.value = temp

                    if (that.docList) {
                        let list = that.docList.getElementsByTagName('li')
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].getAttribute('data-value') === event.target.parentNode.getAttribute('data-value')) {
                                let icon = list[i].getElementsByTagName('i')[0]
                                icon.style.display = 'none'
                            }
                        }
                    }
                } else if (event.target === this) {
                    if (that.option.inputState !== 'disable') {
                        that.docInput.focus()
                    } else {
                        that.openOrCloseList(that)
                    }
                }
            })
        }
        if (this.docInput) {
            this.addEvent(this.docInput, 'click', function (event) {
                that.openOrCloseList(that)
            })

            this.addEvent(this.docInput, 'focus', function () {
                if (that.docBox && that.docBox.className.indexOf('entered-select-box is-foucs') === -1) {
                    that.docBox.className = 'entered-select-box is-foucs'
                }
            })

            this.addEvent(this.docInput, 'blur', function () {
                if (that.docBox && that.docBox.className.indexOf('entered-select-box is-foucs') !== -1) {
                    that.docBox.className = 'entered-select-box'
                }
                if (that.docList) {
                    let list = that.docList.getElementsByTagName('li')
                    for (let i = 0; i < list.length; i++) {
                        list[i].className = ''
                        if (list[i].innerText === that.docInput.innerText && !that.option.multiple) {
                            list[i].className = 'is-selected'
                            that.docPanel.value = list[i].getAttribute("data-value")
                            break
                        }
                    }
                }
            })

            this.addEvent(this.docInput, 'keydown', function (event) {
                let curEvent = window.event || event
                let code = curEvent.keyCode || curEvent.which || curEvent.charCode
                if (code === 13) {
                    that.stopEventDefault(event)
                    if (that.option.inputState !== 'extend') {
                        return
                    }
                    let content = that.docInput.innerText
                    let divList = that.docBox.getElementsByTagName('div')
                    if (that.option.maximum && that.option.maximum < divList.length) {
                        that.warningHandle()
                        return
                    }
                    let list = that.docInput.getElementsByTagName('div')
                    for (let i = 0; i < list.length; i++) {
                        if (content === list[i].innerText) {
                            return
                        }
                    }
                    let value
                    if (that.docList) {
                        let liList = that.docList.getElementsByTagName('li')
                        for (let i = 0; i < liList.length; i++) {
                            if (liList[i].innerText === content) {
                                value = liList[i].getAttribute('data-value')
                                let icon = liList[i].getElementsByTagName('i')[0]
                                icon.style.display = 'block'
                                break
                            }
                        }
                    }
                    if (!value) {
                        value = content
                    }

                    if (!that.option.multiple) {
                        that.docPanel.value = value
                        return
                    }

                    that.docInput.innerText = ''
                    let temp = that.docPanel.value
                    if (temp && Array.isArray(temp)) {
                        if (temp.indexOf(value) === -1) {
                            temp.push(value)
                            that.addItem(content, value)
                        }
                    } else {
                        temp = []
                        temp.push(value)
                        that.addItem(content, value)
                    }
                    that.docPanel.value = temp
                    if (that.docList) {
                        that.docList.innerHTML = that.getUlInnerHTML(that)
                    }
                }
            })

            this.addEvent(this.docInput, 'keyup', function (event) {
                let curEvent = window.event || event
                let code = curEvent.keyCode || curEvent.which || curEvent.charCode
                if (code !== 13) {
                    let content = that.docInput.innerText
                    if (that.docList) {
                        that.docList.innerHTML = that.getUlInnerHTML(that, content)
                    }
                }
            })
        }
        if (this.docIcon) {
            this.addEvent(this.docIcon, 'click', function () {
                that.openOrCloseList(that)
            })
        }
        if (this.docList) {
            this.addEvent(this.docList, 'click', function (event) {
                let list = that.docList.getElementsByTagName('li')
                if (!that.option.multiple) {
                    for (let i = 0; i < list.length; i++) {
                        list[i].className = ''
                    }
                    event.target.className = 'is-selected'
                    that.docInput.innerText = event.target.innerText
                    that.docPanel.value = event.target.getAttribute("data-value")
                } else {
                    let value, type, icon
                    if (event.target.nodeName !== 'I') {
                        value = event.target.getAttribute('data-value')
                        type = event.target.getAttribute('data-type')
                        icon = event.target.getElementsByTagName('i')[0]
                    } else {
                        value = event.target.parentNode.getAttribute('data-value')
                        type = event.target.parentNode.getAttribute('data-type')
                        icon = event.target
                        that.stopEventBubble(event)
                    }
                    value = that.stringToOTherType(value, type)
                    let temp = that.docPanel.value
                    let divList = that.docBox.getElementsByTagName('div')
                    if (icon.style.display === 'block') {
                        if ((that.option.minimum !== that.option.maximum && temp.length < that.option.minimum + 1)
                            || (that.option.minimum === that.option.maximum && temp.length < that.option.minimum)) {
                            that.warningHandle()
                            return
                        }
                        icon.style.display = 'none'
                        for (let i = 0; i < divList.length; i++) {
                            if (value === divList[i].getAttribute('data-value')) {
                                that.docBox.removeChild(divList[i])
                            }
                        }
                        let index = temp.indexOf(value)
                        if (index !== -1) {
                            temp.splice(index, 1)
                        }
                    } else {
                        if (that.option.maximum && that.option.maximum < divList.length) {
                            that.warningHandle()
                            return
                        }
                        icon = event.target.getElementsByTagName('i')[0]
                        icon.style.display = 'block'
                        that.addItem(event.target.innerText, value)
                        if (temp && Array.isArray(temp)) {
                            temp.push(value)
                        } else {
                            temp = []
                            temp.push(value)
                        }
                    }
                    that.docPanel.value = temp
                }
            })
        }
    }
    // 展示或者隐藏下拉框
    openOrCloseList(obj) {
        if (obj.docList) {
            obj.docList.style.overflow = 'hidden'
            if (obj.docList.style.height === '0px') {
                obj.docList.style.display = 'block'
                setTimeout(() => {
                    obj.docList.style.height = (obj.dataList.length * 33.5 + 5) > 200 ? 200 : (obj.dataList.length * 33.5 + 5) + 'px'
                }, 0)
            } else {
                obj.docList.style.height = '0px'
                setTimeout(() => {
                    obj.docList.style.overflow = 'auto'
                    obj.docList.style.display = 'none'
                }, 500)
            }
            setTimeout(() => {
                obj.docList.style.overflow = 'auto'
            }, 500)
        }
    }
    // 生成事件
    addEvent(element, e, fn) {
        if (element.addEventListener) {
            element.addEventListener(e, fn);
        } else {
            element.attachEvent("on" + e, fn);
        }
    }
    // 判断元素类型
    isBaseValue(value) {
        if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
            return false
        } else {
            return true
        }
    }
    // 字符串转成其他类型
    stringToOTherType(value, type) {
        if (type === 'number') {
            return Number(value)
        } else if (type === 'boolean') {
            return Boolean(value)
        } else {
            return value
        }
    }
    // 阻止默认事件
    stopEventDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault()
        } else if (window.event && window.event.returnValue) {
            window.event.returnValue = false
        }
    }
    // 阻止冒泡
    stopEventBubble(e) {
        if (e && e.stopPropagation) {
            e.stopPropagation()
        } else if (window.event && window.event.cancelBubble) {
            window.event.cancelBubble = false
        }
    }
    // 可以有多个值时，向输入框内添加子项
    addItem(label, value) {
        let icon = document.createElement('i')
        icon.innerHTML = '×'
        icon.setAttribute('contenteditable', 'false')
        let div = document.createElement('div')
        div.setAttribute('data-value', value)
        div.setAttribute('contenteditable', false)
        div.style.left = 0
        div.innerText = label
        div.appendChild(icon)
        this.docInput.before(div)
    }
    // 警告样式
    warningHandle() {
        let that = this
        that.docBox.className = 'entered-select-box is-error'
        setTimeout(() => {
            that.docBox.className = 'entered-select-box'
        }, 500)
    }
}