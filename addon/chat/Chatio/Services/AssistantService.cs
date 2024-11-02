using Chatio.Configurations;
using Chatio.Data;
using Chatio.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using OpenAI;
using OpenAI.Assistants;
using OpenAI.Embeddings;
using OpenAI.Files;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Chatio.Services;

public class AssistantService
{
#pragma warning disable OPENAI001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    private readonly AssistantClient _assistantClient;
    private readonly OpenAiSettings _settings;
    private readonly MongoDbContext _dbContext;
    private readonly AssistantModel _assistantModel;
    private readonly ThreadModel _threadModel;
    private readonly EmbeddingClient _embeddingClient;
    private readonly VectorSearchService _vectorSearchService;

    public AssistantService(OpenAiSettings settings, MongoDbContext dbContext, EmbeddingClient embeddingClient, VectorSearchService vectorSearchService)
    {
        _settings = settings;
        _dbContext = dbContext;
        var openAIClient = new OpenAIClient(_settings.ApiKey);
        _assistantClient = openAIClient.GetAssistantClient();

        // Retrieve or create assistant
        _assistantModel = GetOrCreateAssistantAsync().GetAwaiter().GetResult();

        // Retrieve or create thread
        _threadModel = GetOrCreateThreadAsync().GetAwaiter().GetResult();

        // Use the provided EmbeddingClient and VectorSearchService
        _embeddingClient = embeddingClient;
        _vectorSearchService = vectorSearchService;
    }

    public async Task<AssistantModel> GetOrCreateAssistantAsync() {
        // Check if assistant exists
        var assistant = await _dbContext.Assistants.Find(_ => true).FirstOrDefaultAsync();
        if (assistant != null)
        {
            return assistant;
        }

        // Create a new assistant
        var assistantResult = await _assistantClient.CreateAssistantAsync(
            _settings.DefaultChatModel,
            new AssistantCreationOptions {
                Name = "Chatio Assistant",
                Instructions = "You are a helpful assistant. When possible, try to sneak in puns if you're asked to compare things.",
                Tools =
                {
                    new CodeInterpreterToolDefinition(),
                    new FileSearchToolDefinition(),
                }
            });

        // Map the result to AssistantModel
        var newAssistant = new AssistantModel {
            Id = assistantResult.Value.Id,
            CreatedAt = assistantResult.Value.CreatedAt.ToUnixTimeSeconds(),
            Name = assistantResult.Value.Name,
            Description = assistantResult.Value.Description,
            Model = assistantResult.Value.Model,
            Instructions = assistantResult.Value.Instructions,
            Tools = assistantResult.Value.Tools.ToString(),
            Metadata = JsonSerializer.Serialize(assistantResult.Value.Metadata),
            Temperature = assistantResult.Value.Temperature,
            ResponseFormat = assistantResult.Value.ResponseFormat.ToString(),
        };

        // Store the assistant in the database
        await _dbContext.Assistants.InsertOneAsync(newAssistant);

        return newAssistant;
    }

    private async Task<ThreadModel> GetOrCreateThreadAsync() {
        // Check if thread exists
        var thread = await _dbContext.Threads.Find(_ => true).FirstOrDefaultAsync();
        if (thread != null)
        {
            return thread;
        }

        // Create a new thread
        var threadResult = await _assistantClient.CreateThreadAsync();

        // Map the result to ThreadModel
        var newThread = new ThreadModel {
            Id = threadResult.Value.Id,
            CreatedAt = threadResult.Value.CreatedAt.ToUnixTimeSeconds(),
            Metadata = threadResult.Value.Metadata.ToBsonDocument(),
            ToolResources = threadResult.Value.ToolResources.ToBsonDocument(),
        };

        // Store the thread in the database
        await _dbContext.Threads.InsertOneAsync(newThread);

        return newThread;
    }

