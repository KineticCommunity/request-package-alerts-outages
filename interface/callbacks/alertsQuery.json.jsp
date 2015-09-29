<!-- For content to be modified it must be hosted on the same server as this application-->
<!-- calls required package components -->
<%@include file="../../framework/includes/packageInitialization.jspf"%>

<%
    if (context == null) {
        ResponseHelper.sendUnauthorizedResponse(response);
    } else {
        //builds bridge accessing provided information
        String id = request.getParameter("Id");
        String templateId = bundle.getProperty("commonTemplateId");
        BridgeConnector connector = new KsrBridgeConnector(context, templateId);
        Map<String, String> parameters = new java.util.HashMap<String, String>();
        parameters.put("User Id", context.getUserName());
        String[] attributes = new String[]{"Index","ID","Event End Date", "Event Notes", "Event Service", "Event Start Date", "Event Status Level","Event Summary","Service Description","Service Name","Status Color", "Status Level", "Status Icon", "Status Priority"};
        Map<String, String> metadata = new java.util.HashMap<String, String>();
        metadata.put("order","<"+"%=attribute[\"Index\"]%"+">:ASC");
        // eventRecords stores all information recieved from the Bridge
        RecordList eventRecords = connector.search("Service Events", "All Active", parameters, metadata, attributes);
        // serviceEventList stores service events from eventRecords
        Map<String, List<Record>> serviceEventList = new java.util.HashMap<String, List<Record>>();
        // servicesObj stores service objects from eventRecords
        Map<String, Record> servicesObj = new java.util.HashMap<String, Record>();
        // priorityStatusMap stores service status level objects from eventRecords and sorts them by priority
        Map<String, Record> priorityStatusMap = new java.util.HashMap<String, Record>();
        // statusIdMap stores service status level objects from eventRecords and sorts them by status id
        Map<String, Record> statusIdMap = new java.util.HashMap<String, Record>();
        // subscriptionObj stores services that the user has subscribed too
        List<Record> subscriptionObj = new ArrayList<Record>();

        //divides information provided by the bridge into individual maps / lists
        for (Record event : eventRecords){
            if(event.get("Index").equals("Service Events")){
                if (!serviceEventList.containsKey(event.get("Event Service"))){
                    serviceEventList.put(event.get("Event Service"), new ArrayList<Record>());
                }
                serviceEventList.get(event.get("Event Service")).add(event);
            } else if (event.get("Index").equals("Service")){
                servicesObj.put(event.get("ID"), event);
            } else if (event.get("Index").equals("Service Status Level")){
                priorityStatusMap.put(event.get("Status Priority"), event);
                statusIdMap.put(event.get("ID"), event);
            } else if (event.get("Index").equals("Service Subscription")){
                subscriptionObj.add(event);
            }
        }

        //builds map that will contain objects ordered by priority
        Map<String, List<Record>> priorityMap = new java.util.TreeMap<String, List<Record>>();
%>
<!-- fills application with content -->
        <div class="alertsAndOutages">
            <ul class="service-list unstyled" id="service-entries">
                <%if(servicesObj.isEmpty()){%>
                    <li><strong><%=themeLocalizer.getString("No Services Found")%></strong></li>
                <%} else if(subscriptionObj.isEmpty()){%>
                    <li><strong><%=themeLocalizer.getString("No subscribed services")%></strong></li>
                <%} else {
                    // declares a list of services for current user
                    List<String> subscribedList = new ArrayList<String>();
                    //loop through subscription data from bridge and add ID of the service
                    for (Record subscription : subscriptionObj){
                        subscribedList.add(subscription.get("Service Name"));
                    }
                    //defines a date formatting function
                    DateFormat formatedDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ", Locale.ENGLISH);
                    //checks if services and events are linked to a subscription
                    for (String serviceId: subscribedList){
                        Record service = servicesObj.get(serviceId);
                        List<Record> events = serviceEventList.get(serviceId);
                        if (events == null || events.isEmpty()){
                            //if record is at priority "0" places service in an array list
                            if (!priorityMap.containsKey("0")){
                                priorityMap.put("0", new ArrayList<Record>());
                            }
                            priorityMap.get("0").add(service);
                        } else {
                            //declares variables
                            Record placeholderEvent = null;
                            for (Record newEvent: events){
                                Date start = null;
                                Date end = null;
                                Boolean isValid = null;
                                // calls stringified date and parses
                                if(StringUtils.isNotBlank(newEvent.get("Event Start Date"))){
                                    start = formatedDate.parse(newEvent.get("Event Start Date"));
                                }
                                if(StringUtils.isNotBlank(newEvent.get("Event End Date"))){
                                    end = formatedDate.parse(newEvent.get("Event End Date"));
                                }
                                //checks parsed date against current date to see if associated service is valid
                                if (start != null && start.before(new Date()) && (end == null  || end.after(new Date()))){
                                    isValid = true;
                                }else {
                                    isValid = false;
                                }
                                if (isValid == true){
                                    //sets placeholderEvent value
                                    if (placeholderEvent == null){
                                        placeholderEvent = newEvent;
                                    } else {
                                    //retrieves the priority level of newEvent and placeholderEvent
                                        int currentPriority = Integer.parseInt(statusIdMap.get(newEvent.get("Event Status Level")).get("Status Priority"));
                                        int placeholderPriority = Integer.parseInt(statusIdMap.get(placeholderEvent.get("Event Status Level")).get("Status Priority"));
                                        //replaces the placeholderEvent event with the newEvent if it is of lower priority
                                        if (currentPriority < placeholderPriority){
                                            placeholderEvent = newEvent;
                                            //replaces the placeholderEvent event with the newEvent if the newEvent was creatred more recently
                                        } else if  (currentPriority == placeholderPriority){
                                            if (Integer.parseInt(newEvent.get("Event Start Date")) < Integer.parseInt(placeholderEvent.get("Event Start Date"))){
                                                placeholderEvent = newEvent;
                                            }
                                        }
                                    }
                                }
                            }
                            if (placeholderEvent == null){
                            //if record is at priority "0" places it in an array list
                                if (!priorityMap.containsKey("0")){
                                    priorityMap.put("0", new ArrayList<Record>());
                                }
                                //sets placeholderEvent value and adds Service Item
                                priorityMap.get("0").add(service);
                            }else {
                            //retrieves priority level of event in status map
                                String priority = statusIdMap.get(placeholderEvent.get("Event Status Level")).get("Status Priority");
                                if (!priorityMap.containsKey(priority)){
                                        priorityMap.put(priority, new ArrayList<Record>());
                                    }
                                //adds placeholderEvent to priority map
                                priorityMap.get(priority).add(placeholderEvent);
                            }
                        }
                    }
                    for (Map.Entry<String, List<Record>> entry : priorityMap.entrySet()){
                        String priority = entry.getKey();
                        DateFormat limitedDateFormat = new SimpleDateFormat("dd-MM-yyyy");
                        // checks to see if service items are not equal to priority level "0"
                        if (!StringUtils.equals(priority, "0")){
                            List<Record> eventList = entry.getValue();
                            //displays the service items in order of priority
                            for(Record eventItem : eventList){
                                %>
                                    <li>
                                        <a class="list-group-item" href='<%=bundle.getProperty("alertsUrl")%>&view=serviceEvents&id=<%=eventItem.get("ID")%>'>
                                            <div class="inline clearfix">
                                                <div class="col-xs-8">
                                                    <i class="fa fa-circle fa-fw" style='color:<%=priorityStatusMap.get(priority).get("Status Color").toLowerCase()%>'></i>
                                                    <%=themeLocalizer.getString(servicesObj.get(eventItem.get("Service Name")).get("Service Name"))%>
                                                </div>
                                                <div class="pull-right col-xs-4 text-muted small">
                                                    <%=themeLocalizer.getString(eventItem.get("Event Summary"))%>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                <%
                            }
                        }
                    }
                    List<Record> upServices = priorityMap.get("0");
                    for(Record serviceItem : upServices){
                        //displays the service items of lowest priority
                        if(serviceItem != null){
                            %>
                                <li>
                                    <a class="list-group-item" href='<%=bundle.getProperty("alertsUrl")%>&view=serviceEvents&id=<%=serviceItem.get("ID")%>'>
                                        <div class="inline clearfix">
                                            <div class="col-xs-12">
                                                <i class="fa fa-circle fa-fw" style='color:<%=priorityStatusMap.get("0").get("Status Color").toLowerCase()%>'></i>
                                                <%=themeLocalizer.getString(serviceItem.get("Service Name"))%>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            <% 
                        }
                    }
                }%>
            </ul>
        </div>
    <%}
%>