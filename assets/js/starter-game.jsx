import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
  ReactDOM.render(<Starter />, root);
}

class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.initGame()
  }

  initGame() {
    this.tileState = this.initState();
    this.matches = 0;
    this.lastClicked = -1;
    this.clicks = 0
    this.restartButton = this.restartGame
  }

  restartGame() {
    this.initGame();
    this.setState(this.tileState)
  }


  initState() {
    let a = new Array(16)
    for (let i = 0; i < 8; i = i + 1) {
      let character = (i + 10).toString(36)
      a[i * 2] = {letter: character, clicked: this.noClick, msg: "blocked"}
      a[i * 2 + 1] = {letter: character, clicked: this.noClick, msg: "blocked"}
    }
    a = _.shuffle(a)
    return a
  }

  noClick(ind) {
    return function() {
      this.clicks = this.clicks + 1
      let newTileState = this.tileState.slice()
      for (let i = 0; i < 16; i = i + 1) {
        let buttonState = newTileState[i].clicked
        if (buttonState == this.noClick) {
          newTileState[i].clicked = this.reset
        }
      }
      let clickedTile = newTileState[ind]
      clickedTile.clicked = this.nothingClicked
      clickedTile.msg = clickedTile.letter
      this.lastClicked = ind

      this.tileState = newTileState
      this.setState(this.tileState)
    }
  }

  nothingRevealed(ind) {
    return function() {}
  }
  
  nothingDelay(ind) {
    return function() {}
  }

  nothingClicked(ind) {
    return function() {}
  }

  reset(ind) {
    return function() {
      this.clicks = this.clicks + 1
      let newTileState = this.tileState.slice()
      let tile = newTileState[ind]

      for (let i = 0; i < 16; i = i + 1) {
        let buttonState = newTileState[i].clicked
        if (buttonState == this.reset || buttonState == this.nothingClicked) {
          newTileState[i].clicked = this.nothingDelay
        }
      }
      tile.msg = tile.letter
      this.restartButton = function() {}

      setTimeout(this.afterDelay(ind, this.lastClicked).bind(this), 1000)

      this.tileState = newTileState
      this.setState(this.tileState)
    }
  }

  afterDelay(i1, i2) {
    return function() {
      let newTileState = this.tileState.slice()
      let t1 = newTileState[i1]
      let t2 = newTileState[i2]

      if (t1.letter == t2.letter) {
        t1.clicked = this.nothingRevealed
        t2.clicked = this.nothingRevealed
        t1.msg = "finished"
        t2.msg = "finished"
        this.matches = this.matches + 1
      } else {
        t1.msg = "blocked"
        t2.msg = "blocked"
      }

      for (let i = 0; i < 16; i = i + 1) {
        let buttonState = newTileState[i].clicked
        if (buttonState == this.nothingDelay) {
          newTileState[i].clicked = this.noClick
        }
      }
      this.restartButton = this.restartGame
      this.tileState = newTileState
      this.setState(this.tileState)
    }
  }


  indexToButton(x, y) {
    let ind = x + 4 * y
    let msg = this.tileState[ind].msg
    let clicked = this.tileState[ind].clicked

    let empty = <div className="column">
      <p><button onClick={clicked(ind).bind(this)}>
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
      <p><button onClick={this.restartButton.bind(this)}>
      restart</button></p></div><div className="column"><p>
      matches = {this.matches}</p></div><div className="column">
      <p>clicks = {this.clicks}</p></div></div>
    return grid
  }
}
