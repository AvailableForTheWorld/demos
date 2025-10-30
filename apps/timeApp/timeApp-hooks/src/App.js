import Countdown from './Countdown'
import Todo2 from './Todo2'
import Progress from './progress'
import React from 'react';
import TimeLine from './TimeLine'
import FinishedTask2 from './FinishedTask2';
import Goals2 from './Goals2'
import  "./App.css"

import {BrowserRouter as Router, Route,NavLink,Switch} from "react-router-dom"


class App extends React.Component {
  constructor(){
    super()
    this.state={
      taskQue:[],
      t:0,
      nowTrans:0,
      finishFlag:false,
      taskItem:""
    }
  }
  handleQue=(item)=>{
    let que = this.state.taskQue
    que.push(item[0])
    // console.log(item[0])
    this.setState({
      taskQue:que,
      t:item[0].spending*60,
      taskItem:item[0].item,
      nowTrans:0
    })
  }
  handleCurTime=(trans)=>{
    this.setState({
      nowTrans:trans
    })
    // console.log("the origin trans:   "+trans)
  }
  isFinished = (flag)=> {
    this.setState({
      finishFlag: flag
    })
  }
  handleWork=(item,trans)=>{
    this.setState({
      taskItem:item,
      t:trans*60
    })
    
  }

  handleNavUl=(e)=>{
    console.log(e)
  }

  render(){
    const styleMiddle = {
      position:'fixed',
      
      bottom:0,
      
    }
    return (

      <Router>
        <div className="App">
          <nav>
            <ul className="nav-ul" onClick={this.handleNavUl}>
              <li><NavLink to="/t" activeStyle={{backgroundColor:"#FF4848"}}>time</NavLink></li>
              <li><NavLink to="/g" activeStyle={{backgroundColor:"#FF4848"}}>Goal</NavLink></li>
              <li><NavLink to="/td" activeStyle={{backgroundColor:"#FF4848"}}>ToDo</NavLink></li>
              <li><NavLink to="/ft" activeStyle={{backgroundColor:"#FF4848"}}>FinishedTask</NavLink></li>          
            </ul>
          </nav>
      
          <main>

            <Switch>
              <Route path="/t" exact component={TimeLine}></Route>
              <Route path="/g" exact render={()=>(
                <Goals2 getGoalsTask={this.handleWork.bind(this)}/>
              )}></Route>
              <Route path="/td" exact render={()=>(
                <Todo2 getItem={this.handleQue.bind(this)} ></Todo2>
              )}></Route>
              <Route path="/ft" exact render={()=>(
                <FinishedTask2 flag={this.state.finishFlag} trans={this.state.nowTrans} controlFlag={this.isFinished} taskItem={this.state.taskItem}/>
              )}></Route>
              
            </Switch>
             
        
            <div style={{...styleMiddle,width:'100%'}} >
                <div >
                <Countdown s={this.state.t} taskName={this.state.taskItem} 
                    getCurTime={this.handleCurTime} judgeFinished={this.isFinished}/>
                  </div>
                <Progress nums={this.state.t} index={this.state.nowTrans} Color1={'#00CCFF'} Color2={'#AEDD81'} width={'100%'} backColor={'rgb(253, 204, 204)'}/>
              </div>
           </main>   
        </div>
        </Router>
    )
  }
  
}

export default App;
