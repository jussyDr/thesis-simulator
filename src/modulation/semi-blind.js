export { SemiBlindModulation };

import * as math from 'mathjs';

import { Modulation } from './modulation';

class SemiBlindModulation extends Modulation {
    maxSymbolsPerFrame;

    symbolQueue;
    sendingPreamble;

    channelMatrixEstimate;

    currentSymbol;
    numCorrect;
    numIncorrect;

    numTraining;
    numData;

    constructor(params) {
        super();

        this.params = params;

        this.symbolQueue = [];
        this.sendingPreamble = false;

        this.channelMatrixEstimate = math.zeros(3, 3)

        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numTraining = 0;
        this.numData = 0;
    }

    reset() {
        this.symbolQueue = [];
        this.sendingPreamble = false;

        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numData = 0;
        this.numTraining = 0;
    }

    nextSymbol() {
        if (this.symbolQueue.length == 0) {
            if (this.sendingPreamble) {
                for (let i = 0; i < this.params.maxSymbolsPerFrame; i++) {
                    this.symbolQueue.push(math.randomInt([3], 0, 2));
                }
            } else {
                this.symbolQueue.push(math.matrix([1, 0, 0]));
            }

            this.sendingPreamble = !this.sendingPreamble;
        }

        this.currentSymbol = this.symbolQueue.shift();

        return this.currentSymbol;
    }

    update(signal) {
        if (this.sendingPreamble) {
            const [a, b, c] = signal.toArray();

            this.channelMatrixEstimate = math.matrix([[a, c, b], [b, a, c], [c, b, a]]);

            this.numTraining += 1;
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

            if (!(bestSymbol[0] == bestSymbol[1] && bestSymbol[1] == bestSymbol[2])) {
                const symbolMatrix = math.matrix([
                    [bestSymbol[0], bestSymbol[2], bestSymbol[1]],
                    [bestSymbol[1], bestSymbol[0], bestSymbol[2]],
                    [bestSymbol[2], bestSymbol[1], bestSymbol[0]]
                ]);

                const [a, b, c] = math.multiply(math.inv(symbolMatrix), signal).toArray();

                this.channelMatrixEstimate = math.matrix([[a, c, b], [b, a, c], [c, b, a]]);
            }

            if (bestSymbol[0] == this.currentSymbol[0]) {
                this.numCorrect += 1;
            } else {
                this.numIncorrect += 1;
            }

            if (bestSymbol[1] == this.currentSymbol[1]) {
                this.numCorrect += 1;
            } else {
                this.numIncorrect += 1;
            }

            if (bestSymbol[2] == this.currentSymbol[2]) {
                this.numCorrect += 1;
            } else {
                this.numIncorrect += 1;
            }

            this.numData += 3;
        }
    }

    bitErrorRate() {
        return this.numIncorrect / (this.numCorrect + this.numIncorrect);
    }

    dataRate() {
        return (this.numData) / (this.numTraining + this.numData);
    }
}
