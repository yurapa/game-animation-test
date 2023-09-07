import React, { useState, useMemo, useEffect, isValidElement } from 'react';
import CoinToss, { EventEmit, BetResultEvent, GameResultEvent } from '../contract/coinToss.ts';

export enum GameAnimationState {
    IDLE = 0,
    AWAITING = 1,
    RESULTING = 2,
    RESULT = 3,
    ERROR = 4,
}

export default function CoinTossUx({}) {

    const [game, setGame] = useState();
    const [gameAnimationState, setGameAnimationState] = useState(GameAnimationState.IDLE);
    const [lastGameResultEvent, setLastGameResultEvent] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [betHistory, setBetHistory] = useState([]);


    const triggerAwaitingState = () => {
        setGameAnimationState(GameAnimationState.AWAITING);
    }



    const triggerResultingState = async (gameResultEvent) => {
        setGameAnimationState(GameAnimationState.RESULTING);
        setLastGameResultEvent(gameResultEvent)
        await new Promise(resolve => setTimeout(resolve, 1000) ); // Pretend resulting transition animation takes 1 second
        setGameAnimationState(GameAnimationState.RESULT);
        await new Promise(resolve => setTimeout(resolve, 3000) ); // Pretend result is displayed for  3 seconds
        setGameAnimationState(GameAnimationState.IDLE);
    }

    const callbackHandler = (event: EventEmit) => {
        if (event.eventType == 'GameResult') {
            console.log('GameResult received:')
            console.log(event.eventObject)
            triggerResultingState(event.eventObject);
            addToGameHistory(event.eventObject);
        } else if (event.eventType == 'BetResult') {
            console.log('BetResult received:')
            console.log(event.eventObject);
            addToBetHistory(event.eventObject);
        } else {
            console.log('Unknown EventEmit received:')
            console.log(event)
        }
    }

    useEffect(() => {
            const g = new CoinToss();
            g.subscribeToGameEvents(
                callbackHandler
            )
            setGame(g);
        
        }, []
    )
    
    const addToBetHistory = (betResultEvent: BetResultEvent) => {
        const bh = betHistory;
        bh.push(betResultEvent);
        setBetHistory(bh)
    } 

    const addToGameHistory = (gameResultEvent: GameResultEvent) => {
        const gh = gameHistory;
        gh.push(gameResultEvent);
        setGameHistory(gh)
    } 

    return (
        <>
            <div className="">
                <h1>
                Coin Toss
                </h1>
            </div>

            <BetForm game={game} triggerAwaitingState={triggerAwaitingState}/>
            <GameAnimation gameState={gameAnimationState} gameResult={lastGameResultEvent}/>
            <GameHistory gameHistory={gameHistory} />
            <BetHistory betHistory={betHistory} />

        </>
    )

}


function GameAnimation({gameState, gameResult}) {

    return (
        <div className="">
            <div className="">
                <h2>Game Animation</h2>
            </div>

            <div className="">
                {GameAnimationState[gameState].toString()}
            </div>
            <div className="">
                {gameState == GameAnimationState.RESULT ? (gameResult.simulationResult).toString() : ""}
            </div>

        </div>
    )

}

function GameHistory({gameHistory}) {

    return (
        <div className="">
            <div className="">
                <h2>Game History</h2>
            </div>
            {
                gameHistory.length == 0 ?
                    <div className="">
                       NONE
                    </div>
                : (
                    gameHistory.toReversed().map((gh) => (
                        <div className="" key={gh.gameId}>
                            {gh.gameId} : {gh.timestamp} = {gh.simulationResult.toString()}
                        </div>
                    ))
                )
            }
        </div>
    )

}

function BetHistory({betHistory}) {

    return (
        <div className="">
            <div className="">
                <h2>Bet History</h2>
            </div>
            {
                betHistory.length == 0 ?
                    <div className="">
                       NONE
                    </div>
                : (
                    betHistory.toReversed().map((bh) => (
                        <div className="" key={bh.betId}>
                            {bh.betId} ({bh.gameId}): {bh.timestamp} = {bh.wager} | {bh.payout} 
                        </div>
                    ))
                )
            }
        </div>
    )

}



