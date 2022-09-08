import React from 'react'

class Todo extends React.Component {
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
        this.setState({
            list:this.state.list.concat(taskItem)
        })
        this.taskInput.current.value=""
        this.time.current.value=""
        this.taskInput.current.focus()
    }
    handleClick=(index)=>{
        let list = this.state.list
        list.splice(index,1)
        this.setState({
            list:list
        })
    }
    beginTask = (index)=>{
        let list = this.state.list
        let beginItem = list.splice(index,1)
        // console.log(beginItem)
        this.setState({
            list:list
        })
        this.props.getItem(beginItem)
    }
    render(){
        return (
            <div>
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
                            return <li  key={index}>&nbsp;{item.item} &nbsp;{item.spending} <button onClick={()=>this.beginTask(index)}>begin</button> <button onClick={()=>this.handleClick(index)}>delete</button></li>
                        })
                    }
                    </ol>
                </div>
            </div>
        )
    }
}
export default Todo