import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ChatPage() {
  const route = useRoute();
  const { medication } = route.params; 

  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', message: `How should I help you with ${medication.name}?` },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim() === '') return;

    const userMessage = message;
    setChatHistory([...chatHistory, { sender: 'user', message: userMessage }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('https://snapill-backend-b37ba101e223.herokuapp.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: 'bot', message: responseData.response },
        ]);
      } else {
        console.error('Error:', responseData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatArea}>
        {chatHistory.map((chat, index) => (
          <View key={index} style={chat.sender === 'user' ? styles.userMessage : styles.botMessage}>
            <Text style={chat.sender === 'user' ? styles.userMessageText : styles.botMessageText}>
              {chat.message}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Send a message..."
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? <ActivityIndicator color="#fff" /> : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatArea: {
    flex: 1,
    padding: 10,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
  },
  botMessageText: {
    color: '#000',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007aff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userMessageText: {
    color: '#fff',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});