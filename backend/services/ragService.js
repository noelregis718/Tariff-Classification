const axios = require('axios');

class RAGService {
  constructor() {
    // This URL will be provided by ngrok when you run the Colab notebook
    this.colabRagUrl = process.env.COLAB_RAG_URL || 'https://your-ngrok-url.ngrok.io';
    this.timeout = 30000; // 30 seconds timeout
  }

  async askQuestion(question, context) {
    try {
      console.log('Sending question to Colab RAG service...');
      
      const response = await axios.post(
        `${this.colabRagUrl}/ask`,
        {
          question: question,
          context: context,
          top_k: 5
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error calling Colab RAG service:', error.message);
      
      // Fallback response if Colab service is unavailable
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return this.getFallbackResponse(question, context);
      }
      
      throw new Error(`RAG service error: ${error.message}`);
    }
  }

  async getHTSCodeInfo(htsCode) {
    try {
      const response = await axios.get(
        `${this.colabRagUrl}/search/HTS code ${htsCode}`,
        {
          params: { top_k: 3 },
          timeout: this.timeout
        }
      );

      const results = response.data.results;
      
      return {
        htsCode,
        description: results[0]?.content || 'No description available',
        chapter: htsCode.substring(0, 2),
        relatedCodes: results.slice(1, 3)
          .map(result => result.metadata?.code)
          .filter(Boolean),
        sources: results
      };
    } catch (error) {
      console.error('Error getting HTS code info:', error.message);
      throw new Error(`Failed to get HTS code info: ${error.message}`);
    }
  }

  async generateAutofill(record, targetFields) {
    try {
      const question = `
Given this customs record: ${JSON.stringify(record, null, 2)}
Generate appropriate values for these fields: ${targetFields.join(', ')}
Base your suggestions on customs classification rules and the existing data.
Return as JSON object with field names as keys.
      `;

      const response = await axios.post(
        `${this.colabRagUrl}/ask`,
        {
          question: question,
          context: { record, targetFields },
          top_k: 5
        },
        {
          timeout: this.timeout
        }
      );

      // Try to extract JSON from the response
      const answer = response.data.answer;
      try {
        // Look for JSON in the response
        const jsonMatch = answer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from RAG response, using fallback');
      }

      // Fallback: generate simple suggestions
      return this.generateFallbackAutofill(record, targetFields);
    } catch (error) {
      console.error('Error generating autofill:', error.message);
      return this.generateFallbackAutofill(record, targetFields);
    }
  }

  async addDocuments(texts, metadata) {
    try {
      const response = await axios.post(
        `${this.colabRagUrl}/add_documents`,
        {
          texts: texts,
          metadata: metadata
        },
        {
          timeout: this.timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding documents to RAG service:', error.message);
      throw new Error(`Failed to add documents: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.colabRagUrl}/`, {
        timeout: 5000
      });
      return {
        status: 'healthy',
        docsCount: response.data.docs_count,
        url: this.colabRagUrl
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        url: this.colabRagUrl
      };
    }
  }

  getFallbackResponse(question, context) {
    // Simple fallback responses for common questions
    const fallbacks = {
      'why is this not chapter 90': 'This item may not be classified in Chapter 90 because it doesn\'t meet the specific criteria for optical, measuring, or precision instruments defined in that chapter.',
      'what chapter should this be': 'To determine the correct chapter, consider the item\'s primary function, material composition, and intended use. Check the General Rules of Interpretation (GRI) starting with GRI 1.',
      'hts code': 'HTS codes are 10-digit codes used to classify products for customs purposes. The first 6 digits follow the international HS system, while digits 7-10 are specific to the importing country.'
    };

    const lowerQuestion = question.toLowerCase();
    let answer = 'I apologize, but the RAG service is currently unavailable. Please check your connection to the Colab service and try again.';
    
    for (const [key, response] of Object.entries(fallbacks)) {
      if (lowerQuestion.includes(key)) {
        answer = response;
        break;
      }
    }

    // Return the same structure as the real API
    return {
      answer: answer,
      sources: [],
      confidence: 0.0
    };
  }

  generateFallbackAutofill(record, targetFields) {
    const suggestions = {};
    
    targetFields.forEach(field => {
      switch (field.toLowerCase()) {
        case 'chapter':
          if (record.fields?.final_hts_code) {
            suggestions[field] = record.fields.final_hts_code.substring(0, 2);
          }
          break;
        case 'duty_rate':
          suggestions[field] = 'Check HTS for current rate';
          break;
        case 'country_of_origin':
          suggestions[field] = record.fields?.manufacturer_country || 'Unknown';
          break;
        default:
          suggestions[field] = 'Please verify manually';
      }
    });

    return suggestions;
  }

  setColabUrl(url) {
    this.colabRagUrl = url;
    console.log(`RAG service URL updated to: ${url}`);
  }
}

module.exports = new RAGService();