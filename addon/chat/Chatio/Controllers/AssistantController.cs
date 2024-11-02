using Chatio.Dtos;
using Chatio.Services;
using Microsoft.AspNetCore.Mvc;

namespace Chatio.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssistantController : ControllerBase
{
    private readonly AssistantService _assistantService;

    public AssistantController(AssistantService assistantService)
    {
        _assistantService = assistantService;
    }
    [HttpPost("chat")]
    public async Task Chat([FromBody] ChatRequest request)
    {
        Response.ContentType = "text/event-stream";

        await foreach (var message in _assistantService.StreamAssistantResponseWithRag(request.Message))
        {
            var encodedMessage = Uri.EscapeDataString(message);
            await Response.WriteAsync($"data: {encodedMessage}\n\n");
            await Response.Body.FlushAsync();
        }
    }

    [HttpGet("info")]
    public async Task<IActionResult> GetAssistantInfo()
    {
        var assistant = await _assistantService.GetOrCreateAssistantAsync();
        var assistantDto = AssistantDto.FromModel(assistant); // Convert model to DTO
        return Ok(assistantDto);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetConversationHistory()
    {
        var messages = await _assistantService.GetConversationHistoryAsync();
        var messageDtos = messages.Select(AIMessageDTO.FromModel).ToList();
        return Ok(messageDtos);
    }


}