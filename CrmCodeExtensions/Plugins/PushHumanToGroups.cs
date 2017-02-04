using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace CrmCodeExtensions.Plugins
{
    public class PushHumanToGroups : IPlugin
    {
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
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);

            try
            {
                tracingService.Trace("Collecting the image from the context");
                var contact = (Entity)context.InputParameters["Target"];
                // parentcustomerid is a system field on contact in MSDYN365 which cannot be removed
                var account = service.Retrieve("account", contact.GetAttributeValue<EntityReference>("parentcustomerid").Id, new ColumnSet("name"));

                tracingService.Trace("Building web request");
                using (var client = new WebClient())
                {
                    var uri = "https://crewonboard.azurewebsites.net/api/OnboardCrewmember?" +
                        "group=" + account.GetAttributeValue<string>("name") +
                        "&name=" + contact.GetAttributeValue<string>("fullname") +
                        "&email=" + contact.GetAttributeValue<string>("emailaddress1");
                    client.DownloadData(uri);
                    tracingService.Trace("Completed successfully!");
                }
            }
            catch (WebException exception)
            {
                tracingService.Trace(exception.Message);
                throw;
            }
            catch (Exception e)
            {
                tracingService.Trace(e.Message);
                tracingService.Trace(e.StackTrace);
            }
        }
    }
}
