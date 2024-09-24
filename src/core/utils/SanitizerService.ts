import { Injectable } from '@nestjs/common';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class SanitizerService {
  private window: any;
  private DOMPurify: any;

  constructor() {
    const window = new JSDOM('').window;
    this.DOMPurify = DOMPurify(window);
  }

  sanitizeInput(input: string): string {
    return this.DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // Strips all HTML tags
  }
}
