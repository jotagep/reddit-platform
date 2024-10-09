# Documento de Diseño para la Integración de Supabase en la Plataforma de Análisis de Reddit

## Resumen del Proyecto Actual

La Plataforma de Análisis de Reddit es una aplicación Next.js que permite a los usuarios ver y analizar posts de diferentes subreddits. Actualmente, la aplicación obtiene datos de Reddit y realiza análisis con OpenAI cada vez que se accede a la página de un subreddit, lo cual no es óptimo en términos de rendimiento y costos.

## Objetivo de la Integración con Supabase

El objetivo es implementar un sistema de almacenamiento en caché y persistencia de datos utilizando Supabase. Esto permitirá:

1. Reducir las llamadas a la API de Reddit y OpenAI.
2. Mejorar el tiempo de carga de la aplicación.
3. Mantener un historial de datos para análisis futuros.

## Estructura Actual del Proyecto

reddit-platform/
├── README.md
├── app
│   ├── api
│   │   └── reddit-posts
│   │       └── route.ts
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   └── subreddit
│       └── [subredditName]
│           ├── components
│           └── page.tsx
├── components
│   ├── AddSubredditModal.tsx
│   ├── SubredditCard.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       └── tabs.tsx
├── components.json
├── examples
│   ├── categoryAnalyzer.ts
│   └── redditFetcher.ts
├── instructions
│   └── instructions.md
├── lib
│   ├── openai.ts
│   ├── reddit.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json

## Componentes Principales a Modificar/Crear

1. **lib/supabase.ts**
   - Nuevo archivo para manejar la conexión y operaciones con Supabase.

2. **lib/reddit.ts**
   - Modificar para incluir lógica de caché con Supabase.

3. **lib/openai.ts**
   - Modificar para incluir lógica de caché con Supabase.

4. **app/api/reddit-posts/route.ts**
   - Actualizar para utilizar datos de Supabase cuando estén disponibles.

5. **app/subreddit/[subredditName]/page.tsx**
   - Modificar para manejar la obtención de datos desde Supabase.

## Diseño de la Base de Datos en Supabase

### Tablas Principales

1. **subreddits**
   - id: uuid
   - name: string
   - last_updated: timestamp

2. **posts**
   - id: uuid
   - subreddit_id: uuid (foreign key to subreddits.id)
   - title: string
   - content: text
   - author: string
   - created_utc: timestamp
   - score: integer
   - num_comments: integer
   - url: string
   - thumbnail: string

3. **post_analysis**
   - id: uuid
   - post_id: uuid (foreign key to posts.id)
   - solution_requests: boolean
   - pain_and_anger: boolean
   - advice_requests: boolean
   - money_talk: boolean
   - analysis_date: timestamp

## Flujo de Trabajo Propuesto

1. **Obtención de Datos de Reddit**
   - Verificar en Supabase si existen datos para el subreddit solicitado.
   - Si los datos existen y tienen menos de 24 horas, usarlos.
   - Si no existen o son antiguos, obtener nuevos datos de Reddit, guardarlos en Supabase y devolverlos.

2. **Análisis con OpenAI**
   - Para posts sin análisis o con análisis antiguo, realizar el análisis con OpenAI.
   - Guardar los resultados del análisis en Supabase.

3. **Actualización Periódica**
   - Implementar un trabajo programado (puede ser una función serverless en Supabase) para actualizar los datos cada 24 horas.

## Consideraciones de Seguridad

- Utilizar variables de entorno para las credenciales de Supabase.
- Implementar Row Level Security (RLS) en Supabase para proteger los datos.
- Asegurar que las operaciones de escritura solo se realicen desde endpoints autorizados.

## Pasos de Implementación Recomendados

