//preforms AJAX call that sends information from alertsQuery to the host HTML file.
BUNDLE.ajax({
    type: 'GET',
    url: BUNDLE.config.displayPageUrlSlug + BUNDLE.config.packages.Alerts_Outages.links.alertingOutages.displayName + '&callback=alertsQuery',
    dataType: 'HTML',
   	success: function(data) {
    	$('#alertsQuery').append(data);
    },
    error: function(data) {
        alert('AlertsQuery callback has failed');
    }
});