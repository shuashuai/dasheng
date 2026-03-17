import { CoverGenerator } from './dist/core/services/cover-generator.js';

const gen = new CoverGenerator();

console.log('🎨 测试自定义尺寸和 Prompt\n');

// 测试1: 自定义宽高 + Prompt
try {
  const result1 = await gen.generate({
    width: 800,
    height: 600,
    style: 'tech',
    title: '自定义尺寸测试',
    subtitle: '800x600 分辨率',
    author: '测试作者',
    prompt: 'A futuristic tech blog cover with neon lights and circuit patterns'
  }, 'test/cover-custom-size-prompt.png');
  console.log('✅ 测试1 - 自定义尺寸+Prompt:', result1.outputPath);
} catch (e) {
  console.error('❌ 测试1失败:', e.message);
}

// 测试2: 超大尺寸
try {
  const result2 = await gen.generate({
    width: 2560,
    height: 1440,
    style: 'gradient',
    title: '4K 超高清封面',
    subtitle: '2560x1440 分辨率',
    author: '大圣团队',
    prompt: 'Vibrant gradient with flowing colors'
  }, 'test/cover-4k.png');
  console.log('✅ 测试2 - 4K尺寸:', result2.outputPath);
} catch (e) {
  console.error('❌ 测试2失败:', e.message);
}

// 测试3: 竖版小尺寸（手机海报）
try {
  const result3 = await gen.generate({
    width: 600,
    height: 1000,
    style: 'illustration',
    title: '手机海报',
    subtitle: '600x1000 竖版',
    author: '设计师',
    prompt: 'Warm hand-drawn illustration style'
  }, 'test/cover-mobile.png');
  console.log('✅ 测试3 - 手机竖版:', result3.outputPath);
} catch (e) {
  console.error('❌ 测试3失败:', e.message);
}

// 测试4: 无 Prompt（正常情况）
try {
  const result4 = await gen.generate({
    width: 1200,
    height: 630,
    style: 'minimal',
    title: '简约封面',
    subtitle: '没有 Prompt 的测试',
    author: '大圣团队'
  }, 'test/cover-no-prompt.png');
  console.log('✅ 测试4 - 无Prompt:', result4.outputPath);
} catch (e) {
  console.error('❌ 测试4失败:', e.message);
}

console.log('\n🎉 全部测试完成！');
