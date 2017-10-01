// View4DCube.js

import alfrid, { GL, GLShader, EaseNumber } from 'alfrid';
import vsCube from 'shaders/cube.vert';
import fsCube from 'shaders/cube.frag';

import vsPlane from 'shaders/plane.vert';
import fsPlane from 'shaders/plane.frag';

import getRandomAxis from './utils/getRandomAxis';
import Scheduler from 'scheduling';

var random = function(min, max) { return min + Math.random() * (max - min);	}


class View4DCube extends alfrid.View {
	
	constructor() {
		super(vsCube, fsCube);

		this._ease = random( 0.02, 0.05 ) * 0.5;
		this._shaderPlane = new GLShader(vsPlane, fsPlane);

		this._isDirty = true;
		this._scale = new EaseNumber(1, this._ease);
		this._mtxScale = mat4.create();

		this.dimension = vec3.fromValues(1, 1, 1);
		this._rotation = 0;
		this._rotationAxis = getRandomAxis();
		this._position = vec3.create();

		this.dimensionMask = vec3.fromValues(.5, .5, .5);
		this._rotationMask = 0;
		this._rotationAxisMask = getRandomAxis();
		this._positionMask = vec3.create();

		this._modelMatrix = mat4.create();
		this._mtxRotation = mat4.create();
		this._mtxRotationMask = mat4.create();
		this._mtxRotationMaskInvert = mat4.create();

		this._boundUpDist = new EaseNumber(.5, this._ease);
		this._boundBottomDist = new EaseNumber(.5, this._ease);


		const r = 0.25;
		this._boundUp = vec4.fromValues(0.001, 1, 0, this.dimensionMask[1]);
		this._boundBottom = vec4.fromValues(0.001, -1, 0, this.dimensionMask[1]);
		this._boundRight = vec4.fromValues(1, 0, 0., this.dimensionMask[0]);
		this._boundLeft = vec4.fromValues(-1, 0, 0., this.dimensionMask[0]);
		this._boundFront = vec4.fromValues(0, 0, 1, this.dimensionMask[2]);
		this._boundBack = vec4.fromValues(0, 0, -1, this.dimensionMask[2]);

		this._bounds = [
			this._boundUp,
			this._boundBottom,
			this._boundRight,
			this._boundLeft,
			this._boundFront,
			this._boundBack
		];


		gui.add(this, 'rotationMask', 0, 1.5);
	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);
		const s = 2;
		this.plane = alfrid.Geom.plane(s, s, 1);
	}


	render() {
		this.update();

		this._boundUp[3] = this._boundUpDist.value;
		this._boundBottom[3] = this._boundBottomDist.value;

		const bounds = this._bounds.map( bound => {
			const boundTransformed = vec4.create();
			vec4.transformMat4(boundTransformed, bound, this._mtxRotationMask);

			return boundTransformed;
		});


		this.shader.bind();
		this.shader.uniform("uPositionMask", "vec3", this._positionMask);
		this.shader.uniform(params.light);
		bounds.forEach( (bound, i) => {
			this.shader.uniform(`uPlane${i}`, "vec4", bound);
		});
		GL.rotate(this._modelMatrix);
		GL.draw(this.mesh);

		GL.gl.cullFace(GL.gl.FRONT);

		//	draw cull plane
		this._shaderPlane.bind();
		this._shaderPlane.uniform(params.light);
		this._shaderPlane.uniform("uDimension", "vec3", this.dimension);
		this._shaderPlane.uniform("uDimensionMask", "vec3", this.dimensionMask);
		this._shaderPlane.uniform("uPositionMask", "vec3", this._positionMask);
		this._shaderPlane.uniform("uInvertRotationMatrix", "mat4", this._mtxRotationMaskInvert);

		const boundTransformed = vec4.create();
		bounds.forEach( bound => {
			this._shaderPlane.uniform("uPlane", "vec4", bound);
			GL.draw(this.plane);
		});

		GL.gl.cullFace(GL.gl.BACK);
	}


	update() {
		if(this._isDirty) {
			this._updateRotationMatrices();
			this._isDirty = false;
		}

		// this.rotationMask = 0.3;

		const scale = this._scale.value;

		mat4.fromScaling(this._mtxScale, vec3.fromValues(scale, scale, scale));

		mat4.fromTranslation(this._modelMatrix, this._position);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxScale);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxRotation);
	}


	_updateRotationMatrices() {
		let q = quat.create();

		quat.setAxisAngle(q, this._rotationAxis, this._rotation);
		mat4.fromQuat(this._mtxRotation, q);

		quat.setAxisAngle(q, this._rotationAxisMask, this._rotationMask);
		mat4.fromQuat(this._mtxRotationMask, q);
		mat4.invert(this._mtxRotationMaskInvert, this._mtxRotationMask);
	}


	get boundUpDist() {
		return this._boundUpDist.value;
	}

	set boundUpDist(mValue) {
		this._boundUpDist.value = mValue;
	}

	get boundBottomDist() {
		return this._boundBottomDist.value;
	}

	set boundBottomDist(mValue) {
		this._boundBottomDist.value = mValue;
	}


	get rotation() {
		return this._rotation;
	}

	set rotation(mValue) {
		this._rotation = mValue;
		this._isDirty = true;
	}

	get scale() {
		return this._scale.value;
	}

	set scale(mValue) {
		this._scale.value = mValue;
	}


	get rotationMask() {
		return this._rotationMask;
	}

	set rotationMask(mValue) {
		this._rotationMask = mValue;
		this._isDirty = true;
	}
}

export default View4DCube;