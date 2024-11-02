using Chatio.Data;
using Chatio.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Chatio.Services;

public class ProductService
{
    private readonly IMongoCollection<ProductModel> _products;

    public ProductService(MongoDbContext dbContext)
    {
        _products = dbContext.Products;
    }

    public async Task<ProductModel> GetProductByIdAsync(string id)
    {
        return await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }
}
