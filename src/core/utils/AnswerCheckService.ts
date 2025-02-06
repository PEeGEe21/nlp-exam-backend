import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import axios, { AxiosError } from 'axios';
import OpenAI from "openai";
import { HfInference } from '@huggingface/inference';
import { Question } from 'src/typeorm/entities/Question';

const openai = new OpenAI({
    organization: "org-wXAbEGeCjCeWojJWWqiEHQMr",
    project: "$PROJECT_ID",
});

interface TextGenerationResponse {
  generated_text: string;
}


@Injectable()
export class AnswerCheckService {
  constructor(private readonly httpService: HttpService) {}

  private hf = new HfInference(process.env.HF_ACCESS_TOKEN);
  private readonly TIMEOUT = 10000; // 10 seconds timeout

  // async checkTheoreticalAnswer(answer: string, hints: any): Promise<any> {
  //   if (!answer || typeof answer !== 'string') {
  //     throw new BadRequestException('Invalid input text');
  //   }
  //   if (!process.env.HF_ACCESS_TOKEN) {
  //     throw new InternalServerErrorException('API key not configured');
  //   }
  //   try {

        
  //       const truncatedText = answer.slice(0, 1000); // BART model limit

  //       const response = await this.hf.summarization({
  //         model: 'facebook/bart-large-cnn',
  //         inputs: answer,
  //         parameters: {
  //           max_length: 1500,
  //           min_length: 100,
  //           // do_sample: false,
  //           temperature: 0.7,
  //         },
  //       });

  //       if (!response?.summary_text) {
  //         throw new InternalServerErrorException('Failed to generate summary');
  //       }

  //       return response.summary_text;
  //       //   const response = await this.httpService.post('AI_API_URL', {
  //       //     answer,
  //       //     hints,
  //       //   }).toPromise();

  //       // const response = await axios.post(
  //       //     'https://api.openai.com/v1/chat/completions',
  //       //     {
  //       //       model: 'gpt-4o-mini', // Update the model if needed
  //       //       messages: [{ role: 'user', content: 'hello chat' }],
  //       //       temperature: 0.7,
  //       //     },
  //       //     {
  //       //       headers: {
  //       //         'Content-Type': 'application/json',
  //       //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //       //       },
  //       //     }
  //       //   );
  

  //       //   console.log(response, 'gpt reponse heree');
  //       // Process the AI response and determine if the answer is correct.
  //       //   const isCorrect = response.data.isCorrect;

  //       //   return isCorrect;
  //   } catch (error) {
  //       if (error.response && error.response.status === 429) {
  //           console.log('Rate limit exceeded, retrying after a delay...');
  //           // await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
  //           // return this.checkTheoreticalAnswer(answer, hints); // Retry the request
  //       } else {
  //           throw error;
  //       }
  //   //   console.error('Error checking answer:', error);
  //   //   throw new Error('Failed to check the answer.');
  //   }
  // }

