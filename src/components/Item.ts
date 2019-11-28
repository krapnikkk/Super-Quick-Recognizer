import Events from "../events/events";
import PointsManager, { IPoints } from "../manager/PointsManager";

export enum itemType {
    HISTORY = "HISTORY",
    GROUP = "GROUP",

}
export default class Item extends fgui.GComponent {
    private _titleGC: fairygui.GTextField;
    private _title: string;
    private _timeGC: fairygui.GTextField;
    private _time: string;
    public _uuid: number;
    private _type: string;
    private _selected: boolean = false;
    private _btnSelect: fairygui.GButton;
    protected constructFromXML(xml: any): void {
        super.constructFromXML(xml);
        this._titleGC = this.getChild("n1").asTextField;
        this._timeGC = this.getChild("n2").asTextField;
        this._btnSelect = this.getChild("n6").asButton;
        this._btnSelect.onClick(this, this.selectItem);
        this.getChild("n7").onClick(this, this.viewItem);
        this.getChild("n8").onClick(this, this.deleteItem);
    }
    public constructor() {
        super();
    }

    set type(type: itemType) {
        this._type = type;
    }

    set title(string: string) {
        this._title = string;
        this._titleGC.text = string;
    }

    get title(): string {
        return this._title;
    }

    set time(string: string) {
        this._time = string;
        this._timeGC.text = string;
    }

    get time(): string {
        return this._time;
    }

    set selected(bool: boolean) {
        this._btnSelect.selected = this._selected = bool;
    }

    get selected(): boolean {
        return this._selected;
    }

    private selectItem() {
        this._selected = this._btnSelect.selected;
    }

    private deleteItem() {
        Laya.stage.event(Events.DELETE_ITEM, this);
    }

    private viewItem() {
        let data: Array<IPoints> = [];
        if (this._type == itemType.HISTORY) {
            data = PointsManager.historyData;
        } else {
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