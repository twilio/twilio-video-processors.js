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
      { high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW }
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

    it('should correctly index multi-pixel masks with ambiguous values', () => {
      const ambiguous = HYSTERESIS_LOW + 1;

      // Frame 1: seed with known values per pixel
      const frame1 = createMaskData([255, 0, 255, 0]);
      (stage as any)._applyHysteresis(frame1);
      assert.deepStrictEqual(getAlphaValues(frame1), [255, 0, 255, 0]);

      // Frame 2: all ambiguous → each pixel inherits its own previous value
      const frame2 = createMaskData([ambiguous, ambiguous, ambiguous, ambiguous]);
      (stage as any)._applyHysteresis(frame2);
      assert.deepStrictEqual(getAlphaValues(frame2), [255, 0, 255, 0]);
    });

    it('should reallocate buffer when mask resolution changes', () => {
      const ambiguous = HYSTERESIS_LOW + 1;

      const frame1 = createMaskData([255, 0]);
      (stage as any)._applyHysteresis(frame1);
      assert.strictEqual((stage as any)._prevMaskData.length, 2);

      // Resolution change: 2 pixels → 4 pixels; ambiguous pixels left unchanged
      const frame2 = createMaskData([ambiguous, ambiguous, ambiguous, ambiguous]);
      (stage as any)._applyHysteresis(frame2);
      assert.strictEqual((stage as any)._prevMaskData.length, 4);
      assert.deepStrictEqual(getAlphaValues(frame2), [ambiguous, ambiguous, ambiguous, ambiguous]);

      // Frame 3: confirm buffer was populated after reallocation
      const frame3 = createMaskData([ambiguous, ambiguous, ambiguous, ambiguous]);
      (stage as any)._applyHysteresis(frame3);
      assert.deepStrictEqual(getAlphaValues(frame3), [ambiguous, ambiguous, ambiguous, ambiguous]);
    });

    it('should reuse buffer instead of allocating new array each frame', () => {
      const frame1 = createMaskData([255]);
      (stage as any)._applyHysteresis(frame1);
      const bufferRef = (stage as any)._prevMaskData;
      assert.strictEqual(bufferRef.length, frame1.data.length / 4);

      const frame2 = createMaskData([0]);
      (stage as any)._applyHysteresis(frame2);
      assert.strictEqual((stage as any)._prevMaskData, bufferRef);
    });
  });

  describe('updateHysteresis', () => {
    it('should clear _prevMaskData when disabled', () => {
      const mask = createMaskData([255]);
      (stage as any)._applyHysteresis(mask);
      assert.notStrictEqual((stage as any)._prevMaskData, null);

      stage.updateHysteresis(false);
      assert.strictEqual((stage as any)._prevMaskData, null);
      assert.strictEqual((stage as any)._hysteresisEnabled, false);
    });

    it('should enable with new thresholds', () => {
      stage.updateHysteresis({ high: 200, low: 50 });
      assert.strictEqual((stage as any)._hysteresisEnabled, true);
      assert.strictEqual((stage as any)._hysteresisHigh, 200);
      assert.strictEqual((stage as any)._hysteresisLow, 50);
    });

    it('should clear _prevMaskData when thresholds change', () => {
      const mask = createMaskData([255]);
      (stage as any)._applyHysteresis(mask);
      assert.notStrictEqual((stage as any)._prevMaskData, null);

      stage.updateHysteresis({ high: 200, low: 50 });
      assert.strictEqual((stage as any)._prevMaskData, null);
    });

    it('should not clear _prevMaskData when thresholds are unchanged', () => {
      const mask = createMaskData([255]);
      (stage as any)._applyHysteresis(mask);
      assert.notStrictEqual((stage as any)._prevMaskData, null);

      stage.updateHysteresis({ high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });
      assert.notStrictEqual((stage as any)._prevMaskData, null);
    });

    it('should reset temporal state when re-enabled after disable', () => {
      const ambiguous = HYSTERESIS_LOW + 1;

      const frame1 = createMaskData([255]);
      (stage as any)._applyHysteresis(frame1);

      stage.updateHysteresis(false);
      stage.updateHysteresis({ high: HYSTERESIS_HIGH, low: HYSTERESIS_LOW });

      const frame2 = createMaskData([ambiguous]);
      (stage as any)._applyHysteresis(frame2);
      assert.deepStrictEqual(getAlphaValues(frame2), [ambiguous]);
    });

    it('should apply new thresholds on subsequent frames', () => {
      stage.updateHysteresis({ high: 200, low: 50 });

      // 190 is below new high of 200 → ambiguous
      const mask = createMaskData([190]);
      (stage as any)._applyHysteresis(mask);
      assert.deepStrictEqual(getAlphaValues(mask), [190]);

      // 200 is at new threshold → snapped to 255
      const mask2 = createMaskData([200]);
      (stage as any)._applyHysteresis(mask2);
      assert.deepStrictEqual(getAlphaValues(mask2), [255]);

      // 50 is at new low → snapped to 0
      const mask3 = createMaskData([50]);
      (stage as any)._applyHysteresis(mask3);
      assert.deepStrictEqual(getAlphaValues(mask3), [0]);
    });
  });
});
