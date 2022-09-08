import Axios from 'axios';
import React from 'react'
import "./Todo.css"
class Todo2 extends React.Component {
    constructor(){
        super()
        this.taskInput = React.createRef();
        this.time= React.createRef();
        this.state = {
            list:[]
        }
    }
    handleSubmit=(e)=>{
        e.preventDefault();
        let taskItem = { item:this.taskInput.current.value, spending:parseFloat(this.time.current.value)}
        // this.setState({
        //     list:this.state.list.concat(taskItem)
        // })
        let that=this
        Axios.put("http://localhost:3001/add-todo",
            {item:taskItem.item,cost:taskItem.spending}
        ).then(function(){
            that.Get()
            console.log("todolist: "+taskItem.spending)
        }   
        )
        this.taskInput.current.value=""
        this.time.current.value=""
        this.taskInput.current.focus()
    }
    handleClick=(index)=>{
        this.Delete(index)
    }
    beginTask = (index)=>{
        let list = this.state.list
        this.Delete(index)
        let beginItem = list.splice(index,1)
        // console.log(beginItem)
        this.setState({
            list:list
        })
        
        this.props.getItem(beginItem)
    }
    Delete=(index)=>{
        const item=this.state.list[index].item
        const cost = this.state.list[index].spending
        console.log("the delete item and cost are: "+item+" "+cost)
        console.log("the item type is "+typeof(item)+" and the cost type is "+typeof(cost)) 
        const that = this
        Axios.delete(`http://localhost:3001/del-todo/${item}`).then(
            function(res){
                console.log(res)
                console.log("this is delete")
                that.Get()
            }
        )
    }
    Get=()=>{
        Axios.get("http://localhost:3001/get-todo").then((res)=>{
            const data=res.data
            let list=[]
            data.map((item,index)=>{
                list.push({"item":item.item,"spending":item.cost})
                return null
            })
            this.setState(
                {
                    list
                }
            )
            console.log(this.state)
        })
    }
    componentDidMount(){
        this.Get()
    }
    render(){
        return (
            <div className="center">
                <form onSubmit={this.handleSubmit}>
                    <input type="text" placeholder="todo" ref={this.taskInput}/>
                    <input type="text" placeholder="time cost" ref={this.time}/>
                    <input type="submit" />
                </form>
                <div>
                    <p>list: </p>
                    <ol>
                    {
                        this.state.list.map((item,index)=>{
                            return <li  key={index}>&nbsp;{item.item} &nbsp;{item.spending} ~~~~~~~~~~~~~~<button onClick={()=>this.beginTask(index)}>begin</button> <button onClick={()=>this.handleClick(index)}>delete</button></li>
                        })
                    }
                    </ol>
                   
                </div>
            </div>
        )
    }
}
export default Todo2