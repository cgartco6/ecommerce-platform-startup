const moment = require('moment-timezone');

const platformPeakTimes = {
  facebook: {
    ZA: [19, 20, 21, 12, 13], // 7-9pm, 12-1pm
    US: [12, 13, 19, 20, 21],
    UK: [12, 13, 19, 20, 21],
    default: [18, 19, 20, 12, 13]
  },
  instagram: {
    ZA: [18, 19, 20, 11, 12], // 6-8pm, 11am-12pm
    US: [11, 12, 18, 19, 20],
    default: [17, 18, 19, 12, 13]
  },
  tiktok: {
    ZA: [19, 20, 21, 15, 16, 22], // 7-9pm, 3-4pm, 10pm
    US: [16, 17, 18, 19, 20, 21],
    default: [18, 19, 20, 21, 22]
  },
  twitter: {
    ZA: [12, 13, 17, 18, 8, 9], // lunch, after work, morning
    default: [12, 13, 17, 18, 9]
  },
  linkedin: {
    ZA: [7, 8, 12, 13, 17], // morning, lunch, evening
    default: [8, 9, 12, 13, 17]
  }
};

function getBestPostTimes(platform, countryCode = 'ZA') {
  const peaks = platformPeakTimes[platform] || platformPeakTimes.facebook;
  const hours = peaks[countryCode] || peaks.default || peaks;
  
  const now = moment().tz('Africa/Johannesburg');
  const suggestions = [];
  
  for (const hour of hours) {
    let suggestionTime = now.clone().set({ hour, minute: 0, second: 0 });
    if (suggestionTime.isBefore(now)) {
      suggestionTime = suggestionTime.add(1, 'day');
    }
    
    suggestions.push({
      hour,
      time: suggestionTime.toDate(),
      timeString: suggestionTime.format('dddd, MMMM Do YYYY, h:mm A'),
      platform,
      predictedEngagement: this.calculatePredictedEngagement(platform, hour)
    });
  }
  
  return suggestions.slice(0, 5);
}

function calculatePredictedEngagement(platform, hour) {
  const baseRates = {
    facebook: 0.05,
    instagram: 0.08,
    tiktok: 0.12,
    twitter: 0.03,
    linkedin: 0.04
  };
  
  let multiplier = 1;
  if ([19, 20, 21].includes(hour)) multiplier = 1.5;
  if ([12, 13].includes(hour)) multiplier = 1.3;
  if ([22, 23, 0, 1, 2, 3, 4, 5].includes(hour)) multiplier = 0.5;
  
  return (baseRates[platform] || 0.05) * multiplier;
}

function getImpulseBuyerOptimalTimes() {
  // Impulse buyers peak: evenings (7-10pm) and weekends
  return {
    weekdays: [19, 20, 21, 22],
    weekends: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    bestDay: 'Friday',
    bestHour: 20,
    explanation: 'Impulse buying peaks during evening relaxation hours and weekends when people have more free time'
  };
}

module.exports = {
  getBestPostTimes,
  calculatePredictedEngagement,
  getImpulseBuyerOptimalTimes
};
