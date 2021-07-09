import './Load.css';


function Loader(props)
{

    return(
        <div>
            <h3 className="LTxt">{props.Num}</h3>
            <progress className="Bar" max={props.Max} value={props.Num}/>
        </div>
        );



}


export default Loader