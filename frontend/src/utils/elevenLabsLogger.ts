
import { useElevenLabsTracking, ElevenLabsCallData } from '@/hooks/useElevenLabsTracking';

export class ElevenLabsCallLogger {
  private sessionId: string;
  private startTime: Date;
  private logFunction: (data: ElevenLabsCallData) => Promise<boolean>;

  constructor(logFunction: (data: ElevenLabsCallData) => Promise<boolean>) {
    this.sessionId = crypto.randomUUID();
    this.startTime = new Date();
    this.logFunction = logFunction;
  }

  async startCall(data?: Partial<ElevenLabsCallData>) {
    const callData: ElevenLabsCallData = {
      session_id: this.sessionId,
      call_started_at: this.startTime.toISOString(),
      status: 'started',
      user_agent: navigator.userAgent,
      ...data
    };

    return await this.logFunction(callData);
  }

  async endCall(data?: Partial<ElevenLabsCallData>) {
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);

    const callData: ElevenLabsCallData = {
      session_id: this.sessionId,
      call_ended_at: endTime.toISOString(),
      call_duration_seconds: duration,
      status: 'completed',
      ...data
    };

    return await this.logFunction(callData);
  }

  async logError(error: string, data?: Partial<ElevenLabsCallData>) {
    const callData: ElevenLabsCallData = {
      session_id: this.sessionId,
      status: 'error',
      error_message: error,
      ...data
    };

    return await this.logFunction(callData);
  }

  getSessionId() {
    return this.sessionId;
  }
}

// Helper function to create a logger instance
export const createElevenLabsLogger = () => {
  const { logCallInteraction } = useElevenLabsTracking();
  return new ElevenLabsCallLogger(logCallInteraction);
};
