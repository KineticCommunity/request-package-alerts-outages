request-Alerts_Outages
======================

1. Install Kinetic Helper


2. (Optional) access the Data Management Console for easy data editing. This data is accessed through a bridge on the bundles server. (Local
	ARS Server)
	DMC Documentation found at:

	http://community.kineticdata.com/10_Kinetic_Request/KAPPs/The_Data_Management_Console/Data_Management_Console


3. Required foundation data:
	this plugin application requires the inclusion of service, service event, and status level data.


4. Drop "Alerts_Outages" into the bundle's packages folder.
	

5. paste the following script tag into the file you want integrated with the plugin

	<script type="text/javascript" src="<%=bundle.bundlePath()%>packages/Alerts_Outages/assets/js/alertsQuery.js"></script>


6. pass the following div into the HTML where you would like the plugin to appear 

	<div id="alertsQuery"></div>


7. Status colors are inline styles linked to a database object property. status colors can be sorted by either color name or by hex code. 
	if a chosen color is not available by name, the equivalent hex code may be found at the adress below.
	
	http://www.color-hex.com
