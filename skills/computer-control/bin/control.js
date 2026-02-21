#!/usr/bin/env node

const { 
  mouse, 
  keyboard, 
  screen, 
  straightTo, 
  centerOf, 
  Key, 
  Point, 
  Button 
} = require('@nut-tree/nut-js');
const { exec } = require('child_process');
const os = require('os');

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const params = args.slice(1);

async function run() {
  // Speed up mouse movement slightly for better UX
  mouse.config.mouseSpeed = 500;

  try {
    switch (command) {
      case 'move':
        // Usage: openclaw control move <x> <y>
        if (params.length < 2) throw new Error('Usage: move <x> <y>');
        const x = parseInt(params[0]);
        const y = parseInt(params[1]);
        await mouse.move(straightTo(new Point(x, y)));
        console.log(`Moved mouse to (${x}, ${y})`);
        break;

      case 'click':
        // Usage: openclaw control click [left|right]
        const btn = params[0] === 'right' ? Button.RIGHT : Button.LEFT;
        await mouse.click(btn);
        console.log(`Clicked ${params[0] || 'left'} button`);
        break;

      case 'type':
        // Usage: openclaw control type "text to type"
        const text = params.join(' ');
        if (!text) throw new Error('Usage: type <text>');
        await keyboard.type(text);
        console.log(`Typed: "${text}"`);
        break;

      case 'press':
        // Usage: openclaw control press <key_name> (e.g., Enter, Space, A, LeftControl)
        if (params.length < 1) throw new Error('Usage: press <key_name>');
        const keyName = params[0];
        // Simple mapping for common keys - expand as needed
        const keyMap = {
          'enter': Key.Enter,
          'space': Key.Space,
          'escape': Key.Escape,
          'tab': Key.Tab,
          'backspace': Key.Backspace,
          'left': Key.Left,
          'right': Key.Right,
          'up': Key.Up,
          'down': Key.Down,
          'cmd': Key.LeftSuper,
          'win': Key.LeftSuper,
          'alt': Key.LeftAlt,
          'ctrl': Key.LeftControl,
          'shift': Key.LeftShift
        };
        
        // Check if it's a single character or a special key
        let keyToPress = keyMap[keyName.toLowerCase()];
        if (!keyToPress && keyName.length === 1) {
            // For single letters, we can often just use the char code or Key[Char]
            // Nut.js uses specific Key enums. 
            // For simplicity in this demo, let's use keyboard.type for single chars if not found
            await keyboard.type(keyName);
            console.log(`Pressed: ${keyName}`);
            return;
        }

        if (keyToPress) {
            await keyboard.pressKey(keyToPress);
            await keyboard.releaseKey(keyToPress);
            console.log(`Pressed special key: ${keyName}`);
        } else {
             // Fallback: try to find it in Key enum
             const directKey = Key[keyName];
             if (directKey) {
                 await keyboard.pressKey(directKey);
                 await keyboard.releaseKey(directKey);
                 console.log(`Pressed key: ${keyName}`);
             } else {
                 console.error(`Unknown key: ${keyName}`);
             }
        }
        break;
      
      case 'screen':
        // Usage: openclaw control screen size
        if (params[0] === 'size') {
            const width = await screen.width();
            const height = await screen.height();
            console.log(`Screen size: ${width}x${height}`);
        } else {
            console.log('Usage: screen size');
        }
        break;

      case 'open':
        // Usage: openclaw control open <url|app>
        const target = params.join(' ');
        if (!target) throw new Error('Usage: open <url|app>');
        
        let openCmd;
        if (os.platform() === 'win32') {
          openCmd = `start "" "${target}"`;
        } else if (os.platform() === 'darwin') {
          openCmd = `open "${target}"`;
        } else {
          openCmd = `xdg-open "${target}"`;
        }
        
        exec(openCmd, (error) => {
            if (error) {
                console.error(`Failed to open: ${error.message}`);
            } else {
                console.log(`Opened: ${target}`);
            }
        });
        break;

      case 'help':
      default:
        console.log(`
🖥️  OpenClaw Computer Control Skill

Usage: openclaw control <command> [args]

Commands:
  move <x> <y>      Move mouse to coordinates
  click [btn]       Click mouse (left/right)
  type <text>       Type text string
  press <key>       Press a single key (enter, space, escape, etc.)
  screen size       Get screen resolution
  help              Show this help
`);
        break;
    }
  } catch (error) {
    console.error('❌ Error executing control command:', error.message);
    process.exit(1);
  }
}

run();
