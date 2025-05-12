<script setup lang="ts">
import { ref, onMounted } from "vue";

interface MessageInt {
  role: "user" | "model";
  parts: { text: string }[];
}

const newMessage = ref("");
const messages = ref<MessageInt[]>([]);
const isTyping = ref(false);
const errorMessage = ref("");
const messageContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// General function to parse Markdown-style syntax into HTML tags
const parseMarkdownToHTML = (text: string) => {
  // Bold (**bold** → <strong>bold</strong>)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic (*italic* → <em>italic</em>)
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Strikethrough (~~strikethrough~~ → <del>strikethrough</del>)
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Links ([text](url) → <a href="url">text</a>)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Headings (# Heading → <h1>Heading</h1>, ## → <h2>, etc.)
  text = text.replace(/^(#{1,6})\s*(.*)$/gm, (_, level, content) => {
    const tag = `h${level.length}`;
    return `<${tag}>${content}</${tag}>`;
  });

  // Code (inline `code` → <code>code</code>)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Code blocks (```code``` → <pre><code>code</code></pre>)
  text = text.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');

  // Blockquotes (> quote → <blockquote>quote</blockquote>)
  text = text.replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists (* item → <ul><li>item</li></ul>)
  text = text.replace(/^\*\s(.*)$/gm, '<ul><li>$1</li></ul>');

  // Ordered lists (1. item → <ol><li>item</li></ol>)
  text = text.replace(/^\d+\.\s(.*)$/gm, '<ol><li>$1</li></ol>');

  // Images (![alt text](url) → <img src="url" alt="alt text"/>)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');

  // Tables (| header | header | → <table><thead><tr><th>header</th></tr></thead><tbody><tr><td>data</td></tr></tbody></table>)
  text = text.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(cell => `<th>${cell.trim()}</th>`).join('');
    return `<thead><tr>${cells}</tr></thead><tbody>`;
  });

  text = text.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
    return `<tr>${cells}</tr></tbody></table>`;
  });

  return text;
};


const sendMessage = async () => {
  const userMessage = newMessage.value.trim();
  if (!userMessage) return;

  messages.value.push({ role: "user", parts: [{ text: userMessage }] });
  newMessage.value = "";
  isTyping.value = true;
  errorMessage.value = "";
  scrollToBottom();

  try {
    const response = await $fetch<{ reply: string }>("/api/chat", {
      method: "POST",
      body: {
        message: userMessage,
        history: messages.value.slice(-10, -1), // Send last 9 messages for context
      },
    });

    messages.value.push({ role: "model", parts: [{ text: response.reply }] });
  } catch (error: any) {
    errorMessage.value = "Failed to get response from the AI.";
    if (error.data?.error) {
      errorMessage.value += ` Details: ${error.data.message}`;
    }
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  messages.value.push({
    role: "model",
    parts: [{ text: "Hello! My name is Jasper Bot, How can I help you today?" }],
  });
  scrollToBottom();
});
</script>

<template>
  <div class="h-full w-screen flex flex-col bg-gradient-to-b from-gray-900 to-indigo-900 text-gray-300">
    <div class="bg-gradient-to-r from-purple-800 to-blue-800 text-white p-4 shadow-md flex items-center justify-center">
      <h1 class="text-xl font-semibold">Jasper Gemini Chat</h1>
    </div>

    <div ref="messageContainer" class="flex-grow overflow-y-auto p-6 space-y-4">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'p-3 rounded-lg break-words',
          message.role === 'user'
            ? 'bg-indigo-700 text-indigo-200 self-end border border-indigo-600'
            : 'bg-gray-700 text-gray-300 self-start border border-gray-600',
        ]"
      >
        <div class="font-semibold mb-1" v-if="message.role === 'user'">You</div>
        <div class="font-semibold mb-1" v-else-if="message.role === 'model'">Jasper Bot</div>
        <p class="text-sm" v-html="parseMarkdownToHTML(message.parts[0]?.text)"></p> <!-- Render HTML -->
      </div>
      <div v-if="errorMessage" class="bg-red-800 text-red-200 p-3 rounded-md">
        {{ errorMessage }}
      </div>
      <div v-if="isTyping" class="bg-gray-700 text-gray-400 p-3 rounded-md self-start">
        <p>Jasper Bot is typing...</p>
      </div>
    </div>

    <div class="bg-gray-800 p-4 border-t border-gray-700 flex items-center">
      <div class="flex justify-between w-full gap-3">
        <div class="border border-gray-600 w-full rounded">
          <input
            v-model="newMessage"
            type="text"
            class="w-full bg-transparent text-gray-300 px-4 py-2 focus:outline-none placeholder-gray-500"
            placeholder="Type your message..."
            @keydown.enter="sendMessage"
          />
        </div>
        <button
          class="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-5 py-2 focus:outline-none disabled:bg-gray-600"
          @click="sendMessage"
          :disabled="!newMessage.trim() || isTyping"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add styles for scrollbars */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #333;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>
