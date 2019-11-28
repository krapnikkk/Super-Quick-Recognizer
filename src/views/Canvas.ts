import PointsManager from "../manager/PointsManager";
import utils from "../utils/utils";

export default class Canvas extends fgui.Window {

    public constructor() {
        super();
    }
    private _canvas: fgui.GGraph;

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("canvas", "canvas").asCom;
        this.center();
        //弹出窗口的动效已中心为轴心
        this.setPivot(0.5, 0.5);
        this.contentPane.getChild("n2").onClick(this, this.onHide);
        this._canvas = this.contentPane.getChild("n1").asGraph;
    }

    protected onShown(): void {
        this.autoDraw();
    }

    private autoDraw() {
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
            } else {
                // this._canvas.displayObject.graphics.drawLine(preX, preY, curX, curY, "rgba(0,0,0,1)", 2);
                (function (canvas, preX, preY, curX, curY, index, color) {
                    window.setTimeout(() => {
                        canvas.drawLine(preX, preY, curX, curY, color, 2);
                    }, index * 10)
                })(this._canvas.displayObject.graphics, preX, preY, curX, curY, i, strokeColor)
            }
            preX = curX;
            preY = curY;
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

    protected onHide(): void {
        this.hide();
    }

}