# @umituz/react-native-ai-zai-provider

Z.AI (Zhipu AI) text generation provider for React Native applications. A powerful, type-safe wrapper around Z.AI's GLM models for text generation, JSON generation, and streaming responses.

## Features

- 🚀 **Simple API** - Easy-to-use hooks for text generation
- 📝 **Text-to-Text** - Generate text from prompts
- 🔄 **Streaming Support** - Real-time streaming responses
- 🎯 **JSON Generation** - Structured output with schema validation
- 💬 **Chat Sessions** - Multi-turn conversation support
- ⚡ **TypeScript** - Full type safety
- 🔒 **Error Handling** - Comprehensive error handling with user-friendly messages
- 🎨 **Flexible Configuration** - Builder pattern for easy configuration

## Installation

```bash
npm install @umituz/react-native-ai-zai-provider
```

## Quick Start

### 1. Initialize the Provider

```typescript
import { initializeProvider } from '@umituz/react-native-ai-zai-provider';

// Initialize with your API key
initializeProvider({
  apiKey: 'your-zai-api-key',
  defaultModel: 'glm-4.7', // Optional
});
```

### 2. Use the useZai Hook

```typescript
import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useZai } from '@umituz/react-native-ai-zai-provider';

function MyComponent() {
  const { generate, result, isGenerating, error } = useZai();

  const handleGenerate = async () => {
    await generate('Write a short story about AI');
  };

  return (
    <View>
      <Button title="Generate" onPress={handleGenerate} />
      {isGenerating && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      {result && <Text>{result}</Text>}
    </View>
  );
}
```

## Advanced Usage

### Text Generation with Configuration

```typescript
const { generate } = useZai({
  model: 'glm-4.7',
  generationConfig: {
    temperature: 0.8,
    maxTokens: 1000,
    topP: 0.9,
  },
});

await generate('Explain quantum computing');
```

### JSON Generation

```typescript
const { generateJSON, jsonResult } = useZai();

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    items: { type: 'array' }
  }
};

await generateJSON('Create a shopping list', schema);
console.log(jsonResult); // { title: "...", items: [...] }
```

### Streaming Generation

```typescript
const { generateStreaming, streamedText } = useZai();

await generateStreaming(
  'Tell me a story',
  (chunk) => {
    console.log('Received:', chunk);
  },
  (fullText) => {
    console.log('Complete:', fullText);
  }
);
```

### Chat Sessions

```typescript
import { createChatSession, sendChatMessage } from '@umituz/react-native-ai-zai-provider';

// Create a session
const session = createChatSession({
  model: 'glm-4.7',
  systemInstruction: 'You are a helpful assistant',
});

// Send messages
const { response, history } = await sendChatMessage(
  session.id,
  'Hello, how are you?'
);

// Continue conversation
const { response: response2 } = await sendChatMessage(
  session.id,
  'Tell me more'
);
```

### Configuration Builders

```typescript
import {
  ConfigBuilder,
  GenerationConfigBuilder
} from '@umituz/react-native-ai-zai-provider';

// Build configuration
const config = ConfigBuilder
  .create()
  .withApiKey('your-api-key')
  .withTimeout(60000)
  .withTextModel('glm-4.7')
  .build();

const genConfig = GenerationConfigBuilder
  .creative()
  .withMaxTokens(2000)
  .build();
```

## Available Models

- `glm-4.7` - Latest model (recommended)
- `glm-4.6` - Stable model
- `glm-4.5` - Faster model
- `glm-4.6v` - Vision model
- `glm-4-32b-0414-128k` - 32B context model

## Error Handling

```typescript
const { generate, error } = useZai({
  onError: (errorMessage) => {
    console.error('Generation failed:', errorMessage);
    // Show user-friendly error message
  },
});
```

## API Reference

### Hooks

- `useZai` - Main hook for text generation
- `useOperationManager` - Manage async operations

### Services

- `textGeneration` - Text generation service
- `structuredText` - JSON/structured output
- `streaming` - Streaming generation
- `zaiHttpClient` - HTTP client for direct API access

### Utilities

- `createUserMessage` - Create user message
- `createAssistantMessage` - Create assistant message
- `createSystemMessage` - Create system message
- `getUserFriendlyError` - Get user-friendly error message
- `isRetryableError` - Check if error is retryable

## License

MIT

## Author

umituz

## Links

- [Z.AI Documentation](https://docs.z.ai)
- [GitHub](https://github.com/umituz/react-native-ai-zai-provider)
