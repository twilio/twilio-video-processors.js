"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFastBilateralFilterStage = void 0;
var segmentationHelper_1 = require("../helpers/segmentationHelper");
var webglHelper_1 = require("../helpers/webglHelper");
function buildFastBilateralFilterStage(gl, vertexShader, positionBuffer, texCoordBuffer, inputTexture, segmentationConfig, outputTexture, canvas) {
    // NOTE(mmalavalli): This is a faster approximation of the joint bilateral filter.
    // For a given pixel, instead of calculating the space and color weights of all
    // the pixels within the filter kernel, which would have a complexity of O(r^2),
    // we calculate the space and color weights of only those pixels which form two
    // diagonal lines between the two pairs of opposite corners of the filter kernel,
    // which would have a complexity of O(r). This improves the overall complexity
    // of this stage from O(w x h x r^2) to O(w x h x r), where:
    // w => width of the output video frame
    // h => height of the output video frame
    // r => radius of the joint bilateral filter kernel
    var fragmentShaderSource = (0, webglHelper_1.glsl)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["#version 300 es\n\n    precision highp float;\n\n    uniform sampler2D u_inputFrame;\n    uniform sampler2D u_segmentationMask;\n    uniform vec2 u_texelSize;\n    uniform float u_step;\n    uniform float u_radius;\n    uniform float u_offset;\n    uniform float u_sigmaTexel;\n    uniform float u_sigmaColor;\n\n    in vec2 v_texCoord;\n\n    out vec4 outColor;\n\n    float gaussian(float x, float sigma) {\n      return exp(-0.5 * x * x / sigma / sigma);\n    }\n\n    float calculateSpaceWeight(vec2 coord) {\n      float x = distance(v_texCoord, coord);\n      float sigma = u_sigmaTexel;\n      return gaussian(x, sigma);\n    }\n\n    float calculateColorWeight(vec2 coord) {\n      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n      vec3 coordColor = texture(u_inputFrame, coord).rgb;\n      float x = distance(centerColor, coordColor);\n      float sigma = u_sigmaColor;\n      return gaussian(x, sigma);\n    }\n\n    void main() {\n      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n      float newVal = 0.0;\n      float totalWeight = 0.0;\n\n      vec2 leftTopCoord = vec2(v_texCoord + vec2(-u_radius, -u_radius) * u_texelSize);\n      vec2 rightTopCoord = vec2(v_texCoord + vec2(u_radius, -u_radius) * u_texelSize);\n      vec2 leftBottomCoord = vec2(v_texCoord + vec2(-u_radius, u_radius) * u_texelSize);\n      vec2 rightBottomCoord = vec2(v_texCoord + vec2(u_radius, u_radius) * u_texelSize);\n\n      float leftTopSegAlpha = texture(u_segmentationMask, leftTopCoord).a;\n      float rightTopSegAlpha = texture(u_segmentationMask, rightTopCoord).a;\n      float leftBottomSegAlpha = texture(u_segmentationMask, leftBottomCoord).a;\n      float rightBottomSegAlpha = texture(u_segmentationMask, rightBottomCoord).a;\n      float totalSegAlpha = leftTopSegAlpha + rightTopSegAlpha + leftBottomSegAlpha + rightBottomSegAlpha;\n\n      if (totalSegAlpha <= 0.0) {\n        newVal = 0.0;\n      } else if (totalSegAlpha >= 4.0) {\n        newVal = 1.0;\n      } else {\n        for (float i = 0.0; i <= u_radius - u_offset; i += u_step) {\n          vec2 shift = vec2(i, i) * u_texelSize;\n          vec2 coord = vec2(v_texCoord + shift);\n          float spaceWeight = calculateSpaceWeight(coord);\n          float colorWeight = calculateColorWeight(coord);\n          float weight = spaceWeight * colorWeight;\n          float alpha = texture(u_segmentationMask, coord).a;\n          totalWeight += weight;\n          newVal += weight * alpha;\n\n          if (i != 0.0) {\n            shift = vec2(i, -i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;\n            \n            shift = vec2(-i, i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;\n            \n            shift = vec2(-i, -i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;          \n          }\n        }\n        newVal /= totalWeight;\n      }\n\n      outColor = vec4(vec3(0.0), newVal);\n    }\n  "], ["#version 300 es\n\n    precision highp float;\n\n    uniform sampler2D u_inputFrame;\n    uniform sampler2D u_segmentationMask;\n    uniform vec2 u_texelSize;\n    uniform float u_step;\n    uniform float u_radius;\n    uniform float u_offset;\n    uniform float u_sigmaTexel;\n    uniform float u_sigmaColor;\n\n    in vec2 v_texCoord;\n\n    out vec4 outColor;\n\n    float gaussian(float x, float sigma) {\n      return exp(-0.5 * x * x / sigma / sigma);\n    }\n\n    float calculateSpaceWeight(vec2 coord) {\n      float x = distance(v_texCoord, coord);\n      float sigma = u_sigmaTexel;\n      return gaussian(x, sigma);\n    }\n\n    float calculateColorWeight(vec2 coord) {\n      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n      vec3 coordColor = texture(u_inputFrame, coord).rgb;\n      float x = distance(centerColor, coordColor);\n      float sigma = u_sigmaColor;\n      return gaussian(x, sigma);\n    }\n\n    void main() {\n      vec3 centerColor = texture(u_inputFrame, v_texCoord).rgb;\n      float newVal = 0.0;\n      float totalWeight = 0.0;\n\n      vec2 leftTopCoord = vec2(v_texCoord + vec2(-u_radius, -u_radius) * u_texelSize);\n      vec2 rightTopCoord = vec2(v_texCoord + vec2(u_radius, -u_radius) * u_texelSize);\n      vec2 leftBottomCoord = vec2(v_texCoord + vec2(-u_radius, u_radius) * u_texelSize);\n      vec2 rightBottomCoord = vec2(v_texCoord + vec2(u_radius, u_radius) * u_texelSize);\n\n      float leftTopSegAlpha = texture(u_segmentationMask, leftTopCoord).a;\n      float rightTopSegAlpha = texture(u_segmentationMask, rightTopCoord).a;\n      float leftBottomSegAlpha = texture(u_segmentationMask, leftBottomCoord).a;\n      float rightBottomSegAlpha = texture(u_segmentationMask, rightBottomCoord).a;\n      float totalSegAlpha = leftTopSegAlpha + rightTopSegAlpha + leftBottomSegAlpha + rightBottomSegAlpha;\n\n      if (totalSegAlpha <= 0.0) {\n        newVal = 0.0;\n      } else if (totalSegAlpha >= 4.0) {\n        newVal = 1.0;\n      } else {\n        for (float i = 0.0; i <= u_radius - u_offset; i += u_step) {\n          vec2 shift = vec2(i, i) * u_texelSize;\n          vec2 coord = vec2(v_texCoord + shift);\n          float spaceWeight = calculateSpaceWeight(coord);\n          float colorWeight = calculateColorWeight(coord);\n          float weight = spaceWeight * colorWeight;\n          float alpha = texture(u_segmentationMask, coord).a;\n          totalWeight += weight;\n          newVal += weight * alpha;\n\n          if (i != 0.0) {\n            shift = vec2(i, -i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;\n            \n            shift = vec2(-i, i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;\n            \n            shift = vec2(-i, -i) * u_texelSize;\n            coord = vec2(v_texCoord + shift);\n            colorWeight = calculateColorWeight(coord);\n            weight = spaceWeight * colorWeight;\n            alpha = texture(u_segmentationMask, coord).a;\n            totalWeight += weight;\n            newVal += weight * texture(u_segmentationMask, coord).a;          \n          }\n        }\n        newVal /= totalWeight;\n      }\n\n      outColor = vec4(vec3(0.0), newVal);\n    }\n  "])));
    var _a = segmentationHelper_1.inputResolutions[segmentationConfig.inputResolution], segmentationWidth = _a[0], segmentationHeight = _a[1];
    var outputWidth = canvas.width, outputHeight = canvas.height;
    var texelWidth = 1 / outputWidth;
    var texelHeight = 1 / outputHeight;
    var fragmentShader = (0, webglHelper_1.compileShader)(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = (0, webglHelper_1.createPiplelineStageProgram)(gl, vertexShader, fragmentShader, positionBuffer, texCoordBuffer);
    var inputFrameLocation = gl.getUniformLocation(program, 'u_inputFrame');
    var segmentationMaskLocation = gl.getUniformLocation(program, 'u_segmentationMask');
    var texelSizeLocation = gl.getUniformLocation(program, 'u_texelSize');
    var stepLocation = gl.getUniformLocation(program, 'u_step');
    var radiusLocation = gl.getUniformLocation(program, 'u_radius');
    var offsetLocation = gl.getUniformLocation(program, 'u_offset');
    var sigmaTexelLocation = gl.getUniformLocation(program, 'u_sigmaTexel');
    var sigmaColorLocation = gl.getUniformLocation(program, 'u_sigmaColor');
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);
    gl.useProgram(program);
    gl.uniform1i(inputFrameLocation, 0);
    gl.uniform1i(segmentationMaskLocation, 1);
    gl.uniform2f(texelSizeLocation, texelWidth, texelHeight);
    // Ensures default values are configured to prevent infinite
    // loop in fragment shader
    updateSigmaSpace(0);
    updateSigmaColor(0);
    function render() {
        gl.viewport(0, 0, outputWidth, outputHeight);
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function updateSigmaSpace(sigmaSpace) {
        sigmaSpace *= Math.max(outputWidth / segmentationWidth, outputHeight / segmentationHeight);
        var kSparsityFactor = 0.66; // Higher is more sparse.
        var sparsity = Math.max(1, Math.sqrt(sigmaSpace) * kSparsityFactor);
        var step = sparsity;
        var radius = sigmaSpace;
        var offset = step > 1 ? step * 0.5 : 0;
        var sigmaTexel = Math.max(texelWidth, texelHeight) * sigmaSpace;
        gl.useProgram(program);
        gl.uniform1f(stepLocation, step);
        gl.uniform1f(radiusLocation, radius);
        gl.uniform1f(offsetLocation, offset);
        gl.uniform1f(sigmaTexelLocation, sigmaTexel);
    }
    function updateSigmaColor(sigmaColor) {
        gl.useProgram(program);
        gl.uniform1f(sigmaColorLocation, sigmaColor);
    }
    function cleanUp() {
        gl.deleteFramebuffer(frameBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
    }
    return { render: render, updateSigmaSpace: updateSigmaSpace, updateSigmaColor: updateSigmaColor, cleanUp: cleanUp };
}
exports.buildFastBilateralFilterStage = buildFastBilateralFilterStage;
var templateObject_1;
//# sourceMappingURL=fastBilateralFilterStage.js.map