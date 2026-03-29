"use client";

import { useEffect, useRef, useState } from "react";

type ThemeMode = "day" | "evening" | "night";

type WeaveAiDynamicBackgroundProps = {
  className?: string;
  reducedMotion?: boolean;
  themeMode: ThemeMode;
};

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    if (vertexShader) {
      gl.deleteShader(vertexShader);
    }
    if (fragmentShader) {
      gl.deleteShader(fragmentShader);
    }
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function WeaveAiDynamicBackground({
  className,
  reducedMotion = false,
  themeMode,
}: WeaveAiDynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) {
      setReady(false);
      return;
    }

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        premultipliedAlpha: false,
      }) || canvas.getContext("experimental-webgl");

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      setReady(false);
      return;
    }

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;

      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_theme;
      uniform float u_motion;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
          (c - a) * u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
      }

      vec3 paletteDay(vec2 uv, float t) {
        vec3 top = vec3(0.10, 0.50, 0.82);
        vec3 mid = vec3(0.38, 0.69, 0.94);
        vec3 low = vec3(0.76, 0.89, 1.0);
        vec3 bottom = vec3(0.91, 0.97, 1.0);

        float sway = sin((uv.x * 2.4) + t * 0.18) * 0.015 * u_motion;
        float y = clamp(uv.y + sway, 0.0, 1.0);

        vec3 gradient = mix(bottom, low, smoothstep(0.0, 0.34, y));
        gradient = mix(gradient, mid, smoothstep(0.22, 0.7, y));
        gradient = mix(gradient, top, smoothstep(0.58, 1.0, y));

        vec2 sunPos = vec2(0.74, 0.16);
        float sun = smoothstep(0.28, 0.0, distance(uv, sunPos));
        gradient += vec3(1.0, 0.97, 0.88) * sun * 0.32;

        float cloudA = noise(uv * vec2(4.0, 7.5) + vec2(t * 0.02 * u_motion, 0.0));
        float cloudB = noise(uv * vec2(8.0, 14.0) - vec2(t * 0.03 * u_motion, 0.0));
        float clouds = smoothstep(0.58, 0.88, cloudA * 0.7 + cloudB * 0.45);
        gradient += vec3(0.16, 0.22, 0.32) * clouds * 0.06;

        return gradient;
      }

      vec3 paletteEvening(vec2 uv, float t) {
        vec3 top = vec3(0.05, 0.11, 0.26);
        vec3 mid = vec3(0.28, 0.34, 0.47);
        vec3 glow = vec3(1.0, 0.62, 0.28);
        vec3 base = vec3(1.0, 0.82, 0.40);

        float drift = sin(uv.x * 3.0 + t * 0.16) * 0.012 * u_motion;
        float y = clamp(uv.y + drift, 0.0, 1.0);

        vec3 gradient = mix(base, glow, smoothstep(0.0, 0.32, y));
        gradient = mix(gradient, mid, smoothstep(0.22, 0.7, y));
        gradient = mix(gradient, top, smoothstep(0.58, 1.0, y));

        vec2 horizon = vec2(0.5, 0.78);
        float warmGlow = smoothstep(0.42, 0.0, distance(uv, horizon));
        gradient += vec3(1.0, 0.76, 0.45) * warmGlow * 0.28;

        float dust = noise(uv * vec2(12.0, 18.0) + vec2(0.0, t * 0.08 * u_motion));
        gradient += vec3(1.0, 0.82, 0.52) * smoothstep(0.82, 1.0, dust) * 0.06;

        return gradient;
      }

      vec3 paletteNight(vec2 uv, float t) {
        vec3 top = vec3(0.04, 0.04, 0.12);
        vec3 mid = vec3(0.10, 0.07, 0.22);
        vec3 low = vec3(0.18, 0.13, 0.35);
        vec3 bottom = vec3(0.23, 0.20, 0.43);

        float drift = sin(uv.x * 3.6 + t * 0.12) * 0.01 * u_motion;
        float y = clamp(uv.y + drift, 0.0, 1.0);

        vec3 gradient = mix(bottom, low, smoothstep(0.0, 0.36, y));
        gradient = mix(gradient, mid, smoothstep(0.26, 0.72, y));
        gradient = mix(gradient, top, smoothstep(0.62, 1.0, y));

        float stars = step(0.9985, random(floor(uv * u_resolution * 0.42)));
        float twinkle = 0.55 + 0.45 * sin(t * 1.8 + uv.x * 130.0 + uv.y * 90.0);
        gradient += vec3(1.0) * stars * twinkle * 0.55;

        float haze = noise(uv * vec2(5.0, 9.0) + vec2(t * 0.01 * u_motion, -t * 0.015 * u_motion));
        gradient += vec3(0.17, 0.12, 0.30) * smoothstep(0.48, 0.92, haze) * 0.18;

        return gradient;
      }

      void main() {
        vec2 uv = v_uv;
        float t = u_time;
        vec3 color;

        if (u_theme < 0.5) {
          color = paletteDay(uv, t);
        } else if (u_theme < 1.5) {
          color = paletteEvening(uv, t);
        } else {
          color = paletteNight(uv, t);
        }

        float vignette = smoothstep(0.95, 0.18, distance(uv, vec2(0.5)));
        color *= vignette;

        float grain = (random(gl_FragCoord.xy + t * 60.0) - 0.5) * 0.045;
        color += grain;

        gl_FragColor = vec4(color, 0.96);
      }
    `;

    const program = createProgram(gl, vertexSource, fragmentSource);
    if (!program) {
      setReady(false);
      return;
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      gl.deleteProgram(program);
      setReady(false);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const themeLocation = gl.getUniformLocation(program, "u_theme");
    const motionLocation = gl.getUniformLocation(program, "u_motion");

    if (
      positionLocation === -1 ||
      !resolutionLocation ||
      !timeLocation ||
      !themeLocation ||
      !motionLocation
    ) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      setReady(false);
      return;
    }

    const resize = () => {
      const width = Math.max(1, Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.75)));
      const height = Math.max(1, Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.75)));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    startTimeRef.current = performance.now();
    resize();
    setReady(true);

    const render = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const themeValue = themeMode === "day" ? 0 : themeMode === "evening" ? 1 : 2;

      resize();
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(themeLocation, themeValue);
      gl.uniform1f(motionLocation, reducedMotion ? 0.0 : 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameRef.current = window.requestAnimationFrame(render);
    };

    frameRef.current = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      setReady(false);
    };
  }, [reducedMotion, themeMode]);

  return (
    <canvas
      aria-hidden="true"
      className={`${className ?? ""} ${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}
      ref={canvasRef}
    />
  );
}
