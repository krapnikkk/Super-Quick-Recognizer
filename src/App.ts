import utils from './utils/utils';
import WindowHistory from "./views/windowHistory";
import WindowGroup from "./views/WindowGroup";
import PointsManager from './manager/PointsManager';
import Events from "./events/events";
import Canvas from './views/Canvas';
export default class App {
    private _view: fgui.GComponent;
    private _canvas: fgui.GGraph;
    private _btnClear: fgui.GButton;
    private _btnRecognize: fgui.GButton;
    private _textResult: fgui.GTextField;
    private _textData: fgui.GTextField;
    private _textName: fgui.GTextField;
    private _textGroup: fgui.GTextField;
    private _btnCopy: fairygui.GButton;
    private _btnAdd: fairygui.GButton;
    private _comboBox: fairygui.GComboBox;
    private _winA: fgui.Window;
    private _winB: fgui.Window;
    private _canvasPanel: fairygui.Window;
    constructor() {
        fgui.UIPackage.loadPackage("res/ui/canvas", Laya.Handler.create(this, this.onUILoaded));
    }

    private onUILoaded() {
        this._view = fgui.UIPackage.createObject("canvas", "Main").asCom;
        this._view.x = (Laya.Browser.clientWidth - this._view.width) / 2;
        fgui.GRoot.inst.addChild(this._view);
        this._canvas = this._view.getChild('canvas') as fgui.GGraph;
        this._canvas.on("mousedown", this, this.touchStart);
        this._btnClear = this._view.getChild("n26") as fgui.GButton;
        this._btnClear.onClick(this, this.canvasClear);
        this._btnRecognize = this._view.getChild("n25") as fgui.GButton;
        this._btnRecognize.onClick(this, this.recognize);
        this._textResult = this._view.getChild('text_result') as fgui.GTextField;
        this._textData = this._view.getChild('n10') as fgui.GRichTextField;
        this._textName = this._view.getChild('name') as fgui.GRichTextField;
        this._textGroup = this._view.getChild("text_group").asTextField;
        this._btnCopy = this._view.getChild("btn_copy") as fgui.GButton;
        this._btnCopy.on("mousedown", this, this.copyText);
        this._btnAdd = this._view.getChild("btn_add") as fgui.GButton;
        this._btnAdd.on("mousedown", this, this.addText);
        this._comboBox = this._view.getChild("type").asComboBox;
        this._comboBox.on(fairygui.Events.STATE_CHANGED, this, this.onComboBoxChanged);
        this._view.getChild("n31").onClick(this, this._clickWindowA);
        this._view.getChild("n34").onClick(this, this._clickWindowB);
        this.onDataInit();
        Laya.stage.on(Events.DATA_INIT, this, this.onDataInit);
        Laya.stage.on(Events.PREVIEW_DATA, this, this.showCanvas);

    }

    private _groupName: string = "";

    private onDataInit() {
        let storage = JSON.parse(utils.getItem("group"));//是否已经存储默认数据
        if (!storage || !storage.length) {
            Laya.loader.load("res/config/group.json", Laya.Handler.create(this, this.onDataLoaded));
        } else {
            PointsManager.groupData = storage;
            PointsManager.historyData = JSON.parse(utils.getItem("history")) || [];
            this.initComboBox();
            this.initData(0);
        }
    }
    private onDataLoaded(res) {
        PointsManager.groupData = res;//group
        PointsManager.saveGroup();
        this.initComboBox();
        this.initData(0);
    }

    private initComboBox() {
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

    private initData(index: number = 0): void {
        let points = PointsManager.groupData[index], data = points["data"];
        this._groupName = points["name"];
        this._textGroup.setVar("group", this._groupName).flushVars();
        PointsManager.recognizer.PointClouds = [];
        for (let index = 0; index < data.length; index++) {
            const element = data[index]["points"],
                label = data[index]["label"];
            PointsManager.recognizer.PointClouds.push(new $Q.PointCloud(label, element));
        }
    }

    private onComboBoxChanged(): void {
        this.initData(+this._comboBox.value);
    }

    private preX: number = 0;
    private preY: number = 0;
    private curX: number = 0;
    private curY: number = 0;
    private _points: Array<$Q.Point> = [];
    private _strokeID: number = 0;
    private _strokeColor: string = "";
    private touchStart(event: laya.events.Event) {
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

    private checkTouchRect(event: laya.events.Event) {
        if (event.target == this._view.displayObject) {
            this.touchMoveable = false;
        }

    }

    private touchMoveable: boolean = true;
    private touchMove(event: laya.events.Event) {
        if (!this.touchMoveable) {
            this._canvas.off("mousemove", this, this.touchMove);
            this._canvas.off("mouseup", this, this.touchEnd);
            return;
        }
        this.curX = event.target.mouseX;
        this.curY = event.target.mouseY;
        this._points.push(new $Q.Point(this.curX, this.curY, this._strokeID));
        this._canvas.displayObject.graphics.drawLine(this.preX, this.preY, this.curX, this.curY, this._strokeColor, 2);
        this.preX = this.curX ;
        this.preY = this.curY;

    }

    private touchEnd(event: laya.events.Event) {
        this._canvas.off("mousemove", this, this.touchMove);
        this._canvas.off("mouseup", this, this.touchEnd);
    }

    private canvasClear() {
        this._textData.text = "";
        this._textResult.visible = false;
        this._strokeID = 0;
        this._points = [];
        this._canvas.displayObject.graphics.clear(false);
        this._canvas.displayObject.graphics.drawRect(0, 0, this._canvas.width, this._canvas.height, "#ffffff");
    }

    private hasRecognize: boolean = false;
    private recognize() {
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

    private copyText() {
        utils.copyText(this._textData.text);
    }

    private addText() {
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

    private _clickWindowA() {
        if (this._winA == null) {
            this._winA = new WindowHistory();
            this._winA.modal = true;
        }
        if (this._winB) this._winB.hide();
        this._winA.show();

    }

    private _clickWindowB(): void {
        if (this._winB == null) {
            this._winB = new WindowGroup();
            this._winB.modal = true;
        }
        if (this._winA) this._winA.hide();
        this._winB.show();
    }

    private showCanvas():void{
        if (this._canvasPanel == null) {
            this._canvasPanel = new Canvas();
            this._canvasPanel.modal = true;
        }
        this._canvasPanel.show();
    }

}