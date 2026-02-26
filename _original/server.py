#!/usr/bin/env python3
"""
新闻稿智能评审 - 后端服务
使用Python标准库http.server，无需额外依赖
- GET /  → 托管 index.html
- POST /api/analyze → 代理请求到硅基流动API
"""

import json
import os
import urllib.request
import urllib.error
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8080
SILICONFLOW_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL = "deepseek-ai/DeepSeek-V3"

# 评审提示词
SYSTEM_PROMPT = """你是一位资深的新闻编辑审稿专家，拥有20年央视新闻审稿经验。请对用户提交的新闻稿进行专业评审。

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

注意：只返回JSON，不要有任何额外的文字说明、markdown标记或代码块标记。"""


class NewsReviewHandler(SimpleHTTPRequestHandler):
    """自定义请求处理器"""

    def __init__(self, *args, **kwargs):
        # 设置静态文件目录为脚本所在目录
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def do_POST(self):
        if self.path == "/api/analyze":
            self._handle_analyze()
        else:
            self.send_error(404, "Not Found")

    def _handle_analyze(self):
        """处理新闻稿评审请求，代理到硅基流动API"""
        # 读取API Key
        api_key = os.getenv("SILICONFLOW_API_KEY")
        if not api_key:
            self._send_json(500, {
                "error": "服务器未配置 SILICONFLOW_API_KEY 环境变量"
            })
            return

        # 读取请求体
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))
            article = data.get("article", "").strip()
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "请求格式错误"})
            return

        if not article:
            self._send_json(400, {"error": "请提供新闻稿内容"})
            return

        if len(article) < 20:
            self._send_json(400, {"error": "新闻稿内容过短，请至少提供20个字符"})
            return

        # 构造硅基流动API请求
        api_payload = json.dumps({
            "model": MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请评审以下新闻稿：\n\n{article}"}
            ],
            "temperature": 0.3,
            "max_tokens": 2000,
            "response_format": {"type": "json_object"}
        }).encode("utf-8")

        req = urllib.request.Request(
            SILICONFLOW_URL,
            data=api_payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )

        try:
            # 读取系统代理设置
            proxy_url = os.getenv("https_proxy") or os.getenv("HTTPS_PROXY") or os.getenv("http_proxy") or os.getenv("HTTP_PROXY")
            if proxy_url:
                proxy_handler = urllib.request.ProxyHandler({"http": proxy_url, "https": proxy_url})
            else:
                proxy_handler = urllib.request.ProxyHandler({})
            opener = urllib.request.build_opener(proxy_handler)
            with opener.open(req, timeout=60) as resp:
                result = json.loads(resp.read().decode("utf-8"))

            # 提取AI回复内容
            ai_content = result["choices"][0]["message"]["content"]

            # 清理可能的markdown代码块标记
            ai_content = ai_content.strip()
            if ai_content.startswith("```json"):
                ai_content = ai_content[7:]
            elif ai_content.startswith("```"):
                ai_content = ai_content[3:]
            if ai_content.endswith("```"):
                ai_content = ai_content[:-3]
            ai_content = ai_content.strip()

            # 解析JSON
            review_result = json.loads(ai_content)
            self._send_json(200, {"success": True, "data": review_result})

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            print(f"[API Error] {e.code}: {error_body}")
            self._send_json(502, {
                "error": f"AI服务返回错误 ({e.code})，请稍后重试"
            })
        except urllib.error.URLError as e:
            print(f"[Network Error] {e.reason}")
            self._send_json(502, {
                "error": "无法连接AI服务，请检查网络"
            })
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            print(f"[Parse Error] {e}")
            self._send_json(500, {
                "error": "AI返回的数据格式异常，请重试"
            })

    def _send_json(self, status_code, data):
        """发送JSON响应"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    server = HTTPServer(("0.0.0.0", PORT), NewsReviewHandler)
    print(f"╔══════════════════════════════════════════╗")
    print(f"║   新闻稿智能评审系统 - 服务已启动        ║")
    print(f"║   访问: http://localhost:{PORT}            ║")
    print(f"║   按 Ctrl+C 停止服务                     ║")
    print(f"╚══════════════════════════════════════════╝")

    api_key = os.getenv("SILICONFLOW_API_KEY")
    if api_key:
        print(f"[OK] SILICONFLOW_API_KEY 已加载（{api_key[:8]}...）")
    else:
        print("[WARN] SILICONFLOW_API_KEY 未设置，API调用将失败")
        print("       请设置环境变量: export SILICONFLOW_API_KEY=your_key")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] 服务已停止")
        server.server_close()


if __name__ == "__main__":
    main()
