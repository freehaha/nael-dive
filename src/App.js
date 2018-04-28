import React, { Component } from 'react'
import Konva from 'konva'
import './App.css'

const SELECTED_CLOCK = 'rgba(180, 0, 30, 0.9)'
const HOVER_CLOCK = 'rgba(180, 0, 30, 0.5)'
const NORMAL_CLOCK = 'rgba(180, 0, 30, 0.1)'
const ARENA_RADIUS = 160
const DRAGON_RADIUS = 25
const MARK_RADIUS = 10
const MARK_COLORS = ['rgb(249, 29, 73)', 'rgb(242, 239, 72)', 'rgb(112, 231, 255)']
const STAGE_HEIGHT = 600
const STAGE_WIDTH = 600
const DIVE_WIDTH = 100
const DIVE_COLOR = 'rgba(225, 178, 255, 0.6)'
class App extends Component {
  constructor (props) {
    super(props)
    this.clocks = []
    this.marks = []
    this.random = this.random.bind(this)
    this.reset = this.reset.bind(this)
    this.export = this.export.bind(this)
    this.locationHashChanged = this.locationHashChanged.bind(this)
    this.state = {hash: window.location}
  }
  parseHash () {
    var hash = window.location.hash.substr(1)
    return hash.split('&').reduce(function (result, item) {
      var parts = item.split('=')
      result[parts[0]] = decodeURIComponent(parts[1])
      return result
    }, {})
  }
  locationHashChanged () {
    this.loadHashSetting()
    this.setState({hash: window.location})
  }
  componentDidMount () {
    this.init()
    window.onhashchange = this.locationHashChanged
  }
  initArena () {
    var layer = new Konva.Layer()
    var arena = new Konva.Circle({
      x: this.stage.getWidth() / 2,
      y: this.stage.getHeight() / 2,
      radius: ARENA_RADIUS,
      fill: 'rgba(90, 0, 90, 0.3)',
      stroke: 'black',
      strokeWidth: 2
    })
    layer.add(arena)
    for (var i = 0; i < 12; ++i) {
      var clock = new Konva.Circle({
        x: this.stage.getWidth() / 2,
        y: this.stage.getHeight() / 2,
        offsetY: this.stage.getHeight() / 4,
        offsetX: this.stage.getHeight() / 4,
        rotation: 30 * i + 45,
        radius: DRAGON_RADIUS,
        fill: NORMAL_CLOCK,
        stroke: 'black',
        strokeWidth: 2
      })
      layer.add(clock)
      let num = i
      clock.on('click', () => {
        this.onClockClick(num)
      })
      let currentClock = clock
      clock.on('mouseenter', () => {
        if (currentClock._sel) return
        currentClock.fill(HOVER_CLOCK)
        layer.draw()
      })
      clock.on('mouseleave', () => {
        if (currentClock._sel) return
        currentClock.fill(NORMAL_CLOCK)
        layer.draw()
      })
      clock._sel = false
      this.clocks.push(clock)
    }
    this.clockLayer = layer
    this.stage.add(layer)
  }
  initMarks () {
    var layer = new Konva.Layer()
    this.markLayer = layer
    for (var i = 0; i < 3; ++i) {
      var mark = new Konva.Circle({
        x: this.stage.getWidth() / 2 - 30 + i * 30,
        y: this.stage.getHeight() / 2,
        radius: MARK_RADIUS,
        fill: MARK_COLORS[i],
        draggable: true,
        dragBoundFunc: (pos) => {
          var x = pos.x
          if (x > STAGE_WIDTH / 2 + ARENA_RADIUS - MARK_RADIUS) {
            x = STAGE_WIDTH / 2 + ARENA_RADIUS - MARK_RADIUS
          }
          if (x < STAGE_WIDTH / 2 - ARENA_RADIUS + MARK_RADIUS) {
            x = STAGE_WIDTH / 2 - ARENA_RADIUS + MARK_RADIUS
          }
          var y = pos.y
          if (y > STAGE_HEIGHT / 2 + ARENA_RADIUS - MARK_RADIUS) {
            y = STAGE_HEIGHT / 2 + ARENA_RADIUS - MARK_RADIUS
          }
          if (y < STAGE_HEIGHT / 2 - ARENA_RADIUS + MARK_RADIUS) {
            y = STAGE_HEIGHT / 2 - ARENA_RADIUS + MARK_RADIUS
          }
          var dx = x - STAGE_WIDTH / 2
          var dy = y - STAGE_HEIGHT / 2
          while (dx * dx + dy * dy > (ARENA_RADIUS - MARK_RADIUS) * (ARENA_RADIUS - MARK_RADIUS)) {
            if (dx > 0) {
              x -= 1
            } else {
              x += 1
            }
            if (dy > 0) {
              y -= 1
            } else {
              y += 1
            }
            dx = x - STAGE_WIDTH / 2
            dy = y - STAGE_HEIGHT / 2
          }
          return {
            x: x,
            y: y
          }
        },
        stroke: 'black',
        strokeWidth: 2
      })
      let idx = i
      mark.on('dragmove', () => {
        this.onMarkMove(idx)
      })
      this.marks.push(mark)
      layer.add(mark)
    }
    this.stage.add(layer)
  }
  initDive () {
    var layer = new Konva.Layer()
    this.stage.add(layer)
    this.dives = []
    for (var i = 0; i < 5; i++) {
      var rect = new Konva.Rect({
        x: 0,
        y: 0,
        offsetX: DIVE_WIDTH / 2,
        width: DIVE_WIDTH,
        height: ARENA_RADIUS * 2 + DRAGON_RADIUS * 4,
        strokeWidth: 1,
        stroke: 'black',
        fill: DIVE_COLOR,
        rotation: 0
      })
      this.dives.push(rect)
      layer.add(rect)
    }
    this.diveLayer = layer
  }
  testSetting () {
    var marks = [0, 3, 5, 8, 9]
    for (var m of marks) {
      this.clocks[m]._sel = true
      this.clocks[m].fill(SELECTED_CLOCK)
    }
    this.redraw()
    this.updateDive()
  }
  loadHashSetting () {
    var setting = this.parseHash()
    for (var c of this.clocks) {
      c._sel = false
      c.fill(NORMAL_CLOCK)
    }
    if (setting.d) {
      setting.d.split(',')
        .map(s => parseInt(s, 10))
        .forEach((i) => {
          console.log(i)
          if (isNaN(i)) return
          if (i < 0 || i > 11) return
          this.clocks[i]._sel = true
          this.clocks[i].fill(SELECTED_CLOCK)
        })
    }
    var conf = [['a', 0], ['b', 1], ['c', 2]]
    for (c of conf) {
      if (setting[c[0]]) {
        try {
          const pos = JSON.parse(setting[c[0]])
          this.marks[c[1]].position({
            x: pos[0],
            y: pos[1]
          })
        } catch (e) {
          this.marks[c[1]].position({
            x: 300 + c[1] + MARK_RADIUS * 2,
            y: 300
          })
        }
      }
    }
    this.redraw()
    this.updateDive()
  }
  redraw () {
    this.clockLayer.draw()
    this.diveLayer.draw()
    this.markLayer.draw()
  }
  init () {
    this.stage = new Konva.Stage({
      container: 'arena',
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT
    })
    this.clockpos = []
    for (var i = 0; i < 12; i++) {
      const rad = (i * 30) / 180 * Math.PI
      this.clockpos.push({
        x: (ARENA_RADIUS + DRAGON_RADIUS * 2 + 2) * Math.sin(rad) + STAGE_WIDTH / 2,
        y: -(ARENA_RADIUS + DRAGON_RADIUS * 2 + 2) * Math.cos(rad) + STAGE_HEIGHT / 2
      })
    }
    this.initArena()
    this.initDive()
    this.initMarks()
    this.loadHashSetting()
  }
  updateDive () {
    var count = 0
    var dragons = []
    for (var i = 0; i < 12; ++i) {
      if (this.clocks[i]._sel) {
        dragons.push(this.clockpos[i])
        count++
      }
    }
    if (count !== 5) {
      this.diveLayer.clear()
      return
    }
    const pairs = [
      [0, 0], [0, 1], /* 1st mark */
      [1, 2], /* 2nd mark */
      [2, 3], [2, 4] /* 3rd mark */
    ]
    for (i = 0; i < 5; ++i) {
      const p = pairs[i]
      var markPos = this.marks[p[0]].position()
      // x: this.clockpos[i].x + STAGE_WIDTH / 2,
      // y: this.clockpos[i].y + STAGE_HEIGHT / 2,
      var dPos = dragons[p[1]]
      const dx = (markPos.x - dPos.x)
      const dy = (markPos.y - dPos.y)
      const d = Math.sqrt(dx * dx + dy * dy)

      this.dives[i].position(dPos)
      // this.dives[0].height(height)
      if (dx < 0) {
        this.dives[i].rotation(Math.acos(dy / d) / Math.PI * 180)
      } else {
        this.dives[i].rotation(-Math.acos(dy / d) / Math.PI * 180)
      }
    }
    this.diveLayer.draw()
  }
  onMarkMove (num) {
    this.updateDive()
  }
  onClockClick (num) {
    var clock = this.clocks[num]
    clock._sel = !clock._sel
    if (clock._sel) {
      clock.fill(SELECTED_CLOCK)
    } else {
      clock.fill(NORMAL_CLOCK)
    }
    this.clockLayer.draw()
    this.updateDive()
  }
  reset () {
    for (var c of this.clocks) {
      c._sel = false
      c.fill(NORMAL_CLOCK)
    }
    this.redraw()
    this.updateDive()
  }
  random () {
    const idx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const result = idx.map(n => { return [n, Math.random()] }).sort((a, b) => {
      return a[1] > b[1]
    })
    this.reset()
    for (var i = 0; i < 5; i++) {
      var d = result[i][0]
      this.clocks[d]._sel = true
      this.clocks[d].fill(SELECTED_CLOCK)
    }
    this.redraw()
    this.updateDive()
  }
  export () {
    var conf = [['a', 0], ['b', 1], ['c', 2]]
    var marks = conf.map((c) => {
      var pos = this.marks[c[1]].position()
      return `${c[0]}=[${pos.x}, ${pos.y}]`
    }).join('&')
    var d = []
    for (var i = 0; i < 12; ++i) {
      if (this.clocks[i]._sel) {
        d.push(i)
      }
    }
    var url = encodeURI(`${window.location.origin}${window.location.pathname}#?${marks}&d=${d.join(',')}`)
    this.setState({hash: url})
  }
  render () {
    return (
      <div className="App">
        <div id="arena">
        </div>
        <button onClick={this.reset}>reset</button>
        <button onClick={this.random}>random dragon</button>
        <button onClick={this.export}>export</button><br />
        <input value={this.state.hash} onChange={(e) => this.setState({hash: e.target.value})}/>
      </div>
    )
  }
}

export default App
