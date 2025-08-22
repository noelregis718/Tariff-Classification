const ragService = require('../services/ragService');

class RAGController {
  async askQuestion(req, res, next) {
    try {
      const { question, context } = req.body;
      const answer = await ragService.askQuestion(question, context);
      res.json({ answer });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedInfo(req, res, next) {
    try {
      const { htsCode } = req.params;
      const info = await ragService.getHTSCodeInfo(htsCode);
      res.json(info);
    } catch (error) {
      next(error);
    }
  }

  async addDocuments(req, res, next) {
    try {
      const { texts, metadata } = req.body;
      const result = await ragService.addDocuments(texts, metadata);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async healthCheck(req, res, next) {
    try {
      const health = await ragService.healthCheck();
      res.json(health);
    } catch (error) {
      next(error);
    }
  }

  async updateColabUrl(req, res, next) {
    try {
      const { url } = req.body;
      ragService.setColabUrl(url);
      res.json({ message: 'Colab URL updated successfully', url });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RAGController();