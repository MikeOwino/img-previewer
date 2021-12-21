/*!
 * ImgPreviewer v1.0.5
 * https://github.com/yue1123/img-previewer
 *
 * Copyright 2021-present dh
 * Released under the MIT license
 *
 * Date: 2021-12-21T14:29:28.306Z
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImgPreviewer = factory());
})(this, (function () { 'use strict';

    /**
     * 防抖函数
     * @export {Funcion}
     * @param {Function} fn 回调函数
     * @param {Number} delay 防抖时间
     * @returns {Function}
     */
    function debounce(fn, delay) {
        var timer = 0;
        return function (arg) {
            clearTimeout(timer);
            timer = window.setTimeout(function () {
                fn(arg);
                clearTimeout(timer);
            }, delay);
        };
    }
    // 获取元素是否出现在可视区域
    function isElementInViewport(el) {
        var viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var offsetTop = el.offsetTop;
        var offsetHeight = el.offsetHeight;
        var scrollTop = document.documentElement.scrollTop;
        var top = offsetTop - scrollTop;
        return offsetHeight + offsetTop > scrollTop && top <= viewPortHeight + 100;
    }
    // 获取元素位置
    function getElementRect(el) {
        return el.getBoundingClientRect();
    }
    /**
     * 获取两数乘以一定比例后,较小的一个
     * @param multiplicator 乘数
     * @param number1 计算比例数1
     * @param number2 计算比例数2
     * @param ratio 比例
     * @returns 两数中比例值小的一个
     */
    function getTwoNumberSmall(multiplicator1, number1, multiplicator2, number2, ratio) {
        var a = (multiplicator1 * ratio) / number1;
        var b = (multiplicator2 * ratio) / number2;
        return a > b ? b : a;
    }
    function nextTick(fn) {
        requestAnimationFrame(function () {
            fn && fn();
        });
    }

    function ImgPreviewer(selector, options) {
        if (typeof window !== 'object') {
            return;
        }
        // check use new
        if (!(this instanceof ImgPreviewer)) {
            return console.error(new Error('ImagePreviewerue is a constructor and should be called with the `new` keyword'));
        }
        // check required params is correct incoming
        if (selector && typeof selector === 'string') {
            if (!document.querySelector(selector))
                return console.error(new Error('selector is invalid'));
        }
        else {
            return console.error(new Error('ImagePreviewer plugin should css string selector that on first params,like #el,.el'));
        }
        var template = "\n        <div class=\"img-pre__header img-pre__animated\">\n            <div class=\"img-pre__nums\">\n                <p>\n                    <span id=\"img-pre__current-index\"></span>\n                    <span class=\"img-pre__nums-delimiter\">-</span>\n                    <span id=\"img-pre__total-index\"></span>\n                </p>\n            </div>\n            <div class=\"img-pre__bottons\" id=\"J_header-buttons\">\n                <button class=\"img-pre__button-item\" data-action=\"reset\" data-tooltip=\"{{RESET}}\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-view-list\" viewBox=\"0 0 16 16\" > <path d=\"M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z\" /> </svg>\n                </button>\n                <button class=\"img-pre__button-item\" data-action=\"rotateLeft\" data-tooltip=\"{{ROTATE_LEFT}}\">\n                    <svg t=\"1639647288997\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1423\" width=\"16\" height=\"16\" > <path d=\"M725.996 383.57H74.558A74.782 74.782 0 0 0 0 458.126v491.315A74.782 74.782 0 0 0 74.558 1024h651.438a74.782 74.782 0 0 0 74.558-74.558V458.127a74.782 74.782 0 0 0-74.558-74.558z m10.528 565.872a10.816 10.816 0 0 1-10.528 10.528H74.558a10.816 10.816 0 0 1-10.528-10.528V458.127c0-5.6 4.928-10.528 10.528-10.528h651.438c5.6 0 10.528 4.928 10.528 10.528v491.315z\" p-id=\"1424\" fill=\"#ffffff\" ></path> <path d=\"M1023.94 533.165C986.117 355.73 849.93 202.038 668.558 132.088a592.112 592.112 0 0 0-234.33-39.551l36.511-38.463A32 32 0 1 0 424.341 9.98l-96.094 101.15a32 32 0 0 0 1.184 45.278l96.062 90.974a31.935 31.935 0 0 0 45.246-1.248 32 32 0 0 0-1.216-45.279l-46.75-44.319a529.17 529.17 0 0 1 222.746 35.231c161.403 62.239 282.392 198.139 315.703 354.647a32.063 32.063 0 0 0 62.718-13.248z\" p-id=\"1425\" fill=\"#ffffff\" ></path> </svg>\n                </button>\n                <button class=\"img-pre__button-item\" data-action=\"rotateRight\" data-tooltip=\"{{ROTATE_RIGHT}}\">\n                    <svg t=\"1639647310917\" class=\"icon\" viewBox=\"0 0 1025 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"1652\" width=\"16\" height=\"16\" > <path d=\"M0.69753 525.673495a31.720891 31.720891 0 0 0 25.581364 37.860419 32.744146 32.744146 0 0 0 38.372045-23.534855 502.929616 502.929616 0 0 1 320.790305-350.464687A557.673735 557.673735 0 0 1 611.580501 154.23209l-48.092964 44.511573a28.1395 28.1395 0 0 0-10.232546 21.999973 31.209264 31.209264 0 0 0 8.697664 22.511601 33.255773 33.255773 0 0 0 46.046455 0L706.231548 154.23209a32.744146 32.744146 0 0 0 10.232546-21.999973 31.720891 31.720891 0 0 0-9.209291-22.5116L609.533992 10.464824a33.255773 33.255773 0 0 0-31.209264-9.720918 32.232519 32.232519 0 0 0-23.534855 21.488346A31.209264 31.209264 0 0 0 563.487537 51.906634l37.348791 37.860419a626.743417 626.743417 0 0 0-237.906685 38.883673 566.883026 566.883026 0 0 0-358.139095 394.97626z m269.115949 420.045996a11.767427 11.767427 0 0 0 10.744172 10.744173h665.115464a10.744173 10.744173 0 0 0 10.744173-10.744173V435.627094a10.744173 10.744173 0 0 0-10.744173-10.744173h-665.115464a11.2558 11.2558 0 0 0-10.744172 10.744173v511.627279zM281.069279 358.883002h665.115463A77.255719 77.255719 0 0 1 1023.952089 435.627094v511.627279a76.744092 76.744092 0 0 1-77.25572 76.744092h-665.115463A76.744092 76.744092 0 0 1 205.348441 945.719491V435.627094A77.255719 77.255719 0 0 1 281.069279 358.883002z\" p-id=\"1653\" fill=\"#ffffff\" ></path> </svg>\n                </button>\n                <button class=\"img-pre__button-item\" data-action=\"close\" data-tooltip=\"{{CLOSE}}\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-x-lg\" viewBox=\"0 0 16 16\" > <path fill-rule=\"evenodd\" d=\"M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z\" /> <path fill-rule=\"evenodd\" d=\"M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z\" /> </svg>\n                </button>\n                <button id=\"J-img-pre__prev\" data-action=\"prev\" data-tooltip=\"{{PREV}}\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-left\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z\"/> </svg>\n                </button>\t\n                <button id=\"J-img-pre__next\" data-action=\"next\" data-tooltip=\"{{NEXT}}\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-chevron-right\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z\"/> </svg>\n                </button>\n            </div>\n        </div>\n        <div class=\"img-pre__contet-warpper\" id=\"J_content-warpper\">\n            <div class=\"img-pre__img-item img-pre__animated current-index\" id=\"J_current-index\">\n                <img id=\"img-pre__imgage\" src=\"\" />\n            </div>\n        </div>\n        ";
        var defaultOptions = {
            ratio: 0.7,
            zoom: {
                min: 0.1,
                max: 5,
                step: 0.1
            },
            opacity: 0.6,
            scrollbar: false
        };
        var mergeOptions;
        var previewerContainer = null;
        var i18n = {
            en: {
                RESET: 'reset',
                ROTATE_LEFT: 'rotate left',
                ROTATE_RIGHT: 'rotate right',
                CLOSE: 'close',
                NEXT: 'next',
                PREV: 'prev'
            },
            zh: {
                RESET: '重置',
                ROTATE_LEFT: '向左旋转',
                ROTATE_RIGHT: '向右旋转',
                CLOSE: '关闭',
                NEXT: '下一张',
                PREV: '上一张'
            }
        };
        var store = {
            rootEl: null,
            container: null,
            imgList: [],
            currentImgElement: null,
            totalIndex: 0,
            index: 0,
            width: 0,
            height: 0,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            scale: 0,
            rotate: 0,
            currentClickEl: null
        };
        var _BODY = document.body || document.getElementsByTagName('body')[0];
        var isOpen = false;
        var isRunning = false;
        // 绑定事件
        function bindEvent() {
            /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(window.navigator.userAgent);
            // let touchstart = mobile ? 'touchstart' : 'mousedown'
            // let touchend = mobile ? 'touchend' : 'mouseup'
            // let touchmove = mobile ? 'touchmove' : 'mousemove'
            var rootEl = store.rootEl;
            rootEl === null || rootEl === void 0 ? void 0 : rootEl.addEventListener('click', function (e) {
                if (e.target === store.currentImgElement)
                    return;
                if (e.target.localName === 'img') {
                    store.currentClickEl = e.target;
                    store.index = Number(e.target.dataset.index);
                    console.log(Number(e.target.dataset.index));
                    handlePrviewershow(e, store.imgList[store.index].src);
                }
            });
            // clone
            document.getElementById('J_header-buttons').addEventListener('click', function (e) {
                var buttonEl = e.path.find(function (item) { return item.localName === 'button'; });
                if (!buttonEl || buttonEl.disabled)
                    return;
                var action = buttonEl.dataset.action;
                console.log(action);
                switch (action) {
                    case 'close':
                        handlePrviewerHide();
                        break;
                    case 'rotateLeft':
                        handleRotateLeft();
                        break;
                    case 'rotateRight':
                        handleRotateRight();
                        break;
                    case 'reset':
                        handleReset();
                        break;
                    case 'next':
                        handleNext();
                        // console.log(document.querySelector(``));
                        break;
                    case 'prev':
                        handlePrev();
                        // console.log(document.querySelector(``));
                        break;
                }
            });
            // add keyboard event
            document.addEventListener('keyup', function (e) {
                switch (e.key) {
                    case 'Escape':
                        handlePrviewerHide();
                        break;
                    case 'ArrowRight':
                        handleNext();
                        break;
                    case 'ArrowLeft':
                        handlePrev();
                        break;
                }
            });
            var handleResize = debounce(function () {
                isOpen && setImageStyles(window.innerWidth, window.innerHeight);
            }, 150);
            window.addEventListener('resize', handleResize);
        }
        function setStyle(imgElement, styleObj) {
            for (var key in styleObj) {
                imgElement.style[key] = styleObj[key];
            }
        }
        // setProperties
        function setProperties(imgElement, properties) {
            for (var key in properties) {
                imgElement.style.setProperty(key, properties[key]);
            }
        }
        function setDataset(el, key, value) {
            if (el.dataset) {
                el.dataset[key] = value;
            }
            else {
                el.setAttribute('data-' + key, value);
            }
        }
        function setImageStyles(w, h) {
            store.endX = w / 2 - store.width / 2 - store.startX;
            store.endY = h / 2 - store.height / 2 - store.startY;
            store.scale = getTwoNumberSmall(w, store.width, h, store.height, mergeOptions.ratio || defaultOptions.ratio);
            setStyle(store.currentImgElement, {
                top: "".concat(store.startY, "px"),
                left: "".concat(store.startX - 1, "px"),
                width: "".concat(store.width, "px"),
                height: "".concat(store.height, "px")
            });
            setProperties(store.currentImgElement, {
                '--offsetX': "".concat(store.endX, "px"),
                '--offsetY': "".concat(store.endY, "px"),
                '--scale': "".concat(store.scale),
                '--rotate': "0"
            });
        }
        function handleNext() {
            if (store.index === store.totalIndex - 1 || isRunning)
                return;
            isRunning = true;
            store.index = store.index + 1;
            var div = document.createElement('div');
            var img = document.createElement('img');
            var warpper = document.getElementById('J_content-warpper');
            var currentImgWarpper = document.querySelector('#J_current-index');
            var clickEl = store.imgList[store.index];
            store.width = clickEl.width;
            store.height = clickEl.height;
            div.classList.add('img-pre__img-item', 'slide-left-in');
            img.src = clickEl.src;
            store.currentImgElement = img;
            setImageStyles(window.innerWidth, window.innerHeight);
            div.appendChild(img);
            warpper.appendChild(div);
            currentImgWarpper.classList.add('slide-left-out');
            currentImgWarpper.addEventListener('animationend', function () {
                isRunning = false;
                currentImgWarpper && warpper.removeChild(currentImgWarpper);
            });
            var fn = function () {
                div.classList.remove('slide-left-in');
                div.classList.add('current-index');
                div.id = 'J_current-index';
                store.currentClickEl = clickEl;
                div.removeEventListener('animationend', fn);
            };
            div.addEventListener('animationend', fn);
        }
        function handlePrev() {
            if (store.index === 0 || isRunning)
                return;
            isRunning = true;
            store.index = store.index - 1;
            var div = document.createElement('div');
            var img = document.createElement('img');
            var warpper = document.getElementById('J_content-warpper');
            var currentImgWarpper = document.querySelector('#J_current-index');
            var clickEl = store.imgList[store.index];
            store.width = clickEl.width;
            store.height = clickEl.height;
            div.classList.add('img-pre__img-item', 'slide-right-in');
            img.src = clickEl.src;
            store.currentImgElement = img;
            setImageStyles(window.innerWidth, window.innerHeight);
            div.appendChild(img);
            warpper.appendChild(div);
            currentImgWarpper.classList.add('slide-right-out');
            currentImgWarpper.addEventListener('animationend', function () {
                isRunning = false;
                currentImgWarpper && warpper.removeChild(currentImgWarpper);
            });
            var fn = function () {
                div.classList.remove('slide-right-in');
                div.classList.add('current-index');
                div.id = 'J_current-index';
                store.currentClickEl = clickEl;
                div.removeEventListener('animationend', fn);
            };
            div.addEventListener('animationend', fn);
        }
        // show
        function handlePrviewershow(e, src) {
            isOpen = true;
            previewerContainer.style.display = 'block';
            nextTick(function () {
                store.currentImgElement.src = src;
                previewerContainer.classList.remove('hide');
                previewerContainer.classList.add('show');
                store.width = e.target.width;
                store.height = e.target.height;
                store.startX = e.clientX - e.offsetX;
                store.startY = e.clientY - e.offsetY + 1;
                setImageStyles(window.innerWidth, window.innerHeight);
            });
        }
        // hide
        function handlePrviewerHide() {
            isOpen = false;
            // 如果元素在视图中
            if (isElementInViewport(store.currentClickEl)) {
                var _a = getElementRect(store.currentClickEl), top = _a.top, left = _a.left, width = _a.width, height = _a.height;
                previewerContainer.classList.remove('show');
                previewerContainer.classList.add('hide');
                store.currentImgElement.style.cssText = "width:".concat(width, "px;height:").concat(height, "px;position: fixed; top: ").concat(top, "px; left: ").concat(left, "px;");
                var fn_1 = function () {
                    var _a;
                    previewerContainer.style.display = 'none';
                    store.currentImgElement.src = '';
                    store.currentImgElement.style.cssText = "";
                    (_a = store.currentImgElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('transitionend', fn_1);
                };
                store.currentImgElement.addEventListener('transitionend', fn_1);
            }
        }
        // 左旋转
        function handleRotateLeft() {
            store.rotate -= 90;
            setProperties(store.currentImgElement, {
                '--rotate': "".concat(store.rotate, "deg")
            });
        }
        // 右旋转
        function handleRotateRight() {
            store.rotate += 90;
            setProperties(store.currentImgElement, {
                '--rotate': "".concat(store.rotate, "deg")
            });
        }
        // reset
        function handleReset() {
            store.rotate = 0;
            setProperties(store.currentImgElement, {
                '--rotate': "0"
            });
        }
        // listen index change,and update view
        function onIndexChange(index) {
            document.getElementById('img-pre__current-index').innerText = String(index + 1);
            var prevButton = document.getElementById('J-img-pre__prev');
            var nextButton = document.getElementById('J-img-pre__next');
            if (index === 0) {
                prevButton.disabled = true;
            }
            else {
                prevButton.disabled = false;
            }
            if (index === store.totalIndex - 1) {
                nextButton.disabled = true;
            }
            else {
                nextButton.disabled = false;
            }
        }
        function onTotalIndexChange(index) {
            document.getElementById('img-pre__total-index').innerText = '' + index;
        }
        // get i18n options
        function geti18nInfo() {
            if (mergeOptions.i18n) {
                return mergeOptions.i18n;
            }
            else {
                var lang = window.navigator.language;
                // all display in English except Chinese
                return lang.indexOf('zh') !== -1 ? i18n.zh : i18n.en;
            }
        }
        // i18n translate
        function i18nTranslate(template, i18nObj) {
            return template.replace(/\{\{(.*?)\}\}/g, function (_, a) { return i18nObj[a]; });
        }
        //
        function defineReactValue(store, key, value, cal) {
            Object.defineProperty(store, key, {
                enumerable: false,
                set: function (newVal) {
                    cal((value = newVal));
                },
                get: function () {
                    return value;
                }
            });
        }
        //
        function render() {
            var el = document.getElementById('image-preview-container');
            if (!el) {
                previewerContainer = document.createElement('div');
                previewerContainer.classList.add('img-pre__container', 'img-pre__animated');
                previewerContainer.id = 'J_container';
                previewerContainer.style.setProperty('--container-opcity', '0.6');
                previewerContainer.style.setProperty('--header-bg-opcity', '0.2');
                previewerContainer.style.setProperty('--container-zIndex', '99');
                previewerContainer.innerHTML = i18nTranslate(template, geti18nInfo());
                _BODY.appendChild(previewerContainer);
            }
            else {
                previewerContainer = el;
            }
        }
        function _init(selector, options) {
            if (options) {
                options.zoom = Object.assign({}, defaultOptions.zoom, options.zoom || {});
                mergeOptions = Object.assign({}, defaultOptions, options);
            }
            else {
                mergeOptions = defaultOptions;
            }
            store.rootEl = document.querySelector(selector);
            var imgEls = store.rootEl.querySelectorAll('img:not(.img-pre__img-item img)');
            // use defineProperty to init listen index
            defineReactValue(store, 'index', 0, onIndexChange);
            defineReactValue(store, 'totalIndex', 0, onTotalIndexChange);
            render();
            bindEvent();
            store.currentImgElement = document.querySelector('#J_current-index img');
            store.totalIndex = imgEls.length;
            store.imgList = new Array(store.totalIndex);
            for (var i = 0, len = store.totalIndex; i < len; i++) {
                var element = imgEls[i];
                setDataset(element, 'index', String(i));
                store.imgList[i] = element;
            }
            console.log(store);
        }
        ImgPreviewer.prototype.reset = function () {
            console.log(mergeOptions, options);
        };
        _init(selector, options);
    }

    return ImgPreviewer;

}));
