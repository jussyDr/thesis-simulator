export { Modulation };

class Modulation {
    numCorrect;
    numIncorrect;

    numTraining;
    numData;

    constructor() {
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

    bitErrorRate() {
        return this.numIncorrect / (this.numCorrect + this.numIncorrect);
    }

    dataRate() {
        return (this.numData) / (this.numTraining + this.numData);
    }
}
