// Direct connection to Colab RAG service via ngrok
const RAG_API_BASE = import.meta.env.VITE_RAG_URL || 'https://3034addc8e22.ngrok-free.app';

class RAGService {
  async askQuestion(question, context = "") {
    console.log('🌐 RAGService: Making fetch request to:', `${RAG_API_BASE}/ask`);
    console.log('🌐 RAGService: API Base URL:', RAG_API_BASE);
    console.log('🌐 RAGService: Environment VITE_RAG_URL:', import.meta.env.VITE_RAG_URL);
    
    try {
      const payload = {
        question: question,
        context: {
          field: context ? context.split(': ')[0] : '',
          value: context ? context.split(': ')[1] || '' : '',
          full_context: context
        }
      };

      const response = await fetch(`${RAG_API_BASE}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 RAGService: Response status:', response.status);
      console.log('📡 RAGService: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ RAGService: Response not ok. Status:', response.status, 'Error:', errorText);
        throw new Error(`Failed to get RAG answer: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ RAGService: Successfully parsed response:', data);
      return data;
    } catch (error) {
      console.error('❌ RAGService: Fetch error:', error);
      throw error;
    }
  }
}

export const ragService = new RAGService();
