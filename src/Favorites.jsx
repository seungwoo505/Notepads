import { useState, useEffect } from 'react';

import starImg from "./image/star.png";
import unstarImg from "./image/unstar.png";
import './Favorites.css';

function Favorites(props){
	const [star, setStar] = useState();
	let s;

	const toggleStar = (e) => {
		e.stopPropagation();
		s = !star;
    	setStar(s);
    	if(s){
    		localStorage.setItem(e.target.alt, "");
    	}
    	else {
    		localStorage.removeItem(e.target.alt);
    	}
  	};
  	useEffect(() =>{
  		let c = 0;
		for(let i = 0; i < localStorage.length; i++){ 
			if (localStorage.key(i) == props.value){
				setStar(true);
				c = 1;
				break;
			}
		}
		if(c != 1) setStar(false);
  	}, [props.value]);

	return (<img src={star ? starImg : unstarImg} onClick={toggleStar} alt = {props.value} id = "star"/>);
}

export default Favorites;