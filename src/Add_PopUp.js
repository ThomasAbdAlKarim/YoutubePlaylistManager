import './Pop.css';
import {useState,useRef} from "react";

function AddPop(props)
{

const [Show, SetShow] = useState(false);
const Id = useRef(null);

window.addEventListener('keydown',(e)=>{if(e.code === "Escape")SetShow(false)})

function Add()
{
    SetShow(false);
    let PlayId = props.playid.current.value;
    let VideoId = Id.current.value;
    props.add(PlayId,VideoId);
}


    return(
        <div className="AddPop">
            
            {Show?
            <div className="Popup">
            <form>
                <input className="INPID" type="text" ref={Id}></input>
                <button  className="ADD" onClick={Add}>Add</button>
            </form>
            </div>
            : null}
            <button className="AddBut" onClick={()=>{SetShow(true);}}>+</button>
        </div>
        );



}


export default AddPop