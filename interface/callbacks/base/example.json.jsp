<%-- Include the package initialization file. --%>
<%@include file="../../../framework/includes/packageInitialization.jspf"%>
<%
    // Set the page content type, ensuring that UTF-8 is used
    response.setContentType("application/json; charset=UTF-8");
    if (context == null) {
        ResponseHelper.sendUnauthorizedResponse(response);
    } else {
        // Stuff here for your callback
    }
%>