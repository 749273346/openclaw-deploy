const React = require('react');
const { Box, Text } = require('ink');
const BigText = require('ink-big-text');
const Gradient = require('ink-gradient');

const Header = ({ theme }) => {
    return (
        <Box flexDirection="column" alignItems="center" marginBottom={1}>
            <Gradient name={theme.name === 'Hacker Green' ? 'retro' : 'cristal'}>
                <BigText text="OpenClaw" font="simple" />
            </Gradient>
            <Box borderStyle={theme.borderStyle} borderColor={theme.borderColor} paddingX={1}>
                <Text color={theme.titleColor}>
                    Agent: Main | {new Date().toLocaleDateString()} | Theme: {theme.name}
                </Text>
            </Box>
        </Box>
    );
};

module.exports = Header;
