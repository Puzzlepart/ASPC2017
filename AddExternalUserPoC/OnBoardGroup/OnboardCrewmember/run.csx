#r "GraphFunctions.dll"
using System;
using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info($"C# HTTP trigger function processed a request. RequestUri={req.RequestUri}");


    // parse query parameter
    string name = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "name", true) == 0)
        .Value;

    string email = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "email", true) == 0)
        .Value;

    string groupName = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "group", true) == 0)
        .Value;

    // Get request body
    //dynamic data = await req.Content.ReadAsAsync<object>();

    if (name == null)
    {
        return req.CreateResponse(HttpStatusCode.BadRequest, "Please pass a name on the query string or in the request body");
    }

    await GraphFunctions.GroupsHelper.InviteToGroup(name, email, groupName);

    return req.CreateResponse(HttpStatusCode.OK, "Hello " + name);
}