const MarketingEngine = require('../services/marketingEngine');
const ComplianceService = require('../services/complianceService');
const { ContentSuggestion, Product, AdCampaign, LandingPage } = require('../models');

exports.generatePostContent = async (req, res) => {
  try {
    const { productId, platform } = req.body;
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const suggestion = await MarketingEngine.createContentSuggestion(product, platform);
    res.json(suggestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Content generation failed' });
  }
};

exports.checkCompliance = async (req, res) => {
  try {
    const { content, platform } = req.body;
    const result = await ComplianceService.validatePostContent(content, platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Compliance check failed' });
  }
};

exports.getBestTimes = async (req, res) => {
  try {
    const { platform, country = 'ZA' } = req.query;
    const bestTimes = await MarketingEngine.getBestTimesToPost(platform, country);
    res.json({ platform, bestTimes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching best times' });
  }
};

exports.createAdCampaign = async (req, res) => {
  try {
    const { productId, landingPageId } = req.body;
    const product = await Product.findByPk(productId);
    const landingPage = await LandingPage.findByPk(landingPageId);
    
    if (!product || !landingPage) {
      return res.status(404).json({ message: 'Product or landing page not found' });
    }
    
    const campaign = await MarketingEngine.createAdCampaign(product, landingPage);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  try {
    const report = await ComplianceService.getComplianceReport(req.user.id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating compliance report' });
  }
};

exports.saveContentSuggestion = async (req, res) => {
  try {
    const { title, content, platform, scheduledTime } = req.body;
    const suggestion = await ContentSuggestion.create({
      title,
      content,
      platform,
      suggestedTime: scheduledTime,
      userId: req.user.id,
      complianceScore: 100
    });
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ message: 'Error saving content suggestion' });
  }
};

exports.getContentSuggestions = async (req, res) => {
  try {
    const suggestions = await ContentSuggestion.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content suggestions' });
  }
};
