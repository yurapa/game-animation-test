
export enum Side {
    HEADS = 0,
    TAILS = 1
}

export type Game = {
    gameId: number,
    numberOfCoins: number,
}

export type Bet = {
    betId: number,
    gameId: number,
    userId: number,
    wager: number,
    side: Side,
    numberCorrect: number,
    potentialPayout: number
}

export type GameResultEvent = {
    gameId: number,
    numberOfCoins: number,
    simulationResult: number[]
    timestamp: number
}

export type BetResultEvent = {
    betId: number,
    gameId: number,
    userId: number,
    wager: number,
    side: Side,
    numberOfCoins: number,
    numberCorrect: number,
    payout: number,
    timestamp: number
}

export type EventEmit = {
    eventType: string,
    eventObject: any
}

export default class CoinToss {

    private _name: string;
    private _maxNumberOfCoins: number;
    private _maxWager: number;
    private _gameNonce: number;
    private _betNonce: number;
    private _houseMargin: number;
    private _activeGame: Game | null;
    private _openBets: Bet[];
    private _subscriptionCallbacks: Function[];

    constructor() {
        this._name = "Coin Toss";
        this._maxNumberOfCoins = 10;
        this._maxWager = 1000;
        this._betNonce = 0;
        this._gameNonce = 0;
        this._houseMargin = 0.02;
        this._subscriptionCallbacks = [];
        this._openBets = [];
    }

    static loadFromJson(
        gameJson: any
    ) {
        return new this()
    }

    get name() {
        return this._name;
    }

    get maxNumberOfCoins() {
        return this._maxNumberOfCoins;
    }

    get maxWager() {
        return this._maxWager;
    }

    choose(
        n: number,
        k: number
    ) {
        if (k === 0) return 1;
        return (n * this.choose(n-1, k-1)) / k;
    }

    getProbability(
        numberOfCoins: number,
        numberCorrect: number,
    ) {
        const pCorrect = 0.5;
        const pIncorrect = (1-pCorrect);
        var prob = 0;
        for (let k = Number(numberOfCoins); k >= Number(numberCorrect); k--) {
            const probKCorrect = ((pCorrect)**(k)) * ((pIncorrect)**(numberOfCoins-k));
            const combinationsOfKfromN = this.choose(numberOfCoins, k);
            prob += (probKCorrect * combinationsOfKfromN);
        }
        return prob;
    }

    getMultiplier(
        numberOfCoins: number,
        numberCorrect: number,
    ) {
        return (1/this.getProbability(numberOfCoins, numberCorrect)) * (1-this._houseMargin)
    }

    async placeBet(
        userId: number,
        wager: number,
        side: Side,
        numberOfCoins: number,
        numberCorrect: number
    ) {
        if (numberOfCoins > this._maxNumberOfCoins) {throw new Error(`numberOfCoins must be <= ${this._maxNumberOfCoins}`)};
        if (numberCorrect > numberOfCoins) {throw new Error("numberCorrect must be <= numberOfCoins")};
        if (wager > this._maxWager) {throw new Error(`wager cannot exceed ${this._maxWager}`)};
        if (this._activeGame != null) {throw new Error(`Active game already in progress`)};

        const potentialPayout = wager * (2.0 * (1-this._houseMargin))
        
        const game = {
            gameId: this._gameNonce,
            numberOfCoins
        } as Game;

        this._activeGame = game;

        const bet = {
            betId: this._betNonce,
            gameId: game.gameId,
            userId,
            wager,
            side,
            numberCorrect,
            potentialPayout
        } as Bet;

        this._openBets.push(bet);

        this.incrementBetNonce();
        this.incrementGameNonce();

        console.log(`BET PLACED:`);
        console.log(bet);
        console.log(`REQUESTING GAME SIMULATION`)
        console.log(game);

        this.requestGameSimulation();
    }

    incrementGameNonce() {
        this._gameNonce += 1;
    }

    incrementBetNonce() {
        this._betNonce += 1;
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    emitEventToSubscriptions(
        event: EventEmit
    ) {
        for (let i = 0; i < this._subscriptionCallbacks.length; i++) {
            this._subscriptionCallbacks[i](event);
        }
    }

    async requestGameSimulation()  {
        if (this._activeGame == null) {throw new Error(`No active game`)};
        const waitTime = 1000 + Math.floor((Math.random()*2000)); //ms - between 1 and 3 seconds
        console.log(`...pretend blockchain response, waiting ${(waitTime/1000).toFixed(2)} seconds`)
        await this.delay(waitTime);
        const simulationArray = this.produceSimulation(
            this._activeGame.numberOfCoins
        )        
        const numberOfTails = simulationArray.reduce(
            (accumulator: number, input: number): number => accumulator + input
        );
        const numberOfHeads = this._activeGame.numberOfCoins - numberOfTails;
        
        console.log(`GAME SIMULATION:`)
        console.log(`simulation: ${simulationArray} | numberOfHeads: ${numberOfHeads} | numberOfTails: ${numberOfTails}`);

        this.emitEventToSubscriptions(
            {
                eventType: 'GameResult',
                eventObject: {
                    gameId: this._activeGame.gameId,
                    numberOfCoins: this._activeGame.numberOfCoins,
                    simulationResult: simulationArray,
                    timestamp: Date.now()
                } as GameResultEvent
            } as EventEmit
        )
        this.settleAllGameBets(
            numberOfHeads,
            numberOfTails
        )
    }

    produceSimulation(
        numberOfCoins: number
    ) {
        const simulationArray: number[] = [];
        for (let i = 0; i < numberOfCoins; i++) {
            simulationArray.push(
                Math.round((Math.random()*1000000))%2
            )
        }
        return simulationArray;
    }

    settleAllGameBets(
        numberOfHeads: number,
        numberOfTails: number
    ) {
        if (this._activeGame == null) {throw new Error(`No active game`)};
        while (this._openBets.length > 0) {
            let bet = this._openBets.pop();
            var payout = 0;
            if ((bet.side == Side.HEADS && numberOfHeads >= bet.numberCorrect) 
              || (bet.side == Side.TAILS && numberOfTails >= bet.numberCorrect)) {
                payout = bet.potentialPayout
            };
            this.emitEventToSubscriptions(
                {
                    eventType: 'BetResult',
                    eventObject: {
                        betId: bet.betId,
                        gameId: bet.gameId,
                        userId: bet.userId,
                        wager: bet.wager,
                        side: bet.side,
                        numberOfCoins: this._activeGame.numberOfCoins,
                        numberCorrect: bet.numberCorrect,
                        payout: payout,
                        timestamp: Date.now()
                    } as BetResultEvent
                } as EventEmit
            )
        }
        this._activeGame = null;
    }

    async subscribeToGameEvents(
        callbackFunction: Function
    ) {
        this._subscriptionCallbacks.push(callbackFunction)
    }

}