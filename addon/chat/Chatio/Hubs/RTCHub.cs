using Microsoft.AspNetCore.SignalR;
using Chatio.Models.WebRTC;
using Chatio.Dtos;

namespace Chatio.Hubs;

public class RTCHub : Hub
{
    private readonly ILogger<RTCHub> _logger;
    private static readonly Dictionary<string, HashSet<string>> _roomParticipants = new();

    public RTCHub(ILogger<RTCHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomsToRemove = _roomParticipants
            .Where(kvp => kvp.Value.Contains(Context.ConnectionId))
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var roomId in roomsToRemove)
        {
            await LeaveRoom(roomId);
        }

        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    private static readonly Dictionary<string, UserInfoDto> _participants = new();
    public async Task JoinRoom(string roomId)
    {
        try
        {
            if (!_participants.ContainsKey(Context.ConnectionId))
            {
                _participants[Context.ConnectionId] = new UserInfoDto
                {
                    Id = Context.ConnectionId,
                    Username = $"User_{Context.ConnectionId.Substring(0, 6)}"
                };
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            if (!_roomParticipants.ContainsKey(roomId))
            {
                _roomParticipants[roomId] = new HashSet<string>();
            }
            _roomParticipants[roomId].Add(Context.ConnectionId);

            await Clients.Group(roomId).SendAsync("ParticipantJoined", _participants[Context.ConnectionId]);

            var existingParticipants = _roomParticipants[roomId]
                .Where(p => p != Context.ConnectionId && _participants.ContainsKey(p))
                .Select(p => _participants[p])
                .ToList();

            await Clients.Caller.SendAsync("ExistingParticipants", existingParticipants);

            _logger.LogInformation("Client {ConnectionId} joined room {RoomId}", Context.ConnectionId, roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining room {RoomId}", roomId);
            throw;
        }
    }



    public async Task LeaveRoom(string roomId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

            if (_roomParticipants.ContainsKey(roomId))
            {
                _roomParticipants[roomId].Remove(Context.ConnectionId);
                if (!_roomParticipants[roomId].Any())
                {
                    _roomParticipants.Remove(roomId);
                }
            }

            await Clients.OthersInGroup(roomId).SendAsync("ParticipantLeft", Context.ConnectionId);
            _logger.LogInformation("Client {ConnectionId} left room {RoomId}", Context.ConnectionId, roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving room {RoomId}", roomId);
            throw;
        }
    }

    // New method to send a message to the room
    public async Task SendMessage(string roomId, string message)
    {
        try
        {
            _logger.LogInformation("Sending message from {ConnectionId} to room {RoomId}: {Message}", Context.ConnectionId, roomId, message);
            await Clients.Group(roomId).SendAsync("ReceiveMessage", new
            {
                SenderId = Context.ConnectionId,
                Message = message,
                Timestamp = DateTime.UtcNow.ToString("o") // Ensures the timestamp is in ISO 8601 format
            });

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message to room {RoomId}", roomId);
            throw;
        }
    }

    public async Task SendOffer(string targetId, RTCSessionDescription offer)
    {
        await Clients.Client(targetId).SendAsync("ReceiveOffer", Context.ConnectionId, offer);
    }

    public async Task SendAnswer(string targetId, RTCSessionDescription answer)
    {
        await Clients.Client(targetId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
    }

    public async Task SendIceCandidate(string targetId, RTCIceCandidate candidate)
    {
        await Clients.Client(targetId).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
    }

}
