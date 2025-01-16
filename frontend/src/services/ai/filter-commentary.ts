import { GoogleGenerativeAI, ResponseSchema, SchemaType } from '@google/generative-ai';

const schema : ResponseSchema = {
    "type": SchemaType.STRING,
    "enum": [
        'accept',
        'reject'
    ],
}

const genAI = new GoogleGenerativeAI("AIzaSyC1ICvRqIFm8RFeBejJ8Xs1ZicaHAmNHkw");

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Tu dois filtrer les commentaires pour ne pas afficher les insultes, les menaces, les propos haineux, les contenus à caractère sexuel, les contenus violents, les contenus illégaux, les contenus discriminatoires, les contenus diffamatoires, les contenus incitant à la haine, etc.",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
    },
});

export default {
    filter: async (content: string) => {
        const result = await model.generateContent(content);
        const response = JSON.parse(result.response.text()) as string;
        return response;
    }
}