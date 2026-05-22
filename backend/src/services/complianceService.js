const { ComplianceRule } = require('../models');

class ComplianceService {
  async loadPlatformRules() {
    const defaultRules = [
      { platform: 'facebook', ruleType: 'prohibited_words', ruleValue: 'miracle,cure,guaranteed,free money,get rich quick', isActive: true, penalty: 'Post rejected' },
      { platform: 'facebook', ruleType: 'timing', ruleValue: 'max 2 posts per day', isActive: true, penalty: 'Shadow ban' },
      { platform: 'instagram', ruleType: 'prohibited_words', ruleValue: 'buy now,limited stock,last chance', isActive: true, penalty: 'Post removed' },
      { platform: 'instagram', ruleType: 'frequency', ruleValue: 'max 3 posts per day', isActive: true, penalty: 'Action block' },
      { platform: 'tiktok', ruleType: 'prohibited_words', ruleValue: 'scam,miracle,money back', isActive: true, penalty: 'Account suspension' },
      { platform: 'twitter', ruleType: 'prohibited_words', ruleValue: 'click here,profit,earn money fast', isActive: true, penalty: 'Tweet hidden' },
      { platform: 'google', ruleType: 'content', ruleValue: 'No misleading claims', isActive: true, penalty: 'Ad disapproval' }
    ];
    
    for (const rule of defaultRules) {
      await ComplianceRule.findOrCreate({
        where: { platform: rule.platform, ruleType: rule.ruleType },
        defaults: rule
      });
    }
  }
  
  async validatePostContent(content, platform) {
    const rules = await ComplianceRule.findAll({
      where: { platform, isActive: true }
    });
    
    const violations = [];
    
    for (const rule of rules) {
      if (rule.ruleType === 'prohibited_words') {
        const words = rule.ruleValue.split(',');
        for (const word of words) {
          if (content.toLowerCase().includes(word.trim().toLowerCase())) {
            violations.push({
              rule: rule,
              word: word.trim(),
              penalty: rule.penalty
            });
          }
        }
      }
    }
    
    return {
      isValid: violations.length === 0,
      violations,
      score: Math.max(0, 100 - (violations.length * 15))
    };
  }
  
  async getComplianceReport(userId) {
    const userContent = await ContentSuggestion.findAll({
      where: { userId }
    });
    
    const totalPosts = userContent.length;
    const compliantPosts = userContent.filter(p => p.complianceScore >= 70).length;
    const flaggedPosts = userContent.filter(p => p.complianceScore < 70).length;
    
    return {
      totalPosts,
      compliantPercentage: (compliantPosts / totalPosts) * 100,
      flaggedPercentage: (flaggedPosts / totalPosts) * 100,
      recommendations: [
        'Avoid urgency-based language',
        'Do not use false claims about product effectiveness',
        'Do not use countdown timers or limited-time offers',
        'Be transparent about pricing'
      ]
    };
  }
}

module.exports = new ComplianceService();
