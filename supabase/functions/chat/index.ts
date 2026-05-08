const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { role: 'user', content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput('');

  try {
    const response = await fetch('https://wcrotshohsumzdzmcugx.supabase.co/functions/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    const data = await response.json();
    
    // AI ka reply nikalne ke liye
    const aiReply = data.choices[0].message.content;
    
    setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }]);
  } catch (error) {
    console.error("Error:", error);
    setMessages((prev) => [...prev, { role: 'assistant', content: "Pohor, connection mein error hai. Supabase check karein!" }]);
  }
};
