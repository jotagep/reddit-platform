import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { RedditPost } from './reddit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Definición del esquema Zod para el análisis de categorías con descripciones
const PostCategoryAnalysisSchema = z.object({
  solutionRequests: z.boolean().describe("Posts donde las personas buscan soluciones a problemas"),
  painAndAnger: z.boolean().describe("Posts donde las personas expresan dolor o enojo"),
  adviceRequests: z.boolean().describe("Posts donde las personas buscan consejos"),
  moneyTalk: z.boolean().describe("Posts donde las personas hablan sobre gastar dinero"),
});

export type PostAnalysis = z.infer<typeof PostCategoryAnalysisSchema>;
export type WithCategory<T> = T & { category: PostAnalysis };

// Función para generar el prompt con las descripciones de las categorías
function generateCategoryPrompt(): string {
  return Object.entries(PostCategoryAnalysisSchema.shape).map(([key, value]) => {
    return `${key}: ${value.description}`;
  }).join('\n');
}

export async function analyzePost(post: RedditPost): Promise<PostAnalysis> {
  const categoryPrompt = generateCategoryPrompt();

  const prompt = `Analiza el siguiente post de Reddit:
  Título: ${post.title}
  Contenido: ${post.content || '(No hay contenido adicional)'}
  
  Categoriza el post según estas categorías:
  ${categoryPrompt}
  `;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini", // Asegúrate de usar un modelo compatible con la función de análisis estructurado
    messages: [
      { 
        role: "system", 
        content: "Eres un experto en análisis de contenido de Reddit. Analizarás posts y los categorizarás según criterios específicos."
      },
      { 
        role: "user", 
        content: prompt,
      },
    ],
    response_format: zodResponseFormat(PostCategoryAnalysisSchema, "categorize_post"),
  });

  return completion.choices[0].message.parsed || { solutionRequests: false, painAndAnger: false, adviceRequests: false, moneyTalk: false } 
}

export async function analyzePostsBatch(posts: RedditPost[]): Promise<WithCategory<RedditPost>[]> {
  const batchSize = 10; // Ajustar según los límites de la API
  const results: WithCategory<RedditPost>[] = [];

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(analyzePost));
    results.push(...batchResults.map((result, index) => ({ ...batch[index], category: result })));
    
    // Esperar un poco entre lotes para evitar superar los límites de tasa
    if (i + batchSize < posts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}