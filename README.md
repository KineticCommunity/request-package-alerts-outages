request-Alerts_Outages
======================

Installation
============


Alerts_Outages is a utility that bridges service data. Users can subscribe to various services that will then keep the user updatred about events effecting those services in order of importance 


1. Add "Alerts_Outages" to the packages folder.


2. through Kinetic Request, create an empty service item in the catalog and set the "Display Page (JSP)" under "Advanced" tab to this package directory alerts_Outages.jsp.
	

3. import the following JS file into any files you want to host the plugin. place it below the other JS files in the document

	<script type="text/javascript" src="<%=bundle.bundlePath()%>packages/Alerts_Outages/assets/js/alertsQuery.js"></script>


4. import the following div into the HTML of the file (this will be where the plugin manifests in the HTML)

	<div id="alertsQuery"></div>


How to Use
==========

	the user accesses the alerts and outages page, clicks on the star of any services s/he wishes to subscribe to. these services can also be clicked on to expand showing greater detail.
	after subscribing, the user will be able to any events as they relate to the selected service on the page/s that have the plugin installed and can use the plugin to navigate back to the item for further detail.

