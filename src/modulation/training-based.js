export { TrainingBasedModulation };

import * as math from 'mathjs';

import { Modulation } from './modulation';

class TrainingBasedModulation extends Modulation {
    sendingPreamble;

    channelMatrixEstimate;
    channelMatrixEstimateIndex;

    currentSymbol;

    constructor(params) {
        super(params);

        this.sendingPreamble = false;

        this.channelMatrixEstimate = math.zeros(3, 3)
        this.channelMatrixEstimateIndex = 0;
    }

    reset() {
        super.reset();

        this.sendingPreamble = false;

        this.channelMatrixEstimateIndex = 0;
    }

    nextSymbol() {
        if (this.symbolQueue.length == 0) {
            if (this.sendingPreamble) {
                this.addDataSymbolsToQueue();
            } else {
                if (this.params.shortPreamble) {
                    this.symbolQueue.push(math.matrix([1, 0, 0]));
                } else {
                    this.symbolQueue.push(math.matrix([1, 0, 0]));
                    this.symbolQueue.push(math.matrix([0, 1, 0]));
                    this.symbolQueue.push(math.matrix([0, 0, 1]));
                }
            }

            this.sendingPreamble = !this.sendingPreamble;
        }

        this.currentSymbol = this.symbolQueue.shift();

        return this.currentSymbol;
    }

    update(signal) {
        if (this.sendingPreamble) {
            if (this.params.shortPreamble) {
                const [a, b, c] = signal.toArray();

                this.channelMatrixEstimate = math.matrix([[a, c, b], [b, a, c], [c, b, a]]);

                this.numTraining += 1;
            } else {
                this.channelMatrixEstimate.subset(math.index([0, 1, 2], this.channelMatrixEstimateIndex), signal);
                this.channelMatrixEstimateIndex = (this.channelMatrixEstimateIndex + 1) % 3;

                this.numTraining += 3;
            }
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
}
