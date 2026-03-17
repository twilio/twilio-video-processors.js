import * as assert from 'assert';
import { HYSTERESIS_HIGH, HYSTERESIS_LOW } from '../../../../../lib/constants';
import { PostProcessingStage } from '../../../../../lib/processors/background/pipelines/backgroundprocessorpipeline/PostProcessingStage';

function createMaskData(alphaValues: number[]): ImageData {
  const data = new Uint8ClampedArray(alphaValues.length * 4);
  for (let i = 0; i < alphaValues.length; i++) {
    data[i * 4 + 3] = alphaValues[i];
  }
  return { data, width: alphaValues.length, height: 1 } as unknown as ImageData;
}

function getAlphaValues(mask: ImageData): number[] {
  const result: number[] = [];
  for (let i = 3; i < mask.data.length; i += 4) {
    result.push(mask.data[i]);
  }
  return result;
}

describe('PostProcessingStage', () => {
  let stage: PostProcessingStage;

  beforeEach(() => {
    const canvas = new OffscreenCanvas(1, 1);
    stage = new PostProcessingStage(
      { width: 1, height: 1 },
      new OffscreenCanvas(1, 1),
      canvas,
      8,
      () => {},
      true
    );
  });

  describe('_applyHysteresis (via render)', () => {
    it('should snap pixels at or above high threshold to 255', () => {
      const mask = createMaskData([HYSTERESIS_HIGH, HYSTERESIS_HIGH + 1, 255]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [255, 255, 255]);
    });

    it('should snap pixels at or below low threshold to 0', () => {
      const mask = createMaskData([HYSTERESIS_LOW, HYSTERESIS_LOW - 1, 0]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [0, 0, 0]);
    });

    it('should leave ambiguous pixels unchanged on first frame (no previous data)', () => {
      const ambiguous = Math.floor((HYSTERESIS_HIGH + HYSTERESIS_LOW) / 2);
      const mask = createMaskData([ambiguous]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [ambiguous]);
    });

    it('should use previous frame values for ambiguous pixels on subsequent frames', () => {
      const ambiguous = Math.floor((HYSTERESIS_HIGH + HYSTERESIS_LOW) / 2);

      // First frame: strong foreground pixel to seed _prevMaskData
      const frame1 = createMaskData([255]);
      (stage as any)._applyHysteresis(frame1);
      assert.deepStrictEqual(getAlphaValues(frame1), [255]);

      // Second frame: ambiguous pixel should inherit 255 from previous frame
      const frame2 = createMaskData([ambiguous]);
      (stage as any)._applyHysteresis(frame2);
      assert.deepStrictEqual(getAlphaValues(frame2), [255]);
    });

    it('should handle multi-frame temporal smoothing correctly', () => {
      // Frame 1: pixel below low → snapped to 0
      const frame1 = createMaskData([0]);
      (stage as any)._applyHysteresis(frame1);
      assert.deepStrictEqual(getAlphaValues(frame1), [0]);

      // Frame 2: ambiguous pixel → inherits 0 from previous
      const ambiguous = HYSTERESIS_LOW + 1;
      const frame2 = createMaskData([ambiguous]);
      (stage as any)._applyHysteresis(frame2);
      assert.deepStrictEqual(getAlphaValues(frame2), [0]);

      // Frame 3: pixel above high → snapped to 255
      const frame3 = createMaskData([HYSTERESIS_HIGH]);
      (stage as any)._applyHysteresis(frame3);
      assert.deepStrictEqual(getAlphaValues(frame3), [255]);

      // Frame 4: ambiguous → inherits 255 from previous
      const frame4 = createMaskData([ambiguous]);
      (stage as any)._applyHysteresis(frame4);
      assert.deepStrictEqual(getAlphaValues(frame4), [255]);
    });

    it('should reuse buffer instead of allocating new array each frame', () => {
      const frame1 = createMaskData([255]);
      (stage as any)._applyHysteresis(frame1);
      const bufferRef = (stage as any)._prevMaskData;

      const frame2 = createMaskData([0]);
      (stage as any)._applyHysteresis(frame2);
      assert.strictEqual((stage as any)._prevMaskData, bufferRef);
    });
  });

  describe('updateHysteresisEnabled', () => {
    it('should clear _prevMaskData when disabled', () => {
      const mask = createMaskData([255]);
      (stage as any)._applyHysteresis(mask);
      assert.notStrictEqual((stage as any)._prevMaskData, null);

      stage.updateHysteresisEnabled(false);
      assert.strictEqual((stage as any)._prevMaskData, null);
    });

    it('should not clear _prevMaskData when enabled', () => {
      const mask = createMaskData([255]);
      (stage as any)._applyHysteresis(mask);

      stage.updateHysteresisEnabled(true);
      assert.notStrictEqual((stage as any)._prevMaskData, null);
    });
  });

  describe('updateHysteresisHighThreshold', () => {
    it('should update the high threshold', () => {
      stage.updateHysteresisHighThreshold(200);
      // 190 is below new threshold of 200 → ambiguous, not snapped
      const mask = createMaskData([190]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [190]);

      // 200 is at new threshold → snapped to 255
      const mask2 = createMaskData([200]);
      (stage as any)._applyHysteresis(mask2);
      assert.deepStrictEqual(getAlphaValues(mask2), [255]);
    });
  });

  describe('updateHysteresisLowThreshold', () => {
    it('should update the low threshold', () => {
      stage.updateHysteresisLowThreshold(50);
      // 60 is above new threshold of 50 → ambiguous, not snapped
      const mask = createMaskData([60]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [60]);

      // 50 is at new threshold → snapped to 0
      const mask2 = createMaskData([50]);
      (stage as any)._applyHysteresis(mask2);
      assert.deepStrictEqual(getAlphaValues(mask2), [0]);
    });
  });
});
