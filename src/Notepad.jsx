import React, { useState, useEffect, useRef } from 'react';
import './Front.css';
import './Notepad.css';
import Front from './Front';
import Create from './Create';
import Change from './Change';

function Notepad(props){
	const [type, setType] = useState(props.type);
	const [title, setTitle] = useState("");
	const [password, setPassword] = useState("");
	const [writing, setWriting] = useState("");

	if(type == "Create"){
		return(<Create type={type} setType={setType}/>);
	}else if(type == "Change") {
		return(<Change type={type} setType={setType} title={title} password={password} writing={writing}/>);

	}else {
		return(<Front type={type} setType={setType} setTitle={setTitle} setPassword={setPassword} setWriting={setWriting}/>);
	}
}

export default Notepad;