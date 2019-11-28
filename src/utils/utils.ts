export default class utils {
    static round(n: number, d: number) // round 'n' to 'd' decimals
    {
        d = Math.pow(10, d);
        return Math.round(n * d) / d;
    }

    static rand(low, high) {
        return Math.floor((high - low + 1) * Math.random()) + low;
    }
    static roundColor() {
        return "rgb(" + utils.rand(0, 200) + "," + utils.rand(0, 200) + "," + utils.rand(0, 200) + ")";
    }

    static copyText(text: string) {
        if (text === "") {
            alert("好像没有需要复制的内容哦！");
            return;
        }
        var oInput: HTMLInputElement = document.querySelector('.oInput');
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

    static setItem(item: string, str: string): void {
        localStorage.setItem(item, str);
    }

    static getItem(item: string): string {
        return localStorage.getItem(item);
    }

    static spliceByKey<T>(array: Array<T>, key: string, val: any) {
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element[key] && element[key] == val) {
                array.splice(index, 1);
            }
        }
    }

    static spliceArrayByKey<T>(array: Array<T>,attr:string,index:number, key: string, val: any) {
        const item = array[index][attr];
        for (let i = 0; i < item.length; i++) {
            const element = item[i];
            if (element[key] && element[key] == val) {
                item.splice(i, 1);
            }
        }
    }

    static findByKey(array: any, key: string, val: any): any {
        const result = [];
        for (let index = 0; index < array.length; index++) {
            const item = array[index];
            if (item[key] && item[key] == val) {
                return item;
            }
        }
    }
}