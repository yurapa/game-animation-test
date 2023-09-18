import './coin.css';

export default function Coin({ animation}) {
    // const faces = ["heads", "tails"];

    return (
        <div id="coin" className={animation} key={+new Date()}>
            <div className="side-a">TAIL</div>
            <div className="side-b">HEAD</div>
        </div>
    );

}