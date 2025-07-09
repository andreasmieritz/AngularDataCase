using Microsoft.AspNetCore.Mvc;

namespace AngularDataCase.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {

        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        [HttpGet("GetDataSets")]
        public List<DataSetResponse> GetDataSets()
        {
            return new List<DataSetResponse>()
            {
                new DataSetResponse(0, "Public"),
                new DataSetResponse(2, "Internal")
            };
        }

        [HttpGet("GetAnalytics")]
        public IEnumerable<AnalyticResponse> GetAnalytics()
        {
            yield return new AnalyticResponse("A1", "Time weighted X");
            yield return new AnalyticResponse("A2", "Y mean");
            yield return new AnalyticResponse("A3", "Differential");
        }

        [HttpGet("GetGroupings")]
        public IEnumerable<GroupingResponse> GetGroupings()
        {
            yield return new GroupingResponse("SECURITY", "Security");
            yield return new GroupingResponse("SECTOR", "Sector");
            yield return new GroupingResponse("COUNTRY", "Country");
        }

        [HttpGet("GetNodeNames")]
        public IEnumerable<GroupingNodeResponse> GetNodeNames(string grouping)
        {
            int numResponses = 50;
            var rand = new Random(grouping.GetHashCode());
            var ids = GenerateIds(grouping, 50);
            for (int i = 0; i < numResponses; i++)
            {
                yield return new GroupingNodeResponse(ids[i], $"{grouping}_{i}");
            }
        }

        [HttpGet("Calculate")]
        public IEnumerable<CalculateNodeResponse> GetCalculate(string analytic, string grouping, int dataSet)
        {
            int numResponses = Math.Abs((analytic + grouping + dataSet).GetHashCode()) % 45 + 5;
            var rand = new Random((analytic + grouping + dataSet).GetHashCode());
            var ids = GenerateIds(grouping, 50);
            Thread.Sleep(numResponses * 150);
            for (int i = 0; i < numResponses; i++)
            {
                yield return new CalculateNodeResponse(ids[i], rand.NextDouble() * 100);
            }
        }

        private List<string> GenerateIds(string prefix, int numIds)
        {
            var rand = new Random(prefix.GetHashCode());
            HashSet<string> ids = new HashSet<string>();
            while (ids.Count < numIds) {
                ids.Add($"{prefix}_{rand.Next()}");
            }
            return ids.ToList();
        }
    }
}
