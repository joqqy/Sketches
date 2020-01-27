// ViewSim.js

import alfrid, { GL } from 'alfrid'
import fs from 'shaders/sim.frag'
import Config from './Config'
import FaceDetector from './FaceDetector'

class ViewSim extends alfrid.View {
  constructor () {
    super(alfrid.ShaderLibs.bigTriangleVert, fs)
    this.time = Math.random() * 0xFF
  }

  _init () {
    this.mesh = alfrid.Geom.bigTriangle()

    this.shader.bind()
    this.shader.uniform('textureVel', 'uniform1i', 0)
    this.shader.uniform('texturePos', 'uniform1i', 1)
    this.shader.uniform('textureExtra', 'uniform1i', 2)
    this.shader.uniform('textureMask', 'uniform1i', 3)

    this._attractForce = new alfrid.EaseNumber(0, 0.025)

    FaceDetector.on('result', () => {
      setTimeout(() => {
        this._attractForce.easing = 0.025
        this._attractForce.value = 1
      }, 1000)
    })

    FaceDetector.on('lost', () => {
      this._attractForce.easing = 0.025
      this._attractForce.value = 0
    })
  }

  render (textureVel, texturePos, textureExtra, textureMask) {
    this.time += 0.01
    this.shader.bind()
    this.shader.uniform('time', 'float', this.time)
    this.shader.uniform('uRadius', 'float', Config.maxRadius)
    this.shader.uniform('uRange', 'float', Config.yRange)
    this.shader.uniform('uAttractForce', 'float', this._attractForce.value)
    textureVel.bind(0)
    texturePos.bind(1)
    textureExtra.bind(2)
    textureMask.bind(3)

    GL.draw(this.mesh)
  }
}

export default ViewSim
