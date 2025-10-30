import nlp from 'compromise';

export function generateChatTitle(messages: string[]): string {
    console.log("Generating title from messages:", messages);
//   const fullText = messages.join(' ');
//   const doc = nlp(fullText);

//   // Try to extract topics or nouns
//   const topics = doc.topics().out('array');
//   const nouns = doc.nouns().out('array');
//   console.log("Extracted topics:", topics);
//   console.log("Extracted nouns:", nouns);

//   // Pick the most relevant word or phrase
//   const title = topics[0] || nouns[0] || 'Chat Summary';
    if (messages[1] && messages[1] === 'Hello! How can I assist you today?', 'How many orders are pending?' ) {
        return messages[2].slice(0, 30) + (messages[2].length > 30 ? '...' : '');
    } else {
        const text = messages[0] || 'New Chat';
        return text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }
}