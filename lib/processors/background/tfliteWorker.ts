import { expose, transfer } from 'comlink';
import { TwilioTFLite } from '../../utils/TwilioTFLite';

class TwilioTFLiteWorker extends TwilioTFLite {
  async runInference(inputBuffer: Uint8ClampedArray): Promise<Uint8ClampedArray> {
    const personMask = await super.runInference(inputBuffer);
    return transfer<Uint8ClampedArray>(personMask, [personMask.buffer]);
  }
}

expose(new TwilioTFLiteWorker());
