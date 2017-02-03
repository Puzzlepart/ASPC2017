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
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GraphFunctions
{
    public class GroupsHelper
    {
        private static readonly string ClientId = ConfigurationManager.AppSettings["ida:ClientId"];
        private static readonly string AppKey = ConfigurationManager.AppSettings["ida:ClientSecret"];
        private static readonly string AadInstance = ConfigurationManager.AppSettings["ida:AADInstance"];
        private static readonly string Resource = "https://graph.microsoft.com";
        public static async Task InviteToGroup(string name, string email, string groupName)
        {
            var authenticationContext = new AuthenticationContext(AadInstance);
            ClientCredential clcred = new ClientCredential(ClientId, AppKey);

            var authenticationResult = await authenticationContext.AcquireTokenAsync(Resource, clcred);
            AuthenticationResult accessToken = authenticationResult;

            // Get the group/ship
            WebClient client = new WebClient();
            client.Headers.Add(HttpRequestHeader.Authorization, accessToken.CreateAuthorizationHeader());
            client.Headers.Add(HttpRequestHeader.ContentType, "application/json");
            string nick = "";
            string groupId = "";
            bool fiveOthree = true;
            while (fiveOthree)
            {
                try
                {
                    var groupJson = await client.DownloadStringTaskAsync(string.Format("https://graph.microsoft.com/beta/groups?$filter=displayName eq '{0}' or mailNickname eq '{0}'", groupName));
                    dynamic group = JObject.Parse(groupJson);
                    groupId = group.value[0].id.ToString();
                    nick = group.value[0].mailNickname.ToString();
                    fiveOthree = false;
                }
                catch (Exception e)
                {
                }
            }


            // Send an inite
            string groupUrl = "https://appsters2017.sharepoint.com/sites/" + nick;
            dynamic invite = new ExpandoObject();
            invite.invitedUserDisplayName = name;
            invite.invitedUserEmailAddress = email;
            invite.inviteRedirectUrl = groupUrl;
            invite.sendInvitationMessage = "true";
            var payload = JsonConvert.SerializeObject(invite).ToString();
            var res = await DoPost(accessToken, payload, "https://graph.microsoft.com/beta/invitations");
            JObject aadUser = JObject.Parse(res);
            var userId = aadUser["invitedUser"]["id"].ToString();

            // Add to group
            await AddUserToGroup(userId, accessToken, groupId);
        }

        private static async Task AddUserToGroup(string userId, AuthenticationResult accessToken, string groupId)
        {
            var data = "{\"@odata.id\":\"https://graph.microsoft.com/v1.0/directoryObjects/" + userId + "\"}";
            WebClient client = new WebClient();
            client.Headers.Add(HttpRequestHeader.Authorization, accessToken.CreateAuthorizationHeader());
            client.Headers.Add(HttpRequestHeader.ContentType, "application/json");
            var result =
                await client.UploadStringTaskAsync(
                    new Uri("https://graph.microsoft.com/v1.0/groups/" + groupId + "/members/$ref"), data);
        }

        private static async Task<string> DoPost(AuthenticationResult accessToken, string payload, string url)
        {
            HttpClient http = new HttpClient();
            http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken.AccessToken);

            request.Content = new StringContent(payload, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await http.SendAsync(request);
            var res = await response.Content.ReadAsStringAsync();
            return res;
        }
    }
}