  async checkTheoreticalAnswer(
    question: string,
    answer?: string,
    hints?: string[],
    questionMain?:  Partial<Question>,
    maxMark?
  ): Promise<{
    isCorrect: boolean;
    confidence: number;
    feedback?: string;
    score?: number;
  }> {
    if (!question || typeof question !== 'string') {
      throw new BadRequestException('Invalid input: Question and answer must be non-empty strings');
    }

    try {
      const prompt = this.formatPrompt(question, answer, hints, questionMain, maxMark);

      // Use Promise.race to implement timeout
      const response = await Promise.race([
        this.hf.textGeneration({
          // Using a smaller, faster model
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          // model: 'distilgpt2',
          inputs: prompt,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.3,
            do_sample: false,
            top_k: 1,
            num_return_sequences: 1,
          },
        }) as Promise<TextGenerationResponse>,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT)
        )
      ]);

      // console.log(response, response.generated_text, 'response.generated_text')
      // If we get no response or an error
      if (!response || !response.generated_text) {
        console.log('in here')
        // Fallback to simple comparison-based evaluation
        return this.fallbackEvaluation(question, answer, hints);
      }

      const result = this.parseResponse(response.generated_text, maxMark);
      console.log('resulttt', result)
      return result;

    } catch (error) {
      console.error('Error in AI evaluation:', error);
      
      // Fallback to simple comparison if AI fails
      // return this.fallbackEvaluation(question, answer, hints);
    }
  }

  private formatPrompt2(question: string, answer?: string, hints?: string[], questionMain?): string {
    const condition1 = questionMain.showHints == 1 ? true : false;
    const isOption = 'Grade this by using the '
    const criteria = hints ? [...hints, 'Provide a reason IN ONE LINE WHY it does not meet all criteria, even if technically correct'] : ['Provide a reason IN ONE LINE WHY it does not meet all criteria, even if technically correct'];
    return `Evaluate this answer (respond with only a number 0-100):
    Q: ${question}
    A: ${answer}
    ${hints?.length && condition1 ? `Criteria: ${criteria.join('. ')}` : ''}
    wrap the score in a html span tag
    `;
  }    
    // console.log(difficulty, 'questionRelation')
    // Define grading strictness based on difficulty
    // let difficultyGuideline = '';
    // switch (difficulty) {
    //     case 1: // BEGINNER
    //         difficultyGuideline = 'Grade leniently - accept partial understanding and basic attempts. Minor errors are acceptable.';
    //         break;
    //     case 2: // INTERMEDIATE
    //         difficultyGuideline = 'Grade moderately - expect good understanding but allow for some minor mistakes. Key concepts should be present.';
    //         break;
    //     case 3: // ADVANCED
    //         difficultyGuideline = 'Grade strictly - expect comprehensive understanding, precision, and thorough explanations. Minor errors should affect scoring.';
    //         break;
    //     default:
    //         difficultyGuideline = 'Grade moderately';
    // }

  private formatPrompt(question: string, answer?: string, hints?: string[], questionMain?, maxMark?): string {

    // console.log(maxMark, questionMain , 'questionMain')
    const condition1 = questionMain.showHints == 1 ;
    // const maxMark = questionMain.mark; // Get max mark from question
    const difficulty = questionMain.difficulty; // Get difficulty level


    const criteria = hints ? [
        ...hints, 
        'Provide a reason IN ONE LINE WHY it does not meet all criteria, even if technically correct'
    ] : ['Provide a reason IN ONE LINE WHY it does not meet all criteria, even if technically correct'];

    return `As a Lecturer you asked a question represented by "Q", Grade the answer from a student which is represented as "A" (maximum mark: ${maxMark}):
    Q: ${question}
    A: ${answer}
    
    Difficulty Level: ${difficulty.title} and Guidelines: ${difficulty.description}
    
    ${hints?.length && condition1 ? `Criteria: ${criteria.join('. ')}` : ''}
    
    First evaluate the answer relative to the difficulty level, then convert to a score out of ${maxMark}.
    Consider partial marks for partially correct answers based on the difficulty level.
    Wrap the final score in a html span <span id="score">{score}</span> tag. do not include an example output.
    `;
}

  // private parseResponse(response: string): {
  //   isCorrect: boolean;
  //   confidence: number;
  //   feedback?: string;
  // } {
  //   // Extract any number from the response
  //   const match = response.match(/\d+/);
  //   if (!match) {
  //     return this.fallbackEvaluation("", "", []);
  //   }

  //   const score = Math.min(100, Math.max(0, parseInt(match[0])));
  //   console.log(response, score);
  //   return
  //   return {
  //     isCorrect: score >= 70,
  //     confidence: score / 100,
  //     feedback: `Score: ${score}%`
  //   };
  // }

  private parseResponse(response: string, maxMark?): {
    isCorrect: boolean;
    confidence: number;
    feedback?: string;
    score?: number
  } {
    // First try to find a number followed by a period and explanation
    // const match = response.match(/(\d+)\.?\s*(.*)/);
    // console.log(match)
    
    // if (!match) {
    //   // If no match found, fall back to basic evaluation
    //   return this.fallbackEvaluation("", "", []);
    // }

    const rawScore = this.cleanUpSpanAndExtractScore(response);

    console.log(rawScore)
    const score = this.validateScore(rawScore, maxMark);

    console.log(score, 'dssd')
    // const explanation = match[2]?.trim() || '';
    // const score = Math.min(100, Math.max(0, parseInt(match[1])));
    // const explanation = match[2]?.trim() || '';

    return {
      isCorrect: score >= 70,
      confidence: score / 100,
      feedback: `Score: ${score}%`,
      score: score
    };
  }

  private validateScore(score: number | null, maxMark: number): number {
    if (score === null) return 0;
    const roundedScore = Math.ceil(score);
    return Math.min(Math.max(0, roundedScore), maxMark);
  }

  private fallbackEvaluation(question: string, answer: string, hints?: string[]): {
    isCorrect: boolean;
    confidence: number;
    feedback?: string;
    score?: number;
  } {
    // Simple string matching fallback
    const questionLower = question.toLowerCase();
    const answerLower = answer.toLowerCase();
    
    console.log('here')
    // Extract key terms from the question
    const questionTerms = questionLower
      .split(/[\s,.-]+/)
      .filter(term => term.length > 3);
    
    // Count matching terms
    const matchingTerms = questionTerms.filter(term => 
      answerLower.includes(term)
    );

    const score = Math.round((matchingTerms.length / questionTerms.length) * 100);
    console.log(score, 'here')

    return {
      isCorrect: score >= 70,
      confidence: score / 100,
      feedback: `Basic matching score: ${score}%`,
      score: score
    };
  }

  private cleanUpSpanAndExtractScore(text: string): number {
    // Regular expression to match the score inside the span tag
    // const match = response.match(/<span id="score">(\d+)<\/span>/);
    // return match ? parseInt(match[1], 10) : 0; // Default to 0 if no match is found
    console.log(text, 'text')
    const patterns = [
      // Pattern 1: Exact format with span tag
      /<span id="score">{score}([\d.]+)<\/span>/,
      
      // Pattern 2: Variation with just score tag
      /{score}([\d.]+)/,
      
      // Pattern 3: Score mentioned in text
      /score of\s*([\d.]+)\s*out of/i,
      
      // Pattern 4: Score at the end of text
      /(\d+\.?\d*)\s*$/,
      
      // Pattern 5: Just the number in span
      /<span id="score">([\d.]+)<\/span>/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseFloat(match[1]);
        console.log(score, 'score')
        if (!isNaN(score)) {
          return score;
        }
      }
    }

    return null
  }

  // async checkTheoreticalAnswer(
  //   question: string,
  //   answer: string,
  //   hints?: string[]
  // ): Promise<{
  //   isCorrect: boolean;
  //   confidence: number;
  //   feedback?: string;
  // }> {
  //   if (!answer || typeof answer !== 'string' || !question || typeof question !== 'string') {
  //     throw new BadRequestException('Invalid input: Question and answer must be non-empty strings');
  //   }

  //   try {
  //     // Format the prompt to include question, answer and hints
  //     const prompt = this.formatPrompt(question, answer, hints);

  //     console.log(prompt)
  //     const response = await this.hf.textGeneration({
  //       model: 'facebook/opt-1.3b', // Alternative model that's good for structured output
  //       inputs: prompt,
  //       parameters: {
  //         max_new_tokens: 150,
  //         temperature: 0.3,
  //         do_sample: false, // Set to false for more deterministic output
  //         num_return_sequences: 1,
  //       },
  //     });
  //     console.log('Raw response:', response.generated_text); // For debugging

  //     // Using a model better suited for text classification/evaluation
  //     // const response = await this.hf.textGeneration({
  //     //   model: 'google/flan-t5-large',
  //     //   inputs: prompt,
  //     //   parameters: {
  //     //     max_new_tokens: 200,
  //     //     temperature: 0.1,
  //     //     do_sample: true,
  //     //     top_k: 50,
  //     //     top_p: 0.95
  //     //   },
  //     // });

  //     if (/^\[?\d+\]?$/.test(response.generated_text.trim())) {
  //       const confidence = parseInt(response.generated_text.replace(/[\[\]]/g, ''));
  //       return {
  //         isCorrect: confidence >= 70, // Assume correct if confidence is high
  //         confidence: confidence / 100,
  //         feedback: `Confidence score: ${confidence}%`
  //       };
  //     }

  //     if (!response?.generated_text) {
  //       throw new InternalServerErrorException('Failed to generate evaluation');
  //     }

  //     console.log(response?.generated_text, 'eevrv')

  //     // Parse the response to determine correctness
  //     const result = this.parseResponse(response.generated_text);
      
  //     return result;
  //   } catch (error) {
  //     if (error.response?.status === 429) {
  //       console.log('Rate limit exceeded, implementing exponential backoff...');
  //       // Implement exponential backoff here if needed
  //       throw new Error('Rate limit exceeded. Please try again later.');
  //     }
      
  //     console.error('Error evaluating answer:', error);
  //     throw new InternalServerErrorException('Failed to evaluate the answer');
  //   }
  // }

  // private formatPrompt(question: string, answer: string, hints?: string[]): string {
  //   let prompt = `You are an expert evaluator. Analyze this answer:

  //   QUESTION:
  //   ${question}

  //   GIVEN ANSWER:
  //   ${answer}

  //   ${hints?.length ? `EVALUATION CRITERIA:
  //   ${hints.map(hint => `- ${hint}`).join('\n')}

  //   ` : ''}
  //   OUTPUT INSTRUCTIONS:
  //   1. First line must be either "Correct: true" or "Correct: false"
  //   2. Second line must be "Confidence: [number between 0-100]"
  //   3. Third line must be "Feedback: [your explanation]"

  //   Your evaluation must follow this exact format. Begin evaluation:`;

  //   return prompt;
  // }

  // private parseResponse(response: string): {
  //   isCorrect: boolean;
  //   confidence: number;
  //   feedback?: string;
  // } {
  //   // Log the response for debugging
  //   console.log('Attempting to parse response:', response);

  //   const correctMatch = response.match(/Correct:\s*(true|false)/i);
  //   const confidenceMatch = response.match(/Confidence:\s*(\d+)/i);
  //   const feedbackMatch = response.match(/Feedback:\s*(.+)/i);

  //   if (!correctMatch && !confidenceMatch) {
  //     // Fallback handling for numeric-only responses
  //     const numericMatch = response.match(/\d+/);
  //     if (numericMatch) {
  //       const confidence = parseInt(numericMatch[0]);
  //       return {
  //         isCorrect: confidence >= 70,
  //         confidence: confidence / 100,
  //         feedback: `Confidence score: ${confidence}%`
  //       };
  //     }
  //     throw new Error('Unable to parse evaluation response');
  //   }

  //   return {
  //     isCorrect: correctMatch ? correctMatch[1].toLowerCase() === 'true' : false,
  //     confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.5,
  //     feedback: feedbackMatch ? feedbackMatch[1].trim() : 'No detailed feedback available.',
  //   };
  // }

}
