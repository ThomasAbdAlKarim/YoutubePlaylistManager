import React from 'react';
import './Disp.css';
function Display(props)
{
 

function RemoveNull(Arr)
{
  let NArr = []
  for(let i = 0;i<Arr.length;i++)
  {
    if(!(Arr[i] === undefined))
    {
      NArr.push(Arr[i]);
    }
  }
  return NArr;
}









return (
    <div>
      {RemoveNull(props["Items"])}
    </div>

);

}




export default Display;