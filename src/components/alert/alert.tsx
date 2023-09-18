import './alert.css';

export default function Alert(props) {

    return (
        <div className="alert">
            {props.children}
        </div>
    )
}
