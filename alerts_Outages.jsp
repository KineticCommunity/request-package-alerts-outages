<% 
    // Define the current servlet path for Bundle to use for package context within the layout
    request.setAttribute("lastForwardServletPath", request.getServletPath());
    // Define dispatcher to forward to the desired layout
    RequestDispatcher dispatcher = request.getRequestDispatcher("../../common/interface/layouts/layout.jsp");
    // Forward
    dispatcher.forward(request, response);
    // Return to ensure nothing else is processed
    return;
%>