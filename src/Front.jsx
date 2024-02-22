import React, { useState, useEffect } from 'react';
import './Front.css';
import Favorites from './Favorites';

function Front(props){
	const [Search_tf, setSearch_tf] = useState();
	const [titles, setTitles] = useState([]);
	const [selectT, setSelectT] = useState("");
	const [first, setFirst] = useState(true);
	let count = 0;

	const Select = (e) => {
		setSelectT(e.target.value);
	};
	const load_title = () =>{
		fetch('php/loadDataFromDB.php',
		{
			method: "POST",
			body: JSON.stringify({
				title: selectT
			})
		}).then(res => res.json())
		.then(res =>{
			if(first){
				let c = [];
				for(let j = 0; j < res.length; j++) {
					for(let i = 0; i < localStorage.length; i++) {
						if(localStorage.key(i) == res[j]['title']) {
							c = [...c, res[j]];
						}
					}
					if(localStorage.length == c.length) break;
				}
				setTitles(c);
				setFirst(false);
			}else{
				setTitles(res);
			}
		});

	};

	const create_note = () =>{
		props.setType("Create");
	}

	const check_db = (e) =>{
		let userPassword = window.prompt("비밀번호를 입력하세요: ");

		if(userPassword == titles[e.target.value]['password']){
			props.setTitle(titles[e.target.value]['title']);
			props.setPassword(titles[e.target.value]['password']);
			props.setWriting(titles[e.target.value]['writing'].replace(/\n/g, "\\n"));
			props.setType("Change");
		}else if(userPassword != null){
			if(window.confirm("비밀번호 입력을 실패했습니다.\n 다시 입력하시겠습니까?")) check_db(e);
		}
	};

	useEffect(()=>{
		load_title();
	}, [])

	return(
		<div id = "front">
			<div id ="search">
				<input type="text" placeholder="제목" id = "search_input" onChange={Select}/>
				<button id = "search_bt" onClick={load_title}>검색</button>
			</div>

			<div id = "Results">
				<ul>
					{titles.map((item)=>
						<li value = {count++} onClick={check_db}>
							<Favorites value = {item['title']}/>
							{item['title']}
						</li>
					)}
				</ul>
			</div>
			<div id = "plus" onClick={create_note}></div>
		</div>
	);
}

export default Front;
