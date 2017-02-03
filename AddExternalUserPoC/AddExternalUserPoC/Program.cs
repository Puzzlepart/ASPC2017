using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using GraphFunctions;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AddExternalUserPoC
{
    class Program
    {
        private static string clientId = ConfigurationManager.AppSettings["ida:ClientId"];
        private static string appKey = ConfigurationManager.AppSettings["ida:ClientSecret"];
        private static string aadInstance = ConfigurationManager.AppSettings["ida:AADInstance"];
        private static string resource = "https://graph.microsoft.com";

        static void Main(string[] args)
        {
            GroupsHelper.InviteToGroup("Tech Mikael", "miksvenson@techmikael.onmicrosoft.com", "nebuchadnezzar").Wait();
            return;

        }

        private static async void GetAuthUrl()
        {
            AuthenticationContext authenticationContext = new AuthenticationContext(aadInstance);
            var url = await authenticationContext.GetAuthorizationRequestUrlAsync(resource, clientId,
                new Uri("https://appsters2017.onmicrosoft.com/doer"), UserIdentifier.AnyUser, "prompt=admin_consent");
            Console.WriteLine(url);
        }
    }
}
