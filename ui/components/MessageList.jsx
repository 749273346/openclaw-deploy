const React = require('react');
const { Box, Text } = require('ink');

const MessageList = ({ messages, theme }) => {
    // Show only the last 10 messages to avoid overflow
    const visibleMessages = messages.slice(-10);

    return (
        <Box flexDirection="column" flexGrow={1}>
            {visibleMessages.map((msg, index) => (
                <Box key={index} flexDirection="column" marginBottom={1}>
                    <Text bold color={msg.role === 'user' ? theme.userColor : theme.aiColor}>
                        {msg.role === 'user' ? 'User' : 'OpenClaw'}:
                    </Text>
                    <Box 
                        borderStyle={msg.role === 'assistant' ? theme.borderStyle : undefined}
                        borderColor={msg.role === 'assistant' ? theme.borderColor : undefined}
                        paddingX={msg.role === 'assistant' ? 1 : 0}
                    >
                        <Text>{msg.content}</Text>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

module.exports = MessageList;
