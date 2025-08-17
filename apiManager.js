class APIManager {
  static API_KEY = ""; // <-- place your key here only if you understand the risk (recommended: leave empty and use fallback)
  static async generateQuiz(lessonTitle, difficulty) {
    // If no key, return fallback
    if (!this.API_KEY) return this.getFallbackQuestions(lessonTitle, difficulty);

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${this.API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: `Create 3 ${difficulty} quiz questions about "${lessonTitle}" returning JSON` }],
          max_tokens: 1000
        })
      });
      const data = await response.json();
      const txt = data?.choices?.[0]?.message?.content || "";
      try {
        const parsed = JSON.parse(txt);
        return parsed.questions || this.getFallbackQuestions(lessonTitle, difficulty);
      } catch (e) {
        return this.getFallbackQuestions(lessonTitle,difficulty);
      }
    } catch (e) {
      console.error('DeepSeek error', e);
      return this.getFallbackQuestions(lessonTitle, difficulty);
    }
  }

  static getFallbackQuestions(lessonTitle, difficulty) {
    return [
      { type: "mcq", question: `What is the main idea of "${lessonTitle}"?`, options: ["A","B","C","D"], answer: "C" },
      { type: "fill", question: `${lessonTitle} primarily involves _____.`, answer: "concept" },
      { type: "explain", question: `Explain how ${lessonTitle} applies in real life.`, answer: "" }
    ];
  }
}
