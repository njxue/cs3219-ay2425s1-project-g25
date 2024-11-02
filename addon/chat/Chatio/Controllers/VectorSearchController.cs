using Chatio.Services;
using Microsoft.AspNetCore.Mvc;

namespace Chatio.Controllers;

[ApiController]
[Route("api/vector-search")]
public class VectorSearchController : ControllerBase
{
    private readonly VectorSearchService _vectorSearchService;

    public VectorSearchController(VectorSearchService vectorSearchService)
    {
        _vectorSearchService = vectorSearchService;
    }

    [HttpPost("malls")]
    public async Task<IActionResult> SearchSimilarMalls([FromBody] string inputText)
    {
        var result = await _vectorSearchService.SearchSimilarShoppingMallsAsync(inputText);
        return Ok(result); // Return both mall items and similarity scores
    }

    [HttpPost("shops")]
    public async Task<IActionResult> SearchSimilarShops([FromBody] string inputText)
    {
        var result = await _vectorSearchService.SearchSimilarShopsAsync(inputText);
        return Ok(result); // Return both shop items and similarity scores
    }

    [HttpPost("products")]
    public async Task<IActionResult> SearchSimilarProducts([FromBody] string inputText)
    {
        var result = await _vectorSearchService.SearchSimilarProductsAsync(inputText);
        return Ok(result); // Return both product items and similarity scores
    }
}
