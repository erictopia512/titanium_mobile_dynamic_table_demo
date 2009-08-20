<?php
	$numberrows = 7;
	$page_number = isset($_GET['page']) ? $_GET['page'] : 1;
	$offset = ($page_number - 1) * $numberrows;
	$con = mysql_connect('localhost', 'root', '');
 	mysql_select_db("table_test", $con);   	  
 	$sql = "SELECT title, tip FROM tips LIMIT $offset,$numberrows";   	  
 	$result = mysql_query($sql);   	        	  
 	$json = array();   	  
 	while ($row = mysql_fetch_array($result)) { 			  
  		$json[]=array("title"=>$row['title'],"tip"=>$row['tip'],"hasChild"=>true); 			   
  	}   
  	header("Content-Type: text/json");
	// this isn't perfect but is OK for demo
        $more = count($json) == $numberrows;
  	echo json_encode(array("rows"=>$json,"more"=>$more));
  	mysql_close($con); 
?>
