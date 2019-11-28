(function () {
    'use strict';

    class Events {
    }
    Events.DELETE_ITEM = "delete_item";
    Events.DATA_INIT = "data_init";
    Events.INSERT_FILE_DATA = "insert_file_data";
    Events.PREVIEW_DATA = "preview_data";

    class utils {
        static round(n, d) {
            d = Math.pow(10, d);
            return Math.round(n * d) / d;
        }
        static rand(low, high) {
            return Math.floor((high - low + 1) * Math.random()) + low;
        }
        static roundColor() {
            return "rgb(" + utils.rand(0, 200) + "," + utils.rand(0, 200) + "," + utils.rand(0, 200) + ")";
        }
        static copyText(text) {
            if (text === "") {
                alert("好像没有需要复制的内容哦！");
                return;
            }
            var oInput = document.querySelector('.oInput');
            if (!oInput) {
                oInput = document.createElement('input');
                oInput.className = 'oInput';
                document.body.appendChild(oInput);
            }
            oInput.style.display = 'block';
            oInput.value = text;
            oInput.select();
            document.execCommand("Copy");
            oInput.style.display = 'none';
            alert('内容已经复制到黏贴板啦');
        }
        static setItem(item, str) {
            localStorage.setItem(item, str);
        }
        static getItem(item) {
            return localStorage.getItem(item);
        }
        static spliceByKey(array, key, val) {
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (element[key] && element[key] == val) {
                    array.splice(index, 1);
                }
            }
        }
        static spliceArrayByKey(array, attr, index, key, val) {
            const item = array[index][attr];
            for (let i = 0; i < item.length; i++) {
                const element = item[i];
                if (element[key] && element[key] == val) {
                    item.splice(i, 1);
                }
            }
        }
        static findByKey(array, key, val) {
            const result = [];
            for (let index = 0; index < array.length; index++) {
                const item = array[index];
                if (item[key] && item[key] == val) {
                    return item;
                }
            }
        }
    }

    class PointsManager {
        static saveHistory() {
            utils.setItem("history", JSON.stringify(PointsManager.historyData));
        }
        static saveGroup(data) {
            const groupData = data || PointsManager.groupData;
            utils.setItem("group", JSON.stringify(groupData));
        }
        static insertData(data) {
            if (data) {
                try {
                    const groupData = JSON.parse(data);
                    if (groupData["name"] && groupData["data"]) {
                        for (let i = 0, len = groupData["data"].length; i < len; i++) {
                            const item = groupData["data"][i];
                            if (item["label"] && item["points"]) {
                                for (let j = 0, length = item["points"].length; j < length; j++) {
                                    const point = item["points"][j];
                                    if (point["X"] && point["Y"] && point["ID"]) {
                                    }
                                    else {
                                        throw new Error();
                                    }
                                }
                            }
                            else {
                                throw new Error();
                            }
                        }
                    }
                    else {
                        throw new Error();
                    }
                    PointsManager.groupData.push(groupData);
                    PointsManager.saveGroup();
                    alert("导入成功！");
                }
                catch (err) {
                    alert("文件内容json格式有误！");
                }
            }
        }
    }
    PointsManager.recognizer = new $Q.QDollarRecognizer();
    PointsManager.pointClouds = PointsManager.recognizer.PointClouds;
    PointsManager.groupData = [];
    PointsManager.historyData = [];
    PointsManager.previewData = [];
    PointsManager.currentGroupIndex = 0;

    var itemType;
    (function (itemType) {
        itemType["HISTORY"] = "HISTORY";
        itemType["GROUP"] = "GROUP";
    })(itemType || (itemType = {}));
    class Item extends fgui.GComponent {
        constructor() {
            super();
            this._selected = false;
        }
        constructFromXML(xml) {
            super.constructFromXML(xml);
            this._titleGC = this.getChild("n1").asTextField;
            this._timeGC = this.getChild("n2").asTextField;
            this._btnSelect = this.getChild("n6").asButton;
            this._btnSelect.onClick(this, this.selectItem);
            this.getChild("n7").onClick(this, this.viewItem);
            this.getChild("n8").onClick(this, this.deleteItem);
        }
        set type(type) {
            this._type = type;
        }
        set title(string) {
            this._title = string;
            this._titleGC.text = string;
        }
        get title() {
            return this._title;
        }
        set time(string) {
            this._time = string;
            this._timeGC.text = string;
        }
        get time() {
            return this._time;
        }
        set selected(bool) {
            this._btnSelect.selected = this._selected = bool;
        }
        get selected() {
            return this._selected;
        }
        selectItem() {
            this._selected = this._btnSelect.selected;
        }
        deleteItem() {
            Laya.stage.event(Events.DELETE_ITEM, this);
        }
        viewItem() {
            let data = [];
            if (this._type == itemType.HISTORY) {
                data = PointsManager.historyData;
            }
            else {
                data = PointsManager.groupData[PointsManager.currentGroupIndex]["data"];
            }
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (item["uuid"] == this._uuid) {
                    PointsManager.previewData = item["points"];
                    break;
                }
            }
            Laya.stage.event(Events.PREVIEW_DATA, null);
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            fgui.UIObjectFactory.setExtension("ui://canvas/item", Item);
        }
    }
    GameConfig.width = Laya.Browser.clientWidth;
    GameConfig.height = Laya.Browser.clientHeight;
    GameConfig.scaleMode = "noscale";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class WindowHistory extends fgui.Window {
        constructor() {
            super();
            this._isAll = false;
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("canvas", "window_1").asCom;
            this.center();
            this.setPivot(0.5, 0.5);
            this.contentPane.getChild("btn_close").onClick(this, this.onHide);
            this._list = this.contentPane.getChild("n3").asList;
            this._list.scrollItemToViewOnClick = false;
            this._btnSelect = this.contentPane.getChild("n12").asButton;
            this.contentPane.getChild("n4").asButton.onClick(this, this.addGroup);
            this._btnSelect.onClick(this, this.selectAll);
            this.contentPane.getChild("n19").asButton.onClick(this, this.deleteAll);
        }
        onShown() {
            this.initList();
            Laya.stage.on(Events.DELETE_ITEM, this, this.deleteItem);
        }
        initList() {
            this._list.removeChildrenToPool();
            for (var i = 0; i < PointsManager.historyData.length; i++) {
                const element = PointsManager.historyData[i];
                var item = this._list.addItemFromPool();
                item.title = element.label.length > 6 ? element.label.substr(0, 6) + "..." : element.label;
                item.time = element.timestamp || "-";
                item._uuid = element["uuid"];
                item.type = itemType.HISTORY;
            }
        }
        deleteItem(evt) {
            this._list.removeChildToPool(evt);
            utils.spliceByKey(PointsManager.historyData, "uuid", evt._uuid);
            PointsManager.saveHistory();
        }
        addGroup() {
            const name = this.contentPane.getChild("n6").asTextField.text;
            if (!name) {
                alert("请先为字符组起个名字吧！");
                return;
            }
            const length = this._list._children.length;
            if (length == 0) {
                alert("你好像还没有什么历史记录哦~");
                return;
            }
            let pointsItem = [];
            for (let i = 0; i < length; i++) {
                let item = this._list.getChildAt(i);
                if (item.selected) {
                    const points = utils.findByKey(PointsManager.historyData, "uuid", item["_uuid"]);
                    pointsItem.push({ "label": points['label'], "points": points["points"] });
                }
            }
            if (pointsItem.length == 0) {
                alert("请至少选择一个字符数据！");
                return;
            }
            PointsManager.groupData.push({ "name": name, "data": pointsItem });
            PointsManager.saveGroup();
            Laya.stage.event(Events.DATA_INIT);
            alert("创建成功！");
        }
        selectAll() {
            this._isAll = !this._isAll;
            this.updateList(this._isAll);
        }
        deleteAll() {
            this._list.removeChildrenToPool();
            PointsManager.historyData = [];
            PointsManager.saveHistory();
        }
        updateList(bool = false) {
            for (let i = 0; i < this._list._children.length; i++) {
                let item = this._list.getChildAt(i);
                item.selected = bool;
            }
        }
        doShowAnimation() {
            this.setScale(0.1, 0.1);
            fgui.GTween.to2(0.1, 0.1, 1, 1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.onShown, this);
        }
        doHideAnimation() {
            fgui.GTween.to2(1, 1, 0.1, 0.1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.hideImmediately, this);
        }
        onHide() {
            Laya.stage.off(Events.DELETE_ITEM, this, this.deleteItem);
            this.updateList(false);
            this.hide();
        }
    }

    class WindowGroup extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("canvas", "window_2").asCom;
            this.center();
            this.setPivot(0.5, 0.5);
            this.contentPane.getChild("btn_close").onClick(this, this.onHide);
            this._comboBox = this.contentPane.getChild("n17").asComboBox;
            this._comboBox.on(fairygui.Events.STATE_CHANGED, this, this.onComboBoxChanged);
            this._list = this.contentPane.getChild("n3").asList;
            this._list.scrollItemToViewOnClick = false;
            this.contentPane.getChild("n20").asButton.onClick(this, this.deleteGroup);
            this.contentPane.getChild("n19").asButton.onClick(this, this.exportData);
            this.contentPane.getChild("n4").asButton.onClick(this, this.importData);
        }
        onShown() {
            this.initComboBox();
            Laya.stage.on(Events.DELETE_ITEM, this, this.deleteItem);
        }
        initComboBox() {
            Laya.stage.event(Events.DATA_INIT);
            this._comboBox.items = [];
            this._comboBox.values = [];
            let items = [], values = [], length = PointsManager.groupData.length;
            if (!length) {
                alert("数据组好像木有数据了哦！");
                return;
            }
            else {
                for (let i = 0; i < length; i++) {
                    items.push(PointsManager.groupData[i]["name"]);
                    values.push(i);
                }
                this._comboBox.items = items;
                this._comboBox.values = values;
            }
            this.initList();
        }
        onComboBoxChanged() {
            PointsManager.currentGroupIndex = +this._comboBox.value;
            this.initList();
        }
        initList() {
            this._list.removeChildrenToPool();
            if (!PointsManager.groupData.length) {
                return;
            }
            const groupData = PointsManager.groupData[PointsManager.currentGroupIndex]["data"];
            for (var i = 0; i < groupData.length; i++) {
                const element = groupData[i];
                const uuid = new Date().getTime() + i;
                var item = this._list.addItemFromPool();
                item.title = element.label.length > 6 ? element.label.substr(0, 6) + "..." : element.label;
                item.time = element.timestamp || "组内数据不记录时间";
                item._uuid = element["uuid"] = uuid;
                item.type = itemType.GROUP;
            }
        }
        deleteGroup() {
            PointsManager.groupData.splice(PointsManager.currentGroupIndex, 1);
            PointsManager.saveGroup();
            if (PointsManager.groupData.length > 0) {
                alert(`数据组：【${this._comboBox.text}】已成功删除！`);
                this.initComboBox();
            }
            else {
                alert("数据组好像木有数据了哦！");
            }
        }
        deleteItem(evt) {
            this._list.removeChildToPool(evt);
            utils.spliceArrayByKey(PointsManager.groupData, "data", PointsManager.currentGroupIndex, "uuid", evt._uuid);
            const object = Object.assign([], PointsManager.groupData);
            for (let i = 0; i < object.length; i++) {
                const item = object[i];
                for (let j = 0; j < item["data"].length; j++) {
                    const point = item["data"][j];
                    if (point["uuid"]) {
                        delete point["uuid"];
                    }
                }
            }
            PointsManager.saveGroup(object);
        }
        exportData() {
            const data = PointsManager.groupData[PointsManager.currentGroupIndex];
            data["data"].map((v, i) => {
                if (v["uuid"]) {
                    delete v["uuid"];
                    v["points"].map((value, index) => {
                        value["X"] = Math.trunc(value["X"]);
                        value["Y"] = Math.trunc(value["Y"]);
                    });
                }
            });
            utils.copyText(JSON.stringify(data).replace(/"IntX":0,"IntY":0,/g, ""));
        }
        importData() {
            let text = this.contentPane.getChild("n30").text;
            PointsManager.insertData(text);
            this.initComboBox();
        }
        doShowAnimation() {
            this.setScale(0.1, 0.1);
            fgui.GTween.to2(0.1, 0.1, 1, 1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.onShown, this);
        }
        doHideAnimation() {
            fgui.GTween.to2(1, 1, 0.1, 0.1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.hideImmediately, this);
        }
        onHide() {
            this.hide();
            Laya.stage.off(Events.DELETE_ITEM, this, this.deleteItem);
        }
    }

    class Canvas extends fgui.Window {
        constructor() {
            super();
        }
        onInit() {
            this.contentPane = fgui.UIPackage.createObject("canvas", "canvas").asCom;
            this.center();
            this.setPivot(0.5, 0.5);
            this.contentPane.getChild("n2").onClick(this, this.onHide);
            this._canvas = this.contentPane.getChild("n1").asGraph;
        }
        onShown() {
            this.autoDraw();
        }
        autoDraw() {
            this._canvas.displayObject.graphics.clear(false);
            this._canvas.displayObject.graphics.drawRect(0, 0, this._canvas.width, this._canvas.height, "#ffffff");
            let preX = PointsManager.previewData[0]["X"], preY = PointsManager.previewData[0]["Y"];
            let length = PointsManager.previewData.length;
            let currentConut = 0;
            let strokeColor = utils.roundColor();
            for (let i = 1; i < length - 1; i++) {
                const point = PointsManager.previewData[i], curX = point["X"], curY = point["Y"];
                if (currentConut != point["ID"]) {
                    currentConut++;
                    strokeColor = utils.roundColor();
                }
                else {
                    (function (canvas, preX, preY, curX, curY, index, color) {
                        window.setTimeout(() => {
                            canvas.drawLine(preX, preY, curX, curY, color, 2);
                        }, index * 10);
                    })(this._canvas.displayObject.graphics, preX, preY, curX, curY, i, strokeColor);
                }
                preX = curX;
                preY = curY;
            }
        }
        doShowAnimation() {
            this.setScale(0.1, 0.1);
            fgui.GTween.to2(0.1, 0.1, 1, 1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.onShown, this);
        }
        doHideAnimation() {
            fgui.GTween.to2(1, 1, 0.1, 0.1, 0.3)
                .setTarget(this, this.setScale)
                .setEase(fgui.EaseType.QuadOut)
                .onComplete(this.hideImmediately, this);
        }
        onHide() {
            this.hide();
        }
    }

    class App {
        constructor() {
            this._groupName = "";
            this.preX = 0;
            this.preY = 0;
            this.curX = 0;
            this.curY = 0;
            this._points = [];
            this._strokeID = 0;
            this._strokeColor = "";
            this.touchMoveable = true;
            this.hasRecognize = false;
            fgui.UIPackage.loadPackage("res/ui/canvas", Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject("canvas", "Main").asCom;
            this._view.x = (Laya.Browser.clientWidth - this._view.width) / 2;
            fgui.GRoot.inst.addChild(this._view);
            this._canvas = this._view.getChild('canvas');
            this._canvas.on("mousedown", this, this.touchStart);
            this._btnClear = this._view.getChild("n26");
            this._btnClear.onClick(this, this.canvasClear);
            this._btnRecognize = this._view.getChild("n25");
            this._btnRecognize.onClick(this, this.recognize);
            this._textResult = this._view.getChild('text_result');
            this._textData = this._view.getChild('n10');
            this._textName = this._view.getChild('name');
            this._textGroup = this._view.getChild("text_group").asTextField;
            this._btnCopy = this._view.getChild("btn_copy");
            this._btnCopy.on("mousedown", this, this.copyText);
            this._btnAdd = this._view.getChild("btn_add");
            this._btnAdd.on("mousedown", this, this.addText);
            this._comboBox = this._view.getChild("type").asComboBox;
            this._comboBox.on(fairygui.Events.STATE_CHANGED, this, this.onComboBoxChanged);
            this._view.getChild("n31").onClick(this, this._clickWindowA);
            this._view.getChild("n34").onClick(this, this._clickWindowB);
            this.onDataInit();
            Laya.stage.on(Events.DATA_INIT, this, this.onDataInit);
            Laya.stage.on(Events.PREVIEW_DATA, this, this.showCanvas);
        }
        onDataInit() {
            let storage = JSON.parse(utils.getItem("group"));
            if (!storage || !storage.length) {
                Laya.loader.load("res/config/group.json", Laya.Handler.create(this, this.onDataLoaded));
            }
            else {
                PointsManager.groupData = storage;
                PointsManager.historyData = JSON.parse(utils.getItem("history")) || [];
                this.initComboBox();
                this.initData(0);
            }
        }
        onDataLoaded(res) {
            PointsManager.groupData = res;
            PointsManager.saveGroup();
            this.initComboBox();
            this.initData(0);
        }
        initComboBox() {
            this._comboBox.items = [];
            this._comboBox.values = [];
            let items = [], values = [];
            for (let i = 0; i < PointsManager.groupData.length; i++) {
                items.push(PointsManager.groupData[i]["name"]);
                values.push(i);
            }
            this._comboBox.items = items;
            this._comboBox.values = values;
        }
        initData(index = 0) {
            let points = PointsManager.groupData[index], data = points["data"];
            this._groupName = points["name"];
            this._textGroup.setVar("group", this._groupName).flushVars();
            PointsManager.recognizer.PointClouds = [];
            for (let index = 0; index < data.length; index++) {
                const element = data[index]["points"], label = data[index]["label"];
                PointsManager.recognizer.PointClouds.push(new $Q.PointCloud(label, element));
            }
        }
        onComboBoxChanged() {
            this.initData(+this._comboBox.value);
        }
        touchStart(event) {
            if (this.hasRecognize) {
                this.hasRecognize = false;
                this.canvasClear();
            }
            this._strokeColor = utils.roundColor();
            this._strokeID++;
            this._textData.text = "";
            this._textResult.visible = false;
            this.preX = event.target.mouseX;
            this.preY = event.target.mouseY;
            this.touchMoveable = true;
            this._points.push(new $Q.Point(this.preX, this.preY, this._strokeID));
            this._canvas.on("mousemove", this, this.touchMove);
            this._canvas.on("mouseup", this, this.touchEnd);
            this._view.on("mousemove", this, this.checkTouchRect);
        }
        checkTouchRect(event) {
            if (event.target == this._view.displayObject) {
                this.touchMoveable = false;
            }
        }
        touchMove(event) {
            if (!this.touchMoveable) {
                this._canvas.off("mousemove", this, this.touchMove);
                this._canvas.off("mouseup", this, this.touchEnd);
                return;
            }
            this.curX = event.target.mouseX;
            this.curY = event.target.mouseY;
            this._points.push(new $Q.Point(this.curX, this.curY, this._strokeID));
            this._canvas.displayObject.graphics.drawLine(this.preX, this.preY, this.curX, this.curY, this._strokeColor, 2);
            this.preX = this.curX;
            this.preY = this.curY;
        }
        touchEnd(event) {
            console.log(this._points);
            this._canvas.off("mousemove", this, this.touchMove);
            this._canvas.off("mouseup", this, this.touchEnd);
        }
        canvasClear() {
            this._textData.text = "";
            this._textResult.visible = false;
            this._strokeID = 0;
            this._points = [];
            this._canvas.displayObject.graphics.clear(false);
            this._canvas.displayObject.graphics.drawRect(0, 0, this._canvas.width, this._canvas.height, "#ffffff");
        }
        recognize() {
            this.hasRecognize = true;
            this._textData.text = JSON.stringify(this._points).replace(/"IntX":0,"IntY":0,/g, "");
            if (this._points.length >= 10) {
                var result = PointsManager.recognizer.Recognize(this._points);
                this._textResult.visible = true;
                this._textResult.setVar("text", result.Name).setVar("time", result.Time + "").setVar("score", utils.round(result.Score, 2) + "").flushVars();
            }
            else {
                alert("你好像还没有画什么东西或者绘制的点太少啦！");
            }
        }
        copyText() {
            utils.copyText(this._textData.text);
        }
        addText() {
            if (this._points.length == 0) {
                alert("请先绘制点东西吧~");
                return;
            }
            if (this._textName.text == "") {
                alert("请为该数据命个名吧~");
                return;
            }
            PointsManager.historyData.push({ "label": this._textName.text, "points": this._points, "timestamp": new Date().toLocaleString(), "uuid": new Date().getTime() });
            PointsManager.saveHistory();
            PointsManager.recognizer.AddGesture(this._textName.text, this._points);
            alert("添加成功！");
        }
        _clickWindowA() {
            if (this._winA == null) {
                this._winA = new WindowHistory();
                this._winA.modal = true;
            }
            if (this._winB)
                this._winB.hide();
            this._winA.show();
        }
        _clickWindowB() {
            if (this._winB == null) {
                this._winB = new WindowGroup();
                this._winB.modal = true;
            }
            if (this._winA)
                this._winA.hide();
            this._winB.show();
        }
        showCanvas() {
            if (this._canvasPanel == null) {
                this._canvasPanel = new Canvas();
                this._canvasPanel.modal = true;
            }
            this._canvasPanel.show();
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Config.isAntialias = true;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            Laya.stage.addChild(fgui.GRoot.inst.displayObject);
            new App();
        }
    }
    new Main();

}());
