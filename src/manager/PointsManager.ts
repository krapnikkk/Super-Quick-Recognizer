import utils from "../utils/utils";

export interface IPointsItem {
    "name": string
    "data": Array<IPoints>
}

export interface IPoints {
    "label": string
    "points": Array<$Q.Point>
    "timestamp"?: string
    "uuid"?: number
}

export default class PointsManager {
    static recognizer: $Q.QDollarRecognizer = new $Q.QDollarRecognizer();
    static pointClouds: Array<$Q.PointCloud> = PointsManager.recognizer.PointClouds;
    static groupData: Array<IPointsItem> = [];
    static historyData: Array<IPoints> = [];
    static previewData: Array<$Q.Point> = [];
    static currentGroupIndex:number = 0;
    static saveHistory() {
        utils.setItem("history", JSON.stringify(PointsManager.historyData));
    }
    static saveGroup(data?: IPointsItem[] | any) {
        const groupData = data || PointsManager.groupData
        utils.setItem("group", JSON.stringify(groupData));
    }
    static insertData(data: string) {
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

                                } else {
                                    throw new Error();
                                }
                            }
                        } else {
                            throw new Error();
                        }
                    }
                } else {
                    throw new Error();
                }
                PointsManager.groupData.push(groupData);
                PointsManager.saveGroup();
                alert("导入成功！");
            } catch (err) {
                alert("文件内容json格式有误！");
            }
        }
    }
}