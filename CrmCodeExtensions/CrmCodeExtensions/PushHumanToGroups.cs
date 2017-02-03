using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace CrmCodeExtensions
{
    public class PushHumanToGroups : IPlugin
    {
        private readonly string serviceUrl;
        private readonly string shipKey;
        private readonly string emailKey;

        /// <summary>
        /// Plugin constructor
        /// </summary>
        /// <param name="config">
        /// The configuration parameters to be used in the plugin
        /// </param>
        public PushHumanToGroups(string config)
        {
            var dict = new Dictionary<string, string>();
            config.Split(';').ToList().ForEach(s => {
                var split = s.Split('=');
                dict.Add(split.First(), split.Last());
            });

            this.serviceUrl = dict["ServiceUrl"];
            this.shipKey = dict["ShipKey"];
            this.emailKey = dict["EmailKey"];
        }

        /// <summary>
        /// Main method of the plugin
        /// </summary>
        /// <param name="serviceProvider">
        /// default provider passed in by the execution
        /// </param>
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            try
            {
                var contact = (Entity)context.InputParameters["Target"];
                // parentcustomerid is a system field on contact in MSDYN365 which cannot be removed
                var account = contact.GetAttributeValue<EntityReference>("parentcustomerid");

                using (var client = new WebClient())
                {
                    client.QueryString.Add(shipKey, account.Name);
                    // emailaddress1 is a system field on contact in MSDYN365 which cannot be removed
                    client.QueryString.Add(emailKey, contact.GetAttributeValue<string>("emailaddress1"));
                    tracingService.Trace(client.DownloadString(serviceUrl));
                }
            }
            catch (WebException exception)
            {
                tracingService.Trace(exception.Message);
                throw;
            }
            catch
            {
                tracingService.Trace("Contact was created with invalid values");
            }
        }
    }
}
