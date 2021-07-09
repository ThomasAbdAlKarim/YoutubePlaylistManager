import React, { Component } from 'react';
import './App.css';
import Main from './Main';
const API_KEY = process.env.REACT_APP_API_KEY;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
class App extends Component 
{
  constructor()
  {
    super();
    this.state = {
      gapiReady:false
    };
  }


  loadClientWhenGapiReady = (script) => {
    console.log('Trying To Load Client!');
    if(script.getAttribute('gapi_processed')){
      console.log('Client is ready! Now you can access gapi. :)');
      
      if(window.location.hostname==='localhost'){
        window.gapi.client.load("http://localhost:8080/_ah/api/discovery/v1/apis/metafields/v1/rest")
        .then((response) => {
          console.log("Connected to metafields API locally.");
          },
          function (err) {
            console.log("Error connecting to metafields API locally.");
          }
        );
      }
      window.gapi.load('client', () => {
        window.gapi.client.setApiKey(API_KEY);
        window.gapi.client.load('youtube', 'v3', () => {
          this.setState({ gapiReady: true });
        });
        window.gap.load('client:auth2');
      });
    }
    else{
      console.log('Client wasn\'t ready, trying again in 100ms');
      setTimeout(() => {this.loadClientWhenGapiReady(script)}, 100);
    }
  }
  initGapi = () => {
    console.log('Initializing GAPI...');
    console.log('Creating the google script tag...');

    const script = document.createElement("script");
    script.onload = () => {
      console.log('Loaded script, now loading our api...')
      this.loadClientWhenGapiReady(script);
    };
    script.src = "https://apis.google.com/js/client.js";
    
    document.body.appendChild(script);
  }

  componentDidMount() {
    this.initGapi();
   
  }
 
  

  render() {
    if(this.state.gapiReady)
    {
     return (
       <div className="App">
        <Main api_key={API_KEY} client_id={CLIENT_ID}></Main>
       </div>
     );
    }
    return (
  <div className="App">
    
    <div className="wave">
    <span style={{"--c":1}}>L</span>
    <span style={{"--c":2}}>o</span>
    <span style={{"--c":3}}>a</span>
    <span style={{"--c":4}}>d</span>
    <span style={{"--c":5}}>i</span>
    <span style={{"--c":6}}>n</span>
    <span style={{"--c":7}}>g</span>
    <span style={{"--c":8}}>.</span>
    <span style={{"--c":9}}>.</span>
    <span style={{"--c":10}}>.</span>
  </div>
    
          
 </div>

    );
}


  
}


export default App;
