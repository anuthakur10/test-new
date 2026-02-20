import { strict as assert } from 'assert';
import { describe, it } from 'node:test';
import { generateAnalyticsSnapshot, generateHistorical } from '../utils/analyticsGenerator.js';

describe('Analytics generator', () => {
  it('generateAnalyticsSnapshot returns expected fields and ranges', () => {
    const snap = generateAnalyticsSnapshot();
    assert.equal(typeof snap.followers, 'number');
    assert.ok(snap.followers >= 5000 && snap.followers <= 500000);
    assert.equal(typeof snap.engagementRate, 'number');
    assert.ok(snap.engagementRate >= 1 && snap.engagementRate <= 10);
    assert.equal(typeof snap.avgLikes, 'number');
    assert.equal(typeof snap.avgComments, 'number');
  });

  it('generateHistorical returns array of given length with date and values', () => {
    const hist = generateHistorical(10);
    assert.ok(Array.isArray(hist));
    assert.equal(hist.length, 10);
    hist.forEach(h => {
      assert.ok(h.date instanceof Date);
      assert.equal(typeof h.followers, 'number');
      assert.equal(typeof h.engagementRate, 'number');
    });
  });
});