1. **Configurar el proyecto Supabase**
   - Crear una nueva cuenta en Supabase si aún no tienes una.
   - Iniciar un nuevo proyecto en Supabase.
   - En la sección SQL del panel de Supabase, ejecutar los siguientes comandos para crear las tablas necesarias:

   ```sql
   -- Crear tabla subreddits
   CREATE TABLE subreddits (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name TEXT UNIQUE NOT NULL,
     last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );

   -- Crear tabla posts
   CREATE TABLE posts (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     subreddit_id UUID REFERENCES subreddits(id),
     title TEXT NOT NULL,
     content TEXT,
     author TEXT NOT NULL,
     created_utc TIMESTAMP WITH TIME ZONE NOT NULL,
     score INTEGER NOT NULL,
     num_comments INTEGER NOT NULL,
     url TEXT NOT NULL,
     thumbnail TEXT
   );

   -- Crear tabla post_analysis
   CREATE TABLE post_analysis (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     post_id UUID REFERENCES posts(id),
     solution_requests BOOLEAN,
     pain_and_anger BOOLEAN,
     advice_requests BOOLEAN,
     money_talk BOOLEAN,
     analysis_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Implementar la conexión básica con Supabase**
   - Instalar la biblioteca de Supabase: `npm install @supabase/supabase-js`
   - Crear un nuevo archivo `lib/supabase.ts` con el siguiente contenido:

   ```typescript:lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

   - Agregar las variables de entorno necesarias en el archivo `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

3. **Modificar `lib/reddit.ts` para incluir la lógica de caché**
   - Actualizar la función `fetchSubredditPosts` para que primero busque en Supabase y solo haga una llamada a la API de Reddit si es necesario:

   ```typescript:lib/reddit.ts
   import { supabase } from './supabase'

   export async function fetchSubredditPosts(subredditName: string) {
     // Buscar en Supabase primero
     const { data: subreddit } = await supabase
       .from('subreddits')
       .select('*')
       .eq('name', subredditName)
       .single()

     if (subreddit && (new Date().getTime() - new Date(subreddit.last_updated).getTime()) < 24 * 60 * 60 * 1000) {
       // Si los datos tienen menos de 24 horas, obtenerlos de Supabase
       const { data: posts } = await supabase
         .from('posts')
         .select('*')
         .eq('subreddit_id', subreddit.id)

       return posts
     } else {
       // Si no hay datos o son antiguos, obtener de Reddit y guardar en Supabase
       const posts = await fetchFromRedditAPI(subredditName)
       
       // Guardar o actualizar el subreddit
       const { data: updatedSubreddit } = await supabase
         .from('subreddits')
         .upsert({ name: subredditName, last_updated: new Date() })
         .select()
         .single()

       // Guardar los posts
       await supabase
         .from('posts')
         .upsert(posts.map(post => ({
           subreddit_id: updatedSubreddit.id,
           title: post.title,
           content: post.selftext,
           author: post.author,
           created_utc: new Date(post.created_utc * 1000),
           score: post.score,
           num_comments: post.num_comments,
           url: post.url,
           thumbnail: post.thumbnail
         })))

       return posts
     }
   }

   // Implementar fetchFromRedditAPI() si aún no existe
   ```

4. **Actualizar `lib/openai.ts` para trabajar con los datos almacenados en Supabase**
   - Modificar la función de análisis para que guarde los resultados en Supabase:

   ```typescript:lib/openai.ts
   import { supabase } from './supabase'

   export async function analyzePost(post) {
     // Verificar si ya existe un análisis reciente
     const { data: existingAnalysis } = await supabase
       .from('post_analysis')
       .select('*')
       .eq('post_id', post.id)
       .single()

     if (existingAnalysis && (new Date().getTime() - new Date(existingAnalysis.analysis_date).getTime()) < 7 * 24 * 60 * 60 * 1000) {
       return existingAnalysis
     }

     // Si no hay análisis o es antiguo, realizar un nuevo análisis
     const analysis = await performOpenAIAnalysis(post)

     // Guardar o actualizar el análisis en Supabase
     await supabase
       .from('post_analysis')
       .upsert({
         post_id: post.id,
         ...analysis,
         analysis_date: new Date()
       })

     return analysis
   }

   // Implementar performOpenAIAnalysis() si aún no existe
   ```

5. **Modificar los endpoints de API para utilizar la nueva lógica de caché**
   - Actualizar `app/api/reddit-posts/route.ts`:

   ```typescript:app/api/reddit-posts/route.ts
   import { fetchSubredditPosts } from '@/lib/reddit'
   import { analyzePost } from '@/lib/openai'

   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url)
     const subredditName = searchParams.get('subreddit')

     if (!subredditName) {
       return new Response('Subreddit name is required', { status: 400 })
     }

     try {
       const posts = await fetchSubredditPosts(subredditName)
       const analyzedPosts = await Promise.all(posts.map(analyzePost))

       return new Response(JSON.stringify(analyzedPosts), {
         headers: { 'Content-Type': 'application/json' },
       })
     } catch (error) {
       console.error('Error fetching subreddit posts:', error)
       return new Response('Error fetching subreddit posts', { status: 500 })
     }
   }
   ```

6. **Actualizar los componentes de React**
   - Modificar `app/subreddit/[subredditName]/page.tsx` para manejar los nuevos flujos de datos:

   ```typescript:app/subreddit/[subredditName]/page.tsx
   // ... (importaciones y código existente)

   const SubredditPage = async ({ params }: { params: { subredditName: string } }) => {
     const { subredditName } = params
     
     const posts = await fetchSubredditPosts(subredditName)
     const analyzedPosts = await Promise.all(posts.map(analyzePost))

     // ... (resto del código para renderizar la página)
   }

   export default SubredditPage
   ```

7. **Implementar la lógica de actualización periódica**
   - Crear una función serverless en Supabase para actualizar los datos periódicamente:
     - En el panel de Supabase, ir a la sección de Funciones.
     - Crear una nueva función llamada `updateSubredditData`.
     - Implementar la lógica para actualizar los datos de los subreddits más antiguos de 24 horas.
   - Configurar un trabajo programado en Supabase para ejecutar esta función cada 24 horas.

8. **Realizar pruebas exhaustivas**
   - Probar la obtención de datos para subreddits nuevos y existentes.
   - Verificar que los análisis se estén guardando y recuperando correctamente.
   - Comprobar el rendimiento de la aplicación con los datos en caché.
   - Asegurarse de que la actualización periódica funcione correctamente.

Estos pasos detallados te guiarán a través del proceso de integración de Supabase en tu Plataforma de Análisis de Reddit. Recuerda ajustar el código según las necesidades específicas de tu proyecto y mantener buenas prácticas de seguridad en todo momento.

## Conclusión

La integración de Supabase en la Plataforma de Análisis de Reddit permitirá una gestión más eficiente de los datos, reduciendo la carga en las APIs externas y mejorando el rendimiento general de la aplicación. Este enfoque también proporciona una base sólida para futuras expansiones y análisis de datos a largo plazo.