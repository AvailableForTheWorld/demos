import Axios from 'axios'
import React from 'react' 

class FinishedTask extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            flag:false,
            trans:0,
            que:[],
            cnt:0,
            taskItem:"",
            oneTimeFlag:1,
            timeStart:0,
            panel:[],
            isShow:false,
            hoverIndex:-1,
            item:[],
            end_time:[],
            duration:[]
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
    pushTask(){
            const itemStyle = {
                display:'inline-block',
                // width:this.state.trans*10,
                height: 30,
                lineHeight:'30px',
                backgroundColor: `#${this.randomColor()}`,
                textAlign:'center',
                padding:10
            }
            
            let panelItem = {
                startTime:this.state.timeStart,
                trans:this.state.trans
            }
            let panel=this.state.panel
            panel.push(panelItem)
            let que = this.state.que
            // console.log("pushTask length: "+this.state.trans)
            que.push(<div style={itemStyle} key={this.state.cnt}>{this.state.taskItem}</div>)
            this.setState({
                que:que,
                cnt:this.state.cnt+1,
                panel
            })
            
    }
    getQue(){
        return this.state.que[0]
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
    // handlePanel=async(item,index)=>{
    //     if(index===this.state.hoverIndex&&this.state.isShow){
    //         // console.log(index)
    //         let end_time,trans;
    //         await 
    //         return (<div>
    //             <div>完成时间：{end_time}</div>
    //             <div>用时：{trans}</div>
    //             </div>)
    //     }else
    //         return null;
    // }

    Get=()=>{
        Axios.get('http://localhost:3001/finished-list').then((res)=>{
                let data = res.data
                let end_time=[],duration=[],item=[]
                console.log("hello")
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
        if(this.state.oneTimeFlag&&prevProps.trans!==this.props.trans){
            // console.log("trans changed!!!")
            let date = new Date();
            this.setState({
                oneTimeFlag:0,
                timeStart:date
            })
        }
        if(this.props.flag!==prevProps&&this.props.flag===true){
            
            setTimeout(()=>{
                this.setState({
                    flag:true,
                    trans:this.props.trans,
                    taskItem:this.props.taskItem,
                    oneTimeFlag:1
                })
                this.pushTask()
                this.Get()
            },0)
            
            this.props.controlFlag(false)
            // console.log("ok that's fine"+this.props.trans)
            
            

        }
        
    }
    componentDidMount(){
        this.Get()
    }
    render(){
        // console.log("is rendered")
        const style1 = {
            display:'inline-block',
            height:50,
            color:'black'
        }
        const whiteFont ={
            color:'white'
        }
        
        return (
            <div>
                <div>
                    {
                        this.state.que.map((item,index)=>{
                            // console.log("loop index: "+index)
                            return <div style={style1} key={index} onMouseEnter={()=>{this.handleMouseEnter(index)}} onMouseLeave={()=>this.handleMouseLeave()}>
                                        <div style={{...style1,...whiteFont}}>{item}</div>
                                    {/* <div style={style1}>{this.handlePanel(item,index)}</div> */}
                                    
                            </div>
                        })
                    }
                </div>
                <div>
                    {
                        this.state.end_time.map((item,index)=>{
                            return <div>
                                
                                <div>{this.state.item[index]}</div>
                                <div>{item}</div>
                                <div>{this.state.duration[index]}秒</div>
                            </div>
                        })
                    }
                </div>
            </div>
        )
    }
}

export default FinishedTask