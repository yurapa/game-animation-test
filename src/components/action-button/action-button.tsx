import './action-button.css';

export default function ActionButton({onClick, disabled}) {

    return (
        <button className="actionButton" onClick={onClick} disabled={disabled}>
            Place Bet
        </button>
    )
}
