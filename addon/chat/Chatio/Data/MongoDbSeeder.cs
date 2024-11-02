namespace Chatio.Data;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using Chatio.Data;
using Chatio.Models;
using Chatio.Services;

public class MongoDbSeeder
{
    private readonly MongoDbContext _dbContext;
    private readonly VectorSearchService _vectorSearchService;

    public MongoDbSeeder(MongoDbContext dbContext, VectorSearchService vectorSearchService)
    {
        _dbContext = dbContext;
        _vectorSearchService = vectorSearchService;
    }

    public async Task SeedAsync()
    {
        // Seed Shopping Malls
        if (await IsCollectionEmptyAsync(_dbContext.ShoppingMalls))
        {
            await SeedShoppingMallsAsync();
        }

        // Seed Shops
        if (await IsCollectionEmptyAsync(_dbContext.Shops))
        {
            await SeedShopsAsync();
        }

        // Seed Products
        if (await IsCollectionEmptyAsync(_dbContext.Products))
        {
            await SeedProductsAsync();
        }
    }

    private async Task<bool> IsCollectionEmptyAsync<T>(IMongoCollection<T> collection)
    {
        return await collection.CountDocumentsAsync(_ => true) == 0;
    }

    private async Task SeedShoppingMallsAsync()
    {
        var shoppingMalls = new List<ShoppingMallModel>
        {
            new ShoppingMallModel
            {
                Name = "City Center Mall",
                Location = "Downtown",
                Description = "The biggest mall in the city.",
                Vector = await GenerateEmbeddingAsync("City Center Mall, a huge shopping center located downtown.")
            },
            new ShoppingMallModel
            {
                Name = "Sunset Plaza",
                Location = "Suburbs",
                Description = "A small but vibrant shopping plaza.",
                Vector = await GenerateEmbeddingAsync("Sunset Plaza, a small but vibrant shopping area in the suburbs.")
            }
        };

        await _dbContext.ShoppingMalls.InsertManyAsync(shoppingMalls);
    }

    private async Task SeedShopsAsync()
    {
        var shops = new List<ShopModel>
        {
            new ShopModel
            {
                Name = "Gadget Store",
                Category = "Electronics",
                Description = "All the latest gadgets and electronics.",
                Vector = await GenerateEmbeddingAsync("Gadget Store, selling all the latest electronics."),
                LocationInfo = new LocationInfo
                {
                    EntryPoint = 45.0,
                    ExitPoint = 180.0,
                    Coordinates = new Coordinate
                    {
                        X = 10.0,
                        Y = 20.0,
                        Z = 1
                    }
                }
            },
            new ShopModel
            {
                Name = "Fashion Hub",
                Category = "Clothing",
                Description = "Trendy clothes for all ages.",
                Vector = await GenerateEmbeddingAsync("Fashion Hub, offering trendy clothing for all ages."),
                LocationInfo = new LocationInfo
                {
                    EntryPoint = 90.0,
                    ExitPoint = 270.0,
                    Coordinates = new Coordinate
                    {
                        X = 15.0,
                        Y = 30.0,
                        Z = 1
                    }
                }
            }
        };

        await _dbContext.Shops.InsertManyAsync(shops);
    }

    private async Task SeedProductsAsync()
    {
        var products = new List<ProductModel>
        {
            new ProductModel
            {
                Name = "Smartphone",
                Price = 799.99,
                Stock = 50,
                Tags = new List<string> { "Electronics", "Phone", "Smart" },
                Description = "A powerful smartphone with cutting-edge features.",
                Vector = await GenerateEmbeddingAsync("A powerful smartphone with cutting-edge features.")
            },
            new ProductModel
            {
                Name = "Sneakers",
                Price = 59.99,
                Stock = 200,
                Tags = new List<string> { "Footwear", "Sports", "Trendy" },
                Description = "Comfortable and trendy sneakers for everyday wear.",
                Vector = await GenerateEmbeddingAsync("Comfortable and trendy sneakers for everyday wear.")
            }
        };

        await _dbContext.Products.InsertManyAsync(products);
    }

    // Helper method to generate embedding vector using AssistantService
    private async Task<List<float>> GenerateEmbeddingAsync(string text)
    {
        var embedding = await _vectorSearchService.GenerateEmbeddingAsync(text);
        return new List<float>(embedding.Span.ToArray());
    }
}