function BetForm({game, triggerAwaitingState}) {

    const [wager, setWager] = useState(1);
    const [side, setSide] = useState(0);
    const [numberOfCoins, setNumberOfCoins] = useState(1);
    const [numberCorrect, setNumberCorrect] = useState(1);
    const [probability, setProbability] = useState(0);
    const [multiplier, setMultiplier] = useState(0);
    const [potentialPayout, setPotentialPayout] = useState(0);
    const [validBet, setValidBet] = useState(false);
    const [invalidReason, setInvalidReason] = useState(null);

    const placeBet = async () => {
        game.placeBet(
            1234, // userId: ,
            wager, // wager: number,
            side, // side: Side,
            numberOfCoins, // numberOfCoins: number,
            numberCorrect // numberCorrect: number
        ) 
        triggerAwaitingState();
    }

    useMemo(() => {
            if (game) {
                if (numberOfCoins > game.maxNumberOfCoins) {
                    setProbability(0);
                    setMultiplier(1);
                    setPotentialPayout(0);
                    setValidBet(false);
                    setInvalidReason(`Number of Coins (${numberOfCoins}) exceeds the game maximum (${game.maxNumberOfCoins})`)
                } else if (wager > game.maxWager) {
                    setProbability(0);
                    setMultiplier(1);
                    setPotentialPayout(0);
                    setValidBet(false);
                    setInvalidReason(`Wager (${wager}) excced max of ${game.maxWager}`)
                } else if (numberOfCoins < numberCorrect) {
                    setProbability(0);
                    setMultiplier(1);
                    setPotentialPayout(0);
                    setValidBet(false);
                    setInvalidReason(`Number Correct (${numberCorrect}) must be <= Number of Coins (${numberOfCoins})`)
                } else {
                    const p = game.getProbability(numberOfCoins, numberCorrect);
                    const m = game.getMultiplier(numberOfCoins, numberCorrect);
                    const po = wager * m;
                    setProbability(p);
                    setMultiplier(m);
                    setPotentialPayout(po);
                    setValidBet(true);
                    setInvalidReason(null);
                } 
            }
        }, [wager, game, numberOfCoins, numberCorrect]
    )

    const updateWager = (event) => {
        const target = event.target;
        var value = target.value;
        setWager(value);
    }

    const updateNumberCorrect = (event) => {
        const target = event.target;
        var value = target.value;
        setNumberCorrect(value);
    }

    const updateNumberOfCoins = (event) => {
        const target = event.target;
        var value = target.value;
        setNumberOfCoins(value);
    }

    const updateSide = (event) => {
        const target = event.target;
        var value = target.value;
        setSide(value ? 0 : 1);
    }

    return (
        <div className="">

            <div className="">
                <h2>Bet Form</h2>
            </div>

            <div className="">
                <label >
                    Wager
                </label>
                <input 
                    className="" id="wager" name="wager" type="number" min="1" max="10" step="1" placeholder="1" value={wager}
                    onChange={updateWager}
                ></input>
            </div>

            <div className="">
                <label >
                    Side (is heads)
                </label>
                <input
                    className="" id="isHeads" name="isHeads" type="checkbox" placeholder="true" checked={side==0}
                    onChange={updateSide}
                ></input>
            </div>

            <div className="">
                <label >
                    Number of Coins
                </label>
                <input
                    className="" id="numberOfCoins" name="numberOfCoins" type="number" min="1" max="10" step="1" placeholder="1" value={numberOfCoins}
                    onChange={updateNumberOfCoins}
                ></input>
            </div>

            <div className="">
                <label >
                    Number Correct
                </label>
                <input
                    className="" id="numberCorrect" name="numberCorrect" type="number" min="1" max="10" step="1" placeholder="1" value={numberCorrect}
                    onChange={updateNumberCorrect}
                ></input>
            </div>

            {
                validBet ?
                (
                    <>
                        <div className="">
                            <label >
                                Multiplier: 
                            </label>
                            <span className="">
                                {multiplier.toFixed(2)} ({(probability*100).toFixed(2)}%)
                            </span>
                        </div>

                        <div className="">
                            <label >
                                Potential Payout: 
                            </label>
                            <span className="">
                                {potentialPayout.toFixed(2)}
                            </span>
                        </div>
                    </>
                )
                :
                (
                    <div className="">
                        Invalid bet: {invalidReason}
                    </div>
                )
            }

            <div className="">
                <input 
                    type="button" value="Place Bet"
                    onClick={validBet ? placeBet : ()=>{}}
                    disabled={!validBet }
                ></input>
            </div>

            


        </div>
    )   

}