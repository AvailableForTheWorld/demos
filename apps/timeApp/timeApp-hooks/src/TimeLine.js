import React from 'react'
import Progress from './progress'
import "./App.css"

class Tick extends React.Component {
    constructor(){
        super()
        this.state={
            hours:new Date().getHours(),
            minutes:new Date().getMinutes(),
            seconds:new Date().getSeconds(),
            cur:new Date().getHours()*3600+new Date().getMinutes()*60+new Date().getSeconds()
        }
    }
    getTime(){
        let date = new Date()
        let hours = date.getHours(),minutes = date.getMinutes(),seconds=date.getSeconds()
        // if(hours<10)hours='0'+hours
        // if(minutes<10)minutes='0'+minutes
        // if(seconds<10)seconds='0'+seconds
        this.setState({
            hours,
            minutes,
            seconds,
            cur:hours*3600+minutes*60+seconds
        })

    }
    componentDidMount(){
        setInterval(this.getTime.bind(this),1000)
    }

    render(){
        return(
        <div className="title">
            <h1 style={{marginTop:100,marginBottom:50}}><span className="time-span">
                {this.state.hours<10? '0'+this.state.hours : this.state.hours}</span>&nbsp; :
                &nbsp;<span className="time-span">{this.state.minutes<10?'0'+this.state.minutes:this.state.minutes}</span>&nbsp; :
                &nbsp;<span className="time-span">{this.state.seconds<10?'0'+this.state.seconds:this.state.seconds}</span></h1>
            <Progress nums={86400} index={this.state.cur} Color1={'#f9e893'} Color2={'#f38181'} width={'100%'} backColor={'#B5D3FF'}/>
        </div>
        )
    }   
}



export default Tick 