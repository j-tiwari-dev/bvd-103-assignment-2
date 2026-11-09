import { Controller, Get, Route } from 'tsoa';

@Route('health')
export class HealthController extends Controller {
  @Get()
  public async getHealth(): Promise<{ status: string }> {
    return {
      status: 'ok',
    };
  }
}
