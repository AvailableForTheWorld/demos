import Axios from 'axios'
import React from 'react' 
import './FinishedTask.css'

class FinishedTask2 extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            
            isShow:true,
            hoverIndex:-1,
            item:[],
            end_time:[],
            duration:[],
            bgcolor:['#ffb6b9','#fae3d9','#bbded6','#61c0bf']
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

    handleMouseEnter=(index)=>{
        this.setState({
            isShow:true,
            hoverIndex:index
        })
        // console.log("the index is: "+index)
    }
    handleMouseLeave=()=>{
        this.setState({
            isShow:false,
            hoverIndex:-1
        })
    }
    Get=()=>{
        Axios.get('http://localhost:3001/finished-list').then((res)=>{
                let data = res.data
                let end_time=[],duration=[],item=[]
                // console.log("hello")
                data.map((val,index)=>{
                    end_time.push(val.end_time)
                    duration.push(val.duration)
                    item.push(val.item)
                    return null;
                })
                this.setState({
                    end_time,
                    duration,
                    item
                })
            })
    }
    componentDidUpdate(prevProps){
        if(this.props.flag!==prevProps&&this.props.flag===true){
            console.log("nihao")
            setTimeout(()=>{
                this.Get()
                this.props.controlFlag(false)
            },0)
            
        }
        
    }
    componentDidMount(){
        this.Get()
    }
    dealTime=(item)=>{
        const item1 = item.slice(0,10)
        const item2 = item.slice(11,19)
        return <div>
            <div>{item1}</div>
            <div>{item2}</div>
        </div>
    }
    handleHover=(index)=>{
        this.setState({
            isShow:true,
            hoverIndex:index
        })
    }
    handleMouseLeave=()=>{
        this.setState({
            isShow:false,
            hoverIndex:-1
        })
    }
    isShowEndTime=(index)=>{
        let ele=null
        if(this.state.isShow&&this.state.hoverIndex===index){
            ele={
                display:'inline-block',
                textAlign:'center',
                lineHeight:'25px',
                width: 100,
                height: 75,
                padding:10,
                backgroundColor: `${this.state.bgcolor[index%this.state.bgcolor.length]}`
            }
        }
        else{
            ele={
                display:'none'
            }
        }
        return ele
    }
    render(){
        
        const style1 = {
            display:'inline-block',
            height:50,
            color:'black'
        }
        
        
        return (
            
            <div className="center">
                
                <div>
                    {
                        this.state.end_time.map((item,index)=>{
                            return <div key={index} style={style1} onMouseEnter={()=>this.handleHover(index)} onMouseLeave={this.handleMouseLeave}>
                                <div className="task" style={{backgroundColor:`${this.state.bgcolor[index%this.state.bgcolor.length]}`}}>{this.state.item[index]}</div>
                                <div style={this.isShowEndTime(index)}>
                                    <div>{this.dealTime(item)}</div>
                                    <div>{this.state.duration[index]}</div>
                                </div>
                                
                            </div>
                        })
                    }
                </div>
            </div>
        )
    }
}

export default FinishedTask2