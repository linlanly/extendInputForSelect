"use strict";
function EnteredSelect() {
    this.option = {
        inputState: 'extend',   // 输入框的状态：extend-支持输入下拉框以外的内容，filter-支持筛选下拉框数据，disable-禁止输入
        isSelect: true,         // 是否有下拉框
        multiple: false,        // 是否可以有多个值
        minimum: null,          // 可以有多个值时，最少有多少个
        maximum: null,          // 可以有多个值时，最多有多少个
        labelAttr: 'label',     // 显示对应的属性
        valueAttr: 'value',     // 选中值返回对应的属性
        placeholder: '请选择'   // 提示
    };
    this.valueList = [];
    // 处理设置内容
    EnteredSelect.prototype.constructor = function (dom, data, option) {
        this.docPanel = document.getElementById(dom);
        // console.log('consult', this.copyObject(data))
        this.dataList = data ? JSON.parse(JSON.stringify(data)) : [];
        if (option) {
            if (option.multiple !== undefined && option.multiple !== null) {
                if (typeof option.multiple === 'boolean') {
                    this.option.multiple = option.multiple;
                } else {
                    throw new Error("multiple须设置为boolean类型");
                }
            }
            if (option.multiple && option.minimum) {
                if (!/\D/.test(option.minimum) && typeof option.minimum === 'number' && option.minimum > 0) {
                    this.option.minimum = option.minimum;
                } else {
                    throw new Error("minimum须设置为大于0的整数");
                }
            }
            if (option.multiple && option.maximum) {
                if (!/\D/.test(option.maximum) && typeof option.maximum === 'number' && option.maximum > 0) {
                    this.option.maximum = option.maximum;
                    if (this.option.minimum === null) {
                        this.option.minimum = 1;
                    } else if (this.option.minimum > this.option.maximum) {
                        var temp = this.option.minimum;
                        this.option.minimum = this.option.maximum;
                        this.option.maximum = temp;
                    }
                } else {
                    throw new Error("maximum须设置为大于0的整数");
                }
            }
            if (option.labelAttr) {
                for (var i = 0; i < this.dataList.length; i++) {
                    if (!this.isBaseValue(this.dataList[i]) && this.dataList[i].hasOwnProperty(option.labelAttr)) {
                        throw new Error("labelAttr对应属性不存在");
                    } else {
                        if (!this.isBaseValue(this.dataList[i][option.labelAttr])) {
                            throw new Error("labelAttr内容只能是number、string、boolean类型");
                        }
                    }
                }
                this.option.labelAttr = option.labelAttr;
            }
            if (option.valueAttr) {
                for (var i = 0; i < this.dataList.length; i++) {
                    if (!this.isBaseValue(this.dataList[i]) && this.dataList[i].hasOwnProperty(option.valueAttr)) {
                        throw new Error("valueAttr对应属性不存在");
                    } else {
                        if (!this.isBaseValue(this.dataList[i][option.valueAttr])) {
                            throw new Error("labelAttr内容只能是number、string、boolean类型");
                        }
                    }
                }
                this.option.valueAttr = option.valueAttr;
            }
            if (option.placeholder) {
                this.option.placeholder = option.placeholder;
            }
            if (option.isSelect !== undefined && option.isSelect !== null) {
                if (typeof option.isSelect === 'boolean') {
                    this.option.isSelect = option.isSelect;
                } else {
                    throw new Error("isSelect须设置为boolean类型");
                }
            }
            if (option.inputState) {
                if (option.inputState === 'extend' || option.inputState === 'disable' || option.inputState === 'filter') {
                    this.option.inputState = option.inputState;
                } else {
                    throw new Error('inputState的值只能设置为"extend"或"filter"或"disable"');
                }
            }
        }
        this.initElement()
    }
    // 初始化组件
    EnteredSelect.prototype.initElement = function () {
        if (this.docPanel) {
            this.docPanel.innerHTML = '';
            var div = '<div class="entered-select-box" style="padding-right: ' + (this.option.isSelect ? '25px' : '4px') + ';">';
            if (this.option.inputState === 'extend' || this.option.inputState === 'filter') {
                div += '<div class="entered-select-value" contenteditable="true" placeholder="请输入文字"></div>';
            } else {
                div += '<div class="entered-select-value"></div>';
            }
            if (this.option.isSelect) {
                div += '<i class="entered-select-icon"></i>';
                if (this.dataList.length > 0) {
                    var ul = '<ul class="entered-select-list">';

                    ul += this.getUlInnerHTML(this) + '</ul>';
                    div += ul;
                }
            }
            div += '</div>';
            this.docPanel.innerHTML = div;
            this.addClickEvent();
        }
    }
    // 返回下拉框内容的innerHTML
    EnteredSelect.prototype.getUlInnerHTML = function (obj, filterContent) {
        var dealList, str = '';
        if (filterContent === undefined || !/\S/g.test(filterContent)) {
            dealList = obj.dataList;
        } else {
            dataList = []
            for (var i = 0; i < obj.dataList.length; i++) {
                var temp = obj.dataList[i]
                if (temp[obj.option.labelAttr].indexOf(filterContent) !== -1) {
                    dataList.push(temp)
                }
            }
        }
        if (dealList.length < 1) {
            str = '<div class="filter-empty">无匹配数据</div>';
        } else {
            for (var i = 0; i < dealList.length; i++) {
                var item = dealList[i]
                var value = null, label = null;
                if (obj.isBaseValue(temp)) {
                    label = item;
                    value = item;
                } else if (item && item[obj.option.valueAttr] && obj.isBaseValue(item[obj.option.valueAttr]) && item[obj.option.labelAttr] && obj.isBaseValue(item[obj.option.labelAttr])) {
                    label = item[obj.option.labelAttr];
                    value = item[obj.option.valueAttr];
                }
                if (value && label) {
                    if (obj.option.multiple) {
                        if (obj.docPanel.value && obj.docPanel.value.indexOf(value) !== -1) {
                            str += '<li data-value="' + value + '" data-type="' + typeof value + '">' + label + '<i style="display: block;"></i></li>';
                        } else {
                            str += '<li data-value="' + value + '" data-type="' + typeof value + '">' + label + '<i></i></li>';
                        }
                    } else {
                        str += '<li data-value="' + value + '" data-type="' + typeof value + '">' + label + '</li>';
                    }
                }
            }
        }
        return str;
    }
    // 为组件的内容添加事件
    EnteredSelect.prototype.addClickEvent = function () {
        this.docInput = this.getElementsByClassName('entered-select-value')[0];
        this.docIcon = this.getElementsByClassName('entered-select-icon')[0];
        this.docList = this.getElementsByClassName('entered-select-list')[0];
        this.docBox = this.getElementsByClassName('entered-select-box')[0];
        var that = this;
        if (this.docBox) {
            this.boxWidth = this.isSelect ? this.docBox.clientWidth - 40 : this.docBox.clientWidth;
            this.addEvent(this.docBox, 'click', function (event) {
                var target = event.target ? event.target : event.srcElement
                var nodeName = target.nodeName;
                if (nodeName === 'I' && target.parentNode !== this) {
                    // 判断最大值最小值是否相等，设置允许移除元素的条件
                    if ((that.option.minimum !== that.option.maximum && that.valueList && that.valueList.length < that.option.minimum + 1)
                        || (that.option.minimum === that.option.maximum && that.valueList && that.valueList.length < that.option.minimum)) {
                        that.warningHandle();
                        return;
                    }

                    that.docBox.removeChild(target.parentNode);
                    var value = target.parentNode.getAttribute('data-value');
                    var index = that.valueList.indexOf(value);
                    that.valueList.splice(index, 1);
                    that.setConsult();

                    if (that.docList) {
                        var list = that.docList.getElementsByTagName('li');
                        for (var i = 0; i < list.length; i++) {
                            if (list[i].getAttribute('data-value') === target.parentNode.getAttribute('data-value')) {
                                var icon = list[i].getElementsByTagName('i')[0];
                                icon.style.display = 'none';
                            }
                        }
                    }
                } else if (target === this) {
                    if (that.option.inputState !== 'disable') {
                        that.docInput.focus();
                    } else {
                        that.openOrCloseList(that);
                    }
                }
            })
        }
        if (this.docInput) {
            this.addEvent(this.docInput, 'click', function (event) {
                that.openOrCloseList(that);
            });

            this.addEvent(this.docInput, 'focus', function () {
                if (that.docBox && that.docBox.className.indexOf('entered-select-box is-foucs') === -1) {
                    that.docBox.className = 'entered-select-box is-foucs';
                }
            });

            this.addEvent(this.docInput, 'blur', function () {
                if (that.docBox && that.docBox.className.indexOf('entered-select-box is-foucs') !== -1) {
                    that.docBox.className = 'entered-select-box';
                }
                if (that.docList) {
                    var list = that.docList.getElementsByTagName('li');
                    for (var i = 0; i < list.length; i++) {
                        list[i].className = '';
                        if (list[i].innerText === that.docInput.innerText && !that.option.multiple) {
                            list[i].className = 'is-selected';
                            that.valueList = list[i].getAttribute("data-value");
                            that.setConsult();
                            break;
                        }
                    }
                }
            });

            this.addEvent(this.docInput, 'keydown', function (event) {
                var curEvent = window.event || event;
                var code = curEvent.keyCode || curEvent.which || curEvent.charCode;
                if (code === 13) {
                    that.stopEventDefault(event);
                    if (that.option.inputState !== 'extend') {
                        return;
                    }
                    var content = that.docInput.innerText;
                    var divList = that.docBox.getElementsByTagName('div');
                    if (that.option.maximum && that.option.maximum < divList.length) {
                        that.warningHandle();
                        return;
                    }
                    var list = that.docInput.getElementsByTagName('div');
                    for (var i = 0; i < list.length; i++) {
                        if (content === list[i].innerText) {
                            return;
                        }
                    }
                    var value = null;
                    if (that.docList) {
                        var liList = that.docList.getElementsByTagName('li');
                        for (var i = 0; i < liList.length; i++) {
                            if (liList[i].innerText === content) {
                                value = liList[i].getAttribute('data-value');
                                var icon = liList[i].getElementsByTagName('i')[0];
                                icon.style.display = 'block';
                                break;
                            }
                        }
                    }
                    if (!value) {
                        value = content;
                    }

                    if (!that.option.multiple) {
                        that.valueList = value;
                        that.setConsult();
                        return;
                    }

                    that.docInput.innerText = '';
                    if (that.valueList && that.isArray(that.valueList)) {
                        if (that.valueList.indexOf(value) === -1) {
                            that.valueList.push(value);
                            that.addItem(content, value);
                        }
                    } else {
                        that.valueList = [];
                        that.valueList.push(value);
                        that.addItem(content, value);
                    }
                    that.setConsult();
                    if (that.docList) {
                        that.docList.innerHTML = that.getUlInnerHTML(that);
                    }
                }
            });

            this.addEvent(this.docInput, 'keyup', function (event) {
                var curEvent = window.event || event;
                var code = curEvent.keyCode || curEvent.which || curEvent.charCode;
                if (code !== 13) {
                    var content = that.docInput.innerText;
                    if (that.docList) {
                        that.docList.innerHTML = that.getUlInnerHTML(that, content);
                    }
                }
            });
        }
        if (this.docIcon) {
            this.addEvent(this.docIcon, 'click', function () {
                that.openOrCloseList(that);
            });
        }
        if (this.docList) {
            this.addEvent(this.docList, 'click', function (event) {
                var list = that.docList.getElementsByTagName('li');
                var target = event.target ? event.target : event.srcElement
                if (!that.option.multiple) {
                    for (var i = 0; i < list.length; i++) {
                        list[i].className = '';
                    }
                    target.className = 'is-selected';
                    that.docInput.innerText = target.innerText;
                    that.valueList = target.getAttribute("data-value");
                    that.setConsult();
                } else {
                    var value = null;
                    var type = null;
                    var icon = null;
                    if (target.nodeName !== 'I') {
                        value = target.getAttribute('data-value');
                        type = target.getAttribute('data-type');
                        icon = target.getElementsByTagName('i')[0];
                    } else {
                        value = target.parentNode.getAttribute('data-value');
                        type = target.parentNode.getAttribute('data-type');
                        icon = target;
                        that.stopEventBubble(event);
                    }
                    value = that.stringToOTherType(value, type);
                    var divList = that.docBox.getElementsByTagName('div');
                    if (icon.style.display === 'block') {
                        if ((that.option.minimum !== that.option.maximum && that.valueList.length < that.option.minimum + 1)
                            || (that.option.minimum === that.option.maximum && that.valueList.length < that.option.minimum)) {
                            that.warningHandle();
                            return;
                        }
                        icon.style.display = 'none';
                        for (var i = 0; i < divList.length; i++) {
                            if (value === divList[i].getAttribute('data-value')) {
                                that.docBox.removeChild(divList[i]);
                            }
                        }
                        console.log('do something', that.valueList, typeof that.valueList)
                        var index = that.getIndex(that.valueList, value);
                        if (index !== -1) {
                            that.valueList.splice(index, 1);
                        }
                    } else {
                        if (that.option.maximum && that.option.maximum < divList.length) {
                            that.warningHandle();
                            return;
                        }
                        icon = target.getElementsByTagName('i')[0];
                        icon.style.display = 'block';
                        that.addItem(target.innerText, value);
                        if (that.valueList && that.isArray(that.valueList)) {
                            that.valueList.push(value);
                        } else {
                            that.valueList = [];
                            that.valueList.push(value);
                        }
                    }
                    that.setConsult();
                }
            });
        }
    }
    // 展示或者隐藏下拉框
    EnteredSelect.prototype.openOrCloseList = function (obj) {
        if (obj.docList) {
            if (!obj.docList.style.height || obj.docList.style.height === '0px') {
                obj.docList.style.display = 'block';
                setTimeout(function () {
                    obj.docList.style.height = (obj.dataList.length * 33.5 + 5) > 200 ? 200 : (obj.dataList.length * 33.5 + 5) + 'px';
                }, 0);
            } else {
                obj.docList.style.height = '0px';
                setTimeout(function () {
                    obj.docList.style.display = 'none';
                }, 500);
            }
        }
    }
    // 生成事件
    EnteredSelect.prototype.addEvent = function (element, e, fn) {
        if (element.addEventListener) {
            element.addEventListener(e, fn);
        } else {
            element.attachEvent("on" + e, fn);
        }
    }
    // 判断元素类型
    EnteredSelect.prototype.isBaseValue = function (value) {
        if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
            return false;
        } else {
            return true;
        }
    }
    // 字符串转成其他类型
    EnteredSelect.prototype.stringToOTherType = function (value, type) {
        if (type === 'number') {
            return Number(value);
        } else if (type === 'boolean') {
            return Boolean(value);
        } else {
            return value;
        }
    }
    // 阻止默认事件
    EnteredSelect.prototype.stopEventDefault = function (e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else if (window.event && window.event.returnValue) {
            window.event.returnValue = false;
        }
    }
    // 阻止冒泡
    EnteredSelect.prototype.stopEventBubble = function (e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else if (window.event && window.event.cancelBubble) {
            window.event.cancelBubble = false;
        }
    }
    // 可以有多个值时，向输入框内添加子项
    EnteredSelect.prototype.addItem = function (label, value) {
        var icon = document.createElement('i');
        icon.innerHTML = '×';
        icon.setAttribute('contenteditable', 'false');
        var div = document.createElement('div');
        div.setAttribute('data-value', value);
        div.setAttribute('contenteditable', false);
        div.style.left = 0;
        div.innerText = label;
        div.appendChild(icon);
        this.docBox.insertBefore(div, this.docInput)
    }
    // 警告样式
    EnteredSelect.prototype.warningHandle = function () {
        var that = this;
        that.docBox.className = 'entered-select-box is-error';
        setTimeout(function () {
            that.docBox.className = 'entered-select-box';
        }, 500);
    }
    // 设置结果
    EnteredSelect.prototype.setConsult = function () {
        if (this.option.maximum && this.option.minimum && this.option.maximum <= this.valueList.length && this.option.minimum >= this.valueList.length) {
            this.docPanel.value = this.valueList;
        } else if (this.option.maximum && !this.option.minimum && this.option.maximum <= this.valueList.length) {
            this.docPanel.value = this.valueList;
        } else if (!this.option.maximum && this.option.minimum && this.option.minimum >= this.valueList.length) {
            this.docPanel.value = this.valueList;
        } else if (!this.option.multiple && this.valueList.length === 1) {
            this.docPanel.value = this.valueList[0];
        } else {
            this.docPanel.value = '';
        }
    }
    EnteredSelect.prototype.getElementsByClassName = function (className) {
        if (document.getElementsByClassName) {
            return document.getElementsByClassName(className)
        }
        var allItems = this.docPanel.getElementsByTagName("*");
        var newArr = [];
        for (var i = 0; i < allItems.length; i++) {
            var classNames = allItems[i].className;
            var arrClass = classNames.split(" ");
            for (var j = 0; j < arrClass.length; j++) {
                if (arrClass[j] === className) {
                    newArr.push(allItems[i])
                }
            }
        }
        return newArr
    }
    EnteredSelect.prototype.isArray = function (data) {
        return Object.prototype.toString.call(data) === '[object Array]';
    }
    EnteredSelect.prototype.getIndex = function (dataList, data) {
        if (typeof dataList === 'string') {
            return dataList.indexOf(data)
        }
        if (this.isArray(dataList)) {
            for (var i = 0; i < dataList.length; i++) {
                if (typeof dataList[i] === 'string' && dataList[i].indexOf(data) !== -1) {
                    return i
                }
            }
        }

        return -1
    }
    // EnteredSelect.prototype.copyObject = function (dataList) {
    //     var typeStr = Object.prototype.toString.call(dataList)
    //     var type = typeStr.substring(8, typeStr.length - 1)
    //     var result = null
    //     // console.log('print type', type)
    //     switch(type) {
    //         case 'String':
    //         case 'Number':
    //         case 'Boolean':
    //             return dataList;
    //         case 'Object':
    //             var result = {}
    //             for (var i in dataList) {
    //                 console.log('key value', i, dataList[i])
    //                 result[i] = this.copyObject(dataList[i])
    //             }
    //             return result
    //         case 'Array':
    //             var result = []
    //             console.log('???? arrary')
    //             for (var i = 0; i < dataList.length; i++) {
    //                 result.push(this.copyObject(dataList[i]))
    //             }
    //             return result;
    //         default: 
    //             return null;  
    //     }
    // }
};