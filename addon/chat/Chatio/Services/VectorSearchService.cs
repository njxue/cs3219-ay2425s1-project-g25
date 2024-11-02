using Chatio.Data;
using Chatio.Models;
using MongoDB.Driver;
using OpenAI.Embeddings;

namespace Chatio.Services;

public class VectorSearchService
{
    private readonly MongoDbContext _dbContext;
    private readonly EmbeddingClient _embeddingClient;

    public VectorSearchService(MongoDbContext dbContext, EmbeddingClient embeddingClient)
    {
        _dbContext = dbContext;
        _embeddingClient = embeddingClient;
    }

    public async Task<ReadOnlyMemory<float>> GenerateEmbeddingAsync(string inputText)
    {
        // Create an embedding for the provided text using the configured embedding model
        OpenAIEmbedding embedding = await _embeddingClient.GenerateEmbeddingAsync(inputText);
        ReadOnlyMemory<float> vector = embedding.ToFloats();
        return vector;
    }

    // Method to search similar shopping malls based on input string
    public async Task<List<SimilarityResult<ShoppingMallModel>>> SearchSimilarShoppingMallsAsync(string inputText, int topN = 5)
    {
        // Generate vector using the assistant
        var inputVector = await GenerateEmbeddingAsync(inputText);

        var shoppingMalls = await _dbContext.ShoppingMalls.Find(_ => true).ToListAsync();

        // Calculate cosine similarity for each shopping mall
        var result = shoppingMalls
            .Select(mall => new SimilarityResult<ShoppingMallModel>
            {
                Item = mall,
                Similarity = CosineSimilarity(inputVector.Span.ToArray(), mall.Vector)
            })
            .OrderByDescending(x => x.Similarity) // Sort by highest similarity
            .Take(topN)                           // Take top N results
            .ToList();

        return result;
    }

    // Method to search similar shops based on input string
    public async Task<List<SimilarityResult<ShopModel>>> SearchSimilarShopsAsync(string inputText, int topN = 5)
    {
        // Generate vector using the assistant
        var inputVector = await GenerateEmbeddingAsync(inputText);

        var shops = await _dbContext.Shops.Find(_ => true).ToListAsync();

        var result = shops
            .Select(shop => new SimilarityResult<ShopModel>
            {
                Item = shop,
                Similarity = CosineSimilarity(inputVector.Span.ToArray(), shop.Vector)
            })
            .OrderByDescending(x => x.Similarity)
            .Take(topN)
            .ToList();

        return result;
    }

    // Method to search similar products based on input string
    public async Task<List<SimilarityResult<ProductModel>>> SearchSimilarProductsAsync(string inputText, int topN = 5)
    {
        // Generate vector using the assistant
        var inputVector = await GenerateEmbeddingAsync(inputText);

        var products = await _dbContext.Products.Find(_ => true).ToListAsync();

        var result = products
            .Select(product => new SimilarityResult<ProductModel>
            {
                Item = product,
                Similarity = CosineSimilarity(inputVector.Span.ToArray(), product.Vector)
            })
            .OrderByDescending(x => x.Similarity)
            .Take(topN)
            .ToList();

        return result;
    }

    // Helper method to calculate cosine similarity between two vectors
    private double CosineSimilarity(float[] vectorA, List<float> vectorB)
    {
        if (vectorA == null || vectorB == null || vectorA.Length != vectorB.Count)
        {
            throw new ArgumentException("Vectors must have the same dimension and not be null.");
        }

        float dotProduct = 0;
        float magnitudeA = 0;
        float magnitudeB = 0;

        for (int i = 0; i < vectorA.Length; i++)
        {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        // Avoid division by zero
        if (magnitudeA == 0 || magnitudeB == 0)
            return 0;

        return dotProduct / (Math.Sqrt(magnitudeA) * Math.Sqrt(magnitudeB));
    }
}

// Generic class to wrap the search result with its similarity score
public class SimilarityResult<T>
{
    public required T Item { get; set; } // The actual item (Shopping Mall, Shop, or Product)
    public double Similarity { get; set; } // The similarity score
}