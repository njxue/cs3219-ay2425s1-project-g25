using MongoDB.Driver;
using Chatio.Models;
using Chatio.Configurations;
namespace Chatio.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(MongoDbSettings settings) {
        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.DatabaseName);
        AssistantModel.RegisterClassMap();

    }

    public IMongoCollection<AssistantModel> Assistants => _database.GetCollection<AssistantModel>("Assistants");
    public IMongoCollection<ThreadModel> Threads => _database.GetCollection<ThreadModel>("Threads");
    public IMongoCollection<AIMessageModel> Messages => _database.GetCollection<AIMessageModel>("Messages");
    public IMongoCollection<ShoppingMallModel> ShoppingMalls => _database.GetCollection<ShoppingMallModel>("ShoppingMalls");
    public IMongoCollection<ShopModel> Shops => _database.GetCollection<ShopModel>("Shops");
    public IMongoCollection<ProductModel> Products => _database.GetCollection<ProductModel>("Products");
}
