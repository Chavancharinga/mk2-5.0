

import { GoogleGenAI, Type } from "@google/genai";
import { WizardState, Business, NicheType, VisualStyle } from "../types";
import { config } from "../config";
import { searchSerpAPI } from "./serpApiService";

// Corrigido: Inicialização direta usando process.env.API_KEY conforme as diretrizes.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper para normalizar texto (remover acentos e lowercase)
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const generateSuperPrompt = async (state: WizardState): Promise<string> => {
  try {
    const isCustomMode = state.mode === 'custom';
    const contents: any[] = [];
    let imagePromptPart = "";

    // --- MULTIMODAL PART ---
    if (state.referenceImage) {
      const match = state.referenceImage.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const imageData = match[2];
        
        contents.push({
          inlineData: {
            mimeType,
            data: imageData,
          }
        });
        
        imagePromptPart = `
        INSTRUÇÃO CRÍTICA DE IMAGEM: O usuário forneceu uma imagem de referência.
        1. Analise a imagem em anexo para extrair sua identidade visual (design system). Extraia a paleta de cores, o estilo da tipografia (ex: serifada, sem serifa, moderna), a estrutura do layout (ex: minimalista, denso, baseado em grid) e o "mood" geral (ex: profissional, divertido, sombrio).
        2. Use esta análise para influenciar fortemente suas sugestões na seção "DESIGN SYSTEM & UX".
        3. PRIORIDADE: Se o usuário também especificou cores manualmente, você DEVE usar as cores do usuário como primárias, mas pode usar as cores secundárias da imagem para complementar. Se o usuário não especificou cores, use a paleta extraída da imagem.
        `;
      }
    }

    // Business/Project details
    let businessName: string;
    let niche: string;
    let locationContext: string | null = null;
    let mainObjective: string;
    let headline: string;
    let strategySection: string;
    let featuresList: string[];
    let colorsList: string;

    if (isCustomMode) {
      businessName = state.customProjectName;
      niche = "Projeto Personalizado";
      mainObjective = "Definido pela descrição do projeto";
      headline = `# 🚀 PROJETO WEB: ${businessName} [Sistema Personalizado]`;
      strategySection = `
        ## 1. INTELIGÊNCIA DE NEGÓCIO (STRATEGY)
        - **Tipo de Projeto:** Site Personalizado
        - **Ideia Principal:** ${state.customProjectDescription}
        - **Objetivo Principal:** (A IA deve inferir a partir da descrição, ex: Portfólio para atrair clientes, Blog para construir audiência, SaaS para vender assinaturas).
      `;
      featuresList = state.customFeatures;
      colorsList = state.customColors.map((color, i) => `* Cor ${i + 1}: ${color}`).join('\n        ');
    } else {
      businessName = state.selectedBusiness?.name || "Meu Negócio";
      niche = state.niche;
      
      // *** NOVA LÓGICA CONDICIONAL APLICADA AQUI ***
      const hasMapFeature = state.customization.features.includes("Mapa Interativo");

      if (hasMapFeature && state.selectedBusiness) {
        // Se a funcionalidade de mapa for selecionada, injeta todos os detalhes do negócio.
        locationContext = `
        - Localização Geral: ${state.location.city}, ${state.location.district}, ${state.location.country}
        - INFORMAÇÕES DO NEGÓCIO ESPECÍFICO (USAR PARA MAPA E SEO LOCAL):
          - Nome Exato: ${state.selectedBusiness.name}
          - Endereço Completo: ${state.selectedBusiness.address}
          - Coordenadas GPS (se disponíveis): Lat ${state.selectedBusiness.lat}, Lng ${state.selectedBusiness.lng}
      `;
      } else {
        // Comportamento original: usa apenas a localização geral.
        locationContext = `${state.location.city}, ${state.location.district}, ${state.location.country}`;
      }

      const isEcommerce = ['mercado', 'loja', 'venda', 'e-commerce'].some(k => niche.toLowerCase().includes(k)) || state.customization.features.includes("Catálogo de Serviços");
      mainObjective = isEcommerce ? 'Vendas Online Recorrentes & Delivery' : 'Agendamentos & Geração de Leads';
      headline = `# 🚀 PROJETO WEB: ${businessName} [Sistema de Alta Conversão]`;
      strategySection = `
        ## 1. INTELIGÊNCIA DE NEGÓCIO (STRATEGY)
        - **Nicho & Posicionamento:** ${niche} Premium em ${state.location.city}
        - **Objetivo Principal:** ${mainObjective}
      `;
      featuresList = state.customization.features;
      colorsList = state.customization.colors.map((color, i) => `* Cor ${i + 1}: ${color}`).join('\n        ');
    }

    // Common details
    const smartFeatures = [...featuresList];
    let styleSpecificInstructions = "";
    if (state.customization.style === VisualStyle.IMMERSIVE && !isCustomMode) {
      styleSpecificInstructions = `
      ### 🧊 3D & Immersive Elements (CRITICAL)
      - **Core Requirement:** Use 'Spline' or 'Three.js' / 'React Three Fiber' for hero elements.
      - **Visuals:** Floating 3D objects related to the project theme.
      `;
    }

    const textPrompt = `
      Act as a world-class Senior React Developer, Marketing Strategist, and Prompt Engineer.
      Your task is to generate a COMPREHENSIVE PROJECT SPECIFICATION (The "Super Prompt") in Markdown format.
      This specification will be used by an AI builder to create a high-conversion website.
      You must infer deep strategic details based on the limited input provided.

      ${imagePromptPart}

      INPUT DATA:
      - Project Mode: ${state.mode}
      ${isCustomMode ? 
      `- Project Name: ${businessName}
      - Project Description: ${state.customProjectDescription}` :
      `- Business Name: ${businessName}
      - Niche: ${niche}
      - Location Details: ${locationContext}`
      }
      - Selected Style: ${isCustomMode ? 'N/A, inferir da imagem/descrição' : state.customization.style}
      - Colors: ${isCustomMode ? state.customColors.join(', ') : state.customization.colors.join(', ')}
      - Features: ${smartFeatures.join(', ')}
      - Specific Details: ${isCustomMode ? 'N/A' : state.customization.customDescription || "N/A"}

      OUTPUT FORMAT (STRICTLY FOLLOW THIS MARKDOWN STRUCTURE):

      ${headline}

      ${strategySection}

      ### 👤 Persona Principal (AI Generated)
      - **Perfil:** [Create a detailed persona based on the project type and description]
      - **Dores/Problemas:** [List 3 major pain points this project solves]
      - **Objeções:** [List 3 common objections]

      ## 2. DESIGN SYSTEM & UX
      ### Identidade Visual
      - **Paleta de Cores:**
        ${colorsList}
      - **Tipografia:** [Suggest a professional font pairing]
      - **Animações:** Use Framer Motion para micro-interações e transições suaves.
      
      ${styleSpecificInstructions}

      ## 3. ESTRUTURA & FUNCIONALIDADES
      ### Sitemap Sugerido
      (A IA deve criar uma estrutura de páginas com base no tipo de projeto. Ex: para um portfólio, /home, /projetos, /sobre, /contato. Para um SaaS, /pricing, /features, /login.)

      ### Funcionalidades Ativas
      ${smartFeatures.map(f => `- [x] ${f}`).join('\n        ')}

      ## 4. SEO & MARKETING
      - **Keywords Foco:** [List 5 keywords relevant to the project]
      - **Meta Tags:** Sugira um Title e Description otimizados.
      
      ---
      **INSTRUÇÃO FINAL:**
      Gere este documento completo, preenchendo todas as lacunas com criatividade estratégica. O resultado deve ser um plano de ação pronto para um desenvolvedor sênior executar.
    `;
    contents.push(textPrompt);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    return response.text || "Error generating prompt. Please try again.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `⚠️ ERROR GENERATING PROMPT: ${error.message || error}`;
  }
};


