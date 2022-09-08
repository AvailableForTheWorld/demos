import React, { Component } from 'react';

export default class Progress extends Component {
    constructor(){
        super()
        this.state={
            nums:100,
            index:0,
            current:0
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.index !== prevProps.index) {    
          this.setState({
            index:this.props.index,
            current:Math.floor(this.props.index/this.props.nums*100)
          })
      }
    }
    
    renderProgress () {
        const progressItemStyle = {
            width: `${this.state.current}%`,
            height: '100%',
            backgroundImage:`linear-gradient(to right, ${this.props.Color1} , ${this.props.Color2})`
        };
        return <div style={progressItemStyle} ></div>;
    }
    componentDidMount(){
        this.setState({
            nums:this.props.nums,
            index:this.props.index
        })
        // console.log("the nums are : "+this.props.nums+" and the nowtrans is: "+this.props.index)
        
    }
    render() {

        const progressStyle = {
            display: '-webkit-flex',
            color: '#000'
            
        };
        const progressArticleStyle = {
            height: 17,
            border: `1px solid ${this.props.backColor}`,
            width: `${this.props.width}`,
            display: 'flex',
            borderRadius: 5,
            overflow: 'hidden',
            backgroundColor:`${this.props.backColor}`
        };
        const progressFont = {
            position:'absolute',
            color:'#fff',
            left:'50%'
        }
        return (
            <div style={progressStyle}>
                <div style={progressArticleStyle}>
                    {this.renderProgress()}
                </div>
                <div style={progressFont}>
                    {this.props.nums&&Math.floor(this.props.index*100/this.props.nums)}%
                </div>
                
            </div>
        )
    }
}