    public async IAsyncEnumerable<string> StreamAssistantResponse(string userMessage) {
        // Save the user's message
        var userMessageModel = new AIMessageModel {
            Id = $"msg_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            AssistantId = _assistantModel.Id,
            ThreadId = _threadModel.Id,
            RunId = null,
            Role = "user",
            Content =
            [
                new() {
                    Type = "text",
                    Text = new TextContent
                    {
                        Value = userMessage,
                    }
                }
            ],            };
        await _dbContext.Messages.InsertOneAsync(userMessageModel);

        var messageContent = new List<MessageContent>
        {
            MessageContent.FromText(userMessage)
        };

        await _assistantClient.CreateMessageAsync(_threadModel.Id, MessageRole.User, messageContent);

        var streamingUpdates = _assistantClient.CreateRunStreamingAsync(
            _threadModel.Id,
            _assistantModel.Id,
            new RunCreationOptions {
                AdditionalInstructions = "When possible, try to sneak in puns if you're asked to compare things.",
            });

        var assistantTextValue = "";

        await foreach (var streamingUpdate in streamingUpdates)
        {
            if (streamingUpdate is MessageContentUpdate contentUpdate)
            {
                assistantTextValue += contentUpdate.Text;
                yield return contentUpdate.Text;
            }
        }

        // Save the assistant's response
        var assistantMessageModel = new AIMessageModel {
            Id = $"msg_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            AssistantId = _assistantModel.Id,
            ThreadId = _threadModel.Id,
            RunId = null,
            Role = "assistant",
            Content =
            [
                new MessageContentItem
                {
                    Type = "text",
                    Text = new TextContent
                    {
                        Value = assistantTextValue,
                    }
                }
            ],
        };
        await _dbContext.Messages.InsertOneAsync(assistantMessageModel);
    }

    public async Task<List<AIMessageModel>> GetConversationHistoryAsync() {
        return await _dbContext.Messages.Find(m => m.ThreadId == _threadModel.Id)
                                        .SortBy(m => m.CreatedAt)
                                        .ToListAsync();
    }

    public async IAsyncEnumerable<string> StreamAssistantResponseWithRag(string userMessage)
    {
        // Save the user's message
        var userMessageModel = new AIMessageModel
        {
            Id = $"msg_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            AssistantId = _assistantModel.Id,
            ThreadId = _threadModel.Id,
            Role = "user",
            Content = [
                new()
            {
                Type = "text",
                Text = new TextContent
                {
                    Value = userMessage,
                }
            }
            ],
        };
        await _dbContext.Messages.InsertOneAsync(userMessageModel);

        // Use VectorSearchService to retrieve similar shopping malls, shops, and products
        var similarMalls = await _vectorSearchService.SearchSimilarShoppingMallsAsync(userMessage, topN: 3);
        var similarShops = await _vectorSearchService.SearchSimilarShopsAsync(userMessage, topN: 3);
        var similarProducts = await _vectorSearchService.SearchSimilarProductsAsync(userMessage, topN: 3);

        // Combine the retrieved context from all collections
        var augmentedContext = string.Join("\n", similarMalls.Select(m => $"{m.Item.Id}: {m.Item.Name} (Mall)")) + "\n" +
                               string.Join("\n", similarShops.Select(s => $"{s.Item.Id}: {s.Item.Name} (Shop)")) + "\n" +
                               string.Join("\n", similarProducts.Select(p => $"{p.Item.Id}: {p.Item.Name} (Product)"));

        // Send the user's message and the retrieved context as additional instructions
        var messageContent = new List<MessageContent>
        {
            MessageContent.FromText(userMessage)
        };
        var runOptions = new RunCreationOptions
        {
            AdditionalInstructions =
                @"Please prioritize the following additional context when formulating your response: " +
                $"{augmentedContext} " +
                "When referring to specific products, shops, or malls, please provide links to more details using markdown format. " +
                "Use the following patterns: " +
                "* For products: `[Product Name](http://localhost:5173/product/[ID])` " +
                "* For shops: `[Shop Name](http://localhost:5173/shop/[ID])` " +
                "* For malls: `[Mall Name](http://localhost:5173/mall/[ID])` " +
                "Replace `[ID]` with the identifier provided before each item's name in the context. " +
                "Always use this markdown link format when mentioning these items. " +
                "This makes it easy for users to access more information."
        };

        await _assistantClient.CreateMessageAsync(_threadModel.Id, MessageRole.User, messageContent);

        var streamingUpdates = _assistantClient.CreateRunStreamingAsync(
            _threadModel.Id,
            _assistantModel.Id,
            runOptions);

        var assistantTextValue = "";

        await foreach (var streamingUpdate in streamingUpdates)
        {
            if (streamingUpdate is MessageContentUpdate contentUpdate)
            {
                assistantTextValue += contentUpdate.Text;
                yield return contentUpdate.Text;
            }
        }

        // Save the assistant's response
        var assistantMessageModel = new AIMessageModel
        {
            Id = $"msg_{Guid.NewGuid()}",
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            AssistantId = _assistantModel.Id,
            ThreadId = _threadModel.Id,
            Role = "assistant",
            Content = [
                new MessageContentItem
            {
                Type = "text",
                Text = new TextContent
                {
                    Value = assistantTextValue,
                }
            }
            ],
        };
        await _dbContext.Messages.InsertOneAsync(assistantMessageModel);
    }


}
