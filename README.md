# CodeMentor - Real-time Code Learning Assistant

A Chrome extension that provides real-time code hints and progress tracking for coding platforms like LeetCode, GeeksforGeeks, and HackerRank.

## 🚀 Features

- **Real-time Code Capture**: Automatically detects and captures code from various editors (Monaco, CodeMirror, textarea)
- **Smart Hints**: Provides contextual hints for syntax, logic, performance, and best practices
- **Progress Tracking**: Tracks your coding attempts, time spent, and hints used
- **Multi-platform Support**: Works on LeetCode, GeeksforGeeks, HackerRank, Codeforces, and AtCoder
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS
- **Local Storage**: All data stored locally using Chrome's storage API
- **Dark Mode**: Automatic theme switching based on system preferences

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Chrome Extension**: Manifest V3
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Chrome browser

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codementor-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build the extension**
   ```bash
   npm run build
   ```

5. **Load extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder
   - The CodeMentor extension should now appear in your extensions

### Production Build

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Create extension package**
   ```bash
   npm run zip
   ```

3. **Install from zip**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `codementor-extension.zip` file

## 🎯 Usage

### Basic Usage

1. **Navigate to a supported coding platform**
   - LeetCode: https://leetcode.com/problems/
   - GeeksforGeeks: https://www.geeksforgeeks.org/
   - HackerRank: https://www.hackerrank.com/
   - Codeforces: https://codeforces.com/
   - AtCoder: https://atcoder.jp/

2. **Start coding**
   - The extension automatically detects your code editor
   - Code changes are captured in real-time
   - Hints appear in the overlay panel

3. **View hints and progress**
   - Click the CodeMentor extension icon to open the popup
   - Navigate between Hints, Progress, and Settings tabs
   - Use keyboard shortcut `Ctrl+Shift+M` to toggle the overlay

### Features Overview

#### Hints Tab
- **Real-time Code Analysis**: Get instant feedback on your code
- **Multiple Hint Types**: Syntax, logic, performance, and best practice suggestions
- **Severity Levels**: High, medium, and low priority hints
- **Line-specific Feedback**: Hints point to specific lines in your code

#### Progress Tab
- **Problem Tracking**: Monitor attempts, time spent, and hints used
- **Statistics**: View success rates, streaks, and overall progress
- **Recent Activity**: See your latest coding sessions
- **Time Analysis**: Track time spent on different problems

#### Settings Tab
- **Extension Control**: Enable/disable the extension
- **Theme Selection**: Light, dark, or system theme
- **Feature Toggles**: Control hints, progress tracking, and auto-capture
- **Data Management**: Export/import progress, reset data
- **Privacy Settings**: Control data collection and notifications

## 🔧 Configuration

### Supported Code Editors

The extension automatically detects and works with:

- **Monaco Editor** (VS Code style)
- **CodeMirror** (traditional web editor)
- **Textarea-based editors** (simple text inputs)

### Supported Programming Languages

- JavaScript/TypeScript
- Python
- Java
- C++
- Go
- And more (auto-detected)

### Customization

#### Theme Customization
```css
/* Override TailwindCSS variables in tailwind.config.js */
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --accent: #f59e0b;
}
```

#### Hint Customization
```typescript
// Modify hint types in src/data/mockHints.ts
export const customHints: Hint[] = [
  {
    id: 1,
    type: 'syntax',
    message: 'Your custom hint message',
    severity: 'high',
    line: 5,
    timestamp: Date.now()
  }
]
```

## 🏗️ Architecture

### Project Structure

```
src/
├── background/          # Service worker
│   └── background.ts
├── content/            # Content script
│   ├── contentScript.ts
│   └── content.css
├── popup/              # Extension popup
│   ├── components/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── overlay/            # Injected overlay
│   ├── OverlayApp.tsx
│   └── main.tsx
├── services/           # API services
│   ├── apiService.ts
│   └── websocketService.ts
├── data/               # Mock data
│   └── mockHints.ts
└── types/              # TypeScript types
    └── index.ts
```

### Data Flow

1. **Content Script** captures code from editors
2. **Background Script** processes and stores data
3. **Popup/Overlay** displays hints and progress
4. **Chrome Storage** persists user data locally
5. **API Services** (placeholder) for future backend integration

### State Management

- **React Context** for component state
- **Chrome Storage API** for persistence
- **Local Storage** for temporary data
- **WebSocket** (placeholder) for real-time updates

## 🔌 API Integration (Future)

### Backend Integration

The extension is designed to easily integrate with a backend API:

```typescript
// src/services/apiService.ts
export class ApiService {
  async getHintsForCode(code: string, language: string): Promise<Hint[]> {
    // TODO: Replace with actual API call
    return this.getMockHints(code, language)
  }
  
  async saveProgress(problemId: string, data: ProgressData): Promise<void> {
    // TODO: Replace with actual API call
    console.log('Saving progress:', { problemId, data })
  }
}
```

### WebSocket Integration

Real-time features are prepared for WebSocket integration:

```typescript
// src/services/websocketService.ts
export class WebSocketService {
  async connectWebSocket(): Promise<WebSocket | null> {
    // TODO: Replace with actual WebSocket endpoint
    return null
  }
  
  public sendCodeUpdate(code: string, language: string, problemId: string): void {
    // TODO: Send real-time code updates
  }
}
```

## 🧪 Testing

### Manual Testing

1. **Test on different platforms**
   - LeetCode problems
   - GeeksforGeeks articles
   - HackerRank challenges

2. **Test editor detection**
   - Monaco editor (VS Code style)
   - CodeMirror editor
   - Textarea-based editors

3. **Test features**
   - Code capture
   - Hint display
   - Progress tracking
   - Settings persistence

### Automated Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Chrome Web Store (Future)

1. **Prepare for submission**
   ```bash
   npm run build
   npm run zip
   ```

2. **Upload to Chrome Web Store**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Upload the zip file
   - Fill in store listing details
   - Submit for review

### Self-hosting

1. **Build the extension**
   ```bash
   npm run build
   ```

2. **Distribute the dist folder**
   - Users can load the extension manually
   - Or use enterprise deployment tools

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Pull Request Guidelines

- Include tests for new features
- Update documentation
- Follow existing code style
- Provide clear description of changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** team for the amazing framework
- **TailwindCSS** for the utility-first CSS framework
- **Chrome Extensions** team for the Manifest V3 API
- **Coding platforms** for providing the problems and challenges

## 📞 Support

### Getting Help

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions
- **Email**: Contact the development team

### Common Issues

#### Extension not loading
- Check Chrome version (requires Chrome 88+)
- Ensure Developer mode is enabled
- Try reloading the extension

#### Code not being captured
- Verify the website is supported
- Check if the editor is detected
- Look for console errors

#### Hints not showing
- Check if hints are enabled in settings
- Verify the extension is active
- Try refreshing the page

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic extension structure
- ✅ Code capture and detection
- ✅ Mock hints and progress tracking
- ✅ Modern UI with React and TailwindCSS

### Phase 2 (Next)
- 🔄 Backend API integration
- 🔄 Real AI-powered hints
- 🔄 User authentication
- 🔄 Cloud sync

### Phase 3 (Future)
- 🔄 Advanced analytics
- 🔄 Social features
- 🔄 Mobile app
- 🔄 Enterprise features

---

**Made with ❤️ for developers**

*CodeMentor - Your AI-powered coding companion*
# ai-assist
