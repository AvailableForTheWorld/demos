import React from 'react'

class Goals extends React.Component {
    constructor(){
        super()
        this.goals=React.createRef()
        this.state={
            goalsQue:[],
            cnt:0,
            isBtnShow:false,
            handleIndex:-1
        }
    }
    randomColor(){
        const color="0123456789ABCDEF"
        let res=""
        for(let i=0;i<6;++i){
            res+=color[Math.floor(Math.random()*16)]
        }
        return res
    }
    handleSubmit=(e)=>{

        const itemStyle = {
            display:'inline-block',
            // width:this.state.trans*10,
            height: 30,
            lineHeight:'30px',
            backgroundColor: `#${this.randomColor()}`,
            textAlign:'center',
            padding:10
        }

        e.preventDefault()
        let goalsQue = this.state.goalsQue
        let goal=<div style={itemStyle} key={this.state.cnt}>{this.goals.current.value}</div>;
        goalsQue.push(goal)
        this.goals.current.focus()
        this.goals.current.value=""
        console.log(goalsQue)
        this.setState({
            goalsQue,
            cnt:this.state.cnt+1
        })
        
    } 
    isShow=(index)=>{
        if(!this.state.isBtnShow||this.state.handleIndex!==index){
            const eleStyle = {
                display:'none'
            }
            return eleStyle
        }
        return null
    }
    handleMouseEnter=(index)=>{
        this.setState({
            isBtnShow:true,
            handleIndex:index
        })
    }
    handleMouseLeave=()=>{
        this.setState({
            isBtnShow:false,
            handleIndex:-1
        })
    }
    render(){
         
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="input your goals" ref={this.goals} />
                    <input type="submit" value="submitGoals"/>
                </form>
                {
                    this.state.goalsQue.map((item,index)=>{
                        return <div key={index} onMouseEnter={()=>this.handleMouseEnter(index)} onMouseLeave={this.handleMouseLeave}><span>{item}</span><button style={this.isShow(index)}>add</button></div>;
                    })
                }
            </div>
        )
    }
}

export default Goals