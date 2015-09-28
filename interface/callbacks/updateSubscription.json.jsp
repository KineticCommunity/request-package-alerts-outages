<%-- Include the package initialization file. --%>
<%@include file="../../framework/includes/packageInitialization.jspf"%>
<%
	// Set the page content type, ensuring that UTF-8 is used
    response.setContentType("application/json; charset=UTF-8");
    if (context == null) {
        ResponseHelper.sendUnauthorizedResponse(response);
    } else {
		JSONArray jsonInput = (JSONArray)JSONValue.parse(request.getParameter("service"));
		for (int i = 0; i < jsonInput.size(); i++) {
			String serviceStatus = (String)jsonInput.get(0);
			String serviceId = (String)jsonInput.get(1);
			ServiceEventsSubscription.saveSubscription(context, serviceStatus, serviceId);
		}
		out.println("{\"msg\": \"save successful\"}");
    }
%>