<?php
 
header("Content-Type: text/html; charset=UTF-8");
$bodys = file_get_contents("php://input");
$body = (array) json_decode($bodys);

$title = $body[title];
 
//MySQL DB에 접속하기
$conn=mysqli_connect("seungwoo.i234.me","seungwoo","Seungwoo50500.*.*","project", "3300");
 
//한긓깨짐 방지
mysqli_query($conn,"set names utf8");
 
//DB에서 데이터를 읽어오는 쿼리문
$sql="SELECT * FROM notepad WHERE title LIKE '$title%'";
$result=mysqli_query($conn, $sql);

$rowCount= mysqli_num_rows($result);
$arr_db = array();

for($i=0; $i < $rowCount; $i++){
    $row= mysqli_fetch_array($result, MYSQLI_ASSOC);
    array_push($arr_db, $row);
}

echo json_encode($arr_db);
 
//$result는 결과 데이터들을 가지고 있는 테이블(표)
/*
//총 레코드 수(행의 개수, 줄수)
$rowCount= mysqli_num_rows($result);

echo "데이터 베이스에서 가져온 총 개수는 $rowCount 입니다";
 
for($i=0;$i<$rowCount;$i++){
    $row= mysqli_fetch_array($result, MYSQLI_ASSOC); //php는 배열이 두 종류가 있다. 
    //연관 배열로 한줄 데이터 얻어오기.
 
    echo "$row[title] <br/>";
    echo "<h2>$row[password] </h2>";
    echo "$row[writing] <br/>";
 
    echo "<img src='$row[image]'> <br/>";
    echo "------------------ <br/><br/>";
}*/
 
mysqli_close($conn);
 
?>