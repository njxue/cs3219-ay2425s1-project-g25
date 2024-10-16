-- KEYS: List of queue keys in order of specificity
-- ARGV[1]: Current user's socketId

local socketId = ARGV[1]

for i, queueKey in ipairs(KEYS) do
    local members = redis.call('LRANGE', queueKey, 0, -1)
    for _, member in ipairs(members) do
        if member ~= socketId then
            -- Remove the matched user from all queues
            for _, q in ipairs(KEYS) do
                redis.call('LREM', q, 0, member)
            end
            return member
        end
    end
end

return nil
