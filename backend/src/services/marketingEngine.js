const { OpenAI } = require('openai');
const { ComplianceRule, ContentSuggestion, AdCampaign, LandingPage } = require('../models');
const { getBestPostTimes } = require('../utils/bestTimeAlgorithm');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class MarketingEngine {
  async generateContent(product, platform, targetAudience = 'impulse buyers') {
    const prompt = `Create engaging social media content for ${platform} about ${product.name}. 
    Target audience: ${targetAudience}. 
    Product description: ${product.description}.
    Price: R${product.price}.
    Rules: No clickbait, no false claims, no "today only", no countdown timers, no urgency tactics.
    Be authentic, value-driven, and compelling for impulse buyers.
    Keep it under 200 characters for ${platform}.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150
    });
    
    return completion.choices[0].message.content;
  }
  
  async checkCompliance(content, platform) {
    const rules = await ComplianceRule.findAll({
      where: { platform, isActive: true }
    });
    
    let score = 100;
    const violations = [];
    
    for (const rule of rules) {
      if (rule.ruleType === 'prohibited_words') {
        const prohibitedWords = rule.ruleValue.split(',');
        for (const word of prohibitedWords) {
          if (content.toLowerCase().includes(word.toLowerCase())) {
            score -= 20;
            violations.push(`Contains prohibited word: ${word}`);
          }
        }
      }
    }
    
    return { score, violations, isCompliant: score >= 70 };
  }
  
  async getBestTimesToPost(platform, targetCountry = 'ZA') {
    return getBestPostTimes(platform, targetCountry);
  }
  
  async createContentSuggestion(product, platform, scheduledTime = null) {
    const content = await this.generateContent(product, platform);
    const compliance = await this.checkCompliance(content, platform);
    const bestTimes = await this.getBestTimesToPost(platform);
    
    const suggestion = await ContentSuggestion.create({
      title: `Suggested post for ${product.name} on ${platform}`,
      content: content,
      platform: platform,
      suggestedTime: scheduledTime || bestTimes[0]?.time,
      engagementScore: 75,
      complianceScore: compliance.score,
      isApproved: compliance.isCompliant,
      aiGenerated: true
    });
    
    return { suggestion, compliance };
  }
  
  async createAdCampaign(product, landingPage) {
    const content = await this.generateContent(product, 'facebook');
    const compliance = await this.checkCompliance(content, 'facebook');
    
    if (!compliance.isCompliant) {
      throw new Error('Ad content not compliant: ' + compliance.violations.join(', '));
    }
    
    const campaign = await AdCampaign.create({
      name: `Campaign for ${product.name}`,
      landingPageId: landingPage.id,
      targetUrl: `/landing/${landingPage.slug}`,
      adCopy: content,
      platform: 'facebook',
      status: 'active'
    });
    
    return campaign;
  }
  
  async trackCampaignPerformance(campaignId) {
    const campaign = await AdCampaign.findByPk(campaignId, {
      include: [{ model: LandingPage }]
    });
    
    const conversionRate = campaign.landingPage.conversionRate;
    const costPerClick = campaign.budget / (campaign.clicks || 1);
    const roi = (campaign.conversions * 100) / (campaign.budget || 1);
    
    return {
      campaign,
      metrics: {
        ctr: (campaign.clicks / (campaign.impressions || 1)) * 100,
        conversionRate,
        costPerClick,
        roi
      }
    };
  }
}

module.exports = new MarketingEngine();
