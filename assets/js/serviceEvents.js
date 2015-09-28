(function($, _) {
    /*----------------------------------------------------------------------------------------------
     * DOM MANIPULATION AND EVENT REGISTRATION
     *   This section is executed on page load to register events and otherwise manipulate the DOM.
     *--------------------------------------------------------------------------------------------*/
    $(function() {
		if(typeof serviceEventsPage !== "undefined"){
			BUNDLE.package.loadServiceConfiguration(populateAllServices);
		}
		$('body').on('click touchstart','i.fa-star', function(event){
			event.stopImmediatePropagation();
            $(this).toggleClass("fa-star-o fa-star");
            //defines variables to be passed into the ajax call
            var myObj = $(this);
            var serviceId = $(this).data('id');
            var url = BUNDLE.config.alertsUrl + '&callback=updateSubscription';
            var service = '["Inactive","'+serviceId+'"]';
            //changes subscription status in the datrabase to "inactive"
                BUNDLE.ajax({
                    url: url,
                    dataType: "json",
                    data : {"service": service},
                    success: function(data, textStatus, jqXHR) {
                    	console.log('selected', data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        myObj.toggleClass("fa-star-o fa-star");
                        alert("Your subscription didn't save. " +errorThrown);
                    }
                });
        });
        $('body').on('click touchstart', 'i.fa-star-o', function(event){
			event.stopImmediatePropagation();
            $(this).toggleClass("fa-star-o fa-star");
            //defines variables to be passed into the ajax call
            var myObj = $(this);
            var serviceId = $(this).data('id');
            var url =  BUNDLE.config.alertsUrl + '&callback=updateSubscription';
            var service = '["Active","'+serviceId+'"]';
            //changes subscription status in the datrabase to "active"
                BUNDLE.ajax({
                    url: url,
                    dataType: "json",
                    data : {"service": service},
                    success: function(data, textStatus, jqXHR) {
                    	console.log('selected', data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        myObj.toggleClass("fa-star-o fa-star");
                        alert("Your subscription didn't save. " +errorThrown);
                    }
                });
        });
    });
    
    /*----------------------------------------------------------------------------------------------
     * PACKAGE INIALIZATION
     *   This code is executed when the Javascript file is loaded
     *--------------------------------------------------------------------------------------------*/
    
    // Ensure the BUNDLE global object exists
    BUNDLE = BUNDLE || {};
    // Create the package namespace
    BUNDLE.package = BUNDLE.package || {};
    // Create a scoped alias to simplify references
    var package = BUNDLE.package;
	// Create the serviceEvents namespace
	BUNDLE.package.serviceEvents = BUNDLE.package.serviceEvents || {};

	package.loadServiceConfiguration = function(callback){
		//Populate Service Events
		var attributes = ["Index","ID","Event End Date", "Event Notes", "Event Service", "Event Start Date", "Event Status Level","Event Summary","Service Description","Service Name","Status Color", "Status Level", "Status Icon", "Status Priority"];
		KD.utils.ClientManager.init();
		var connector = new KD.bridges.BridgeConnector({templateId: BUNDLE.config.commonTemplateId}); 
		var parameters = new Object({'User Id':BUNDLE.config.user});
		connector.search('Service Events', 'All Active', {
				attributes: attributes,
				metadata: { "order": [encodeURIComponent('<%=attribute["Index"]%>:ASC')] },
				parameters: parameters,
				success: function(list) {
					package.serviceEvents = package.serviceEvents || {};
					if(list.records.length > 0) {
						// Map events, statuses and services
						$.each(list.records, function(index,record){
							if(record.attributes.Index === 'Service Events'){
								package.serviceEvents[record.attributes.Index] = package.serviceEvents[record.attributes.Index] || {};
								package.serviceEvents[record.attributes.Index][record.attributes["Event Service"]] = package.serviceEvents[record.attributes.Index][record.attributes["Event Service"]] || [];
								package.serviceEvents[record.attributes.Index][record.attributes["Event Service"]].push(record);
							} else {
								package.serviceEvents[record.attributes.Index] = package.serviceEvents[record.attributes.Index] || [];
								package.serviceEvents[record.attributes.Index].push(record);
							}
						});
						if(callback != null){
							callback();
						}
					}
				},
				failure: function(arg) {
					package.serviceEvents = package.serviceEvents || {};
					// Display error message
					package.serviceEvents["Error"] = arg.responseMessage;
				}
		});
	}
	/**
	 * Grab all the events for a particular event
	**/
	function populateServiceEventHistory(serviceId,element){
		//Populate Service Events
		var attributes = ["Index","ID","Event End Date","Event Notes","Event Service","Event Start Date","Event Status Level","Event Summary"];
		KD.utils.ClientManager.init();
		var connector = new KD.bridges.BridgeConnector({templateId:clientManager.templateId}); 
		var parameters = new Object({'ServiceId':serviceId});
		connector.search('Service Events', 'By Service Id', {
				attributes: attributes,
				metadata: { "order": [encodeURIComponent('<%=attribute["Event Status Level"]%>:ASC')] },
				parameters: parameters,
				success: function(data) {
					// Loop through events and display upcoming events
					$(element).empty();
					if(data.metadata.count > 0){
						$.each(data.records, function(index,record){
							var now = moment();
							var startDate = record.attributes["Event Start Date"];
							var endDate = record.attributes["Event End Date"];
							if(startDate.length > 0) { var start = moment(record.attributes["Event Start Date"]); }
							if(endDate.length > 0) { var end = moment(record.attributes["Event End Date"]); }
							if(start.diff(now) > 0){
								var eventLi = $('<li>').addClass('service-item').append(

									$('<div>').addClass('future-time col-lg-4 col-sm-12').append(
										$('<i>').addClass('fa fa-clock-o label').text(' Start: '),
										$('<span>').text(moment(start).format("LLLL"))
									),
									$('<div>').addClass('future-time col-lg-4 col-sm-12').append(
										$('<i>').addClass('fa fa-clock-o label').text(' End: '),
										$('<span>').text(moment(end).format("LLLL"))
									),
									$('<div>').addClass('future-type col-lg-12 col-sm-12').append(
										$('<span>').addClass('type').text(record.attributes["Event Summary"])
									),
									$('<div>').addClass('future-note col-lg-12 col-sm-12').text(record.attributes["Event Notes"])
								)
								// Get status information from map
								$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
									if(record.attributes["Event Status Level"] === lrec.attributes["ID"]){
										eventLi.prepend($('<i>').addClass('theme'+ lrec.attributes["Status Color"].toLowerCase() +' fa pull-left future-state').addClass(lrec.attributes["Status Icon"] + '-circle'))
									}
								});
								element.append(eventLi);
							}
						});
					}
				},
				failure: function(arg) {
					package.serviceEvents = package.serviceEvents || {};
					// Display error message
					package.serviceEvents["Error"] = arg.responseMessage;
				}
		});
	}
	
	/**
     * Populates the service events on the catalog page
     * @returns {undefined}
     */
	function populateAllServices(){
		// Hide loader
		$('#loader').hide();
		// set common vars
		var eventsObj = BUNDLE.package.serviceEvents["Service Events"] || null;
		var servicesObj = BUNDLE.package.serviceEvents["Service"] || null;
		var statusObj = BUNDLE.package.serviceEvents["Service Status Level"] || null;
		var subscriptionObj = BUNDLE.package.serviceEvents["Service Subscription"] || null;
		
		if(servicesObj == null){
			$('#service-entries').append('<strong>Coming Soon</strong>');
		}
		else {
			// Loop through services
			$.each(servicesObj, function(index,record){
				// Create event element
				var serviceLi = $('<li>').addClass('service-item').attr('data-id',record.attributes["ID"]);
				var serviceEvent = $('<div>').addClass('row');
				var star = "fa-star-o";
				if(subscriptionObj != null){
					$.each(subscriptionObj,function(i,obj){
						if(obj.attributes["Service Name"] === record.attributes["ID"]){
							star = "fa-star";
						}
					});
				}
				serviceEvent.append(
					$('<div>').addClass('service-state'),
					$('<div>').addClass('service-name col-lg-4 col-sm-6 col-xs-12').append(
						$('<span>').addClass('name').text(record.attributes["Service Name"])
					),
					$('<div>').addClass('service-time col-lg-2 col-sm-6 col-xs-12').append(
						$('<div>').addClass('divider hidden-md hidden-sm hidden-xs'),
						$('<i>').addClass('fa fa-clock-o'),
						$('<span>').addClass('time')
					),
					$('<div>').addClass('service-type col-lg-6 col-sm-12').append(
						$('<div>').addClass('divider hidden-md hidden-sm hidden-xs'),
						$('<span>').addClass('type')
					),
					$('<div>').addClass('favorite-star').append(
						$('<i>').addClass('favorite fa fa-lg ' + star).attr({
							'data-id':record.attributes["ID"],
							'title' : 'Subscribe'
							})
					)
				);
				serviceLi.append(serviceEvent);
				serviceLi.append(
					$('<div>').addClass('row details').css('display','none')
				)
				// Add on click event
				serviceLi.on("click", '.service-name, .service-time, .service-type',function(){
					$(this).parent().siblings('div.row.details').slideToggle();
					var element = $(this).parent().siblings(".row.details").find("ul.history-body");
					populateServiceEventHistory($(this).closest("li").data("id"),element);
				});
				//  Add description
				serviceLi.find('div.row.details').append(
					$('<div>').addClass('service-description').text(record.attributes["Service Description"]).prepend(
						$('<i>').addClass('fa fa-info-circle fa-lg')
					)
				)
				// Create Notes container
				var notes = $('<div>').addClass('col-lg-4 col-sm-12 col-xs-12').append(
									$('<div>').addClass('widget notes summary').append(
										$('<div>').addClass('widget-header').append(
											$('<span>').addClass('widget-caption')
										)
									),
									$('<div>').addClass('widget notes started').append(
										$('<div>').addClass('widget-header').append(
											$('<i>').addClass('widget-icon fa fa-clock-o themeprimary'),
											$('<span>').addClass('widget-caption').text('Reported: '),
											$('<span>').addClass('widget-caption start-time')
										)
									),
									$('<div>').addClass('widget notes end-estimate').append(
										$('<div>').addClass('widget-header').append(
											$('<i>').addClass('widget-icon fa fa-clock-o themeprimary'),
											$('<span>').addClass('widget-caption').text('Estimated Resolution: '),
											$('<span>').addClass('widget-caption time').text('Unknown')
										)
									),
									$('<div>').addClass('widget notes').append(
										$('<div>').addClass('widget-header bordered-bottom bordered-themeprimary').append(
											$('<i>').addClass('widget-icon fa fa-edit themeprimary'),
											$('<span>').addClass('widget-caption').text('Notes')
										),
										$('<div>').addClass('widget-body')
									)
								)

				// Create Upcoming and History container that will be paired with a Notes container
					var upcomingNotesPaired = $('<div>').addClass('col-lg-8 col-sm-12 col-xs-12').append(
						$('<div>').addClass('widget upcoming').append(
							$('<div>').addClass('widget-header bordered-bottom bordered-themeprimary').append(
								$('<i>').addClass('widget-icon fa fa-tasks themeprimary'),
								$('<span>').addClass('widget-caption themeprimary').text('Upcoming Events')
							),
							$('<div>').addClass('widget-body').append(
								$('<ul>').addClass('upcoming-body'),
								$('<ul>').addClass('history-body')
							)
						)
					)

				// Create Upcoming and History container that will not be paired with a Notes container
					var upcomingUnpaired = $('<div>').addClass('col-lg-12 col-sm-12 col-xs-12').append(
						$('<div>').addClass('widget upcoming').append(
							$('<div>').addClass('widget-header bordered-bottom bordered-themeprimary').append(
								$('<i>').addClass('widget-icon fa fa-tasks themeprimary'),
								$('<span>').addClass('widget-caption themeprimary').text('Upcoming Events')
							),
							$('<div>').addClass('widget-body').append(
								$('<ul>').addClass('upcoming-body'),
								$('<ul>').addClass('history-body')
							)
						)
					)
				
				// Create count var to check if current events for service;
				var count = 0;
				// Check if service has events associated
				if(eventsObj != null && typeof eventsObj[record.attributes.ID] != "undefined" && eventsObj[record.attributes.ID].length > 0) {
					// loop through the events for this service
					$.each(eventsObj[record.attributes.ID], function(idx,rec){
						// Date compare variables
						var now = moment();
						var startDate = rec.attributes["Event Start Date"];
						var endDate = rec.attributes["Event End Date"];
						if(startDate.length > 0) { var start = moment(rec.attributes["Event Start Date"]); }
						if(endDate.length > 0) { var end = moment(rec.attributes["Event End Date"]); }
						// Check if event date is current or in the future
						if(start.diff(now) < 0 && (endDate.length < 1 || end.diff(now) > 0)){
							// Add Notes
							var eventNote = notes.clone()
							eventNote.find('.widget.notes.summary span.widget-caption').text(rec.attributes["Event Summary"]);
							eventNote.find('.widget.notes.started  span.widget-caption.start-time').text(moment(start,"YYYYMMDD").fromNow());
							eventNote.find('div.widget-body').text(rec.attributes["Event Notes"]);
							// Update color for each current event
							$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
								if(rec.attributes["Event Status Level"] === lrec.attributes["ID"]){
									eventNote.find('.widget.notes.summary span.widget-caption').prepend($('<i>').addClass('widget-icon themeprimary fa').addClass(lrec.attributes["Status Icon"] + '-circle'))
									eventNote.find('.bordered-themeprimary').toggleClass('bordered-theme'+lrec.attributes["Status Color"].toLowerCase() + ' bordered-themeprimary');
									eventNote.find('.themeprimary').toggleClass('theme'+lrec.attributes["Status Color"].toLowerCase() + ' themeprimary');
								}
							});

							// Add estimated end date/time
							if(endDate.length > 0) {
								eventNote.find('div.end-estimate div.widget-header span.widget-caption.time').text(moment(end,"YYYYMMDD").fromNow())
							} 
							if(count === 0){
								// Add time event started
								serviceLi.find('div.service-time span.time').text(moment(start,"YYYYMMDD").fromNow());
								// Add event summary
								serviceLi.find('div.service-type span.type').text(rec.attributes["Event Summary"]);
								// Get status information from map
								$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
									if(rec.attributes["Event Status Level"] === lrec.attributes["ID"]){
										serviceLi.find('div.service-state').addClass('bg-' + lrec.attributes["Status Color"].toLowerCase()).append(
											$('<i>').addClass('fa').addClass(lrec.attributes["Status Icon"])
										);
										serviceLi.attr('data-sort',lrec.attributes["Status Priority"]);
									}
								});
							}
							serviceLi.find('div.row.details').append(eventNote);
							count++;
						}
					});

					serviceLi.find('div.row.details').append(upcomingNotesPaired);
					$('#service-entries').append(serviceLi);
				}
				// Check if any events and if not create default status for service
				if(count < 1){
					$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
						if(lrec.attributes["Status Priority"] == 0){
							// Add default status
							serviceLi.find('div.service-state').addClass('bg-' + lrec.attributes["Status Color"].toLowerCase()).append(
								$('<i>').addClass('fa').addClass(lrec.attributes["Status Icon"])
							);
							serviceLi.attr('data-sort','99999');
						}
					});
					// Add notes
					serviceLi.find('div.row.details').append(upcomingUnpaired);
					$('#service-entries').append(serviceLi);
				}
			});	

			// Sort current events
			var sort_by_priority = function(a, b) {
				return a.dataset.sort.localeCompare(b.dataset.sort);
			}
			var list = $("#service-entries>li").get();
			list.sort(sort_by_priority);
			for (var i = 0; i < list.length; i++) {
				list[i].parentNode.appendChild(list[i]);
			}
			// get url params and look for id to trigger click
			var urlParameters = BUNDLE.common.getUrlParameters();
			if(typeof urlParameters.id != "undefined") {
				$('body').find('li[data-id='+urlParameters.id+'] .service-name').trigger('click');
			}
		}
	}
	

		/**
     * Populates the service events on the catalog page
     * @returns {undefined}
     */
	populateServiceStatus = function(){
		if(typeof BUNDLE.package.serviceEvents != "undefined"){
			// Hide loader
			$('#loader').hide();
			// set common vars
			var eventsObj = BUNDLE.package.serviceEvents["Service Events"] || null;
			var servicesObj = BUNDLE.package.serviceEvents["Service"] || null;
			var statusObj = BUNDLE.package.serviceEvents["Service Status Level"] || null;
			var subscriptionsObj = BUNDLE.package.serviceEvents["Service Subscription"] || null;
			
			if(servicesObj == null){
				$('#service-entries').append('<strong>Coming Soon</strong>');
			}
			else if(subscriptionsObj == null) {
				$('#service-entries').append('<strong>No subscribed services</strong>');
			}
			else {
				// Loop through subscriptions and make a hash
				var subscribed = {};
				$.each(subscriptionsObj, function(i,obj){
					subscribed[obj.attributes["Service Name"]] = true;
				});
				// Loop through services
				$.each(servicesObj, function(index,record){
					// check if subscribed
					if(subscribed[record.attributes.ID]){
						// Create event element
						var serviceEvent = $('<a>').addClass('list-group-item')
														.attr('href',BUNDLE.config.catalogUrl + '&view=serviceEvents&id=' + record.attributes.ID )
														.text(record.attributes["Service Name"]);
						// Create count var to check if current events for service;
						var count = 0;
						// Check if service has events associated
						if(eventsObj != null && typeof eventsObj[record.attributes.ID] != "undefined" && eventsObj[record.attributes.ID].length > 0) {
							// loop through the events for this service
							$.each(eventsObj[record.attributes.ID], function(idx,rec){
								// Date compare variables
								var now = moment();
								var startDate = rec.attributes["Event Start Date"];
								var endDate = rec.attributes["Event End Date"];
								if(startDate.length > 0) { var start = moment(rec.attributes["Event Start Date"]); }
								if(endDate.length > 0) { var end = moment(rec.attributes["Event End Date"]); }
								// Check if event date is current or in the future
								if((startDate.length > 0 && start.diff(now) < 0) && (endDate.length < 1 || end.diff(now) > 0 )){
									count++;
									//Create clone of service for multiple events
									var serviceEventClone = serviceEvent.clone();
									serviceEventClone.append(
										$('<em>').addClass('pull-right text-muted small').text(rec.attributes["Event Summary"])
									);
									// Get status information from map
									$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
										if(rec.attributes["Event Status Level"] === lrec.attributes["ID"]){
											serviceEventClone.prepend(
												$('<i>').addClass('fa fa-circle fa-fw').css('color',lrec.attributes["Status Color"].toLowerCase())
											);
											serviceEventClone.attr('data-sort',lrec.attributes["Status Priority"]);
										}
									});
									// Add element to the ui
									$('#service-entries').append(serviceEventClone);
								}
							});
						}
						// Check if any events and if not create "green/up/good" status for service
						if(count < 1){
							$.each(BUNDLE.package.serviceEvents["Service Status Level"], function(lidx,lrec){
								if(lrec.attributes["Status Priority"] == 0){
									serviceEvent.prepend(
												$('<i>').addClass('fa fa-circle fa-fw').addClass(lrec.attributes["Status Color"].toLowerCase())
											);
									serviceEvent.attr('data-sort',lrec.attributes["Status Priority"]);
								}
							});
							$('#service-entries').append(serviceEvent);
						}
					}
				});	
				var sort_by_priority = function(a, b) {
					if(a.dataset.sort === "0"){a.dataset.sort = 99999999}
					if(b.dataset.sort === "0"){b.dataset.sort = 99999999}
					return a.dataset.sort.localeCompare(b.dataset.sort);
				}

				var list = $("#service-entries > a").get();
				list.sort(sort_by_priority);
				for (var i = 0; i < list.length; i++) {
					list[i].parentNode.appendChild(list[i]);
				}
			}
		} else {
			setTimeout(function(){
				populateServiceStatus()
			}, 500);
		}
	}

})(jQuery, _);