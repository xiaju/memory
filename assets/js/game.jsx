import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import {Socket} from "phoenix"

export default function game_init(root) {
  ReactDOM.render(<Name />, root);
}

class Name extends React.Component {
  constructor (props) {
    super(props);
    this.state = {value: ""}
  }

  handleRoom(ev) {
    this.setState({value: ev.target.value});
  }

  handleSubmit(ev) {
    let socket = new Socket("/socket", {params: {token: window.userToken}})
    socket.connect()
    let channel = socket.channel("games:" + this.state.value, {})

    console.log(this.state.value)

    ReactDOM.render(<Starter channel={channel}/>, root);    
  }

  render() {
    return <form onSubmit={this.handleSubmit.bind(this)}>
             <label>Room</label>
             <input type="text"
              onChange={this.handleRoom.bind(this)} value={this.state.value} />
             <input type="submit" value="Submit" />
           </form>
  }
}

class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;

    this.state = {
      matches: 0,
      clicks: 0,
      tileState: []
    }

    this.channel
      .join()
      .receive("ok", this.got_view.bind(this))
      .receive("error", resp => { console.log("Unable to join", resp); })
  }

  got_view(view) {
    this.setState(view.game)
  }

  on_guess(i) {
    let a = function(view) {
      let prevClicks = this.state.clicks
      this.got_view(view)
      if (this.state.clicks % 2 == 0 && this.state.clicks > prevClicks) {
        setTimeout(this.on_reset.bind(this), 1000)
      }
    }

    this.channel.push("guess", { ind: i })
      .receive("ok", a.bind(this))
  }

  on_reset() {
    this.channel.push("reset", {})
      .receive("ok", this.got_view.bind(this))
  }

  on_restart() {
    this.channel.push("restart", {})
      .receive("ok", this.got_view.bind(this))

  }

  indexToButton(x, y) {
    let ind = x + 4 * y

    let msg = this.state.tileState[ind]

    let empty = <div className="column">
      <p><button onClick={function() {this.on_guess(ind)}.bind(this)}>
        {msg}</button>
      </p>
    </div>
    return empty
  }

  render() {
    let grid = new Array(5)

    for (let i = 0; i < 4; i++) {
      let row = new Array(4)
      for (let j = 0; j < 4; j++) {
        row[j] = this.indexToButton(j, i)
      }
      grid[i] = <div className="row"> {row} </div>
    }

    grid[5] = <div className = "row"><div className="column">
      <p><button onClick={this.on_restart.bind(this)}>
      restart</button></p></div><div className="column"><p>
      matches = {this.state.matches}</p></div><div className="column">
      <p>clicks = {this.state.clicks}</p></div></div>
    return grid
  }
}
