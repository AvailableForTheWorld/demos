import React from 'react'
import Axios from "axios"
import "./Goal.css"
import "./App.css"
class Goals2 extends React.Component {
    constructor(props){
        super(props)
        this.goals=React.createRef()
        this.state={
            // goalsQue:[],
            isBtnShow:false,
            handleIndex:-1,
            handleI:-1,
            // db:[],
            goal:[],
            task:[],
            status:[],
            goallist:new Map(),
            bgcolor1:['#e4f9f5','#f6f6f6','#a8e6cf','#30e3ca','#99ddcc','#11999e']
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
    Get=()=>{
        Axios.get("http://localhost:3001/data").then((res)=>{
            
            let data = res.data
            let goal=[],status=[],goallist=new Map(),tasklist=[],cnt=0
            data.map((item,index)=>{
                if(goallist[item.goal]===undefined){
                    goallist[item.goal]=cnt
                    cnt = cnt+1
                    goal.push(item.goal)
                }
                if(!tasklist[goallist[item.goal]]){
                    tasklist[goallist[item.goal]]=[item.task]
                }else{
                    tasklist[goallist[item.goal]].push(item.task)
                }
                status.push(item.status)
                return null;
            })
            console.log("get")
            this.setState({
                goal,
                tasklist,
                status,
                goallist
            })
        })
    }
    initGet=()=>{
        Axios.get("http://localhost:3001/data").then((res)=>{
            
            let data = res.data
            let goal=[],status=[],goallist=new Map(),tasklist=[],cnt=0
            
            data.map((item,index)=>{
                if(goallist[item.goal]===undefined){
                    // console.log(goallist[item.goal])
                    goallist[item.goal]=cnt
                    cnt = cnt+1
                    goal.push(item.goal)
                }
                if(!tasklist[goallist[item.goal]]){
                    tasklist[goallist[item.goal]]=[item.task]
                }else{
                    tasklist[goallist[item.goal]].push(item.task)
                }
                status.push(item.status)
                return null;
            })
            
            console.log(goal)
            this.setState({
                goal,
                tasklist,
                status,
                goallist
            })
            
        })
        
    }
    handleSubmit=(e)=>{
        e.preventDefault()
        
        console.log(this.state.goallist)
        if(!this.goals.current.value||this.state.goallist[this.goals.current.value]!==undefined){
            this.Get()
            this.goals.current.value=""
            return null;
        } 
        const that = this
        Axios.post("http://localhost:3001/goals",{goal:this.goals.current.value})
        .then(function(){
            that.Get()
        })
        this.goals.current.value=""
    } 
    isShowIndex=(index)=>{
        if(!this.state.isBtnShow||(this.state.handleIndex!==index)||this.state.handleI!==-1){
            const eleStyle = {
                display:'none'
            }
            return eleStyle
        }
        return null
    }

    isShowI=(...args)=>{
        if(!this.state.isBtnShow||(this.state.handleI!==args[1])||this.state.handleIndex!==args[0]){         
            const eleStyle = {
                display:'none'
            }
            return eleStyle
        }
        return null
    }


    handleMouseEnter=(...args)=>{
        
        if(args.length===1)
            this.setState({
                isBtnShow:true,
                handleIndex:args[0],
                handleI:-1
            })
        else if(args.length>1){
            this.setState({
                isBtnShow:true,
                handleIndex:args[0],
                handleI:args[1]
            })
        }
    }
    handleMouseLeave=()=>{
        this.setState({
            isBtnShow:false,
            handleIndex:-1,
            handleI:-1
        })
    }
    pushColor = (index,color)=>{
        let goalsQue=this.state.goalsQue
        goalsQue[index].push(color)
        this.setState({
            goalsQue
        })
    }
    handleColor = (index)=>{
        const itemStyle = {
            display:'inline-block',
            // width:this.state.trans*10,
            height: 30,
            color:'white',
            lineHeight:'30px',
            backgroundColor: `#${this.randomColor()}`,
            textAlign:'center',
            padding:10
        }
        if(this.state.goalsQue[index].length>1){
            itemStyle.backgroundColor=this.state.goalsQue[index][1]
        }else{
            this.pushColor(index,itemStyle.backgroundColor)
        }
        return itemStyle
    }
    addTask=(index)=>{
        console.log(index)
        let goal = this.state.goal[index]
        const task = this.goals.current.value
        if(task==="")
            return null;        
        const that = this
        if(!this.state.tasklist[index][0]){
            
            Axios.post("http://localhost:3001/update-goals",{
                goal:goal,
                task:task,
                status:0
            }).then(function(){
               
                that.Get()
            })
        }
        else{

            Axios.post("http://localhost:3001/goals",{goal:goal,task:task,status:0})
            .then(function(){
                that.Get()
            })
        }
        this.goals.current.value=""
        this.goals.current.focus()
    }
    handleWork=(index,i)=>{
        let item = this.state.tasklist[index][i]
        let trans = this.goals.current.value
        this.props.getGoalsTask(item,trans)
        this.goals.current.value=""
    }
    componentDidMount(){
        // this.Get()
        this.initGet()
    }
    render(){
         
        return (
            <div className="center">
                <form onSubmit={this.handleSubmit}>
                    <input className="input" type="text" placeholder="input your goals" ref={this.goals} />
                    <input className="goal-btn" type="submit" value="Go"/>
                </form>
                
                {
                
                    this.state.goal.map((item,index)=>{
                        return (<div key={index} style={{height:30}}>
                            <span  onMouseEnter={()=>this.handleMouseEnter(index)} 
                        onMouseLeave={this.handleMouseLeave}><span style={{display:'inline-block',padding:'0 10px 0 10px',height:'100%',lineHeight:'30px',backgroundColor:`${this.state.bgcolor1[index%this.state.bgcolor1.length]}`}}>{item}</span>
                                <button style={this.isShowIndex(index)} onClick={()=>this.addTask(index)}>add</button>
                            </span>
                            
                            <span >
                                {
                                    this.state.tasklist[index][0]!==null?
                                    this.state.tasklist[index].map((val,i)=>{
                                        return <span key={i} onMouseEnter={()=>this.handleMouseEnter(index,i)} 
                                        onMouseLeave={this.handleMouseLeave}><span style={{display:'inline-block',padding:'0 10px 0 10px',height:'100%',lineHeight:'30px',backgroundColor:`${this.state.bgcolor1[index%this.state.bgcolor1.length]}`}}>{val}</span>
                                        <button style={this.isShowI(index,i)} onClick={()=>this.handleWork(index,i)}>work</button>
                                        </span>
                                    })                                    
                                    :null
                                }
                            </span>
                        </div>);
                    })
                
                }
            </div>
        )
    }
}

export default Goals2