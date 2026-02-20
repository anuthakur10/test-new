export function generateAnalyticsSnapshot() {
  // followers between 5k and 500k
  const followers = Math.floor(Math.random() * (500000 - 5000 + 1)) + 5000;
  // engagement between 1% and 10%
  const engagementRate = +(Math.random() * (10 - 1) + 1).toFixed(2);
  const avgLikes = Math.round((followers * (engagementRate / 100)));
  const avgComments = Math.round(avgLikes * 0.1);
  return { followers, engagementRate, avgLikes, avgComments };
}

export function generateHistorical(days = 30) {
  const arr = [];
  let base = Math.floor(Math.random() * (500000 - 5000 + 1)) + 5000;
  for (let i = days - 1; i >= 0; i--) {
    // small daily fluctuation
    const change = Math.floor((Math.random() - 0.5) * base * 0.02);
    base = Math.max(100, base + change);
    const engagement = +(Math.random() * (10 - 1) + 1).toFixed(2);
    arr.push({ date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), followers: base, engagementRate: engagement });
  }
  return arr;
}
