import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class AIService {
  async generateResponse(userMessage, context, persona = 'riley') {
    const systemPrompt = this.getPersonaPrompt(persona, context);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const aiResponse = response.choices[0].message.content;
      const insights = this.extractInsights(userMessage, aiResponse);

      return {
        response: aiResponse,
        insights: insights,
        followUpQuestions: this.generateFollowUp(userMessage, context)
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        response: "I'm having trouble connecting right now. Could you please try rephrasing your response?",
        insights: [],
        followUpQuestions: []
      };
    }
  }

  getPersonaPrompt(persona, context) {
    const personas = {
      riley: `You are Riley, a strategic priority consultant for TAFE NSW.
You help identify and prioritise strategic initiatives for the Health, Wellbeing & Human Services faculty.
Be warm, strategic, and ask thoughtful follow-up questions.
The stakeholder is a ${context.role} in ${context.department}.
Use Australian English and focus on practical, implementable solutions.`,

      morgan: `You are Morgan, a capacity analysis specialist for TAFE NSW.
You help assess current capacity and identify optimization opportunities.
Be analytical, data-driven, and thorough in your analysis.
The stakeholder is a ${context.role} in ${context.department}.`,

      alex: `You are Alex, a risk assessment specialist for TAFE NSW.
You help identify, assess, and mitigate operational and strategic risks.
Be thorough, systematic, and focus on practical risk management strategies.
The stakeholder is a ${context.role} in ${context.department}.`,

      jordan: `You are Jordan, a stakeholder engagement specialist for TAFE NSW.
You help develop comprehensive engagement strategies and communication plans.
Be collaborative, inclusive, and focus on building strong stakeholder relationships.
The stakeholder is a ${context.role} in ${context.department}.`
    };

    return personas[persona] || personas.riley;
  }

  extractInsights(userMessage, aiResponse) {
    const insights = [];
    const message = userMessage.toLowerCase();

    // Simple keyword-based insights
    if (message.includes('staff') || message.includes('recruitment')) {
      insights.push({
        type: 'pattern',
        message: 'Staffing concerns are commonly reported across departments in the health sector.',
        confidence: 0.8
      });
    }

    if (message.includes('student') || message.includes('placement')) {
      insights.push({
        type: 'opportunity',
        message: 'Student placement challenges often indicate partnership development opportunities.',
        confidence: 0.7
      });
    }

    if (message.includes('technology') || message.includes('system')) {
      insights.push({
        type: 'trend',
        message: 'Technology infrastructure is a recurring theme in stakeholder feedback.',
        confidence: 0.75
      });
    }

    return insights;
  }

  generateFollowUp(userMessage, context) {
    const followUps = [
      "Can you tell me more about the specific challenges you're facing?",
      "What would an ideal solution look like from your perspective?",
      "Are there any resource constraints we should consider?",
      "How does this impact your day-to-day operations?",
      "What support would you need to address this effectively?"
    ];

    return [followUps[Math.floor(Math.random() * followUps.length)]];
  }
}