export const generateSalesPitch = async (businessName: string, niche: string, location: string, tone: string = 'Profissional'): Promise<string> => {
  try {
    const prompt = `
      Você é um copywriter de resposta direta do Brasil, especialista em vender sites de alto valor para negócios locais que ainda não têm um site.
      Sua tarefa é escrever UMA ÚNICA mensagem de prospecção, pronta para copiar e colar.

      CLIENTE ALVO:
      - Nome: ${businessName}
      - Ramo: ${niche}
      - Cidade: ${location}

      REGRAS ESTRITAS:
      - A mensagem DEVE OBRIGATORIAMENTE começar com o gancho: "Olá, ${businessName}. Vi que vocês são uma referência em ${location}, mas ainda não têm um site para capturar os clientes que buscam por '${niche}' no Google."
      - Continue agitando o problema (perda de dinheiro/clientes para concorrentes).
      - Apresente a solução como um "sistema de aquisição de clientes 24/7", não apenas um "site".
      - O Call-to-Action DEVE ser uma oferta de valor: oferecer a criação de um preview do design do site, sem custo.
      - A resposta final DEVE ser apenas o texto da mensagem, sem "Assunto:", sem placeholders como "[Seu Nome]", e sem explicações.

      Agora, gere a mensagem final e limpa para o alvo (${businessName}), seguindo TODAS as regras.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Limpeza rigorosa para garantir que apenas o texto da mensagem seja retornado.
    let cleanText = response.text || "Erro ao gerar pitch. Tente novamente.";
    
    // Remove qualquer linha de assunto que possa vazar
    cleanText = cleanText.replace(/^(Assunto:|Subject:).*\n+/im, '');
    
    // Remove placeholders comuns no final da mensagem
    cleanText = cleanText.replace(/\[.*?\]/g, '').trim();

    return cleanText;
  } catch (error) {
    console.error("Error generating pitch:", error);
    return "Erro ao gerar pitch. Tente novamente.";
  }
};

export const searchRealBusinesses = async (
  city: string, 
  district: string, 
  country: string, 
  niche: string,
  centerLat?: number,
  centerLng?: number
): Promise<Business[]> => {
  // 1. Validar Inputs
  if (!city || !niche) {
    return [];
  }

  try {
    console.log(`Tentando Google Places API (Text Search) para ${niche} em ${city}...`);
    
    // Correção: Obtém a chave do objeto de configuração centralizado.
    const apiKey = config.googlePlaces.apiKey;

    if (!apiKey) {
      throw new Error("Google Places API Key não está configurada.");
    }
    
    const query = `${niche} em ${city}, ${district}`;
    
    // Usando textsearch que é melhor para queries "nicho em cidade"
    const apiUrl = `https://places.googleapis.com/v1/places:searchText`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.id'
        },
        body: JSON.stringify({
            textQuery: query,
            languageCode: 'pt-BR',
            maxResultCount: 15,
            locationBias: centerLat && centerLng ? {
                circle: {
                    center: { latitude: centerLat, longitude: centerLng },
                    radius: 5000.0
                }
            } : undefined
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Places Error:", errorData?.error?.message || response.status);
        throw new Error(errorData?.error?.message || `Google API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      throw new Error("Zero Results");
    }

    let results = data.places || [];
    const normalizedCity = normalizeText(city);
    
    // Filtro ESTRITO: o endereço formatado DEVE conter o nome da cidade.
    const filteredResults = results.filter((place: any) => {
        const address = normalizeText(place.formattedAddress || '');
        return address.includes(normalizedCity);
    });

    console.log(`Google Places: ${results.length} resultados brutos -> ${filteredResults.length} resultados filtrados para ${city}`);

    if (filteredResults.length > 0) {
        return filteredResults.map((place: any, index: number) => ({
          id: place.id,
          name: place.displayName.text,
          address: place.formattedAddress || 'Endereço indisponível',
          rating: place.rating || 0,
          reviews: place.userRatingCount || 0,
          lat: place.location.latitude,
          lng: place.location.longitude,
          image: `https://picsum.photos/400/300?random=${index}`
        }));
    } else {
        // Se a busca principal não retorna nada, não joga erro, apenas tenta o fallback
        console.warn("Google Places retornou 0 resultados após filtro. Ativando Fallback...");
        throw new Error("Zero Results after filter");
    }

  } catch (error) {
    console.warn("Falha na API Principal (Google Places). Ativando Fallback (SerpAPI)...", error);
    
    try {
        const serpResults = await searchSerpAPI(city, country, niche, centerLat || 0, centerLng || 0);
        if (serpResults.length > 0) {
            return serpResults;
        }
    } catch (serpError) {
        console.error("Falha também no Fallback (SerpAPI):", serpError);
    }

    console.warn("Todos os serviços de busca falharam. Gerando dados de demonstração.");
    return generateMockBusinesses(niche, city, centerLat || 0, centerLng || 0);
  }
};

function generateMockBusinesses(term: string, city: string, lat: number, lng: number): Business[] {
    const suffixes = ['Premium', 'Express', 'VIP', 'Center', 'Local'];
    const mocks: Business[] = [];
    const safeLat = lat || 40.346;
    const safeLng = lng || -8.594;

    for (let i = 0; i < 5; i++) {
        const latOffset = (Math.random() - 0.5) * 0.005;
        const lngOffset = (Math.random() - 0.5) * 0.005;

        mocks.push({
            id: `mock-${Date.now()}-${i}`,
            name: `${term} ${suffixes[i % suffixes.length]}`,
            address: `Rua do Comércio ${i * 10 + 5}, ${city}`,
            lat: safeLat + latOffset,
            lng: safeLng + lngOffset,
            phone: `+351 2${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 1000)}`,
            rating: 4.5,
            reviews: 10 + i * 5,
            image: `https://picsum.photos/400/300?random=${i}`
        });
    }
    return mocks;
}