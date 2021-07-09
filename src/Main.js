import {useState,useRef,useEffect} from "react";
import "./Main.css";
import Display from "./Display";
import Can from "./Can.png"
import Loader from "./Loader.js"
import AddPop from "./Add_PopUp.js"
function Main(props) 
{

  let DraggedInd = 0;
  let SelectedInd = 0;
  var GoogleAuth;
  var SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';
  
  function initClient() 
  {
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';
  
    window.gapi.client.init({
      'apiKey': props.api_key,
      'clientId': props.client_id,
      'discoveryDocs': [discoveryUrl],
      'scope': SCOPE
      }).then(function () {
        GoogleAuth = window.gapi.auth2.getAuthInstance();});
    }
  
    function LogIn() 
    {
        if(GoogleAuth)
        {
            GoogleAuth.signIn();
            setLog(GoogleAuth.isSignedIn.get());
        }
        else
        {
            initClient();
        }
        
    }
  
    function LogOut() 
    {
        if(GoogleAuth)
        {
            GoogleAuth.disconnect();
        }
        setLog(false);
    }

    function ADDVID(PlayId,VidId) 
    {
        return window.gapi.client.youtube.playlistItems.insert({
          "part": [
            "snippet"
          ],
          "resource": {
            "snippet": {
              "playlistId": PlayId,
              "position": List.length,
              "resourceId": {
                "kind": "youtube#video",
                "videoId": VidId
              }
            }
          }
        })
            .then(function(response) {
                    
              let Title = response["result"]["snippet"]["title"];
              let Img = response["result"]["snippet"]["thumbnails"]["medium"]["url"];
              let Channel = response["result"]["snippet"]["videoOwnerChannelTitle"];
              let PlayItemId = response["result"]["id"];
              let Obj = BuildItem(Title,Img,Channel,List.length,VidId,PlayItemId);
              let L = List;
              L.push(Obj);
              setList(L);
              Refresh(PlayItemId+"O");},
              function(err) { console.error("Execute error", err); });
      }



       function GetList(playlistId,Token = "") {
        
        if(Token === "")
        {
         window.gapi.client.youtube.playlistItems.list({
          "part": [
            "snippet,contentDetails"
          ],
          "maxResults": 100,
          "playlistId": playlistId
        })
            .then(function(response) {
              let items = Items["items"];
              for(let i = 0;i<response["result"]["items"].length;i++)
              {
                if(response["result"]["items"][i] !== undefined)
                items.push(response["result"]["items"][i]);
              }
              SetItems({items:items});
              if(!(response["result"]["nextPageToken"] === undefined))
              {
                GetList(playlistId,response["result"]["nextPageToken"]);
              }
              else
              {
                Setup();
              }
                  },
                  function(err) { console.error("Execute error", err); });
         }
         else
         {
           
           window.gapi.client.youtube.playlistItems.list({
            "part": [
              "snippet,contentDetails"
            ],
            "maxResults": 100,
            "pageToken": Token,
            "playlistId": playlistId
          })
              .then(function(response) {
                let items = Items["items"];
              for(let i = 0;i<response["result"]["items"].length;i++)
              {
                
                items.push(response["result"]["items"][i]);
              }
              SetItems({items:items});
              if(!(response["result"]["nextPageToken"] === undefined))
              {
                GetList(playlistId,response["result"]["nextPageToken"]);
              }
              else
              {
                Setup();
              }
                
                
                    },
                    function(err) { console.error("Execute error", err); });
         }
         
      }
    

      function Delete(PlayVidId)
      {
        return window.gapi.client.youtube.playlistItems.delete({
          "id":PlayVidId
        }).then(function(response) {
          
        },
        function(err) { console.error("Execute error", err); });
      }




    const [Refr, SetRefr] = useState(""); //For Manual rerender
    const [Loading,setLoad] = useState(false);
    const [Items, SetItems] = useState({items:[]});
    const [List, setList] = useState([]);
    const [LState, setLState] = useState(0); //Loading State for the Loading Bar
    const IdInp = useRef(null)
    const [Search, SetSearch] = useState("");
    const [Logged, setLog] = useState(false);
    const [PlaylistSelected , setSelected] = useState(false);

    useEffect(initClient,[]);



    async function Setup()
    {          
      setList(new Array(Items.items.length));
      let L = List;
      setLoad(true);
      setSelected(true);
      for(let i = 0;i<Items.items.length;i++)
          {
              setLState(i);
              let Id = Items.items[i]["contentDetails"]["videoId"];
              let PlayItemId = Items.items[i]["id"];
               await window.gapi.client.youtube.videos.list({
                  "part": [
                    "snippet,contentDetails,statistics"
                  ],
                  "id": [
                    Id
                  ]
                }).then(function(response)
                {
                  let Title = "Video Deleted";
                  let Img = "https://www.solidbackgrounds.com/images/2560x1440/2560x1440-gray-web-gray-solid-color-background.jpg"; //random grey image for the deleted VVid
                  let ChanTitle = "Video Deleted";
                  if(response["result"]["items"] !== undefined)
                  {
                    if(response["result"]["items"].length >0)
                    {
                   Title = response["result"]["items"][0]["snippet"]["title"];
                   Img = response["result"]["items"][0]["snippet"]["thumbnails"]["medium"]["url"];
                   ChanTitle = response["result"]["items"][0]["snippet"]["channelTitle"];
                  }
                  }
                    L[i] = BuildItem(Title,Img,ChanTitle,i,Id,PlayItemId);
                },
                function(err) { console.error("Execute error", err); });
                
          }
          setLoad(false);
          
          setList(L);
          
      }

      function Refresh(Val)
      {
        SetRefr(Val);
      }


      function Drop(e)
      {
        
        let elem = e.target;
        while(!elem.hasAttribute("ind"))
        {
          elem = elem.parentElement;
          
        }
        
        let Index = elem.getAttribute("ind");
        
        let L = List;
        let Tmp = L[DraggedInd];
        let Id = Tmp["props"]["children"][0]["props"]["playvidid"];
        let playlistId = IdInp.current.value;
        let videoId = Tmp["props"]["vid"];
        L.splice(DraggedInd,1);
        L.splice(Index,0,Tmp);
        for(let i = 0;i<L.length;i++)
        {
          let title = L[i]["props"]["children"][3]["props"]["children"][0]["props"]["children"];
          let ChanTitle = L[i]["props"]["children"][3]["props"]["children"][1]["props"]["children"];
          let img = L[i]["props"]["children"][2]["props"]["src"];
          let Vid = L[i]["props"]["vid"];
          let PItemId = L[i]["props"]["children"][0]["props"]["playvidid"];
          L[i] = BuildItem(title,img,ChanTitle,parseInt(i),Vid,PItemId);
        }
        setList(L);
        Refresh(Math.random());
        window.gapi.client.youtube.playlistItems.update({
          "part": [
            "snippet"
          ],
          "resource": {
            "id": Id,
            "snippet": {
              "playlistId": playlistId,
              "position": Index,
              "resourceId": {
                "kind": "youtube#video",
                "videoId": videoId
              }
            }
          }
        })
            .then(function(response) {
                  },
                  function(err) { console.error("Execute error", err); });
        
       

      }
      function GetInd(e)
      {
        let elem = e.target;
        while(!elem.hasAttribute("ind"))
        {
          elem = elem.parentElement;
          
        }
        DraggedInd = elem.getAttribute("ind");
        
      }


      function BuildItem(Title,Img,Channel,ind,Id,PlayItemId)
      {
          return(
            <div className="ListItem" vid = {Id} key={PlayItemId} ind={ind} draggable="true"  onDragStart={(e)=>{GetInd(e)}} onDragOver={(e)=>{e.preventDefault()}} onDrop={(e)=>{Drop(e)}}>
              <button className="Delete" playvidid={PlayItemId} onClick={
                async (e)=>{
                let Elem;
                if(e.target.parentElement.nodeName === "BUTTON")
                {
                  Elem = e.target.parentElement;
                }
                else
                {
                  Elem = e.target;
                }
                
                
                 Delete(Elem.getAttribute("playvidid"));
                let L = List;
                L.splice(Elem.parentElement.getAttribute("ind"),1);
                for(let i =Elem.parentElement.getAttribute("ind");i<L.length;i++)
                {
                  let title = L[i]["props"]["children"][3]["props"]["children"][0]["props"]["children"];
                  let ChanTitle = L[i]["props"]["children"][3]["props"]["children"][1]["props"]["children"];
                  let img = L[i]["props"]["children"][2]["props"]["src"];
                  let Vid = L[i]["props"]["vid"];
                  let PItemId = L[i]["props"]["children"][0]["props"]["playvidid"];
                  L[i] = BuildItem(title,img,ChanTitle,parseInt(i),Vid,PItemId);
                }
                setList(L);
                Refresh(Elem.getAttribute("playvidid"))
                
                }}><img src={Can} alt="Delete" width="28" height="35" className="Trash"/></button>
              <div className="Num"> <p id={Id+'0'} className="NumTxt" onDoubleClick={(e)=>
              {document.getElementById(Id).classList.add("NumOn");document.getElementById(Id).focus();e.target.classList.add("NumTxtOff")}}>{ind+1}</p> 
              <input className="NumOff" id={Id} onKeyUp = {(e)=>{

if(e.keyCode === 13)
{
  
  
  let NewInd = parseInt(e.target.value) -1;
  e.target.classList.remove("NumOn");
  document.getElementById(Id+'0').classList.remove("NumTxtOff");
  if(NewInd < List.length && NewInd >= 0)
  {
    
    
    let L = List
    let Self = L[SelectedInd];
    let title = L[NewInd]["props"]["children"][3]["props"]["children"][0]["props"]["children"];
    let ChanTitle = L[NewInd]["props"]["children"][3]["props"]["children"][1]["props"]["children"];
    let img = L[NewInd]["props"]["children"][2]["props"]["src"];
    let Vid = L[NewInd]["props"]["vid"];
    let PItemId = L[NewInd]["props"]["children"][0]["props"]["playvidid"];
    
    let Tmp = BuildItem(title,img,ChanTitle,SelectedInd,Vid,PItemId);
    L[SelectedInd] = Tmp;
    
    
    let Stitle = Self["props"]["children"][3]["props"]["children"][0]["props"]["children"];
    let SChanTitle = Self["props"]["children"][3]["props"]["children"][1]["props"]["children"];
    let Simg = Self["props"]["children"][2]["props"]["src"];
    let SVid = Self["props"]["vid"];
    let SPItemId = Self["props"]["children"][0]["props"]["playvidid"];
    L[NewInd]=BuildItem(Stitle,Simg,SChanTitle,NewInd,SVid,SPItemId);
   
    
    Refresh(Math.random());
    
    document.activeElement.blur();
    let playlistId = IdInp.current.value;
    
    window.gapi.client.youtube.playlistItems.update({
      "part": [
        "snippet"
      ],
      "resource": {
        "id": SPItemId,
        "snippet": {
          "playlistId": playlistId,
          "position": NewInd,
          "resourceId": {
            "kind": "youtube#video",
            "videoId": SVid
          }
        }
      }
    })
        .then(function(response) {
                
                window.gapi.client.youtube.playlistItems.update({
                  "part": [
                    "snippet"
                  ],
                  "resource": {
                    "id": PItemId,
                    "snippet": {
                      "playlistId": playlistId,
                      "position": SelectedInd,
                      "resourceId": {
                        "kind": "youtube#video",
                        "videoId": Vid
                      }
                    }
                  }
                })
                    .then(function(response) {
                            
                          },
                          function(err) { console.error("Execute error 2", err); });
            
              },
              function(err) { console.error("Execute error 1", err); });

  }
}


 }}onFocus={(e)=>{SelectedInd = parseInt(e.target.parentElement.parentElement.getAttribute("ind"));
 }} defaultValue={ind+1}></input> </div>
<img src={Img} alt={Title} className="Thumb"></img>    
<a target="_blank" rel="noreferrer noopener" className="Names" href={"https://www.youtube.com/watch?v="+Id}>
<h3 className="Title">{Title}</h3>
 <p className="Channel">{Channel}</p>
</a>
              
</div>
              
 );
 }
      
 
    function Clear()
    {
      SetItems({items:[]});
      setList([]);
      setSelected(false);
    }



    function ToDisp() //Handle Search
    {
      if(Search !== "")
      {
        let Tmp = []
      for(let i=0;i<List.length;i++)
      {
        let Title = List[i]["props"]["children"][3]["props"]["children"][0]["props"]["children"];
        let ChanTitle = List[i]["props"]["children"][3]["props"]["children"][1]["props"]["children"];
        if(Title.toLowerCase().includes(Search.toLowerCase()) || ChanTitle.toLowerCase().includes(Search.toLowerCase()))
        {
          Tmp.push(List[i]);
        }
        

      }
      return Tmp;
      }
      return List;



    }



    return (
        <div>
          <div className={PlaylistSelected? "AccountUi Hide" : "AccountUi"}>
          <input type="text"  className="IdBar" ref={IdInp}></input>
        <button className="LoadPlay" onClick={()=>{GetList(IdInp.current.value);}}>LoadPlayList</button>
           <button className="LogButt" onClick={LogIn}>Sign in with google</button>
           <button className="LogButt Out" onClick={LogOut}>Log out to Change Account</button>
        </div>
       
         <div className="MainUi">
           
          <AddPop add={ADDVID} playid={IdInp}/>
          <input  className="SearchBar" type="text" value={Search} onChange={(e)=>{SetSearch(e.target.value)}}></input>
          <button onClick={Clear} className="Clear" >Change Playlist</button>

          </div>
        {Loading && Search ===""? <Loader Num = {LState} Max={List.length}/> : null}
        <div className="Space"/>
        <Display Items={ToDisp(List)}/>
        </div>
      );

}


export default Main;