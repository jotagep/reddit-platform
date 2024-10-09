import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { RedditPost } from './reddit';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.helicone.ai/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
  },
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

async function performOpenAIAnalysis(post: RedditPost): Promise<PostAnalysis> {
  const categoryPrompt = generateCategoryPrompt();

  const prompt = `
    Analiza el siguiente post de Reddit:

    # CATEGORY CRITERIA: """
    Categoriza el post según estas categorías:
    ${categoryPrompt}
    """

    # POST DETAILS: """
    Título: ${post.title}
    Contenido: ${post.content || '(No hay contenido adicional)'}
    """
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

export async function analyzePost(post: RedditPost): Promise<PostAnalysis> {
  // Verificar si ya existe un análisis reciente
  const { data: existingAnalysis } = await supabase
    .from('post_analysis')
    .select('*')
    .eq('post_id', post.id)
    .single();

  if (existingAnalysis && (new Date().getTime() - new Date(existingAnalysis.analysis_date).getTime()) < 7 * 24 * 60 * 60 * 1000) {
    const parsedAnalysis: PostAnalysis = {
      solutionRequests: existingAnalysis.solution_requests,
      painAndAnger: existingAnalysis.pain_and_anger,
      adviceRequests: existingAnalysis.advice_requests,
      moneyTalk: existingAnalysis.money_talk,
    }
    return parsedAnalysis;
  }

  // Si no hay análisis o es antiguo, realizar un nuevo análisis
  const analysis = await performOpenAIAnalysis(post);

  // Guardar o actualizar el análisis en Supabase
  await supabase
    .from('post_analysis')
    .upsert({
      post_id: post.id,
      solution_requests: analysis.solutionRequests,
      pain_and_anger: analysis.painAndAnger,
      advice_requests: analysis.adviceRequests,
      money_talk: analysis.moneyTalk,
      analysis_date: new Date().toISOString()
    });

  return analysis;
}

export async function analyzePostsBatch(posts: RedditPost[]): Promise<WithCategory<RedditPost>[]> {
  //const batchSize = 20; // Ajustar según los límites de la API
  const results: WithCategory<RedditPost>[] = [];

  for (const post of posts) {
    const analysis = await analyzePost(post);
    results.push({ ...post, category: analysis });
  }

  return results;
}