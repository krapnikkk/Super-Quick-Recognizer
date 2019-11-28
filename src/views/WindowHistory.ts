import PointsManager, { IPoints } from "../manager/PointsManager";
import Item,{itemType} from "../components/Item";
import Events from "../events/events";
import utils from "../utils/utils";

export default class WindowHistory extends fgui.Window {
    public constructor() {
        super();
    }
    private _list: fgui.GList;
    private _btnSelect: fgui.GButton;
    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("canvas", "window_1").asCom;
        this.center();
        //弹出窗口的动效已中心为轴心
        this.setPivot(0.5, 0.5);
        this.contentPane.getChild("btn_close").onClick(this, this.onHide);
        this._list = this.contentPane.getChild("n3").asList;
        this._list.scrollItemToViewOnClick = false;
        this._btnSelect = this.contentPane.getChild("n12").asButton;
        this.contentPane.getChild("n4").asButton.onClick(this, this.addGroup);
        this._btnSelect.onClick(this, this.selectAll);
        this.contentPane.getChild("n19").asButton.onClick(this, this.deleteAll);
    }

    protected onShown(): void {
        this.initList();
        Laya.stage.on(Events.DELETE_ITEM, this, this.deleteItem);
    }

    protected initList(): void {
        this._list.removeChildrenToPool();
        for (var i: number = 0; i < PointsManager.historyData.length; i++) {
            const element = PointsManager.historyData[i];
            var item: Item = this._list.addItemFromPool() as Item;
            item.title = element.label.length > 6 ? element.label.substr(0, 6) + "..." : element.label;
            item.time = element.timestamp || "-";
            item._uuid = element["uuid"];
            item.type = itemType.HISTORY;
        }
    }

    private deleteItem(evt: Item) {
        this._list.removeChildToPool(evt);
        utils.spliceByKey(PointsManager.historyData, "uuid", evt._uuid);
        PointsManager.saveHistory();
    }

    private addGroup() {
        const name = this.contentPane.getChild("n6").asTextField.text;
        if (!name) {
            alert("请先为字符组起个名字吧！");
            return;
        }
        const length = this._list._children.length;
        if(length == 0){
            alert("你好像还没有什么历史记录哦~");
            return;
        }
        let pointsItem: Array<IPoints> = [];
        for (let i = 0; i < length; i++) {
            let item = this._list.getChildAt(i) as Item;
            if (item.selected) {
                const points = utils.findByKey(PointsManager.historyData, "uuid", item["_uuid"]);
                pointsItem.push({ "label": points['label'], "points": points["points"] });
            }
        }
        if(pointsItem.length == 0){
            alert("请至少选择一个字符数据！");
            return;
        }
        PointsManager.groupData.push({ "name": name, "data": pointsItem });
        PointsManager.saveGroup();
        Laya.stage.event(Events.DATA_INIT);
        alert("创建成功！");
    }

    private _isAll: boolean = false;
    private selectAll() {
        this._isAll = !this._isAll;
        this.updateList(this._isAll);
    }

    private deleteAll() {
        this._list.removeChildrenToPool();
        PointsManager.historyData = [];
        PointsManager.saveHistory();
    }

    private updateList(bool: boolean = false) {
        for (let i = 0; i < this._list._children.length; i++) {
            let item = this._list.getChildAt(i) as Item;
            item.selected = bool;
        }
    }

    protected doShowAnimation(): void {
        this.setScale(0.1, 0.1);
        fgui.GTween.to2(0.1, 0.1, 1, 1, 0.3)
            .setTarget(this, this.setScale)
            .setEase(fgui.EaseType.QuadOut)
            .onComplete(this.onShown, this);
    }

    protected doHideAnimation(): void {
        fgui.GTween.to2(1, 1, 0.1, 0.1, 0.3)
            .setTarget(this, this.setScale)
            .setEase(fgui.EaseType.QuadOut)
            .onComplete(this.hideImmediately, this);
    }

    protected onHide() {
        Laya.stage.off(Events.DELETE_ITEM, this, this.deleteItem);
        this.updateList(false);
        this.hide();
    }
}


