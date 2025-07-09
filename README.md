# Repository
In this repository you will find a sample project of Angular frontend with a C# Asp.NET backend.
(Code is based on Visual Studio 2022, using the Angular and ASP.NET Core project example)
 
5 endpoints are exposed from the backend.
 
- The first endpoint fetches all available DataSets
- Second one fetches all available Groupings
- Third one fetches all available Analytics
- Fourth one fetches names for ALL nodes in a specific grouping
- Fifth one calculates one analytic for one grouping+dataset combi, and importantly, it returns data ONLY for the nodes where data can be calculated.
 
# User Requirements:
 
- Our user does not care about any ID's, only useful names, described by "DisplayName". The API's however only work with ID's.
 
- Our user is expected to work with only one DataSet at a given time, and has no need for viewing multiple datasets simultaniously.
 
- Our user expects to select exactly one grouping to use for the data
 
- Our user expects to select at least one analytic for the data
 
- Our user expects to see always the latest data at the time of using the application, but does not care if the data is updated while using the application.
 
- Our user expects to view a table, where each node has the name of the node, as well as the analytic results.
 
- Our user is interested ONLY in the nodes where at least one analytic could be calculated.
 
Individual nodes are identified by their ID (see ID field of both grouping nodes and calculate endpoints.
 
Please also note that while calculations are simulated, there is a delay of calculating analytics, simulated through Thread.Sleep.
(Also note: Running the application should lead you to a site with sample output of the different API's)
 
# Assignment:
Familiarize yourself with the API's, and write down (and submit to us) how you would approach the assignment to satisfy the user requirements above.
 
Choose one of these options for your solution:
- You can submit in writing how you would solve the assignment with a focus on explaining your thought process and considerations for the solution.
- Submit a code solution to the assignment.

At the technical interview you are expected to present your solution and talk about the choices you have made.
