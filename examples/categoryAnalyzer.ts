import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dotenv from 'dotenv';

dotenv.config();

// Tipado para un post de Reddit
interface RedditPost {
  title: string;
  content: string;
}

// Definición del esquema Zod para el análisis de categorías con descripciones
const PostCategoryAnalysisSchema = z.object({
  solutionRequests: z.boolean().describe("Posts donde las personas buscan soluciones a problemas"),
  painAndAnger: z.boolean().describe("Posts donde las personas expresan dolor o enojo"),
  adviceRequests: z.boolean().describe("Posts donde las personas buscan consejos"),
  moneyTalk: z.boolean().describe("Posts donde las personas hablan sobre gastar dinero"),
});

// Tipo inferido del esquema Zod
type PostCategoryAnalysisType = z.infer<typeof PostCategoryAnalysisSchema>;

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para generar el prompt con las descripciones de las categorías
function generateCategoryPrompt(): string {
  return Object.entries(PostCategoryAnalysisSchema.shape).map(([key, value]) => {
    return `${key}: ${value.description}`;
  }).join('\n');
}

// Función para analizar una publicación de Reddit usando OpenAI
async function analyzeRedditPost(post: RedditPost): Promise<PostCategoryAnalysisType | null> {
  const categoryPrompt = generateCategoryPrompt();

  const prompt = `Analiza el siguiente post de Reddit:
  Título: ${post.title}
  Contenido: ${post.content}
  
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

  return completion.choices[0].message.parsed;
}

// Ejemplo de uso
async function main() {

  const post: RedditPost = {
    title: "Que ciudades visitar en Japón?",
    content: "Estoy planeando un viaje a Japón y quiero saber que ciudades visitar. ¿Alguien tiene alguna idea?"
  };

  try {
    const result = await analyzeRedditPost(post);
    console.log(result);
  } catch (error) {
    console.error("Error al analizar el post:", error);
  }
}

main();