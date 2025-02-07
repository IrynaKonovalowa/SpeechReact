using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Microsoft.CognitiveServices.Speech;
using SpeechReact.Server.Models;
using System.Text;

namespace SpeechReact.Server.Controllers
{
    [Route("api/speech")]
    [ApiController]
    public class SpeechController : ControllerBase
    {
        private readonly IConfiguration _config;

        public SpeechController(IConfiguration config)
        {
            _config = config;
        }
                
        [HttpPost("recognize")]
        public async Task<IActionResult> RecognizeSpeech([FromBody] RecognizeSpeechRequest request)
        {
            var speechConfig = SpeechConfig.FromSubscription(_config["AzureSpeech:Key"], _config["AzureSpeech:Region"]);
            speechConfig.SpeechRecognitionLanguage = request.Language; // Учитываем выбранный язык

            using var recognizer = new SpeechRecognizer(speechConfig);
            var result = await recognizer.RecognizeOnceAsync();

            return Ok(new { text = result.Text });
        }
        [HttpPost("translate")]
        public async Task<IActionResult> TranslateSpeech([FromBody] TranslateRequest request)
        {
            var translatorKey = _config["AzureTranslator:Key"];
            var translatorRegion = _config["AzureTranslator:Region"];
            var endpoint = $"https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to={request.TargetLanguage}";

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", translatorKey);
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Region", translatorRegion);

            var body = new[] { new { Text = request.Text } };
            var requestBody = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var response = await client.PostAsync(endpoint, requestBody);
            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);

            try
            {
                var translationResults = JsonConvert.DeserializeObject<List<TranslationResponse>>(responseBody);
                var translatedText = translationResults?[0].Translations?[0].Text ?? "Translation failed";

                return Ok(new { translatedText });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Failed to parse translation response", details = ex.Message });
            }
        }
    } 
}
    