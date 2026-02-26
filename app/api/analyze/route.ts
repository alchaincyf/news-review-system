import { NextRequest, NextResponse } from 'next/server';

const SILICONFLOW_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-V3';

const SYSTEM_PROMPT = `你是一位资深的新闻编辑审稿专家，拥有20年央视新闻审稿经验。请对用户提交的新闻稿进行专业评审。

你必须严格按照以下JSON格式返回结果，不要返回任何其他内容：

{
  "objectivity": {
    "score": 0-100的整数,
    "comment": "一句话评语，不超过30字"
  },
  "density": {
    "score": 0-100的整数,
    "comment": "一句话评语，不超过30字"
  },
  "readability": {
    "score": 0-100的整数,
    "comment": "一句话评语，不超过30字"
  },
  "headline": {
    "score": 0-100的整数,
    "comment": "一句话评语，不超过30字"
  },
  "structure": {
    "score": 0-100的整数,
    "comment": "一句话评语，不超过30字"
  },
  "suggestions": [
    "具体改进建议1",
    "具体改进建议2",
    "具体改进建议3"
  ]
}

评分维度说明：
- objectivity（客观性）：是否客观中立，有无主观臆断或偏颇表述
- density（信息密度）：单位篇幅内有效信息量，是否有冗余废话
- readability（可读性）：语言是否流畅，逻辑是否清晰，受众是否易理解
- headline（标题吸引力）：标题是否准确概括内容，是否有吸引力但不标题党
- structure（结构完整度）：导语、主体、结尾是否完整，段落衔接是否自然

请根据新闻专业标准严格评分，不要给出虚高分数。一般新闻稿的分数应在60-85之间，只有非常优秀的稿件才能获得85+。

注意：只返回JSON，不要有任何额外的文字说明、markdown标记或代码块标记。`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: '服务器未配置 SILICONFLOW_API_KEY 环境变量' },
      { status: 500 },
    );
  }

  let article: string;
  try {
    const body = await request.json();
    article = (body.article || '').trim();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  if (!article) {
    return NextResponse.json({ error: '请提供新闻稿内容' }, { status: 400 });
  }
  if (article.length < 20) {
    return NextResponse.json(
      { error: '新闻稿内容过短，请至少提供20个字符' },
      { status: 400 },
    );
  }

  try {
    const resp = await fetch(SILICONFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `请评审以下新闻稿：\n\n${article}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`[API Error] ${resp.status}: ${errorText}`);
      return NextResponse.json(
        { error: `AI服务返回错误 (${resp.status})，请稍后重试` },
        { status: 502 },
      );
    }

    const result = await resp.json();
    let aiContent: string = result.choices[0].message.content;

    // 清理可能的 markdown 代码块标记
    aiContent = aiContent.trim();
    if (aiContent.startsWith('```json')) {
      aiContent = aiContent.slice(7);
    } else if (aiContent.startsWith('```')) {
      aiContent = aiContent.slice(3);
    }
    if (aiContent.endsWith('```')) {
      aiContent = aiContent.slice(0, -3);
    }
    aiContent = aiContent.trim();

    const reviewResult = JSON.parse(aiContent);
    return NextResponse.json({ success: true, data: reviewResult });
  } catch (err) {
    console.error('[Parse/Network Error]', err);
    return NextResponse.json(
      { error: 'AI返回的数据格式异常，请重试' },
      { status: 500 },
    );
  }
}
