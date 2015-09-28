<%-- Include the package initialization file. --%>
<%@include file="../../../framework/includes/packageInitialization.jspf"%>
<%@include file="../../../framework/includes/serviceLanguageInitialization.jspf"%>
<%-- Include the bundle js config initialization. --%>
<%@include file="../../../../../core/interface/fragments/packageJsInitialization.jspf" %>
<%-- Include the application content. --%>
<%@include file="../../../../../core/interface/fragments/applicationHeadContent.jspf"%>
<%@include file="../../../../../core/interface/fragments/displayHeadContent.jspf"%>
<!-- Page Stylesheets -->
<link rel="stylesheet" href="<%= bundle.packagePath()%>assets/css/serviceEvents.css" type="text/css" />
<!-- Page Javascript -->
<script>
    var serviceEventsPage = true;
</script>
<script type="text/javascript" src="<%=bundle.packagePath()%>assets/js/serviceEvents.js"></script>
<%-- Include the form content, including attached css/javascript files and custom header content --%>
<%@include file="../../../../../core/interface/fragments/formHeadContent.jspf"%>
<section class="container">
    <h2 class="color-secondary"><i class="fa fa-exclaimation"></i> Alerts And Outages</h2>
    <ul class="service-list" id="service-entries"></ul>
</section>