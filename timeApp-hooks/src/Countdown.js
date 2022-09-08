import React from 'react';
import './Countdown.css'
import Axios from 'axios'
class Countdown extends React.Component{
    constructor(props){
      super(props)
      this.state={
        minute:0,
        second:0,
        wholeTime:0,
        trans:0
      }
      this.run = this.run.bind(this)
      this.start = this.start.bind(this)
      this.pause = this.pause.bind(this)
      this.finished=this.finished.bind(this)
    }
    
    run(){
  
        if(this.state.minute===0&&this.state.second===0){
            clearInterval(this.id)
            return;
        }
      if(this.state.second>0){
  
        this.setState({
          minute:this.state.minute,
          second:this.state.second - 1
        }) 
  
      }
      else{
  
         this.setState({
          minute:this.state.minute - 1,
          second:this.state.second + 59
        }) 
      }
      let trans = this.state.wholeTime-this.state.minute*60-this.state.second
      this.setState({
        trans
      })
      this.props.getCurTime(trans)
    }
    start=()=>{
      this.id = setInterval(this.run,1000)
      console.log("begin")
    }
    
    pause=()=>{
      clearInterval(this.id)
    }

    finished=()=>{
        Axios.put("http://localhost:3001/finished-task",{
            task:this.props.taskName,
            trans:this.state.trans
        })
        console.log("the task name is: "+this.props.taskName)
        if(this.id===this.pre)
          return;
        this.pre=this.id
        clearInterval(this.id)
        this.setState({
            minute:0,
            second:0
        })
        this.props.judgeFinished(true)
    }

    componentDidUpdate(prevProps) {
        // 典型用法（不要忘记比较 props）：
        if (this.props.s !== prevProps.s || this.props.taskName !== prevProps.taskName) {
            clearInterval(this.id)
            // console.log("the time is: "+this.props.s)
            this.setState({
                minute:Math.floor(this.props.s/60),
                second:Math.floor(this.props.s%60),
                wholeTime:this.props.s
            },this.start())
            
        }
      }
    render(){


      return(
      <div className="wholeInterFace">
  
      
    
      
      <button onClick={this.finished} className="btn red">
        
      </button>
  
      <button onClick={this.pause} className="btn yellow">
        
      </button>
  

      <button onClick={this.start} className="btn green">
        
      </button>

        <div className="container">
        <span className='number-span'>{this.state.minute}</span> : <span className='number-span'>{this.state.second}</span>
      </div>


      </div>
  
    )}
  }
  
export default Countdown;