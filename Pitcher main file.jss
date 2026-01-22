import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// The "Video Example" Logic Prompt
const SYSTEM_INSTRUCTIONS = `
You are an AI Pitch Generator modeled after the high-energy video provided.
Your goal is to turn product details into a punchy, 60-second video script.
STRUCTURE:
1. THE HOOK (0-10s): Start with a pattern interrupt. (e.g., "Stop doing [X]!")
2. THE PAIN (10-25s): Agitate the problem from the user's video. Make it feel urgent.
3. THE SOLUTION (25-45s): Present the product as the 'Hero'. Use short, punchy sentences.
4. THE PROOF (45-55s): Mention a 'win' or a logic-based benefit.
5. CTA (55-60s): Hard call to action. 
TONE: Aggressive, helpful, and high-energy. No fluff.
`;

app.post('/generate-pitch', async (req, res) => {
    try {
        const { product_name, pain_point } = req.body;

        // Check for Bearer Token (Security from your OpenAPI spec)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing Token' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_INSTRUCTIONS },
                { 
                  role: "user", 
                  content: `Product: ${product_name}. Main Pain Point: ${pain_point}. Generate the script.` 
                }
            ],
            temperature: 0.8,
        });

        const script = completion.choices[0].message.content;
        
        res.json({
            success: true,
            script: script,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Pitch Generation Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Pitch GPT Server running on port ${PORT}`));
