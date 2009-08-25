// TODO: set this URL to your test webservice
var URL = "http://localhost/";

window.onload = function()
{
	// create an activity indicator that will show will we fetch
	// the initial data load
	var ind = Titanium.UI.createActivityIndicator({
		id:'splash',
		color:'#000'
	});
	ind.setMessage('Loading remote data ...');
	ind.show();
	
	// keep an array of title to tips
	var tips = {};
	
	// default page we start at is 1
	var page = 1;
	
	// we keep a count of the number of rows we have in the table
	var count = 0;
	
	// fetch row will be responsible for calling an AJAX request to fetch
	// the rows, page-by-page.
	function fetchRows()
	{
		var xhr = Titanium.Network.createHTTPClient();
		// Work around for missing onload function in Android 0.6.2 and earlier.
		if (xhr.onload == undefined) {
			xhr.onreadystatechange = function() { if (this.readyState == 4) { this.onload(); }};
		}
		xhr.onload = function()
		{
			// convert the response JSON text into a JavaScript object
			var json = eval('(' + this.responseText + ')');
			
			// pull out the rows property which should return an array of rows
			var rows = json['rows'];
			
			// this is a subsequent page, we need to update
			if (page>1)
			{
				// figure out our last row
				var idx = count - 1;
				// remove the "Loading..." row
				tableView.deleteRow(idx);
				// for each new row, add
				for (var c=0;c<rows.length;c++,count++,idx++)
				{
					// record our new tip by title
					tips[rows[c].title]=rows[c].tip;
					// insert a new row
					tableView.insertRowAfter(idx-1,rows[c]);
				}
				// if we have more data still, add a More button that will fetch
				if (json['more'])
				{
					tableView.insertRowAfter(count-2,{'title':'More...'});				
				}
			}
			else
			{
				// map our tips by title
				for (var c=0;c<rows.length;c++)
				{
					tips[rows[c].title]=rows[c].tip;
				}
				// create a more row button
				rows.push({'title':'More...'});
				// since this is the first page, just set the data since we started out empty
				tableView.setData(rows);
				// on the first time, we need to show the table view
				Titanium.UI.currentWindow.showView(tableView);
				// record the initial count
				count = rows.length;
				// hide the indicator
				ind.hide();
			}
			// after we fetch the page, increment 
			page++;
		};
		// change this to the URL to your test webservice
		xhr.open("GET",URL + "?page="+page);
		xhr.send(null);
	}
	
	// create an empty table view
	var tableView = Titanium.UI.createTableView({data:[]},function(e)
	{
		// if the title of the row is more, we need to fetch more data
		if (e.rowData.title == 'More...')
		{
			// update the row from More... to a ajax spinner and loading message
			// in this case, since we're using an animated gif, let's just use HTML to style the row 
			tableView.updateRow(e.index,{'html':'<img src="ajax.gif"> <span style="font-weight:bold;font-family:arial;font-size:20px;">Loading...</span>'},{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.UP});				
			// start the fetch
			fetchRows();
		}
		else
		{
			// in this case, we clicked on a row
			// pull out the title and then get the tip from the title
			Titanium.App.Properties.setString("title",e.rowData.title);
			Titanium.App.Properties.setString("tip",tips[e.rowData.title]);
			// open the new window which will display our tip
			var w = Titanium.UI.createWindow({url:'detail.html','barColor':'#000'});
			w.open({animated:true});
		}
	});
	
	// add the table view (but don't show it) to the window's views array
	Titanium.UI.currentWindow.addView(tableView);	
	
	// start the initial data fetch
	fetchRows();
};