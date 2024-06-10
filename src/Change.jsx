import React, { useState, useEffect, useRef} from 'react';
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

import hand from './image/hand.png';
import pen from './image/pen.png';
import text from './image/text.png';
import image from './image/image.png';

function Change(props){
	const { editor, onReady } = useFabricJSEditor();
  	const [color, setColor] = useState("#000000");
  	const [lives, setLives] = useState(true);
  	const [start, setStart] = useState(false);
  	const types = useRef(true);

  	let deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
	let img = document.createElement('img');
	img.src = deleteIcon;

	const [handclass, setHandclass] = useState(true);
	const [penclass, setPenclass] = useState(false);

	const [title, setTitle] = useState(props.title);
	const [password, setPassword] = useState(props.password);
	const [writing, setWriting] = useState();
	let can_js;
  	let original;

	useEffect(() => {
    	if (!editor || !fabric) {
      		return;
    	}

    	if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      		editor.canvas.on("mouse:wheel", function (opt) {
        		var delta = opt.e.deltaY;
        		var zoom = editor.canvas.getZoom();
        		zoom *= 0.999 ** delta;
        		if (zoom > 20) zoom = 20;
        		if (zoom < 0.01) zoom = 0.01;
        		editor.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        		opt.e.preventDefault();
        		opt.e.stopPropagation();
      		});
    	}

    	if (!editor.canvas.__eventListeners["mouse:down"]) {
     		editor.canvas.on("mouse:down", function (opt) {
        		var evt = opt.e;
        		if (evt.ctrlKey === true) {
          			this.isDragging = true;
          			this.selection = false;
          			this.lastPosX = evt.clientX;
          			this.lastPosY = evt.clientY;
        		}
      		});
    	}

    	if (!editor.canvas.__eventListeners["mouse:move"]) {
      		editor.canvas.on("mouse:move", function (opt) {
        		if (this.isDragging) {
          			var e = opt.e;
          			var vpt = this.viewportTransform;
          			vpt[4] += e.clientX - this.lastPosX;
          			vpt[5] += e.clientY - this.lastPosY;
          			this.requestRenderAll();
          			this.lastPosX = e.clientX;
          			this.lastPosY = e.clientY;
        		}
      		});
    	}

    	if (!editor.canvas.__eventListeners["mouse:up"]) {
      		editor.canvas.on("mouse:up", function (opt) {
        		// on mouse up we want to recalculate new interaction
        		// for all objects, so we call setViewportTransform
        		this.setViewportTransform(this.viewportTransform);
        		this.isDragging = false;
        		this.selection = true;
      		});
    	}
    	if(!start) start_canvas();
    	editor.canvas.renderAll();
  	}, [editor]);

  	useEffect(() => {
  		if(!editor || !fabric) return;
  		editor.canvas.freeDrawingBrush.color = color;
  		editor.setStrokeColor(color);
  	}, [color]);

  	useEffect(() =>{
  		original = writing;
  	}, [writing]);

  	useEffect(() => {
  		fetch('php/loadDataFromDB.php',
		{
			method: "POST",
			body: JSON.stringify({
				title: title,
      			password: password
			})
		}).then(res => res.json())
		.then(res =>{
			original = res[0]["writing"].replace(/\n/g, "\\n");
			setWriting(original);
		});
  	}, [])

  	const hand_canvas = () => {
    	editor.canvas.isDrawingMode = false;
  	};

  	const pen_canvas = () => {
    	editor.canvas.isDrawingMode = true;
  	};

  	const text_canvas = () =>{
  		editor.canvas.isDrawingMode = false;
    	let textbox = new fabric.IText('텍스트', {
      		width: window.innerWidth * 0.1,
      		height: window.innerHeight * 0.1
    	});

    	editor.canvas.add(textbox);
  	};

  	const image_canvas = (e) => {
  		editor.canvas.isDrawingMode = false;
    	const files = e.target.files[0];
    	let reader = new FileReader();

    	reader.onload = (e) => {
      		fabric.Image.fromURL(e.target.result, function(img){
        		let oImg = img.set().scale(0.1);
        		editor.canvas.add(oImg);
      		});
    	};
    	reader.readAsDataURL(files);
    };

  	const reload_canvas = () => {
    	fetch('/php/loadDataFromDB.php', 
    	{
      		method: "POST",
      		body: JSON.stringify({
      			title: title,
      			password: password
      		})
    	}).then(res => res.json())
    	.then(res => {
      		let original2 = res[0]["writing"].replace(/\n/g, "\\n");
      		if(original2 != original) {
      			original = original2;
      			setWriting(original);
        		editor.canvas.loadFromJSON(original, function(){
          			editor.canvas.requestRenderAll();
          			live_canvas();
        		});
      		}else{
      			live_canvas();
      		}
  		});
    };

  	const update_sql = () =>{
    	can_js = editor.canvas.toJSON();
    	original = JSON.stringify(can_js);
    	setWriting(original);

    	fetch('/php/updateDataWithFile.php', 
    	{
      		method: "PATCH",
      		body: JSON.stringify({
        		title: title,
        		password: password,
        		writing: can_js
     		})
    	}).then(res => res.json())
    	.then(res =>{
    		live_canvas();
    	});
  	};

  	const live_canvas = () =>{
  		if(types.current == false) return;
  		if(JSON.stringify(editor.canvas.toJSON()) != original) update_sql();
    	else reload_canvas();
  	};

	const imgClick = (e) =>{
		const ck = e.target.alt
		if(ck == "hand"){
			setHandclass(true);
			setPenclass(false);
			hand_canvas();
		}else if(ck == "pen"){
			setHandclass(false);
			setPenclass(true);
			pen_canvas();
		}else if(ck == "text"){
			setHandclass(true);
			setPenclass(false);
			text_canvas();
		}else if(ck == "image"){
			setHandclass(true);
			setPenclass(false);
		}
	};

	const start_canvas = () =>{
		editor.canvas.loadFromJSON(original, function(){
			editor.canvas.requestRenderAll();
		});
		reload_canvas();
		setStart(true);
	};

	const end_canvas = () =>{
		editor.canvas.clear();
		setHandclass(true);
		setPenclass(false);
		props.setType("");
		types.current = false;
	};

	fabric.Object.prototype.transparentCorners = false;

	fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    	x: 0.5,
    	y: -0.5,
    	offsetY: -16,
    	offsetX: 16,
    	cursorStyle: 'pointer',
    	mouseUpHandler: deleteObject,
    	render: renderIcon,
    	cornerSize: 24
  	});

	function deleteObject(eventData, transform){
		let target = transform.target;
		let canvas = target.canvas;
		let gao = canvas.getActiveObjects();
		if(gao.length == undefined) canvas.remove(target);
		else canvas.remove.apply(canvas, gao);
		canvas.requestRenderAll();
	};

	function renderIcon(ctx, left, top, styleOverride, fabricObject) {
    	let size = this.cornerSize;
    	ctx.save();
    	ctx.translate(left, top);
    	ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    	ctx.drawImage(img, -size/2, -size/2, size, size);
    	ctx.restore();
  	};

	window.onkeydown = (e) =>{
  		if(e.key == "Delete") {
  			if(editor.canvas.getActiveObject()["_objects"] == undefined) {
  				editor.canvas.remove(editor.canvas.getActiveObject());
  			}
  			else{
  				for(let i = 0; i < editor.canvas.getActiveObject()["_objects"].length; i++){
  					editor.canvas.remove(editor.canvas.getActiveObject()["_objects"][i]);
  				}
  			}
  		}
  	};

	return(
		<div id = "notepad">
			<h1 type="text" id = "titletext">{title}</h1>
			<div id = "xtype" onClick={end_canvas}></div>
			<div id = "check">
				<img src={hand} alt ="hand" onClick={imgClick} className={handclass ? "selected" : ""}/>
				<label className={penclass ? "selected" : ""}>
					<img src={pen} alt ="pen" onClick={imgClick}/>
					<input
						type="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
					/>
				</label>
				<img src={text} alt ="text" onClick={imgClick}/>
				<label>
					<img src={image} alt ="image" onClick={imgClick}/>
                	<input
                    	name="imgUpload"
                    	type="file"
                    	accept="image/*"
                    	id="image"
                    	onChange={image_canvas}>
                	</input>
            	</label>
			</div>
			<div id = "note">
				<FabricJSCanvas
					className="sample-canvas"
					onReady={onReady}
				/>
			</div>
		</div>
	);
}

export default Change;
