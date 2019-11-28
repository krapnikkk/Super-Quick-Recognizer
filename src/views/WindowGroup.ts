import PointsManager from "../manager/PointsManager";
import Item, { itemType } from "../components/Item";
import Events from "../events/events";
import utils from "../utils/utils";

export default class WindowGroup extends fgui.Window {
    public constructor() {
        super();
    }
    private _list: fgui.GList;
    private _comboBox: fgui.GComboBox;
    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("canvas", "window_2").asCom;
        this.center();
        //弹出窗口的动效已中心为轴心
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

    protected onShown(): void {
        this.initComboBox();
        Laya.stage.on(Events.DELETE_ITEM, this, this.deleteItem);
    }


    private initComboBox() {
        Laya.stage.event(Events.DATA_INIT);
        this._comboBox.items = [];
        this._comboBox.values = [];
        let items = [], values = [], length = PointsManager.groupData.length;
        if (!length) {
            alert("数据组好像木有数据了哦！");
            return;
        } else {
            for (let i = 0; i < length; i++) {
                items.push(PointsManager.groupData[i]["name"]);
                values.push(i);
            }
            this._comboBox.items = items;
            this._comboBox.values = values;
        }

        this.initList();
    }

    private onComboBoxChanged() {
        PointsManager.currentGroupIndex = +this._comboBox.value;
        this.initList();
    }

    protected initList(): void {
        this._list.removeChildrenToPool();
        if (!PointsManager.groupData.length) {
            return;
        }
        const groupData = PointsManager.groupData[PointsManager.currentGroupIndex]["data"];
        for (var i: number = 0; i < groupData.length; i++) {
            const element = groupData[i];
            const uuid = new Date().getTime() + i;
            var item: Item = this._list.addItemFromPool() as Item;
            item.title = element.label.length > 6 ? element.label.substr(0, 6) + "..." : element.label;
            item.time = element.timestamp || "组内数据不记录时间";
            item._uuid = element["uuid"] = uuid;
            item.type = itemType.GROUP;
        }
    }

    private deleteGroup() {
        PointsManager.groupData.splice(PointsManager.currentGroupIndex, 1);
        PointsManager.saveGroup();
        if (PointsManager.groupData.length > 0) {
            alert(`数据组：【${this._comboBox.text}】已成功删除！`);
            this.initComboBox();
        } else {
            alert("数据组好像木有数据了哦！")
        }

    }

    private deleteItem(evt: Item) {
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


    private exportData() {
        const data = PointsManager.groupData[PointsManager.currentGroupIndex];
        data["data"].map((v, i) => {
            if (v["uuid"]) {
                delete v["uuid"];
                v["points"].map((value,index)=>{
                    value["X"] = Math.trunc(value["X"]);
                    value["Y"] = Math.trunc(value["Y"]);
                })
            }
        });
        utils.copyText(JSON.stringify(data).replace(/"IntX":0,"IntY":0,/g, ""));
    }

    private importData() {
        let text = this.contentPane.getChild("n30").text;
        PointsManager.insertData(text);
        this.initComboBox();
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

    protected onHide(): void {
        this.hide();
        Laya.stage.off(Events.DELETE_ITEM, this, this.deleteItem);
    }
}