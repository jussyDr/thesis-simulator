export { BasicModulation };

import * as math from 'mathjs';

import { Modulation } from './modulation';

class BasicModulation extends Modulation {
    maxSymbolsPerFrame;

    symbolQueue;
    sendingPreamble;

    channelMatrixEstimate;
    channelMatrixEstimateIndex;

    currentSymbol;

    constructor(maxSymbolsPerFrame = 100) {
        super();

        this.maxSymbolsPerFrame = maxSymbolsPerFrame;

        this.symbolQueue = [];
        this.sendingPreamble = false;

        this.channelMatrixEstimate = math.zeros(3, 3)
        this.channelMatrixEstimateIndex = 0;
    }

    nextSymbol() {
        if (this.symbolQueue.length == 0) {
            if (this.sendingPreamble) {
                for (let i = 0; i < this.maxSymbolsPerFrame; i++) {
                    this.symbolQueue.push(math.randomInt([3], 0, 2));
                }
            } else {
                this.symbolQueue.push(math.matrix([1, 0, 0]));
                this.symbolQueue.push(math.matrix([0, 1, 0]));
                this.symbolQueue.push(math.matrix([0, 0, 1]));
            }

            this.sendingPreamble = !this.sendingPreamble;
        }

        this.currentSymbol = this.symbolQueue.shift();

        return this.currentSymbol;
    }

    update(signal) {
        if (this.sendingPreamble) {
            this.channelMatrixEstimate.subset(math.index(this.channelMatrixEstimateIndex, [0, 1, 2]), signal);
            this.channelMatrixEstimateIndex = (this.channelMatrixEstimateIndex + 1) % 3;
        } else {
            const estimatedSymbol = math.multiply(math.inv(this.channelMatrixEstimate), signal).toArray();

            var bestSymbol;
            var bestSymbolDistance = Infinity;

            const symbols = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];

            for (var j = 0; j < 8; j++) {
                const symbol = symbols[j];
                var distance = 0;

                for (var i = 0; i < 3; i++) {
                    const difference = symbol[i] - estimatedSymbol[i];
                    distance += difference * difference;
                }

                distance = Math.sqrt(distance);

                if (distance < bestSymbolDistance) {
                    bestSymbol = symbol;
                    bestSymbolDistance = distance;
                }
            }

            console.log(arraysEqual(bestSymbol, this.currentSymbol));
        }
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}
