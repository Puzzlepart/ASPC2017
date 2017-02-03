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

            var authenticationContext = new AuthenticationContext(aadInstance);
            ClientCredential clcred = new ClientCredential(clientId, appKey);

            var authenticationResult = authenticationContext.AcquireTokenAsync(resource, clcred);
            AuthenticationResult accessToken = authenticationResult.Result;

            dynamic invite = new ExpandoObject();
            invite.invitedUserDisplayName = "TechMikael";
            invite.invitedUserEmailAddress = "demo@techmikael.onmicrosoft.com";
            invite.inviteRedirectUrl = "https://vg.no";
            invite.sendInvitationMessage = "false";
            var payload = JsonConvert.SerializeObject(invite);

            HttpClient http = new HttpClient();
            //invite
            //HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "https://graph.microsoft.com/beta/invitations");
            //request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.AccessToken);
            //request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
            //HttpResponseMessage response = http.SendAsync(request).Result;
            //var res = response.Content.ReadAsStringAsync().Result;


            //get group
            while (true)
            {
                
            
            try
            {
                WebClient client = new WebClient();
                client.Headers.Add(HttpRequestHeader.Authorization, accessToken.CreateAuthorizationHeader());
                client.Headers.Add(HttpRequestHeader.ContentType, "application/json");
                var groupJSON = client.DownloadString("https://graph.microsoft.com/beta/groups?$filter=displayName eq 'nebuchadnezzar' or mailNickname eq 'nebuchadnezzar'");
                dynamic group = JObject.Parse(groupJSON);
                string id = group.value[0].id.ToString();
                int b = 0;

            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                
            }
            }
            //while (true)
            //{


            //    try
            //    {
            //        //WebClient client = new WebClient();
            //        //client.Headers.Add(HttpRequestHeader.Authorization, accessToken.CreateAuthorizationHeader());
            //        //client.Headers.Add(HttpRequestHeader.ContentType, "application/json");
            //        //var lala = client.DownloadString("https://graph.microsoft.com/beta/groups?$filter=displayName eq 'nebuchadnezzar' or mailNickname eq 'nebuchadnezzar'");
            //        //HttpRequestMessage request2 = new HttpRequestMessage(HttpMethod.Get, "https://graph.microsoft.com/beta/groups");
            //        //request2.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.AccessToken);
            //        //var response2 = http.SendAsync(request2).Result;
            //        //var res2 = response2.Content.ReadAsStringAsync().Result;
            //        JsonConverter.
            //        int a = 0;

            //    }
            //    catch (Exception e)
            //    {
            //        Console.WriteLine(e);

            //    }
            //}

        }

        private static async void GetAuthUrl()
        {
            AuthenticationContext authenticationContext = new AuthenticationContext(aadInstance);
            var url = await authenticationContext.GetAuthorizationRequestUrlAsync(resource, clientId, new Uri("https://appsters2017.onmicrosoft.com/doer"), UserIdentifier.AnyUser, "prompt=admin_consent");
            Console.WriteLine(url);
        }

        //private static async void AuthorizeApp()
        //{
        //    try
        //    {
        //        AuthenticationContext authenticationContext = new AuthenticationContext(aadInstance);
        //        await authenticationContext.AcquireTokenAsync(ResourceId, ClientId, RedirectUri, new PlatformParameters(PromptBehavior.Always, null));
        //    }
        //    catch (Exception)
        //    {
        //    }
        //}
    }
}
