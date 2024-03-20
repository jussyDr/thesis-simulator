export { Modulation };

import * as math from 'mathjs';

class Modulation {
    params;

    symbolQueue;

    numCorrect;
    numIncorrect;

    numTraining;
    numData;

    constructor(params) {
        this.params = params;

        this.symbolQueue = [];

        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numTraining = 0;
        this.numData = 0;
    }

    reset() {
        this.symbolQueue = [];

        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numData = 0;
        this.numTraining = 0;
    }

    addDataSymbolsToQueue() {
        if (this.params.messageType == 'random') {
            for (let i = 0; i < this.params.maxSymbolsPerFrame; i++) {
                this.symbolQueue.push(math.randomInt([3], 0, 2));
            }
        } else if (this.params.messageType == 'constant') {
            for (let i = 0; i < this.params.maxSymbolsPerFrame; i++) {
                this.symbolQueue.push([1, 1, 1]);
            }
        } else if (this.params.messageType == 'difficult') {
            var i = 0;

            for (; i < this.params.maxSymbolsPerFrame && i < 10; i++) {
                this.symbolQueue.push([1, 1, 1]);
            }

            for (; i < this.params.maxSymbolsPerFrame; i++) {
                this.symbolQueue.push(math.randomInt([3], 0, 2));
            }
        }
    }

    bitErrorRate() {
        return this.numIncorrect / (this.numCorrect + this.numIncorrect);
    }

    dataRate() {
        return (this.numData) / (this.numTraining + this.numData);
    }
}
