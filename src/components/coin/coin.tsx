import './coin.css';

export default function Coin({animation}) {

    return (
        <div className={`coin ${animation ? animation : ''}`}>
            <div className="side-a">HEAD</div>
            <div className="side-b">TAIL</div>
        </div>
    );
}