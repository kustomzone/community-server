import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import type { TargetExtractor } from '../ldp/http/TargetExtractor';
import type { HttpHandlerInput } from '../server/HttpHandler';
import { HttpHandler } from '../server/HttpHandler';
import { InternalServerError } from './errors/InternalServerError';
import { NotImplementedHttpError } from './errors/NotImplementedHttpError';

/**
 * A static HTTP handler that checks the static files that can be served.
 */
export class FaviconHandler extends HttpHandler {
  private readonly targetExtractor!: TargetExtractor;

  public constructor(targetExtractor: TargetExtractor) {
    super();
    this.targetExtractor = targetExtractor;
  }

  public async canHandle(input: HttpHandlerInput): Promise<void> {
    const url = new URL((await this.targetExtractor.handleSafe(input.request)).path);
    if (url.pathname !== '/favicon.ico') {
      throw new NotImplementedHttpError(`Only requests to favicon.ico are accepted`);
    }
  }

  public async handle(input: HttpHandlerInput): Promise<void> {
    try {
      if (input.request.method !== 'GET') {
        throw new NotImplementedHttpError('Only GET requests are supported');
      }
      const filePath = join(__dirname, '../../favicon.ico');

      /* eslint-disable @typescript-eslint/naming-convention */
      input.response.writeHead(200, {
        'Content-Type': 'image/vnd.microsoft.icon',
        'Content-Length': statSync(filePath).size,
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      createReadStream(filePath).pipe(input.response);
    } catch (error: unknown) {
      const errorText: string = (error as any).message;
      throw new InternalServerError(`Unexpected favicon handler error ${errorText}`);
    }
  }
}
