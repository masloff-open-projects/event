class chartBuffer {

    constructor(max=60000) {
        this.chart = {}
        this.settings = {
            max: max
        }
    }

    append (chart="default", data={}) {
        if (!( chart in this.chart )) { this.chart[chart] = []; }
        this.chart[chart].push(data)
        if (this.chart[chart].length > this.settings.max){  this.chart[chart].shift() }
    }

    get (chart="default") {
        if (chart in this.chart) {
            return this.chart[chart];
        } else { return []; }
    }

    set (chart="default", data={}) {
        this.chart[chart] = data;
    }

}
