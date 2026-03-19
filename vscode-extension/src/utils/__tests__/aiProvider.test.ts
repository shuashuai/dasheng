import * as assert from 'assert';
import { MockProvider } from '../aiProvider';

suite('AI Provider Test Suite', () => {
  let mockProvider: MockProvider;

  setup(() => {
    mockProvider = new MockProvider();
  });

  test('MockProvider should translate text', async () => {
    const result = await mockProvider.translate('Hello', { to: 'zh-CN' });

    assert.ok(
      result.includes('Hello') || result.includes('中文'),
      'Should return translated or mock text'
    );
  });

  test('MockProvider should translate batch', async () => {
    const texts = ['Hello', 'World'];
    const results = await mockProvider.translateBatch(texts, { to: 'zh-CN' });

    assert.strictEqual(results.length, 2, 'Should return same number of results');
  });

  test('MockProvider should complete prompt', async () => {
    const result = await mockProvider.complete('Write a blog about AI');

    assert.ok(result.length > 0, 'Should return non-empty content');
    assert.ok(typeof result === 'string', 'Should return string');
  });
});
