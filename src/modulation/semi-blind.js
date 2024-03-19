export { SemiBlindModulation };

import * as math from 'mathjs';

import { Modulation } from './modulation';

class SemiBlindModulation extends Modulation {
    maxSymbolsPerFrame;

    symbolQueue;
    sendingPreamble;

    channelMatrixEstimate;
    channelMatrixEstimateIndex;

    currentSymbol;
    numCorrect;
    numIncorrect;

    numTraining;
    numData;

    constructor() {
        super();

        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numTraining = 0;
        this.numData = 0;
    }

    reset() {
        this.numCorrect = 0;
        this.numIncorrect = 0;

        this.numData = 0;
        this.numTraining = 0;
    }

    nextSymbol() {
        return math.matrix([1, 0, 0]);
    }

    update(signal) {
        this.numIncorrect += 3;
        this.numData += 3;
    }

    bitErrorRate() {
        return this.numIncorrect / (this.numCorrect + this.numIncorrect);
    }

    dataRate() {
        return (this.numData) / (this.numTraining + this.numData);
    }
}
